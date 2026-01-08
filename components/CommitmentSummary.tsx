"use client";

import type { Drop, Reservation, Commitment, BankConnection } from "@/types";
import { formatDate, formatCurrency, formatGrams } from "@/lib/format";

interface CommitmentSummaryProps {
  drop: Drop;
  reservation: Reservation;
  commitment?: Commitment;
  selectedAccountId?: string;
  bankConnections?: BankConnection[];
}

export function CommitmentSummary({
  drop,
  reservation,
  commitment,
  selectedAccountId,
  bankConnections = [],
}: CommitmentSummaryProps) {
  // Calculate max amount (price per bag * quantity)
  const maxAmount = drop.prices[reservation.size] * reservation.quantity;
  
  // Calculate validity: deadline + 24 hours
  const deadline = new Date(drop.deadlineISO);
  const validUntil = new Date(deadline);
  validUntil.setHours(validUntil.getHours() + 24);

  const beneficiary = `Microlot Drops (for ${drop.roaster})`;

  // Get account info from bankConnections
  const accountInfo = selectedAccountId
    ? (() => {
        for (const connection of bankConnections) {
          const account = connection.accounts.find(a => a.id === selectedAccountId);
          if (account) {
            return {
              id: account.id,
              bankName: connection.bankName,
              accountNumber: account.iban,
              displayName: account.displayName,
            };
          }
        }
        // Fallback to old hardcoded lookup for backwards compatibility
        return {
          id: selectedAccountId,
          bankName: getBankName(selectedAccountId),
          accountNumber: getAccountNumber(selectedAccountId),
          displayName: undefined,
        };
      })()
    : null;

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Resumen del Compromiso de Pago
      </h3>

      {/* Beneficiary */}
      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Beneficiario
        </div>
        <div className="text-base text-gray-900 dark:text-white">
          {beneficiary}
        </div>
      </div>

      {/* Max Amount */}
      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Cantidad Máxima
        </div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(maxAmount)}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {reservation.quantity} × {reservation.size} @ {formatCurrency(drop.prices[reservation.size])} cada uno
        </div>
      </div>

      {/* Validity */}
      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Válido Hasta
        </div>
        <div className="text-base text-gray-900 dark:text-white">
          {formatDate(validUntil.toISOString())}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          24 horas después de la fecha límite del drop
        </div>
      </div>

      {/* Condition - Most Important */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
        <div className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Condición de Pago
        </div>
        <div className="text-sm text-yellow-900 dark:text-yellow-100">
          Solo se te <strong>cobrará</strong> si el drop alcanza su objetivo
          de <strong>{formatGrams(drop.goalGrams)}</strong> antes de la fecha límite
          del <strong>{formatDate(drop.deadlineISO)}</strong>.
        </div>
        <div className="text-xs text-yellow-800 dark:text-yellow-200 mt-2">
          Si el drop no se completa, no se realizará ningún cargo y tu
          reserva se cancelará automáticamente.
        </div>
      </div>

      {/* Selected Account */}
      {accountInfo && (
        <div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Cuenta Seleccionada
          </div>
          <div className="text-base text-gray-900 dark:text-white">
            {accountInfo.bankName} • {accountInfo.displayName || accountInfo.accountNumber}
          </div>
          {accountInfo.displayName && (
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {accountInfo.accountNumber}
            </div>
          )}
        </div>
      )}

      {/* Reference */}
      <div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          Referencia
        </div>
        <div className="text-base text-gray-900 dark:text-white font-mono">
          Microlot Drop — {drop.name}
        </div>
      </div>
    </div>
  );
}

// Helper functions to get account info from ID
function getBankName(accountId: string): string {
  const bankMap: Record<string, string> = {
    "acc-1": "BBVA",
    "acc-2": "Santander",
    "acc-3": "CaixaBank",
  };
  return bankMap[accountId] || "Unknown Bank";
}

function getAccountNumber(accountId: string): string {
  const accountMap: Record<string, string> = {
    "acc-1": "****1234",
    "acc-2": "****5678",
    "acc-3": "****9012",
  };
  return accountMap[accountId] || "****0000";
}

