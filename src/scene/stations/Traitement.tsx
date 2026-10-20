// Chapitre 6 · Traitement : un scanner lit une facture pendant que les lignes d'un journal
// comptable équilibré se posent sur la page.

import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, MeshBasicMaterial, MeshStandardMaterial, type Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { clamp, easeOut, easeSine } from "../../film/math";
import { useChapterFrame } from "../chapterTime";
import { Label } from "../Label";
import { MAT } from "../materials";
import { INVOICES, Sheet, curvedPaper, invoiceTexture, usePaperMaterials } from "../objects/Paper";
import { PolyProp } from "../objects/PolyProp";
import { CS, paintTexture } from "../paint";
import { JOURNAL_ROWS, drawJournal, drawJournalRow } from "../screens";

const CHAPTER = 5;
const INVOICE_POS: [number, number, number] = [-2.6, 0.012, 0];
const JOURNAL_POS: [number, number, number] = [1.4, 0.01, -0.05];

const geo = {
  bar: new RoundedBoxGeometry(2.7, 0.16, 0.34, 4, 0.07),
  leg: new RoundedBoxGeometry(0.12, 0.5, 0.12, 2, 0.04),
  journal: curvedPaper(3.8, 3.42, 0.008),
  row: curvedPaper(3.5, 0.35, 0.004),
};
/** Bande de lecture : verte, lumineuse (non éclairée), et faisceau additif discret sur la feuille. */
const led = new MeshBasicMaterial({ color: new Color("#6be04f").multiplyScalar(2.2), toneMapped: false });
const beam = new MeshBasicMaterial({ color: new Color("#6be04f"), transparent: true, opacity: 0.22, blending: AdditiveBlending, depthWrite: false, toneMapped: false });

export function Traitement({ x }: { x: number }) {
  const prints = useMemo(
    () => [invoiceTexture(INVOICES[0]), paintTexture(1400, 1260, drawJournal), ...JOURNAL_ROWS.map((r, i) => paintTexture(1400, 140, (g, w, h) => drawJournalRow(g, w, h, r, i === JOURNAL_ROWS.length - 1)))],
    [],
  );
  const paper = usePaperMaterials(prints);
  const scanner = useRef<Group>(null);
  const rowRefs = useRef<(Group | null)[]>([]);
  const rows = useMemo(
    () => JOURNAL_ROWS.map((_, i) => ({ to: [JOURNAL_POS[0], 0.024, -1.0 + i * 0.37 + (i === JOURNAL_ROWS.length - 1 ? 0.07 : 0)] as const, start: 1.1 + i * 0.45 })),
    [],
  );

  useChapterFrame(CHAPTER, (lt) => {
    // Va-et-vient du scanner au-dessus de la facture.
    const ph = (Math.max(0, lt) * 0.42) % 2;
    scanner.current?.position.set(INVOICE_POS[0], 0.62, -1.5 + 3 * easeSine(ph < 1 ? ph : 2 - ph));
    // Les lignes d'écriture arrivent de la gauche et se posent sur le journal.
    rows.forEach((r, i) => {
      const g = rowRefs.current[i];
      if (!g) return;
      const u = clamp((lt - r.start) / 0.75);
      g.visible = u > 0;
      if (!g.visible) return;
      const e = easeOut(u);
      g.position.set(r.to[0] - (1 - e) * 2.2, r.to[1] + (1 - e) * (1 - e) * 1.8, r.to[2] - (1 - e) * 0.3);
      g.rotation.set(0, -(1 - e) * 0.25, -(1 - e) * 0.2);
    });
  });

  const rowMats = paper.fronts.slice(2) as MeshStandardMaterial[];
  return (
    <group position-x={x}>
      <Sheet front={paper.fronts[0]} back={paper.back} position={INVOICE_POS} />
      <group ref={scanner} position={[INVOICE_POS[0], 0.62, -1.5]}>
        <mesh geometry={geo.bar} material={MAT.alu} castShadow receiveShadow />
        <mesh material={led} rotation-x={Math.PI / 2} position-y={-0.082}>
          <planeGeometry args={[2.5, 0.05]} />
        </mesh>
        <mesh material={beam} rotation-x={-Math.PI / 2} position-y={-0.58}>
          <planeGeometry args={[2.3, 0.5]} />
        </mesh>
        {[-1.45, 1.45].map((lx) => (
          <mesh key={lx} geometry={geo.leg} material={MAT.aluDark} position={[lx, -0.36, 0]} castShadow />
        ))}
      </group>
      <Sheet front={paper.fronts[1]} back={paper.back} geometry={geo.journal} position={JOURNAL_POS} />
      {rows.map((_, i) => (
        <Sheet key={i} ref={(g: Group | null) => void (rowRefs.current[i] = g)} front={rowMats[i]} back={paper.back} geometry={geo.row} visible={false} />
      ))}
      <PolyProp path="models/stationery_supplies.glb" node="stationery_supplies_pencil_new_a" position={[4.3, 0.04, 1.4]} rotation-y={-0.9} />
      <Label chapter={CHAPTER} position={[INVOICE_POS[0], 0.15, 1.95]} text="Lecture automatique" color={CS.green} />
      <Label chapter={CHAPTER} position={[JOURNAL_POS[0], 0.15, 1.95]} text="Écritures imputées" color={CS.teal} />
    </group>
  );
}
