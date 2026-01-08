// Predefined catalogs with fixed alphabetical order

import type { Origin, Process, Roaster } from "@/types";

export const ORIGINS: Origin[] = [
  "Brazil",
  "Burundi",
  "Colombia",
  "Costa Rica",
  "El Salvador",
  "Ethiopia",
  "Guatemala",
  "Honduras",
  "Indonesia",
  "Kenya",
  "Nicaragua",
  "Panama",
  "Peru",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Yemen",
];

export const PROCESSES: Process[] = [
  "Anaerobic",
  "Carbonic Maceration",
  "Double Washed",
  "Extended Fermentation",
  "Honey",
  "Natural",
  "Thermal Shock",
  "Washed",
  "Yeast Inoculated",
];

export const ROASTERS: Roaster[] = [
  "Coffee Mori",
  "D·Origen Coffee Roasters",
  "Factoría 77",
  "Hola Coffee Roasters",
  "Ineffable Coffee",
  "Kima Coffee",
  "Lezzato",
  "Nomad Coffee",
  "Puchero",
  "Right Side Coffee",
  "Sakona Coffee Roasters",
  "Zeri's Coffee Roaster",
];

export interface Bank {
  id: string;
  name: string;
}

export const SPANISH_BANKS: Bank[] = [
  { id: "bbva", name: "BBVA" },
  { id: "santander", name: "Santander" },
  { id: "caixabank", name: "CaixaBank" },
  { id: "bankia", name: "Bankia" },
  { id: "sabadell", name: "Banco Sabadell" },
  { id: "unicaja", name: "Unicaja Banco" },
  { id: "kutxabank", name: "Kutxabank" },
  { id: "bankinter", name: "Bankinter" },
];

