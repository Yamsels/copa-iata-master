export type Region = 
  | "Norteamerica" 
  | "Centroamerica" 
  | "Caribe" 
  | "Colombia" 
  | "Brasil" 
  | "Venezuela" 
  | "Argentina" 
  | "Suramerica_General";

export const REGIONS_ORDER: Region[] = [
  "Norteamerica",
  "Centroamerica",
  "Caribe",
  "Colombia",
  "Brasil",
  "Venezuela",
  "Argentina",
  "Suramerica_General"
];

export const RANKS = [
  { name: "Cadete", minProgress: 0 },
  { name: "Copiloto", minProgress: 40 },
  { name: "Primer Oficial", minProgress: 70 },
  { name: "Capitán", minProgress: 90 },
  { name: "Comandante de Flota", minProgress: 100 }
];

export interface Destination {
  ciudad: string;
  iata: string;
  pais: string;
  status?: string;
  tipo?: string;
}

export interface GameState {
  points: number;
  unlockedRegions: Region[];
  bestScores: Record<Region, number>;
  masteredCodes: string[]; // List of IATA codes answered correctly at least once
}

export const getRank = (totalMastered: number, totalDestinations: number) => {
  const progress = (totalMastered / totalDestinations) * 100;
  return RANKS.reduce((prev, curr) => {
    if (progress >= curr.minProgress) return curr;
    return prev;
  });
};

export const INITIAL_STATE: GameState = {
  points: 0,
  unlockedRegions: ["Norteamerica"],
  bestScores: {
    Norteamerica: 0,
    Centroamerica: 0,
    Caribe: 0,
    Colombia: 0,
    Brasil: 0,
    Venezuela: 0,
    Argentina: 0,
    Suramerica_General: 0
  },
  masteredCodes: []
};
