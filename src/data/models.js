import { monopostHotspots, roadCarHotspots } from "./carSpecs.js";

// The models the viewer can switch between. `length` is the real-world length
// (metres) each GLB is scaled to fit — it also drives the grid, contact
// shadow and zoom-out limit, so it wants to be roughly right rather than
// exact. `rotation` (radians, XYZ) is applied before the model is measured,
// for GLBs authored Z-up.
export const models = [
  {
    id: "monopost",
    label: "MONOPOST",
    caption: "FS11_02",
    path: "/models/monopost.glb",
    length: 2.834,
    width: 1.412,
    height: 1.7,
    hotspots: monopostHotspots,
  },
  {
    id: "roadcar",
    label: "ROAD CAR",
    caption: "CUSTOMER FIT",
    path: "/models/road-car.glb",
    length: 4.51,
    width: 2.0,
    height: 1.22,
    // Already Y-up (the exporter baked the conversion into each mesh), so
    // this only spins it to run nose-to-tail along X, matching the monopost.
    // Verified by wheel spread: wheelbase 2.42 on X, track 1.60 on Z, all
    // four wheels level.
    rotation: [0, Math.PI / 2, 0],
    // KNOWN ISSUE: the wheels sit ~0.6m too far outboard, so the car fits to
    // 3.10m wide instead of ~1.85m. This is a game-engine export — the engine
    // positions wheels at runtime from its own hub dummies rather than baking
    // them into the mesh, and those dummy nodes aren't part of the exported
    // scene. It reads fine side-on (the offset is along the track axis) but
    // shows from the front or rear. Fix is to move the 8 wheel meshes inboard
    // onto the hubs in Blender and re-export.
    hotspots: roadCarHotspots,
  },
];

export const DEFAULT_MODEL_ID = models[0].id;
