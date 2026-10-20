// Chapitre 1 · Échéance : le calendrier passe au mardi 1er septembre 2026, le téléphone
// vibre à chaque mail d'un client annonçant sa Plateforme Agréée.

import { useMemo, useRef } from "react";
import type { Group } from "three";
import { prefersReducedMotion } from "../../film/clock";
import { clamp, easeInOut, phase } from "../../film/math";
import { useChapterFrame } from "../chapterTime";
import { Label } from "../Label";
import { Cup } from "../objects/Cup";
import { DeskCalendar, type DeskCalendarHandle } from "../objects/DeskCalendar";
import { INVOICES, SHEET_GAP, Sheet, invoiceTexture, usePaperMaterials } from "../objects/Paper";
import { Phone } from "../objects/Phone";
import { PolyProp } from "../objects/PolyProp";
import { CS, FB, FT, grain, paintTexture, roundRect, type Ctx } from "../paint";

const CHAPTER = 0;

/** Mails fictifs de clients annonçant leur PA (repris de la maquette). */
const MAILS: [string, string][] = [
  ["SARL Dubois", "Notre plateforme sera Pennylane."],
  ["Boulangerie Martin", "On passe par Qonto pour la facture électronique."],
  ["Garage Rhône", "Nous avons choisi jefacture.com."],
  ["Studio Ocre", "Cegid devient notre Plateforme Agréée."],
  ["Cave Vidal", "On reste sur Sage, c’est notre PA."],
  ["Atelier Lumen", "Qonto pour nous aussi, vous gérez ?"],
];
/** Arrivée des mails (s, temps local) : le premier après la bascule du calendrier. */
const MAIL_START = 1.6;
const MAIL_EVERY = 0.85;
const BUZZ = 0.4;

function calendarPage(g: Ctx, w: number, h: number, page: { month: string; day: string; weekday: string; band?: [string, string]; foot: string }) {
  g.fillStyle = "#fbfbf9";
  g.fillRect(0, 0, w, h);
  grain(g, w, h, 4);
  g.textAlign = "center";
  g.fillStyle = page.band ? CS.green : "#9aa19d";
  g.fillRect(0, 0, w, 190);
  g.fillStyle = "#fff";
  g.font = `700 76px ${FT}`;
  g.fillText(page.month, w / 2, 125);
  g.fillStyle = CS.print;
  g.font = `700 470px ${FT}`;
  g.fillText(page.day, w / 2, 640);
  g.font = `500 64px ${FB}`;
  g.fillStyle = CS.printSoft;
  g.fillText(page.weekday, w / 2, 740);
  if (page.band) {
    g.fillStyle = "rgba(255,212,58,.8)";
    g.fillRect(90, 815, w - 180, 150);
    g.fillStyle = CS.print;
    g.font = `700 50px ${FT}`;
    g.fillText(page.band[0], w / 2, 880);
    g.font = `500 42px ${FB}`;
    g.fillText(page.band[1], w / 2, 940);
  }
  g.fillStyle = "#9aa19d";
  g.font = `400 30px ${FB}`;
  g.fillText(page.foot, w / 2, 1040);
}

function drawMails(g: Ctx, w: number, h: number, n: number) {
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#16201e");
  bg.addColorStop(1, "#0b100f");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#e9eeec";
  g.textAlign = "center";
  g.font = `300 190px ${FB}`;
  g.fillText("09:41", w / 2, 330);
  g.font = `400 40px ${FB}`;
  g.fillText("mardi 1 septembre", w / 2, 400);
  g.textAlign = "left";
  for (let i = 0; i < Math.min(n, 5); i++) {
    const m = MAILS[n - 1 - i];
    const y = 470 + i * 200;
    g.fillStyle = i === 0 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.12)";
    roundRect(g, 30, y, w - 60, 180, 36);
    g.fill();
    g.fillStyle = "#fff";
    roundRect(g, 60, y + 34, 64, 64, 14);
    g.fill();
    g.strokeStyle = CS.printSoft;
    g.lineWidth = 5;
    g.strokeRect(72, y + 50, 40, 30);
    g.beginPath();
    g.moveTo(72, y + 50);
    g.lineTo(92, y + 68);
    g.lineTo(112, y + 50);
    g.stroke();
    g.fillStyle = "#b9c2bf";
    g.font = `500 28px ${FB}`;
    g.fillText("MAIL · maintenant", 146, y + 56);
    g.fillStyle = "#fff";
    g.font = `700 34px ${FB}`;
    g.fillText(m[0], 146, y + 100);
    g.fillStyle = "#dfe5e3";
    g.font = `400 30px ${FB}`;
    let t = m[1];
    while (g.measureText(t).width > w - 200) t = t.slice(0, -2);
    if (t !== m[1]) t = `${t.trim()}…`;
    g.fillText(t, 146, y + 144);
  }
}

