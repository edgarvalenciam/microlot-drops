// Domain types for Microlot Drops

export type Origin =
  | "Brazil"
  | "Burundi"
  | "Colombia"
  | "Costa Rica"
  | "El Salvador"
  | "Ethiopia"
  | "Guatemala"
  | "Honduras"
  | "Indonesia"
  | "Kenya"
  | "Nicaragua"
  | "Panama"
  | "Peru"
  | "Rwanda"
  | "Tanzania"
  | "Uganda"
  | "Yemen";

export type Process =
  | "Anaerobic"
  | "Carbonic Maceration"
  | "Double Washed"
  | "Extended Fermentation"
  | "Honey"
  | "Natural"
  | "Thermal Shock"
  | "Washed"
  | "Yeast Inoculated";

export type Roaster =
  | "Coffee Mori"
  | "D·Origen Coffee Roasters"
  | "Factoría 77"
  | "Hola Coffee Roasters"
  | "Ineffable Coffee"
  | "Kima Coffee"
  | "Lezzato"
  | "Nomad Coffee"
  | "Puchero"
  | "Right Side Coffee"
  | "Sakona Coffee Roasters"
  | "Zeri's Coffee Roaster";

export type DropStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";

export type ReservationStatus = "ACTIVE" | "CANCELED" | "FULFILLED";

export type CommitmentStatus = "ACTIVE" | "REVOKED" | "USED";

export type PaymentStatus = "INITIATED" | "CONFIRMED" | "FAILED";

export type PayoutMode = "NORMAL" | "INSTANT";

export type PayoutStatus = "SCHEDULED" | "PAID";

export type FinancingOfferStatus = "OFFERED" | "ACCEPTED" | "DECLINED";

export interface Drop {
  id: string;
  name: string;
  roaster: Roaster;
  origin: Origin;
  process: Process;
  prices: {
    "250g": number;
    "500g": number;
    "1kg": number;
  };
  goalGrams: number;
  deadlineISO: string;
  roastDateEstimateISO?: string;
  tastingNotes?: string[];
  createdAtISO: string;
}

export interface Reservation {
  id: string;
  dropId: string;
  userId: string; // Simplified: for MVP, we'll use a fixed userId
  size: "250g" | "500g" | "1kg";
  quantity: number; // Number of bags (>=1)
  bagSizeGrams: number; // 250, 500, or 1000 based on size
  grind: "whole" | "espresso" | "filter" | "press";
  delivery: "shipping" | "pickup";
  status: ReservationStatus;
  createdAtISO: string;
}

export interface Commitment {
  id: string;
  reservationId: string;
  userId: string;
  maxAmount: number;
  validUntilISO: string;
  condition: string; // Human-readable condition
  selectedAccountId?: string; // Simulated account ID
  status: CommitmentStatus;
  createdAtISO: string;
}

export interface Payment {
  id: string;
  reservationId: string;
  commitmentId: string;
  dropId: string;
  userId: string;
  amount: number;
  beneficiary: string;
  reference: string;
  status: PaymentStatus;
  createdAtISO: string;
  confirmedAtISO?: string;
}

export interface PayoutConfig {
  mode: PayoutMode;
  roasterId?: string; // For MVP, can be global
}

export interface Payout {
  id: string;
  dropId: string;
  roasterId: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  mode: PayoutMode;
  status: PayoutStatus;
  createdAtISO: string;
}

export interface FinancingOffer {
  id: string;
  roasterId: string;
  amount: number;
  repayPct: number; // e.g., 6% of payouts
  termWeeks: number;
  status: FinancingOfferStatus;
  basedOnKPIs?: {
    fillRate: number;
    cancellationRate: number;
    volumeIndex: number;
  };
  createdAtISO: string;
  acceptedAtISO?: string;
}

export type BankConnectionStatus = "CONNECTED";

export interface BankAccount {
  id: string;
  iban: string; // IBAN-like label
  displayName: string;
}

export interface BankConnection {
  id: string;
  bankId: string;
  bankName: string;
  status: BankConnectionStatus;
  connectedAtISO: string;
  accounts: BankAccount[];
}

export interface AppState {
  schemaVersion: number;
  drops: Drop[];
  reservations: Reservation[];
  commitments: Commitment[];
  payments: Payment[];
  payoutConfig: PayoutConfig;
  payouts: Payout[];
  financingOffers: FinancingOffer[];
  bankConnections: BankConnection[];
}

