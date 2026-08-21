// Icons as inline SVG rather than Unicode glyphs.
//
// The glyphs these replace (⚙ ⤢ ⤡ ✕) render through whatever font the device
// falls back to, and those fallbacks disagree on side bearings and baseline —
// so a flex-centred button centres the text box while the visible mark sits
// off-centre. It looked fine on the desktop and visibly crooked on the tablet.
// An SVG carries its own geometry, so it lands identically everywhere.
//
// `display: block` matters: an inline SVG sits on the text baseline and
// inherits line-height, which reintroduces the same vertical drift.

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: { display: "block" },
  "aria-hidden": true,
  focusable: false,
};

export function ExpandIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M9 4H4v5M20 9V4h-5M15 20h5v-5M4 15v5h5" />
    </svg>
  );
}

export function CollapseIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M4 9h5V4M15 4v5h5M20 15h-5v5M9 20v-5H4" />
    </svg>
  );
}

export function GearIcon({ size = 18 }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.6v2.6M12 18.8v2.6M21.4 12h-2.6M5.2 12H2.6M18.6 5.4l-1.8 1.8M7.2 16.8l-1.8 1.8M18.6 18.6l-1.8-1.8M7.2 7.2 5.4 5.4" />
    </svg>
  );
}

// Touch target: a fingertip with two ripples spreading out of it. The ripples
// are animated in CSS (see .touch-icon) — a static mark this small reads as
// decoration, whereas the outward motion is what actually says "press here".
export function TouchIcon({ size = 20 }) {
  return (
    <svg {...base} width={size} height={size} className="touch-icon">
      <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
      <path
        className="touch-ripple r1"
        d="M7.05 7.05a7 7 0 0 0 0 9.9M16.95 16.95a7 7 0 0 0 0-9.9"
      />
      <path
        className="touch-ripple r2"
        d="M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 19.4a10.5 10.5 0 0 0 0-14.8"
      />
    </svg>
  );
}

export function CloseIcon({ size = 16 }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
