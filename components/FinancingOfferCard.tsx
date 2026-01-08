"use client";

import type { FinancingOffer, FinancingOfferStatus } from "@/types";
import { formatCurrency } from "@/lib/format";

interface FinancingOfferCardProps {
  offer: FinancingOffer;
  onAccept?: () => void;
}

export function FinancingOfferCard({
  offer,
  onAccept,
}: FinancingOfferCardProps) {
  const statusColors: Record<FinancingOfferStatus, string> = {
    OFFERED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    ACCEPTED:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    DECLINED:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const canAccept = offer.status === "OFFERED" && onAccept;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Financing Offer
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[offer.status]}`}
        >
          {offer.status}
        </span>
      </div>

      {/* Offer Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Offer Amount
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(offer.amount)}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Repayment Rate
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {offer.repayPct}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            of payouts
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Term
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {offer.termWeeks}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            weeks
          </div>
        </div>
      </div>

      {/* Based on KPIs */}
      {offer.basedOnKPIs && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Based on Your Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Fill Rate
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {offer.basedOnKPIs.fillRate.toFixed(1)}%
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Cancellation Rate
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {offer.basedOnKPIs.cancellationRate.toFixed(1)}%
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Volume Index
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {offer.basedOnKPIs.volumeIndex}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer - Always Visible */}
      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          <strong>Disclaimer:</strong> Financing is offered by a regulated third
          party lender. We only facilitate origination.
        </p>
      </div>

      {/* CTA */}
      {canAccept && (
        <div className="flex gap-4">
          <button
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Accept Offer
          </button>
        </div>
      )}

      {offer.status === "ACCEPTED" && offer.acceptedAtISO && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            Offer accepted on{" "}
            {new Date(offer.acceptedAtISO).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

