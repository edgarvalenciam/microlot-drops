"use client";

import Link from "next/link";
import { useMemo, useEffect } from "react";
import { useAppState } from "@/context/AppStateProvider";
import { FinancingOfferCard } from "@/components/FinancingOfferCard";
import { DemoHelpers } from "@/components/DemoHelpers";
import { computeRoasterKPIs, computeOffer } from "@/lib/compute";
import type { Roaster } from "@/types";

// For MVP, we'll use a fixed roaster ID
// In production, this would come from authentication
const CURRENT_ROASTER: Roaster = "Nomad Coffee";

export default function RoasterFinancingPage() {
  const { state, addFinancingOffer, updateFinancingOffer } = useAppState();

  // Compute KPIs for current roaster
  const kpis = useMemo(
    () =>
      computeRoasterKPIs(
        CURRENT_ROASTER,
        state.drops,
        state.reservations,
        state.payments,
        state.payouts
      ),
    [state.drops, state.reservations, state.payments, state.payouts]
  );

  // Find existing offer for current roaster
  const existingOffer = useMemo(
    () =>
      state.financingOffers.find((o) => o.roasterId === CURRENT_ROASTER),
    [state.financingOffers]
  );

  // Compute offer based on current KPIs
  const computedOffer = useMemo(() => computeOffer(kpis), [kpis]);

  // Generate or update offer if needed
  useEffect(() => {
    if (!existingOffer) {
      // Create new offer if none exists
      addFinancingOffer({
        roasterId: CURRENT_ROASTER,
        amount: computedOffer.amount,
        repayPct: computedOffer.repayPct,
        termWeeks: computedOffer.termWeeks,
        status: "OFFERED",
        basedOnKPIs: computedOffer.basedOnKPIs,
      });
    } else if (existingOffer.status === "OFFERED") {
      // Update offer if it's still OFFERED (KPIs may have changed)
      // Only update if values are different to avoid unnecessary updates
      const needsUpdate =
        existingOffer.amount !== computedOffer.amount ||
        existingOffer.repayPct !== computedOffer.repayPct ||
        existingOffer.termWeeks !== computedOffer.termWeeks ||
        existingOffer.basedOnKPIs?.fillRate !==
          computedOffer.basedOnKPIs.fillRate ||
        existingOffer.basedOnKPIs?.cancellationRate !==
          computedOffer.basedOnKPIs.cancellationRate ||
        existingOffer.basedOnKPIs?.volumeIndex !==
          computedOffer.basedOnKPIs.volumeIndex;

      if (needsUpdate) {
        updateFinancingOffer(existingOffer.id, {
          amount: computedOffer.amount,
          repayPct: computedOffer.repayPct,
          termWeeks: computedOffer.termWeeks,
          basedOnKPIs: computedOffer.basedOnKPIs,
        });
      }
    }
  }, [
    existingOffer,
    computedOffer,
    addFinancingOffer,
    updateFinancingOffer,
  ]);

  const handleAccept = () => {
    if (existingOffer && existingOffer.status === "OFFERED") {
      updateFinancingOffer(existingOffer.id, {
        status: "ACCEPTED",
        acceptedAtISO: new Date().toISOString(),
      });
    }
  };

  // Get the current offer (either existing or use computed for display)
  const currentOffer = existingOffer || {
    id: "pending",
    roasterId: CURRENT_ROASTER,
    amount: computedOffer.amount,
    repayPct: computedOffer.repayPct,
    termWeeks: computedOffer.termWeeks,
    status: "OFFERED" as const,
    basedOnKPIs: computedOffer.basedOnKPIs,
    createdAtISO: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Financiación
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {CURRENT_ROASTER}
            </p>
          </div>
          <Link
            href="/roaster"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Volver al Panel
          </Link>
        </div>

        {/* Financing Offer Card */}
        <div className="mb-8">
          <FinancingOfferCard
            offer={currentOffer}
            onAccept={existingOffer?.status === "OFFERED" ? handleAccept : undefined}
          />
        </div>
      </main>
      <DemoHelpers />
    </div>
  );
}

