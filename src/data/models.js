import { monopostHotspots, rallyCarHotspots } from "./carSpecs.js";

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
    // The livery is baked into the textures fairly muted; a lift makes the
    // yellow read at booth distance. 1 leaves it as authored.
    saturation: 1.15,
    hotspots: monopostHotspots,
  },
  {
    id: "rallycar",
    label: "DEMO CAR",
    caption: "HYRA RETROFIT",
    path: "/models/rally-car.glb",
    // Measured off the GLB's world bounding box, which is already in metres:
    // 4.42 long on Z, 1.98 wide on X, 1.57 tall on Y.
    length: 4.42,
    width: 1.98,
    height: 1.57,
    // Y-up already (Sketchfab's two wrapper rotations cancel out); this only
    // spins it to run nose-to-tail along X, matching the monopost.
    rotation: [0, Math.PI / 2, 0],
    // Fixups applied to this GLB's materials by name — see fitModel.js.
    materials: [
      // Bodywork in the team amber, so the demo car reads as part of the same
      // system as the monopost. The 34 body panels share this material and
      // nothing else uses it, so tyres, engine and interior keep their own.
      //
      // Every material on this GLB ships at metalness 1. Real car paint is a
      // dielectric, and at full metalness the panels mirror the environment
      // like chrome — the glassy look. Dropping the factor makes it read as
      // paint. (The roughness factor is already 1, so it can't be clamped
      // further; metalness is the only lever here.)
      { name: "vivace.skin.rally", color: "#fca503", metalness: 0.05 },
      // Rubber, shipped fully metallic with no map to temper it.
      { name: "tire_01j", metalness: 0, roughness: 1 },
      // Painted tube and plastics, likewise metallic for no good reason.
      { name: "rollcage", metalness: 0.1 },
      { name: "vivace_int_stripped", metalness: 0.1 },
      { name: "vivace_grille2", metalness: 0.1 },
      // Every glass material ships as alphaMode OPAQUE, so the windows render
      // as solid black panels. Transparency alone still leaves them looking
      // heavily smoked, because the baked textures are near-black (mean RGB
      // 17,27,27 and 30,72,68) — hence `untextured`, so the glass takes a
      // faint cool tint instead of the dark image. The interior layer sits
      // behind the exterior one, so it has to be sheerer or the two stack back
      // up into something murky.
      { name: "vivace_glass", untextured: true, color: "#dfeaea", opacity: 0.16 },
      { name: "vivace_glass_int", untextured: true, color: "#dfeaea", opacity: 0.08 },
      // Named for what it should be, but shipped opaque like the rest.
      { name: "glass_invisible", hide: true },
    ],
    hotspots: rallyCarHotspots,
    // CC-BY-4.0 requires the author be credited wherever this is shared, and
    // this repo is public — keep this with the model, and see README credits.
    credit: {
      title: "Cherrier Vivace Rally",
      author: "akyolefe319",
      license: "CC-BY-4.0",
      url: "https://sketchfab.com/3d-models/cherrier-vivace-rally-e402357e03204789b56f8e2540847fce",
    },
  },
];

export const DEFAULT_MODEL_ID = models[0].id;
