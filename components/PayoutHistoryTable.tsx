"use client";

import Link from "next/link";
import type { Payout, Drop, PayoutMode, PayoutStatus } from "@/types";
import { formatDate, formatCurrency } from "@/lib/format";

interface PayoutHistoryTableProps {
  payouts: Payout[];
  drops: Drop[];
}

export function PayoutHistoryTable({
  payouts,
  drops,
}: PayoutHistoryTableProps) {
  const getStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getModeColor = (mode: PayoutMode) => {
    switch (mode) {
      case "INSTANT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "NORMAL":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Sort payouts by date (newest first)
  const sortedPayouts = [...payouts].sort(
    (a, b) =>
      new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Drop
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Gross
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fee
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Net
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedPayouts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No payouts yet
                </td>
              </tr>
            ) : (
              sortedPayouts.map((payout) => {
                const drop = drops.find((d) => d.id === payout.dropId);

                return (
                  <tr
                    key={payout.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(payout.createdAtISO)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {drop ? (
                        <Link
                          href={`/roaster/drops/${drop.id}`}
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          {drop.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Unknown drop
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(payout.grossAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(payout.feeAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payout.netAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getModeColor(
                          payout.mode
                        )}`}
                      >
                        {payout.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

