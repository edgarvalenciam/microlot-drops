"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/AppStateProvider";
import { ConfirmModal } from "@/components/ConfirmModal";
import { PaymentButton } from "@/components/PaymentButton";
import { getDropStatus, canPay } from "@/lib/compute";
import { getUserId } from "@/lib/user";
import { formatDate, formatDateRelative } from "@/lib/format";
import { formatCurrency } from "@/lib/format";
import { ORIGIN_COLORS, PROCESS_COLORS, ROASTER_COLORS } from "@/lib/colors";

export default function MyProfilePage() {
  const router = useRouter();
  const { state, confirmPaymentForReservation, updateCommitment, updateReservation } = useAppState();
  const userId = getUserId();
  const [cancelReservationId, setCancelReservationId] = useState<
    string | null
  >(null);
  const [revokeCommitmentId, setRevokeCommitmentId] = useState<
    string | null
  >(null);

  const myReservations = state.reservations.filter(
    (r) => r.userId === userId && r.status === "ACTIVE"
  );

  const myCanceledReservations = state.reservations.filter(
    (r) => r.userId === userId && r.status === "CANCELED"
  );

  const myFulfilledReservations = state.reservations.filter(
    (r) => r.userId === userId && r.status === "FULFILLED"
  );

  // Commitments
  const myActiveCommitments = state.commitments.filter(
    (c) => c.userId === userId && c.status === "ACTIVE"
  );

  const myUsedCommitments = state.commitments.filter(
    (c) => c.userId === userId && c.status === "USED"
  );

  const myRevokedCommitments = state.commitments.filter(
    (c) => c.userId === userId && c.status === "REVOKED"
  );

  const handleRevokeCommitment = (commitmentId: string) => {
    updateCommitment(commitmentId, { status: "REVOKED" });
    setRevokeCommitmentId(null);
  };

  const getCommitmentReservation = (reservationId: string) => {
    return state.reservations.find((r) => r.id === reservationId);
  };

  const handleCancelReservation = (reservationId: string) => {
    const reservation = state.reservations.find((r) => r.id === reservationId);
    if (!reservation) return;

    const drop = state.drops.find((d) => d.id === reservation.dropId);
    if (!drop) return;

    // Check if deadline has passed
    const deadline = new Date(drop.deadlineISO);
    const now = new Date();

    if (now > deadline) {
      alert("Cannot cancel reservation after the deadline has passed.");
      setCancelReservationId(null);
      return;
    }

    updateReservation(reservationId, { status: "CANCELED" });
    setCancelReservationId(null);
  };

  const getReservationDrop = (dropId: string) => {
    return state.drops.find((d) => d.id === dropId);
  };

  const reservationToCancel =
    cancelReservationId &&
    state.reservations.find((r) => r.id === cancelReservationId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            My Reservations
          </h1>
          <div className="flex gap-3">
            <Link
              href="/my/payments"
              className="px-4 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 font-semibold rounded-lg transition-colors"
            >
              Payments
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
            >
              Browse Drops
            </Link>
          </div>
        </div>

        {/* Active Commitments */}
        {myActiveCommitments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Active Payment Commitments ({myActiveCommitments.length})
            </h2>
            <div className="space-y-4">
              {myActiveCommitments.map((commitment) => {
                const reservation = getCommitmentReservation(
                  commitment.reservationId
                );
                if (!reservation) return null;

                const drop = getReservationDrop(reservation.dropId);
                if (!drop) return null;

                const dropStatus = getDropStatus(drop, state.reservations);
                const canUserPayForThis = canPay(drop, reservation, commitment);

                const handlePay = async (): Promise<string> => {
                  // Simulate payment processing delay
                  await new Promise((resolve) => setTimeout(resolve, 1500));

                  // Idempotent payment confirmation: creates payment if missing, then confirms it
                  const paymentId = confirmPaymentForReservation({
                    reservationId: reservation.id,
                    commitmentId: commitment.id,
                    dropId: drop.id,
                    userId,
                    amount: drop.prices[reservation.size],
                    beneficiary: `Microlot Drops (for ${drop.roaster})`,
                    reference: `Microlot Drop — ${drop.name}`,
                  });

                  return paymentId;
                };

                return (
                  <div
                    key={commitment.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/drop/${drop.id}`}
                          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2 block"
                        >
                          {drop.name}
                        </Link>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <strong>Maximum Amount:</strong>{" "}
                            {formatCurrency(commitment.maxAmount)}
                          </p>
                          <p>
                            <strong>Valid Until:</strong>{" "}
                            {formatDate(commitment.validUntilISO)}
                          </p>
                          <p>
                            <strong>Drop Status:</strong>{" "}
                            <span
                              className={`font-semibold ${
                                dropStatus === "COMPLETED"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : dropStatus === "EXPIRED"
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {dropStatus}
                            </span>
                          </p>
                          <p>
                            <strong>Condition:</strong> {commitment.condition}
                          </p>
                          {commitment.selectedAccountId && (
                            <p>
                              <strong>Account:</strong>{" "}
                              {commitment.selectedAccountId}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {canUserPayForThis && (
                          <div className="mb-2">
                            <PaymentButton
                              drop={drop}
                              reservation={reservation}
                              commitment={commitment}
                              onPay={handlePay}
                            />
                          </div>
                        )}
                        <button
                          onClick={() => setRevokeCommitmentId(commitment.id)}
                          className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors font-medium text-sm"
                        >
                          Revoke Commitment
                        </button>
                        <Link
                          href={`/drop/${drop.id}`}
                          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors font-medium text-sm text-center"
                        >
                          View Drop
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Reservations */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Active Reservations ({myReservations.length})
          </h2>
          {myReservations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                You don&apos;t have any active reservations yet.
              </p>
              <Link
                href="/"
                className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Browse drops
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myReservations.map((reservation) => {
                const drop = getReservationDrop(reservation.dropId);
                if (!drop) return null;

                const status = getDropStatus(drop, state.reservations);
                const price = drop.prices[reservation.size];
                const deadline = new Date(drop.deadlineISO);
                const now = new Date();
                const canCancel = now <= deadline;

                // Check if reservation has an active commitment
                const hasActiveCommitment = state.commitments.some(
                  (c) =>
                    c.reservationId === reservation.id && c.status === "ACTIVE"
                );

                return (
                  <div
                    key={reservation.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/drop/${drop.id}`}
                          className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2 block"
                        >
                          {drop.name}
                        </Link>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className="px-2 py-1 rounded-md text-xs font-medium text-white"
                            style={{
                              backgroundColor: ORIGIN_COLORS[drop.origin],
                            }}
                          >
                            {drop.origin}
                          </span>
                          <span
                            className="px-2 py-1 rounded-md text-xs font-medium text-white"
                            style={{
                              backgroundColor: PROCESS_COLORS[drop.process],
                            }}
                          >
                            {drop.process}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <strong>Size:</strong> {reservation.size}
                          </p>
                          <p>
                            <strong>Grind:</strong>{" "}
                            {reservation.grind.charAt(0).toUpperCase() +
                              reservation.grind.slice(1)}
                          </p>
                          <p>
                            <strong>Delivery:</strong>{" "}
                            {reservation.delivery.charAt(0).toUpperCase() +
                              reservation.delivery.slice(1)}
                          </p>
                          <p>
                            <strong>Price:</strong> {formatCurrency(price)}
                          </p>
                          <p>
                            <strong>Deadline:</strong> {formatDate(drop.deadlineISO)}{" "}
                            ({formatDateRelative(drop.deadlineISO)})
                          </p>
                          <p>
                            <strong>Drop Status:</strong>{" "}
                            <span
                              className={`font-semibold ${
                                status === "COMPLETED"
                                  ? "text-blue-600 dark:text-blue-400"
                                  : status === "EXPIRED"
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {status}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {!hasActiveCommitment && (
                          <Link
                            href={`/connect-bank?reservationId=${reservation.id}`}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm text-center"
                          >
                            Connect Bank & Authorize
                          </Link>
                        )}
                        {hasActiveCommitment && (() => {
                          const commitment = state.commitments.find(
                            (c) =>
                              c.reservationId === reservation.id &&
                              c.userId === userId &&
                              c.status === "ACTIVE"
                          );
                          const canUserPayForThis =
                            commitment &&
                            canPay(drop, reservation, commitment);

                          if (canUserPayForThis && commitment) {
                            const handlePay = async (): Promise<string> => {
                              // Simulate payment processing delay
                              await new Promise((resolve) =>
                                setTimeout(resolve, 1500)
                              );

                              // Idempotent payment confirmation: creates payment if missing, then confirms it
                              const paymentId = confirmPaymentForReservation({
                                reservationId: reservation.id,
                                commitmentId: commitment.id,
                                dropId: drop.id,
                                userId,
                                amount: drop.prices[reservation.size],
                                beneficiary: `Microlot Drops (for ${drop.roaster})`,
                                reference: `Microlot Drop — ${drop.name}`,
                              });

                              return paymentId;
                            };

                            return (
                              <div className="mb-2">
                                <PaymentButton
                                  drop={drop}
                                  reservation={reservation}
                                  commitment={commitment}
                                  onPay={handlePay}
                                />
                              </div>
                            );
                          }

                          return (
                            <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg font-medium text-sm text-center">
                              ✓ Commitment Active
                            </span>
                          );
                        })()}
                        {canCancel && (
                          <button
                            onClick={() => setCancelReservationId(reservation.id)}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors font-medium text-sm"
                          >
                            Cancel Reservation
                          </button>
                        )}
                        <Link
                          href={`/drop/${drop.id}`}
                          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors font-medium text-sm text-center"
                        >
                          View Drop
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fulfilled Reservations */}
        {myFulfilledReservations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Fulfilled Reservations ({myFulfilledReservations.length})
            </h2>
            <div className="space-y-4">
              {myFulfilledReservations.map((reservation) => {
                const drop = getReservationDrop(reservation.dropId);
                if (!drop) return null;

                const price = drop.prices[reservation.size];

                return (
                  <div
                    key={reservation.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {drop.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <strong>Size:</strong> {reservation.size} |{" "}
                            <strong>Price:</strong> {formatCurrency(price)}
                          </p>
                          <p>
                            <strong>Fulfilled:</strong>{" "}
                            {reservation.createdAtISO
                              ? formatDate(reservation.createdAtISO)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                        FULFILLED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Canceled Reservations */}
        {myCanceledReservations.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Canceled Reservations ({myCanceledReservations.length})
            </h2>
            <div className="space-y-4">
              {myCanceledReservations.map((reservation) => {
                const drop = getReservationDrop(reservation.dropId);
                if (!drop) return null;

                return (
                  <div
                    key={reservation.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 opacity-60"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {drop.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Canceled on{" "}
                          {reservation.createdAtISO
                            ? formatDate(reservation.createdAtISO)
                            : "N/A"}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold">
                        CANCELED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Used Commitments */}
        {myUsedCommitments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Used Commitments ({myUsedCommitments.length})
            </h2>
            <div className="space-y-4">
              {myUsedCommitments.map((commitment) => {
                const reservation = getCommitmentReservation(
                  commitment.reservationId
                );
                if (!reservation) return null;

                const drop = getReservationDrop(reservation.dropId);
                if (!drop) return null;

                return (
                  <div
                    key={commitment.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {drop.name}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            <strong>Amount:</strong>{" "}
                            {formatCurrency(commitment.maxAmount)}
                          </p>
                          <p>
                            <strong>Used on:</strong>{" "}
                            {commitment.createdAtISO
                              ? formatDate(commitment.createdAtISO)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                        USED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Revoked Commitments */}
        {myRevokedCommitments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Revoked Commitments ({myRevokedCommitments.length})
            </h2>
            <div className="space-y-4">
              {myRevokedCommitments.map((commitment) => {
                const reservation = getCommitmentReservation(
                  commitment.reservationId
                );
                if (!reservation) return null;

                const drop = getReservationDrop(reservation.dropId);
                if (!drop) return null;

                return (
                  <div
                    key={commitment.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 opacity-60"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {drop.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Revoked on{" "}
                          {commitment.createdAtISO
                            ? formatDate(commitment.createdAtISO)
                            : "N/A"}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-semibold">
                        REVOKED
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cancel Reservation Confirmation Modal */}
        {reservationToCancel && (
          <ConfirmModal
            isOpen={!!cancelReservationId}
            title="Cancel Reservation"
            message={`Are you sure you want to cancel your reservation for ${getReservationDrop(reservationToCancel.dropId)?.name}? This action cannot be undone.`}
            confirmText="Cancel Reservation"
            cancelText="Keep Reservation"
            variant="danger"
            onConfirm={() => handleCancelReservation(reservationToCancel.id)}
            onCancel={() => setCancelReservationId(null)}
          />
        )}

        {/* Revoke Commitment Confirmation Modal */}
        {revokeCommitmentId && (
          <ConfirmModal
            isOpen={!!revokeCommitmentId}
            title="Revoke Payment Commitment"
            message="Are you sure you want to revoke this payment commitment? You will not be able to pay if the drop completes unless you create a new commitment."
            confirmText="Revoke Commitment"
            cancelText="Keep Commitment"
            variant="danger"
            onConfirm={() => handleRevokeCommitment(revokeCommitmentId)}
            onCancel={() => setRevokeCommitmentId(null)}
          />
        )}
      </main>
    </div>
  );
}

