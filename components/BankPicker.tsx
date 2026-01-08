"use client";

import { useState } from "react";

interface BankAccount {
  id: string;
  bankName: string;
  accountType: string;
  accountNumber: string; // Last 4 digits
  balance?: number;
}

interface BankPickerProps {
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
}

// Simulated bank accounts
const SIMULATED_ACCOUNTS: BankAccount[] = [
  {
    id: "acc-1",
    bankName: "BBVA",
    accountType: "Current Account",
    accountNumber: "****1234",
    balance: 1250.0,
  },
  {
    id: "acc-2",
    bankName: "Santander",
    accountType: "Savings Account",
    accountNumber: "****5678",
    balance: 3450.75,
  },
  {
    id: "acc-3",
    bankName: "CaixaBank",
    accountType: "Current Account",
    accountNumber: "****9012",
    balance: 890.50,
  },
];

export function BankPicker({
  selectedAccountId,
  onSelectAccount,
}: BankPickerProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>🔒 Secure Connection:</strong> We use a regulated Open Banking
          provider to securely connect your bank account. Your credentials are
          never shared with us.
        </p>
      </div>

      <div className="space-y-3">
        {SIMULATED_ACCOUNTS.map((account) => (
          <button
            key={account.id}
            onClick={() => onSelectAccount(account.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAccountId === account.id
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900"
                : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {account.bankName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {account.accountType} • {account.accountNumber}
                </div>
                {account.balance !== undefined && (
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Balance: €{account.balance.toFixed(2)}
                  </div>
                )}
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

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        This is a simulated bank connection. In production, you would see your
        actual bank accounts via Open Banking.
      </p>
    </div>
  );
}

