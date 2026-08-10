import { useMemo, useState } from "react";
import { Scene } from "./components/Scene.jsx";
import { HUD } from "./components/HUD.jsx";
import { InfoPanel } from "./components/InfoPanel.jsx";
import { LoadingScreen } from "./components/LoadingScreen.jsx";
import { hotspots } from "./data/carSpecs.js";

export default function App() {
  const [activeId, setActiveId] = useState(null);
  const [lastPick, setLastPick] = useState(null);

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
        />
      </div>

      <HUD />
      <InfoPanel spot={activeSpot} onClose={() => setActiveId(null)} />
      <LoadingScreen />

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
