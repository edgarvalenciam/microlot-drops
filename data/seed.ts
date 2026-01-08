// Seed data for initial app state

import type { AppState, Drop } from "@/types";
import { ORIGINS, PROCESSES, ROASTERS } from "./catalogs";

// Helper to generate future dates
const daysFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// Fixed IDs for seed data to prevent hydration mismatches
const SEED_IDS = {
  ETHIOPIAN: "seed-drop-ethiopian-yirgacheffe",
  COLOMBIAN: "seed-drop-colombian-gesha",
  PANAMANIAN: "seed-drop-panamanian-geisha",
  KENYAN: "seed-drop-kenyan-aa",
  COSTA_RICAN: "seed-drop-costa-rican-honey",
  BRAZILIAN: "seed-drop-brazilian-natural",
  RWANDAN: "seed-drop-rwandan-extended",
  YEMENI: "seed-drop-yemeni-mocha",
};

// Generate 8 seed drops with variety
export function createSeedDrops(): Drop[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: SEED_IDS.ETHIOPIAN,
      name: "Ethiopian Yirgacheffe Natural",
      roaster: "Nomad Coffee",
      origin: "Ethiopia",
      process: "Natural",
      prices: {
        "250g": 12.5,
        "500g": 22.0,
        "1kg": 40.0,
      },
      goalGrams: 12500, // 50 * 250g
      deadlineISO: daysFromNow(14),
      roastDateEstimateISO: daysFromNow(21),
      tastingNotes: ["Blueberry", "Jasmine", "Winey"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.COLOMBIAN,
      name: "Colombian Gesha Washed",
      roaster: "Hola Coffee Roasters",
      origin: "Colombia",
      process: "Washed",
      prices: {
        "250g": 18.0,
        "500g": 32.0,
        "1kg": 58.0,
      },
      goalGrams: 7500, // 30 * 250g
      deadlineISO: daysFromNow(10),
      roastDateEstimateISO: daysFromNow(17),
      tastingNotes: ["Bergamot", "Honey", "Floral"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.PANAMANIAN,
      name: "Panamanian Geisha Anaerobic",
      roaster: "Right Side Coffee",
      origin: "Panama",
      process: "Anaerobic",
      prices: {
        "250g": 24.0,
        "500g": 42.0,
        "1kg": 75.0,
      },
      goalGrams: 6250, // 25 * 250g
      deadlineISO: daysFromNow(7),
      roastDateEstimateISO: daysFromNow(14),
      tastingNotes: ["Strawberry", "Champagne", "Complex"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.KENYAN,
      name: "Kenyan AA Double Washed",
      roaster: "Coffee Mori",
      origin: "Kenya",
      process: "Double Washed",
      prices: {
        "250g": 14.0,
        "500g": 25.0,
        "1kg": 45.0,
      },
      goalGrams: 15000, // 60 * 250g
      deadlineISO: daysFromNow(21),
      roastDateEstimateISO: daysFromNow(28),
      tastingNotes: ["Blackcurrant", "Grapefruit", "Black tea"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.COSTA_RICAN,
      name: "Costa Rican Honey Process",
      roaster: "Sakona Coffee Roasters",
      origin: "Costa Rica",
      process: "Honey",
      prices: {
        "250g": 13.0,
        "500g": 23.0,
        "1kg": 42.0,
      },
      goalGrams: 10000, // 40 * 250g
      deadlineISO: daysFromNow(12),
      roastDateEstimateISO: daysFromNow(19),
      tastingNotes: ["Caramel", "Citrus", "Sweet"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.BRAZILIAN,
      name: "Brazilian Natural",
      roaster: "Factoría 77",
      origin: "Brazil",
      process: "Natural",
      prices: {
        "250g": 10.0,
        "500g": 18.0,
        "1kg": 32.0,
      },
      goalGrams: 20000, // 80 * 250g
      deadlineISO: daysFromNow(18),
      roastDateEstimateISO: daysFromNow(25),
      tastingNotes: ["Chocolate", "Nutty", "Full body"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.RWANDAN,
      name: "Rwandan Extended Fermentation",
      roaster: "Ineffable Coffee",
      origin: "Rwanda",
      process: "Extended Fermentation",
      prices: {
        "250g": 15.0,
        "500g": 27.0,
        "1kg": 48.0,
      },
      goalGrams: 8750, // 35 * 250g
      deadlineISO: daysFromNow(9),
      roastDateEstimateISO: daysFromNow(16),
      tastingNotes: ["Wine", "Red berries", "Fermented"],
      createdAtISO: now,
    },
    {
      id: SEED_IDS.YEMENI,
      name: "Yemeni Mocha Natural",
      roaster: "Nomad Coffee",
      origin: "Yemen",
      process: "Natural",
      prices: {
        "250g": 28.0,
        "500g": 50.0,
        "1kg": 90.0,
      },
      goalGrams: 5000, // 20 * 250g
      deadlineISO: daysFromNow(5),
      roastDateEstimateISO: daysFromNow(12),
      tastingNotes: ["Spice", "Dark chocolate", "Mocha"],
      createdAtISO: now,
    },
  ];
}

export function createSeedState(): AppState {
  return {
    schemaVersion: 3,
    drops: createSeedDrops(),
    reservations: [],
    commitments: [],
    payments: [],
    payoutConfig: {
      mode: "NORMAL",
    },
    payouts: [],
    financingOffers: [],
    bankConnections: [],
  };
}

