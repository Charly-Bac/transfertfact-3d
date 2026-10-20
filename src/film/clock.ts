// Horloge unique du film : seule source de vérité du temps T (secondes).
// Tout l'état visuel (caméra, objets, textes) se déduit de T, jamais d'un état accumulé.

import { useSyncExternalStore } from "react";
import { CH, TOTAL, chapterAt } from "./chapters";

export const prefersReducedMotion =
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Durée du fondu blanc lors d'un saut dans la timeline (ms). */
const FADE_MS = 200;
/** Pas de temps maximal par image, pour éviter un bond après un gel de l'onglet. */
const MAX_DT = 0.05;

type Listener = () => void;

interface ClockState {
  playing: boolean;
  fading: boolean;
  chapter: number;
}

// Paramètres d'URL pour les captures : ?t=12.5 (position) et ?pause.
const params = new URLSearchParams(location.search);
const startT = Math.max(0, Math.min(TOTAL - 0.01, Number(params.get("t")) || 0));
const startPaused = params.has("pause") || prefersReducedMotion;

class FilmClock {
  /** Temps du film, lu directement à chaque image (pas de rendu React). */
  T = startT;
  private state: ClockState = { playing: !startPaused, fading: false, chapter: chapterAt(startT).index };
  private stateListeners = new Set<Listener>();
  private tickListeners = new Set<Listener>();
  private last = 0;
  private raf = 0;

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - this.last) / 1000, MAX_DT);
      this.last = now;
      if (this.state.playing && !this.state.fading) {
        const next = this.T + dt;
        if (next >= TOTAL) this.seek(0);
        else this.setT(next);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  get snapshot(): ClockState {
    return this.state;
  }

  setPlaying(playing: boolean) {
    this.patch({ playing });
  }

  togglePlaying() {
    this.setPlaying(!this.state.playing);
  }

  /** Saut dans le film, masqué par un court fondu blanc. */
  seek(t: number) {
    const target = Math.max(0, Math.min(TOTAL - 0.01, t));
    this.patch({ fading: true });
    window.setTimeout(() => {
      this.setT(target);
      this.patch({ fading: false });
    }, FADE_MS);
  }

  seekChapter(index: number) {
    const k = Math.max(0, Math.min(CH.length - 1, index));
    this.seek(CH[k].start + 0.01);
  }

  /** ← : début du chapitre courant, ou chapitre précédent si on vient d'y entrer. */
  previous() {
    const c = CH[this.state.chapter];
    this.seekChapter(this.T - c.start > 1.5 ? c.index : c.index - 1);
  }

  next() {
    this.seekChapter(this.state.chapter + 1);
  }

  private setT(t: number) {
    const prevChapter = this.state.chapter;
    this.T = t;
    const chapter = chapterAt(t).index;
    if (chapter !== prevChapter) {
      this.patch({ chapter });
      // Mouvement réduit : pas de transit de caméra, on enchaîne les chapitres par un fondu.
      if (prefersReducedMotion && !this.state.fading) {
        this.patch({ fading: true });
        window.setTimeout(() => this.patch({ fading: false }), FADE_MS * 2);
      }
    }
    this.tickListeners.forEach((l) => l());
  }

  private patch(p: Partial<ClockState>) {
    this.state = { ...this.state, ...p };
    this.stateListeners.forEach((l) => l());
    // Un changement d'état (pause, saut) doit aussi redessiner la scène.
    this.tickListeners.forEach((l) => l());
  }

  subscribe = (l: Listener) => {
    this.stateListeners.add(l);
    return () => this.stateListeners.delete(l);
  };

  /** Appelé à chaque avancée de T : pour les mises à jour sans React (barres, timecode, rendu 3D). */
  onTick(l: Listener) {
    this.tickListeners.add(l);
    l(); // état initial (utile quand le film démarre en pause à ?t=…)
    return () => {
      this.tickListeners.delete(l);
    };
  }
}

export const film = new FilmClock();

export function useFilmState(): ClockState {
  return useSyncExternalStore(film.subscribe, () => film.snapshot);
}
