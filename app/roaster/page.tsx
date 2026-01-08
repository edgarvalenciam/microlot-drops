"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useAppState } from "@/context/AppStateProvider";
import { RoasterKpiCards } from "@/components/RoasterKpiCards";
import { DropsTable } from "@/components/DropsTable";
import { DonutChart } from "@/components/DonutChart";
import { DemoHelpers } from "@/components/DemoHelpers";
import { computeRoasterKPIs } from "@/lib/compute";
import { ORIGIN_COLORS, PROCESS_COLORS } from "@/lib/colors";
import type { Roaster } from "@/types";

// For MVP, we'll use a fixed roaster ID
// In production, this would come from authentication
const CURRENT_ROASTER: Roaster = "Nomad Coffee";

export default function RoasterDashboardPage() {
  const { state } = useAppState();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute KPIs for current roaster
  const kpis = useMemo(
    () =>
      computeRoasterKPIs(
        CURRENT_ROASTER,
        state.drops,
        state.reservations,
        state.payments,
        state.payouts
      ),
    [state.drops, state.reservations, state.payments, state.payouts]
  );

  // Get roaster's drops
  const roasterDrops = useMemo(
    () => state.drops.filter((d) => d.roaster === CURRENT_ROASTER),
    [state.drops]
  );

  // Prepare chart data - sales by origin
  const chartDataByOrigin = useMemo(() => {
    const originSales: Record<string, number> = {};
    
    state.payments
      .filter((p) => p.status === "CONFIRMED")
      .forEach((payment) => {
        const drop = state.drops.find((d) => d.id === payment.dropId);
        if (drop && drop.roaster === CURRENT_ROASTER) {
          originSales[drop.origin] = (originSales[drop.origin] || 0) + payment.amount;
        }
      });

    return Object.entries(originSales).map(([origin, value]) => ({
      name: origin,
      value,
      color: ORIGIN_COLORS[origin as keyof typeof ORIGIN_COLORS] || "#8884d8",
    }));
  }, [state.payments, state.drops]);

  // Prepare chart data - sales by process
  const chartDataByProcess = useMemo(() => {
    const processSales: Record<string, number> = {};
    
    state.payments
      .filter((p) => p.status === "CONFIRMED")
      .forEach((payment) => {
        const drop = state.drops.find((d) => d.id === payment.dropId);
        if (drop && drop.roaster === CURRENT_ROASTER) {
          processSales[drop.process] = (processSales[drop.process] || 0) + payment.amount;
        }
      });

    return Object.entries(processSales).map(([process, value]) => ({
      name: process,
      value,
      color: PROCESS_COLORS[process as keyof typeof PROCESS_COLORS] || "#8884d8",
    }));
  }, [state.payments, state.drops]);

  // Show loading state during SSR/hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black">
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Roaster Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Panel de Tostador
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {CURRENT_ROASTER}
            </p>
          </div>
          <Link
            href="/roaster/drops/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Crear Nuevo Drop
          </Link>
        </div>

        {/* KPI Cards */}
        <RoasterKpiCards kpis={kpis} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DonutChart
            data={chartDataByOrigin}
            title="Ventas por Origen"
          />
          <DonutChart
            data={chartDataByProcess}
            title="Ventas por Proceso"
          />
        </div>

        {/* Drops Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Mis Drops ({roasterDrops.length})
          </h2>
          <DropsTable
            drops={roasterDrops}
            reservations={state.reservations}
          />
        </div>
      </main>
      <DemoHelpers />
    </div>
  );
}

