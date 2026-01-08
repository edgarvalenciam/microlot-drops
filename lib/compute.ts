// Computation layer - pure functions for business logic

import type {
  Drop,
  Reservation,
  Commitment,
  DropStatus,
  Payment,
  Payout,
  PayoutConfig,
  Roaster,
} from "@/types";

/**
 * Calculate reserved grams for a drop by summing ACTIVE reservations
 */
export function getDropReservedGrams(
  dropId: string,
  reservations: Reservation[]
): number {
  return reservations
    .filter((res) => res.dropId === dropId && res.status === "ACTIVE")
    .reduce((total, res) => total + res.quantity * res.bagSizeGrams, 0);
}

/**
 * Get drop status based on deadline, goal grams, and reservations
 * Rules:
 * - EXPIRED if now > deadline and not completed
 * - COMPLETED if reservedGrams >= goalGrams AND now <= deadline
 * - otherwise ACTIVE
 */
export function getDropStatus(
  drop: Drop,
  reservations: Reservation[],
  now: Date = new Date()
): DropStatus {
  const deadline = new Date(drop.deadlineISO);
  const reservedGrams = getDropReservedGrams(drop.id, reservations);

  // Check if completed before deadline
  if (reservedGrams >= drop.goalGrams && now <= deadline) {
    return "COMPLETED";
  }

  // Check if expired (deadline passed and not completed)
  if (now > deadline && reservedGrams < drop.goalGrams) {
    return "EXPIRED";
  }

  return "ACTIVE";
}

/**
 * Get drop progress percentage (can exceed 100% up to 115%)
 */
export function getDropProgress(
  drop: Drop,
  reservations: Reservation[]
): number {
  const reservedGrams = getDropReservedGrams(drop.id, reservations);
  if (drop.goalGrams === 0) return 0;
  const progress = Math.round((reservedGrams / drop.goalGrams) * 100);
  // Allow up to 115% progress
  return Math.min(115, progress);
}

/**
 * Get drop cap in grams (115% of goalGrams)
 */
export function getDropCapGrams(drop: Drop): number {
  return Math.floor(drop.goalGrams * 1.15);
}

/**
 * Get available grams for reservation (cap - reserved)
 */
export function getDropAvailableGrams(
  drop: Drop,
  reservations: Reservation[]
): number {
  const reservedGrams = getDropReservedGrams(drop.id, reservations);
  const capGrams = getDropCapGrams(drop);
  return Math.max(0, capGrams - reservedGrams);
}

/**
 * Check if a reservation can be made for requested grams
 * Only errors if total would exceed 115% of goal (cap)
 */
export function canReserveGrams(
  drop: Drop,
  reservations: Reservation[],
  requestedGrams: number
): { ok: boolean; availableGrams: number } {
  const reservedGrams = getDropReservedGrams(drop.id, reservations);
  const capGrams = getDropCapGrams(drop);
  const totalAfterReservation = reservedGrams + requestedGrams;
  
  // Only error if total would exceed 115% cap
  const ok = totalAfterReservation <= capGrams;
  const availableGrams = Math.max(0, capGrams - reservedGrams);
  
  return {
    ok,
    availableGrams,
  };
}

/**
 * Check if user can pay for a drop
 * Requires:
 * - drop status COMPLETED
 * - reservation ACTIVE
 * - commitment ACTIVE linked to reservation
 */
export function canPay(
  drop: Drop,
  reservation: Reservation,
  commitment: Commitment | undefined,
  now: Date = new Date()
): boolean {
  if (!commitment) return false;
  
  const dropStatus = getDropStatus(drop, [reservation], now);
  
  return (
    dropStatus === "COMPLETED" &&
    reservation.status === "ACTIVE" &&
    commitment.status === "ACTIVE" &&
    commitment.reservationId === reservation.id
  );
}

/**
 * Compute roaster KPIs
 */
