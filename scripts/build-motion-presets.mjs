#!/usr/bin/env node
/**
 * build-motion-presets.mjs
 *
 * Reads tokens/motion/patterns.json + tokens/core/primitives.json, resolves
 * duration/easing refs, and emits three output files:
 *
 *   dist/gsap/presets.js          — duration/easing helpers + GSAP pattern presets
 *   dist/framer/variants.js       — Framer Motion initial/animate/exit/transition objects
 *   dist/animation-keyframes.css  — CSS @keyframes + utility classes per pattern
 *
 * Silently exits (code 0) if tokens/motion/patterns.json is not found.
 *
 * Usage:
 *   node scripts/build-motion-presets.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const DIST      = join(ROOT, 'dist');

const PATTERNS_FILE   = join(ROOT, 'tokens', 'motion', 'patterns.json');
const PRIMITIVES_FILE = join(ROOT, 'tokens', 'core',   'primitives.json');

// ── Guard ─────────────────────────────────────────────────────────────────────

if (!existsSync(PATTERNS_FILE)) {
  console.log('[build-motion-presets] tokens/motion/patterns.json not found — skipping.');
  process.exit(0);
}

// ── Load ──────────────────────────────────────────────────────────────────────

const patterns   = JSON.parse(readFileSync(PATTERNS_FILE,   'utf8'));
const primitives = JSON.parse(readFileSync(PRIMITIVES_FILE, 'utf8'));

// ── Ref resolution ────────────────────────────────────────────────────────────

/** Walk an object by a dot-path array, return the node or undefined. */
function getPath(obj, keys) {
  return keys.reduce((cur, k) => (cur && typeof cur === 'object' ? cur[k] : undefined), obj);
}

/** If value is a bare `{a.b.c}` reference, return its split path; else null. */
function parseRef(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(/^\{([^}]+)\}$/);
  return m ? m[1].split('.') : null;
}

/**
 * Resolve a duration ref (e.g. `{seed.motion.duration.base}`) to seconds.
 * Falls back to parsing a bare "200ms" string if the ref is not a token path.
 */
function resolveDuration(rawValue) {
  const refPath = parseRef(rawValue);
  const node    = refPath ? getPath(primitives, refPath) : null;
  const ms      = node?.$value ?? rawValue;

  if (typeof ms === 'string' && ms.endsWith('ms')) return parseFloat(ms) / 1000;
  if (typeof ms === 'number') return ms / 1000;
  return 0;
}

/**
 * Parse a raw easing value (4-element array or CSS cubic-bezier string)
 * into both a Framer-compatible array and a CSS/GSAP-compatible string.
 */
function parseEasingValue(raw) {
  if (Array.isArray(raw) && raw.length === 4) {
    return { array: raw, css: `cubic-bezier(${raw.join(', ')})` };
  }
  if (typeof raw === 'string') {
    const m = raw.match(
      /cubic-bezier\(\s*([\d.-]+),\s*([\d.-]+),\s*([\d.-]+),\s*([\d.-]+)\s*\)/
    );
    if (m) {
      const arr = [m[1], m[2], m[3], m[4]].map(Number);
      return { array: arr, css: `cubic-bezier(${arr.join(', ')})` };
    }
  }
  // Fallback: ease-out
  return { array: [0.215, 0.61, 0.355, 1], css: 'cubic-bezier(0.215, 0.61, 0.355, 1)' };
}

/** Resolve an easing ref (e.g. `{seed.motion.easing.easeOut}`) to { array, css }. */
function resolveEasing(rawValue) {
  const refPath = parseRef(rawValue);
  const node    = refPath ? getPath(primitives, refPath) : null;
  return parseEasingValue(node?.$value ?? rawValue);
}

// ── Token helpers from primitives ─────────────────────────────────────────────

const motionPrims = primitives?.seed?.motion ?? {};

/** Duration tokens → seconds, keyed by token name (instant, fast, base, …). */
const durationTokens = Object.fromEntries(
  Object.entries(motionPrims.duration ?? {})
    .filter(([, n]) => n.$value !== undefined)
    .map(([key, n]) => {
      const ms = typeof n.$value === 'string' && n.$value.endsWith('ms')
        ? parseFloat(n.$value) / 1000
        : Number(n.$value) / 1000;
      return [key, ms];
    })
);

