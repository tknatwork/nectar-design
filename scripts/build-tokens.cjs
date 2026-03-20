#!/usr/bin/env node

/**
 * build-tokens.js
 *
 * Converts the 3-tier JSON token system into a single tokens.css file.
 * Zero npm dependencies — uses only Node.js built-ins (fs, path).
 *
 * Token tiers:
 *   Seed   → Primitives  → --seed-*
 *   Alias  → Semantic     → --color-*, --spacing-*, --border-*, --shadow-*, --transition-*
 *   Mapped → Theme modes  → --bg, --fg, --surface, --border-color, etc.
 *
 * Usage:
 *   Global tokens:  node scripts/build-tokens.js
 *   Project tokens: node scripts/build-tokens.js --project projects/my-project
 *
 * Output:
 *   Global:  css/tokens.css
 *   Project: projects/my-project/tokens.css (scoped under [data-project="my-project"])
 */

const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '..', 'tokens');
const OUTPUT_DIR = path.join(__dirname, '..', 'css');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'tokens.css');

// ---------------------------------------------------------------------------
// Load token files
// ---------------------------------------------------------------------------

const seed = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, 'seed.json'), 'utf8'));
const alias = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, 'alias.json'), 'utf8'));
const mapped = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, 'mapped.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a nested key path to a CSS variable name.
 * e.g. ['color', 'pastel', 'lavender'] → '--seed-color-pastel-lavender'
 */
function toVarName(prefix, keys) {
  return `--${prefix}-${keys.join('-')}`;
}

/**
 * Resolve a {seed.xxx.yyy} or {alias.xxx.yyy} reference to a var(--...) string.
 * If the reference can't be resolved, returns the original value.
 */
function refToVar(value) {
  if (typeof value !== 'string') return value;

  // Match {seed.xxx.yyy.zzz}
  const seedMatch = value.match(/\{seed\.(.+?)\}/g);
  if (seedMatch) {
    let result = value;
    for (const match of seedMatch) {
      const tokenPath = match.slice(6, -1); // remove {seed. and }
      const varName = `--seed-${tokenPath.replace(/\./g, '-')}`;
      result = result.replace(match, `var(${varName})`);
    }
    return result;
  }

  // Match {alias.xxx.yyy}
  const aliasMatch = value.match(/\{alias\.(.+?)\}/g);
  if (aliasMatch) {
    let result = value;
    for (const match of aliasMatch) {
      const tokenPath = match.slice(7, -1); // remove {alias. and }
      const varName = `--${tokenPath.replace(/\./g, '-')}`;
      result = result.replace(match, `var(${varName})`);
    }
    return result;
  }

  return value;
}

/**
 * Flatten a nested token object into an array of [keyPath[], value, description?].
 * Walks the tree, stopping at nodes that have a "value" property.
 */
