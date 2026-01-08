"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { DemoHelpers } from "@/components/DemoHelpers";
import { ORIGINS, PROCESSES, ROASTERS } from "@/data/catalogs";
import type { Origin, Process, Roaster } from "@/types";

const CURRENT_ROASTER: Roaster = "Nomad Coffee";

export default function NewDropPage() {
  const router = useRouter();
  const { addDrop } = useAppState();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    roaster: CURRENT_ROASTER,
    origin: "" as Origin | "",
    process: "" as Process | "",
    price250g: "",
    price500g: "",
    price1kg: "",
    goalGrams: "",
    deadline: "",
    roastDateEstimate: "",
    tastingNotes: "",
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!formData.origin) {
      newErrors.origin = "Please select an origin";
    }

    if (!formData.process) {
      newErrors.process = "Please select a process";
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

    const deadline = new Date(formData.deadline);
    const now = new Date();
    if (!formData.deadline || deadline <= now) {
      newErrors.deadline = "Deadline must be in the future";
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

      addDrop({
        name: formData.name,
        roaster: formData.roaster as Roaster,
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
      console.error("Error creating drop:", error);
      setErrors({ submit: "Failed to create drop. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
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

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Create New Drop
        </h1>

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
              placeholder="e.g., Ethiopian Yirgacheffe Natural"
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
              <option value="">Select origin</option>
              {ORIGINS.map((origin) => (
                <option key={origin} value={origin}>
                  {origin}
                </option>
              ))}
            </select>
            {errors.origin && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.origin}
              </p>
            )}
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
              <option value="">Select process</option>
              {PROCESSES.map((process) => (
                <option key={process} value={process}>
                  {process}
                </option>
              ))}
            </select>
            {errors.process && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.process}
              </p>
            )}
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

          {/* Goal Units */}
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
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {errors.deadline && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.deadline}
              </p>
            )}
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
              placeholder="e.g., Blueberry, Jasmine, Winey"
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
              {isSubmitting ? "Creating..." : "Create Drop"}
            </button>
          </div>
        </form>
      </main>
      <DemoHelpers />
    </div>
  );
}

