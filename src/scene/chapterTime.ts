// Temps local d'un chapitre, lu à chaque image depuis l'horloge du film.

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { CH } from "../film/chapters";
import { film } from "../film/clock";

/**
 * Appelle `update(lt)` à chaque image avec lt = T − début du chapitre (négatif avant, > durée après).
 * Toute l'animation du chapitre doit se déduire de lt seul.
 */
export function useChapterFrame(index: number, update: (lt: number) => void) {
  const cb = useRef(update);
  cb.current = update;
  useFrame(() => cb.current(film.T - CH[index].start));
}
