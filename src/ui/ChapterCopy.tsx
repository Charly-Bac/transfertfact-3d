// Texte du chapitre courant, à gauche (en bas sur mobile). Reste lisible même sans WebGL.

import { useEffect, useLayoutEffect, useState } from "react";
import { CH, isTraveling } from "../film/chapters";
import { film, prefersReducedMotion, useFilmState } from "../film/clock";

const Check = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="9" fill="none" stroke="#4aac35" strokeWidth="2" />
    <path d="M6 10.3l2.6 2.6L14.2 7.3" fill="none" stroke="#4aac35" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Découpe le titre en mots animés ; « *mot » passe en vert. */
function Title({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <h2>
      {words.map((w, i) => {
        const green = w.startsWith("*");
        return (
          <span key={i}>
            <span className="w">
              <span className={green ? "g" : undefined} style={{ transitionDelay: `${i * 0.05}s` }}>
                {green ? w.slice(1) : w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </h2>
  );
}

export function ChapterCopy() {
  const { chapter } = useFilmState();
  const [shown, setShown] = useState(false);
  const [traveling, setTraveling] = useState(false);
  const c = CH[chapter];

  // Relance l'animation d'entrée à chaque changement de chapitre.
  useLayoutEffect(() => {
    setShown(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    return () => cancelAnimationFrame(id);
  }, [chapter]);

  useEffect(
    () => film.onTick(() => setTraveling(!prefersReducedMotion && isTraveling(film.T))),
    [],
  );

  const cls = ["copy", shown ? "show" : "", traveling ? "out" : ""].filter(Boolean).join(" ");
  return (
    <section className={cls} id="copy" aria-live="polite" key={chapter}>
      <p className="kick">
        <i />
        {c.key}
        <em>
          0{chapter + 1}/0{CH.length}
        </em>
      </p>
      <Title text={c.title} />
      <p className="lead" dangerouslySetInnerHTML={{ __html: c.lead }} />
      {c.bullets.length > 0 && (
        <ul>
          {c.bullets.map((b, i) => (
            <li key={b} style={{ transitionDelay: `${0.7 + i * 0.18}s` }}>
              <Check />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {c.cta && (
        <div className="ctas">
          {c.cta.map((l) => (
            <a key={l.label} className={`btn${l.primary ? " primary" : ""}`} href={l.href} target="_blank" rel="noopener">
              {l.label}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