export function computeRoasterKPIs(
  roasterId: Roaster,
  drops: Drop[],
  reservations: Reservation[],
  payments: Payment[],
  payouts: Payout[]
) {
  const roasterDrops = drops.filter((d) => d.roaster === roasterId);
  
  // Expected revenue (sum of all confirmed payments for roaster's drops)
  const confirmedPayments = payments.filter(
    (p) => p.status === "CONFIRMED" && roasterDrops.some((d) => d.id === p.dropId)
  );
  const expectedRevenue = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Average fill rate (percentage of goal grams reached)
  const fillRates = roasterDrops.map((drop) => {
    const reservedGrams = getDropReservedGrams(drop.id, reservations);
    return drop.goalGrams > 0 ? (reservedGrams / drop.goalGrams) * 100 : 0;
  });
  const avgFillRate =
    fillRates.length > 0
      ? fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length
      : 0;

  // Net payouts (sum of net amounts from payouts for this roaster)
  const roasterPayouts = payouts.filter((p) => p.roasterId === roasterId);
  const netPayouts = roasterPayouts.reduce((sum, p) => sum + p.netAmount, 0);

  // Cancellation rate (percentage of canceled reservations)
  const roasterReservations = reservations.filter((r) =>
    roasterDrops.some((d) => d.id === r.dropId)
  );
  const totalReservations = roasterReservations.length;
  const canceledReservations = roasterReservations.filter(
    (r) => r.status === "CANCELED"
  ).length;
  const cancellationRate =
    totalReservations > 0
      ? (canceledReservations / totalReservations) * 100
      : 0;

  // Volume index (sum of all goal grams for roaster's drops)
  const volumeIndex = roasterDrops.reduce(
    (sum, d) => sum + d.goalGrams,
    0
  );

  return {
    expectedRevenue,
    avgFillRate,
    netPayouts,
    totalDrops: roasterDrops.length,
    completedDrops: roasterDrops.filter((d) =>
      getDropStatus(d, reservations) === "COMPLETED"
    ).length,
    cancellationRate,
    volumeIndex,
  };
}

/**
 * Compute payout amounts for a drop based on confirmed payments
 * Returns null if no confirmed payments exist for the drop
 */
export function computePayoutForDrop(
  dropId: string,
  payments: Payment[],
  payoutConfig: PayoutConfig
): { grossAmount: number; feeAmount: number; netAmount: number } | null {
  // Sum all confirmed payments for this drop
  const confirmedPayments = payments.filter(
    (p) => p.dropId === dropId && p.status === "CONFIRMED"
  );

  if (confirmedPayments.length === 0) {
    return null;
  }

  const grossAmount = confirmedPayments.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // Fee is 1.0% if INSTANT, 0 if NORMAL
  const feeAmount =
    payoutConfig.mode === "INSTANT" ? grossAmount * 0.01 : 0;

  const netAmount = grossAmount - feeAmount;

  return {
    grossAmount,
    feeAmount,
    netAmount,
  };
}

/**
 * Compute financing offer based on roaster KPIs
 * Rules:
 * - Higher fill rate → higher amount
 * - Higher cancellation rate → lower amount
 * - Volume index also influences amount
 */
export function computeOffer(
  kpis: ReturnType<typeof computeRoasterKPIs>
): {
  amount: number;
  repayPct: number;
  termWeeks: number;
  basedOnKPIs: {
    fillRate: number;
    cancellationRate: number;
    volumeIndex: number;
  };
} {
  const { avgFillRate, cancellationRate, volumeIndex } = kpis;

  // Base amount (example: €2,500)
  const baseAmount = 2500;

  // Fill rate multiplier (0-200% based on fill rate, max at 100% fill rate)
  // Higher fill rate → higher multiplier
  const fillRateMultiplier = Math.min(2.0, avgFillRate / 50); // 50% fill rate = 1.0x, 100% = 2.0x

  // Cancellation rate penalty (0-50% reduction based on cancellation rate)
  // Higher cancellation rate → lower multiplier
  const cancellationPenalty = Math.min(0.5, cancellationRate / 100); // 50% cancellation = 0.5x reduction
  const cancellationMultiplier = 1.0 - cancellationPenalty;

  // Volume index multiplier (0.5x to 1.5x based on volume)
  // Normalized to 0-500 units as baseline
  const volumeNormalized = Math.min(1.5, 0.5 + volumeIndex / 1000);
  const volumeMultiplier = volumeNormalized;

  // Calculate final amount
  const amount = Math.round(
    baseAmount * fillRateMultiplier * cancellationMultiplier * volumeMultiplier
  );

  // Fixed terms from plan.md: 6% of payouts for 8 weeks
  const repayPct = 6;
  const termWeeks = 8;

  return {
    amount,
    repayPct,
    termWeeks,
    basedOnKPIs: {
      fillRate: avgFillRate,
      cancellationRate,
      volumeIndex,
    },
  };
}
