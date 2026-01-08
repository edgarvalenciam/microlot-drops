"use client";

import type { Drop, Reservation } from "@/types";
import { getDropStatus, getDropProgress, getDropReservedGrams, getDropCapGrams } from "@/lib/compute";
import { formatGrams } from "@/lib/format";

interface DropProgressBarProps {
  drop: Drop;
  reservations: Reservation[];
}

export function DropProgressBar({ drop, reservations }: DropProgressBarProps) {
  const status = getDropStatus(drop, reservations);
  const progress = getDropProgress(drop, reservations);
  const reservedGrams = getDropReservedGrams(drop.id, reservations);
  const capGrams = getDropCapGrams(drop);

  const statusConfig = {
    ACTIVE: {
      label: "Active",
      barColor: "bg-green-600",
      textColor: "text-green-700 dark:text-green-400",
    },
    COMPLETED: {
      label: "Completed",
      barColor: "bg-blue-600",
      textColor: "text-blue-700 dark:text-blue-400",
    },
    EXPIRED: {
      label: "Expired",
      barColor: "bg-gray-400",
      textColor: "text-gray-600 dark:text-gray-400",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatGrams(reservedGrams)} / {formatGrams(drop.goalGrams)}
          </span>
          <span className={`ml-2 text-sm font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`${config.barColor} h-3 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {formatGrams(Math.max(0, drop.goalGrams - reservedGrams))} remaining to reach goal
      </p>
    </div>
  );
}

