// Matières partagées (une seule instance par matière pour limiter les changements d'état GPU).

import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

export const MAT = {
  /** Aluminium anodisé (ordinateur, support, cadre du téléphone). */
  alu: new MeshStandardMaterial({ color: new Color("#c9ccd0"), metalness: 0.9, roughness: 0.32 }),
  aluDark: new MeshStandardMaterial({ color: new Color("#8f9399"), metalness: 0.85, roughness: 0.3 }),
  graphite: new MeshStandardMaterial({ color: new Color("#2a2d31"), metalness: 0.6, roughness: 0.35 }),
  /** Verre d'écran éteint : noir profond, très lisse. */
  glass: new MeshPhysicalMaterial({ color: new Color("#07080a"), metalness: 0, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04 }),
  ceramic: new MeshPhysicalMaterial({ color: new Color("#f7f6f2"), roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }),
  coffee: new MeshPhysicalMaterial({ color: new Color("#2a1608"), roughness: 0.08, clearcoat: 1 }),
  chrome: new MeshStandardMaterial({ color: new Color("#e8e8e8"), metalness: 1, roughness: 0.14 }),
  plasticWhite: new MeshStandardMaterial({ color: new Color("#f1f1ee"), roughness: 0.45 }),
  /** Carton gris du dos des calendriers et blocs. */
  greyboard: new MeshStandardMaterial({ color: new Color("#a9a39a"), roughness: 0.9 }),
  paperEdge: new MeshStandardMaterial({ color: new Color("#eeece6"), roughness: 0.9 }),
};
