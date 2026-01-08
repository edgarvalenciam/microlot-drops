"use client";

import Link from "next/link";
import type { Drop, Reservation } from "@/types";
import { getDropStatus, getDropProgress, getDropReservedGrams } from "@/lib/compute";
import { formatDate, formatGrams } from "@/lib/format";
import { ORIGIN_COLORS, PROCESS_COLORS } from "@/lib/colors";

interface DropsTableProps {
  drops: Drop[];
  reservations: Reservation[];
  onDelete?: (dropId: string) => void;
}

export function DropsTable({
  drops,
  reservations,
  onDelete,
}: DropsTableProps) {
  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    COMPLETED: "Completado",
    EXPIRED: "Caducado",
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nombre del Drop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Origen / Proceso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Progreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fecha Límite
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {drops.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No se encontraron drops
                </td>
              </tr>
            ) : (
              drops.map((drop) => {
                const status = getDropStatus(drop, reservations);
                const progress = getDropProgress(drop, reservations);
                const reservedGrams = getDropReservedGrams(drop.id, reservations);

                return (
                  <tr
                    key={drop.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {drop.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{
                            backgroundColor: ORIGIN_COLORS[drop.origin],
                          }}
                        >
                          {drop.origin}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{
                            backgroundColor: PROCESS_COLORS[drop.process],
                          }}
                        >
                          {drop.process}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatGrams(reservedGrams)} / {formatGrams(drop.goalGrams)} ({progress}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                      >
                        {statusLabels[status] || status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(drop.deadlineISO)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/roaster/drops/${drop.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          Editar
                        </Link>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(drop.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
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

