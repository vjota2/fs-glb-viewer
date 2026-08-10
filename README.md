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

## 2. Add the real model

Drop your GLB at:

```
public/models/monopost.glb
```

That's it — the app auto-loads it, centers it, and scales it to match
`CAR_LENGTH` in `src/config.js`. Until that file exists, the viewer shows a
wireframe placeholder box so the rest of the app still works.

## 3. Place the hotspots on the real model

The 5 hotspots in `src/data/carSpecs.js` (frame, engine, electric drive unit,
gearbox, aero) currently have guessed `position: [x, y, z]` coordinates based
on a generic car-shaped bounding box. Once your real GLB is loaded:

1. Open the app with `?debug=1` appended, e.g. `http://localhost:5173/?debug=1`
2. Click directly on the part of the model you want a marker on
3. The bottom-left readout logs the `[x, y, z]` coordinate you clicked
4. Copy that into the matching hotspot's `position` in `src/data/carSpecs.js`

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
