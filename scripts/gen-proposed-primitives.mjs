#!/usr/bin/env node
/**
 * gen-proposed-primitives.mjs — PROPOSAL generator (does not touch tokens).
 * Turns the ad-hoc named primitive colours into systematic hue ramps:
 * each family = a fixed 50→950 lightness scale, perceptually even in OKLCH,
 * anchored on an EXISTING brand hue so character is preserved.
 * Output: /tmp/proposed-primitives.json  { steps, families:{ name:{step:hex} } }
 */
import chroma from 'chroma-js';
import { writeFileSync } from 'node:fs';

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// target OKLCH lightness per step (light → dark)
const L = [0.975, 0.94, 0.88, 0.80, 0.71, 0.62, 0.53, 0.44, 0.36, 0.29, 0.22];
// chroma multiplier per step (muted at the extremes, peak around 400–500)
const CC = [0.22, 0.40, 0.62, 0.84, 0.97, 1.0, 0.96, 0.86, 0.72, 0.56, 0.40];

// hue anchors taken from existing brand colours (mid-tone members so the hue reads true)
const FAMILIES = [
  { name: 'honey',   anchor: '#D4A843' }, // gold (brand primary family)
  { name: 'coral',   anchor: '#C0503E' }, // warm red / terracotta
  { name: 'blush',   anchor: '#E8948C' }, // pink
  { name: 'meadow',  anchor: '#3D7A5E' }, // green
  { name: 'olive',   anchor: '#6B7F4E' }, // yellow-green
  { name: 'sky',     anchor: '#7FB0DC' }, // blue (accent family)
  { name: 'indigo',  anchor: '#3D5A80' }, // deep blue (systems sub-brand)
  { name: 'plum',    anchor: '#7B5C8E' }, // purple (ambiguity sub-brand)
  { name: 'neutral', anchor: '#3E3A44', neutral: true }, // cool warm-grey
];

const families = {};
for (const f of FAMILIES) {
  const [, c0, h0] = chroma(f.anchor).oklch();
  const H = Number.isNaN(h0) ? 0 : h0;
  const baseC = f.neutral ? 0.006 : Math.min(c0 * 1.25, 0.15);
  families[f.name] = {};
  STEPS.forEach((s, i) => {
    families[f.name][s] = chroma.oklch(L[i], baseC * CC[i], H).hex().toUpperCase();
  });
}

writeFileSync('/tmp/proposed-primitives.json', JSON.stringify({ steps: STEPS, families }));
console.log('✅ proposed primitives →', Object.keys(families).length, 'families ×', STEPS.length, 'steps');
for (const [n, r] of Object.entries(families)) console.log(n.padEnd(8), STEPS.map((s) => r[s]).join(' '));
