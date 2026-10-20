// Timeline cliquable par chapitre, bouton lecture/pause et raccourcis clavier.

import { useEffect, useRef } from "react";
import { CH, TOTAL } from "../film/chapters";
import { film, useFilmState } from "../film/clock";
import { clamp } from "../film/math";

const fmt = (s: number) => {
  const t = Math.floor(s);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <rect x="3" y="2" width="3.5" height="12" rx="1" />
    <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4.5 2.5v11a.8.8 0 0 0 1.2.7l9-5.5a.8.8 0 0 0 0-1.4l-9-5.5a.8.8 0 0 0-1.2.7z" />
  </svg>
);

export function Timeline() {
  const { playing, chapter } = useFilmState();
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const tc = useRef<HTMLDivElement>(null);

  // Barres et timecode mis à jour hors React, à chaque avancée de T.
  useEffect(
    () =>
      film.onTick(() => {
        const T = film.T;
        CH.forEach((c, i) => {
          const el = fills.current[i];
          if (el) el.style.width = `${clamp((T - c.start) / c.duration) * 100}%`;
        });
        if (tc.current) tc.current.textContent = `${fmt(T)} / ${fmt(TOTAL)}`;
      }),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.code === "Space" && !target?.closest("a,button,input,textarea")) {
        e.preventDefault();
        film.togglePlaying();
      } else if (e.key === "ArrowRight") film.next();
      else if (e.key === "ArrowLeft") film.previous();
    };
    const onVisibility = () => {
      if (document.hidden) film.setPlaying(false);
    };
    addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <nav className="bar" aria-label="Chapitres du film">
      <button className="play" onClick={() => film.togglePlaying()} aria-label={playing ? "Pause" : "Lecture"}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div className="segs">
        {CH.map((c, i) => (
          <button
            key={c.key}
            className="seg"
            style={{ flex: `${c.duration} 1 0` }}
            aria-label={`Chapitre ${i + 1} : ${c.key}`}
            aria-current={i === chapter}
            onClick={() => film.seekChapter(i)}
          >
            <span className="track">
              <span className="fill" ref={(el) => void (fills.current[i] = el)} />
            </span>
            <span className="t">{c.key}</span>
          </button>
        ))}
      </div>
      <div className="tc" ref={tc}>
        00:00 / {fmt(TOTAL)}
      </div>
    </nav>
  );
}
