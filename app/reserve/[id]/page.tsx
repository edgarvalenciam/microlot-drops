"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateProvider";
import { ReservationForm } from "@/components/ReservationForm";
import { getDropStatus, canReserveGrams } from "@/lib/compute";
import { getUserId } from "@/lib/user";
import { formatDate, formatGrams } from "@/lib/format";
import { ORIGIN_COLORS, PROCESS_COLORS, ROASTER_COLORS } from "@/lib/colors";

interface ReservationFormData {
  size: "250g" | "500g" | "1kg";
  quantity: number;
  bagSizeGrams: number;
  grind: "whole" | "espresso" | "filter" | "press";
  delivery: "shipping" | "pickup";
}

export default function ReservePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, addReservation } = useAppState();

  const drop = state.drops.find((d) => d.id === id);

  if (!drop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Drop not found
          </h1>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to drops feed
          </Link>
        </div>
      </div>
    );
  }

  const status = getDropStatus(drop, state.reservations);

  // Check if drop is active
  if (status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <main className="container mx-auto px-4 py-8">
          <Link
            href={`/drop/${drop.id}`}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
          >
            ← Back to drop
          </Link>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Cannot Reserve
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This drop is {status.toLowerCase()} and no longer accepting
              reservations.
            </p>
            <Link
              href={`/drop/${drop.id}`}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              View Drop Details
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (data: ReservationFormData) => {
    const userId = getUserId();
    const requestedGrams = data.quantity * data.bagSizeGrams;
    
    // Check if reservation would exceed cap
    const canReserve = canReserveGrams(drop, state.reservations, requestedGrams);
    if (!canReserve.ok) {
      // Return error data that ReservationForm can handle
      throw new Error(`CAP_EXCEEDED:${canReserve.availableGrams}`);
    }
    
    const reservation = addReservation({
      dropId: drop.id,
      userId,
      size: data.size,
      quantity: data.quantity,
      bagSizeGrams: data.bagSizeGrams,
      grind: data.grind,
      delivery: data.delivery,
      status: "ACTIVE",
    });

    // Small delay to show success message before redirect to connect bank
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(`/connect-bank?reservationId=${reservation.id}`);
  };

  const originColor = ORIGIN_COLORS[drop.origin];
  const processColor = PROCESS_COLORS[drop.process];
  const roasterColor = ROASTER_COLORS[drop.roaster];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Link */}
        <Link
          href={`/drop/${drop.id}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Back to drop
        </Link>

        {/* Drop Info Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Reserve {drop.name}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className="px-2 py-1 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: originColor }}
            >
              {drop.origin}
            </span>
            <span
              className="px-2 py-1 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: processColor }}
            >
              {drop.process}
            </span>
            <span
              className="px-2 py-1 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: roasterColor }}
            >
              {drop.roaster}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Deadline: {formatDate(drop.deadlineISO)}
          </p>
        </div>

        {/* Reservation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Reservation Details
          </h2>
          <ReservationForm drop={drop} onSubmit={handleSubmit} />
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> Your reservation is free and holds your spot.
            You will only be charged if the drop reaches its goal of{" "}
            {formatGrams(drop.goalGrams)} before {formatDate(drop.deadlineISO)}.
          </p>
        </div>
      </main>
    </div>
  );
}