function flattenTokens(obj, parentKeys = []) {
  const results = [];

  for (const [key, val] of Object.entries(obj)) {
    const keys = [...parentKeys, key];

    if (val && typeof val === 'object' && val.value !== undefined) {
      // Leaf node with a value
      results.push({ keys, value: val.value, description: val.description || null });
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      // Branch — recurse deeper
      results.push(...flattenTokens(val, keys));
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Build CSS sections
// ---------------------------------------------------------------------------

function buildSeedCSS() {
  const lines = [];
  lines.push('  /* === TIER 1: Seed (Primitives) === */');

  const tokens = flattenTokens(seed.tokens);
  let currentCategory = '';

  for (const { keys, value, description } of tokens) {
    const category = keys[0];
    if (category !== currentCategory) {
      currentCategory = category;
      lines.push('');
      lines.push(`  /* ${category} */`);
    }

    const varName = toVarName('seed', keys);
    const comment = description ? ` /* ${description} */` : '';
    lines.push(`  ${varName}: ${value};${comment}`);
  }

  return lines.join('\n');
}

function buildAliasCSS() {
  const lines = [];
  lines.push('  /* === TIER 2: Alias (Semantic) === */');

  const tokens = alias.tokens;

  // --- Colors ---
  if (tokens.color) {
    lines.push('');
    lines.push('  /* color */');
    for (const [key, val] of Object.entries(tokens.color)) {
      const varName = `--color-${key}`;
      const cssValue = refToVar(val.value);
      const comment = val.description ? ` /* ${val.description} */` : '';
      lines.push(`  ${varName}: ${cssValue};${comment}`);
    }
  }

  // --- Spacing ---
  if (tokens.spacing) {
    lines.push('');
    lines.push('  /* spacing */');
    for (const [key, val] of Object.entries(tokens.spacing)) {
      const varName = `--spacing-${key}`;
      const cssValue = refToVar(val.value);
      const comment = val.description ? ` /* ${val.description} */` : '';
      lines.push(`  ${varName}: ${cssValue};${comment}`);
    }
  }

  // --- Typography (composite tokens — flatten into individual properties) ---
  if (tokens.typography) {
    lines.push('');
    lines.push('  /* typography */');

    // Headings
    if (tokens.typography.heading) {
      for (const [level, props] of Object.entries(tokens.typography.heading)) {
        for (const [prop, val] of Object.entries(props)) {
          const varName = `--heading-${level}-${prop}`;
          lines.push(`  ${varName}: ${refToVar(val.value)};`);
        }
      }
    }

    // Title
    if (tokens.typography.title) {
      for (const [level, props] of Object.entries(tokens.typography.title)) {
        for (const [prop, val] of Object.entries(props)) {
          const varName = `--title-${level}-${prop}`;
          lines.push(`  ${varName}: ${refToVar(val.value)};`);
        }
      }
    }

    // Body
    if (tokens.typography.body) {
      for (const [size, props] of Object.entries(tokens.typography.body)) {
        for (const [prop, val] of Object.entries(props)) {
          const varName = `--body-${size}-${prop}`;
          lines.push(`  ${varName}: ${refToVar(val.value)};`);
        }
      }
    }

    // Caption
    if (tokens.typography.caption) {
      for (const [prop, val] of Object.entries(tokens.typography.caption)) {
        lines.push(`  --caption-${prop}: ${refToVar(val.value)};`);
      }
    }

    // Code
    if (tokens.typography.code) {
      for (const [prop, val] of Object.entries(tokens.typography.code)) {
        lines.push(`  --code-${prop}: ${refToVar(val.value)};`);
      }
    }
  }

  // --- Grid ---
  if (tokens.grid) {
    lines.push('');
    lines.push('  /* grid */');
    for (const [key, val] of Object.entries(tokens.grid)) {
      const varName = `--grid-${key}`;
      const cssValue = refToVar(val.value);
      const comment = val.description ? ` /* ${val.description} */` : '';
      lines.push(`  ${varName}: ${cssValue};${comment}`);
    }
  }

  // --- Border ---
  if (tokens.border) {
    lines.push('');
    lines.push('  /* border */');
    lines.push(`  --border-w: ${refToVar(tokens.border.width.value)}; /* ${tokens.border.width.description || ''} */`);
    lines.push(`  --border-radius: ${refToVar(tokens.border.radius.value)}; /* ${tokens.border.radius.description || ''} */`);
  }

  // --- Shadow ---
  if (tokens.shadow) {
    lines.push('');
    lines.push('  /* shadow */');
    lines.push(`  --shadow: ${refToVar(tokens.shadow.base.value)}; /* ${tokens.shadow.base.description || ''} */`);
  }

  // --- Motion transitions ---
  if (tokens.motion && tokens.motion.transition) {
    lines.push('');
    lines.push('  /* motion — transitions (duration + easing composed) */');
    for (const [key, val] of Object.entries(tokens.motion.transition)) {
      const varName = `--transition-${key}`;
      const cssValue = refToVar(val.value);
      const comment = val.description ? ` /* ${val.description} */` : '';
      lines.push(`  ${varName}: ${cssValue};${comment}`);
    }
  }

  return lines.join('\n');
}

function buildMappedCSS() {
  const lines = [];
  lines.push('  /* === TIER 3: Mapped (Theme) === */');

  // Helper to output a mode's color tokens
  function modeColorVars(modeColors) {
    const result = [];
    for (const [key, val] of Object.entries(modeColors)) {
      const varName = `--${key}`;
      const comment = val.description ? ` /* ${val.description} */` : '';
      result.push(`    ${varName}: ${val.value};${comment}`);
    }
    return result.join('\n');
  }

  // Light mode (default)
  lines.push('');
  lines.push('  /* Light mode (default) */');
  lines.push('  :root {');
  lines.push(modeColorVars(mapped.modes.light.color));
  lines.push('  }');

  // Dark mode — data-theme attribute
  lines.push('');
  lines.push('  /* Dark mode */');
  lines.push('  [data-theme="dark"] {');
  lines.push(modeColorVars(mapped.modes.dark.color));
  lines.push('  }');

  // Dark mode — system preference fallback
  lines.push('');
  lines.push('  /* System preference fallback */');
  lines.push('  @media (prefers-color-scheme: dark) {');
  lines.push('    :root:not([data-theme="light"]) {');
  lines.push(modeColorVars(mapped.modes.dark.color));
  lines.push('    }');
  lines.push('  }');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Per-project scoped tokens
// ---------------------------------------------------------------------------

/**
 * Build scoped CSS for a project's tokens.json.
 * Project tokens only override mapped-tier (Tier 3) variables.
 * Output is scoped under [data-project="slug"] so it only applies
 * when that project is loaded into the shell window.
 *
 * Project tokens.json format:
 * {
 *   "extends": "nectar-core",
 *   "modes": {
 *     "light": { "bg": "#fff", "fg": "#000", "primary": "#ff0000", ... },
 *     "dark":  { "bg": "#111", "fg": "#eee", "primary": "#ff4444", ... }
 *   }
 * }
 */
function buildProjectCSS(projectTokens, slug) {
  const lines = [];
  lines.push(`/* ==========================================================================`);
  lines.push(`   Project Tokens: ${slug}`);
  lines.push(`   Scoped under [data-project="${slug}"]`);
  lines.push(`   Extends: ${projectTokens.extends || 'nectar-core'}`);
  lines.push(`   Do not edit manually. Run: node scripts/build-tokens.js --project projects/${slug}`);
  lines.push(`   ========================================================================== */`);
  lines.push('');
  lines.push('@layer tokens {');

  // Light mode overrides
  if (projectTokens.modes && projectTokens.modes.light) {
    lines.push('');
    lines.push(`  /* Light mode — project overrides */`);
    lines.push(`  [data-project="${slug}"] {`);
    for (const [key, value] of Object.entries(projectTokens.modes.light)) {
      lines.push(`    --${key}: ${value};`);
    }
    lines.push('  }');
  }

  // Dark mode overrides
  if (projectTokens.modes && projectTokens.modes.dark) {
    lines.push('');
    lines.push(`  /* Dark mode — project overrides */`);
    lines.push(`  [data-theme="dark"] [data-project="${slug}"] {`);
    for (const [key, value] of Object.entries(projectTokens.modes.dark)) {
      lines.push(`    --${key}: ${value};`);
    }
    lines.push('  }');

    // System preference fallback
    lines.push('');
    lines.push(`  @media (prefers-color-scheme: dark) {`);
    lines.push(`    :root:not([data-theme="light"]) [data-project="${slug}"] {`);
    for (const [key, value] of Object.entries(projectTokens.modes.dark)) {
      lines.push(`      --${key}: ${value};`);
    }
    lines.push('    }');
    lines.push('  }');
  }

  lines.push('}');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// CLI: detect --project flag
// ---------------------------------------------------------------------------

const projectFlag = process.argv.indexOf('--project');
const isProjectMode = projectFlag !== -1 && process.argv[projectFlag + 1];

if (isProjectMode) {
  // --- Project mode: generate scoped tokens.css for a single project ---
  const projectDir = path.resolve(process.argv[projectFlag + 1]);
  const slug = path.basename(projectDir);
  const tokensFile = path.join(projectDir, 'tokens.json');

  if (!fs.existsSync(tokensFile)) {
    console.error(`❌ No tokens.json found in ${projectDir}`);
    process.exit(1);
  }

  const projectTokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
  const projectCSS = buildProjectCSS(projectTokens, slug);
  const outputFile = path.join(projectDir, 'tokens.css');

  fs.writeFileSync(outputFile, projectCSS + '\n', 'utf8');

  const lightCount = projectTokens.modes && projectTokens.modes.light
    ? Object.keys(projectTokens.modes.light).length : 0;
  const darkCount = projectTokens.modes && projectTokens.modes.dark
    ? Object.keys(projectTokens.modes.dark).length : 0;

  console.log(`✅ Project tokens generated: ${slug}`);
  console.log(`   ${outputFile}`);
  console.log(`   Light overrides: ${lightCount}`);
  console.log(`   Dark overrides:  ${darkCount}`);
  console.log(`   Scoped: [data-project="${slug}"]`);

} else {
  // --- Global mode: generate the full tokens.css ---

  const css = `/* ==========================================================================
   nectar-design — Generated Tokens
   Do not edit manually. Run: node scripts/build-tokens.js

   Tier 1: Seed   (--seed-*)       → Raw primitives
   Tier 2: Alias  (--color-*, etc) → Semantic meaning
   Tier 3: Mapped (--bg, --fg)     → Theme-specific (light/dark)
   ========================================================================== */

@layer tokens {

  :root {
${buildSeedCSS()}

${buildAliasCSS()}
  }

${buildMappedCSS()}
}
`;

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, css, 'utf8');

  // Count tokens for summary
  const seedCount = flattenTokens(seed.tokens).length;
  const aliasFlat = flattenTokens(alias.tokens).length;
  const mappedLight = Object.keys(mapped.modes.light.color).length;
  const mappedDark = Object.keys(mapped.modes.dark.color).length;

  console.log('✅ tokens.css generated');
  console.log(`   ${OUTPUT_FILE}`);
  console.log('');
  console.log(`   Seed tokens:    ${seedCount}`);
  console.log(`   Alias tokens:   ${aliasFlat}`);
  console.log(`   Mapped (light): ${mappedLight}`);
  console.log(`   Mapped (dark):  ${mappedDark}`);
  console.log('');
  console.log('   Tiers: Seed → Alias → Mapped');
  console.log('   Dark mode: [data-theme="dark"] + @media prefers-color-scheme');
}

