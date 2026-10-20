// Chapitre 4 · Achats et ventes : les factures sortent de l'écran de l'ordinateur et se posent
// dans deux bacs, ACHATS et VENTES, pendant que les compteurs défilent à l'écran.

import { useMemo, useRef } from "react";
import { MathUtils, Vector3, type Group } from "three";
import { seeded } from "../../film/data";
import { clamp, easeInOut } from "../../film/math";
import { useChapterFrame } from "../chapterTime";
import { Label } from "../Label";
import { Laptop, type LaptopHandle } from "../objects/Laptop";
import { INVOICES, SHEET_GAP, Sheet, invoiceTexture, usePaperMaterials, type Invoice } from "../objects/Paper";
import { TRAY_FLOOR, Tray } from "../objects/Tray";
import { CS, paintTexture } from "../paint";
import { drawPurchasesSales } from "../screens";

const CHAPTER = 3;
const LAPTOP_POS = new Vector3(2.6, 0, -2.6);
const LAPTOP_YAW = 0;
const TRAY_PURCHASES = new Vector3(1.0, 0, 1.1);
const TRAY_SALES = new Vector3(4.2, 0, 1.1);
const SHEETS = 14;
const FLIGHT = 1.2;

/** Facture de vente fictive (émise par un client du cabinet). */
const SALE: Invoice = {
  name: "Boulangerie Martin",
  num: "V-2026-1188",
  date: "14/10/2026",
  color: CS.green,
  lines: [["Viennoiseries · commande hôtel", "120", "1,10", "132,00"], ["Pains spéciaux", "40", "2,50", "100,00"]],
  ht: "232,00",
  tva: "12,76",
  ttc: "244,76",
};

export function AchatsVentes({ x }: { x: number }) {
  const prints = useMemo(() => [...INVOICES.map(invoiceTexture), invoiceTexture(SALE)], []);
  const paper = usePaperMaterials(prints);
  const screen = useMemo(() => paintTexture<number>(1280, 800, drawPurchasesSales, 0), []);
  const laptop = useRef<LaptopHandle>(null);
  const sheetRefs = useRef<(Group | null)[]>([]);

  // Départ des feuilles : centre de l'écran ouvert ; arrivée : empilées dans leur bac.
  const flights = useMemo(() => {
    const rnd = seeded(11);
    const from = new Vector3(0, 1.2, -0.85).applyAxisAngle(new Vector3(0, 1, 0), LAPTOP_YAW).add(LAPTOP_POS);
    return Array.from({ length: SHEETS }, (_, k) => {
      const purchase = k % 2 === 0;
      const level = k >> 1;
      const to = (purchase ? TRAY_PURCHASES : TRAY_SALES).clone().add(new Vector3((rnd() - 0.5) * 0.08, TRAY_FLOOR + 0.004 + level * SHEET_GAP, (rnd() - 0.5) * 0.08));
      return { from, to, start: 0.5 + k * 0.42, yaw: (rnd() - 0.5) * 0.08, material: purchase ? paper.fronts[level % INVOICES.length] : paper.fronts[INVOICES.length] };
    });
  }, [paper]);

  useChapterFrame(CHAPTER, (lt) => {
    laptop.current?.setOpen(1);
    let landed = 0;
    flights.forEach((f, k) => {
      const g = sheetRefs.current[k];
      const u = clamp((lt - f.start) / FLIGHT);
      if (u >= 1) landed++;
      if (!g) return;
      g.visible = u > 0;
      if (!g.visible) return;
      const e = easeInOut(u);
      g.position.lerpVectors(f.from, f.to, e);
      g.position.y += Math.sin(Math.PI * e) * 1.3;
      // Recto tourné vers la caméra pendant le vol, puis à plat dans le bac.
      g.rotation.set(1.2 * (1 - e), MathUtils.lerp(LAPTOP_YAW, f.yaw, e), Math.sin(Math.PI * e) * 0.15);
      g.scale.setScalar(Math.max(0.01, Math.min(1, 0.25 + u * 2)));
    });
    screen.redraw(lt < 0 ? 0 : landed);
  });

  return (
    <group position-x={x}>
      <Laptop ref={laptop} screen={screen} position={LAPTOP_POS} rotation-y={LAPTOP_YAW} />
      <Tray text="ACHATS" color={CS.green} position={TRAY_PURCHASES} />
      <Tray text="VENTES" color={CS.tealD} position={TRAY_SALES} />
      {flights.map((f, k) => (
        <Sheet key={k} ref={(g: Group | null) => void (sheetRefs.current[k] = g)} front={f.material} back={paper.back} visible={false} />
      ))}
      <Label chapter={CHAPTER} position={[TRAY_PURCHASES.x, 0.3, TRAY_PURCHASES.z + 1.95]} text="Factures d’achat" color={CS.green} big />
      <Label chapter={CHAPTER} position={[TRAY_SALES.x, 0.3, TRAY_SALES.z + 1.95]} text="Factures de vente" color={CS.teal} big />
    </group>
  );
}
