// Feuilles A4 : géométrie courbe commune à toutes les feuilles (elles restent parallèles,
// donc empilées sans s'interpénétrer), recto imprimé, verso uni, relief de papier photo.

import { useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { BackSide, BufferGeometry, Color, DoubleSide, FrontSide, MeshStandardMaterial, PlaneGeometry, Vector2, type Texture } from "three";
import { useTiledTextures } from "../assets";
import { CS, FB, FT, grain, paintTexture, roundRect } from "../paint";

/** A4 : 21 × 29,7 cm (1 unité = 10 cm). */
export const A4: [number, number] = [2.1, 2.97];
/** Écart vertical entre deux feuilles empilées. */
export const SHEET_GAP = 0.012;

/** Papier posé à plat, bords légèrement relevés (courbure `curl`). */
export function curvedPaper(w: number, h: number, curl: number) {
  const g = new PlaneGeometry(w, h, 20, 24);
  g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (w / 2);
    const z = p.getZ(i) / (h / 2);
    p.setY(i, curl * (0.55 * x * x + 0.25 * z * z));
  }
  g.computeVertexNormals();
  return g;
}

/** Courbure commune à toutes les feuilles A4. */
export const sheetGeometry = curvedPaper(A4[0], A4[1], 0.012);

export interface Invoice {
  name: string;
  num: string;
  date: string;
  color: string;
  fe?: boolean;
  lines: [string, string, string, string][];
  ht: string;
  tva: string;
  ttc: string;
}

/** Factures fictives (reprises de la maquette). */
export const INVOICES: Invoice[] = [
  { name: "Dupont Matériaux", num: "F-2026-0412", date: "12/10/2026", color: CS.green, lines: [["Plaques de plâtre BA13", "40", "18,50", "740,00"], ["Rails métalliques 3 m", "26", "10,00", "260,00"]], ht: "1 000,00", tva: "200,00", ttc: "1 200,00" },
  { name: "Atelier Lumen", num: "AL-0388", date: "08/10/2026", color: CS.teal, fe: true, lines: [["Honoraires conseil", "1", "500,00", "500,00"]], ht: "500,00", tva: "100,00", ttc: "600,00" },
  { name: "Carrosserie Mistral", num: "2026-117", date: "03/10/2026", color: "#e0b400", lines: [["Révision véhicule", "1", "620,00", "620,00"], ["Pneumatiques", "2", "110,00", "220,00"]], ht: "840,00", tva: "168,00", ttc: "1 008,00" },
  { name: "Box Télécom Pro", num: "FT-88213", date: "01/10/2026", color: CS.tealD, lines: [["Abonnement fibre", "1", "49,99", "49,99"]], ht: "49,99", tva: "10,00", ttc: "59,99" },
];

