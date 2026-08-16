import { useEffect, useMemo, useState } from "react";
import { Scene } from "./components/Scene.jsx";
import { HUD } from "./components/HUD.jsx";
import { InfoPanel } from "./components/InfoPanel.jsx";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { Settings } from "./components/Settings.jsx";
import { ModelSwitcher } from "./components/ModelSwitcher.jsx";
import { models, DEFAULT_MODEL_ID } from "./data/models.js";
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
  const [activeModelId, setActiveModelId] = useState(DEFAULT_MODEL_ID);
  const [activeId, setActiveId] = useState(null);
  const [lastPick, setLastPick] = useState(null);
  const [camReadout, setCamReadout] = useState(null);
  // Settings owns the panel's contents, but its open state lives here so the
  // renderer stats are only sampled while the panel is actually on screen.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [perf, setPerf] = useState(null);

  const model = models.find((m) => m.id === activeModelId) ?? models[0];

  // Switching cars closes any open popup — the same component sits somewhere
  // completely different on the other model, so keeping it open would leave
  // the camera parked on a stale framing.
  function selectModel(id) {
    setActiveId(null);
    setActiveModelId(id);
  }

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

  const activeSpot = model.hotspots.find((h) => h.id === activeId) ?? null;

  return (
    <div className="app">
      <div className="canvas-wrap">
        <Scene
          model={model}
          activeId={activeId}
          onSelect={setActiveId}
          debug={debug}
          onDebugPick={setLastPick}
          onDebugCamera={setCamReadout}
          onPerfSample={settingsOpen ? setPerf : null}
          autoRotate={idleEnabled && idle}
        />
      </div>

      <HUD />
      <ModelSwitcher activeId={activeModelId} onSelect={selectModel} />
      <InfoPanel spot={activeSpot} onClose={() => setActiveId(null)} />
      <LoadingScreen />
      <Settings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        idleEnabled={idleEnabled}
        idleSeconds={idleSeconds}
        onChangeIdleEnabled={setIdleEnabled}
        onChangeIdleSeconds={setIdleSeconds}
        perf={perf}
      />

      {debug && (
        <div className="debug-readout">
          DEBUG MODE — click the model to log its coordinate
          {lastPick && (
            <div>
              [{lastPick.x.toFixed(2)}, {lastPick.y.toFixed(2)}, {lastPick.z.toFixed(2)}]
            </div>
          )}
          {camReadout && (
            <div className="debug-cam">
              view: {"{"} position: [{camReadout.position.join(", ")}], target: [
              {camReadout.target?.join(", ")}] {"}"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
