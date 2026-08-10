import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

const BOOT_LINES = [
  "CONNECTING TO RENDER ENGINE",
  "READING GEOMETRY BUFFER",
  "BUILDING MESH TOPOLOGY",
  "COMPUTING SURFACE NORMALS",
  "BINDING MATERIALS",
  "ARMING CAMERA RIG",
];

export function LoadingScreen() {
  const { progress, active } = useProgress();
  const [shownLines, setShownLines] = useState(1);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [forceDone, setForceDone] = useState(false);

  useEffect(() => {
    const step = Math.min(
      BOOT_LINES.length,
      1 + Math.floor((progress / 100) * BOOT_LINES.length)
    );
    setShownLines(step);
  }, [progress]);

  // Keep the boot sequence on screen for a beat even if loading is instant,
  // and force it away after a few seconds in case nothing ever registers
  // with the loading manager (e.g. the GLB 404s straight into the fallback).
  useEffect(() => {
    const t1 = setTimeout(() => setMinTimeElapsed(true), 1100);
    const t2 = setTimeout(() => setForceDone(true), 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const done = forceDone || (progress >= 100 && !active && minTimeElapsed);

  return (
    <div className={`loading-screen${done ? " hidden" : ""}`}>
      {BOOT_LINES.slice(0, shownLines).map((line, i) => (
        <div className="loading-line" key={line}>
          &gt; {line}
          {i < shownLines - 1 ? <span className="ok"> · OK</span> : "..."}
        </div>
      ))}
      <div className="loading-bar">
        <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
