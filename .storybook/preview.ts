import type { Preview } from '@storybook/react-vite'
// Plain color object (no storybook/internal/theming import) — see
// .storybook/theme-colors.ts header for why the split.
import { themeBase } from './theme-colors';

// Import design tokens + the engine CSS so components render with correct
// styles. engine.css (consolidation P3) carries the Heat × Depth :root vars,
// the glass kit (.glass--*), the oklch palette utilities, and the rAF gate —
// without it, glass surfaces + engine-driven colors render unstyled and the
// depth/heat toolbar toggles below have nothing to drive. Order matters: engine
// reads --seed-engine-*/--glass-*/--seed-atmosphere-* from tokens + theme.
import '../css/tokens.css';
import '../css/theme.css';
import '../css/engine.css';
// Sub-brand token overlays (.sub-brand-* classes) — drive the Brand toolbar.
// After engine.css so its unlayered .glass--chrome override wins; references
// --seed-* from tokens.css (loaded above).
import '../css/sub-brands.css';

/* ─────────────────────────────────────────────────────────────
   Depth toggle — Storybook canvas port of the consuming app's
   depth-engine algorithm. The live site's theme transition is a
   450ms gradual --ui-depth sweep with a Gaussian-shaped golden
   hour hue shift (peaks at depth=40, fades at 0 and 100), plus
   a chroma boost during the sweep. This decorator wires the
   same algorithm to a Storybook toolbar dropdown so visitors
   can flip light ↔ dark on any story and see the engine
   breathe in real time.

   Constants mirror the consuming app's depth-engine implementation:
     TRANSITION_DURATION_MS = 450  ← fast golden hour sweep
     GOLDEN_HOUR_PEAK       = 40   ← depth value where amber peaks
     σ (gaussian width)     = 20

   prefers-reduced-motion → instant 0ms transition.
   ───────────────────────────────────────────────────────────── */

const TRANSITION_DURATION_MS = 450;
const GOLDEN_HOUR_PEAK = 40;

/** Set --ui-depth + golden-hue-shift + golden-chroma-boost on the root. */
function setDepth(root: HTMLElement, v: number) {
  const d = Math.max(0, Math.min(100, v));
  root.style.setProperty('--ui-depth', d.toFixed(2));
  // Gaussian centered at GOLDEN_HOUR_PEAK, σ=20: peaks ~1.0 at depth=40,
  // fades to ~0 at the extremes. Multiplied by -180 to shift hue from
  // the cool default (250°) toward warm amber (~70°) at the peak.
  const goldenStrength = Math.exp(-((d - GOLDEN_HOUR_PEAK) ** 2) / (2 * 20 ** 2));
  root.style.setProperty('--golden-hue-shift', (goldenStrength * -180).toFixed(1));
  // Chroma boost during the sweep adds vivid sunset color; fades with the hue.
  root.style.setProperty('--golden-chroma-boost', (goldenStrength * 0.12).toFixed(3));
}

/** Animate from one depth value to another, ease-in-out, ~450ms.
 *
 * Sets `data-nectar-raf="color"` on <html> while the RAF is in flight so
 * engine.css's gate (`:root[data-nectar-raf~="color"]`) disables theme-fade
 * transitions for the duration — the same gate the consuming app uses (ADR
 * 0028 / consolidation P3). Without it, the CSS cross-fade keeps restarting on
 * every 60fps var write and the chrome appears stuck mid-flight.
 */
function animateDepth(root: HTMLElement, from: number, to: number) {
  if (typeof window === 'undefined') return () => {};
  const start = performance.now();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? 0 : TRANSITION_DURATION_MS;
  if (duration > 0) root.setAttribute('data-nectar-raf', 'color');
  let raf = 0;
  const step = (now: number) => {
    const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
    // Ease-in-out (verbatim from useDepthEngine): smooth golden hour sweep.
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    setDepth(root, from + (to - from) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      root.removeAttribute('data-nectar-raf');
    }
  };
  raf = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(raf);
    root.removeAttribute('data-nectar-raf');
  };
}

// Module-scoped state — Storybook re-runs decorators on every render but we
// only want to animate when `depth` / `heat` actually changes (toolbar toggle),
// not on every story navigation. lastDepth/lastHeat + cleanups keep the
// animations idempotent.
let lastDepth: number | null = null;
let lastHeat: number | null = null;
let pendingDepthCleanup: (() => void) | null = null;
let pendingHeatCleanup: (() => void) | null = null;

