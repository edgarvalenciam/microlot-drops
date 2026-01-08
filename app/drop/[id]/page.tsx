"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateProvider";
import { DropProgressBar } from "@/components/DropProgressBar";
import { PaymentButton } from "@/components/PaymentButton";
import { DemoHelpers } from "@/components/DemoHelpers";
import { getDropStatus, canPay, getDropReservedGrams, getDropCapGrams, getDropAvailableGrams } from "@/lib/compute";
import { getUserId } from "@/lib/user";
import { formatDate, formatDateRelative, formatCurrency, formatGrams } from "@/lib/format";
import { ORIGIN_COLORS, PROCESS_COLORS, ROASTER_COLORS } from "@/lib/colors";
import type { DropStatus } from "@/types";

export default function DropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { state, confirmPaymentForReservation } = useAppState();
  const userId = getUserId();

  const drop = state.drops.find((d) => d.id === id);

  if (!drop) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Drop no encontrado
          </h1>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Volver al feed de drops
          </Link>
        </div>
      </div>
    );
  }

  const status = getDropStatus(drop, state.reservations);
  const reservedGrams = getDropReservedGrams(drop.id, state.reservations);
  const capGrams = getDropCapGrams(drop);
  const availableGrams = getDropAvailableGrams(drop, state.reservations);
  const isSoldOut = availableGrams <= 0;

  // Find user's reservation and commitment for this drop
  const userReservation = state.reservations.find(
    (r) => r.dropId === drop.id && r.userId === userId && r.status === "ACTIVE"
  );
  const userCommitment = userReservation
    ? state.commitments.find(
        (c) =>
          c.reservationId === userReservation.id &&
          c.userId === userId &&
          c.status === "ACTIVE"
      )
    : undefined;

  const canUserPay = userReservation && userCommitment
    ? canPay(drop, userReservation, userCommitment)
    : false;

  const handlePay = async (): Promise<string> => {
    if (!userReservation || !userCommitment) {
      throw new Error("Reservation or commitment not found");
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Idempotent payment confirmation: creates payment if missing, then confirms it
    const paymentId = confirmPaymentForReservation({
      reservationId: userReservation.id,
      commitmentId: userCommitment.id,
      dropId: drop.id,
      userId,
      amount: drop.prices[userReservation.size],
      beneficiary: `Microlot Drops (for ${drop.roaster})`,
      reference: `Microlot Drop — ${drop.name}`,
    });

    // Return payment ID for redirect (handled by PaymentButton)
    return paymentId;
  };

  const statusLabels: Record<DropStatus, string> = {
    ACTIVE: "ACTIVO",
    COMPLETED: "COMPLETADO",
    EXPIRED: "CADUCADO",
  };

  const statusColors: Record<DropStatus, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    COMPLETED:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  };

  const originColor = ORIGIN_COLORS[drop.origin];
  const processColor = PROCESS_COLORS[drop.process];
  const roasterColor = ROASTER_COLORS[drop.roaster];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Volver a drops
        </Link>

        {/* Hero Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {drop.name}
              </h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className="px-3 py-1 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: originColor }}
                >
                  {drop.origin}
                </span>
                <span
                  className="px-3 py-1 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: processColor }}
                >
                  {drop.process}
                </span>
                <span
                  className="px-3 py-1 rounded-md text-sm font-medium text-white"
                  style={{ backgroundColor: roasterColor }}
                >
                  {drop.roaster}
                </span>
                <span
                  className={`px-3 py-1 rounded-md text-sm font-semibold ${statusColors[status]}`}
                >
                  {statusLabels[status]}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <DropProgressBar drop={drop} reservations={state.reservations} />
          </div>

          {/* Goal & Deadline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Objetivo
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatGrams(drop.goalGrams)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatGrams(reservedGrams)} reservados
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Máx {formatGrams(capGrams)} (115%)
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Fecha Límite
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatDate(drop.deadlineISO)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatDateRelative(drop.deadlineISO)}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Precios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  250g
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(drop.prices["250g"])}
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  500g
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(drop.prices["500g"])}
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  1kg
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(drop.prices["1kg"])}
                </div>
              </div>
            </div>
          </div>

          {/* Tasting Notes */}
          {drop.tastingNotes && drop.tastingNotes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Notas de Cata
              </h2>
              <div className="flex flex-wrap gap-2">
                {drop.tastingNotes.map((note, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Roast Date */}
          {drop.roastDateEstimateISO && (
            <div className="mb-8">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Fecha Estimada de Tostado
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatDate(drop.roastDateEstimateISO)}
              </div>
            </div>
          )}

          {/* CTA */}
          {status === "ACTIVE" && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              {isSoldOut ? (
                <div className="inline-block bg-gray-400 cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg text-center">
                  Agotado / Límite alcanzado
                </div>
              ) : (
                <Link
                  href={`/reserve/${drop.id}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-center"
                >
                  Reservar mi bolsa
                </Link>
              )}
            </div>
          )}

          {/* Payment Button - Show if drop is COMPLETED and user has active commitment */}
          {canUserPay && userReservation && userCommitment && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Completa Tu Compra
              </h3>
              <PaymentButton
                drop={drop}
                reservation={userReservation}
                commitment={userCommitment}
                onPay={handlePay}
              />
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cómo funciona
          </h2>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                1. Reserva tu bolsa
              </h3>
              <p>
                Elige tu tamaño, preferencia de molido y método de entrega. Tu
                reserva es gratuita y garantiza tu lugar.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                2. Autoriza el compromiso de pago
              </h3>
              <p>
                Conecta tu banco y autoriza un compromiso de pago. Esto
                nos permite cobrarte solo si el drop se completa.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                3. Paga solo si se completa
              </h3>
              <p>
                Solo se te cobrará si el drop alcanza su objetivo ({formatGrams(drop.goalGrams)}) antes de la fecha límite ({formatDate(drop.deadlineISO)}).
                Si no se completa, no se realiza ningún cargo y tu
                reserva se cancela automáticamente.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                4. Disfruta tu café
              </h3>
              <p>
                Una vez que el drop se complete y el pago se confirme, tostaremos
                y enviaremos tu café a tu puerta.
              </p>
            </div>
          </div>
        </div>
      </main>
      <DemoHelpers dropId={drop.id} />
    </div>
  );
}

