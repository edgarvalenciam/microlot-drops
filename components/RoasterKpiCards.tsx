"use client";

import { formatCurrency } from "@/lib/format";

interface RoasterKPIs {
  expectedRevenue: number;
  avgFillRate: number;
  netPayouts: number;
  totalDrops: number;
  completedDrops: number;
}

interface RoasterKpiCardsProps {
  kpis: RoasterKPIs;
}

export function RoasterKpiCards({ kpis }: RoasterKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Expected Revenue
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(kpis.expectedRevenue)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          From confirmed payments
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Average Fill Rate
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {kpis.avgFillRate.toFixed(1)}%
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Across all drops
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Net Payouts
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(kpis.netPayouts)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          After fees
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Completed Drops
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {kpis.completedDrops} / {kpis.totalDrops}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          Total drops created
        </div>
      </div>
    </div>
  );
}

