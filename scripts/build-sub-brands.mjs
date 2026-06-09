#!/usr/bin/env node
/**
 * build-sub-brands.mjs  (ADR 0026 — Branded House with sub-brands)
 *
 * PARALLEL build step. Does NOT touch the protected 5-tier pipeline
 * (build-tokens-sd.mjs, tokens/core, tokens/components, tokens/themes).
 * It reads only the additive tokens/sub-brands/ directory and emits:
 *
 *   1. css/sub-brands.css        — :root master defaults for the 12-knob
 *                                  surface + one .sub-brand-{slug} rule per
 *                                  sub-brand (the visual overrides).
 *   2. src/sub-brands.generated.ts — a typed runtime registry consumed by
 *                                  SubBrandProvider (name, displayName,
 *                                  atmosphere, hero, tagline, assets, routes).
 *                                  Single source of truth = the *.json files;
 *                                  this module is derived, never hand-edited.
 *
 * Knob → output channel:
 *   color.brand-accent / brand-tint / eyebrow-tone  → CSS var
 *   typography.display-family                        → CSS var
 *   typography.heading-rhythm (preset OR explicit)   → 2 CSS vars
 *   motion.intensity-scale                           → CSS var
 *   surface.glass-tint / radius-scale                → CSS var
 *   nav.* (bg/fg/fg-muted/active-bg/active-fg/       → CSS vars (--nav-*) + a solid
 *          labels/label-family/toggle)                 .glass--chrome material block
 *                                                       when nav.bg is set (ADR 0026 v2)
 *   atmosphere.preset / hero.composition             → runtime (TS registry)
 *   voice.tagline / assets                           → runtime (TS registry)
 *
 * Usage: node scripts/build-sub-brands.mjs
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

// Sub-brand files are read from our own repo directory, but validate every
// filename as a plain basename before any path.join to foreclose traversal.
const SAFE_TOKEN_FILENAME = /^[a-z0-9][a-z0-9._-]*\.json$/i;
function safeTokenFile(name) {
  const base = basename(name);
  if (base !== name || !SAFE_TOKEN_FILENAME.test(base)) {
    throw new Error(`Unsafe sub-brand filename rejected: ${name}`);
  }
  return base;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SUB_BRANDS_DIR = join(ROOT, 'tokens', 'sub-brands');
const CSS_OUT = join(ROOT, 'css', 'sub-brands.css');
const TS_OUT = join(ROOT, 'src', 'sub-brands.generated.ts');

// ── Reference transform (mirrors build-tokens-sd.mjs convertRefs) ──────────────
// {seed.x.y} → var(--seed-x-y), {map.x} → var(--map-x),
// {component.btn.pad} → var(--btn-pad), other {a.b} → var(--a-b).
// Kept in sync intentionally — sub-brand values reference the same token tree.

function convertRefs(value) {
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const parts = ref.split('.');
    const [tier, ...rest] = parts;
    if (tier === 'seed') return `var(--seed-${rest.join('-')})`;
    if (tier === 'map') return `var(--map-${rest.join('-')})`;
    if (tier === 'component') {
      const [component, ...props] = rest;
      return `var(--${component}-${props.join('-')})`;
    }
    return `var(--${parts.join('-')})`;
  });
}

function resolveValue(raw) {
  if (typeof raw === 'number') return String(raw);
  if (typeof raw !== 'string') return String(raw);
  if (raw.includes('{')) return convertRefs(raw);
  return raw;
}

// ── Knob → CSS var mapping ─────────────────────────────────────────────────────
// Returns an array of [cssVar, value] pairs (heading-rhythm expands to two).

function knobToCss(group, key, value, rhythmPresets) {
  if (group === 'color') {
    if (key === 'brand-accent') return [['--color-brand-accent', resolveValue(value)]];
    if (key === 'brand-tint') return [['--color-brand-tint', resolveValue(value)]];
    if (key === 'eyebrow-tone') return [['--color-eyebrow-tone', resolveValue(value)]];
  }
  if (group === 'typography') {
    if (key === 'display-family') return [['--typography-display-family', resolveValue(value)]];
    if (key === 'heading-rhythm') {
      // value is either a preset name (string) or an explicit { line-height, letter-spacing }
      const rhythm =
        typeof value === 'string' ? rhythmPresets[value] : value;
      if (!rhythm) {
        throw new Error(`Unknown heading-rhythm preset "${value}". Valid: ${Object.keys(rhythmPresets).join(', ')}`);
      }
      return [
        ['--heading-line-height', String(rhythm['line-height'])],
        ['--heading-letter-spacing', String(rhythm['letter-spacing'])],
      ];
    }
  }
  if (group === 'motion') {
    if (key === 'intensity-scale') return [['--motion-intensity-scale', String(value)]];
  }
  if (group === 'surface') {
    if (key === 'glass-tint') return [['--surface-glass-tint', resolveValue(value)]];
    if (key === 'radius-scale') return [['--surface-radius-scale', String(value)]];
  }
  if (group === 'nav') {
    // Site-nav re-skin (ADR 0026 v2). Self-contained --nav-* vars, UNSET at
    // master :root, so the default NavPill is byte-identical when omitted.
    if (key === 'bg') return [['--nav-bg', resolveValue(value)]];
    if (key === 'fg') return [['--nav-fg', resolveValue(value)]];
    if (key === 'fg-muted') return [['--nav-fg-muted', resolveValue(value)]];
    if (key === 'active-bg') return [['--nav-active-bg', resolveValue(value)]];
    if (key === 'active-fg') return [['--nav-active-fg', resolveValue(value)]];
    if (key === 'label-family') return [['--nav-label-family', resolveValue(value)]];
    if (key === 'labels') {
      // 'uppercase' preset = uppercase + wide tracking (the EAST nav label feel).
      return value === 'uppercase'
        ? [['--nav-label-transform', 'uppercase'], ['--nav-label-tracking', '0.14em']]
        : [['--nav-label-transform', 'none'], ['--nav-label-tracking', 'normal']];
    }
    if (key === 'toggle') {
      return [['--nav-toggle-display', value === 'hidden' ? 'none' : 'flex']];
    }
  }
  // atmosphere.* and hero.* are runtime-only — no CSS
  return [];
}

// Build the CSS body (array of "  --x: y;" lines) from a knob map.
function knobsToCssLines(knobMap, rhythmPresets) {
  const lines = [];
  for (const [group, props] of Object.entries(knobMap)) {
    if (group === 'atmosphere' || group === 'hero') continue;
    if (!props || typeof props !== 'object') continue;
    for (const [key, value] of Object.entries(props)) {
      for (const [cssVar, cssVal] of knobToCss(group, key, value, rhythmPresets)) {
        lines.push(`  ${cssVar}: ${cssVal};`);
      }
    }
  }
  return lines;
}

// ── Load master + sub-brands ────────────────────────────────────────────────────

if (!existsSync(SUB_BRANDS_DIR)) {
  console.error(`✗ sub-brands directory not found: ${SUB_BRANDS_DIR}`);
  process.exit(1);
}

const master = JSON.parse(readFileSync(join(SUB_BRANDS_DIR, '_master.json'), 'utf8'));
const rhythmPresets = master.headingRhythmPresets ?? {};

const subBrandFiles = readdirSync(SUB_BRANDS_DIR)
  .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
  .sort();

const subBrands = subBrandFiles.map((f) => {
  // `f` is a directory entry from readdirSync of our own repo-local
  // tokens/sub-brands/ dir (not external input), and safeTokenFile() rejects
  // anything that isn't a plain `[a-z0-9._-]+.json` basename. Traversal is not
  // reachable here; the taint scanner doesn't recognize the custom sanitizer.
  // nosemgrep
  const filePath = join(SUB_BRANDS_DIR, safeTokenFile(f));
  return JSON.parse(readFileSync(filePath, 'utf8'));
});

// ── Emit CSS ─────────────────────────────────────────────────────────────────────

const masterLines = knobsToCssLines(master.defaults ?? {}, rhythmPresets);

// Var blocks live INSIDE @layer tokens — they are custom-property
// declarations scoped to :root (master) or .sub-brand-{slug} (overrides).
const subBrandVarBlocks = subBrands.map((sb) => {
  const lines = knobsToCssLines(sb.overrides ?? {}, rhythmPresets);
  return `.sub-brand-${sb.name} {\n${lines.join('\n')}\n}`;
});

// Material blocks live OUTSIDE @layer tokens. A sub-brand that sets nav.bg
// switches the shared NavPill from the glass chrome material to a solid,
// project-coloured material. `.glass--chrome` (app/globals.css) is UNLAYERED,
// and unlayered CSS always beats layered CSS regardless of specificity — so
// this override must be unlayered too, then wins on its extra .sub-brand-{name}
// specificity. The recipe mirrors the former EastNavPill chrome, now derived
// entirely from the sub-brand's own --nav-* vars (single source of truth).
const subBrandMaterialBlocks = subBrands
  .filter((sb) => sb.overrides?.nav?.bg)
  .map(
    (sb) => `.sub-brand-${sb.name} .glass--chrome {
  background: var(--nav-bg);
  -webkit-backdrop-filter: blur(14px) saturate(1.6);
  backdrop-filter: blur(14px) saturate(1.6);
  box-shadow:
    0 6px 22px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 color-mix(in oklab, var(--nav-fg) 8%, transparent),
    0 0 0 1px color-mix(in oklab, var(--nav-active-bg) 22%, transparent);
}`,
  );

const css = `/* ==========================================================================
   nectar-design — Sub-brand overrides (generated by scripts/build-sub-brands.mjs)
   Do not edit manually. Source: tokens/sub-brands/*.json (ADR 0026).

   :root                            → master defaults for the bounded knob surface
   .sub-brand-{slug}                → per-sub-brand var overrides (only what changes)
   .sub-brand-{slug} .glass--chrome → solid nav material (UNLAYERED, only when nav.bg set)

   Import order in the app (globals.css):
     @import 'nectar-design/tokens.css';
     @import 'nectar-design/sub-brands.css';
   ========================================================================== */