/** Set --ui-heat on the root. Heat doesn't need a multi-var setter the way
 *  depth does (depth feeds the L-anchors + golden-hour hue/chroma boost);
 *  heat is just a single scalar that --dynamic-hue calc reads directly. */
function setHeat(root: HTMLElement, v: number) {
  const h = Math.max(0, Math.min(100, v));
  root.style.setProperty('--ui-heat', h.toFixed(2));
}

/** Animate heat over the same 450ms ease-in-out timing as depth.
 *
 * Holds the same `data-nectar-raf="color"` gate as animateDepth so the
 * theme-fade transitions are disabled during the heat sweep too. Heat shifts
 * hue → resolved colors change → CSS transition would compete with the RAF
 * without the gate. Same gate as the depth path.
 */
function animateHeat(root: HTMLElement, from: number, to: number) {
  if (typeof window === 'undefined') return () => {};
  const start = performance.now();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? 0 : TRANSITION_DURATION_MS;
  if (duration > 0) root.setAttribute('data-nectar-raf', 'color');
  let raf = 0;
  const step = (now: number) => {
    const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    setHeat(root, from + (to - from) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      root.removeAttribute('data-nectar-raf');
    }
  };
  raf = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(raf);
    root.removeAttribute('data-nectar-raf');
  };
}

