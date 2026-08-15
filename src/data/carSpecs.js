// Hotspot content + 3D placement. `position` values are calibrated against
// the real FS11_02 GLB (public/models/monopost.glb) by loading the app with
// ?debug=1 and clicking each part directly on the mesh. If the model is ever
// swapped for a differently-proportioned one, redo that: load ?debug=1,
// click the part you want a marker on, and copy the logged [x, y, z] here.
//
// This app is scoped to just the hybrid drivetrain — text content below is
// still placeholder (not pulled from culsracing.cz) — swap in the real
// write-ups whenever they're ready. Positions are real, given directly.
//
// HCU and Inverters sit only ~3.7cm apart in real life, so their marker
// dots would overlap on screen and always resolve taps to whichever is on
// top. `markerPosition` nudges just the dot's screen position apart
// (vertically) while `position` — the camera fly-to target — stays exact.
export const hotspots = [
  {
    id: "hsc",
    doc: "PY2026-HSC-001",
    label: "HSC",
    title: "Hybrid Battery (HSC)",
    position: [-0.04, 0.87, 0.01],
    summary:
      "Hybrid storage cell pack supplying the electric drive system, packaged low in the sidepod for a low centre of gravity.",
    specs: [
      { k: "Chemistry", v: "Lithium-ion" },
      { k: "Nominal voltage", v: "~400 V" },
    ],
  },
  {
    id: "hcu",
    doc: "PY2026-HCU-001",
    label: "HCU",
    title: "Hybrid Control Unit (HCU)",
    position: [0.54, 0.88, -0.02],
    markerPosition: [0.54, 1.03, -0.02],
    partModel: "/models/parts/hyra-control-unit.glb",
    summary:
      "HYRA hybrid control unit — governs power delivery between the combustion engine and the electric drive system, and manages battery charge/discharge.",
    specs: [
      { k: "Function", v: "Hybrid power management" },
      { k: "Interface", v: "CAN bus to ECU" },
    ],
  },
  {
    id: "motors",
    doc: "PY2026-MOT-001",
    label: "MOTORS",
    title: "Electric Motors",
    position: [0.51, 1.05, 0.61],
    partModel: "/models/parts/electric-motor.glb",
    summary:
      "Electric motors supplying supplementary drive torque, adding low-end acceleration the combustion engine alone can't deliver.",
    specs: [
      { k: "Type", v: "Permanent magnet synchronous" },
      { k: "Count", v: "1 per driven wheel" },
    ],
  },
  {
    id: "gearbox",
    doc: "PY2026-MGR-001",
    label: "GEARBOX",
    title: "Electric Gearbox",
    position: [0.51, 1.05, -0.53],
    summary:
      "Single-stage reduction gearset stepping each motor's output down to wheel speed, matched to the hybrid system's torque curve.",
    specs: [
      { k: "Layout", v: "Single-stage reduction" },
      { k: "Lubrication", v: "Sealed, grease-packed" },
    ],
  },
  {
    id: "inverters",
    doc: "PY2026-INV-001",
    label: "INVERTERS",
    title: "Hybrid Inverters",
    position: [0.57, 0.89, 0.0],
    markerPosition: [0.57, 0.74, 0.0],
    summary:
      "Inverters driving the hybrid motors, converting the HCU's torque request into phase current at the motor windings.",
    specs: [
      { k: "Function", v: "Motor phase current control" },
      { k: "Cooling", v: "Liquid-cooled" },
    ],
  },
];
