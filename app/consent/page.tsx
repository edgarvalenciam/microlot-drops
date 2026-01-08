"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { CommitmentSummary } from "@/components/CommitmentSummary";
import { getUserId } from "@/lib/user";
import { formatDate, formatGrams } from "@/lib/format";
import type { BankConnection } from "@/types";

function ConsentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = searchParams.get("reservationId");
  const { state, addCommitment } = useAppState();

  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToCondition, setAgreedToCondition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBankConnectionId, setSelectedBankConnectionId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const connectedBanks = state.bankConnections.filter(b => b.status === "CONNECTED");

  // Redirect if no connected banks
  useEffect(() => {
    if (connectedBanks.length === 0 && reservationId) {
      router.push(`/connect-bank?reservationId=${reservationId}`);
    } else if (connectedBanks.length > 0 && !selectedBankConnectionId) {
      // Auto-select first bank and first account
      const firstBank = connectedBanks[0];
      setSelectedBankConnectionId(firstBank.id);
      if (firstBank.accounts.length > 0) {
        setSelectedAccountId(firstBank.accounts[0].id);
      }
    }
  }, [connectedBanks, reservationId, router, selectedBankConnectionId]);

  if (!reservationId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Se requiere ID de reserva
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

  // Redirect if no connected banks (handled by useEffect, but show loading state)
  if (connectedBanks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirigiendo a la conexión bancaria...</p>
        </div>
      </div>
    );
  }

  const reservation = state.reservations.find((r) => r.id === reservationId);
  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Reserva no encontrada
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

  const drop = state.drops.find((d) => d.id === reservation.dropId);
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

  // Calculate commitment values (price per bag * quantity)
  const maxAmount = drop.prices[reservation.size] * reservation.quantity;
  const deadline = new Date(drop.deadlineISO);
  const validUntil = new Date(deadline);
  validUntil.setHours(validUntil.getHours() + 24);

  const condition = `Charge only if ${formatGrams(drop.goalGrams)} are reserved before ${formatDate(drop.deadlineISO)}`;

  const selectedBankConnection = connectedBanks.find(b => b.id === selectedBankConnectionId);
  const availableAccounts = selectedBankConnection?.accounts || [];

  const handleBankChange = (bankId: string) => {
    setSelectedBankConnectionId(bankId);
    const bank = connectedBanks.find(b => b.id === bankId);
    if (bank && bank.accounts.length > 0) {
      setSelectedAccountId(bank.accounts[0].id);
    } else {
      setSelectedAccountId(null);
    }
  };

  const handleAuthorize = async () => {
    if (!agreedToPrivacy || !agreedToCondition) {
      alert("Por favor acepta todos los términos para continuar");
      return;
    }

    if (!selectedAccountId) {
      alert("Por favor selecciona una cuenta");
      return;
    }

    setIsLoading(true);

    try {
      const userId = getUserId();
      
      addCommitment({
        reservationId: reservation.id,
        userId,
        maxAmount,
        validUntilISO: validUntil.toISOString(),
        condition,
        selectedAccountId: selectedAccountId,
        status: "ACTIVE",
      });

      // Redirect to profile page after short delay
      setTimeout(() => {
        router.push("/my");
      }, 500);
    } catch (error) {
      console.error("Error creating commitment:", error);
      alert("Error al autorizar el compromiso. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = agreedToPrivacy && agreedToCondition && !isLoading && selectedAccountId !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Link */}
        <Link
          href={`/connect-bank?reservationId=${reservationId}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Volver a la selección de banco
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Autorizar Compromiso de Pago
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Por favor revisa los detalles del compromiso de pago y autoriza la
            transacción a continuación.
          </p>
        </div>

        {/* Bank & Account Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Seleccionar Cuenta Bancaria
          </h2>
          
          {/* Bank Selection */}
          {connectedBanks.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Banco
              </label>
              <select
                value={selectedBankConnectionId || ""}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {connectedBanks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.bankName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cuenta
            </label>
            <div className="space-y-3">
              {availableAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAccountId === account.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {account.displayName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {account.iban}
                      </div>
                    </div>
                    {selectedAccountId === account.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
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
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Commitment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <CommitmentSummary
            drop={drop}
            reservation={reservation}
            selectedAccountId={selectedAccountId || undefined}
            bankConnections={connectedBanks}
          />
        </div>

        {/* Checkboxes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Acepto la{" "}
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                política de privacidad
              </a>{" "}
              y consiento el procesamiento de datos con fines de pago.
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToCondition}
              onChange={(e) => setAgreedToCondition(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Entiendo que{" "}
              <strong>no se realizará ningún cargo</strong> si el drop no se
              completa antes de la fecha límite.
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href={`/connect-bank?reservationId=${reservationId}`}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            onClick={handleAuthorize}
            disabled={!canSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? "Autorizando..." : "Autorizar Compromiso"}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function ConsentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ConsentPageContent />
    </Suspense>
  );
}

