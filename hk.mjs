// ============================================================
// hk.mjs — Helmholtz-Kohlrausch lightness correction.
// Nayatani (1997) object method, VCC. Ported from colour-science
// and validated to match it to 7+ decimals (see repo history).
//
// Pure JS, no dependencies — so `node generate.mjs` computes the hk
// correction itself (nothing ships from Python; nothing is stored).
// EXACT per-step: for each hue at each step, the ΔL is solved at that
// step's real chroma (curve x fader) and zero-centered across hues per
// step, so net lightness stays on the spine at every step — not one
// coefficient fit at the peak and extrapolated. Applied downstream as
// L += d-{step}.
// ============================================================

const L_A = 64;                 // adapting luminance (cd/m^2), display-ish
const VCC = -0.866;             // Nayatani VCC method coefficient
const rad = (d) => (d * Math.PI) / 180;

// OKLab -> XYZ (D65), Ottosson matrices
function oklabToXYZ(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
    1.2270138511 * l - 0.5577999807 * m + 0.281256149 * s,
    -0.0405801784 * l + 1.1122568696 * m - 0.0716766787 * s,
    -0.0763812845 * l - 0.4214819784 * m + 1.5861632204 * s,
  ];
}
const uvp = ([x, y, z]) => { const d = x + 15 * y + 3 * z; return [(4 * x) / d, (9 * y) / d]; };
const WHITE = uvp(oklabToXYZ(1, 0, 0));                 // D65 u'v'
const K_Br = (La) => { const p = La ** 0.4495; return ((p * 6.362 + 6.469) * 0.2717) / (p + 6.469); };
const qCoef = (t) =>
  -0.01585 - 0.03017 * Math.cos(t) - 0.04556 * Math.cos(2 * t) - 0.02667 * Math.cos(3 * t) - 0.00295 * Math.cos(4 * t)
  + 0.14592 * Math.sin(t) + 0.05084 * Math.sin(2 * t) - 0.019 * Math.sin(3 * t) - 0.00764 * Math.sin(4 * t);

const lumY = (L, C, h) => oklabToXYZ(L, C * Math.cos(rad(h)), C * Math.sin(rad(h)))[1];
function lightnessForLuminance(h, C, Y) {           // OKLab L giving luminance Y at hue,C
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (lumY(m, C, h) < Y) lo = m; else hi = m; }
  return lo;
}

// The exact per-hue-per-step lightness correction ΔL.
// For each step, each hue's correction is solved at that step's ACTUAL chroma
// (curve × fader), then zero-centered ACROSS hues at that step — so net
// lightness stays on the spine at every step, not just at the peak.
//   spine, curve : { step: value }   entries : [{ name, hue, fader }]
//   -> { name: { step: ΔL } }
export function computeCorrection(spine, curve, entries, steps) {
  const [uc, vc] = WHITE;
  const K = K_Br(L_A);
  const out = {};
  for (const { name } of entries) out[name] = {};
  for (const s of steps) {
    const Yn = lumY(spine[s], 0, 0);                 // neutral luminance at this step
    const d = {};
    for (const { name, hue, fader } of entries) {
      const C = curve[s] * (fader ?? 1);
      if (C <= 0) { d[name] = 0; continue; }
      const [u, v] = uvp(oklabToXYZ(spine[s], C * Math.cos(rad(hue)), C * Math.sin(rad(hue))));
      const gamma = 1 + (VCC * qCoef(Math.atan2(v - vc, u - uc)) + 0.0872 * K) * 13 * Math.hypot(u - uc, v - vc);
      d[name] = lightnessForLuminance(hue, C, Yn / gamma) - spine[s];
    }
    const mean = Object.values(d).reduce((a, b) => a + b, 0) / entries.length;
    for (const { name } of entries) out[name][s] = Math.round((d[name] - mean) * 1e5) / 1e5;
  }
  return out;
}
