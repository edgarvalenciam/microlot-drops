"use client";

import React, { createContext, useContext, useCallback } from "react";
import { nanoid } from "nanoid";
import type {
  AppState,
  Drop,
  Reservation,
  Commitment,
  Payment,
  PayoutConfig,
  Payout,
  FinancingOffer,
  BankConnection,
} from "@/types";
import { useLocalStorageState, type StorageState } from "@/hooks/useLocalStorageState";
import { createSeedState } from "@/data/seed";
import { computePayoutForDrop } from "@/lib/compute";

interface AppStateContextType {
  state: AppState;
  // Drops
  addDrop: (drop: Omit<Drop, "id" | "createdAtISO">) => Drop;
  updateDrop: (id: string, updates: Partial<Drop>) => void;
  deleteDrop: (id: string) => void;
  // Reservations
  addReservation: (
    reservation: Omit<Reservation, "id" | "createdAtISO">
  ) => Reservation;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  // Commitments
  addCommitment: (
    commitment: Omit<Commitment, "id" | "createdAtISO">
  ) => Commitment;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  // Payments
  addPayment: (payment: Omit<Payment, "id" | "createdAtISO">) => Payment;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  confirmPayment: (paymentId: string) => void;
  confirmPaymentForReservation: (params: {
    reservationId: string;
    commitmentId: string;
    dropId: string;
    userId: string;
    amount: number;
    beneficiary: string;
    reference: string;
  }) => string; // Returns paymentId
  // PayoutConfig
  updatePayoutConfig: (config: Partial<PayoutConfig>) => void;
  // Payouts
  addPayout: (payout: Omit<Payout, "id" | "createdAtISO">) => Payout;
  // FinancingOffers
  addFinancingOffer: (
    offer: Omit<FinancingOffer, "id" | "createdAtISO">
  ) => FinancingOffer;
  updateFinancingOffer: (id: string, updates: Partial<FinancingOffer>) => void;
  // BankConnections
  addBankConnection: (
    connection: Omit<BankConnection, "id" | "connectedAtISO">
  ) => BankConnection;
  // Utility
  resetToSeed: () => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

const STORAGE_KEY = "microlot_drops_v1";
const SCHEMA_VERSION = 3;

function migrateState(oldState: StorageState<unknown>): StorageState<AppState> {
  // Migration from version 1 to 2: add bankConnections
  if (oldState.schemaVersion === 1) {
    const oldData = oldState.data as any;
    return {
      schemaVersion: 2,
      data: {
        ...oldData,
        bankConnections: [],
      },
    };
  }
  
  // Migration from version 2 to 3: goalUnits -> goalGrams, add quantity/bagSizeGrams to reservations
  if (oldState.schemaVersion === 2) {
    const oldData = oldState.data as any;
    
    // Convert drops: goalUnits -> goalGrams (assume 250g per unit as fallback)
    const migratedDrops = oldData.drops?.map((drop: any) => {
      if ('goalUnits' in drop && !('goalGrams' in drop)) {
        return {
          ...drop,
          goalGrams: (drop.goalUnits || 0) * 250, // Fallback: assume 250g per unit
          goalUnits: undefined,
        };
      }
      return drop;
    }) || [];
    
    // Convert reservations: add quantity (default 1) and bagSizeGrams
    const migratedReservations = oldData.reservations?.map((res: any) => {
      if (!('quantity' in res) || !('bagSizeGrams' in res)) {
        const bagSizeGrams = res.size === "250g" ? 250 : res.size === "500g" ? 500 : 1000;
        return {
          ...res,
          quantity: 1, // Default to 1 bag
          bagSizeGrams,
        };
      }
      return res;
    }) || [];
    
    return {
      schemaVersion: 3,
      data: {
        ...oldData,
        drops: migratedDrops,
        reservations: migratedReservations,
      },
    };
  }
  
  // If schema version doesn't match and is not 1 or 2, return seed state
  if (oldState.schemaVersion !== SCHEMA_VERSION) {
    return {
      schemaVersion: SCHEMA_VERSION,
      data: createSeedState(),
    };
  }
  return oldState as StorageState<AppState>;
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorageState<AppState>(
    STORAGE_KEY,
    createSeedState(),
    SCHEMA_VERSION,
    migrateState
  );

  // Drops CRUD
  const addDrop = useCallback(
    (drop: Omit<Drop, "id" | "createdAtISO">): Drop => {
      const newDrop: Drop = {
        ...drop,
        id: nanoid(),
        createdAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        drops: [...prev.drops, newDrop],
      }));
      return newDrop;
    },
    [setState]
  );

  const updateDrop = useCallback(
    (id: string, updates: Partial<Drop>) => {
      setState((prev) => ({
        ...prev,
        drops: prev.drops.map((drop) =>
          drop.id === id ? { ...drop, ...updates } : drop
        ),
      }));
    },
    [setState]
  );

  const deleteDrop = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        drops: prev.drops.filter((drop) => drop.id !== id),
      }));
    },
    [setState]
  );

  // Reservations CRUD
  const addReservation = useCallback(
    (reservation: Omit<Reservation, "id" | "createdAtISO">): Reservation => {
      const newReservation: Reservation = {
        ...reservation,
        id: nanoid(),
        createdAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        reservations: [...prev.reservations, newReservation],
      }));
      return newReservation;
    },
    [setState]
  );

  const updateReservation = useCallback(
    (id: string, updates: Partial<Reservation>) => {
      setState((prev) => ({
        ...prev,
        reservations: prev.reservations.map((res) =>
          res.id === id ? { ...res, ...updates } : res
        ),
      }));
    },
    [setState]
  );

  // Commitments CRUD
  const addCommitment = useCallback(
    (commitment: Omit<Commitment, "id" | "createdAtISO">): Commitment => {
      const newCommitment: Commitment = {
        ...commitment,
        id: nanoid(),
        createdAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        commitments: [...prev.commitments, newCommitment],
      }));
      return newCommitment;
    },
    [setState]
  );

  const updateCommitment = useCallback(
    (id: string, updates: Partial<Commitment>) => {
      setState((prev) => ({
        ...prev,
        commitments: prev.commitments.map((commit) =>
          commit.id === id ? { ...commit, ...updates } : commit
        ),
      }));
    },
    [setState]
  );

  // Payments CRUD
  const addPayment = useCallback(
    (payment: Omit<Payment, "id" | "createdAtISO">): Payment => {
      const newPayment: Payment = {
        ...payment,
        id: nanoid(),
        createdAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        payments: [...prev.payments, newPayment],
      }));
      return newPayment;
    },
    [setState]
  );

  const updatePayment = useCallback(
    (id: string, updates: Partial<Payment>) => {
      setState((prev) => ({
        ...prev,
        payments: prev.payments.map((payment) =>
          payment.id === id ? { ...payment, ...updates } : payment
        ),
      }));
    },
    [setState]
  );

  // Confirm payment and create payout if needed
  const confirmPayment = useCallback(
    (paymentId: string) => {
      setState((prev) => {
        const payment = prev.payments.find((p) => p.id === paymentId);
        if (!payment) return prev;
        
        // Idempotency: if already CONFIRMED, do nothing
        if (payment.status === "CONFIRMED") return prev;

        const confirmedAt = new Date().toISOString();

        // Update payment to CONFIRMED
        const updatedPayments = prev.payments.map((p) =>
          p.id === paymentId
            ? { ...p, status: "CONFIRMED" as const, confirmedAtISO: confirmedAt }
            : p
        );

        // Update commitment to USED (idempotent - only if not already USED)
        const updatedCommitments = prev.commitments.map((c) =>
          c.id === payment.commitmentId && c.status !== "USED"
            ? { ...c, status: "USED" as const }
            : c
        );

        // Update reservation to FULFILLED (idempotent - only if not already FULFILLED)
        const updatedReservations = prev.reservations.map((r) =>
          r.id === payment.reservationId && r.status !== "FULFILLED"
            ? { ...r, status: "FULFILLED" as const }
            : r
        );

        // Check if payout already exists for this drop
        const existingPayout = prev.payouts.find(
          (p) => p.dropId === payment.dropId
        );

        let updatedPayouts = prev.payouts;
        if (!existingPayout) {
          // Get drop to find roasterId
          const drop = prev.drops.find((d) => d.id === payment.dropId);
          if (drop) {
            // Compute payout amounts
            const payoutAmounts = computePayoutForDrop(
              payment.dropId,
              updatedPayments,
              prev.payoutConfig
            );

            if (payoutAmounts) {
              // Create payout record with SCHEDULED status (for NORMAL mode) or PAID (for INSTANT mode)
              const newPayout: Payout = {
                id: nanoid(),
                dropId: payment.dropId,
                roasterId: drop.roaster,
                grossAmount: payoutAmounts.grossAmount,
                feeAmount: payoutAmounts.feeAmount,
                netAmount: payoutAmounts.netAmount,
                mode: prev.payoutConfig.mode,
                status: prev.payoutConfig.mode === "INSTANT" ? "PAID" : "SCHEDULED",
                createdAtISO: new Date().toISOString(),
              };
              updatedPayouts = [...prev.payouts, newPayout];
            }
          }
        }

        return {
          ...prev,
          payments: updatedPayments,
          commitments: updatedCommitments,
          reservations: updatedReservations,
          payouts: updatedPayouts,
        };
      });
    },
    [setState]
  );

  // Idempotent payment confirmation: creates payment if missing, then confirms it
  const confirmPaymentForReservation = useCallback(
    (params: {
      reservationId: string;
      commitmentId: string;
      dropId: string;
      userId: string;
      amount: number;
      beneficiary: string;
      reference: string;
    }): string => {
      let resultPaymentId = "";
      
      setState((prev) => {
        // Check if payment already exists for this reservation/commitment
        const existingPayment = prev.payments.find(
          (p) => p.reservationId === params.reservationId && p.commitmentId === params.commitmentId
        );

        if (existingPayment) {
          // Payment exists, use its ID
          resultPaymentId = existingPayment.id;
          // If already CONFIRMED, do nothing
          if (existingPayment.status === "CONFIRMED") return prev;
          // Otherwise, update to CONFIRMED
          const confirmedAt = new Date().toISOString();
          const updatedPayments = prev.payments.map((p) =>
            p.id === resultPaymentId
              ? { ...p, status: "CONFIRMED" as const, confirmedAtISO: confirmedAt }
              : p
          );

          // Update commitment to USED (idempotent)
          const updatedCommitments = prev.commitments.map((c) =>
            c.id === params.commitmentId && c.status !== "USED"
              ? { ...c, status: "USED" as const }
              : c
          );

          // Update reservation to FULFILLED (idempotent)
          const updatedReservations = prev.reservations.map((r) =>
            r.id === params.reservationId && r.status !== "FULFILLED"
              ? { ...r, status: "FULFILLED" as const }
              : r
          );

          // Check if payout already exists for this drop
          const existingPayout = prev.payouts.find(
            (p) => p.dropId === params.dropId
          );

          let updatedPayouts = prev.payouts;
          if (!existingPayout) {
            const drop = prev.drops.find((d) => d.id === params.dropId);
            if (drop) {
              const payoutAmounts = computePayoutForDrop(
                params.dropId,
                updatedPayments,
                prev.payoutConfig
              );

              if (payoutAmounts) {
                const newPayout: Payout = {
                  id: nanoid(),
                  dropId: params.dropId,
                  roasterId: drop.roaster,
                  grossAmount: payoutAmounts.grossAmount,
                  feeAmount: payoutAmounts.feeAmount,
                  netAmount: payoutAmounts.netAmount,
                  mode: prev.payoutConfig.mode,
                  status: prev.payoutConfig.mode === "INSTANT" ? "PAID" : "SCHEDULED",
                  createdAtISO: new Date().toISOString(),
                };
                updatedPayouts = [...prev.payouts, newPayout];
              }
            }
          }

          return {
            ...prev,
            payments: updatedPayments,
            commitments: updatedCommitments,
            reservations: updatedReservations,
            payouts: updatedPayouts,
          };
        } else {
          // Payment doesn't exist, create it with CONFIRMED status
          const newPaymentId = nanoid();
          resultPaymentId = newPaymentId;
          const confirmedAt = new Date().toISOString();
          const newPayment: Payment = {
            id: newPaymentId,
            reservationId: params.reservationId,
            commitmentId: params.commitmentId,
            dropId: params.dropId,
            userId: params.userId,
            amount: params.amount,
            beneficiary: params.beneficiary,
            reference: params.reference,
            status: "CONFIRMED",
            createdAtISO: new Date().toISOString(),
            confirmedAtISO: confirmedAt,
          };

          const updatedPayments = [...prev.payments, newPayment];

          // Update commitment to USED
          const updatedCommitments = prev.commitments.map((c) =>
            c.id === params.commitmentId && c.status !== "USED"
              ? { ...c, status: "USED" as const }
              : c
          );

          // Update reservation to FULFILLED
          const updatedReservations = prev.reservations.map((r) =>
            r.id === params.reservationId && r.status !== "FULFILLED"
              ? { ...r, status: "FULFILLED" as const }
              : r
          );

          // Check if payout already exists for this drop
          const existingPayout = prev.payouts.find(
            (p) => p.dropId === params.dropId
          );

          let updatedPayouts = prev.payouts;
          if (!existingPayout) {
            const drop = prev.drops.find((d) => d.id === params.dropId);
            if (drop) {
              const payoutAmounts = computePayoutForDrop(
                params.dropId,
                updatedPayments,
                prev.payoutConfig
              );

              if (payoutAmounts) {
                const newPayout: Payout = {
                  id: nanoid(),
                  dropId: params.dropId,
                  roasterId: drop.roaster,
                  grossAmount: payoutAmounts.grossAmount,
                  feeAmount: payoutAmounts.feeAmount,
                  netAmount: payoutAmounts.netAmount,
                  mode: prev.payoutConfig.mode,
                  status: prev.payoutConfig.mode === "INSTANT" ? "PAID" : "SCHEDULED",
                  createdAtISO: new Date().toISOString(),
                };
                updatedPayouts = [...prev.payouts, newPayout];
              }
            }
          }

          return {
            ...prev,
            payments: updatedPayments,
            commitments: updatedCommitments,
            reservations: updatedReservations,
            payouts: updatedPayouts,
          };
        }
      });
      
      return resultPaymentId;
    },
    [setState]
  );

  // PayoutConfig
  const updatePayoutConfig = useCallback(
    (config: Partial<PayoutConfig>) => {
      setState((prev) => ({
        ...prev,
        payoutConfig: { ...prev.payoutConfig, ...config },
      }));
    },
    [setState]
  );

  // Payouts
  const addPayout = useCallback(
    (payout: Omit<Payout, "id" | "createdAtISO">): Payout => {
      const newPayout: Payout = {
        ...payout,
        id: nanoid(),
        createdAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        payouts: [...prev.payouts, newPayout],
      }));
      return newPayout;
    },
    [setState]
  );

  // FinancingOffers CRUD
  const addFinancingOffer = useCallback(
    (offer: Omit<FinancingOffer, "id" | "createdAtISO">): FinancingOffer => {
      const newOffer: FinancingOffer = {
        ...offer,
        id: nanoid(),
        createdAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        financingOffers: [...prev.financingOffers, newOffer],
      }));
      return newOffer;
    },
    [setState]
  );

  const updateFinancingOffer = useCallback(
    (id: string, updates: Partial<FinancingOffer>) => {
      setState((prev) => ({
        ...prev,
        financingOffers: prev.financingOffers.map((offer) =>
          offer.id === id ? { ...offer, ...updates } : offer
        ),
      }));
    },
    [setState]
  );

  // BankConnections CRUD
  const addBankConnection = useCallback(
    (connection: Omit<BankConnection, "id" | "connectedAtISO">): BankConnection => {
      const newConnection: BankConnection = {
        ...connection,
        id: nanoid(),
        connectedAtISO: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        bankConnections: [...prev.bankConnections, newConnection],
      }));
      return newConnection;
    },
    [setState]
  );

  // Utility
  const resetToSeed = useCallback(() => {
    setState(createSeedState());
  }, [setState]);

  const value: AppStateContextType = {
    state,
    addDrop,
    updateDrop,
    deleteDrop,
    addReservation,
    updateReservation,
    addCommitment,
    updateCommitment,
    addPayment,
    updatePayment,
    confirmPayment,
    confirmPaymentForReservation,
    updatePayoutConfig,
    addPayout,
    addFinancingOffer,
    updateFinancingOffer,
    addBankConnection,
    resetToSeed,
  };

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
}

