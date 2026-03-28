#!/usr/bin/env node
/**
 * build-tokens-sd.mjs
 *
 * Standalone token build script using Style Dictionary's programmatic API
 * only for DTCG parsing/merging. All CSS output is generated here directly,
 * bypassing SD's transform pipeline to avoid:
 *
 *  • TOKEN COLLISIONS — light/dark themes are read separately (never merged)
 *  • REFERENCE MANGLING — alias {seed.x.y} → var(--seed-x-y) without resolution
 *  • CASE NORMALIZATION — hex colors preserved exactly as authored (#FFE082)
 *  • VALUE COERCION — durations stay as authored (50ms → 0.05s), cubicBezier
 *    arrays → cubic-bezier() strings, composite refs → multi-var() strings
 *
 * Output structure (css/tokens.css):
 *   @layer tokens {
 *     :root { --seed-*; --color-*; --spacing-*; … }   ← Tiers 1 + 2
 *     :root { --bg: #…; … }                            ← Tier 3 light (default)
 *     [data-theme="dark"] { --bg: #…; … }             ← Tier 3 dark (explicit)
 *     @media (prefers-color-scheme: dark) {            ← Tier 3 dark (OS pref)
 *       :root:not([data-theme="light"]) { … }
 *     }
 *   }
 *
 * Usage:
 *   node scripts/build-tokens-sd.mjs
 *   node scripts/build-tokens-sd.mjs --out css/tokens-sd.css   (custom output)
 */

import StyleDictionary from 'style-dictionary';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── CLI args ─────────────────────────────────────────────────────────────────

const outArgIdx = process.argv.indexOf('--out');
const OUTPUT_FILE = outArgIdx !== -1
  ? resolve(process.argv[outArgIdx + 1])
  : join(ROOT, 'css', 'tokens.css');

// ── Value transforms ──────────────────────────────────────────────────────────

/**
 * Convert every {a.b.c} reference token inside a string value to var(--a-b-c).
 * Handles composite values like "{seed.motion.duration.instant} {seed.motion.easing.easeOutCirc}"
 * → "var(--seed-motion-duration-instant) var(--seed-motion-easing-easeOutCirc)"
 */
function convertRefs(value) {
  return value.replace(/\{([^}]+)\}/g, (_, ref) => {
    const parts = ref.split('.');
    const [tier, ...rest] = parts;
    if (tier === 'seed') return `var(--seed-${rest.join('-')})`;
    if (tier === 'map')  return `var(--map-${rest.join('-')})`;
    // component references: {component.button.paddingInline} → var(--button-paddingInline)
    if (tier === 'component') {
      const [component, ...props] = rest;
      return `var(--${component}-${props.join('-')})`;
    }
    // alias references (uncommon but handled)
    return `var(--${parts.join('-')})`;
  });
}

/**
 * Apply all value transforms to a raw DTCG $value.
 * Preserves original casing for color hex strings (#FFE082 stays #FFE082).
 */
function transformValue(rawValue, type) {
  // cubicBezier array → CSS function
  if (Array.isArray(rawValue)) {
    return `cubic-bezier(${rawValue.join(', ')})`;
  }

  if (typeof rawValue !== 'string') {
    return String(rawValue);
  }

  // duration ms → s  (50ms → 0.05s)
  if (type === 'duration' && rawValue.endsWith('ms')) {
    const s = parseFloat(rawValue) / 1000;
    // toFixed(3) then strip trailing zeros: 0.050 → 0.05, 0.200 → 0.2
    return `${parseFloat(s.toFixed(3))}s`;
  }

  // Reference string (possibly composite) → var() expression(s)
  if (rawValue.includes('{')) {
    return convertRefs(rawValue);
  }

  // Font family: quote bare names (but leave already-quoted values alone)
  if (type === 'fontFamily' && !rawValue.startsWith('"') && !rawValue.startsWith("'")) {
    return `"${rawValue}"`;
  }

  return rawValue;
}

// ── CSS variable naming ───────────────────────────────────────────────────────

