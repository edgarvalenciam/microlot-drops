"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { formatDate, formatCurrency } from "@/lib/format";

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  const { paymentId } = use(params);
  const { state } = useAppState();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const payment = state.payments.find((p) => p.id === paymentId);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Payment not found
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

  const reservation = state.reservations.find(
    (r) => r.id === payment.reservationId
  );
  const drop = state.drops.find((d) => d.id === payment.dropId);

  const statusColors = {
    INITIATED:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Link */}
        <Link
          href="/my"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Back to my reservations
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment Receipt
            </h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[payment.status]}`}
            >
              {payment.status}
            </span>
          </div>

          {drop && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {drop.name}
              </h2>
              <Link
                href={`/drop/${drop.id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                View drop details
              </Link>
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Payment Details
          </h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Payment ID
              </span>
              <span className="text-gray-900 dark:text-white font-mono text-sm">
                {payment.id}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Date
              </span>
              <span className="text-gray-900 dark:text-white">
                {formatDate(payment.createdAtISO)}
              </span>
            </div>

            {payment.confirmedAtISO && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Confirmed At
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatDate(payment.confirmedAtISO)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Amount
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(payment.amount)}
              </span>
            </div>

            <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Beneficiary
              </span>
              <span className="text-gray-900 dark:text-white text-right">
                {payment.beneficiary}
              </span>
            </div>

            <div className="flex justify-between items-start py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Reference
              </span>
              <span className="text-gray-900 dark:text-white font-mono text-sm text-right">
                {payment.reference}
              </span>
            </div>

            {reservation && (
              <>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Size
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {reservation.size}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Grind Type
                  </span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {reservation.grind}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Delivery
                  </span>
                  <span className="text-gray-900 dark:text-white capitalize">
                    {reservation.delivery}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Download PDF (Stubbed) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              alert("PDF download functionality would be implemented here.");
            }}
            className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF Receipt
          </button>
        </div>
      </main>
    </div>
  );
}

