import { useEffect, useState } from "react";
import { TEAM_NAME, APP_NAME, SEASON } from "../config.js";

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString("en-GB", { hour12: false });
}

export function HUD() {
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
      <div className="hud-hint">DRAG TO ORBIT · PINCH TO ZOOM · TAP A MARKER FOR DETAILS</div>
    </>
  );
}
