/**
 * theme.ts — Nectar Storybook chrome theme.
 *
 * Wholesale chrome replacement (per the Nectar Design System
 * `kits/storybook.html` reference) — applies the engine's color
 * palette + typography to Storybook's manager UI (sidebar, top bar,
 * addons panel, search). The visitor sees the *shape* of Storybook
 * (3-column shell — sidebar, canvas, addons panel) painted in the
 * Heat × Depth engine's vocabulary.
 *
 * The chrome respects the visitor's OS `prefers-color-scheme`
 * --------------------------------------------------------------
 * Per the design intent: a person's portfolio theme follows whatever
 * theme is on their laptop / phone / desktop, and the design system
 * site stays consistent with that. We detect the OS preference once
 * at module evaluation via `window.matchMedia` and pick either the
 * LIGHT or DARK snapshot of engine values. The canvas iframe handles
 * the same toggle via a CSS `@media (prefers-color-scheme: dark)`
 * rule in preview-head.html.
 *
 * Why values are static here: Storybook's manager UI runs in a
 * top-level React app outside the engine's runtime. It can't read
 * `--ui-heat` / `--ui-depth` at runtime, so we pick TWO points in
 * the design space — the portfolio's two extreme states — and bake
 * those values in. The canvas (story rendering area) DOES get the
 * live engine via preview.ts + preview-head.html, so component
 * stories continue to breathe with Heat × Depth.
 *
 * Why hex/rgba and not oklch: Storybook's `create()` runs every color
 * value through [polished](https://polished.js.org) for hover / focus /
 * border-derived states. Polished only parses hex / rgb / hsl —
 * passing an `oklch()` string crashes the manager bundle with
 * PolishedError #5 and you get a blank page. The hex values below
 * are computed once from the engine's oklch formulas using
 * chroma-js's oklch→sRGB conversion at the two snapshot points,
 * then committed.
 *
 * Snapshot points
 * ---------------
 * LIGHT (portfolio default load): heat=0, depth=0
 *   --golden-hue-shift  = -24.36  (Gaussian at depth=0)
 *   --golden-chroma-boost = +0.016
 *   resolved hue = 250 - 24.36 = 225.6
 *   L-bg=0.96, L-surface=0.98, L-heading=0.20, L-body=0.35,
 *   L-muted=0.50, L-accent=0.50
 *   C-bg=0.036, C-accent=0.196
 *
 * DARK (depth=100): heat=0, depth=100
 *   --golden-hue-shift  ≈ 0  (Gaussian fades to 0 at extremes)
 *   --golden-chroma-boost ≈ 0
 *   resolved hue = 250
 *   L-bg=0.15, L-surface=0.18, L-heading=0.95, L-body=0.68,
 *   L-muted=0.60, L-accent=0.72
 *   C-bg=0.08, C-accent=0.14
 *
 * Brand identity --accent (used for the wordmark italic surname,
 * GlassNav brand pill, hero CTAs) is the static dark navy `#2e4563`
 * verbatim from the live site's resolved `--accent`. This stays
 * constant across both snapshots and across Heat × Depth flips.
 *
 * Recompute via:
 *   node -e "const c = require('chroma-js'); console.log(c.oklch(L, C, H).hex())"
 */

import { create } from 'storybook/internal/theming';

// LIGHT snapshot — portfolio default load (depth=0, golden-hour shifted).
const LIGHT = {
  bg:          '#d9f8ff',                      // oklch(0.96 0.036 225.6)
  surface:     '#ebfcff',                      // oklch(0.98 0.02 225.6)
  heading:     '#11171a',                      // oklch(0.20 0.01 225.6)
  body:        '#293e47',                      // oklch(0.35 0.03 225.6)
  muted:       '#f2fafe',                      // oklch(0.98 0.01 225.6)
  mutedFg:     '#516770',                      // oklch(0.50 0.03 225.6)
  primary:     '#0072b6',                      // oklch(0.50 0.196 225.6)
  accent:      '#2e4563',                      // verbatim brand --accent (static dark navy)
  border:      'rgba(88, 102, 108, 0.3)',      // oklch(0.50 0.02 225.6 / 0.3)
  inputBg:     '#ebfcff',                      // matches surface
} as const;

