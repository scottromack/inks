# AGENTS.md — INKs

Wake-up briefing for the instance at `/Users/sromack/Develop/inks/`.
Designed in conversation with Scott, July 2026. Division of labor:
the conversational instance reasons and names; this instance executes.
Scott owns every naming decision. The rulings below are **SETTLED** —
do not relitigate without him.

## What this is

An OKLCH ink system shipped as a Tailwind v4 plugin (CSS-first: the
plugin is a stylesheet). One lightness spine carries every hue,
hue-invariant by construction, refined per hue by a Helmholtz-Kohlrausch
correction so equal steps read equally bright (§11). One chroma table
shapes pigment per step, scaled per hue by a fader. INKs optimizes for
the ideal color model — smooth L, smooth C, perceptual uniformity,
symmetry — NOT for any display gamut; the platform gamut-maps per screen
(Scott + council ruling, Jul 2026). A family is a
name/hue pair. Dark mode
is the involution `step ↔ 1000−step` with 500 the fixed point. Text
color is never stored — derived per surface by `contrast-color()`.

## Doctrine (settled, with reasons)

1. **`inks.intent.mjs` is the only human-edited file.** `inks.css` is
   `@generated` (`npm run build`) and marked `linguist-generated` in
   `.gitattributes`. Never edit output by hand; edit intent, regenerate,
   commit both together.
2. **LIGHTNESS and CHROMA are lookup tables, never curve-fit.**
   Hand-tuned canon (smooth is the goal; symmetry vs the asymmetric
   dark tail is an open council question). CHROMA is the arch — peaks
   mid-ramp, tapers to both poles; per-hue height is a fader (§7).
   LIGHTNESS is one shared spine, refined per hue by the hk correction
   (§11), never overridden by hand. PROVISIONAL values
   await Scott's tuning pass on a P3 display.
3. **Endpoints 0/1000 are off-pole and derived.** No
   `light-dark(white, black)` anywhere. True white/black are not inks;
   they are the absence of ink and live outside the system.
4. **fg is derived, never stored.** `--fg: contrast-color(var(--bg))`.
   No pairing tables. No `@property --fg` (a `currentColor`
   initial-value is not computationally independent — it silently
   never registers).
5. **No fallbacks, anywhere.** No static flip block (engine floor =
   spring 2026: contrast-color Baseline — Chrome 147 / Safari 26 /
   Firefox 146). No `@media (color-gamut: p3)` (P3 is the authoring
   canon; sRGB degrades via native CSS gamut mapping — chroma reduced
   at constant L/H, contrast intact). Chroma is authored **unclamped** —
   full height in OKLCH, never capped to P3; the platform maps per
   display, so wider-than-P3 screens shine. Every degradation path
   belongs to the platform; every decision belongs to the intent.
6. **Gray is not a family — it is the lightness axis, rendered.**
   `oklch(var(--L-N) 0 0)`. No hue asserted (hue is undefined at C=0;
   this repo asserts nothing undefined). Warm neutrals someday =
   promote via `gray: { hue, chroma }` in the intent.
7. **Faders set per-hue chroma height.** Consumption is
   `var(--{fam}-chroma, 1)`; declared only to depart from 1, no
   identity declarations. Now populated for cross-hue consistency —
   greens sit low (~0.7), magentas ride high (~1.3) — from a Tailwind
   study. Muted family = `slate: { hue: 250, chroma: 0.35 }`.
8. **The hue wheel — expanded to Tailwind parity (Scott, Jul 2026).**
   Sixteen hue families: red, orange, amber, yellow, lime, green,
   emerald, cyan, teal, sky, blue, indigo, violet, purple, fuchsia,
   pink. This deliberately **spends** the original common-nouns-only
   rule (was 8: red/orange/yellow/green/cyan/blue/violet/pink) so
   Tailwind's names drop in 1:1. Cost
   is free at consumption — surfaces mint on demand (§9), so the extra
   families ship as tokens only. `sage → green` still DONE. Brand
   names remain pointers into the wheel, never members.
9. **Surfaces are one functional utility.** `@utility inks-*` with
   `--value(--color-ink-*, [color])`. No attribute-selector hacks, no
   generated classes; Tailwind mints on demand; variants
   (`hover:inks-*`) and arbitrary colors (`inks-[hotpink]`) come free.
10. **`@property --bg`: `inherits: false`.** Background does not
    inherit; neither does its shadow. (Also pre-wires the eventual
    `if(style(--bg))` property-as-selector endgame — parked until
    `if()` is cross-browser.)