/** Recto d'une facture en A4 à 150 dpi (1240 × 1754 px). */
export function invoiceTexture(v: Invoice) {
  return paintTexture(1240, 1754, (g, w, h) => {
    g.fillStyle = "#fbfbf9";
    g.fillRect(0, 0, w, h);
    grain(g, w, h, 4);
    const s = w / 560;
    g.save();
    g.scale(s, s);
    const W = w / s;
    g.fillStyle = v.color;
    roundRect(g, 40, 46, 52, 52, 8);
    g.fill();
    g.fillStyle = CS.print;
    g.font = `700 24px ${FT}`;
    g.fillText(v.name, 106, 68);
    g.font = `400 15px ${FB}`;
    g.fillStyle = CS.printSoft;
    g.fillText("12 rue des Artisans · 69000 Lyon", 106, 92);
    g.textAlign = "right";
    g.font = `700 30px ${FT}`;
    g.fillStyle = CS.print;
    g.fillText("FACTURE", W - 40, 160);
    g.font = `400 14px ${FT}`;
    g.fillStyle = CS.printSoft;
    g.fillText(`${v.num} · ${v.date}`, W - 40, 184);
    g.textAlign = "left";
    if (v.fe) {
      g.strokeStyle = CS.teal;
      g.lineWidth = 2;
      roundRect(g, 40, 146, 176, 32, 4);
      g.stroke();
      g.fillStyle = CS.tealD;
      g.font = `500 14px ${FB}`;
      g.fillText("Facture électronique", 56, 167);
    }
    g.fillStyle = CS.print;
    g.font = `500 13px ${FB}`;
    g.fillText("Client : Cabinet Martin & Associés", 40, 222);
    g.fillStyle = "#eef1ef";
    g.fillRect(40, 246, W - 80, 34);
    g.fillStyle = CS.print;
    g.fillText("Désignation", 52, 268);
    g.textAlign = "right";
    g.fillText("Qté", 300, 268);
    g.fillText("PU HT", 390, 268);
    g.fillText("Total HT", W - 52, 268);
    g.textAlign = "left";
    v.lines.forEach((l, i) => {
      const y = 312 + i * 38;
      g.fillStyle = CS.print;
      g.font = `400 15px ${FB}`;
      g.fillText(l[0], 52, y);
      g.font = `400 14px ${FT}`;
      g.textAlign = "right";
      g.fillText(l[1], 300, y);
      g.fillText(l[2], 390, y);
      g.fillText(l[3], W - 52, y);
      g.textAlign = "left";
      g.fillStyle = "#e3e7e5";
      g.fillRect(40, y + 14, W - 80, 1);
    });
    const bx = W - 260;
    const by = 500;
    g.strokeStyle = "#d9dfdc";
    g.lineWidth = 1.5;
    g.strokeRect(bx, by, 220, 140);
    [["Total HT", v.ht], ["TVA", v.tva]].forEach((r, i) => {
      g.fillStyle = CS.printSoft;
      g.font = `400 14px ${FB}`;
      g.fillText(r[0], bx + 16, by + 32 + i * 32);
      g.fillStyle = CS.print;
      g.font = `400 15px ${FT}`;
      g.textAlign = "right";
      g.fillText(`${r[1]} €`, bx + 204, by + 32 + i * 32);
      g.textAlign = "left";
    });
    g.fillStyle = v.color;
    g.fillRect(bx + 16, by + 86, 188, 2);
    g.fillStyle = CS.print;
    g.font = `700 16px ${FB}`;
    g.fillText("Total TTC", bx + 16, by + 120);
    g.font = `700 16px ${FT}`;
    g.textAlign = "right";
    g.fillText(`${v.ttc} €`, bx + 204, by + 120);
    g.textAlign = "left";
    g.fillStyle = "#9aa19d";
    g.font = `400 11px ${FB}`;
    ["Conditions de paiement : 30 jours fin de mois.", "Pénalités de retard : 3 fois le taux d’intérêt légal.", "SIRET 123 456 789 00012 · TVA FR12 123456789"].forEach((t, i) =>
      g.fillText(t, 40, 720 + i * 18),
    );
    g.restore();
  });
}

const PAPER_MAPS = { normalMap: "textures/paper/normal.ktx2", roughnessMap: "textures/paper/roughness.ktx2" };

/** Matières papier : recto (texture imprimée) et verso uni, avec le relief photo partagé. */
export function usePaperMaterials(prints: Texture[]) {
  const maps = useTiledTextures(PAPER_MAPS, [1, 1.4]);
  return useMemo(() => {
    const common = {
      normalMap: maps.normalMap,
      normalScale: new Vector2(0.35, 0.35),
      roughnessMap: maps.roughnessMap,
      roughness: 0.95,
      metalness: 0,
      shadowSide: DoubleSide,
    };
    const fronts = prints.map((map) => new MeshStandardMaterial({ ...common, map, side: FrontSide }));
    const back = new MeshStandardMaterial({ ...common, color: new Color("#e9e8e3"), side: BackSide });
    return { fronts, back };
  }, [maps, prints]);
}

/** Une feuille : recto + verso partageant la même géométrie courbe (A4 par défaut). */
export function Sheet({ front, back, geometry = sheetGeometry, ...props }: { front: MeshStandardMaterial; back: MeshStandardMaterial; geometry?: BufferGeometry } & ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh geometry={geometry} material={front} castShadow receiveShadow />
      <mesh geometry={geometry} material={back} receiveShadow />
    </group>
  );
}
