"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/context/AppStateProvider";
import { PayoutModeToggle } from "@/components/PayoutModeToggle";
import { PayoutHistoryTable } from "@/components/PayoutHistoryTable";
import { DemoHelpers } from "@/components/DemoHelpers";
import type { PayoutMode, Roaster } from "@/types";

// For MVP, we'll use a fixed roaster ID
// In production, this would come from authentication
const CURRENT_ROASTER: Roaster = "Nomad Coffee";

export default function RoasterPayoutsPage() {
  const { state, updatePayoutConfig } = useAppState();

  // Filter payouts for current roaster
  const roasterPayouts = useMemo(
    () => state.payouts.filter((p) => p.roasterId === CURRENT_ROASTER),
    [state.payouts]
  );

  const handleModeChange = (mode: PayoutMode) => {
    updatePayoutConfig({ mode });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Payouts
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {CURRENT_ROASTER}
            </p>
          </div>
          <Link
            href="/roaster"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Payout Mode Toggle */}
        <div className="mb-8">
          <PayoutModeToggle
            mode={state.payoutConfig.mode}
            onModeChange={handleModeChange}
          />
        </div>

        {/* Payout History Table */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Payout History ({roasterPayouts.length})
          </h2>
          <PayoutHistoryTable payouts={roasterPayouts} drops={state.drops} />
        </div>
      </main>
      <DemoHelpers />
    </div>
  );
}

