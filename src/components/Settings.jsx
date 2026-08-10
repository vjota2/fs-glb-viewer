import { useEffect, useState } from "react";

const MIN_IDLE_SECONDS = 5;
const MAX_IDLE_SECONDS = 600;

export function Settings({
  idleEnabled,
  idleSeconds,
  onChangeIdleEnabled,
  onChangeIdleSeconds,
}) {
  const [open, setOpen] = useState(false);
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
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
      >
        ⚙
      </button>

      {open && (
        <div className="settings-panel">
          <div className="settings-panel-head">
            <span>SETTINGS</span>
            <button
              className="settings-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              ✕
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
        </div>
      )}
    </>
  );
}
