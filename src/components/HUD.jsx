import { useEffect, useState } from "react";
import { TEAM_NAME, APP_NAME, SEASON } from "../config.js";
import { TouchIcon } from "./icons.jsx";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-GB", { hour12: false });
}

export function HUD({ idle = false }) {
  const time = useClock();

  return (
    <>
      <div className="hud-top">
        <div className="hud-brand">
          <span className="team">{TEAM_NAME}</span>
          <span className="car">{APP_NAME}</span>
        </div>
        <div className="hud-status">
          <span>
            <span className="dot">■</span> SYS: ONLINE
          </span>
          <span>SEASON: {SEASON}</span>
          <span>{time}</span>
        </div>
      </div>
      {/* Both live in the same bottom-centre slot, so they swap rather than
          stack — a demo-mode prompt competing with the controls legend would
          just be two lines of small type saying different things. */}
      {idle ? (
        <div className="idle-hint" role="status">
          <TouchIcon />
          <span>TOUCH TO EXPLORE</span>
        </div>
      ) : (
        <div className="hud-hint">DRAG TO ORBIT · PINCH TO ZOOM · TAP A MARKER FOR DETAILS</div>
      )}
    </>
  );
}
