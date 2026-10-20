// Données fictives du film (clients, plateformes), reprises de la maquette de référence.

export interface Platform {
  name: string;
  /** Fichier fourni dans assets/logos/ (copié dans public/logos/). */
  logo: string;
  color: string;
}

export const PLATFORMS: Platform[] = [
  { name: "Qonto", logo: "qonto", color: "#4aac35" },
  { name: "Pennylane", logo: "pennylane", color: "#4ebbb7" },
  { name: "jefacture.com", logo: "jefacture", color: "#d9a900" },
  { name: "Cegid", logo: "cegid", color: "#086666" },
  { name: "Sage", logo: "sage", color: "#7d8682" },
];

export const CLIENTS = [
  "Boulangerie Martin",
  "SARL Dubois",
  "Garage Rhône",
  "Studio Ocre",
  "Cave Vidal",
  "Atelier Lumen",
  "Pharmacie du Parc",
  "Menuiserie Roy",
  "Imprimerie Vidal",
  "Hôtel du Port",
  "Fleurs & Co",
  "Transports Blanc",
];

/** PA du client i (répartition fixe : client i → plateforme i mod 5). */
export const platformOf = (client: number) => PLATFORMS[client % PLATFORMS.length];

/** Teintes des chemises cartonnées. */
export const FOLDER_COLORS = ["#cfe6c6", "#c6e7e5", "#f3e3a2", "#dfe4e1"];

/** Générateur pseudo-aléatoire déterministe (même disposition à chaque chargement). */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
