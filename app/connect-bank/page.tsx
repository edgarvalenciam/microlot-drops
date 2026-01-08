"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateProvider";
import { SPANISH_BANKS } from "@/data/catalogs";
import { nanoid } from "nanoid";

type WizardStep = 1 | 2 | 3;

function ConnectBankPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reservationId = searchParams.get("reservationId");
  const { state, addBankConnection } = useAppState();
  
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [fetchedAccounts, setFetchedAccounts] = useState<Array<{id: string; iban: string; displayName: string}>>([]);
  const [connectNewBank, setConnectNewBank] = useState(false);

  const connectedBanks = state.bankConnections.filter(b => b.status === "CONNECTED");
  const hasExistingConnections = connectedBanks.length > 0;

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

  // Step 1: Bank Selection
  const handleBankSelect = (bankId: string) => {
    setSelectedBankId(bankId);
  };

  const handleContinueFromStep1 = () => {
    if (!selectedBankId) {
      alert("Por favor selecciona un banco");
      return;
    }
    setStep(2);
  };

  // Step 2: Login
  const handleLogin = async () => {
    if (!username || username.length < 3) {
      alert("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }
    if (!password || password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    // Simulate login delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simulate fetching accounts
    const mockAccounts = [
      {
        id: nanoid(),
        iban: `ES91${Math.floor(Math.random() * 100000000000000000)}`,
        displayName: "Cuenta Corriente",
      },
      {
        id: nanoid(),
        iban: `ES91${Math.floor(Math.random() * 100000000000000000)}`,
        displayName: "Cuenta de Ahorros",
      },
    ];
    setFetchedAccounts(mockAccounts);
    setSelectedAccountId(mockAccounts[0].id); // Auto-select first account
    
    setIsLoading(false);
    setStep(3);
  };

  // Step 3: Success & Account Selection
  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleFinish = () => {
    if (!selectedBankId || !selectedAccountId) {
      alert("Please select an account");
      return;
    }

    const selectedBank = SPANISH_BANKS.find(b => b.id === selectedBankId);
    if (!selectedBank) return;

    if (fetchedAccounts.length === 0) {
      alert("No accounts available");
      return;
    }

    // Create bank connection with all fetched accounts
    const connection = addBankConnection({
      bankId: selectedBankId,
      bankName: selectedBank.name,
      status: "CONNECTED",
      accounts: fetchedAccounts,
    });
    setConnectionId(connection.id);

    // Redirect to consent page
    router.push(`/consent?reservationId=${reservationId}`);
  };

  // Handle "Use existing connection"
  const handleUseExisting = () => {
    router.push(`/consent?reservationId=${reservationId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Link */}
        <Link
          href={`/reserve/${reservationId}`}
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline mb-6"
        >
          ← Volver a la reserva
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Conecta Tu Banco
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Selecciona una cuenta bancaria para autorizar el compromiso de pago. Esta
            conexión es segura y utiliza tecnología regulada de Open Banking.
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-6">
            <div className={`flex items-center ${step >= 1 ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Seleccionar Banco</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`} />
            <div className={`flex items-center ${step >= 2 ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Iniciar Sesión</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`} />
            <div className={`flex items-center ${step >= 3 ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Éxito</span>
            </div>
          </div>
        </div>

        {/* Step 1: Bank Selection */}
        {step === 1 && (
          <>
            {hasExistingConnections && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Conexiones Existentes
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Tienes {connectedBanks.length} banco{connectedBanks.length > 1 ? "s" : ""} conectado{connectedBanks.length > 1 ? "s" : ""}.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleUseExisting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Usar Conexión Existente
                  </button>
                  <button
                    onClick={() => setConnectNewBank(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Conectar Otro Banco
                  </button>
                </div>
              </div>
            )}

            {(!hasExistingConnections || connectNewBank) && step === 1 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Selecciona Tu Banco
                </h2>
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>🔒 Conexión Segura:</strong> Utilizamos un proveedor regulado de Open Banking
                    para conectar de forma segura tu cuenta bancaria. Tus credenciales
                    nunca se comparten con nosotros.
                  </p>
                </div>
                <div className="space-y-3">
                  {SPANISH_BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => handleBankSelect(bank.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedBankId === bank.id
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {bank.name}
                        </div>
                        {selectedBankId === bank.id && (
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
            )}

            {(!hasExistingConnections || connectNewBank) && step === 1 && (
              <div className="flex gap-4">
                <Link
                  href={`/reserve/${reservationId}`}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors text-center"
                >
                  Cancelar
                </Link>
                <button
                  onClick={handleContinueFromStep1}
                  disabled={!selectedBankId}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}
          </>
        )}

        {/* Step 2: Login */}
        {step === 2 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Iniciar Sesión en {SPANISH_BANKS.find(b => b.id === selectedBankId)?.name}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingresa tu nombre de usuario"
                    disabled={isLoading}
                  />
                  {username && username.length < 3 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      El nombre de usuario debe tener al menos 3 caracteres
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingresa tu contraseña"
                    disabled={isLoading}
                  />
                  {password && password.length < 6 && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      La contraseña debe tener al menos 6 caracteres
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
                disabled={isLoading}
              >
                Atrás
              </button>
              <button
                onClick={handleLogin}
                disabled={isLoading || !username || username.length < 3 || !password || password.length < 6}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? "Conectando..." : "Iniciar Sesión"}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Success & Account Selection */}
        {step === 3 && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Conexión Exitosa!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Tu cuenta de {SPANISH_BANKS.find(b => b.id === selectedBankId)?.name} ha sido conectada.
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Selecciona una Cuenta
                </h3>
                <div className="space-y-3">
                  {fetchedAccounts.map((account) => (
                        <button
                          key={account.id}
                          onClick={() => handleAccountSelect(account.id)}
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
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleFinish}
                disabled={!selectedAccountId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Continuar
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ConnectBankPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <ConnectBankPageContent />
    </Suspense>
  );
}
