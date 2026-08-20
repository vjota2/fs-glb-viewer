// Hotspot content + 3D placement, per model.
//
// The 5 hybrid components are the same wherever they're shown, so their text
// lives once in `components` below; only *where* they sit changes per model.
// Text content is still placeholder (not pulled from culsracing.cz) — swap in
// the real write-ups whenever they're ready.
//
// `position` values are calibrated against the real GLB by loading the app
// with ?debug=1 and clicking the part directly on the mesh; `view` pins the
// camera framing used when the hotspot opens. See the README for both
// workflows — and redo them per model, since the two cars are shaped nothing
// alike.
const components = {
  hsc: {
    doc: "PY2026-HSC-001",
    label: "HSC",
    title: "Hybrid Battery (HSC)",
    summary:
      "Hybrid storage cell pack supplying the electric drive system, packaged low in the sidepod for a low centre of gravity.",
    specs: [
      { k: "Chemistry", v: "Lithium-ion" },
      { k: "Nominal voltage", v: "~400 V" },
    ],
  },
  hcu: {
    doc: "PY2026-HCU-001",
    label: "HCU",
    title: "Hybrid Control Unit (HCU)",
    partModel: "/models/parts/hyra-control-unit.glb",
    summary:
      "HYRA hybrid control unit — governs power delivery between the combustion engine and the electric drive system, and manages battery charge/discharge.",
    specs: [
      { k: "Function", v: "Hybrid power management" },
      { k: "Interface", v: "CAN bus to ECU" },
    ],
  },
  motors: {
    doc: "PY2026-MOT-001",
    label: "MOTORS",
    title: "Electric Motors",
    partModel: "/models/parts/electric-motor.glb",
    summary:
      "Electric motors supplying supplementary drive torque, adding low-end acceleration the combustion engine alone can't deliver.",
    specs: [
      { k: "Type", v: "Permanent magnet synchronous" },
      { k: "Count", v: "1 per driven wheel" },
    ],
  },
  gearbox: {
    doc: "PY2026-MGR-001",
    label: "GEARBOX",
    title: "Electric Gearbox",
    summary:
      "Single-stage reduction gearset stepping each motor's output down to wheel speed, matched to the hybrid system's torque curve.",
    specs: [
      { k: "Layout", v: "Single-stage reduction" },
      { k: "Lubrication", v: "Sealed, grease-packed" },
    ],
  },
  inverters: {
    doc: "PY2026-INV-001",
    label: "INVERTERS",
    title: "Hybrid Inverters",
    partModel: "/models/parts/hybrid-inverter.glb",
    summary:
      "Inverters driving the hybrid motors, converting the HCU's torque request into phase current at the motor windings.",
    specs: [
      { k: "Function", v: "Motor phase current control" },
      { k: "Cooling", v: "Liquid-cooled" },
    ],
  },
};

const place = (id, placement) => ({ id, ...components[id], ...placement });

// HCU and inverters sit only ~3.7cm apart on the monopost, so their marker
// dots would overlap on screen and always resolve taps to whichever is on
// top. `markerPosition` nudges just the dot apart (vertically) while
// `position` — the camera fly-to target — stays exact.
export const monopostHotspots = [
  place("hsc", {
    position: [-0.04, 0.87, 0.01],
    view: { position: [0.64, 2.15, 3.54], target: [-0.04, 0.95, 0.01] },
  }),
  place("hcu", {
    position: [0.54, 0.88, -0.02],
    markerPosition: [0.54, 1.03, -0.02],
    view: { position: [2.3, 1.98, 2.1], target: [0.54, 0.95, -0.02] },
  }),
  place("motors", {
    position: [0.51, 1.05, 0.61],
    view: { position: [1.55, 2.0, 3.03], target: [0.51, 1.05, 0.61] },
  }),
  place("gearbox", {
    position: [0.51, 1.05, -0.53],
    view: { position: [1.55, 2.0, -2.95], target: [0.51, 1.05, -0.53] },
  }),
  place("inverters", {
    position: [0.57, 0.89, 0.0],
    markerPosition: [0.57, 0.74, 0.0],
    view: { position: [2.33, 1.98, -2.12], target: [0.57, 0.95, 0.0] },
  }),
];

// Placements on the rally car — where the same system would sit in a customer
// vehicle. Calibrated against rally-car.glb with ?debug=1; the car runs
// nose-to-tail along +X (nose at +X) once models.js has rotated it.
export const rallyCarHotspots = [
  // Pack under the boot floor, behind the rear axle — the usual place to put
  // this much mass in a hatchback without eating cabin space.
  place("hsc", {
    position: [-1.45, 0.55, 0],
    view: { position: [-4.21, 2.24, 3.34], target: [-1.45, 0.7, 0] },
  }),
  // HCU and inverters share the engine bay either side of the i4, so they get
  // opposite sides — and mirrored views — rather than the vertical nudge the
  // monopost needed to keep their markers apart.
  place("hcu", {
    position: [1.55, 0.88, -0.35],
    view: { position: [3.9, 2.2, -2.6], target: [1.55, 0.9, -0.35] },
  }),
  place("inverters", {
    position: [1.55, 0.88, 0.35],
    view: { position: [3.9, 2.2, 2.6], target: [1.55, 0.9, 0.35] },
  }),
  // At the front hub, matching the "1 per driven wheel" spec.
  place("motors", {
    position: [1.36, 0.42, 0.78],
    view: { position: [2.6, 1.56, 3.98], target: [1.36, 0.5, 0.78] },
  }),
  // Transmission, just aft of the engine. Framed side-on down the sill rather
  // than over the wheel, so it doesn't read as another shot of the hub.
  place("gearbox", {
    position: [0.95, 0.42, 0],
    view: { position: [0.9, 1.35, 4.9], target: [0.95, 0.45, 0] },
  }),
];
