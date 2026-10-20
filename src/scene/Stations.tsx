// Les stations du film, alignées sur le bureau. Seules la station courante et ses voisines
// sont dessinées (les autres restent chargées mais masquées).

import { useFrame } from "@react-three/fiber";
import { use, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { CH } from "../film/chapters";
import { film } from "../film/clock";
import { fontsReady } from "./paint";
import { Echeance } from "./stations/Echeance";

function Station({ chapters, children }: { chapters: number[]; children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const k = film.snapshot.chapter;
    group.current.visible = chapters.some((c) => Math.abs(c - k) <= 1);
  });
  return <group ref={group}>{children}</group>;
}

export function Stations() {
  // Les textures dessinées attendent les polices du site.
  use(fontsReady);
  return (
    <Station chapters={[0]}>
      <Echeance x={CH[0].stationX} />
    </Station>
  );
}
