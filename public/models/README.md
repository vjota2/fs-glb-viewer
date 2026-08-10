Drop your placeholder (or final) model here as:

    monopost.glb

The app loads it from `/models/monopost.glb` (see `MODEL_PATH` in `src/config.js`).
It's auto-centered and scaled to fit `CAR_LENGTH` from `src/config.js`, so it
doesn't need to be pre-scaled — just reasonably car-proportioned.

Until a file exists here, the viewer shows a wireframe placeholder box instead
of crashing.
