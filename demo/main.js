// demo/main.js — INKs test bench. No framework, no build step.
const FAMILIES = ["gray","red","orange","amber","yellow","lime","green","emerald","cyan","teal","sky","blue","indigo","violet","purple","fuchsia","pink"];
const STEPS = [0,50,100,200,300,400,500,600,700,800,900,950,1000];
const HUED = FAMILIES.filter((f) => f !== "gray");
const root = document.documentElement;
const get = (p) => getComputedStyle(root).getPropertyValue(p).trim();
const set = (p, v) => root.style.setProperty(p, v);

// --- matrix: the contrast audit, at a glance ---
const matrix = document.getElementById("matrix");
for (const f of FAMILIES) {
  const row = document.createElement("div");
  row.className = "flex items-center gap-1";
  const label = document.createElement("span");
  label.className = "w-16 shrink-0 text-xs opacity-60";
  label.textContent = f;
  row.appendChild(label);
  for (const s of STEPS) {
    const cell = document.createElement("button");
    cell.className = `inks-${f}-${s} h-5 flex-1 rounded text-[8.5px]`;
    cell.textContent = s;
    cell.title = `inks-${f}-${s} — click to copy`;
    cell.onclick = () => navigator.clipboard?.writeText(`inks-${f}-${s}`);
    row.appendChild(cell);
  }
  matrix.appendChild(row);
}

// --- scheme + gamut ---
document.getElementById("scheme").onchange = (e) => {
  root.style.colorScheme = e.target.value;
};
document.getElementById("gamut").textContent = matchMedia("(color-gamut: p3)").matches
  ? "display-p3"
  : "srgb";

// --- tuning deck ---
function slider(deckId, label, prop, min, max, step) {
  const wrap = document.createElement("label");
  wrap.className = "flex items-center gap-2 text-xs";
  const name = document.createElement("span");
  name.className = "w-20 shrink-0 opacity-60";
  name.textContent = label;
  const input = document.createElement("input");
  input.type = "range";
  input.min = min; input.max = max; input.step = step;
  input.value = parseFloat(get(prop)) || 0;
  input.className = "flex-1";
  const out = document.createElement("span");
  out.className = "w-14 text-right";
  out.textContent = input.value;
  input.oninput = () => { set(prop, input.value); out.textContent = input.value; };
  wrap.append(name, input, out);
  document.getElementById(deckId).appendChild(wrap);
  return () => parseFloat(input.value);
}

// Base lightness = `spine + hk*chroma + taste`, resolved live in CSS calc, so
// every slider below (spine, curve, fader, taste) propagates on its own — no
// recompute, no stored per-family tables, no sync bug.
const reads = { lightness: {}, chroma: {}, hues: {} };
for (const s of STEPS) reads.lightness[s] = slider("lightness", `L ${s}`, `--L-${s}`, 0, 1, 0.001);
for (const s of STEPS) reads.chroma[s] = slider("chroma", `C ${s}`, `--chroma-${s}`, 0, 0.4, 0.001);
for (const f of HUED) reads.hues[f] = slider("hues", f, `--${f}-hue`, 0, 360, 12); // 360/24 grid

// --- faders: per-hue chroma multiplier (seed to 1 where undeclared) ---
for (const f of HUED) set(`--${f}-chroma`, parseFloat(get(`--${f}-chroma`)) || 1);
for (const f of HUED) slider("faders", f, `--${f}-chroma`, 0, 1.6, 0.01);

