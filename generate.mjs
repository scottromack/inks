// ============================================================
// generate.mjs — the Baruch. Reads inks.intent.mjs, writes
// inks.css. Do not edit the output; edit the intent.
// ============================================================

import { writeFileSync } from "node:fs";
import intent from "./inks.intent.mjs";
import { computeCorrection } from "./hk.mjs";

const { lightness, chroma, hues, gray, taste = {} } = intent;

const STEPS = Object.keys(lightness).map(Number).sort((a, b) => a - b);
const mirror = (s) => 1000 - s;

// families = named hues; gray rides along as the lightness axis itself,
// zero chroma (or as a real family, if the intent gives it a hue/chroma pair)
const families = {};
if (gray) families.gray = gray === true ? "neutral" : gray;
Object.assign(families, hues);
const famNames = Object.keys(families);
const hueOf = (spec) => (typeof spec === "number" ? spec : spec.hue);

// hk is DERIVED, not stored: the Nayatani correction is computed here from
// each hue + its fader (hk.mjs). The intent carries no hk — regenerating
// always re-derives it, so it can never go stale against the hues.
// EXACT per-step: correction is solved at every step's real chroma
// (curve x fader) and zero-centered per step, not one coefficient fit at
// the peak. Result is CORR[fam][step] = the ΔL to add to the spine.
const hkEntries = Object.entries(families)
  .filter(([, spec]) => spec !== "neutral")
  .map(([name, spec]) => ({
    name,
    hue: hueOf(spec),
    fader: (typeof spec === "object" ? spec.chroma : undefined) ?? 1,
  }));
const CORR = computeCorrection(lightness, chroma, hkEntries, STEPS);

const out = [];
const push = (s = "") => out.push(s);

push(`/* ============================================================`);
push(`   inks.css — @generated from inks.intent.mjs. DO NOT EDIT.`);
push(`   Regenerate: node generate.mjs`);
push(``);
push(`   Ink  = pigment (single resolved color, light/dark aware)`);
push(`   Inks = surface (bg + DERIVED fg via contrast-color)`);
push(``);
push(`   ${famNames.length - (gray ? 1 : 0)} hue families + gray (the lightness axis) x ${STEPS.length} steps.`);
push(`   Dark mode = the involution step <-> ${1000}-step; 500 fixed.`);
push(`   Endpoints 0/1000 are off-pole: derived like every other`);
push(`   step. Nothing in this file is asserted except the intent.`);
push(`   ============================================================ */`);
push();
push(`@theme {`);
push(`  /* LIGHTNESS (L per step) */`);
for (const s of STEPS) push(`  --L-${s}: ${lightness[s]};`);
push();
push(`  /* CHROMA (C per step) */`);
for (const s of STEPS) push(`  --chroma-${s}: ${chroma[s]};`);
push();
push(`  /* HUES === a family is a name/hue pair.`);
push(`     --{fam}-chroma : fader (var(--{fam}-chroma, 1)) — declared to depart.`);
push(`     --{fam}-d-{s}  : Helmholtz-Kohlrausch correction ΔL, DERIVED here per`);
push(`                      step from hue+fader via hk.mjs (Nayatani 1997). The`);
push(`                      EXACT per-step ΔL — solved at each step's real chroma,`);
push(`                      zero-centered across hues per step. Not stored.`);
push(`     --{fam}-taste  : aesthetic lightness offset — preference, not science.`);
push(`     Effective L = spine + d-{s} + taste, all live in CSS calc.`);
push(`     Gray is not a family — it is the lightness axis, rendered. */`);
for (const [fam, spec] of Object.entries(families)) {
  if (spec === "neutral") continue;
  push(`  --${fam}-hue: ${hueOf(spec)};`);
  if (typeof spec === "object" && spec.chroma != null)
    push(`  --${fam}-chroma: ${spec.chroma};`);
  if (taste[fam] != null)
    push(`  --${fam}-taste: ${taste[fam]};`);
  // per-step hk correction ΔL (the exact table)
  for (const s of STEPS) push(`  --${fam}-d-${s}: ${CORR[fam][s]};`);
}
push();

