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
  // España
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
  // Alemania
  "Bonanza Coffee Roasters",
  "Five Elephant",
  "The Barn",
  // Francia
  "Belleville Brûlerie",
  "Café Lomi",
  "Terres de Café",
  // Italia
  "Gardelli Specialty Coffees",
  "Ditta Artigianale",
  "Caffè Vergnano",
  // Reino Unido
  "Square Mile Coffee Roasters",
  "Workshop Coffee",
  "Origin Coffee",
  // Países Bajos
  "Friedhats",
  "Manhattan Coffee Roasters",
  "White Label Coffee",
  // Dinamarca
  "Coffee Collective",
  "La Cabra",
  "Prolog Coffee",
  // Suecia
  "Drop Coffee",
  "Johan & Nyström",
  "Koppi",
  // Noruega
  "Tim Wendelboe",
  "Supreme Roastworks",
  "Solberg & Hansen",
  // Suiza
  "MAME",
  "Stoll Kaffee",
  // Austria
  "Coffee Pirates",
  "J. Hornig",
  // Bélgica
  "Caffènation",
  "MOK Coffee",
  // Portugal
  "Fábrica Coffee Roasters",
  "7g Roaster",
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