/** Easing tokens → { array, css }, keyed by token name. */
const easingTokens = Object.fromEntries(
  Object.entries(motionPrims.easing ?? {})
    .filter(([, n]) => n.$value !== undefined)
    .map(([key, n]) => [key, parseEasingValue(n.$value)])
);

// ── Parse animation patterns ──────────────────────────────────────────────────

/** dash-case → camelCase. */
function toCamel(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Extract numeric props from a from/to block (skip $-prefixed meta keys). */
function extractProps(block = {}) {
  return Object.fromEntries(
    Object.entries(block)
      .filter(([k]) => !k.startsWith('$'))
      .map(([k, v]) => [k, Number(v.$value)])
  );
}

const parsedPatterns = Object.entries(patterns?.animation ?? {})
  .filter(([k]) => !k.startsWith('$'))
  .map(([name, p]) => ({
    name,
    camel:         toCamel(name),
    from:          extractProps(p.from),
    to:            extractProps(p.to),
    duration:      resolveDuration(p.duration?.$value ?? ''),
    easing:        resolveEasing(p.easing?.$value ?? ''),
    trigger:       p.trigger?.$value ?? 'mount',
    stagger:       p.stagger
      ? {
          baseDelay: Number(p.stagger.baseDelay?.$value ?? 0),
          maxTotal:  Number(p.stagger.maxTotal?.$value  ?? 1),
        }
      : null,
    scrollTrigger: p.scrollTrigger
      ? {
          start:         p.scrollTrigger.start?.$value         ?? 'top 85%',
          toggleActions: p.scrollTrigger.toggleActions?.$value ?? 'play none none none',
        }
      : null,
  }));

// ── CSS prop serialiser (handles transform shorthands) ────────────────────────

function propsToCss(props) {
  const declarations = [];
  const transforms   = [];

  for (const [key, val] of Object.entries(props)) {
    switch (key) {
      case 'x':      transforms.push(`translateX(${val}px)`); break;
      case 'y':      transforms.push(`translateY(${val}px)`); break;
      case 'scale':  transforms.push(`scale(${val})`);        break;
      case 'scaleX': transforms.push(`scaleX(${val})`);       break;
      case 'scaleY': transforms.push(`scaleY(${val})`);       break;
      case 'rotate': transforms.push(`rotate(${val}deg)`);    break;
      default:       declarations.push(`${key}: ${val};`);
    }
  }
  if (transforms.length) declarations.push(`transform: ${transforms.join(' ')};`);
  return declarations.join(' ');
}

// ── Builder: dist/gsap/presets.js ────────────────────────────────────────────

function buildGsapPresets() {
  const lines = [
    '// AUTO-GENERATED by build-motion-presets.mjs — do not edit directly.',
    '// Source: tokens/motion/patterns.json + tokens/core/primitives.json',
    '',
    '/** Duration tokens in seconds, matching seed.motion.duration.* names. */',
    `export const duration = ${JSON.stringify(durationTokens, null, 2)};`,
    '',
    '/**',
    ' * Easing tokens as CSS cubic-bezier strings.',
    ' * GSAP 3 accepts these natively via the `ease` tween property.',
    ' */',
    'export const easing = {',
    ...Object.entries(easingTokens).map(([k, { css }]) => `  ${k}: '${css}',`),
    '};',
    '',
    '/**',
    ' * Animation pattern presets derived from design tokens.',
    ' *',
    ' * @example',
    ' * const p = presets.pageEnter;',
    ' * gsap.from(el, { ...p.from, duration: p.duration, ease: p.ease });',
    ' *',
    ' * @example — scroll-triggered',
    ' * const p = presets.scrollReveal;',
    ' * gsap.from(el, { ...p.from, duration: p.duration, ease: p.ease,',
    ' *   scrollTrigger: { trigger: el, ...p.scrollTrigger } });',
    ' */',
    'export const presets = {',
  ];

  for (const p of parsedPatterns) {
    lines.push(`  /** ${p.name} — trigger: ${p.trigger} */`);
    lines.push(`  ${p.camel}: {`);
    lines.push(`    from:     ${JSON.stringify(p.from)},`);
    lines.push(`    to:       ${JSON.stringify(p.to)},`);
    lines.push(`    duration: ${p.duration},`);
    lines.push(`    ease:     '${p.easing.css}',`);
    lines.push(`    trigger:  '${p.trigger}',`);
    if (p.stagger)       lines.push(`    stagger:       ${JSON.stringify(p.stagger)},`);
    if (p.scrollTrigger) lines.push(`    scrollTrigger: ${JSON.stringify(p.scrollTrigger)},`);
    lines.push(`  },`);
  }

  lines.push('};', '', 'export default { duration, easing, presets };');
  return lines.join('\n') + '\n';
}

// ── Builder: dist/framer/variants.js ─────────────────────────────────────────

function buildFramerVariants() {
  const lines = [
    '// AUTO-GENERATED by build-motion-presets.mjs — do not edit directly.',
    '// Source: tokens/motion/patterns.json + tokens/core/primitives.json',
    '//',
    '// Usage: spread onto <motion.*> components.',
    '//   <motion.div {...variants.pageEnter} />',
    '//   <AnimatePresence><motion.div {...variants.pageExit} /></AnimatePresence>',
    '',
  ];

  for (const p of parsedPatterns) {
    lines.push(`/** ${p.name} — trigger: ${p.trigger} */`);

    if (p.trigger === 'unmount') {
      // Exit-only variant: current state → `to` when leaving
      lines.push(`export const ${p.camel} = {`);
      lines.push(`  exit:       ${JSON.stringify(p.to)},`);
      lines.push(`  transition: { duration: ${p.duration}, ease: ${JSON.stringify(p.easing.array)} },`);
      lines.push(`};`);
    } else {
      const transition = { duration: p.duration, ease: p.easing.array };
      if (p.stagger) transition.staggerChildren = p.stagger.baseDelay;

      lines.push(`export const ${p.camel} = {`);
      lines.push(`  initial:    ${JSON.stringify(p.from)},`);
      lines.push(`  animate:    ${JSON.stringify(p.to)},`);
      lines.push(`  transition: ${JSON.stringify(transition)},`);
      lines.push(`};`);
    }
    lines.push('');
  }

  lines.push('export default {');
  for (const p of parsedPatterns) lines.push(`  ${p.camel},`);
  lines.push('};');
  return lines.join('\n') + '\n';
}

// ── Builder: dist/framer/variants.d.ts ────────────────────────────────────────

function buildFramerVariantsDts() {
  const lines = [
    '// AUTO-GENERATED by build-motion-presets.mjs — do not edit directly.',
    '// Source: tokens/motion/patterns.json + tokens/core/primitives.json',
    '',
    'type BezierDefinition = readonly [number, number, number, number];',
    '',
  ];

  for (const p of parsedPatterns) {
    lines.push(`/** ${p.name} — trigger: ${p.trigger} */`);

    if (p.trigger === 'unmount') {
      lines.push(`export declare const ${p.camel}: {`);
      lines.push(`  readonly exit: Readonly<${JSON.stringify(p.to)}>;`);
      lines.push('  readonly transition: {');
      lines.push(`    readonly duration: ${p.duration};`);
      lines.push('    readonly ease: BezierDefinition;');
      lines.push('  };');
      lines.push('};');
    } else {
      lines.push(`export declare const ${p.camel}: {`);
      lines.push(`  readonly initial: Readonly<${JSON.stringify(p.from)}>;`);
      lines.push(`  readonly animate: Readonly<${JSON.stringify(p.to)}>;`);
      lines.push('  readonly transition: {');
      lines.push(`    readonly duration: ${p.duration};`);
      lines.push('    readonly ease: BezierDefinition;');
      if (p.stagger) lines.push(`    readonly staggerChildren: ${p.stagger.baseDelay};`);
      lines.push('  };');
      lines.push('};');
    }

    lines.push('');
  }

  lines.push('declare const _default: {');
  for (const p of parsedPatterns) lines.push(`  readonly ${p.camel}: typeof ${p.camel};`);
  lines.push('};');
  lines.push('export default _default;');
  return lines.join('\n') + '\n';
}

// ── Builder: dist/animation-keyframes.css ────────────────────────────────────

function buildKeyframes() {
  const lines = [
    '/* AUTO-GENERATED by build-motion-presets.mjs — do not edit directly. */',
    '/* Source: tokens/motion/patterns.json + tokens/core/primitives.json   */',
    '/*                                                                      */',
    '/* Apply a keyframe animation via the utility class, e.g.:             */',
    '/*   <div class="nectar-fade-in">…</div>                               */',
    '/* Or reference the @keyframes name directly in your own CSS.          */',
    '',
  ];

  for (const p of parsedPatterns) {
    const kfName   = `nectar-${p.name}`;
    const fromCss  = propsToCss(p.from);
    const toCss    = propsToCss(p.to);

    lines.push(`/* ── ${p.name} (${p.trigger}, ${p.duration}s) ── */`);
    lines.push(`@keyframes ${kfName} {`);
    lines.push(`  from { ${fromCss} }`);
    lines.push(`  to   { ${toCss} }`);
    lines.push(`}`, '');
    lines.push(`.${kfName} {`);
    lines.push(`  animation: ${kfName} ${p.duration}s ${p.easing.css} both;`);
    lines.push(`}`, '');
  }

  // Reduced-motion override: collapse all nectar-* animations
  lines.push('@media (prefers-reduced-motion: reduce) {');
  for (const p of parsedPatterns) {
    lines.push(`  .nectar-${p.name} {`);
    lines.push(`    animation-duration: 0.01ms !important;`);
    lines.push(`  }`);
  }
  lines.push('}');

  return lines.join('\n') + '\n';
}

// ── Builder: dist/gsap/presets.d.ts ───────────────────────────────────────────

function buildGsapPresetsDts() {
  const lines = [
    '// AUTO-GENERATED by build-motion-presets.mjs — do not edit directly.',
    '// Source: tokens/motion/patterns.json + tokens/core/primitives.json',
    '',
    `export declare const duration: Readonly<${JSON.stringify(durationTokens, null, 2)}>;`,
    '',
    'export declare const easing: {',
    ...Object.entries(easingTokens).map(([k, { css }]) => `  readonly ${k}: ${JSON.stringify(css)};`),
    '};',
    '',
    'export declare const presets: {',
  ];

  for (const p of parsedPatterns) {
    lines.push(`  readonly ${p.camel}: {`);
    lines.push(`    readonly from: Readonly<${JSON.stringify(p.from)}>;`);
    lines.push(`    readonly to: Readonly<${JSON.stringify(p.to)}>;`);
    lines.push(`    readonly duration: ${p.duration};`);
    lines.push('    readonly ease: string;');
    lines.push(`    readonly trigger: ${JSON.stringify(p.trigger)};`);
    if (p.stagger) lines.push(`    readonly stagger: Readonly<${JSON.stringify(p.stagger)}>;`);
    if (p.scrollTrigger) lines.push(`    readonly scrollTrigger: Readonly<${JSON.stringify(p.scrollTrigger)}>;`);
    lines.push('  };');
  }

  lines.push('};', '', 'declare const _default: {', '  readonly duration: typeof duration;', '  readonly easing: typeof easing;', '  readonly presets: typeof presets;', '};', 'export default _default;');
  return lines.join('\n') + '\n';
}

// ── Write outputs ─────────────────────────────────────────────────────────────

function emit(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
  const rel = filePath.replace(ROOT + '/', '');
  console.log(`[build-motion-presets] ✓ ${rel}`);
}

emit(join(DIST, 'gsap',   'presets.js'),         buildGsapPresets());
emit(join(DIST, 'framer', 'variants.js'),         buildFramerVariants());
emit(join(DIST, 'framer', 'variants.d.ts'),       buildFramerVariantsDts());
emit(join(DIST, 'gsap',   'presets.d.ts'),        buildGsapPresetsDts());
emit(join(DIST,           'animation-keyframes.css'), buildKeyframes());

console.log(
  `[build-motion-presets] done — ${parsedPatterns.length} patterns,`,
  `${Object.keys(durationTokens).length} durations,`,
  `${Object.keys(easingTokens).length} easings.`
);
