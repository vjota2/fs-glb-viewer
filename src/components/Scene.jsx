import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "./ErrorBoundary.jsx";
import { Model } from "./Model.jsx";
import { MissingModel } from "./MissingModel.jsx";
import { Hotspot } from "./Hotspot.jsx";
import { hotspots } from "../data/carSpecs.js";
import { computeFraming } from "../lib/fitModel.js";
import { CAR_LENGTH, CAR_WIDTH, CAR_HEIGHT } from "../config.js";

const FOV_DEG = 40;
const VIEW_DIR = new THREE.Vector3(0.8, 0.35, 0.8).normalize();
const ZOOM_DISTANCE = 1.0;

// Config values are only the fallback used before the real GLB reports its
// measured size (or if it fails to load) — see Model.jsx's onMeasured.
const FALLBACK_FIT = { width: CAR_LENGTH, depth: CAR_WIDTH, height: CAR_HEIGHT };

// Fits the whole model in view regardless of its actual proportions: frames
// on its true bounding-sphere so a tall/narrow or short/wide GLB is still
// centered and fully visible, instead of assuming fixed HoneyBadger-ish
// dimensions.
function computeDefaultFraming(fit) {
  return computeFraming(fit, { viewDir: VIEW_DIR, fovDeg: FOV_DEG, margin: 1.3 });
}

// Flies the camera to a hotspot (or back to the default view) whenever
// activeSpot/defaultFraming changes, then hands control back to
// OrbitControls. Runs as a one-shot animation rather than a continuous
// lerp-toward-target every frame — otherwise it would fight the user's
// manual orbit/zoom drag whenever no hotspot is selected.
// Slides a framing sideways so the subject clears the info panel, which covers
// the right edge for exactly as long as a hotspot is open. Without this the
// part we just flew to ends up underneath the panel on narrower screens.
function offsetPastPanel(position, target, size) {
  const panelWidth =
    document.querySelector(".info-panel")?.getBoundingClientRect().width ?? 0;
  const covered = size.width ? Math.min(panelWidth / size.width, 0.85) : 0;
  if (covered <= 0) return;

  const distance = position.distanceTo(target);
  const visibleWidth =
    2 *
    distance *
    Math.tan(THREE.MathUtils.degToRad(FOV_DEG) / 2) *
    (size.width / size.height);

  const right = new THREE.Vector3()
    .subVectors(target, position)
    .normalize()
    .cross(new THREE.Vector3(0, 1, 0))
    .normalize();

  const shift = (covered / 2) * visibleWidth;
  position.addScaledVector(right, shift);
  target.addScaledVector(right, shift);
}

function CameraRig({ activeSpot, defaultFraming, controlsRef }) {
  const { camera, size } = useThree();
  const target = useRef(defaultFraming.target.clone());
  const position = useRef(defaultFraming.position.clone());
  const animating = useRef(false);

  useEffect(() => {
    if (activeSpot) {
      // A hotspot can pin its own framing (`view`) so the part is seen from an
      // angle that isn't blocked by bodywork — the generic VIEW_DIR approach
      // below flies in along one fixed diagonal, which buries anything sitting
      // behind a wheel or sidepod. See carSpecs.js for how these are authored.
      const view = activeSpot.view;
      if (view) {
        target.current.set(...(view.target ?? activeSpot.position));
        position.current.set(...view.position);
      } else {
        target.current.set(...activeSpot.position);
        position.current
          .copy(target.current)
          .addScaledVector(VIEW_DIR, ZOOM_DISTANCE);
      }
      offsetPastPanel(position.current, target.current, size);
    } else {
      target.current.copy(defaultFraming.target);
      position.current.copy(defaultFraming.position);
    }
    animating.current = true;
    if (controlsRef.current) controlsRef.current.enabled = false;
  }, [activeSpot, defaultFraming, controlsRef, size]);

  useFrame((_, delta) => {
    if (!animating.current || !controlsRef.current) return;

    const t = 1 - Math.pow(0.0001, delta);
    camera.position.lerp(position.current, t);
    controlsRef.current.target.lerp(target.current, t);
    controlsRef.current.update();

    if (camera.position.distanceTo(position.current) < 0.005) {
      animating.current = false;
      controlsRef.current.enabled = true;
    }
  });

  return null;
}

