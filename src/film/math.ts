// Petites fonctions d'interpolation partagées par la caméra et les chapitres.

export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** Progression 0 → 1 d'une phase qui commence à `start` et dure `duration` (temps local du chapitre). */
export const phase = (local: number, start: number, duration: number) => clamp((local - start) / duration);