const preview: Preview = {
  /* ─── Toolbar globals ───────────────────────────────────────
     Adds a "Depth" dropdown to the Storybook canvas toolbar.
     Selecting Light / Dark triggers the gradual --ui-depth
     animation in the canvas iframe (same 450ms sweep + golden
     hour hue shift the live site uses).

     Default = OS prefers-color-scheme. If the visitor's OS is in
     dark mode, the toolbar starts at Dark (depth=100); otherwise
     Light (depth=0). This keeps the design system site consistent
     with the visitor's device-wide theme — same approach the
     consuming app's depth toggle uses. preview-head.html does the
     same swap via @media (prefers-color-scheme: dark), and theme.ts
     picks light/dark hex snapshots the same way. The three layers
     resolve to the same starting state.
     ───────────────────────────────────────────────────────── */
  initialGlobals: {
    depth:
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 100
        : 0,
    heat: 0,
    subBrand: 'master',
  },
  globalTypes: {
    /* Depth axis: light ↔ dark sweep (450ms with golden-hour hue burst) */
    depth: {
      description: 'Heat × Depth axis — light ↔ dark engine sweep (450ms gradual)',
      toolbar: {
        title: 'Depth',
        icon: 'sun',
        items: [
          { value: 0,   title: 'Light',  icon: 'sun'  },
          { value: 100, title: 'Dark',   icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    /* Heat axis: cool ↔ warm hue sweep. Live site drives heat via
       scroll/drag/idle; in Storybook it's an explicit 3-position
       control. Cool=0 (default 250° blue-violet), Mid=50 (~145°
       teal-green), Warm=100 (~40° amber). */
    heat: {
      description: 'Heat × Depth axis — cool ↔ warm hue sweep',
      toolbar: {
        title: 'Heat',
        icon: 'lightning',
        items: [
          { value: 0,   title: 'Cool', icon: 'circle' },
          { value: 50,  title: 'Mid',  icon: 'circlehollow' },
          { value: 100, title: 'Warm', icon: 'starhollow' },
        ],
        dynamicTitle: true,
      },
    },
    /* Sub-brand axis: overlays scoped token overrides (.sub-brand-*).
       Items mirror tokens/sub-brands/*.json + sub-brands.css; the Phase-4
       sub-brand-registry-parity gate keeps them in sync. */
    subBrand: {
      description: 'Sub-brand token overlay (.sub-brand-* on <body>)',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'master',           title: 'Master (default)' },
          { value: 'ambiguity',        title: 'Ambiguity' },
          { value: 'systems-thinking', title: 'Systems Thinking (EAST)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const nextDepth = (context.globals.depth as number | undefined) ?? 100;
      const nextHeat  = (context.globals.heat  as number | undefined) ?? 0;
      // Only animate on actual change. Storybook re-runs decorators on
      // every render (story switch, controls update, etc.), but the
      // engine animations should only fire when toolbar values flip.
      if (typeof window !== 'undefined') {
        if (lastDepth !== nextDepth) {
          if (pendingDepthCleanup) pendingDepthCleanup();
          const from = lastDepth ?? nextDepth;
          pendingDepthCleanup = animateDepth(document.documentElement, from, nextDepth);
          lastDepth = nextDepth;
        }
        if (lastHeat !== nextHeat) {
          if (pendingHeatCleanup) pendingHeatCleanup();
          const from = lastHeat ?? nextHeat;
          pendingHeatCleanup = animateHeat(document.documentElement, from, nextHeat);
          lastHeat = nextHeat;
        }
      }
      return Story();
    },
    /* Sub-brand class on <body> — composes with the engine decorator above.
       Engine vars live on <html>; the .sub-brand-* override on <body> wins
       for everything inside (incl. the unlayered .glass--chrome rule). */
    (Story, context) => {
      const sb = (context.globals.subBrand as string | undefined) ?? 'master';
      if (typeof document !== 'undefined') {
        Array.from(document.body.classList)
          .filter((c) => c.startsWith('sub-brand-'))
          .forEach((c) => document.body.classList.remove(c));
        if (sb !== 'master') document.body.classList.add(`sub-brand-${sb}`);
      }
      return Story();
    },
  ],
  parameters: {
    /* ─── Sidebar order — professional IA ───────────────────────────────
       Getting Started → Foundations → Tokens → Components → Patterns.
       Array-of-arrays nests child order under a section; '*' catches
       everything unlisted (so new stories still appear, just last). */
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Introduction', 'Installation', 'Usage'],
          'Foundations',
          'Tokens',
          ['Overview', 'Seed', 'Map', 'Semantic', 'Component', 'Typography', 'Scale', 'Pipeline'],
          'Components',
          ['Actions', 'Forms', 'Data Display', 'Feedback', 'Navigation', 'Layout', 'Typography'],
          'Patterns',
          '*',
        ],
      },
    },

    /* ─── Docs theme — match manager chrome ─────────────────────────────
       Storybook's docs renderer (Foundations/* MDX, autogenerated docs)
       has a separate theme from the manager. Without an explicit override
       it falls back to the default light theme — so the docs panel reads
       white-on-white even when the visitor's OS is in dark mode and the
       manager chrome is dark.

       Pinning `docs.theme` to nectarTheme makes the docs panel use the
       same OS-derived light/dark snapshot as the manager. Headings, prose,
       inline code, and table borders all pick up the engine's accent +
       muted-fg + body colors so the docs read as a continuous surface
       with the rest of Storybook.

       (theme.ts picks the snapshot at module evaluation via
       matchMedia('(prefers-color-scheme: dark)') — same instance is used
       here, no separate detection.) */
    docs: {
      theme: themeBase,
    },

    /* ─── Backgrounds — Heat × Depth axes as a Storybook addon ─────────
       Hooks into Storybook's built-in `backgrounds` parameter so stories
       can switch between the four corners of the engine's design space
       (heat 0/100 × depth 0/100) without leaving the canvas. The values
       are computed from the same formulas the live engine uses; if a
       story needs a non-corner state, it can override `parameters.
       backgrounds.default` per-story. */
    backgrounds: {
      default: 'engine-dark',
      values: [
        { name: 'engine-dark',       value: 'oklch(0.15 0.08 250)' }, // heat=0,   depth=100
        { name: 'engine-light',      value: 'oklch(0.96 0.02 250)' }, // heat=0,   depth=0
        { name: 'engine-warm-dark',  value: 'oklch(0.15 0.08 40)'  }, // heat=100, depth=100
        { name: 'engine-warm-light', value: 'oklch(0.96 0.02 40)'  }, // heat=100, depth=0
      ],
    },

    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    /* Viewport breakpoints match the live site's responsive scale. */
    viewport: {
      viewports: {
        mobile:  { name: 'Mobile (390px)',  styles: { width: '390px',  height: '844px' } },
        tablet:  { name: 'Tablet (768px)',  styles: { width: '768px',  height: '1024px' } },
        desktop: { name: 'Desktop (1024px)', styles: { width: '1024px', height: '768px' } },
        wide:    { name: 'Wide (1440px)',    styles: { width: '1440px', height: '900px' } },
      },
    },

    /* Layout — the canvas-stage style padding lives in preview-head.html
       so docs MDX gets the same spacing as story canvases. `centered`
       is the natural choice for component stories, which mirrors the
       kit's flex centered .canvas-stage. */
    layout: 'centered',

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
};

export default preview;