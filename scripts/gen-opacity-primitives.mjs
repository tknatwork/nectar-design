#!/usr/bin/env node
/**
 * gen-opacity-primitives.mjs — PROPOSAL v2 generator (does not touch tokens).
 * The "opacity model" primitive colour system:
 *   - one BASE per family = step 500 (solid).
 *   - consistency: every family's 500 shares the SAME saturation+brightness as the
 *     reference (#F5B71F), only HUE rotates ("fixed graph position, move hue slider").
 *   - 11 steps: base @ symmetric alpha falloff; left of 500 composited on WHITE,
 *     right of 500 on BLACK. Two variations: (A) alpha-over-bg, (B) flattened solid.
 * Output: /tmp/opacity-primitives.json
 */
import chroma from 'chroma-js';
import { writeFileSync } from 'node:fs';

const REF = '#F5B71F';                     // user-chosen honey-500 → defines S + V
const [, S, V] = chroma(REF).hsv();

// family → hue (deg). S+V held from REF for consistency. neutral = achromatic exception.
const FAM = [
  ['honey', 43], ['coral', 14], ['blush', 335], ['olive', 78],
  ['meadow', 140], ['sky', 200], ['indigo', 230], ['plum', 285],
];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const ALPHA = [0.10, 0.25, 0.45, 0.65, 0.85, 1.0, 0.85, 0.65, 0.45, 0.25, 0.10];
const BG    = ['w', 'w', 'w', 'w', 'w', '-', 'b', 'b', 'b', 'b', 'b'];

// Neutral gets 4 extra steps (15 total) for a11y headroom: densify the border/subtle-bg
// zone (150,250) and the text-contrast zone (750,850). Aligned with shared labels; extras interpolated.
const NEUTRAL_STEPS = [50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 750, 800, 850, 900, 950];
const NEUTRAL_ALPHA = [0.10, 0.25, 0.35, 0.45, 0.55, 0.65, 0.85, 1.0, 0.85, 0.65, 0.55, 0.45, 0.35, 0.25, 0.10];
const NEUTRAL_BG    = ['w', 'w', 'w', 'w', 'w', 'w', 'w', '-', 'b', 'b', 'b', 'b', 'b', 'b', 'b'];

function flatten(base, a, bg) {
  const B = bg === 'b' ? [0, 0, 0] : [255, 255, 255];
  const [r, g, b] = base.rgb();
  return chroma(r * a + B[0] * (1 - a), g * a + B[1] * (1 - a), b * a + B[2] * (1 - a)).hex().toUpperCase();
}

function buildFamily(base, hue, steps = STEPS, alpha = ALPHA, bg = BG) {
  const out = {};
  steps.forEach((s, i) => {
    out[s] = {
      alpha: alpha[i], bg: bg[i],
      base: base.hex().toUpperCase(),
      solid: bg[i] === '-' ? base.hex().toUpperCase() : flatten(base, alpha[i], bg[i]),
    };
  });
  return { hue, base: base.hex().toUpperCase(), stepKeys: steps, steps: out };
}

const families = {};
for (const [name, hue] of FAM) families[name] = buildFamily(chroma.hsv(hue, S, V), hue);
families.neutral = buildFamily(chroma.hsv(43, 0.05, 0.55), null, NEUTRAL_STEPS, NEUTRAL_ALPHA, NEUTRAL_BG); // 15-step a11y scale
families.white = buildFamily(chroma('#FFFFFF'), null); // Pure White — α grades = highlights
families.black = buildFamily(chroma('#000000'), null); // Pure Black — α grades = shadows

writeFileSync('/tmp/opacity-primitives.json', JSON.stringify({ ref: REF, S, V, steps: STEPS, alpha: ALPHA, bg: BG, families }));
console.log(`✅ opacity-model primitives (ref ${REF} · S=${(S * 100).toFixed(0)}% V=${(V * 100).toFixed(0)}%) → 9 families × 11 steps`);
for (const [n, f] of Object.entries(families)) {
  console.log('%s', `${n.padEnd(8)}(${f.stepKeys.length}) ` + f.stepKeys.map((s) => f.steps[s].solid).join(' '));
}
