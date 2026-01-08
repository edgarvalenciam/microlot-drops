"use client";

import { use } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { ConfirmModal } from "@/components/ConfirmModal";
import { DemoHelpers } from "@/components/DemoHelpers";
import { getDropStatus, getDropProgress, getDropReservedGrams } from "@/lib/compute";
import { ORIGINS, PROCESSES } from "@/data/catalogs";
import { formatDate, formatGrams } from "@/lib/format";
import type { Origin, Process } from "@/types";

export default function EditDropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, updateDrop, deleteDrop } = useAppState();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const drop = state.drops.find((d) => d.id === id);

  if (!drop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Drop not found
          </h1>
          <Link
            href="/roaster"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const status = getDropStatus(drop, state.reservations);
  const progress = getDropProgress(drop, state.reservations);
  const reservedGrams = getDropReservedGrams(drop.id, state.reservations);

  const [formData, setFormData] = useState({
    name: drop.name,
    origin: drop.origin,
    process: drop.process,
    price250g: drop.prices["250g"].toString(),
    price500g: drop.prices["500g"].toString(),
    price1kg: drop.prices["1kg"].toString(),
    goalGrams: drop.goalGrams.toString(),
    deadline: formatDate(drop.deadlineISO).split("T")[0] || "",
    roastDateEstimate: drop.roastDateEstimateISO
      ? formatDate(drop.roastDateEstimateISO).split("T")[0]
      : "",
    tastingNotes: drop.tastingNotes?.join(", ") || "",
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    const price250g = parseFloat(formData.price250g);
    const price500g = parseFloat(formData.price500g);
    const price1kg = parseFloat(formData.price1kg);

    if (isNaN(price250g) || price250g <= 0) {
      newErrors.price250g = "Price must be a positive number";
    }

    if (isNaN(price500g) || price500g <= 0) {
      newErrors.price500g = "Price must be a positive number";
    }

    if (isNaN(price1kg) || price1kg <= 0) {
      newErrors.price1kg = "Price must be a positive number";
    }

    const goalGrams = parseInt(formData.goalGrams);
    if (isNaN(goalGrams) || goalGrams <= 0) {
      newErrors.goalGrams = "Goal grams must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const deadlineDate = new Date(formData.deadline);
      const roastDateEstimateISO = formData.roastDateEstimate
        ? new Date(formData.roastDateEstimate).toISOString()
        : undefined;

      const tastingNotesArray = formData.tastingNotes
        ? formData.tastingNotes.split(",").map((note) => note.trim())
        : undefined;

      updateDrop(drop.id, {
        name: formData.name,
        origin: formData.origin as Origin,
        process: formData.process as Process,
        prices: {
          "250g": parseFloat(formData.price250g),
          "500g": parseFloat(formData.price500g),
          "1kg": parseFloat(formData.price1kg),
        },
        goalGrams: parseInt(formData.goalGrams),
        deadlineISO: deadlineDate.toISOString(),
        roastDateEstimateISO,
        tastingNotes: tastingNotesArray,
      });

      router.push("/roaster");
    } catch (error) {
      console.error("Error updating drop:", error);
      setErrors({ submit: "Failed to update drop. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    deleteDrop(drop.id);
    router.push("/roaster");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/roaster"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Back to dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Drop
          </h1>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Delete Drop
          </button>
        </div>

        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Performance
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {status}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Reserved
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatGrams(reservedGrams)} / {formatGrams(drop.goalGrams)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Fill Rate
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {progress}%
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Drop Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Origin <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.origin}
              onChange={(e) =>
                setFormData({ ...formData, origin: e.target.value as Origin })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {ORIGINS.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
          </div>

          {/* Process */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Process <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.process}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  process: e.target.value as Process,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {PROCESSES.map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                250g Price (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price250g}
                onChange={(e) =>
                  setFormData({ ...formData, price250g: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.price250g && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.price250g}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                500g Price (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price500g}
                onChange={(e) =>
                  setFormData({ ...formData, price500g: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.price500g && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.price500g}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                1kg Price (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price1kg}
                onChange={(e) =>
                  setFormData({ ...formData, price1kg: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.price1kg && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.price1kg}
                </p>
              )}
            </div>
          </div>

          {/* Goal Grams */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Goal (grams) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.goalGrams}
              onChange={(e) =>
                setFormData({ ...formData, goalGrams: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.goalGrams && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.goalGrams}
              </p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Roast Date Estimate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estimated Roast Date (optional)
            </label>
            <input
              type="date"
              value={formData.roastDateEstimate}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roastDateEstimate: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Tasting Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasting Notes (optional, comma-separated)
            </label>
            <input
              type="text"
              value={formData.tastingNotes}
              onChange={(e) =>
                setFormData({ ...formData, tastingNotes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {errors.submit}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/roaster"
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isSubmitting ? "Updating..." : "Update Drop"}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Drop"
          message={`Are you sure you want to delete "${drop.name}"? This action cannot be undone.`}
          confirmText="Delete Drop"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      </main>
      <DemoHelpers dropId={drop.id} />
    </div>
  );
}

