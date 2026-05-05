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
 * Why oklch values are static here: Storybook's manager UI runs in a
 * top-level React app outside the engine's runtime. It can't read
 * `--ui-heat` / `--ui-depth` at runtime, so we pick a single point in
 * the design space — engine **default state** (heat=0, depth=100) —
 * and bake those values in. The CANVAS (story rendering area) DOES get
 * the live engine via preview.ts + preview-head.html, so component
 * stories continue to breathe with Heat × Depth.
 *
 * Engine default-state derivations (from app/globals.css formulas):
 *   --L-bg      = 0.96 - (depth/100)*0.81  → 0.15  (near-black)
 *   --L-surface = 0.98 - (depth/100)*0.80  → 0.18
 *   --L-heading = 0.20 + (depth/100)*0.75  → 0.95  (near-white)
 *   --L-body    = 0.35 + (depth/100)*0.33  → 0.68
 *   --L-muted   = 0.50 + (depth/100)*0.10  → 0.60
 *   --L-accent  = 0.50 + (depth/100)*0.22  → 0.72
 *   --dynamic-hue (heat=0)                 = 250°  (cool blue-violet)
 *   --C-accent  = 0.18 - (depth/100)*0.04  → 0.14
 */

import { create } from 'storybook/internal/theming';

// Engine default state — heat=0, depth=100 (dark).
// All values produced by oklch() at this point in the design space.
const HUE = 250;

const ENGINE = {
  bg:      `oklch(0.15 0.08 ${HUE})`,
  surface: `oklch(0.18 0.02 ${HUE})`,
  heading: `oklch(0.95 0.01 ${HUE})`,
  body:    `oklch(0.68 0.03 ${HUE})`,
  muted:   `oklch(0.60 0.03 ${HUE})`,
  accent:  `oklch(0.72 0.14 ${HUE})`,
  border:  `oklch(0.95 0.01 ${HUE} / 0.08)`,
  borderHover: `oklch(0.95 0.01 ${HUE} / 0.16)`,
  inputBg: `oklch(0.18 0.02 ${HUE} / 0.55)`,
} as const;

export const nectarTheme = create({
  base: 'dark',

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
  textMutedColor: ENGINE.muted,

  /* ─── Top bar (the "tabs" row above canvas) ─────────────────── */
  barTextColor: ENGINE.muted,
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
  colorPrimary: ENGINE.accent,
  colorSecondary: ENGINE.accent,
});
