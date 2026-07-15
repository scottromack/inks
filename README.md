# @mus/inks

An OKLCH ink system for Tailwind v4. One lightness spine, one chroma
curve, N hues. Dark mode is an involution (step ↔ 1000−step, 500 fixed).
Text color is never stored — it is derived per surface by the engine
via `contrast-color()`.

## Use

```css
@import "tailwindcss";
@import "@mus/inks";
```

```html
<button class="inks-green-600 hover:inks-green-700 rounded-lg px-4 py-2">
  auto-contrast surface
</button>
<span class="inks-[hotpink]">arbitrary colors get contrast too</span>
```

Every `--color-ink-{family}-{step}` token also feeds the normal
utilities: `bg-ink-cyan-200`, `text-ink-violet-800/50`, `border-ink-*`,
`ring-ink-*`, and the rest.

## Doctrine

`inks.intent.mjs` is the only file a human edits — spine, curve, hue
pairs. `inks.css` is generated (`npm run build`) and marked
`linguist-generated`. Gray is not a family; it is the spine, rendered.
P3 is the authoring canon; lesser screens degrade through native CSS
gamut mapping (chroma reduced at constant L/H — contrast intact).
Engine floor: spring 2026 (`contrast-color()` Baseline).

## Tune

`npm i && npm run demo`, open `demo/index.html` (serve the folder).
The bench renders the full matrix, both schemes, and a tuning deck of
live sliders for the spine, the curve, and every hue. When it looks
right, **Copy intent** puts the numbers on your clipboard in
`inks.intent.mjs` format — paste, regenerate, commit both.
