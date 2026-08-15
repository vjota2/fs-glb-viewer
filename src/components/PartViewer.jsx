import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "./ErrorBoundary.jsx";
import { fitClone, computeFraming } from "../lib/fitModel.js";

const TARGET_LENGTH = 1;
const VIEW_DIR = new THREE.Vector3(0.9, 0.6, 0.9).normalize();
const FOV_DEG = 35;
const FALLBACK_FIT = { width: TARGET_LENGTH, depth: TARGET_LENGTH, height: TARGET_LENGTH };

function PartModel({ modelPath, onMeasured }) {
  const { scene } = useGLTF(modelPath);
  const { clone, fitted } = useMemo(() => fitClone(scene, TARGET_LENGTH), [scene]);

  useEffect(() => {
    onMeasured?.(fitted);
  }, [fitted, onMeasured]);

  return <primitive object={clone} />;
}

function PartUnavailable() {
  return (
    <Html center style={{ pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.06em",
          color: "#f3ca60",
          whiteSpace: "nowrap",
        }}
      >
        COMPONENT MODEL UNAVAILABLE
      </div>
    </Html>
  );
}

// Small standalone 3D preview embedded in the info popup — a separate Canvas
// with its own camera/lighting/controls, independent of the main car viewer.
// Auto-frames on the part's real measured size the same way the main Model
// does, since parts can be any shape/proportion.
export function PartViewer({ modelPath }) {
  const [fit, setFit] = useState(FALLBACK_FIT);
  const framing = useMemo(
    () => computeFraming(fit, { viewDir: VIEW_DIR, fovDeg: FOV_DEG, margin: 1.05 }),
    [fit]
  );
  const initialFraming = useMemo(
    () => computeFraming(FALLBACK_FIT, { viewDir: VIEW_DIR, fovDeg: FOV_DEG, margin: 1.05 }),
    []
  );

  return (
    <Canvas camera={{ position: initialFraming.position.toArray(), fov: FOV_DEG }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 2]} intensity={1.1} />
      <directionalLight position={[-2, 1.5, -1]} intensity={0.5} />
      <hemisphereLight args={["#eae6da", "#1a1a2e", 0.5]} />

      <Suspense fallback={null}>
        <ErrorBoundary fallback={<PartUnavailable />} resetKey={modelPath}>
          <PartModel modelPath={modelPath} onMeasured={setFit} />
        </ErrorBoundary>
      </Suspense>

      <OrbitControls
        autoRotate
        autoRotateSpeed={2}
        enablePan={false}
        minDistance={framing.position.length() * 0.4}
        maxDistance={framing.position.length() * 2.5}
        target={framing.target.toArray()}
      />
    </Canvas>
  );
}
