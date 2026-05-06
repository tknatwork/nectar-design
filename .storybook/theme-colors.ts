/**
 * theme-colors.ts — shared OS-preference-derived color snapshots.
 *
 * Two consumers want these hex values but live in different Storybook
 * build contexts:
 *
 *   1. theme.ts (manager) — calls `create()` from
 *      storybook/internal/theming with these values to build the
 *      Storybook manager theme (sidebar, top bar, addons panel).
 *      That import path is only resolvable in the manager build.
 *
 *   2. preview.ts (preview) — uses these values inline via
 *      `parameters.docs.theme` so the docs panel matches the manager
 *      chrome. The preview build does NOT have access to
 *      storybook/internal/theming, so it can't call create() — it
 *      ships a plain object with the same shape.
 *
 * Splitting colors out of theme.ts keeps the storybook/internal
 * import isolated to manager-side files. Without the split, the
 * preview rolldown resolver throws:
 *   "./internal/theming" is not exported under the conditions
 *   [storybook, stories, test, module, browser, production, import]
 *   from package ./node_modules/storybook
 *
 * (See theme.ts header for the snapshot derivation, golden-hour math,
 * and why oklch values are pre-converted to hex.)
 */

// LIGHT snapshot — portfolio default load (depth=0, golden-hour shifted hue 225.6).
export const LIGHT_COLORS = {
  bg:          '#d9f8ff',                      // oklch(0.96 0.036 225.6)
  surface:     '#ebfcff',                      // oklch(0.98 0.02 225.6)
  heading:     '#11171a',                      // oklch(0.20 0.01 225.6)
  body:        '#293e47',                      // oklch(0.35 0.03 225.6)
  muted:       '#f2fafe',                      // oklch(0.98 0.01 225.6)
  mutedFg:     '#516770',                      // oklch(0.50 0.03 225.6)
  primary:     '#0072b6',                      // oklch(0.50 0.196 225.6)
  accent:      '#2e4563',                      // verbatim brand --accent (static)
  border:      'rgba(88, 102, 108, 0.3)',      // oklch(0.50 0.02 225.6 / 0.3)
  inputBg:     '#ebfcff',                      // matches surface
} as const;

// DARK snapshot — depth=100, hue=250 (no golden-hour at extreme).
export const DARK_COLORS = {
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

/**
 * Detects the visitor's OS color scheme preference once at module load.
 *
 * Static at load is sufficient — same UX as the portfolio's DepthToggle
 * (the user reloads to apply OS theme changes). matchMedia might not
 * exist in older browsers / SSR — guard for both.
 */
export const prefersDark =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

export const ENGINE = prefersDark ? DARK_COLORS : LIGHT_COLORS;

/**
 * Plain theme object compatible with Storybook's `docs.theme` parameter
 * AND the `create()` call in theme.ts. Same hex values, no import of
 * `storybook/internal/theming` here. The manager-side theme.ts wraps
 * this with `create()` (which adds polished-derived hover / focus
 * shades). The preview-side preview.ts uses this object directly
 * because Storybook's docs renderer accepts the plain shape.
 */
export const themeBase = {
  base: prefersDark ? ('dark' as const) : ('light' as const),
  brandTitle: `<span style="font-family:var(--font-display,Inter,sans-serif);font-weight:800;letter-spacing:-0.01em;font-size:14px;color:${ENGINE.heading}">nectar<em style="font-family:var(--font-serif,Georgia,serif);font-style:italic;font-weight:500;color:${ENGINE.accent};margin:0 2px">·</em>design</span>`,
  brandUrl: 'https://design.tusharkantnaik.com',
  brandTarget: '_self' as const,
  appBg: ENGINE.bg,
  appContentBg: ENGINE.surface,
  appPreviewBg: ENGINE.bg,
  appBorderColor: ENGINE.border,
  appBorderRadius: 14,
  fontBase: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  fontCode: '"Monaspace Neon", ui-monospace, "SF Mono", Menlo, monospace',
  textColor: ENGINE.body,
  textInverseColor: ENGINE.bg,
  textMutedColor: ENGINE.mutedFg,
  barTextColor: ENGINE.mutedFg,
  barSelectedColor: ENGINE.accent,
  barHoverColor: ENGINE.heading,
  barBg: ENGINE.surface,
  buttonBg: ENGINE.surface,
  buttonBorder: ENGINE.border,
  booleanBg: ENGINE.surface,
  booleanSelectedBg: ENGINE.accent,
  inputBg: ENGINE.inputBg,
  inputBorder: ENGINE.border,
  inputTextColor: ENGINE.heading,
  inputBorderRadius: 10,
  colorPrimary: ENGINE.accent,
  colorSecondary: ENGINE.accent,
};
