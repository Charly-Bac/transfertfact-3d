// Chapitre 5 · Application mobile : gros plan sur le téléphone posé sur un support en aluminium.
// Les statuts évoluent (Déposée → … → Approuvée, Mise en paiement → Encaissée, une Rejetée, une Refusée),
// les boutons Approuver / Refuser apparaissent, puis le toast « Statut transmis à la plateforme ».

import { useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Vector3 } from "three";
import { clamp } from "../../film/math";
import { useChapterFrame } from "../chapterTime";
import { Label } from "../Label";
import { MAT } from "../materials";
import { Cup } from "../objects/Cup";
import { Sheet, curvedPaper, usePaperMaterials } from "../objects/Paper";
import { PHONE, Phone } from "../objects/Phone";
import { CS, paintTexture } from "../paint";
import { STATUS_STEPS, drawReceipt, drawStatus } from "../screens";

const CHAPTER = 4;
/** Inclinaison du téléphone sur son support (rad depuis l'horizontale). */
const TILT = 1.2;
const LIP = 0.12;
const STEP = 1.25;

const geo = {
  base: new RoundedBoxGeometry(1.15, 0.05, 1.35, 2, 0.02),
  lip: new RoundedBoxGeometry(1.0, 0.14, 0.1, 2, 0.03),
  back: new RoundedBoxGeometry(0.62, 0.04, 1.2, 2, 0.02),
  receipt: curvedPaper(1.05, 2.15, 0.01),
};

export function Mobile({ x }: { x: number }) {
  const tex = useMemo(
    () => ({ status: paintTexture<number>(760, 1560, drawStatus, 0), receipt: paintTexture(420, 860, drawReceipt) }),
    [],
  );
  const receiptPrints = useMemo(() => [tex.receipt], [tex]);
  const paper = usePaperMaterials(receiptPrints);

  // Le téléphone repose sur la lèvre du support, incliné de TILT.
  const half = PHONE.h / 2;
  const phonePos = new Vector3(0, half * Math.sin(TILT) + LIP, -half * Math.cos(TILT));
  const normal = new Vector3(0, Math.cos(TILT), Math.sin(TILT));
  const backPos = phonePos.clone().addScaledVector(normal, -0.05);

  useChapterFrame(CHAPTER, (lt) => {
    tex.status.redraw(lt < 0 ? 0 : clamp(Math.floor((lt - 0.6) / STEP), 0, STATUS_STEPS));
  });

  return (
    <group position-x={x}>
      <group>
        <mesh geometry={geo.base} material={MAT.alu} position={[0, 0.025, -0.4]} castShadow receiveShadow />
        <mesh geometry={geo.lip} material={MAT.alu} position={[0, 0.09, 0.08]} castShadow receiveShadow />
        <mesh geometry={geo.back} material={MAT.alu} position={backPos} rotation-x={TILT} castShadow receiveShadow />
      </group>
      <Phone screen={tex.status} position={phonePos} rotation-x={TILT} />
      <Sheet front={paper.fronts[0]} back={paper.back} geometry={geo.receipt} position={[2.0, 0.006, -1.3]} rotation-y={-0.35} />
      <Cup position={[-1.5, 0, -1.9]} rotation-y={0.5} />
      <Label chapter={CHAPTER} position={[1.55, 1.45, 0.1]} text="Cycle de vie en temps réel" color={CS.green} big />
    </group>
  );
}
