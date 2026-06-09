#!/usr/bin/env node
/**
 * emit-figma-payloads.mjs — turns /tmp/nectar-tokens-resolved.json into compact,
 * embed-ready per-tier payloads for the figma-generate-library use_figma calls.
 * Each token carries: n (figma var name), v (value), t (type), a (alias path|null),
 * css (real CSS var name for code syntax). Ports pathToCSSVar from build-tokens-sd.
 */
import { readFileSync, writeFileSync } from 'fs';

const R = JSON.parse(readFileSync('/tmp/nectar-tokens-resolved.json', 'utf8'));

// ── pathToCSSVar (ported from build-tokens-sd.mjs) ─────────────────────────────
function pathToCSSVar(pathStr) {
  const path = pathStr.split('.');
  const [tier, ...rest] = path;
  if (tier === 'seed') return `--seed-${rest.join('-')}`;
  if (tier === 'map') return `--map-${rest.join('-')}`;
  if (tier === 'component') { const [c, ...p] = rest; return `--${c}-${p.join('-')}`; }
  if (tier === 'alias') {
    const [type, ...parts] = rest;
    switch (type) {
      case 'color': return `--color-${parts.join('-')}`;
      case 'spacing': return `--spacing-${parts.join('-')}`;
      case 'grid': return `--grid-${parts.join('-')}`;
      case 'border': if (parts[0] === 'width') return '--border-w'; if (parts[0] === 'radius') return '--border-radius'; return `--border-${parts.join('-')}`;
      case 'shadow': if (parts[0] === 'base') return '--shadow'; return `--shadow-${parts.join('-')}`;
      case 'typography': { const [tt, ...tr] = parts; return `--${tt}-${tr.join('-')}`; }
      case 'motion': { const [mt, ...mr] = parts; if (mt === 'transition') return `--transition-${mr.join('-')}`; return `--motion-${parts.join('-')}`; }
      default: return `--alias-${type}-${parts.join('-')}`;
    }
  }
  return `--${path.join('-')}`;
}

// Figma variable name: drop the tier prefix, slash-separate the rest.
function figmaName(pathStr) {
  const parts = pathStr.split('.');
  return parts.slice(1).join('/');
}

// Classify Figma resolvedType from token type + value.
function figmaType(t, value) {
  if (t === 'color') return 'COLOR';
  if (t === 'number') return 'FLOAT';
  if (t === 'boolean') return 'BOOLEAN';
  // fontFamily, duration, cubicBezier, string → STRING
  return 'STRING';
}

function pack(tierObj) {
  return Object.values(tierObj).map((e) => ({
    n: figmaName(e.path),
    p: e.path,
    v: e.value,
    t: figmaType(e.type, e.value),
    a: e.alias || null,          // alias path within the token tree, if any
    css: pathToCSSVar(e.path),
  }));
}

const payloads = {
  primitives: pack(R.primitives),
  seed: pack(R.seed),
  map: pack(R.map),
  semantic: pack(R.alias),
  component: pack(R.component),
  themes: R.themes, // {light:{name:hex}, dark, high-contrast}
  $counts: R.$counts,
};

writeFileSync('/tmp/figma-payloads.json', JSON.stringify(payloads));
// also write per-tier minified files for compact reads
for (const k of ['primitives', 'seed', 'map', 'semantic', 'component']) {
  writeFileSync(`/tmp/figma-${k}.json`, JSON.stringify(payloads[k]));
}
writeFileSync('/tmp/figma-themes.json', JSON.stringify(payloads.themes));
console.log('✅ payloads emitted to /tmp/figma-*.json');
console.log('counts:', JSON.stringify({
  primitives: payloads.primitives.length, seed: payloads.seed.length, map: payloads.map.length,
  semantic: payloads.semantic.length, component: payloads.component.length,
}));
// sample
console.log('sample primitive:', JSON.stringify(payloads.primitives[0]));
console.log('sample seed:', JSON.stringify(payloads.seed.find((x) => x.a) || payloads.seed[0]));
console.log('sample map color:', JSON.stringify(payloads.map.find((x) => x.t === 'COLOR')));
