import type { Preview } from '@storybook/react-vite'

// Import design tokens so components render with correct styles
import '../css/tokens.css';
import '../css/theme.css';
// Circadian engine adds 16 typography + motion + shadow vars from solar
// position. The Storybook canvas inherits the engine's default state
// (depth=100, heat=0) via preview-head.html; circadian provides the
// runtime layer atop that. Components that opt into useCircadian()
// will read the live values; components that don't ignore them.
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

/** Animate from one depth value to another, ease-in-out, ~450ms. */
function animateDepth(root: HTMLElement, from: number, to: number) {
  if (typeof window === 'undefined') return () => {};
  const start = performance.now();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? 0 : TRANSITION_DURATION_MS;
  let raf = 0;
  const step = (now: number) => {
    const t = duration > 0 ? Math.min(1, (now - start) / duration) : 1;
    // Ease-in-out (verbatim from useDepthEngine): smooth golden hour sweep.
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    setDepth(root, from + (to - from) * eased);
    if (t < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}

// Module-scoped state — Storybook re-runs decorators on every render but we
// only want to animate when `depth` actually changes (toolbar toggle), not
// on every story navigation. lastDepth + cleanup keep the animation idempotent.
let lastDepth: number | null = null;
let pendingCleanup: (() => void) | null = null;

const preview: Preview = {
  /* ─── Toolbar globals ───────────────────────────────────────
     Adds a "Depth" dropdown to the Storybook canvas toolbar.
     Selecting Light / Dark triggers the gradual --ui-depth
     animation in the canvas iframe (same 450ms sweep + golden
     hour hue shift the live site uses). The default is 100
     (dark) to match the manager theme baked from depth=100.
     ───────────────────────────────────────────────────────── */
  initialGlobals: {
    depth: 100,
  },
  globalTypes: {
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
  },
  decorators: [
    (Story, context) => {
      const next = (context.globals.depth as number | undefined) ?? 100;
      // Only animate on actual change. Storybook re-runs decorators on
      // every render (story switch, controls update, etc.), but the
      // depth animation should only fire when the toolbar value flips.
      if (typeof window !== 'undefined' && lastDepth !== next) {
        if (pendingCleanup) pendingCleanup();
        // First-mount: snap to the value (no animation from null).
        // Subsequent changes: animate from previous value.
        const from = lastDepth ?? next;
        pendingCleanup = animateDepth(document.documentElement, from, next);
        lastDepth = next;
      }
      return Story();
    },
  ],
  parameters: {
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