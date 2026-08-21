import { useEffect, useState } from "react";
import { CloseIcon, GearIcon } from "./icons.jsx";

const MIN_IDLE_SECONDS = 5;
const MAX_IDLE_SECONDS = 600;

// Triangle counts run into the millions, which is unreadable as raw digits.
function compact(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
}

// 60fps is the ceiling on most displays, so treat "near the refresh rate" as
// good rather than expecting a fixed number.
function fpsClass(fps) {
  if (fps >= 50) return " good";
  if (fps >= 30) return " warn";
  return " bad";
}

function PerfReadout({ perf }) {
  if (!perf) {
    return (
      <div className="settings-row perf-row">
        <span>SAMPLING…</span>
      </div>
    );
  }

  const rows = [
    ["FPS", `${perf.fps}`, fpsClass(perf.fps)],
    ["FRAME", `${perf.frameMs} ms`],
    ["DRAW CALLS", compact(perf.calls)],
    ["TRIANGLES", compact(perf.triangles)],
    ["GEOMETRIES", compact(perf.geometries)],
    ["TEXTURES", compact(perf.textures)],
    ["SHADERS", compact(perf.programs)],
    ...(perf.heapMb === null ? [] : [["JS HEAP", `${perf.heapMb} MB`]]),
  ];

  return rows.map(([label, value, tone = ""]) => (
    <div className="settings-row perf-row" key={label}>
      <span>{label}</span>
      <span className={`perf-value${tone}`}>{value}</span>
    </div>
  ));
}

export function Settings({
  open,
  onOpenChange,
  idleEnabled,
  idleSeconds,
  onChangeIdleEnabled,
  onChangeIdleSeconds,
  perf,
}) {
  const [secondsInput, setSecondsInput] = useState(String(idleSeconds));

  useEffect(() => {
    setSecondsInput(String(idleSeconds));
  }, [idleSeconds]);

  function commitSeconds() {
    const n = Number(secondsInput);
    const clamped = Number.isNaN(n)
      ? idleSeconds
      : Math.min(MAX_IDLE_SECONDS, Math.max(MIN_IDLE_SECONDS, Math.round(n)));
    setSecondsInput(String(clamped));
    onChangeIdleSeconds(clamped);
  }

  return (
    <>
      <button
        className="settings-btn"
        onClick={() => onOpenChange(!open)}
        aria-label="Settings"
      >
        <GearIcon />
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-panel-head">
            <span>SETTINGS</span>
            <button
              className="settings-panel-close"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <label className="settings-row">
            <span>IDLE CAMERA</span>
            <span
              className={`toggle${idleEnabled ? " on" : ""}`}
              role="switch"
              aria-checked={idleEnabled}
              tabIndex={0}
              onClick={() => onChangeIdleEnabled(!idleEnabled)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChangeIdleEnabled(!idleEnabled);
                }
              }}
            >
              <span className="toggle-knob" />
            </span>
          </label>

          <label className="settings-row">
            <span>IDLE TIME (S)</span>
            <input
              type="number"
              className="settings-number"
              min={MIN_IDLE_SECONDS}
              max={MAX_IDLE_SECONDS}
              value={secondsInput}
              disabled={!idleEnabled}
              onChange={(e) => setSecondsInput(e.target.value)}
              onBlur={commitSeconds}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
            />
          </label>

          <div className="settings-section">PERFORMANCE</div>
          <PerfReadout perf={perf} />
        </div>
      )}
    </>
  );
}