// Debug-only: reports the live camera position/target so a good framing can be
// found by orbiting manually and then pasted into a hotspot's `view`.
// Throttled — this drives React state, and per-frame updates would be wasteful.
function CameraReadout({ controlsRef, onChange }) {
  const { camera } = useThree();
  const lastSent = useRef(0);

  // Also park them on window so a candidate framing can be tried straight from
  // the console — `__viewer.set([x,y,z], [tx,ty,tz])` — instead of edit/reload
  // cycles. Debug builds only; nothing in the app reads this.
  useEffect(() => {
    window.__viewer = {
      camera,
      controls: controlsRef,
      set(position, target) {
        camera.position.set(...position);
        if (target) controlsRef.current?.target.set(...target);
        controlsRef.current?.update();
      },
    };
    return () => delete window.__viewer;
  }, [camera, controlsRef]);

  useFrame(() => {
    const now = performance.now();
    if (now - lastSent.current < 250) return;
    lastSent.current = now;

    const round = (v) => Math.round(v * 100) / 100;
    onChange({
      position: camera.position.toArray().map(round),
      target: controlsRef.current?.target.toArray().map(round) ?? null,
    });
  });

  return null;
}

export function Scene({
  activeId,
  onSelect,
  debug,
  onDebugPick,
  onDebugCamera,
  autoRotate,
}) {
  const controlsRef = useRef();
  const [fit, setFit] = useState(FALLBACK_FIT);
  const activeSpot = useMemo(
    () => hotspots.find((h) => h.id === activeId) ?? null,
    [activeId]
  );
  const defaultFraming = useMemo(() => computeDefaultFraming(fit), [fit]);
  const initialFraming = useMemo(() => computeDefaultFraming(FALLBACK_FIT), []);

  return (
    <Canvas
      shadows
      camera={{ position: initialFraming.position.toArray(), fov: FOV_DEG }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#0d0d16"]} />
      <fog attach="fog" args={["#0d0d16", 10, 20]} />

      {/* Even, soft studio-style rig: bright ambient/hemisphere base fill plus
          key/fill/top/rim directionals from every side, so the car reads
          evenly lit like a product shot instead of one moody hero light. */}
      <ambientLight intensity={0.8} />
      <hemisphereLight args={["#eae6da", "#1a1a2e", 0.55]} />
      <directionalLight position={[3, 6, 4]} intensity={1.0} />
      <directionalLight position={[-4, 3, -2]} intensity={0.65} />
      <directionalLight position={[0, 9, 0.5]} intensity={0.9} />
      <directionalLight position={[-2, 4, -6]} intensity={0.5} color="#f3ca60" />

      <Suspense fallback={null}>
        <ErrorBoundary fallback={<MissingModel />}>
          <Model
            onMeasured={setFit}
            onClick={(e) => {
              if (debug) {
                e.stopPropagation();
                onDebugPick(e.point);
                return;
              }
              // Clicking the car body itself counts as a "hit" to R3F, so
              // onPointerMissed (which closes the popup on background/grid
              // clicks) never fires for it — close explicitly here instead.
              onSelect(null);
            }}
          />
        </ErrorBoundary>
      </Suspense>

      <Grid
        position={[0, 0.001, 0]}
        args={[20, 20]}
        cellColor="#ffffff"
        cellThickness={0.5}
        sectionColor="#f3ca60"
        sectionThickness={0.7}
        fadeDistance={12}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.55}
        scale={CAR_LENGTH * 3}
        blur={2.5}
        far={CAR_HEIGHT}
        frames={1}
      />

      {hotspots.map((spot) => (
        <Hotspot
          key={spot.id}
          spot={spot}
          active={spot.id === activeId}
          onSelect={onSelect}
        />
      ))}

      <CameraRig
        activeSpot={activeSpot}
        defaultFraming={defaultFraming}
        controlsRef={controlsRef}
      />
      {debug && (
        <CameraReadout controlsRef={controlsRef} onChange={onDebugCamera} />
      )}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={0.6}
        maxDistance={CAR_LENGTH * 3}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={initialFraming.target.toArray()}
        autoRotate={autoRotate && !activeSpot}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
