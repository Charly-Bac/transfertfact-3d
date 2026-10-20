// Étiquette HTML ancrée sur un point 3D, affichée pendant son chapitre (hors transit).

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, type CSSProperties, type RefObject } from "react";
import { CH, isTraveling } from "../film/chapters";
import { film } from "../film/clock";

/** Conteneur des étiquettes (div#labels), au-dessus du canvas et sous le texte. */
export const labelsRoot: RefObject<HTMLElement | null> = { current: null };

interface Props {
  chapter: number;
  position: [number, number, number];
  text: string;
  color?: string;
  big?: boolean;
  /** Délai d'apparition après le début du chapitre (s). */
  delay?: number;
}

export function Label({ chapter, position, text, color, big, delay = 0.8 }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const shift = useRef(0);
  useFrame(() => {
    const node = el.current;
    if (!node) return;
    const lt = film.T - CH[chapter].start;
    const on = film.snapshot.chapter === chapter && !isTraveling(film.T) && lt > delay;
    node.classList.toggle("on", on);
    if (!on) return;
    // Garde l'étiquette dans le cadre (petits écrans) : décalage horizontal si elle déborde.
    const r = node.getBoundingClientRect();
    const left = r.left - shift.current;
    const right = r.right - shift.current;
    const margin = 12;
    const next = right > innerWidth - margin ? innerWidth - margin - right : left < margin ? margin - left : 0;
    if (next !== shift.current) {
      shift.current = next;
      node.style.translate = `${next}px 0`;
    }
  });
  if (!labelsRoot.current) labelsRoot.current = document.getElementById("labels");
  return (
    <Html position={position} center portal={labelsRoot as RefObject<HTMLElement>} zIndexRange={[3, 3]}>
      <div ref={el} className={`lbl${big ? " big" : ""}`} style={color ? ({ "--c": color } as CSSProperties) : undefined}>
        {text}
      </div>
    </Html>
  );
}
