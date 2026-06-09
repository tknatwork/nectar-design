#!/usr/bin/env node
/**
 * validate-token-types.mjs — Validates DTCG token JSON files:
 *   1. Spacing scale monotonicity (xs < sm < md < lg < xl < 2xl < section)
 *   2. Reference integrity (every {a.b.c} resolves to an existing token)
 *   3. Color format validity ($type: "color" tokens are valid hex or refs)
 *
 * Exit 1 on failure, 0 on pass.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TOKENS = join(ROOT, 'tokens');

// ── Token file manifest ──────────────────────────────────────────────────────
const TOKEN_FILES = [
  'core/primitives.json',
  'core/seed.json',
  'core/map.json',
  'core/semantic.json',
  'components/button.json',
  'components/card.json',
  'components/input.json',
  'components/badge.json',
  // Added 2026-05-21 — phases 3 + 6 component tokens were missing from validator scope
  'components/glass.json',
  'components/toast.json',
];

// ── Flatten DTCG (reused from build-tokens-sd.mjs) ──────────────────────────
function flattenDTCG(obj, pathParts = []) {
  const results = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = [...pathParts, key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if ('$value' in val) {
        results.push({ path, value: val.$value, type: val.$type ?? null });
      } else {
        results.push(...flattenDTCG(val, path));
      }
    }
  }
  return results;
}

// ── Load all tokens into a flat index ────────────────────────────────────────
const allTokens = [];
for (const file of TOKEN_FILES) {
  const json = JSON.parse(readFileSync(join(TOKENS, file), 'utf8'));
  allTokens.push(...flattenDTCG(json));
}
const tokenIndex = new Map(allTokens.map(t => [t.path.join('.'), t]));
console.log(`Loaded ${tokenIndex.size} tokens from ${TOKEN_FILES.length} files`);

const errors = [];

// ── 1. Reference integrity ───────────────────────────────────────────────────
for (const token of allTokens) {
  if (typeof token.value !== 'string') continue;
  const refs = [...token.value.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
  for (const ref of refs) {
    if (!tokenIndex.has(ref)) {
      errors.push(`Broken ref: ${token.path.join('.')} → {${ref}} does not exist`);
    }
  }
}

// ── 2. Color format validity ─────────────────────────────────────────────────
const HEX_RE = /^#([0-9A-Fa-f]{3,8})$/;
for (const token of allTokens) {
  if (token.type !== 'color' || typeof token.value !== 'string') continue;
  const isRef = token.value.includes('{');
  const isHex = HEX_RE.test(token.value);
  // Standard CSS color functions: rgb/rgba, hsl/hsla, oklch/oklab, color-mix, color(), hwb, lab, lch
  const isCSSFn = /^(color-mix|oklch|oklab|hsla?|rgba?|color|hwb|lab|lch)\(/.test(token.value);
  if (!isRef && !isHex && !isCSSFn) {
    errors.push(`Invalid color: ${token.path.join('.')} = "${token.value}" (not hex, ref, or CSS fn)`);
  }
}

// ── 3. Spacing scale monotonicity ────────────────────────────────────────────
function resolveNumericPx(value) {
  if (typeof value !== 'string') return NaN;
  const pxMatch = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]);
  const refMatch = value.match(/^\{([^}]+)\}$/);
  if (refMatch) {
    const target = tokenIndex.get(refMatch[1]);
    if (target) return resolveNumericPx(target.value);
  }
  return NaN;
}

const SPACING_SCALE = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'section'];
let prevPx = -1;
let prevName = '';
for (const name of SPACING_SCALE) {
  const token = tokenIndex.get(`alias.spacing.${name}`);
  if (!token) { errors.push(`Missing spacing token: alias.spacing.${name}`); continue; }
  const px = resolveNumericPx(token.value);
  if (isNaN(px)) { errors.push(`Cannot resolve spacing.${name} to px`); continue; }
  if (px <= prevPx) {
    errors.push(`Spacing not monotonic: ${prevName}(${prevPx}px) >= ${name}(${px}px)`);
  }
  prevPx = px;
  prevName = name;
}

// ── Report ───────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\n${errors.length} token validation error(s).`);
  process.exit(1);
}
console.log(`✓ All tokens valid (${tokenIndex.size} tokens, ${SPACING_SCALE.length}-step spacing scale)`);

