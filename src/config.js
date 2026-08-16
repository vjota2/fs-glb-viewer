// Edit these to match your team — used throughout the HUD. The heading names
// the app rather than a car, since the viewer now switches between several.
export const TEAM_NAME = "CULS PRAGUE FORMULA RACING";
export const APP_NAME = "HYRA PREVIEW";
export const SEASON = "2026";
// The models themselves — paths, real-world dimensions and hotspots — live in
// src/data/models.js.

// Idle demo mode: after this many seconds with no interaction, any open
// hotspot popup closes and the camera auto-rotates around the car until the
// next tap/drag/scroll. Overridable at runtime from the in-app Settings
// panel (persisted to localStorage from there on).
export const DEFAULT_IDLE_ENABLED = true;
export const DEFAULT_IDLE_SECONDS = 30;
