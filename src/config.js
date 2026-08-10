// Edit these to match your team / current car — used throughout the HUD.
export const TEAM_NAME = "CULS PRAGUE FORMULA RACING";
export const CAR_NAME = "PYTHON";
export const SEASON = "2026";
export const MODEL_PATH = "/models/monopost.glb";

// CAR_LENGTH sets the actual scale the model is fit to (its longest
// horizontal side, in meters — roughly HoneyBadger's 2834mm). CAR_WIDTH/
// CAR_HEIGHT only affect the default camera framing, not the scale — measured
// against the current placeholder GLB (FS11_02), whose roll hoop/rear wing
// sit taller than HoneyBadger's own spec sheet, so this is taller than the
// 1211mm from that spec. Re-check with ?debug=1 if the model changes.
export const CAR_LENGTH = 2.834;
export const CAR_WIDTH = 1.412;
export const CAR_HEIGHT = 1.7;

// Idle demo mode: after this many seconds with no interaction, any open
// hotspot popup closes and the camera auto-rotates around the car until the
// next tap/drag/scroll. Overridable at runtime from the in-app Settings
// panel (persisted to localStorage from there on).
export const DEFAULT_IDLE_ENABLED = true;
export const DEFAULT_IDLE_SECONDS = 30;
