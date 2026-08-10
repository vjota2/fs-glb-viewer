import { useEffect, useMemo, useState } from "react";
import { Scene } from "./components/Scene.jsx";
import { HUD } from "./components/HUD.jsx";
import { InfoPanel } from "./components/InfoPanel.jsx";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { Settings } from "./components/Settings.jsx";
import { hotspots } from "./data/carSpecs.js";
import { DEFAULT_IDLE_ENABLED, DEFAULT_IDLE_SECONDS } from "./config.js";

const IDLE_ENABLED_KEY = "hb-idle-enabled";
const IDLE_SECONDS_KEY = "hb-idle-seconds";

function readStoredBool(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw === null ? fallback : raw === "true";
}

function readStoredNumber(key, fallback) {
  const raw = localStorage.getItem(key);
  const n = Number(raw);
  return raw === null || Number.isNaN(n) ? fallback : n;
}

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const [lastPick, setLastPick] = useState(null);

  const [idleEnabled, setIdleEnabled] = useState(() =>
    readStoredBool(IDLE_ENABLED_KEY, DEFAULT_IDLE_ENABLED)
  );
  const [idleSeconds, setIdleSeconds] = useState(() =>
    readStoredNumber(IDLE_SECONDS_KEY, DEFAULT_IDLE_SECONDS)
  );
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    localStorage.setItem(IDLE_ENABLED_KEY, String(idleEnabled));
  }, [idleEnabled]);

  useEffect(() => {
    localStorage.setItem(IDLE_SECONDS_KEY, String(idleSeconds));
  }, [idleSeconds]);

  // Any pointer/wheel/key activity resets the idle clock. Once it elapses,
  // `idle` flips true — the effect below closes any open hotspot popup, and
  // that prop flows into Scene to hand the camera to auto-rotate demo mode.
  useEffect(() => {
    if (!idleEnabled) {
      setIdle(false);
      return;
    }

    let timeoutId;
    const reset = () => {
      setIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIdle(true), idleSeconds * 1000);
    };

    const events = ["pointerdown", "wheel", "keydown"];
    events.forEach((evt) => window.addEventListener(evt, reset));
    reset();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((evt) => window.removeEventListener(evt, reset));
    };
  }, [idleEnabled, idleSeconds]);

  useEffect(() => {
    if (idle) setActiveId(null);
  }, [idle]);

  const debug = useMemo(
    () => new URLSearchParams(window.location.search).has("debug"),
    []
  );

  const activeSpot = hotspots.find((h) => h.id === activeId) ?? null;

  return (
    <div className="app">
      <div className="canvas-wrap">
        <Scene
          activeId={activeId}
          onSelect={setActiveId}
          debug={debug}
          onDebugPick={setLastPick}
          autoRotate={idleEnabled && idle}
        />
      </div>

      <HUD />
      <InfoPanel spot={activeSpot} onClose={() => setActiveId(null)} />
      <LoadingScreen />
      <Settings
        idleEnabled={idleEnabled}
        idleSeconds={idleSeconds}
        onChangeIdleEnabled={setIdleEnabled}
        onChangeIdleSeconds={setIdleSeconds}
      />

      {debug && (
        <div className="debug-readout">
          DEBUG MODE — click the model to log its coordinate
          {lastPick && (
            <div>
              [{lastPick.x.toFixed(2)}, {lastPick.y.toFixed(2)}, {lastPick.z.toFixed(2)}]
            </div>
          )}
        </div>
      )}
    </div>
  );
}
