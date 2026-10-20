// Scénario du film : textes repris de reference/maquette-multipa.html (tableau CH).
// Dans les titres, un mot préfixé par « * » est affiché en vert.

export type Vec3 = [number, number, number];

/** Cadrage d'un chapitre : position (a → b) et cible (la → lb), relatives à la station. */
export interface CameraPath {
  a: Vec3;
  b: Vec3;
  la: Vec3;
  lb: Vec3;
}

export interface CtaLink {
  label: string;
  href: string;
  primary?: boolean;
}

export interface Chapter {
  key: string;
  duration: number;
  title: string;
  lead: string;
  bullets: string[];
  cta?: CtaLink[];
  cam: CameraPath;
  /** Partage la station du chapitre précédent (même décor, cadrage différent). */
  sameStation?: boolean;
}

export interface TimedChapter extends Chapter {
  index: number;
  start: number;
  end: number;
  /** Abscisse de la station sur le grand bureau. */
  stationX: number;
}

export const LINKS = {
  demo: "https://www.si-expertise.fr/webinars/",
  contact: "https://www.transfertfact.fr/contact-transfertfact/",
  tarifs: "https://www.transfertfact.fr/tarifs/",
};

const CHAPTERS: Chapter[] = [
  {
    key: "Échéance",
    duration: 8,
    title: "1er septembre 2026 : la facture électronique est *arrivée.",
    lead: "Toutes les entreprises doivent désormais recevoir leurs factures en format électronique. Et chacun de vos clients choisit sa propre <strong>Plateforme Agréée</strong>.",
    bullets: [
      "Réception obligatoire depuis le 1er septembre 2026",
      "Émission obligatoire pour les PME et TPE au 1er septembre 2027",
    ],
    cam: { a: [-1, 6.6, 8.4], b: [-0.3, 4.8, 6.2], la: [0, 0.7, -0.3], lb: [0, 0.7, -0.2] },
  },
  {
    key: "Le casse-tête",
    duration: 9,
    title: "Un client, une PA. *Douze clients, cinq PA.",
    lead: "Pour le cabinet, chaque nouvelle plateforme ajoute un circuit à suivre.",
    bullets: [
      "Un accès et un identifiant par plateforme",
      "Des exports et des formats différents",
      "Des statuts à surveiller partout",
    ],
    cam: { a: [0, 13.5, 12.5], b: [0, 11.6, 10.8], la: [0, 0, -0.3], lb: [0, 0, -0.2] },
  },
  {
    key: "Centralisation",
    duration: 9,
    title: "Une seule interface pour *toutes les PA.",
    lead: "Connectez une fois les plateformes de vos clients : <strong>transfertFACT</strong> récupère toutes leurs factures au même endroit.",
    bullets: [
      "Qonto, Pennylane, jefacture.com déjà connectables",
      "Factures hors circuit FE récupérées aussi",
      "Récupération 100 % automatisée et sécurisée",
    ],
    cam: { a: [1.5, 10.5, 11.5], b: [0.8, 9.0, 10.6], la: [0, 0.3, -0.4], lb: [0.3, 0.3, 0.4] },
    sameStation: true,
  },
  {
    key: "Achats et ventes",
    duration: 8,
    title: "Achats *et ventes, dossier par dossier.",
    lead: "Factures fournisseurs et factures clients arrivent dans le bon dossier, sans manipulation.",
    bullets: [
      "Factures d’achat et de vente récupérées",
      "Classées par dossier client",
      "Sans perte d’informations",
    ],
    cam: { a: [3.4, 12.2, 12.8], b: [3.0, 10.6, 11.2], la: [2.6, 0, -0.9], lb: [2.6, 0, -0.8] },
  },
  {
    key: "Application mobile",
    duration: 9,
    title: "Les statuts, *dans votre poche.",
    lead: "Suivez le cycle de vie de chaque facture et agissez directement depuis l’application mobile.",
    bullets: [
      "Statuts obligatoires : déposée, rejetée, refusée, encaissée",
      "Approuver ou refuser en un geste",
      "Notes de frais envoyées en photo",
    ],
    cam: { a: [1.6, 3.4, 6.6], b: [0.5, 2.5, 4.9], la: [0, 0.9, -0.25], lb: [0, 0.92, -0.25] },
  },
  {
    key: "Traitement",
    duration: 9,
    title: "Imputations *automatiques, écritures prêtes.",
    lead: "Les montants sont extraits et affectés <strong>en fonction du tiers</strong>, en lien avec le plan comptable.",
    bullets: [
      "TVA intracommunautaire, autoliquidation…",
      "Compatible avec tous les logiciels comptables",
      "Pièce rattachée à son écriture",
    ],
    cam: { a: [1.0, 9.6, 9.6], b: [0.7, 7.9, 7.8], la: [0.3, 0, -0.2], lb: [0.3, 0, -0.1] },
  },
  {
    key: "Sérénité",
    duration: 10,
    title: "Toutes les PA. *Un seul outil. *Zéro panique.",
    lead: "Voyez transfertFACT en démo et préparez votre cabinet dès maintenant.",
    bullets: [],
    cta: [
      { label: "Demander une démo", href: LINKS.demo, primary: true },
      { label: "Contactez-nous", href: LINKS.contact },
      { label: "Souscrire", href: LINKS.tarifs },
    ],
    cam: { a: [2.2, 5.6, 9], b: [0.6, 4, 6.6], la: [-0.2, 1, -0.8], lb: [-0.2, 1, -0.8] },
  },
];

/** Écart entre deux stations le long du bureau (unités scène). */
export const STATION_SPACING = 20;
/** Durée du transit de caméra en fin de chapitre (secondes). */
export const TRANSIT = 1.9;

export const CH: TimedChapter[] = (() => {
  let t = 0;
  let station = 0;
  const out: TimedChapter[] = [];
  CHAPTERS.forEach((c, index) => {
    const stationX = c.sameStation && index > 0 ? out[index - 1].stationX : station++ * STATION_SPACING;
    out.push({ ...c, index, start: t, end: t + c.duration, stationX });
    t += c.duration;
  });
  return out;
})();

export const TOTAL = CH[CH.length - 1].end;

/** Chapitre courant pour un temps T donné. */
export function chapterAt(T: number): TimedChapter {
  return CH.find((c) => T < c.end) ?? CH[CH.length - 1];
}

/** Vrai pendant le transit de fin de chapitre (le texte s'efface pendant ce temps). */
export function isTraveling(T: number): boolean {
  const c = chapterAt(T);
  return c.index < CH.length - 1 && T >= c.end - TRANSIT;
}
