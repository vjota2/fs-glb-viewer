import { useCallback, useEffect, useState } from "react";
import { CollapseIcon, ExpandIcon } from "./icons.jsx";

// Safari still ships the API prefixed, and an iPad is a likely kiosk device.
const fullscreenElement = () =>
  document.fullscreenElement ?? document.webkitFullscreenElement ?? null;

const fullscreenAllowed = () =>
  document.fullscreenEnabled || document.webkitFullscreenEnabled || false;

// Kiosk fullscreen toggle. Hidden in debug builds, where the coordinate
// readout occupies this corner — and where the browser chrome is wanted
// anyway, since that's the mode you calibrate hotspots in.
export function FullscreenButton() {
  const [active, setActive] = useState(false);

  // Fullscreen can also be left with Esc or a system gesture, so the button's
  // state follows the document rather than assuming its own clicks are the
  // only way in and out.
  useEffect(() => {
    const sync = () => setActive(!!fullscreenElement());
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    sync();
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    const request = root.requestFullscreen ?? root.webkitRequestFullscreen;
    const exit = document.exitFullscreen ?? document.webkitExitFullscreen;

    // Both reject if the gesture isn't trusted or the device refuses; there's
    // nothing to recover, and an unhandled rejection would just noise the
    // console at the booth.
    if (fullscreenElement()) {
      Promise.resolve(exit?.call(document)).catch(() => {});
    } else {
      Promise.resolve(request?.call(root)).catch(() => {});
    }
  }, []);

  // Some browsers — notably Safari on iPhone — have no fullscreen at all. A
  // button that silently does nothing is worse than no button.
  if (!fullscreenAllowed()) return null;

  return (
    <button
      className="fullscreen-btn"
      onClick={toggle}
      aria-label={active ? "Exit fullscreen" : "Enter fullscreen"}
      title={active ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {active ? <CollapseIcon /> : <ExpandIcon />}
    </button>
  );
}
