// Fixed color mapping for catalog items
// Ensures consistent colors across the app

import type { Origin, Process, Roaster } from "@/types";

export const ORIGIN_COLORS: Record<Origin, string> = {
  Brazil: "#8B4513", // SaddleBrown
  Burundi: "#228B22", // ForestGreen
  Colombia: "#FF4500", // OrangeRed
  "Costa Rica": "#FFD700", // Gold
  "El Salvador": "#32CD32", // LimeGreen
  Ethiopia: "#DC143C", // Crimson
  Guatemala: "#FF6347", // Tomato
  Honduras: "#00CED1", // DarkTurquoise
  Indonesia: "#4169E1", // RoyalBlue
  Kenya: "#FF1493", // DeepPink
  Nicaragua: "#20B2AA", // LightSeaGreen
  Panama: "#9370DB", // MediumPurple
  Peru: "#FFA500", // Orange
  Rwanda: "#FF69B4", // HotPink
  Tanzania: "#00FA9A", // MediumSpringGreen
  Uganda: "#1E90FF", // DodgerBlue
  Yemen: "#8B0000", // DarkRed
};

export const PROCESS_COLORS: Record<Process, string> = {
  Anaerobic: "#4B0082", // Indigo
  "Carbonic Maceration": "#8A2BE2", // BlueViolet
  "Double Washed": "#4169E1", // RoyalBlue
  "Extended Fermentation": "#9370DB", // MediumPurple
  Honey: "#FFD700", // Gold
  Natural: "#FF6347", // Tomato
  "Thermal Shock": "#FF4500", // OrangeRed
  Washed: "#20B2AA", // LightSeaGreen
  "Yeast Inoculated": "#32CD32", // LimeGreen
};

export const ROASTER_COLORS: Record<Roaster, string> = {
  // España
  "Coffee Mori": "#2F4F4F", // DarkSlateGray
  "D·Origen Coffee Roasters": "#696969", // DimGray
  "Factoría 77": "#778899", // LightSlateGray
  "Hola Coffee Roasters": "#4682B4", // SteelBlue
  "Ineffable Coffee": "#5F9EA0", // CadetBlue
  "Kima Coffee": "#708090", // SlateGray
  Lezzato: "#B0C4DE", // LightSteelBlue
  "Nomad Coffee": "#87CEEB", // SkyBlue
  Puchero: "#6495ED", // CornflowerBlue
  "Right Side Coffee": "#7B68EE", // MediumSlateBlue
  "Sakona Coffee Roasters": "#9370DB", // MediumPurple
  "Zeri's Coffee Roaster": "#BA55D3", // MediumOrchid
  // Alemania
  "Bonanza Coffee Roasters": "#CD5C5C", // IndianRed
  "Five Elephant": "#DC143C", // Crimson
  "The Barn": "#B22222", // FireBrick
  // Francia
  "Belleville Brûlerie": "#FF69B4", // HotPink
  "Café Lomi": "#FF1493", // DeepPink
  "Terres de Café": "#C71585", // MediumVioletRed
  // Italia
  "Gardelli Specialty Coffees": "#8B0000", // DarkRed
  "Ditta Artigianale": "#A52A2A", // Brown
  "Caffè Vergnano": "#800000", // Maroon
  // Reino Unido
  "Square Mile Coffee Roasters": "#191970", // MidnightBlue
  "Workshop Coffee": "#000080", // Navy
  "Origin Coffee": "#0000CD", // MediumBlue
  // Países Bajos
  Friedhats: "#FF4500", // OrangeRed
  "Manhattan Coffee Roasters": "#FF6347", // Tomato
  "White Label Coffee": "#FF7F50", // Coral
  // Dinamarca
  "Coffee Collective": "#228B22", // ForestGreen
  "La Cabra": "#32CD32", // LimeGreen
  "Prolog Coffee": "#00FF00", // Lime
  // Suecia
  "Drop Coffee": "#00CED1", // DarkTurquoise
  "Johan & Nyström": "#48D1CC", // MediumTurquoise
  Koppi: "#20B2AA", // LightSeaGreen
  // Noruega
  "Tim Wendelboe": "#4169E1", // RoyalBlue
  "Supreme Roastworks": "#1E90FF", // DodgerBlue
  "Solberg & Hansen": "#00BFFF", // DeepSkyBlue
  // Suiza
  MAME: "#9370DB", // MediumPurple
  "Stoll Kaffee": "#8A2BE2", // BlueViolet
  // Austria
  "Coffee Pirates": "#FFD700", // Gold
  "J. Hornig": "#FFA500", // Orange
  // Bélgica
  Caffènation: "#FF8C00", // DarkOrange
  "MOK Coffee": "#FF7F50", // Coral
  // Portugal
  "Fábrica Coffee Roasters": "#2E8B57", // SeaGreen
  "7g Roaster": "#3CB371", // MediumSeaGreen
};

