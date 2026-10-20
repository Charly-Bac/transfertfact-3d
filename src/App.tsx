import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { film, useFilmState } from "./film/clock";
import { ChapterCopy } from "./ui/ChapterCopy";
import { Header } from "./ui/Header";
import { Timeline } from "./ui/Timeline";

// La 3D est chargée à part : le texte et la timeline s'affichent avant elle, et même sans elle.
const Scene = lazy(() => import("./scene/Scene").then((m) => ({ default: m.Scene })));

const WEBGL_ERROR = "La 3D n'a pas pu se charger sur cet appareil : le texte du film reste lisible chapitre par chapitre.";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error(error);
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function App() {
  const { fading } = useFilmState();
  const [webgl] = useState(hasWebGL);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(webgl ? "loading" : "error");
  const onReady = useCallback(() => setStatus("ready"), []);
  const onError = useCallback(() => setStatus("error"), []);

  useEffect(() => film.start(), []);

  return (
    <div className="app">
      <Header />
      <main className="stage" id="stage">
        {webgl && (
          <SceneBoundary onError={onError}>
            <Suspense fallback={null}>
              <Scene onReady={onReady} />
            </Suspense>
          </SceneBoundary>
        )}
        {status !== "ready" && (
          <div className={`loading${status === "error" ? " err" : ""}`} role="status">
            {status === "error" ? WEBGL_ERROR : "Préparation du film…"}
          </div>
        )}
        <div className="veil" />
        <div className="labels" id="labels" />
        <ChapterCopy />
        <Timeline />
        <div className={`fade${fading ? " on" : ""}`} />
      </main>
    </div>
  );
}
