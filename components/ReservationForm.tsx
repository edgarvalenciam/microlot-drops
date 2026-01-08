"use client";

import { useState } from "react";
import Link from "next/link";
import type { Drop } from "@/types";
import { formatGrams } from "@/lib/format";

interface ReservationFormProps {
  drop: Drop;
  onSubmit: (data: {
    size: "250g" | "500g" | "1kg";
    quantity: number;
    bagSizeGrams: number;
    grind: "whole" | "espresso" | "filter" | "press";
    delivery: "shipping" | "pickup";
  }) => Promise<void>;
}

export function ReservationForm({ drop, onSubmit }: ReservationFormProps) {
  const [size, setSize] = useState<"250g" | "500g" | "1kg" | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [grind, setGrind] = useState<
    "whole" | "espresso" | "filter" | "press" | ""
  >("");
  const [delivery, setDelivery] = useState<"shipping" | "pickup" | "">("");
  const [errors, setErrors] = useState<{
    size?: string;
    quantity?: string;
    grind?: string;
    delivery?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!size) {
      newErrors.size = "Please select a size";
    }

    if (!quantity || quantity < 1) {
      newErrors.quantity = "Quantity must be at least 1";
    }

    if (!grind) {
      newErrors.grind = "Please select a grind type";
    }

    if (!delivery) {
      newErrors.delivery = "Please select a delivery method";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const bagSizeGrams = size === "250g" ? 250 : size === "500g" ? 500 : 1000;
      await onSubmit({
        size: size as "250g" | "500g" | "1kg",
        quantity,
        bagSizeGrams,
        grind: grind as "whole" | "espresso" | "filter" | "press",
        delivery: delivery as "shipping" | "pickup",
      });

      setIsSuccess(true);
      // Auto-clear form after success
      setTimeout(() => {
        setSize("");
        setQuantity(1);
        setGrind("");
        setDelivery("");
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error creating reservation:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create reservation";
      
      // Check if it's a cap exceeded error
      if (errorMessage.startsWith("CAP_EXCEEDED:")) {
        const availableGrams = parseInt(errorMessage.split(":")[1]) || 0;
        setErrors({
          delivery: `You can't reserve that much. This drop is nearly sold out. Max available: ${formatGrams(availableGrams)}.`,
        });
      } else {
        setErrors({
          delivery: "Failed to create reservation. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const price = size ? drop.prices[size] * quantity : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Size <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["250g", "500g", "1kg"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s);
                setErrors((prev) => ({ ...prev, size: undefined }));
              }}
              className={`px-4 py-3 rounded-lg border-2 transition-colors font-medium ${
                size === s
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div>{s}</div>
              <div className="text-sm mt-1">
                €{drop.prices[s].toFixed(2)}
              </div>
            </button>
          ))}
        </div>
        {errors.size && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.size}
          </p>
        )}
      </div>

      {/* Quantity Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Quantity <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            setQuantity(Math.max(1, val));
            setErrors((prev) => ({ ...prev, quantity: undefined }));
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.quantity}
          </p>
        )}
      </div>

      {/* Grind Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Grind Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "whole", label: "Whole Bean" },
            { value: "espresso", label: "Espresso" },
            { value: "filter", label: "Filter" },
            { value: "press", label: "French Press" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setGrind(option.value as typeof grind);
                setErrors((prev) => ({ ...prev, grind: undefined }));
              }}
              className={`px-4 py-3 rounded-lg border-2 transition-colors font-medium ${
                grind === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.grind && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.grind}
          </p>
        )}
      </div>

      {/* Delivery Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Delivery Method <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "shipping", label: "Shipping" },
            { value: "pickup", label: "Pickup" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setDelivery(option.value as typeof delivery);
                setErrors((prev) => ({ ...prev, delivery: undefined }));
              }}
              className={`px-4 py-3 rounded-lg border-2 transition-colors font-medium ${
                delivery === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors.delivery && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.delivery}
          </p>
        )}
      </div>

      {/* Total Price */}
      {price > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Total:
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              €{price.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✓ Reservation created successfully!
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? "Creating reservation..." : "Create Reservation"}
      </button>
    </form>
  );
}

