"use client";

import type { PayoutMode } from "@/types";
import { formatCurrency } from "@/lib/format";

interface PayoutModeToggleProps {
  mode: PayoutMode;
  onModeChange: (mode: PayoutMode) => void;
}

export function PayoutModeToggle({
  mode,
  onModeChange,
}: PayoutModeToggleProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Modo de Desembolso
      </h2>
      <div className="space-y-4">
        {/* NORMAL Mode Option */}
        <button
          onClick={() => onModeChange("NORMAL")}
          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
            mode === "NORMAL"
              ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    mode === "NORMAL"
                      ? "border-blue-600 dark:border-blue-400"
                      : "border-gray-400 dark:border-gray-500"
                  }`}
                >
                  {mode === "NORMAL" && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Desembolso Normal
                </span>
              </div>
              <div className="ml-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Liquidación: T+3 (3 días hábiles)</p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  Comisión: {formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
        </button>

        {/* INSTANT Mode Option */}
        <button
          onClick={() => onModeChange("INSTANT")}
          className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
            mode === "INSTANT"
              ? "border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    mode === "INSTANT"
                      ? "border-blue-600 dark:border-blue-400"
                      : "border-gray-400 dark:border-gray-500"
                  }`}
                >
                  {mode === "INSTANT" && (
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Desembolso Instantáneo
                </span>
              </div>
              <div className="ml-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Liquidación: T+0 / T+1 (mismo día o día siguiente)</p>
                <p className="font-medium text-orange-600 dark:text-orange-400">
                  Comisión: 1.0% del monto bruto del desembolso
                </p>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