11. **Lightness is derived, not stored: `spine + hk·chroma + taste`.**
    Effective L per hue = the shared spine, plus a Helmholtz-Kohlrausch
    CORRECTION (`--{fam}-hk`, coefficient from Nayatani 1997 via the
    `colour-science` Python lib, **zero-centered** so hues balance around
    the spine rather than all darkening vs neutral) applied as `hk·chroma`
    so equal steps read equally bright across hues, plus an optional TASTE offset
    (`--{fam}-taste`, aesthetic, default 0 — the ONLY place preference
    lives). All three resolve in one CSS `calc()` in the base token, so
    moving spine/curve/fader/taste re-derives every hue instantly:
    nothing stored per family, the sync bug structurally impossible.
    Correction is science (do not eyeball); taste is preference (label
    it, keep it out of the correction). The old warm-lift lightness
    tables are **DELETED** — they fit the gamut, and INKs optimizes for
    the ideal model, not the gamut. Consequence accepted: a mid-lightness
    yellow renders olive on a P3 screen, and that is *correct* — vivid
    yellow lives at the lighter steps.

## State (verified in a sandbox before this handoff)

- Tailwind **v4.3.2**; `node generate.mjs` → `inks.css`, then
  `demo/dist.css` rebuilt clean. 17 families (16 hues + gray) ×
  13 steps = 221 tokens.
- Model: flat shared spine; effective L = `spine + hk·chroma + taste`
  in one CSS `calc()` (§11). CHROMA = arch × per-hue fader, unclamped;
  13 steps, deep 0/1000. Warm-lift hack removed.
- Faders from a Tailwind-palette study (greens ~0.7, magentas ~1.3).
  `hk` from Nayatani 1997 (`colour-science`, VCC/object), **zero-centered**:
  the common-mode darkening-vs-neutral is removed so hues balance around
  the spine (net L unchanged). Warm lifts (yellow +0.33, amber +0.21),
  cool drops (sky −0.14, blue −0.12) — independently reproduces Tailwind's
  tilt. `taste` ships empty (pure model), no bench UI.
- `--paper` = true white/black, demo backdrop only (§3 intact).
- `contrast-color` count: 221 matrix + 3 hover + 1 arbitrary + 1
  paper = **226**.
- Bench decks: LIGHTNESS/CHROMA/HUES + FADERS + HK (read-only bars
  showing the Nayatani correction — visible, not a knob). The spine
  slider now moves every hue live (calc), so the old warm-sync bug is
  gone. Taste stays in the model (§11) but has NO bench UI — pure model
  ships; hand-edit the `taste:` block only if ever wanted. Copy-intent
  emits spine + curve + hues{hue,fader,hk} + a separate taste block.
- `demo/dist.css` is committed so `demo/index.html` opens on file://;
  rebuild via `npm run demo`.

## Backlog (in order)

1. `npm i && npm run demo` — open the bench on the P3 display,
   eyeball the matrix in both schemes.
2. **Scott tunes** CHROMA + LIGHTNESS + hues with the sliders →
   **Copy intent** → paste into `inks.intent.mjs` → `node generate.mjs`
   → commit intent + generated together. Note: the LIGHTNESS slider
   moves the shared spine (cools + gray only); the warm band is pinned
   to its own lightness, tuned in the intent's per-hue `lightness`
   blocks (and faders too) — no live sliders for those yet, a fast
   follow-up worth doing. Endpoints (0/1000) and near-pole hues
   deserve the closest look.
3. Grep Scott's app/site for `-sage-` → `-green-` (orphans fail
   silently; `::selection` in his app css is a known case).
4. **Semantic families:** `semantic: { brand: "green" }` in intent →
   generator emits `--brand-hue: var(--green-hue)`, fader chained
   `var(--brand-chroma, var(--green-chroma, 1))`, full token +
   utility family. Consumer rebrand = one declaration; per-subtree
   white-label (`.tenant { --brand-hue: 210 }`) is the payoff.
   Design settled; ship when Scott says go.
5. Replace the LICENSE stub with canonical Apache-2.0 text before
   publish.
6. Parked: `@function`-era compositional form (`class="inks-600
   green"`, functions in-sheet) — waits on cross-browser `@function`
   + `if()`; migration is a refactor of the generator's output, not
   of the intent.

## Working rules

- Naming grammar applies: no proper nouns in the wheel, no identity
  declarations, assert nothing undefined, no new abbreviations.
- Name things what they are: literal over evocative, as much as
  possible. No cute or metaphor names for canonical identifiers.
  SETTLED (July 2026): the tables are `lightness` and `chroma` (the
  OKLCH channels they feed, `--L-*`/`--chroma-*`) — not "spine"/"curve".
  Gray's internal sentinel is `"neutral"`. The demo backdrop token is
  `--paper` (true white/black, bench-only, doctrine §3 intact).
- Output order is documentation (input → derivation → application);
  the engine doesn't care, humans do.
- When in doubt about a design question: it goes back to the
  conversational layer. This file is the interface between the two
  hands; keep it current when rulings change.
