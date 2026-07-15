// ============================================================
// inks.intent.mjs — THE INTENT. The only file a human edits.
// Everything else (inks.css + minted utilities) is @generated.
// Tune here, then: node generate.mjs
// ============================================================

export default {
  // LIGHTNESS — one shared spine, hue-invariant.
  lightness: {
    0: 0.975,
    50: 0.975,
    100: 0.962,
    200: 0.925,
    300: 0.871,
    400: 0.792,
    500: 0.723,
    600: 0.627,
    700: 0.527,
    800: 0.448,
    900: 0.333,
    950: 0.237,
    1000: 0.207,
  },

  // CHROMA — the arch: peaks mid-ramp, tapers to both poles.
  chroma: {
    0: 0.043,
    50: 0.058,
    100: 0.088,
    200: 0.125,
    300: 0.167,
    400: 0.189,
    500: 0.188,
    600: 0.164,
    700: 0.13,
    800: 0.091,
    900: 0.067,
    950: 0.057,
    1000: 0.04,
  },

  // HUES — hue + fader (per-hue chroma x, omit = 1). hk is DERIVED at
  // build from hue+fader (hk.mjs, Nayatani), never stored here.
  hues: {
    red: { hue: 33.75, chroma: 1.22 },
    orange: { hue: 56.25 },
    amber: { hue: 78.75, chroma: 0.86 },
    yellow: { hue: 101.25, chroma: 1.22 },
    lime: { hue: 123.75, chroma: 1.14 },
    green: { hue: 146.25, chroma: 1.19 },
    emerald: { hue: 168.75, chroma: 0.81 },
    cyan: { hue: 191.25, chroma: 0.68 },
    teal: { hue: 213.75, chroma: 0.69 },
    sky: { hue: 236.25, chroma: 0.77 },
    blue: { hue: 258.75, chroma: 1.6 },
    indigo: { hue: 281.25, chroma: 1.26 },
    violet: { hue: 303.75, chroma: 1.26 },
    purple: { hue: 326.25, chroma: 1.27 },
    fuchsia: { hue: 348.75, chroma: 1.36 },
    pink: { hue: 0, chroma: 0.8 },
  },

  // TASTE — aesthetic lightness offsets. 0 = pure model.
  taste: {},

  // gray = the lightness axis, rendered. No hue asserted (C=0).
  gray: true,
};

// P3 is the output ceiling, not the design target. Chroma UNCLAMPED;
// the platform gamut-maps. Optimize the ideal model, render per screen.