// DARK snapshot — depth=100, hue=250 (no golden-hour at extreme).
const DARK = {
  bg:          '#00082b',                      // oklch(0.15 0.08 250)
  surface:     '#0b121a',                      // oklch(0.18 0.02 250)
  heading:     '#eaeff5',                      // oklch(0.95 0.01 250)
  body:        '#8b9aab',                      // oklch(0.68 0.03 250)
  muted:       '#0b121a',                      // matches surface (low chroma at dark)
  mutedFg:     '#738292',                      // oklch(0.60 0.03 250)
  primary:     '#59aaf8',                      // oklch(0.72 0.14 250)
  accent:      '#2e4563',                      // verbatim brand --accent (same in dark)
  border:      'rgba(234, 239, 245, 0.08)',    // oklch(0.95 0.01 250 / 0.08)
  inputBg:     'rgba(11, 18, 26, 0.55)',       // oklch(0.18 0.02 250 / 0.55)
} as const;

// Detect OS preference once at module evaluation. Storybook's
// `create()` runs synchronously at theme construction time; this
// pick stays static for the session. Visitor reloads to apply OS
// theme changes — same UX as the portfolio's DepthToggle.
const prefersDark =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const ENGINE = prefersDark ? DARK : LIGHT;

export const nectarTheme = create({
  base: prefersDark ? 'dark' : 'light',

  /* ─── Brand (top-left) ──────────────────────────────────────── */
  // Per the kit: "nectar·design" with an italic middle dot in the
  // accent color. Storybook only accepts `brandTitle` as a string OR
  // HTML — we use HTML so the dot can be Playfair italic + accent.
  brandTitle: `<span style="font-family:var(--font-display,Inter,sans-serif);font-weight:800;letter-spacing:-0.01em;font-size:14px;color:${ENGINE.heading}">nectar<em style="font-family:var(--font-serif,Georgia,serif);font-style:italic;font-weight:500;color:${ENGINE.accent};margin:0 2px">·</em>design</span>`,
  brandUrl: 'https://design.tusharkantnaik.com',
  brandTarget: '_self',

  /* ─── App / manager chrome ──────────────────────────────────── */
  appBg: ENGINE.bg,
  appContentBg: ENGINE.surface,
  appPreviewBg: ENGINE.bg,
  appBorderColor: ENGINE.border,
  appBorderRadius: 14,

  /* ─── Typography ────────────────────────────────────────────── */
  fontBase: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  fontCode: '"Monaspace Neon", ui-monospace, "SF Mono", Menlo, monospace',

  /* ─── Text ──────────────────────────────────────────────────── */
  textColor: ENGINE.body,
  textInverseColor: ENGINE.bg,
  textMutedColor: ENGINE.mutedFg,

  /* ─── Top bar (the "tabs" row above canvas) ─────────────────── */
  barTextColor: ENGINE.mutedFg,
  barSelectedColor: ENGINE.accent,
  barHoverColor: ENGINE.heading,
  barBg: ENGINE.surface,

  /* ─── Buttons (toolbar / action) ────────────────────────────── */
  buttonBg: ENGINE.surface,
  buttonBorder: ENGINE.border,
  booleanBg: ENGINE.surface,
  booleanSelectedBg: ENGINE.accent,

  /* ─── Forms (sidebar search, controls panel inputs) ─────────── */
  inputBg: ENGINE.inputBg,
  inputBorder: ENGINE.border,
  inputTextColor: ENGINE.heading,
  inputBorderRadius: 10,

  /* ─── Accent (active sidebar item, focused control, links) ──── */
  // Use the dark navy --accent (matches portfolio's brand identity)
  // rather than the saturated primary blue, so the "active" state in
  // the sidebar reads as the brand color the visitor sees in the
  // GlassNav pill on the live site.
  colorPrimary: ENGINE.accent,
  colorSecondary: ENGINE.accent,
});
