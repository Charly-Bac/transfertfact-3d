// Écrans de l'application transfertFACT et imprimés du film, dessinés en canvas (repris de la maquette).

import { CLIENTS, PLATFORMS, platformOf } from "../film/data";
import { CS, FB, FT, grain, roundRect, type Ctx } from "./paint";

/** Habillage commun des écrans d'ordinateur : barre latérale, logo, titre. */
function appChrome(g: Ctx, w: number, h: number, active: number, title: string) {
  g.fillStyle = "#f6f9f7";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff";
  g.fillRect(0, 0, 240, h);
  g.fillStyle = "#e6ece8";
  g.fillRect(240, 0, 2, h);
  g.font = `500 30px ${FT}`;
  g.fillStyle = CS.ink;
  g.fillText("transfert", 28, 62);
  const a = g.measureText("transfert").width;
  g.fillStyle = CS.green;
  g.font = `700 30px ${FT}`;
  g.fillText("FACT", 28 + a, 62);
  ["Tableau de bord", "Factures", "Flux FE", "Écritures", "Paramétrage"].forEach((t, i) => {
    if (i === active) {
      g.fillStyle = "#eaf6e6";
      g.fillRect(14, 118 + i * 58, 212, 46);
      g.fillStyle = CS.green;
      g.fillRect(14, 118 + i * 58, 5, 46);
    }
    g.fillStyle = i === active ? CS.green : CS.text;
    g.font = `500 22px ${FB}`;
    g.fillText(t, 36, 148 + i * 58);
  });
  g.fillStyle = CS.ink;
  g.font = `700 36px ${FT}`;
  g.fillText(title, 280, 78);
}

const pill = (g: Ctx, x: number, y: number, w: number, h: number, fill: string) => {
  g.fillStyle = fill;
  roundRect(g, x, y, w, h, h / 2);
  g.fill();
};

/** Chapitre 3 : les 5 PA passent une à une en « Connectée » (n = nombre connectées). */
export function drawHub(g: Ctx, w: number, h: number, n: number) {
  appChrome(g, w, h, 2, "Flux FE centralisés");
  g.fillStyle = CS.text;
  g.font = `400 22px ${FB}`;
  g.fillText(`${n} PA connectée${n > 1 ? "s" : ""} sur 5 · 12 dossiers clients`, 280, 118);
  PLATFORMS.forEach((p, i) => {
    const y = 150 + i * 112;
    const on = i < n;
    g.fillStyle = "#fff";
    g.fillRect(280, y, 960, 94);
    g.fillStyle = on ? p.color : "#d5dbd8";
    g.fillRect(280, y, 6, 94);
    g.fillStyle = CS.ink;
    g.font = `700 30px ${FT}`;
    g.fillText(p.name, 310, y + 44);
    g.fillStyle = CS.text;
    g.font = `400 21px ${FB}`;
    const nb = CLIENTS.filter((_, k) => k % 5 === i).length;
    g.fillText(`${nb} dossier${nb > 1 ? "s" : ""} · achats et ventes`, 310, y + 76);
    g.font = `500 22px ${FB}`;
    if (on) {
      pill(g, 1030, y + 28, 180, 40, CS.green);
      g.fillStyle = "#fff";
      g.fillText("Connectée", 1066, y + 55);
    } else {
      g.strokeStyle = "#c3cbc7";
      g.lineWidth = 2;
      roundRect(g, 1030, y + 28, 180, 40, 20);
      g.stroke();
      g.fillStyle = "#8a918e";
      g.fillText("En attente", 1064, y + 55);
    }
  });
}