@layer tokens {

  /* ── Master brand defaults ─────────────────────────────────────────────── */
  :root {
${masterLines.join('\n')}
  }

  /* ── Sub-brand overrides ───────────────────────────────────────────────── */
${subBrandVarBlocks.join('\n\n')}

}
${
  subBrandMaterialBlocks.length
    ? `
/* ── Sub-brand nav material (UNLAYERED — must beat unlayered .glass--chrome) ── */
${subBrandMaterialBlocks.join('\n\n')}
`
    : ''
}`;

// ── Emit typed runtime registry ────────────────────────────────────────────────

function runtimeFields(source, fallback) {
  const ov = source.overrides ?? source.defaults ?? {};
  return {
    atmosphere: ov.atmosphere?.preset ?? fallback.atmosphere,
    hero: ov.hero?.composition ?? fallback.hero,
    tagline: source.voice?.tagline ?? null,
    assets: source.assets ?? {},
    routes: source.routes ?? [],
  };
}

const masterDefaults = {
  atmosphere: master.defaults?.atmosphere?.preset ?? 'orbs',
  hero: master.defaults?.hero?.composition ?? 'default',
  tagline: master.voice?.tagline ?? null,
};

const records = subBrands.map((sb) => {
  const rt = runtimeFields(sb, masterDefaults);
  return {
    name: sb.name,
    displayName: sb.displayName,
    ...rt,
  };
});

const ts = `/* ==========================================================================
   nectar-design — Sub-brand runtime registry
   GENERATED by scripts/build-sub-brands.mjs from tokens/sub-brands/*.json.
   Do not edit manually (ADR 0026). Consumed by SubBrandProvider.
   ========================================================================== */

