#!/usr/bin/env node
/**
 * audit-theme-namespaces.mjs — Validates no Tailwind v4 namespace collisions
 * exist in css/theme.css @theme block. Exit 1 on collision, 0 on pass.
 */
import { readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const themeArgIdx = process.argv.indexOf('--theme-file');
const THEME_FILE = themeArgIdx !== -1
  ? resolve(process.argv[themeArgIdx + 1])
  : join(ROOT, 'css', 'theme.css');

let ALLOWLIST = [];
try {
  ALLOWLIST = JSON.parse(readFileSync(join(__dirname, 'theme-namespace-allowlist.json'), 'utf8'));
} catch { /* no allowlist */ }

const SIZE_KEYS = new Set(['xs','sm','md','lg','xl','2xl','3xl','4xl','5xl','6xl','7xl']);

function extractThemeBlock(css) {
  const match = css.match(/@theme\s*\{/);
  if (!match) return '';
  const start = match.index + match[0].length;
  let depth = 1, i = start;
  while (i < css.length && depth > 0) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') depth--;
    i++;
  }
  return css.slice(start, i - 1);
}

function parseDeclarations(block) {
  const decls = new Map();
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block)) !== null) decls.set(m[1], m[2].trim());
  return decls;
}

function checkCollisions(decls) {
  const errors = [];
  for (const [name] of decls) {
    const m = name.match(/^spacing-(.+)$/);
    if (!m || !SIZE_KEYS.has(m[1])) continue;
    const mwKey = `max-width-${m[1]}`;
    if (decls.has(mwKey)) continue;
    const allowed = ALLOWLIST.some(
      (e) => e.property === `--spacing-${m[1]}` && e.collision === `--${mwKey}`,
    );
    if (!allowed) {
      errors.push(
        `--spacing-${m[1]} exists but --${mwKey} is missing. ` +
        `max-w-${m[1]} will resolve to spacing value instead of default max-width.`,
      );
    }
  }
  return errors;
}

function checkSelfRefs(decls) {
  const warnings = [];
  for (const [name, value] of decls) {
    if (value === `var(--${name})`)
      warnings.push(`--${name}: var(--${name}) — self-reference (resolves via cascade)`);
  }
  return warnings;
}

const css = readFileSync(THEME_FILE, 'utf8');
const block = extractThemeBlock(css);
if (!block) { console.error('No @theme block found in', THEME_FILE); process.exit(1); }

const decls = parseDeclarations(block);
console.log(`Parsed ${decls.size} @theme declarations`);

const warnings = checkSelfRefs(decls);
for (const w of warnings) console.log(`  ⚠ ${w}`);

const errors = checkCollisions(decls);
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`\n${errors.length} namespace collision(s) detected.`);
  process.exit(1);
}
console.log(`✓ No namespace collisions (${decls.size} declarations audited)`);
