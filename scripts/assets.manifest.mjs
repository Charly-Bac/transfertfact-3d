// Liste des assets tiers (tous CC0). Source unique pour le téléchargement et la compression.
// Toute entrée ajoutée ici doit aussi figurer dans CREDITS.md.

export const HDRIS = [
  { id: "photo_studio_loft_hall", res: "1k" },
];

/** Textures Poly Haven : cartes demandées (noms de l'API) et résolution. */
export const POLYHAVEN_TEXTURES = [
  { id: "silver_oak_veneer_01", res: "2k", maps: ["Diffuse", "nor_gl", "arm"] },
];

/** Textures ambientCG (archives JPG). */
export const AMBIENTCG_TEXTURES = [
  { id: "Paper001", res: "1K" },
  { id: "Paper006", res: "1K" },
];

/** Modèles Poly Haven (glTF). `simplify` : part de triangles conservée ; `keepNodes` : objets séparés (on en pioche un seul). */
export const POLYHAVEN_MODELS = [
  { id: "potted_plant_04", res: "1k" },
  { id: "potted_plant_02", res: "1k", simplify: 0.25 },
  { id: "stationery_supplies", res: "1k", keepNodes: true },
  { id: "office_notepads", res: "1k", keepNodes: true },
];
