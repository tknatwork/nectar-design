import type { Preview } from '@storybook/react-vite'
// Plain color object (no storybook/internal/theming import) — see
// .storybook/theme-colors.ts header for why the split.
import { themeBase } from './theme-colors';

// Import design tokens so components render with correct styles
import '../css/tokens.css';
import '../css/theme.css';
// Circadian engine adds 16 typography + motion + shadow vars from solar
// position. The Storybook canvas inherits the engine's default state
// (heat=0, depth=0 by default; @media flips depth to 100 when the
// visitor's OS prefers dark mode) via preview-head.html; circadian
// provides the runtime layer atop that. Components that opt into
// useCircadian() will read the live values; components that don't
// ignore them.
import '../css/circadian.css';

/* ─────────────────────────────────────────────────────────────
   Depth toggle — port of myportfolio's useDepthEngine to the
   Storybook canvas. The live site's theme transition is a
   450ms gradual --ui-depth sweep with a Gaussian-shaped golden
   hour hue shift (peaks at depth=40, fades at 0 and 100), plus
   a chroma boost during the sweep. This decorator wires the
   same algorithm to a Storybook toolbar dropdown so visitors
   can flip light ↔ dark on any story and see the engine
   breathe in real time.

   Constants verbatim from app/hooks/useDepthEngine.ts:
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
 * Adds the `depth-animating` class to <html> while the RAF is in
 * flight so manager-head.html / preview-head.html disable their
 * theme-fade transitions for the duration. Without this, the body
 * background's CSS 800ms transition keeps restarting every time the
 * RAF writes the var (60fps) and the chrome appears stuck mid-flight.
 * Same fix as portfolio's useDepthEngine.
 */
function animateDepth(root: HTMLElement, from: number, to: number) {
  if (typeof window === 'undefined') return () => {};
  const start = performance.now();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? 0 : TRANSITION_DURATION_MS;
  if (duration > 0) root.classList.add('depth-animating');
  let raf = 0;
  const step = (now: number) => {
    const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
    // Ease-in-out (verbatim from useDepthEngine): smooth golden hour sweep.
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    setDepth(root, from + (to - from) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      root.classList.remove('depth-animating');
    }
  };
  raf = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(raf);
    root.classList.remove('depth-animating');
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
 * Toggles the same `depth-animating` class as animateDepth so the
 * theme-fade transitions are disabled during the heat sweep too.
 * Heat shifts hue → resolved colors change → CSS transition would
 * compete with the RAF without the gate. Same fix as depth path.
 */
function animateHeat(root: HTMLElement, from: number, to: number) {
  if (typeof window === 'undefined') return () => {};
  const start = performance.now();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? 0 : TRANSITION_DURATION_MS;
  if (duration > 0) root.classList.add('depth-animating');
  let raf = 0;
  const step = (now: number) => {
    const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    setHeat(root, from + (to - from) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      root.classList.remove('depth-animating');
    }
  };
  raf = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(raf);
    root.classList.remove('depth-animating');
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
     with the visitor's device-wide theme — same as how the
     portfolio's DepthToggle defaults. preview-head.html does the
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
  ],
  parameters: {
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