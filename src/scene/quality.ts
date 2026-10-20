// Qualité adaptative : on descend d'un cran quand PerformanceMonitor détecte une baisse d'images/s.
// 3 = tout actif · 2 = sans N8AO · 1 = sans profondeur de champ · 0 = résolution réduite.

import { useSyncExternalStore } from "react";

export const MAX_DPR = 1.5;
export const isMobile = typeof matchMedia === "function" && matchMedia("(max-width: 820px), (pointer: coarse)").matches;

const forced = new URLSearchParams(location.search).get("q");
let level = forced !== null ? Math.max(0, Math.min(3, Number(forced))) : 3;
const listeners = new Set<() => void>();

export const quality = {
  get level() {
    return level;
  },
  /** Fixé par l'URL (?q=0..3) : désactive l'adaptation automatique, utile pour les mesures. */
  locked: forced !== null,
  decline() {
    if (this.locked || level === 0) return;
    level -= 1;
    listeners.forEach((l) => l());
  },
};

export function useQualityLevel() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => level,
  );
}
