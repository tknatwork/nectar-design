'use client';

/**
 * tokens.ts — the data core for the Storybook token-reference tables.
 * ('use client' — exports a hook (useResolvedVar); satisfies ds-readiness.
 *  This module is dev-only (Storybook docs), never shipped to dist/.)
 *
 * DRIFT-PROOF BY CONSTRUCTION: we read the *generated* `css/tokens.css` (the
 * authoritative output of `scripts/build-tokens-sd.mjs`) rather than re-deriving
 * CSS-var names from the DTCG JSON. The generator's naming is non-uniform
 * (component tokens drop the `component.` prefix; semantic tokens have
 * special-case names), so reimplementing it here would silently rot. Reading
 * the emitted CSS means the tables show exactly what ships — nothing to keep in
 * sync.
 *
 * Each row is one CSS custom property:
 *   - cssVar       the `--name` as emitted
 *   - rawValue     the literal emitted value — a px/hex literal, a var() chain,
 *                  or a color-mix(). This column TEACHES the derivation; the
 *                  resolved column (via `useResolvedVar`) PROVES it at runtime
 *                  under the current engine / theme / sub-brand.
 *   - description  the trailing block-comment on the line, if any
 *   - tier         derived from the var-name prefix (robust; the generated
 *                  section comments don't mark every tier consistently)
 *   - group        the nearest preceding lowercase-word comment label
 *
 * The `?raw` import is a Vite feature (Storybook's builder) that yields the file
 * text. This module is imported only by MDX/CSF docs, never by component source,
 * so it never reaches the published `dist/`.
 */
import { useEffect, useState } from 'react';
// @ts-expect-error — Vite `?raw` text import (Storybook builder); no type decl.
import tokensCss from '../../css/tokens.css?raw';
// @ts-expect-error — Vite `?raw` text import (Storybook builder); no type decl.
import themeCss from '../../css/theme.css?raw';

export type Tier = 'Seed' | 'Map' | 'Semantic' | 'Component' | 'Theme';

export interface TokenRow {
  cssVar: string;
  rawValue: string;
  description: string;
  tier: Tier;
  group: string;
}

/** `--name: value;` followed by an optional trailing block comment. */
const VAR_RE = /^\s*(--[A-Za-z0-9-]+)\s*:\s*([^;]+);(?:\s*\/\*\s*([\s\S]*?)\s*\*\/)?/;
/** A comment that is just a lowercase word — a sub-group label (e.g. color, borderRadius). */
const GROUP_RE = /^\s*\/\*\s*([a-z][\w-]*)\s*\*\/\s*$/;

/** The 6 components that own a dedicated `--<name>-*` token tier. */
const COMPONENT_PREFIXES = ['--button-', '--card-', '--input-', '--badge-', '--glass-', '--toast-'];

/** Tier from the var-name prefix. Seed/Map/Component have clean prefixes;
 *  everything else (semantic aliases + theme vars) buckets as Semantic. */
function tierOf(cssVar: string): Tier {
  if (cssVar.startsWith('--seed-')) return 'Seed';
  if (cssVar.startsWith('--map-')) return 'Map';
  if (COMPONENT_PREFIXES.some((p) => cssVar.startsWith(p))) return 'Component';
  return 'Semantic';
}

function parseTokensCss(css: string): TokenRow[] {
  const rows: TokenRow[] = [];
  let group = '';
  for (const line of css.split('\n')) {
    const groupM = line.match(GROUP_RE);
    if (groupM) {
      group = groupM[1];
      continue;
    }
    const m = line.match(VAR_RE);
    if (m) {
      rows.push({
        cssVar: m[1],
        rawValue: m[2].trim(),
        description: (m[3] ?? '').trim(),
        tier: tierOf(m[1]),
        group,
      });
    }
  }
  return rows;
}

/** Every token, parsed once at module load. */
export const ALL_TOKENS: TokenRow[] = parseTokensCss(tokensCss);

/**
 * The Tailwind-facing delivery aliases from theme.css's `@theme { … }` block
 * (--radius-*, --ease-*, --duration-*, --color-* …). These are real emitted
 * custom properties, but they live in theme.css — not tokens.css — so they're
 * absent from ALL_TOKENS. We index them for explicit `names`-list lookups: a
 * component's "Tokens used" can cite `--radius-md` (what `rounded-md` resolves
 * to) and still get a real raw value + live resolution. Kept OUT of ALL_TOKENS
 * so tier counts and the token-table parity gate stay scoped to tokens.css.
 */
function parseThemeVars(css: string): Map<string, TokenRow> {
  const out = new Map<string, TokenRow>();
  const at = css.indexOf('@theme');
  let i = at === -1 ? -1 : css.indexOf('{', at);
  if (i === -1) return out;
  const bodyStart = i + 1;
  let depth = 1;
  for (i = bodyStart; i < css.length && depth > 0; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') depth -= 1;
  }
  for (const line of css.slice(bodyStart, i - 1).split('\n')) {
    const m = line.match(VAR_RE);
    if (!m) continue;
    out.set(m[1], {
      cssVar: m[1],
      rawValue: m[2].trim(),
      description: (m[3] ?? '').trim(),
      tier: 'Theme',
      group: m[1].replace(/^--/, '').split('-')[0],
    });
  }
  return out;
}

/** @theme delivery aliases (theme.css), indexed by CSS-var name. */
export const THEME_VARS: Map<string, TokenRow> = parseThemeVars(themeCss);

/** Resolve a single token by exact CSS-var name across tokens.css and the
 *  theme.css @theme aliases. Returns null if defined in neither (caller drops). */
export function tokenByName(cssVar: string): TokenRow | null {
  return ALL_TOKENS.find((r) => r.cssVar === cssVar) ?? THEME_VARS.get(cssVar) ?? null;
}

/** Rows whose CSS var starts with `prefix` (e.g. `--map-color`, `--button-`). */
export function tokensByPrefix(prefix: string): TokenRow[] {
  return ALL_TOKENS.filter((r) => r.cssVar.startsWith(prefix));
}

/** Rows in a tier, optionally narrowed to vars whose name contains `groupContains`. */
export function tokensByTier(tier: Tier, groupContains?: string): TokenRow[] {
  return ALL_TOKENS.filter(
    (r) => r.tier === tier && (!groupContains || r.cssVar.includes(groupContains)),
  );
}

/** Count of tokens per tier — handy for an overview page / the parity gate. */
export function tierCounts(): Record<Tier, number> {
  const counts = { Seed: 0, Map: 0, Semantic: 0, Component: 0, Theme: 0 } as Record<Tier, number>;
  for (const r of ALL_TOKENS) counts[r.tier] += 1;
  return counts;
}

/**
 * Live-resolve a CSS custom property against `:root`, re-reading whenever the
 * engine (Heat/Depth — inline style on <html>), the sub-brand (class on <body>),
 * or the theme changes. Resolution is browser-only (color-mix/oklch/engine never
 * resolve in JS), so we compute in an effect; the raw value shows until then.
 * Returns '' before the first client read.
 */
export function useResolvedVar(cssVar: string): string {
  const [value, setValue] = useState('');
  useEffect(() => {
    if (typeof document === 'undefined' || !cssVar) return;
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
      setValue((prev) => (prev === v ? prev : v));
    };
    read();
    let raf = 0;
    const flush = () => {
      raf = 0;
      read();
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };
    const obs = new MutationObserver(schedule);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });
    if (document.body) {
      obs.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    return () => {
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [cssVar]);
  return value;
}