/** Nombre de mails reçus au temps local lt. */
const mailsAt = (lt: number) => (lt < MAIL_START ? 0 : clamp(Math.floor((lt - MAIL_START) / MAIL_EVERY) + 1, 0, MAILS.length));

const PHONE_POS: [number, number, number] = [1.5, 0, 0.1];
const PHONE_YAW = -0.38;

export function Echeance({ x }: { x: number }) {
  const tex = useMemo(
    () => ({
      today: paintTexture(1000, 1100, (g, w, h) =>
        calendarPage(g, w, h, { month: "SEPTEMBRE 2026", day: "1", weekday: "mardi", band: ["Facture électronique", "réception obligatoire"], foot: "S36 · 244e jour" }),
      ),
      yesterday: paintTexture(1000, 1100, (g, w, h) => calendarPage(g, w, h, { month: "AOÛT 2026", day: "31", weekday: "lundi", foot: "S36 · 243e jour" })),
      mails: paintTexture<number>(760, 1560, drawMails, 0),
      invoices: INVOICES.map(invoiceTexture),
    }),
    [],
  );
  const paper = usePaperMaterials(tex.invoices);
  const calendar = useRef<DeskCalendarHandle>(null);
  const phone = useRef<Group>(null);

  useChapterFrame(CHAPTER, (lt) => {
    // La page du 31 août bascule derrière la spirale entre 0,3 s et 1,3 s.
    calendar.current?.setFlip(prefersReducedMotion ? 1 : easeInOut(phase(lt, 0.3, 1)));
    const n = mailsAt(lt);
    tex.mails.redraw(n);
    const p = phone.current;
    if (!p) return;
    // Vibration amortie à l'arrivée de chaque mail.
    const since = lt - (MAIL_START + (n - 1) * MAIL_EVERY);
    const k = n > 0 && since >= 0 && since < BUZZ && !prefersReducedMotion ? 1 - since / BUZZ : 0;
    p.rotation.y = PHONE_YAW + Math.sin(since * 95) * 0.035 * k;
    p.position.x = PHONE_POS[0] + Math.sin(since * 120) * 0.02 * k;
  });

  return (
    <group position-x={x}>
      <DeskCalendar ref={calendar} today={tex.today} yesterday={tex.yesterday} position={[-0.9, 0, -1.3]} rotation-y={0.22} />
      <Phone ref={phone} screen={tex.mails} position={PHONE_POS} rotation-y={PHONE_YAW} />
      <Cup position={[-2.9, 0, 0.8]} rotation-y={0.6} />
      {/* Pile de factures papier : la même courbure pour toutes, écart constant. */}
      <group position={[3.0, 0, -2.3]} rotation-y={-0.42}>
        {paper.fronts.map((front, i) => (
          <Sheet key={i} front={front} back={paper.back} position={[(i % 2 ? 1 : -1) * 0.03 * i, 0.003 + i * SHEET_GAP, -0.02 * i]} rotation-y={(i % 2 ? -1 : 1) * 0.035 * i} />
        ))}
      </group>
      <PolyProp path="models/stationery_supplies.glb" node="stationery_supplies_pen_blue" position={[0.2, 0.15, 1.75]} rotation-y={0.5} />
      <PolyProp path="models/potted_plant_04.glb" position={[-3.4, 0, -2.4]} rotation-y={0.8} />
      <PolyProp path="models/office_notepads.glb" node="office_notepads_yellow_pad" position={[0.3, 0, 1.6]} rotation-y={-0.25} />
      <Label chapter={CHAPTER} position={[PHONE_POS[0] + 0.1, 0.1, PHONE_POS[2] - 0.95]} text="Chaque client choisit sa PA" color={CS.green} big />
    </group>
  );
}