/**
 * Map a token path array to a CSS custom property name.
 *
 * Naming contract:
 *   seed.*                          → --seed-{path…}
 *   alias.color.*                   → --color-{name}
 *   alias.spacing.*                 → --spacing-{name}
 *   alias.grid.*                    → --grid-{name}
 *   alias.border.width              → --border-w
 *   alias.border.radius             → --border-radius
 *   alias.shadow.base               → --shadow
 *   alias.typography.heading.N.prop → --heading-N-prop
 *   alias.typography.title.N.prop   → --title-N-prop
 *   alias.typography.body.V.prop    → --body-V-prop
 *   alias.typography.caption.prop   → --caption-prop
 *   alias.typography.code.prop      → --code-prop
 *   alias.motion.transition.name    → --transition-name
 *   map.*                           → --map-{path…}
 *   component.button.paddingInline  → --button-paddingInline
 *   theme.*                         → --{name}  (flat, no prefix)
 */
function pathToCSSVar(path) {
  const [tier, ...rest] = path;

  if (tier === 'seed') {
    return `--seed-${rest.join('-')}`;
  }

  if (tier === 'map') {
    return `--map-${rest.join('-')}`;
  }

  if (tier === 'component') {
    // component.button.paddingInline → --button-paddingInline
    const [component, ...props] = rest;
    return `--${component}-${props.join('-')}`;
  }

  if (tier === 'alias') {
    const [type, ...parts] = rest;

    switch (type) {
      case 'color':   return `--color-${parts.join('-')}`;
      case 'spacing': return `--spacing-${parts.join('-')}`;
      case 'grid':    return `--grid-${parts.join('-')}`;

      case 'border':
        if (parts[0] === 'width')  return '--border-w';
        if (parts[0] === 'radius') return '--border-radius';
        return `--border-${parts.join('-')}`;

      case 'shadow':
        if (parts[0] === 'base') return '--shadow';
        return `--shadow-${parts.join('-')}`;

      case 'typography': {
        const [typogType, ...typogRest] = parts;
        switch (typogType) {
          case 'heading': return `--heading-${typogRest.join('-')}`;
          case 'title':   return `--title-${typogRest.join('-')}`;
          case 'body':    return `--body-${typogRest.join('-')}`;
          case 'caption': return `--caption-${typogRest.join('-')}`;
          case 'code':    return `--code-${typogRest.join('-')}`;
          default:        return `--${typogType}-${typogRest.join('-')}`;
        }
      }

      case 'motion': {
        const [motionType, ...motionRest] = parts;
        if (motionType === 'transition') return `--transition-${motionRest.join('-')}`;
        return `--motion-${parts.join('-')}`;
      }

      default:
        return `--alias-${type}-${parts.join('-')}`;
    }
  }

  if (tier === 'theme') {
    return `--${rest.join('-')}`;
  }

  return `--${path.join('-')}`;
}

// ── Token tree flattening ─────────────────────────────────────────────────────

/**
 * Recursively walk a DTCG token object and collect leaf tokens.
 * Leaf = any node that has a $value property.
 * Skips group-level $-prefixed metadata keys.
 */
function flattenDTCG(obj, pathParts = []) {
  const results = [];
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$')) continue;
    const path = [...pathParts, key];

    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      if ('$value' in val) {
        results.push({
          path,
          value:       val.$value,
          type:        val.$type        ?? null,
          description: val.$description ?? null,
        });
      } else {
        results.push(...flattenDTCG(val, path));
      }
    }
  }
  return results;
}

// ── CSS line helpers ──────────────────────────────────────────────────────────

function renderTokenLine(indent, token) {
  const prop    = pathToCSSVar(token.path);
  const value   = transformValue(token.value, token.type);
  const comment = token.description ? ` /* ${token.description} */` : '';
  return `${indent}${prop}: ${value};${comment}`;
}

function renderThemeVars(themeData, indent) {
  return flattenDTCG(themeData)
    .map(t => {
      const prop    = pathToCSSVar(t.path);
      const comment = t.description ? ` /* ${t.description} */` : '';
      // Theme values are literal hex — no transformValue needed
      return `${indent}${prop}: ${t.value};${comment}`;
    })
    .join('\n');
}

