// Les stations du film, alignées sur le bureau. Seules la station courante et ses voisines
// sont dessinées (les autres restent chargées mais masquées).

import { useFrame } from "@react-three/fiber";
import { use, useRef, type ReactNode } from "react";
import type { Group } from "three";
import { CH } from "../film/chapters";
import { film } from "../film/clock";
import { fontsReady } from "./paint";
import { AchatsVentes } from "./stations/AchatsVentes";
import { CasseTete } from "./stations/CasseTete";
import { Echeance } from "./stations/Echeance";
import { Mobile } from "./stations/Mobile";
import { Serenite } from "./stations/Serenite";
import { Traitement } from "./stations/Traitement";

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
    <>
      <Station chapters={[0]}>
        <Echeance x={CH[0].stationX} />
      </Station>
      <Station chapters={[1, 2]}>
        <CasseTete x={CH[1].stationX} />
      </Station>
      <Station chapters={[3]}>
        <AchatsVentes x={CH[3].stationX} />
      </Station>
      <Station chapters={[4]}>
        <Mobile x={CH[4].stationX} />
      </Station>
      <Station chapters={[5]}>
        <Traitement x={CH[5].stationX} />
      </Station>
      <Station chapters={[6]}>
        <Serenite x={CH[6].stationX} />
      </Station>
    </>
  );
}