// --- HK correction (read-only): the Nayatani lightness ΔL per hue, shown at
// step 500 (--{f}-d-500 — it's now an exact per-step table, not one number).
// Baked science, not a knob — a centered bar shows darken (blue, left) vs
// lighten (yellow, right) so the correction is visible while you tune. ---
for (const f of HUED) {
  const hk = parseFloat(get(`--${f}-d-500`)) || 0;
  const wrap = document.createElement("div");
  wrap.className = "flex items-center gap-2 text-xs";
  const name = document.createElement("span");
  name.className = "w-20 shrink-0 opacity-60";
  name.textContent = f;
  const track = document.createElement("div");
  track.className = "relative flex-1 rounded";
  track.style.cssText = "height:6px;background:rgba(255,255,255,.12)";
  const bar = document.createElement("div");
  const pct = Math.min(Math.abs(hk) / 0.09, 1) * 50; // ΔL scale (~yellow peak)
  bar.style.cssText =
    `position:absolute;top:0;bottom:0;width:${pct}%;border-radius:3px;` +
    (hk >= 0
      ? "left:50%;background:oklch(.85 .16 95)"
      : "right:50%;background:oklch(.65 .18 250)");
  track.appendChild(bar);
  const out = document.createElement("span");
  out.className = "w-14 text-right";
  out.textContent = hk.toFixed(3);
  wrap.append(name, track, out);
  document.getElementById("hk").appendChild(wrap);
}

// --- copy intent: reconstruct the full intent from live CSS ---
// hue { hue, fader, hk } + a separate taste block; correction and taste never mix.
document.getElementById("copy-intent").onclick = () => {
  const L = STEPS.map((s) => `    ${s}: ${get(`--L-${s}`)},`).join("\n");
  const C = STEPS.map((s) => `    ${s}: ${get(`--chroma-${s}`)},`).join("\n");
  const hueBlocks = HUED.map((f) => {
    const hue = Math.round(parseFloat(get(`--${f}-hue`)) * 4) / 4; // keep 0.25 (11.25 grid)
    const fader = get(`--${f}-chroma`);      // seeded to 1; omit identity (§7)
    const parts = [`hue: ${hue}`];
    if (fader && parseFloat(fader) !== 1) parts.push(`chroma: ${fader}`);
    return `    ${f}: { ${parts.join(", ")} },`; // no hk: it's derived at build (hk.mjs)
  }).join("\n");
  const tasteBlocks = HUED.map((f) => {
    const t = parseFloat(get(`--${f}-taste`)) || 0;
    return t !== 0 ? `    ${f}: ${t},` : null;
  }).filter(Boolean).join("\n");
  const text = `// ============================================================\n// inks.intent.mjs — THE INTENT. The only file a human edits.\n// Everything else (inks.css + minted utilities) is @generated.\n// Tune here, then: node generate.mjs\n// ============================================================\n\nexport default {\n  // LIGHTNESS — one shared spine, hue-invariant.\n  lightness: {\n${L}\n  },\n\n  // CHROMA — the arch: peaks mid-ramp, tapers to both poles.\n  chroma: {\n${C}\n  },\n\n  // HUES — hue + fader (per-hue chroma x, omit = 1). hk is DERIVED at\n  // build from hue+fader (hk.mjs, Nayatani), never stored here.\n  hues: {\n${hueBlocks}\n  },\n\n  // TASTE — aesthetic lightness offsets. 0 = pure model.\n  taste: {\n${tasteBlocks}\n  },\n\n  // gray = the lightness axis, rendered. No hue asserted (C=0).\n  gray: true,\n};\n\n// P3 is the output ceiling, not the design target. Chroma UNCLAMPED;\n// the platform gamut-maps. Optimize the ideal model, render per screen.\n`;
  // file:// has no secure-context clipboard, so always fill a selectable box
  // and try execCommand; async clipboard is a best-effort bonus on https.
  const out = document.getElementById("intent-out");
  out.value = text;
  out.style.display = "block";
  out.focus(); out.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (e) { /* ignore */ }
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch(() => {});
    ok = true;
  }
  const btn = document.getElementById("copy-intent");
  btn.textContent = ok ? "Copied ✓" : "select box ↓ then ⌘C";
  setTimeout(() => { btn.textContent = "Copy intent"; }, 1800);
};
