// Hotspot content + 3D placement. `position` values are calibrated against
// the real FS11_02 GLB (public/models/monopost.glb) by loading the app with
// ?debug=1 and clicking each part directly on the mesh. If the model is ever
// swapped for a differently-proportioned one, redo that: load ?debug=1,
// click the part you want a marker on, and copy the logged [x, y, z] here.
export const hotspots = [
  {
    id: "aero",
    doc: "PY2026-AERO-001",
    label: "AERO",
    title: "Aerodynamics",
    position: [1.18, 0.87, 0.65],
    summary:
      "Full aero package (front wing, undertray and rear wing) tuned for downforce without blowing the drag budget.",
    specs: [
      { k: "Downforce @ 60 km/h", v: "60 kg" },
    ],
  },
  {
    id: "frame",
    doc: "PY2026-CHS-001",
    label: "CHASSIS",
    title: "Frame",
    position: [-1.36, 1.66, 0.43],
    summary:
      "Spaceframe chassis welded from 25CrMo4 steel tube, built around driver safety and torsional stiffness targets.",
    specs: [
      { k: "Material", v: "25CrMo4 steel tube spaceframe" },
      { k: "Overall L/W/H", v: "2834 / 1412 / 1211 mm" },
      { k: "Weight w/ fluids (no driver)", v: "231 kg" },
    ],
  },
  {
    id: "edu",
    doc: "PY2026-EDU-001",
    label: "E-DRIVE",
    title: "Electric Drive Unit",
    position: [-0.1, 1.14, -0.56],
    partModel: "/models/parts/hyra-control-unit.glb",
    summary:
      "Supplementary electric drive unit that hybridizes the combustion powertrain for extra low-end torque, run by the HYRA control unit.",
    specs: [
      { k: "Max power", v: "20 kW" },
      { k: "Max torque", v: "19.12 Nm" },
    ],
  },
  {
    id: "engine",
    doc: "PY2026-ICE-001",
    label: "ENGINE",
    title: "Combustion Engine",
    position: [-1.26, 1.63, -0.21],
    summary:
      "Triumph Daytona-derived 709cc engine running a dry-sump lubrication system to keep oil pressure stable under high lateral G.",
    specs: [
      { k: "Displacement", v: "709 ccm, dry sump" },
      { k: "Max power", v: "95.88 hp @ 11,500 rpm" },
      { k: "Max torque", v: "65 Nm @ 8,000 rpm" },
      { k: "Fuel", v: "Natural 98" },
    ],
  },
  {
    id: "gearbox",
    doc: "PY2026-TRN-001",
    label: "GEARBOX",
    title: "Transmission",
    position: [-0.91, 1.15, -0.02],
    summary:
      "Sequential gearbox shifted electrically via steering-wheel paddles, cutting shift time versus a manual linkage.",
    specs: [
      { k: "Type", v: "2-speed sequential" },
      { k: "Shifting", v: "Electric, paddle-operated" },
    ],
  },
];
