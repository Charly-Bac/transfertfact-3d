// Chapitre 7 · Sérénité : bureau rangé, ordinateur ouvert sur le portefeuille
// « 12 dossiers · 5 PA · 0 facture en attente », téléphone, café, dossiers en pile.

import { useMemo, useRef } from "react";
import { clamp, easeInOut } from "../../film/math";
import { useChapterFrame } from "../chapterTime";
import { Label } from "../Label";
import { Cup } from "../objects/Cup";
import { FOLDER, Folder, useFolderMaterials } from "../objects/Folder";
import { Laptop, type LaptopHandle } from "../objects/Laptop";
import { Phone } from "../objects/Phone";
import { PolyProp } from "../objects/PolyProp";
import { CS, paintTexture } from "../paint";
import { STATUS_STEPS, drawPortfolio, drawStatus } from "../screens";

const CHAPTER = 6;
const STACK = 6;

export function Serenite({ x }: { x: number }) {
  const tex = useMemo(() => ({ portfolio: paintTexture(1280, 800, drawPortfolio), status: paintTexture<number>(760, 1560, drawStatus, STATUS_STEPS) }), []);
  const folderMats = useFolderMaterials();
  const laptop = useRef<LaptopHandle>(null);

  useChapterFrame(CHAPTER, (lt) => {
    laptop.current?.setOpen(lt < 0 ? 0 : easeInOut(clamp(lt / 1.6)));
  });

  return (
    <group position-x={x}>
      <Laptop ref={laptop} screen={tex.portfolio} position={[-0.4, 0, -0.9]} />
      <Phone screen={tex.status} position={[1.65, 0, -1.15]} rotation-y={-0.2} />
      <Cup position={[-3.5, 0, 0.5]} rotation-y={0.4} />
      <PolyProp path="models/stationery_supplies.glb" node="stationery_supplies_pen_fancy" position={[1.4, 0.05, 1.75]} rotation-y={-0.3} />
      {/* Pile de dossiers rangée : écart constant, aucune interpénétration. */}
      {Array.from({ length: STACK }, (_, i) => (
        <Folder key={i} client={i} materials={folderMats} position={[-3.7 + (i % 2) * 0.03, 0.002 + i * (FOLDER.t + 0.002), -2.3 - (i % 3) * 0.02]} rotation-y={0.3 + ((i % 3) - 1) * 0.02} />
      ))}
      <PolyProp path="models/potted_plant_04.glb" position={[2.4, 0, -2.9]} rotation-y={0.4} />
      <Label chapter={CHAPTER} position={[-0.4, 2.7, -1.1]} text="12 dossiers · 5 PA · 0 facture en attente" color={CS.green} big />
    </group>
  );
}