// BASE scales: raw OKLCH, not mode-aware, live-tunable.
push(`  /* ===========================================`);
push(`     BASE: lightness L x (chroma C x fader x gamut) x hue.`);
push(`     Live: edit --chroma-500 in devtools and every`);
push(`     500 across all families follows.`);
push(`     =========================================== */`);
for (const fam of famNames) {
  push();
  for (const s of STEPS) {
    push(
      families[fam] === "neutral"
        ? `  --base-${fam}-${s}: oklch(var(--L-${s}) 0 0);`
        : `  --base-${fam}-${s}: oklch(calc(var(--L-${s}) + var(--${fam}-d-${s}, 0) + var(--${fam}-taste, 0)) calc(var(--chroma-${s}) * var(--${fam}-chroma, 1)) var(--${fam}-hue));`
    );
  }
}
push();

// INK tokens: mode-aware, straight into Tailwind's --color-* namespace.
push(`  /* ===========================================`);
push(`     INK: mode-aware tokens in Tailwind's --color-*`);
push(`     namespace -> bg-ink-green-500, text-ink-cyan-200,`);
push(`     border-ink-*, ring-ink-*, fill-ink-*, etc.`);
push(`     Dark mode = ramp reversal; 500 is the fixed point.`);
push(`     =========================================== */`);
for (const fam of famNames) {
  push();
  for (const s of STEPS) {
    const m = mirror(s);
    push(
      s === m
        ? `  --color-ink-${fam}-${s}: var(--base-${fam}-${s});`
        : `  --color-ink-${fam}-${s}: light-dark(var(--base-${fam}-${s}), var(--base-${fam}-${m}));`
    );
  }
}
push();
push(`  /* SEMANTIC */`);
push(`  --color-border: light-dark(var(--base-gray-600), var(--base-gray-800));`);
push(`}`);
push();

// Registered surface input.
push(`/* Registered so --bg always resolves to a real color`);
push(`   (contrast-color needs one) and theme changes animate. */`);
push(`@property --bg {`);
push(`  syntax: "<color>";`);
push(`  inherits: false; /* background does not inherit; neither does its shadow */`);
push(`  initial-value: transparent;`);
push(`}`);
push(`/* No @property --fg. fg is derived, not stored. */`);
push();

// Base: color-scheme + P3 lift.
push(`@layer base {`);
push(`  :root {`);
push(`    color-scheme: light dark;`);
push(`  }`);
push(`}`);
push();

// Surfaces: one functional utility. Tailwind mints classes on
// demand from the --color-ink-* namespace; variants come free.
push(`/* ===  INKS SURFACES  ==================================`);
push(`   Usage:   <b class="inks-green-500">auto contrast</b>`);
push(`   Variants: hover:inks-green-600, md:inks-gray-100, ...`);
push(`   Arbitrary: inks-[hotpink] — auto contrast on any color.`);
push(`   fg computed by the engine (WCAG2, white | black).`);
push(`   ====================================================== */`);
push(`@utility inks-* {`);
push(`  --bg: --value(--color-ink-*, [color]);`);
push(`  background: var(--bg);`);
push(`  --fg: contrast-color(var(--bg));`);
push(`  color: var(--fg);`);
push(`}`);
push();

const css = out.join("\n").replace(/-(\d+)\s+\{/g, (m, d) => `-${d} {`);
writeFileSync(new URL("./inks.css", import.meta.url), css + "\n");

const tokenCount = famNames.length * STEPS.length;
console.log(
  `inks.css written: ${css.split("\n").length} lines | ` +
    `${famNames.length} families x ${STEPS.length} steps = ` +
    `${tokenCount} ink tokens (+${tokenCount} base); ` +
    `surface utilities minted on demand by @utility inks-*.`
);
