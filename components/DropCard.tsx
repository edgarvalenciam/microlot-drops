"use client";

import Link from "next/link";
import type { Drop, Reservation } from "@/types";
import { getDropStatus, getDropProgress, getDropReservedGrams } from "@/lib/compute";
import { formatDate, formatDateRelative, formatGrams } from "@/lib/format";
import { ORIGIN_COLORS, PROCESS_COLORS, ROASTER_COLORS } from "@/lib/colors";

interface DropCardProps {
  drop: Drop;
  reservations: Reservation[];
}

export function DropCard({ drop, reservations }: DropCardProps) {
  const status = getDropStatus(drop, reservations);
  const progress = getDropProgress(drop, reservations);
  const reservedGrams = getDropReservedGrams(drop.id, reservations);

  const statusColors = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    COMPLETED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const originColor = ORIGIN_COLORS[drop.origin];
  const processColor = PROCESS_COLORS[drop.process];
  const roasterColor = ROASTER_COLORS[drop.roaster];

  return (
    <Link href={`/drop/${drop.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {drop.name}
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
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
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}
          >
            {status}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>
              {formatGrams(reservedGrams)} / {formatGrams(drop.goalGrams)} reserved
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${
                status === "COMPLETED"
                  ? "bg-blue-600"
                  : status === "EXPIRED"
                  ? "bg-gray-400"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Starting at:
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            €{drop.prices["250g"].toFixed(2)} / 250g
          </p>
        </div>

        {/* Deadline */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Deadline: {formatDate(drop.deadlineISO)} ({formatDateRelative(drop.deadlineISO)})
        </div>
      </div>
    </Link>
  );
}

