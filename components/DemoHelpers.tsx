"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/context/AppStateProvider";
import { nanoid } from "nanoid";
import { getDropReservedGrams } from "@/lib/compute";
import type { Drop, Roaster } from "@/types";

interface DemoHelpersProps {
  dropId?: string;
}

export function DemoHelpers({ dropId }: DemoHelpersProps) {
  const { state, resetToSeed, addReservation, addDrop } = useAppState();
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  
  // Determine if we're in roaster view
  const isRoasterView = pathname?.startsWith("/roaster") ?? false;

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all demo data? This will clear all reservations, commitments, payments, payouts, and financing offers."
      )
    ) {
      resetToSeed();
      alert("Demo data has been reset.");
    }
  };

  const handleSimulateReservations = () => {
    if (!dropId) {
      alert("No drop selected for simulation.");
      return;
    }

    const drop = state.drops.find((d) => d.id === dropId);
    if (!drop) {
      alert("Drop not found.");
      return;
    }

    // Get current reserved grams
    const reservedGrams = getDropReservedGrams(dropId, state.reservations);
    const needed = Math.max(0, drop.goalGrams - reservedGrams);

    if (needed === 0) {
      alert("This drop is already completed!");
      return;
    }

    // Create reservations to complete the drop (estimate 1 bag = 250g)
    const estimatedBagsNeeded = Math.ceil(needed / 250);
    const numToCreate = Math.min(estimatedBagsNeeded, 10); // Limit to 10 at a time
    const userId = `demo-user-${nanoid(8)}`;

    for (let i = 0; i < numToCreate; i++) {
      const sizes: ("250g" | "500g" | "1kg")[] = ["250g", "500g", "1kg"];
      const grinds: ("whole" | "espresso" | "filter" | "press")[] = [
        "whole",
        "espresso",
        "filter",
        "press",
      ];
      const deliveries: ("shipping" | "pickup")[] = ["shipping", "pickup"];

      const size = sizes[i % sizes.length];
      const bagSizeGrams = size === "250g" ? 250 : size === "500g" ? 500 : 1000;
      addReservation({
        dropId,
        userId: `${userId}-${i}`,
        size,
        quantity: 1,
        bagSizeGrams,
        grind: grinds[i % grinds.length],
        delivery: deliveries[i % deliveries.length],
        status: "ACTIVE",
      });
    }

    alert(
      `Created ${numToCreate} simulated reservation${numToCreate !== 1 ? "s" : ""} for this drop.`
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg font-semibold text-sm"
        aria-label="Toggle demo helpers"
      >
        Demo Tools
      </button>

      {isExpanded && (
        <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 min-w-[250px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Demo Helpers
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close demo helpers"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {/* View Switcher */}
            <Link
              href={isRoasterView ? "/" : "/roaster"}
              className="block w-full text-left px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm font-medium transition-colors"
              onClick={() => setIsExpanded(false)}
            >
              {isRoasterView ? "Switch to Customer View" : "Switch to Roaster View"}
            </Link>

            {isRoasterView && (
              <Link
                href="/roaster/financing"
                className="block w-full text-left px-3 py-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-sm font-medium transition-colors"
                onClick={() => setIsExpanded(false)}
              >
                View Financing Offer
              </Link>
            )}

            {dropId && (
              <button
                onClick={handleSimulateReservations}
                className="w-full text-left px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium transition-colors"
              >
                Simulate Reservations
              </button>
            )}

            <button
              onClick={handleResetData}
              className="w-full text-left px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm font-medium transition-colors"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

