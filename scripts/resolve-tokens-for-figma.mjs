#!/usr/bin/env node
/**
 * resolve-tokens-for-figma.mjs  (ADR 0026 design-system → Figma sync)
 *
 * Flattens the full 5-tier token tree + themes + sub-brands and RESOLVES every
 * value to a concrete form Figma can store — including the map tier's
 * `color-mix(in oklch, …)` and `oklch(from … / alpha)` operations, which have
 * no literal value until computed. Output is the ground-truth dataset the
 * figma-generate-library build reads from.
 *
 * Read-only against the token files; writes one JSON artifact:
 *   /tmp/nectar-tokens-resolved.json
 *
 * Usage: node scripts/resolve-tokens-for-figma.mjs
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import chroma from 'chroma-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
// `p` is always a hardcoded literal subpath in this script (never external input);
// directory-listed filenames are separately validated via safeName(). False positive.
// nosemgrep
const T = (p) => join(ROOT, 'tokens', p);

const SAFE = /^[a-z0-9][a-z0-9._-]*\.json$/i;
const safeName = (n) => { const b = basename(n); if (b !== n || !SAFE.test(b)) throw new Error(`unsafe ${n}`); return b; };

// ── Load + merge the core tree (mirrors build-tokens-sd source order) ──────────
function loadJSON(p) { return JSON.parse(readFileSync(p, 'utf8')); }
function deepMerge(a, b) {
  for (const k of Object.keys(b)) {
    if (k.startsWith('$') && k !== '$value' && k !== '$type') { a[k] = b[k]; continue; }
    if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object') deepMerge(a[k], b[k]);
    else a[k] = b[k];
  }
  return a;
}

const core = {};
deepMerge(core, loadJSON(T('core/primitives.json')));
deepMerge(core, loadJSON(T('core/seed.json')));
deepMerge(core, loadJSON(T('core/map.json')));
deepMerge(core, loadJSON(T('core/semantic.json')));
const componentsDir = T('components');
const componentFiles = existsSync(componentsDir) ? readdirSync(componentsDir).filter((f) => f.endsWith('.json')) : [];
for (const f of componentFiles) deepMerge(core, loadJSON(join(componentsDir, safeName(f))));

// ── Flatten to path → raw token ────────────────────────────────────────────────
const raw = {}; // 'seed.color.pastel.honey' → { value, type }
function flatten(obj, pre = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const path = [...pre, k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if ('$value' in v) raw[path.join('.')] = { value: v.$value, type: v.$type ?? null, desc: v.$description ?? null };
      else flatten(v, path);
    }
  }
}
flatten(core);

// ── Resolution (refs + color-mix + oklch-from) ─────────────────────────────────
const RESOLVING = new Set();
const cache = {};

function refToValue(ref) {
  if (cache[ref] !== undefined) return cache[ref];
  if (RESOLVING.has(ref)) throw new Error(`cycle at ${ref}`);
  RESOLVING.add(ref);
  const tok = raw[ref];
  if (!tok) { RESOLVING.delete(ref); return null; }
  const out = resolve(tok.value, tok.type);
  RESOLVING.delete(ref);
  cache[ref] = out;
  return out;
}

// Resolve a single {a.b.c} reference embedded in a string to a concrete color/number string.
function expandRefs(str) {
  return str.replace(/\{([^}]+)\}/g, (_, r) => {
    const v = refToValue(r);
    return v == null ? `{${r}}` : String(v.value ?? v);
  });
}

function toHex(c) { return chroma(c).alpha() < 1 ? chroma(c).hex('rgba') : chroma(c).hex(); }

function computeColorMix(expr) {
  // color-mix(in oklch, <A> [p%], <B> [q%])
  const inner = expr.slice(expr.indexOf('(') + 1, expr.lastIndexOf(')'));
  const parts = inner.split(',').map((s) => s.trim());
  // parts[0] = 'in oklch'
  const a = parts[1], b = parts[2];
  const parsePart = (p) => {
    const m = p.match(/^(.*?)(?:\s+([\d.]+)%)?$/);
    return { color: expandRefs(m[1].trim()), pct: m[2] != null ? parseFloat(m[2]) : null };
  };
  const A = parsePart(a), B = parsePart(b);
  // Determine A's weight. If A.pct given, weightA = A.pct/100. elif B.pct given, weightA = 1 - B.pct/100. else 0.5
  let wA = A.pct != null ? A.pct / 100 : B.pct != null ? 1 - B.pct / 100 : 0.5;
  // chroma.mix(c1,c2,f): f=weight of c2. We want A at wA → f = 1 - wA toward B.
  const mixed = chroma.mix(A.color, B.color, 1 - wA, 'oklch');
  return toHex(mixed);
}

function computeOklchFrom(expr) {
  // oklch(from <ref> l c h / <alpha>)
  const inner = expr.slice(expr.indexOf('(') + 1, expr.lastIndexOf(')'));
  const m = inner.match(/^from\s+(.+?)\s+l\s+c\s+h\s*\/\s*([\d.]+)\s*$/);
  if (!m) return null;
  const base = expandRefs(m[1].trim());
  const alpha = parseFloat(m[2]);
  return chroma(base).alpha(alpha).hex('rgba');
}

function resolve(value, type) {
  if (Array.isArray(value)) return { value: `cubic-bezier(${value.join(', ')})`, type };
  if (typeof value === 'number') return { value, type };
  if (typeof value !== 'string') return { value: String(value), type };

  let s = value.trim();
  // pure alias {a.b.c}
  const pureRef = s.match(/^\{([^}]+)\}$/);
  if (pureRef) { const r = refToValue(pureRef[1]); return { value: r ? r.value : s, type, alias: pureRef[1] }; }
  if (s.startsWith('color-mix(')) return { value: computeColorMix(s), type };
  if (s.startsWith('oklch(from')) { const v = computeOklchFrom(s); return { value: v ?? s, type }; }
  if (s.includes('{')) return { value: expandRefs(s), type };
  // duration ms → keep as-is for display; numbers stay
  return { value: s, type };
}

// ── Resolve everything, partitioned by tier ────────────────────────────────────
function tierOf(path) {
  const t = path.split('.')[0];
  if (t === 'seed') return path.split('.')[1] === undefined ? 'seed' : (raw[path] && path.split('.').length <= 2 ? 'seed' : 'primitive_or_seed');
  return t;
}

const resolved = { primitives: {}, seed: {}, map: {}, alias: {}, component: {}, themes: {}, subBrands: {} };
for (const [path, tok] of Object.entries(raw)) {
  const top = path.split('.')[0];
  const r = resolve(tok.value, tok.type);
  const entry = { path, value: r.value, type: tok.type, alias: r.alias ?? null, desc: tok.desc, rawValue: tok.value };
  if (top === 'seed') {
    // primitives.json values live under seed.* too; split by whether the raw value is a literal (primitive) or a ref/short brand token (seed)
    const depth = path.split('.').length;
    if (depth >= 3) resolved.primitives[path] = entry; else resolved.seed[path] = entry;
  } else if (top === 'map') resolved.map[path] = entry;
  else if (top === 'alias') resolved.alias[path] = entry;
  else if (top === 'component') resolved.component[path] = entry;
}

// Themes (flat hex under theme.*)
for (const themeFile of ['light.json', 'dark.json', 'high-contrast.json']) {
  const p = T(`themes/${themeFile}`);
  if (!existsSync(p)) continue;
  const tree = loadJSON(p);
  const mode = basename(themeFile, '.json');
  resolved.themes[mode] = {};
  const tmp = {};
  (function fl(o, pre = []) { for (const [k, v] of Object.entries(o)) { if (k.startsWith('$')) continue; if (v && typeof v === 'object' && !Array.isArray(v)) { if ('$value' in v) tmp[[...pre, k].join('.')] = v.$value; else fl(v, [...pre, k]); } } })(tree);
  for (const [k, v] of Object.entries(tmp)) resolved.themes[mode][k] = v;
}

// Sub-brands (resolve override refs to concrete values)
const sbDir = T('sub-brands');
if (existsSync(sbDir)) {
  const masterRaw = loadJSON(join(sbDir, '_master.json'));
  resolved.subBrands._master = masterRaw.defaults;
  for (const f of readdirSync(sbDir).filter((x) => x.endsWith('.json') && !x.startsWith('_'))) {
    const sb = loadJSON(join(sbDir, safeName(f)));
    const ov = {};
    for (const [grp, props] of Object.entries(sb.overrides ?? {})) {
      ov[grp] = {};
      for (const [k, val] of Object.entries(props)) {
        if (typeof val === 'string' && val.startsWith('{')) { const r = refToValue(val.slice(1, -1)); ov[grp][k] = { ref: val, value: r ? r.value : val }; }
        else ov[grp][k] = { value: val };
      }
    }
    resolved.subBrands[sb.name] = { displayName: sb.displayName, overrides: ov, tagline: sb.voice?.tagline ?? null };
  }
}

const counts = {
  primitives: Object.keys(resolved.primitives).length,
  seed: Object.keys(resolved.seed).length,
  map: Object.keys(resolved.map).length,
  alias: Object.keys(resolved.alias).length,
  component: Object.keys(resolved.component).length,
  themes: Object.fromEntries(Object.entries(resolved.themes).map(([m, v]) => [m, Object.keys(v).length])),
  subBrands: Object.keys(resolved.subBrands).filter((k) => k !== '_master').length,
};
resolved.$counts = counts;

writeFileSync('/tmp/nectar-tokens-resolved.json', JSON.stringify(resolved, null, 2), 'utf8');
console.log('✅ resolved tokens → /tmp/nectar-tokens-resolved.json');
console.log(JSON.stringify(counts, null, 2));
// Spot-check a few resolved color-mix + oklch-from values
const samples = ['map.color.primary.Bg', 'map.color.primary.Active', 'map.color.neutralText.colorText', 'map.color.neutralBg.colorBgContainer'];
for (const s of samples) if (resolved.map[s]) console.log(`   ${s} = ${resolved.map[s].value}  (from ${resolved.map[s].rawValue})`);