/** Chapitre 4 : compteurs d'achats et de ventes (n = factures arrivées). */
export function drawPurchasesSales(g: Ctx, w: number, h: number, n: number) {
  appChrome(g, w, h, 1, "Factures reçues");
  const a = Math.ceil(n / 2);
  const v = Math.floor(n / 2);
  ([["Achats", a, CS.green], ["Ventes", v, CS.teal]] as const).forEach(([label, count, color], i) => {
    const x = 280 + i * 490;
    g.fillStyle = "#fff";
    g.fillRect(x, 104, 470, 150);
    g.fillStyle = color;
    g.fillRect(x, 104, 470, 6);
    g.fillStyle = CS.text;
    g.font = `400 24px ${FB}`;
    g.fillText(`${label} · aujourd’hui`, x + 24, 150);
    g.fillStyle = CS.ink;
    g.font = `700 72px ${FT}`;
    g.fillText(String(count), x + 24, 230);
  });
  for (let i = 0; i < Math.min(n, 4); i++) {
    const k = n - 1 - i;
    const y = 280 + i * 100;
    const purchase = k % 2 === 0;
    g.fillStyle = "#fff";
    g.fillRect(280, y, 960, 84);
    g.fillStyle = CS.ink;
    g.font = `500 26px ${FB}`;
    g.fillText(CLIENTS[(k * 5) % 12], 306, y + 52);
    pill(g, 820, y + 22, 130, 40, purchase ? CS.green : CS.teal);
    g.fillStyle = "#fff";
    g.font = `500 21px ${FB}`;
    g.fillText(purchase ? "Achat" : "Vente", 848, y + 49);
    g.fillStyle = CS.text;
    g.fillText(PLATFORMS[k % 5].name, 980, y + 49);
  }
}

/** Couleurs des statuts du cycle de vie. */
const STATUS_COLORS: Record<string, string> = {
  Déposée: "#6b7a90",
  "Mise à disposition": "#2f9e9a",
  "Prise en charge": "#2f9e9a",
  Approuvée: "#3c940c",
  "Mise en paiement": "#086666",
  Encaissée: "#2f7d0a",
  Rejetée: "#c8432b",
  Refusée: "#d4711f",
};

/** Lignes de l'écran Statuts : client, fournisseur, montant, PA, évolution du statut par étape. */
const STATUS_ROWS: [string, string, string, string, string[]][] = [
  ["SARL Dubois", "Imprimerie Vidal", "312,00 €", "Pennylane", ["Déposée", "Mise à disposition", "Prise en charge", "Approuvée"]],
  ["Boulangerie Martin", "Moulins Girard", "1 140,00 €", "Qonto", ["Approuvée", "Approuvée", "Approuvée", "Mise en paiement", "Mise en paiement", "Encaissée"]],
  ["Garage Rhône", "Pièces Auto Sud", "864,00 €", "jefacture.com", ["Rejetée"]],
  ["Studio Ocre", "Papeterie Lyonnaise", "86,40 €", "Cegid", ["Déposée", "Déposée", "Déposée", "Déposée", "Refusée"]],
  ["Cave Vidal", "Verrerie Duval", "2 380,00 €", "Sage", ["Encaissée"]],
];
export const STATUS_STEPS = 6;
const statusAt = (row: (typeof STATUS_ROWS)[number], s: number) => row[4][Math.min(s, row[4].length - 1)];