/** Group an array of tokens by their top-level path section for readable comments. */
function groupBySection(tokens, depth = 2) {
  const groups = new Map();
  for (const t of tokens) {
    const key = t.path.slice(0, depth).join('.');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  return groups;
}

// ── Load core tokens via Style Dictionary ─────────────────────────────────────

// SD is used only to merge + parse the DTCG source files.
// We never call buildAllPlatforms() so no transforms run —
// references stay as {seed.x.y} strings and hex cases are untouched.
// Discover component token files (tokens/components/*.json)
const componentsDir = join(ROOT, 'tokens/components');
const componentFiles = existsSync(componentsDir)
  ? readdirSync(componentsDir).filter(f => f.endsWith('.json')).map(f => join(componentsDir, f))
  : [];

const sd = new StyleDictionary({
  source: [
    join(ROOT, 'tokens/core/primitives.json'),
    // seed.json and map.json are loaded only if they exist (graceful during migration)
    ...(existsSync(join(ROOT, 'tokens/core/seed.json'))  ? [join(ROOT, 'tokens/core/seed.json')]  : []),
    ...(existsSync(join(ROOT, 'tokens/core/map.json'))   ? [join(ROOT, 'tokens/core/map.json')]   : []),
    join(ROOT, 'tokens/core/semantic.json'),
    ...componentFiles,
  ],
  platforms: {},
  log: { verbosity: 'silent' },
});

await sd.hasInitialized;

// sd.tokens is the raw merged DTCG dictionary (no resolution, no transforms)
const coreTree = sd.tokens;

// ── Load theme files directly (no SD — avoids merge collision) ────────────────

const lightTree = JSON.parse(readFileSync(join(ROOT, 'tokens/themes/light.json'), 'utf8'));
const darkTree  = JSON.parse(readFileSync(join(ROOT, 'tokens/themes/dark.json'), 'utf8'));

// ── Partition tokens ──────────────────────────────────────────────────────────

const allCore          = flattenDTCG(coreTree);
const seedTokens       = allCore.filter(t => t.path[0] === 'seed');
const mapTokens        = allCore.filter(t => t.path[0] === 'map');
const aliasTokens      = allCore.filter(t => t.path[0] === 'alias');
const componentTokens  = allCore.filter(t => t.path[0] === 'component');

// ── Build CSS sections ────────────────────────────────────────────────────────

function buildSection(tokens, depth = 2) {
  const groups = groupBySection(tokens, depth);
  const lines  = [];
  for (const [sectionKey, sectionTokens] of groups) {
    // Strip the tier prefix for the comment label (seed.color → color)
    const label = sectionKey.split('.').slice(1).join('.');
    lines.push(`    /* ${label} */`);
    for (const t of sectionTokens) {
      lines.push(renderTokenLine('    ', t));
    }
    lines.push('');
  }
  return lines.join('\n');
}

const seedSection      = buildSection(seedTokens,  2);
const mapSection       = buildSection(mapTokens,   2);
const aliasSection     = buildSection(aliasTokens,  2);
const componentSection = buildSection(componentTokens, 2);
const lightVars        = renderThemeVars(lightTree, '    ');
const darkVars         = renderThemeVars(darkTree,  '    ');
const darkVarsMQ       = renderThemeVars(darkTree,  '      ');

// ── Assemble final CSS ────────────────────────────────────────────────────────

// Conditionally include map and component sections (empty until token files created)
const mapBlock = mapTokens.length > 0
  ? `\n    /* Tier 2 Map (derived from seed) */\n${mapSection.trimEnd()}\n`
  : '';
const componentBlock = componentTokens.length > 0
  ? `\n\n  /* ── Tier 4: Component Tokens ──────────────────────────────────────── */\n  :root {\n${componentSection.trimEnd()}\n  }`
  : '';

const css = `/* ==========================================================================
   nectar-design — Design Tokens (generated by scripts/build-tokens-sd.mjs)
   Do not edit manually.

   Tier 1: Seed       (--seed-*)          → Raw primitives
   Tier 2: Map        (--map-*)           → Derived from seed (color-mix, scales)
   Tier 3: Semantic   (--color-*, …)      → Semantic aliases (var() references)
   Tier 4: Component  (--button-*, …)     → Per-component tokens
   Tier 5: Theme      (--bg, --fg, …)     → Light / dark theme values
   ========================================================================== */

@layer tokens {

  /* ── Tiers 1–3: Seed, Map & Semantic ───────────────────────────────── */
  :root {
    /* Tier 1 Seed */
${seedSection.trimEnd()}
${mapBlock}
    /* Tier 3 Semantic */
${aliasSection.trimEnd()}
  }${componentBlock}

  /* ── Tier 5 Light (default) ──────────────────────────────────────────── */
  :root {
${lightVars}
  }

  /* ── Tier 5 Dark (explicit attribute) ────────────────────────────────── */
  [data-theme="dark"] {
${darkVars}
  }

  /* ── Tier 5 Dark (OS preference fallback) ────────────────────────────── */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
${darkVarsMQ}
    }
  }

}
`;

function buildEChartsTheme(themeTree) {
  const themeTokens = Object.fromEntries(
    flattenDTCG(themeTree)
      .filter(token =>
        token.path[0] === 'theme'
        && typeof token.value === 'string'
        && /^#[0-9A-Fa-f]{3,8}$/.test(token.value)
      )
      .map(token => [token.path.slice(1).join('-'), token.value])
  );

  const axisStyle = {
    axisLine: { lineStyle: { color: themeTokens.border } },
    axisTick: { lineStyle: { color: themeTokens.border } },
    axisLabel: { color: themeTokens['muted-fg'] ?? themeTokens.fg },
    nameTextStyle: { color: themeTokens.fg },
    splitLine: { lineStyle: { color: themeTokens.border } },
    splitArea: { areaStyle: { color: [themeTokens.bg, themeTokens.surface] } },
  };

  return {
    color: [
      themeTokens.primary,
      themeTokens.accent,
      themeTokens.success,
      themeTokens.warning,
      themeTokens.destructive,
    ].filter(Boolean),
    backgroundColor: themeTokens.bg,
    textStyle: {
      color: themeTokens.fg,
    },
    title: {
      textStyle: { color: themeTokens.fg },
      subtextStyle: { color: themeTokens['muted-fg'] ?? themeTokens.fg },
    },
    legend: {
      textStyle: { color: themeTokens.fg },
      inactiveColor: themeTokens['muted-fg'] ?? themeTokens.border,
      pageTextStyle: { color: themeTokens.fg },
      pageIconColor: themeTokens.primary,
      pageIconInactiveColor: themeTokens.border,
    },
    tooltip: {
      backgroundColor: themeTokens.surface,
      borderColor: themeTokens.border,
      textStyle: { color: themeTokens['surface-fg'] ?? themeTokens.fg },
    },
    categoryAxis: axisStyle,
    valueAxis: axisStyle,
    timeAxis: axisStyle,
    logAxis: axisStyle,
  };
}

// ── Write output ──────────────────────────────────────────────────────────────

const outDir = dirname(OUTPUT_FILE);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(OUTPUT_FILE, css, 'utf8');

const ECHARTS_THEME_FILE = join(ROOT, 'dist', 'echarts-theme.json');
const echartsThemeDir = dirname(ECHARTS_THEME_FILE);
if (!existsSync(echartsThemeDir)) mkdirSync(echartsThemeDir, { recursive: true });
writeFileSync(
  ECHARTS_THEME_FILE,
  `${JSON.stringify({
    light: buildEChartsTheme(lightTree),
    dark: buildEChartsTheme(darkTree),
  }, null, 2)}\n`,
  'utf8'
);

// ── Summary ───────────────────────────────────────────────────────────────────

const lightCount = flattenDTCG(lightTree).length;
const darkCount  = flattenDTCG(darkTree).length;

console.log('✅  token artifacts generated (build-tokens-sd.mjs)');
console.log(`    ${OUTPUT_FILE}`);
console.log(`    ${ECHARTS_THEME_FILE}`);
console.log('');
console.log(`    Seed tokens:      ${seedTokens.length}`);
console.log(`    Map tokens:       ${mapTokens.length}`);
console.log(`    Semantic tokens:  ${aliasTokens.length}`);
console.log(`    Component tokens: ${componentTokens.length}`);
console.log(`    Light vars:       ${lightCount}`);
console.log(`    Dark vars:        ${darkCount}`);
console.log('    ECharts themes:   2 (light, dark)');
console.log('');
console.log('    Reference strategy: {seed.x.y} → var(--seed-x-y)  (no resolution)');
console.log('    Theme strategy:     separate files → separate selectors (no collision)');
