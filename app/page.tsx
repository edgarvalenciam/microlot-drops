"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { DropCard } from "@/components/DropCard";
import { FilterBar } from "@/components/FilterBar";
import { DemoHelpers } from "@/components/DemoHelpers";
import { getDropStatus } from "@/lib/compute";
import type { Origin, Process, Roaster, DropStatus } from "@/types";

export default function Home() {
  const { state } = useAppState();
  const [mounted, setMounted] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [selectedRoaster, setSelectedRoaster] = useState<Roaster | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<DropStatus | null>(null);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter drops
  const filteredDrops = useMemo(() => {
    return state.drops.filter((drop) => {
      if (selectedOrigin && drop.origin !== selectedOrigin) return false;
      if (selectedProcess && drop.process !== selectedProcess) return false;
      if (selectedRoaster && drop.roaster !== selectedRoaster) return false;
      if (selectedStatus) {
        const status = getDropStatus(drop, state.reservations);
        if (status !== selectedStatus) return false;
      }
      return true;
    });
  }, [
    state.drops,
    state.reservations,
    selectedOrigin,
    selectedProcess,
    selectedRoaster,
    selectedStatus,
  ]);

  // Count drops by status
  const activeCount = useMemo(() => {
    return state.drops.filter(
      (drop) => getDropStatus(drop, state.reservations) === "ACTIVE"
    ).length;
  }, [state.drops, state.reservations]);

  const completedCount = useMemo(() => {
    return state.drops.filter(
      (drop) => getDropStatus(drop, state.reservations) === "COMPLETED"
    ).length;
  }, [state.drops, state.reservations]);

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Microlot Drops
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Cargando...
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Microlot Drops
            </h1>
            <Link
              href="/my"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Mis Reservas
            </Link>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Descubre microlotes exclusivos de café de especialidad de tostadores de toda
            Europa
          </p>

          {/* Counters */}
          <div className="flex gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Drops Activos
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeCount}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Drops Completados
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {completedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          selectedOrigin={selectedOrigin}
          selectedProcess={selectedProcess}
          selectedRoaster={selectedRoaster}
          selectedStatus={selectedStatus}
          onOriginChange={setSelectedOrigin}
          onProcessChange={setSelectedProcess}
          onRoasterChange={setSelectedRoaster}
          onStatusChange={setSelectedStatus}
        />

        {/* Results count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          Mostrando {filteredDrops.length} drop{filteredDrops.length !== 1 ? "s" : ""}
        </div>

        {/* Drops Grid */}
        {filteredDrops.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No se encontraron drops que coincidan con tus filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                reservations={state.reservations}
              />
            ))}
          </div>
        )}
      </main>
      <DemoHelpers />
    </div>
  );
}
