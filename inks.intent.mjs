// ============================================================
// inks.intent.mjs — THE INTENT. The only file a human edits.
// Everything else (inks.css + every minted utility) is
// @generated. Tune here, then: node generate.mjs
// ============================================================

export default {
  // LIGHTNESS — one shared spine, hue-invariant. Scott's tuning pass.
  lightness: {
    0: 0.995,
    50: 0.982,
    100: 0.962,
    200: 0.925,
    300: 0.871,
    400: 0.792,
    500: 0.723,
    600: 0.627,
    700: 0.527,
    800: 0.448,
    900: 0.353,
    950: 0.237,
    1000: 0.187,
  },

  // CHROMA — THE CURVE. Arched, peaks mid-ramp. Scott's tuning pass.
  chroma: {
    0: 0.043,
    50: 0.058,
    100: 0.088,
    200: 0.125,
    300: 0.167,
    400: 0.222,
    500: 0.292,
    600: 0.226,
    700: 0.142,
    800: 0.104,
    900: 0.082,
    950: 0.065,
    1000: 0.04,
  },

  // HUES — hue on the 11.25 grid, fader = per-hue chroma x, hk = Nayatani
  // correction (zero-centered, recomputed for THESE hues/curve). Do not eyeball hk.
  hues: {
    red: { hue: 22.5, chroma: 1.1, hk: -0.055 },
    orange: { hue: 45, hk: -0.011 },
    amber: { hue: 67.5, chroma: 0.86, hk: 0.128 },
    yellow: { hue: 90, chroma: 0.96, hk: 0.277 },
    lime: { hue: 112.5, chroma: 1.09, hk: 0.253 },
    green: { hue: 135, chroma: 0.96, hk: 0.035 },
    emerald: { hue: 157.5, chroma: 0.81, hk: -0.075 },
    cyan: { hue: 180, chroma: 0.68, hk: -0.099 },
    teal: { hue: 202.5, chroma: 0.69, hk: -0.101 },
    sky: { hue: 225, chroma: 0.77, hk: -0.122 },
    blue: { hue: 247.5, chroma: 1.1, hk: -0.1 },
    indigo: { hue: 270, chroma: 1.2, hk: -0.059 },
    violet: { hue: 292.5, chroma: 1.2, hk: -0.029 },
    purple: { hue: 315, chroma: 1.2, hk: -0.001 },
    fuchsia: { hue: 337.5, chroma: 1.2, hk: 0.008 },
    pink: { hue: 360, chroma: 0.8, hk: -0.049 },
  },

  // TASTE — aesthetic lightness offsets. 0 = pure model. Empty ships honest.
  taste: {
  },

  // gray = the lightness axis, rendered. No hue asserted (C=0).
  gray: true,
};

// P3 is the output ceiling, not the design target. Chroma UNCLAMPED;
// the platform gamut-maps (§5). Optimize the ideal model, render per screen.
