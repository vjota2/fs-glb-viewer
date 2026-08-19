import { Suspense, useEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Grid,
  Html,
  Lightformer,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import { ErrorBoundary } from "./ErrorBoundary.jsx";
import { Model } from "./Model.jsx";
import { MissingModel } from "./MissingModel.jsx";
import { Hotspot } from "./Hotspot.jsx";
import { computeFraming } from "../lib/fitModel.js";

const FOV_DEG = 40;
const VIEW_DIR = new THREE.Vector3(0.8, 0.35, 0.8).normalize();
const ZOOM_DISTANCE = 1.0;

// The model's declared dimensions are only the fallback used before its GLB
// reports a measured size (or if it fails to load) — see Model.jsx.
const fallbackFit = (model) => ({
  width: model.length,
  depth: model.width,
  height: model.height,
});

// Fits the whole model in view regardless of its actual proportions: frames
// on its true bounding-sphere so a tall/narrow or short/wide GLB is still
// centered and fully visible, instead of assuming fixed HoneyBadger-ish
// dimensions.
function computeDefaultFraming(fit) {
  return computeFraming(fit, { viewDir: VIEW_DIR, fovDeg: FOV_DEG, margin: 1.3 });
}

// Shown while a model's GLB is in flight. The boot LoadingScreen only covers
// the very first load, so without this, switching models — the rally car is
// ~15MB — would sit on an empty grid with no feedback.
function ModelLoading() {
  return (
    <Html center style={{ pointerEvents: "none" }}>
      <div className="model-loading">LOADING MODEL...</div>
    </Html>
  );
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

// Lighting matched to the team site's own car viewer, which renders through
// <model-viewer environment-image="neutral"> — image-based lighting, not a set
// of lamps. That distinction is the whole reason a directional rig couldn't
// reproduce it: an IBL environment lights every surface from every direction
// at once, so a car reads evenly wherever you orbit, while stacking
// directionals always leaves a lit side and a falling-away side.
//
// The environment is built here out of emissive panels rather than loaded from
// an HDRI, so there's no CDN fetch — the kiosk keeps working on a dead venue
// network, and there's no multi-megabyte texture in the first paint. `frames={1}`
// bakes it once instead of re-rendering the cube map every frame.
//
// The directionals that remain only shape highlights on top of that base. One
// environment serves both cars: an earlier attempt tuned lamps per model to
// stop the black livery going flat, but that was compensating for the wrong
// thing — with IBL doing the work, neither car needs its own rig.
function StudioLights() {
  return (
    <>
      <Environment resolution={256} frames={1}>
        {/* Neutral studio box: broad soft source overhead, panels on all four
            sides so nothing is left unlit. */}
        {/* Panel brightnesses are kept close together on purpose. A single very
            bright ceiling lights the car nicely but is also what the bodywork
            *reflects*, and on anything semi-gloss that reflection blows out
            into a white smear — the wet-paint look. Flattening the contrast
            between panels removes the hotspot while keeping the wrap, and the
            shaping directionals below put the form back. */}
        <Lightformer
          intensity={1.6}
          form="rect"
          position={[0, 6, 0]}
          rotation-x={Math.PI / 2}
          scale={[12, 12, 1]}
        />
        <Lightformer intensity={1.1} form="rect" position={[0, 1.5, 7]} scale={[12, 5, 1]} />
        <Lightformer
          intensity={1.1}
          form="rect"
          position={[0, 1.5, -7]}
          rotation-y={Math.PI}
          scale={[12, 5, 1]}
        />
        <Lightformer
          intensity={1.0}
          form="rect"
          position={[7, 1.5, 0]}
          rotation-y={-Math.PI / 2}
          scale={[12, 5, 1]}
        />
        <Lightformer
          intensity={1.0}
          form="rect"
          position={[-7, 1.5, 0]}
          rotation-y={Math.PI / 2}
          scale={[12, 5, 1]}
        />
      </Environment>

      {/* Shaping only — the environment above carries the base exposure. */}
      <directionalLight position={[3, 6, 4]} intensity={0.8} />
      <directionalLight position={[-4, 3, -2]} intensity={0.45} />
      <directionalLight position={[-2, 4, -6]} intensity={0.3} color="#f3ca60" />
    </>
  );
}

// Samples renderer stats for the settings panel's performance readout. Only
// mounted while that panel is open — the numbers drive React state, and
// re-rendering the scene twice a second for a readout nobody is looking at
// would cost more than it measures.
//
// A frame can involve several render passes (drei's ContactShadows renders to
// its own target, for one), and each one resets the counters while autoReset
// is on — read them afterwards and you get whichever small pass happened to go
// last, not the scene. So take ownership of the reset: let the counts
// accumulate across every pass in a frame, then clear them once per frame
// here. useFrame runs before the draw, so each read covers the frame before.
function PerfMonitor({ onSample }) {
  const { gl } = useThree();
  const frames = useRef(0);
  const since = useRef(performance.now());
  const latest = useRef(null);

  useEffect(() => {
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);

  useFrame(() => {
    frames.current += 1;
    latest.current = {
      calls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
    };
    gl.info.reset();

    const now = performance.now();
    const elapsed = now - since.current;
    if (elapsed < 500) return;

    onSample({
      fps: Math.round((frames.current * 1000) / elapsed),
      frameMs: Math.round((elapsed / frames.current) * 10) / 10,
      ...latest.current,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      programs: gl.info.programs?.length ?? 0,
      // Chrome-only; other browsers report nothing rather than a wrong number.
      heapMb: performance.memory
        ? Math.round(performance.memory.usedJSHeapSize / 1048576)
        : null,
    });

    frames.current = 0;
    since.current = now;
  });

  return null;
}

// Debug-only: reports the live camera position/target so a good framing can be
// found by orbiting manually and then pasted into a hotspot's `view`.
// Throttled — this drives React state, and per-frame updates would be wasteful.
function CameraReadout({ controlsRef, onChange }) {
  const { camera, scene } = useThree();
  const lastSent = useRef(0);

  // Also park them on window so a candidate framing can be tried straight from
  // the console — `__viewer.set([x,y,z], [tx,ty,tz])` — instead of edit/reload
  // cycles. Debug builds only; nothing in the app reads this.
  useEffect(() => {
    window.__viewer = {
      camera,
      scene,
      controls: controlsRef,
      set(position, target) {
        camera.position.set(...position);
        if (target) controlsRef.current?.target.set(...target);
        controlsRef.current?.update();
      },
    };
    return () => delete window.__viewer;
  }, [camera, scene, controlsRef]);

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
  model,
  activeId,
  onSelect,
  debug,
  onDebugPick,
  onDebugCamera,
  onPerfSample,
  autoRotate,
}) {
  const controlsRef = useRef();
  const [fit, setFit] = useState(() => fallbackFit(model));

  // Fall back to the incoming model's own dimensions the moment it changes,
  // so the camera reframes immediately rather than holding the outgoing
  // model's measurements until the new GLB finishes loading.
  useEffect(() => setFit(fallbackFit(model)), [model]);

  const activeSpot = useMemo(
    () => model.hotspots.find((h) => h.id === activeId) ?? null,
    [model, activeId]
  );
  const defaultFraming = useMemo(() => computeDefaultFraming(fit), [fit]);
  const initialFraming = useMemo(
    () => computeDefaultFraming(fallbackFit(model)),
    // Only the first frame's camera prop — later changes go through the rig.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Canvas
      shadows
      camera={{ position: initialFraming.position.toArray(), fov: FOV_DEG }}
      // Khronos PBR Neutral, matching the tone curve the team site's
      // <model-viewer> uses. R3F otherwise defaults to ACES Filmic, which
      // rolls bright values toward white — that white-clipping is what turned
      // specular highlights into the blown-out "wet paint" smears, and no
      // amount of light or roughness tuning fixes a tone curve.
      gl={{ toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#0d0d16"]} />
      <fog attach="fog" args={["#0d0d16", 10, 20]} />

      <StudioLights />

      <Suspense fallback={<ModelLoading />}>
        <ErrorBoundary fallback={<MissingModel model={model} />} resetKey={model.id}>
          <Model
            key={model.id}
            model={model}
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
        key={model.id}
        position={[0, 0.002, 0]}
        opacity={0.55}
        scale={model.length * 3}
        blur={2.5}
        far={model.height}
        frames={1}
      />

      {model.hotspots.map((spot) => (
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
      {onPerfSample && <PerfMonitor onSample={onPerfSample} />}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={0.6}
        maxDistance={model.length * 3}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={initialFraming.target.toArray()}
        autoRotate={autoRotate && !activeSpot}
        autoRotateSpeed={0.6}
      />
    </Canvas>
  );
}