/** Écran « Statuts » de l'application mobile à l'étape s (0 → 6). */
export function drawStatus(g: Ctx, w: number, h: number, s: number) {
  g.fillStyle = "#f6f9f7";
  g.fillRect(0, 0, w, h);
  g.fillStyle = CS.print;
  g.font = `600 30px ${FB}`;
  g.fillText("09:41", 50, 60);
  g.fillStyle = CS.green;
  g.fillRect(0, 90, w, 130);
  g.fillStyle = "#fff";
  g.font = `500 44px ${FT}`;
  g.fillText("transfert", 40, 172);
  const a = g.measureText("transfert").width;
  g.font = `700 44px ${FT}`;
  g.fillText("FACT", 40 + a, 172);
  g.fillStyle = CS.print;
  g.font = `700 52px ${FT}`;
  g.fillText("Statuts", 40, 300);
  g.fillStyle = "#e6ece8";
  roundRect(g, 40, 330, w - 80, 70, 35);
  g.fill();
  g.fillStyle = "#fff";
  roundRect(g, 46, 336, (w - 92) / 2, 58, 29);
  g.fill();
  g.font = `500 30px ${FB}`;
  g.textAlign = "center";
  g.fillStyle = CS.print;
  g.fillText("Achats", 40 + (w - 80) / 4, 376);
  g.fillStyle = CS.text;
  g.fillText("Ventes", 40 + (3 * (w - 80)) / 4, 376);
  g.textAlign = "left";
  let y = 430;
  STATUS_ROWS.forEach((r, i) => {
    const st = statusAt(r, s);
    const changed = s > 0 && st !== statusAt(r, Math.max(0, s - 1));
    // À l'étape 2, la première facture est ouverte : boutons Approuver / Refuser.
    const open = i === 0 && s === 2;
    const hh = open ? 290 : 190;
    g.fillStyle = changed ? "#eef7ea" : "#fff";
    roundRect(g, 30, y, w - 60, hh - 14, 22);
    g.fill();
    g.fillStyle = CS.print;
    g.font = `700 32px ${FB}`;
    g.fillText(r[0], 60, y + 52);
    g.fillStyle = CS.text;
    g.font = `400 26px ${FB}`;
    g.fillText(`${r[1]} · ${r[3]}`, 60, y + 92);
    g.fillStyle = CS.print;
    g.font = `500 30px ${FT}`;
    g.fillText(r[2], 60, y + 140);
    g.font = `600 25px ${FB}`;
    const tw = g.measureText(st).width + 40;
    pill(g, w - 60 - tw, y + 112, tw, 46, STATUS_COLORS[st]);
    g.fillStyle = "#fff";
    g.fillText(st, w - 60 - tw + 20, y + 143);
    if (open) {
      g.fillStyle = CS.green;
      roundRect(g, 60, y + 180, (w - 150) / 2, 70, 14);
      g.fill();
      g.strokeStyle = "#c8432b";
      g.lineWidth = 3;
      roundRect(g, 90 + (w - 150) / 2, y + 180, (w - 150) / 2, 70, 14);
      g.stroke();
      g.textAlign = "center";
      g.fillStyle = "#fff";
      g.font = `600 30px ${FB}`;
      g.fillText("Approuver", 60 + (w - 150) / 4, y + 226);
      g.fillStyle = "#c8432b";
      g.fillText("Refuser", 90 + (3 * (w - 150)) / 4, y + 226);
      g.textAlign = "left";
    }
    y += hh;
  });
  if (s >= 3) {
    g.fillStyle = CS.print;
    roundRect(g, 40, h - 260, w - 80, 90, 20);
    g.fill();
    g.fillStyle = "#fff";
    g.font = `500 28px ${FB}`;
    g.fillText("✓  Statut transmis à la plateforme", 70, h - 205);
  }
  g.fillStyle = "#fff";
  g.fillRect(0, h - 140, w, 140);
  g.fillStyle = "#e2eae5";
  g.fillRect(0, h - 140, w, 2);
  ["Factures", "Statuts", "Notes de frais", "Profil"].forEach((t, i) => {
    g.fillStyle = i === 1 ? CS.green : "#8a918e";
    g.font = `500 24px ${FB}`;
    g.textAlign = "center";
    g.fillText(t, w / 8 + (i * w) / 4, h - 70);
  });
  g.textAlign = "left";
}