export type AtmospherePreset = 'none' | 'orbs' | 'heat' | 'birds' | 'ink-route';
export type HeroComposition = 'default' | 'ink-led' | 'photo-led' | 'typography-led';

export interface SubBrandAssets {
  logo?: string;
  logoMark?: string;
  favicon?: string;
  ogImage?: string;
}

export interface SubBrandRecord {
  name: string;
  displayName: string;
  atmosphere: AtmospherePreset;
  hero: HeroComposition;
  tagline: string | null;
  assets: SubBrandAssets;
  routes: string[];
}

/** Master-brand fallbacks used when no SubBrandProvider is mounted. */
export const MASTER_DEFAULTS = {
  atmosphere: ${JSON.stringify(masterDefaults.atmosphere)} as AtmospherePreset,
  hero: ${JSON.stringify(masterDefaults.hero)} as HeroComposition,
  tagline: ${JSON.stringify(masterDefaults.tagline)} as string | null,
} as const;

/** All registered sub-brands, keyed by slug. Single source of truth: tokens/sub-brands/*.json. */
export const SUB_BRANDS: Record<string, SubBrandRecord> = ${JSON.stringify(
  Object.fromEntries(records.map((r) => [r.name, r])),
  null,
  2,
)};

/** Convenience list of all sub-brand slugs. */
export const SUB_BRAND_NAMES: readonly string[] = ${JSON.stringify(records.map((r) => r.name))};
`;

// ── Write outputs ──────────────────────────────────────────────────────────────

if (!existsSync(dirname(CSS_OUT))) mkdirSync(dirname(CSS_OUT), { recursive: true });
writeFileSync(CSS_OUT, css, 'utf8');
writeFileSync(TS_OUT, ts, 'utf8');

console.log('✅  sub-brand artifacts generated (build-sub-brands.mjs)');
console.log(`    ${CSS_OUT}`);
console.log(`    ${TS_OUT}`);
console.log('');
console.log(`    Master knob defaults: ${masterLines.length} CSS vars`);
console.log(`    Sub-brands:           ${subBrands.length} (${records.map((r) => r.name).join(', ')})`);
