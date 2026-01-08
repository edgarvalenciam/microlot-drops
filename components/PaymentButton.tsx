"use client";

import { useState } from "react";
import type { Drop, Reservation, Commitment } from "@/types";

interface PaymentButtonProps {
  drop: Drop;
  reservation: Reservation;
  commitment: Commitment;
  onPay: () => Promise<string>; // Returns paymentId
}

export function PaymentButton({
  drop,
  reservation,
  commitment,
  onPay,
}: PaymentButtonProps) {
  const [status, setStatus] = useState<"idle" | "initiating" | "confirmed">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setStatus("initiating");
    setError(null);

    try {
      const paymentId = await onPay();
      setStatus("confirmed");
      // Redirect after showing confirmation briefly
      setTimeout(() => {
        window.location.href = `/receipt/${paymentId}`;
      }, 1000);
    } catch (err) {
      setError("Payment failed. Please try again.");
      setStatus("idle");
    }
  };

  if (status === "confirmed") {
    return (
      <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-800 dark:text-green-200 font-medium">
            Payment confirmed!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={status === "initiating"}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {status === "initiating" ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing payment...
          </>
        ) : (
          <>
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
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Pay now (1 click)
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Amount: €{(drop.prices[reservation.size] * reservation.quantity).toFixed(2)}
      </p>
    </div>
  );
}