/** Chapitre 7 : portefeuille de 12 dossiers à jour. */
export function drawPortfolio(g: Ctx, w: number, h: number) {
  appChrome(g, w, h, 0, "Portefeuille clients");
  ([["12 dossiers", CS.ink], ["5 PA connectées", CS.teal], ["0 facture en attente", CS.green]] as const).forEach(([label, color], i) => {
    g.font = `600 22px ${FB}`;
    const tw = g.measureText(label).width + 40;
    const x = 280 + [0, 190, 420][i];
    g.strokeStyle = color;
    g.lineWidth = 2;
    roundRect(g, x, 100, tw, 42, 21);
    g.stroke();
    g.fillStyle = color;
    g.fillText(label, x + 20, 128);
  });
  CLIENTS.forEach((c, i) => {
    const x = 280 + (i % 4) * 242;
    const y = 168 + Math.floor(i / 4) * 196;
    const p = platformOf(i);
    g.fillStyle = "#fff";
    g.fillRect(x, y, 228, 180);
    g.fillStyle = p.color;
    g.fillRect(x, y, 228, 5);
    g.fillStyle = CS.ink;
    g.font = `600 21px ${FB}`;
    let t = c;
    while (g.measureText(t).width > 200) t = t.slice(0, -1);
    g.fillText(t, x + 16, y + 46);
    g.fillStyle = CS.text;
    g.font = `400 19px ${FB}`;
    g.fillText(`PA : ${p.name}`, x + 16, y + 80);
    g.fillStyle = CS.green;
    g.beginPath();
    g.arc(x + 28, y + 132, 12, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = CS.ink;
    g.font = `500 20px ${FB}`;
    g.fillText("À jour", x + 50, y + 139);
  });
}

/** Étiquette collée sur une chemise : client et PA. */
export function drawFolderLabel(g: Ctx, w: number, h: number, client: number) {
  const p = platformOf(client);
  const name = CLIENTS[client];
  g.fillStyle = "#fdfdfb";
  g.fillRect(0, 0, w, h);
  grain(g, w, h, 5, client + 3);
  g.fillStyle = p.color;
  g.fillRect(0, 0, 14, h);
  g.fillStyle = CS.print;
  let fs = 44;
  g.font = `700 ${fs}px ${FT}`;
  while (g.measureText(name).width > w - 70 && fs > 26) {
    fs -= 2;
    g.font = `700 ${fs}px ${FT}`;
  }
  g.fillText(name, 40, 96);
  g.fillStyle = CS.printSoft;
  g.font = `400 30px ${FB}`;
  g.fillText("Dossier client · exercice 2026", 40, 150);
  g.fillStyle = p.color;
  roundRect(g, 40, 190, 30, 30, 6);
  g.fill();
  g.fillStyle = CS.print;
  g.font = `500 32px ${FB}`;
  g.fillText(`PA : ${p.name}`, 86, 216);
}

/** Plaque d'une PA : logo fourni (mot-symbole seul s'il contient déjà le nom, sinon symbole + nom). */
export function drawPlaque(g: Ctx, w: number, h: number, name: string, img: HTMLImageElement) {
  g.fillStyle = "#fbfbfa";
  g.fillRect(0, 0, w, h);
  const wide = img.width / img.height > 2;
  if (wide) {
    const sc = Math.min(760 / img.width, 230 / img.height);
    const iw = img.width * sc;
    const ih = img.height * sc;
    g.drawImage(img, (w - iw) / 2, 215 - ih / 2, iw, ih);
  } else {
    const S = 230;
    const x0 = 56;
    const y0 = 100;
    const sc = Math.min(S / img.width, S / img.height);
    const iw = img.width * sc;
    const ih = img.height * sc;
    g.drawImage(img, x0 + (S - iw) / 2, y0 + (S - ih) / 2, iw, ih);
    let fs = 120;
    g.font = `700 ${fs}px ${FT}`;
    while (g.measureText(name).width > w - x0 - S - 70 && fs > 40) {
      fs -= 4;
      g.font = `700 ${fs}px ${FT}`;
    }
    g.fillStyle = CS.print;
    g.textAlign = "left";
    g.fillText(name, x0 + S + 36, y0 + S / 2 + fs * 0.34);
  }
  g.fillStyle = "#4f5552";
  g.font = `500 42px ${FB}`;
  g.textAlign = "center";
  g.fillText("Plateforme Agréée", w / 2, 450);
  g.textAlign = "left";
}

/** Étiquette de bac à courrier. */
export function drawTrayLabel(g: Ctx, w: number, h: number, text: string, color: string) {
  g.fillStyle = "#fff";
  g.fillRect(0, 0, w, h);
  g.font = `700 40px ${FT}`;
  g.fillStyle = color;
  g.textAlign = "center";
  g.fillText(text, w / 2, 46);
  g.textAlign = "left";
}

/** Ticket de note de frais (hôtel). */
export function drawReceipt(g: Ctx, w: number, h: number) {
  g.fillStyle = "#fdfdfb";
  g.fillRect(0, 0, w, h);
  grain(g, w, h, 6);
  g.fillStyle = CS.print;
  g.textAlign = "center";
  g.font = `700 30px ${FT}`;
  g.fillText("HÔTEL DU PORT", w / 2, 70);
  g.font = `400 18px ${FT}`;
  g.fillStyle = "#6c726f";
  g.fillText("Quai Saint-Antoine · Lyon", w / 2, 102);
  g.fillText("29/09/2026  21:42", w / 2, 132);
  g.textAlign = "left";
  g.fillStyle = CS.print;
  g.font = `400 20px ${FT}`;
  [["Nuitée", "150,00"], ["Taxe séjour", "1,65"], ["Petit-déj.", "13,35"]].forEach(([l, v], i) => {
    g.fillText(l, 34, 220 + i * 40);
    g.textAlign = "right";
    g.fillText(v, w - 34, 220 + i * 40);
    g.textAlign = "left";
  });
  g.setLineDash([6, 6]);
  g.strokeStyle = "#9aa19d";
  g.beginPath();
  g.moveTo(30, 350);
  g.lineTo(w - 30, 350);
  g.stroke();
  g.setLineDash([]);
  g.font = `700 24px ${FT}`;
  g.fillText("TOTAL", 34, 400);
  g.textAlign = "right";
  g.fillText("165,00 €", w - 34, 400);
  g.textAlign = "left";
  g.font = `400 17px ${FT}`;
  g.fillStyle = "#6c726f";
  g.fillText("dont TVA 10 %   15,00", 34, 440);
  g.fillText("CB **** 4821", 34, 476);
  g.textAlign = "center";
  g.fillText("Merci de votre visite", w / 2, 560);
  for (let i = 0; i < 46; i++) {
    g.fillStyle = CS.print;
    g.fillRect(70 + i * 6, 610, i % 3 ? 2 : 4, 90);
  }
  g.textAlign = "left";
}

/** Journal des achats (en-tête) sur lequel se posent les lignes d'écriture. */
export function drawJournal(g: Ctx, w: number, h: number) {
  g.fillStyle = "#fbfbf9";
  g.fillRect(0, 0, w, h);
  grain(g, w, h, 5);
  g.fillStyle = CS.print;
  g.font = `700 52px ${FT}`;
  g.fillText("Journal des achats", 40, 90);
  g.fillStyle = CS.printSoft;
  g.font = `400 30px ${FB}`;
  g.fillText("Octobre 2026 · généré par transfertFACT", 40, 140);
  g.font = `500 28px ${FT}`;
  g.fillText("COMPTE", 40, 220);
  g.fillText("LIBELLÉ", 330, 220);
  g.textAlign = "right";
  g.fillText("DÉBIT", 1060, 220);
  g.fillText("CRÉDIT", w - 40, 220);
  g.textAlign = "left";
  g.fillStyle = CS.green;
  g.fillRect(40, 240, w - 80, 3);
}

/** Écritures équilibrées (fictives) : compte, libellé, débit, crédit. Dernière ligne = total. */
export const JOURNAL_ROWS: [string, string, string, string][] = [
  ["607000", "Achats · Dupont", "1 000,00", ""],
  ["445660", "TVA déductible", "200,00", ""],
  ["401DUPO", "Dupont Matériaux", "", "1 200,00"],
  ["411MART", "Client Martin", "244,76", ""],
  ["701000", "Ventes", "", "232,00"],
  ["445710", "TVA collectée", "", "12,76"],
  ["TOTAL", "Équilibrée", "1 444,76", "1 444,76"],
];

export function drawJournalRow(g: Ctx, w: number, h: number, row: [string, string, string, string], total: boolean) {
  g.fillStyle = total ? "#eef7ea" : "#fbfbf9";
  g.fillRect(0, 0, w, h);
  grain(g, w, h, 5);
  g.font = `700 46px ${FT}`;
  g.fillStyle = total ? CS.greenD : CS.green;
  g.fillText(row[0], 40, 88);
  g.fillStyle = CS.print;
  g.font = `${total ? 700 : 400} 42px ${FB}`;
  g.fillText(row[1], 330, 88);
  g.font = `400 46px ${FT}`;
  g.textAlign = "right";
  g.fillText(row[2], 1060, 88);
  g.fillText(row[3], w - 40, 88);
  g.textAlign = "left";
  g.fillStyle = "#e1e5e3";
  g.fillRect(0, h - 3, w, 3);
}
