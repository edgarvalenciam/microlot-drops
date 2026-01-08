"use client";

import { use } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { getUserId } from "@/lib/user";
import { formatDate, formatCurrency } from "@/lib/format";

export default function PaymentsHistoryPage() {
  const { state } = useAppState();
  const userId = getUserId();

  // Get all payments for this user, sorted by date (newest first)
  const myPayments = state.payments
    .filter((p) => p.userId === userId)
    .sort((a, b) => {
      const dateA = a.confirmedAtISO || a.createdAtISO;
      const dateB = b.confirmedAtISO || b.createdAtISO;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const statusLabels: Record<string, string> = {
    INITIATED: "Iniciado",
    CONFIRMED: "Confirmado",
    FAILED: "Fallido",
  };

  const statusColors = {
    INITIATED:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    CONFIRMED:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Historial de Pagos
          </h1>
          <Link
            href="/my"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
          >
            Volver a Mis Reservas
          </Link>
        </div>

        {/* Payments Table */}
        {myPayments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 border border-gray-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Aún no hay pagos
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Tu historial de pagos aparecerá aquí una vez que completes una compra.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Explorar Drops
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Drop
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tostador
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {myPayments.map((payment) => {
                    const drop = state.drops.find((d) => d.id === payment.dropId);
                    const date = payment.confirmedAtISO || payment.createdAtISO;

                    return (
                      <tr
                        key={payment.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {drop ? (
                            <Link
                              href={`/drop/${drop.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {drop.name}
                            </Link>
                          ) : (
                            <span className="text-gray-400">Drop desconocido</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {drop ? drop.roaster : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[payment.status]}`}
                          >
                            {statusLabels[payment.status] || payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/receipt/${payment.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            Ver Recibo
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

