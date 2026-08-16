# HoneyBadger GLB Viewer

Interactive 3D viewer for the CULS Prague Formula Racing monopost, built to
run on a tablet at the booth: orbit/zoom the car, tap a marker to fly the
camera in on that part and show a spec popup.

Stack: React + Vite + three.js (via `@react-three/fiber` / `@react-three/drei`).
Builds to static files — host it on any web server.

## 1. Run it

Requires [Node.js](https://nodejs.org) 18+ (this machine didn't have it
installed when the project was scaffolded — install it first).

```bash
cd fs-glb-viewer
npm install
npm run dev
```

Opens a dev server (prints a `localhost` URL — open it on the tablet's
browser, or use the `--host` network URL it also prints to load it from
another device on the same Wi-Fi).

## 2. Add the real models

The viewer shows two cars, switched with the control under the HUD: the team's
monopost, and the rally car the same hybrid system drops into for a customer.
Their GLBs live at:

```
public/models/monopost.glb
public/models/rally-car.glb
```

Both are registered in `src/data/models.js`, which is also where you add,
remove or reorder models. Each entry carries its own path, real-world
dimensions, hotspot set, and an optional `rotation` for GLBs that aren't
authored nose-along-X. The app auto-loads each one, centers it, and scales it
to the `length` you declare. Until a file exists, the viewer shows a wireframe
placeholder box so the rest of the app still works.

The rally car ships as a 14.7MB GLB, down from the 74MB the source download
weighs. Its textures were downscaled (2048 cap, 1024 for interior and data
maps) and re-encoded to JPEG, keeping PNG only for the six that actually use
alpha; both are core glTF, so no loader extension is involved. `gltf-transform
prune` and `dedup` then dropped unused textures and accessors. If you re-do
this, note that `weld` made the file *bigger* here, and that gltf-transform's
own `resize`/`webp` commands fail on this machine's sharp build
(`colourspace: parameter space not set`).

## 3. Place the hotspots on the real model

The app is scoped to the hybrid drivetrain: the 5 hotspots are the hybrid
battery (HSC), hybrid control unit (HCU), electric motors, electric gearbox,
and hybrid inverters. In `src/data/carSpecs.js` their *content* (title, specs,
part model) is written once in `components`, then placed per model — so
editing a spec updates it on both cars, while each car keeps its own
coordinates. Text content is still placeholder; swap in the real write-ups
whenever they're ready.

Both cars' coordinates are calibrated. On the rally car the placements are
*illustrative* — showing where the system would sit in a customer vehicle
(pack under the boot floor, HCU and inverters either side of the engine bay,
motors at the front hub, gearbox aft of the engine) rather than measured off a
real install. To place (or re-place) a marker:

1. Open the app with `?debug=1` appended, e.g. `http://localhost:5173/?debug=1`
2. Switch to the car you're placing markers on
3. Click directly on the part of the model you want a marker on
4. The bottom-left readout logs the `[x, y, z]` coordinate you clicked
5. Copy that into the matching entry in that model's hotspot list in
   `src/data/carSpecs.js` (`monopostHotspots` or `rallyCarHotspots`)

Two optional fields fine-tune a marker without moving the part itself:

- `markerPosition` moves only the clickable dot, leaving `position` as the
  camera's fly-to target. Used where two parts sit too close together for
  their dots to be tapped apart (the HCU and inverters are ~3.7cm apart).
- `view` pins the camera framing used when that hotspot is opened, so the part
  is seen from an angle that isn't blocked by bodywork. Without it the camera
  flies in along one generic diagonal, which buries anything behind a wheel or
  sidepod.

## 3b. Re-author a hotspot's camera view

`view: { position: [x, y, z], target: [x, y, z] }` is authored the same way:

1. Open with `?debug=1` — the readout now also shows the live camera
   `position`/`target`, formatted ready to paste
2. Orbit/zoom until the part reads clearly, then copy that line into the
   hotspot's `view`

In debug builds the camera is also exposed as `window.__viewer`, so a
candidate framing can be tried straight from the console without an edit and
reload: `__viewer.set([x, y, z], [tx, ty, tz])`.

Views are stored un-offset and centred on the part. At runtime the camera
slides sideways to keep the part clear of the info panel, which covers the
right edge whenever a hotspot is open — so don't bake that offset in by hand.

## 4. Edit hotspot content

Everything shown in the popup — title, `DOC:` id, summary, spec rows — lives
in `src/data/carSpecs.js`. The current specs are pulled from
[culsracing.cz](https://culsracing.cz) as placeholder content; swap in the
real per-part write-ups whenever they're ready. Add/remove hotspots by
adding/removing entries in that array.

Team name / car name / season shown in the top HUD bar are in `src/config.js`.

### Embedding a component's own 3D model in a hotspot's popup

Any hotspot in `src/data/carSpecs.js` can show a small standalone, auto-rotating
3D preview of that specific part inside its popup (used for the Electric Drive
Unit's HYRA control unit). To add one:

1. Drop the part's GLB in `public/models/parts/`, e.g. `my-part.glb`
2. Add a `partModel: "/models/parts/my-part.glb"` field to that hotspot's entry

It's rendered by `src/components/PartViewer.jsx` — a second, independent
`<Canvas>` embedded in the popup with its own camera/lighting/orbit controls,
auto-framed to that part's own size the same way the main car model is. If
the file is missing or fails to load, the popup shows "COMPONENT MODEL
UNAVAILABLE" instead of breaking.

## 5. Build for deployment

```bash
npm run build
```

Outputs static files to `dist/` — copy that folder to your server (nginx,
Apache, or anything that can serve static files). No server-side code
required.

## Credits

The rally car model is third-party and its licence **requires attribution**.
This repository is public, so keep this credit with any copy, fork or build:

> This work is based on ["Cherrier Vivace Rally"](https://sketchfab.com/3d-models/cherrier-vivace-rally-e402357e03204789b56f8e2540847fce)
> by [akyolefe319](https://sketchfab.com/akyolefe319), licensed under
> [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).

CC-BY-4.0 permits commercial use; crediting the author is the one condition.
The same details are kept alongside the model in `src/data/models.js` so they
travel with the entry. The monopost and HYRA/motor part models are the team's
own and carry no such requirement.

## Notes

- Design language (dark HUD, amber accent, monospace `DOC:`/`REV:` labels,
  boot-sequence loading screen) is inspired by culsracing.cz's own
  dashboard/telemetry aesthetic.
- The page disables pinch-to-zoom/scroll on the browser chrome itself so
  touch gestures go straight to orbiting/zooming the 3D view — good for a
  tablet kiosk, but worth double-checking on the actual tablet browser.
- Not yet included (call out if you want them next): fullscreen kiosk
  button, an idle-timeout that resets the camera/closes the popup between
  judges, and a "loop demo" auto-rotate mode.
