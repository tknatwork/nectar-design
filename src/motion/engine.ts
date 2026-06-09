import { type MotionValue,motionValue } from 'motion-dom';

import type { EngineAxis } from './types';

/**
 * The engine values - the two continuous axes of the Heat x Depth gamut,
 * expressed as Motion `MotionValue`s and projected to root CSS vars
 * (ADR 0028 Layer 2 + perf model).
 *
 * One-write-CSS-derives: each axis writes exactly ONE root custom property;
 * every dependent colour is a CSS `calc()` / `oklch()` off that var, so the
 * JS thread writes one number per axis per frame and never re-renders React.
 *
 *   --ui-heat           0-100   interaction -> hue (cool blue -> warm amber)
 *   --ui-depth          0-100   toggle -> lightness (0 = light, 100 = dark)
 *   --sunset-intensity  0-1     Gaussian bloom over a depth sweep (peak ~ 40)
 */

function root(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

const VAR: Record<EngineAxis, string> = {
  heat: '--ui-heat',
  depth: '--ui-depth',
};

const DEFAULT: Record<EngineAxis, number> = {
  heat: 0,
  depth: 100, // ships dark to match the consuming app's FOUC pre-paint script
};

const values = new Map<EngineAxis, MotionValue<number>>();

/**
 * Get (lazily creating) the MotionValue for an engine axis. Its value is
 * clamped to 0-100 and projected to the axis root var on every change. Drivers
 * own accumulation; this writer is the single point that touches the DOM.
 */
export function engineValue(axis: EngineAxis): MotionValue<number> {
  let mv = values.get(axis);
  if (!mv) {
    mv = motionValue(DEFAULT[axis]);
    mv.on('change', (v) => {
      const clamped = v < 0 ? 0 : v > 100 ? 100 : v;
      const el = root();
      if (!el) return;
      el.style.setProperty(VAR[axis], clamped.toFixed(2));
      // Depth also drives the sunset bloom every frame, so a sweep blooms
      // amber mid-transition and settles at the endpoints (ports the
      // useDepthEngine behaviour where every depth write set --sunset-intensity).
      if (axis === 'depth') {
        el.style.setProperty('--sunset-intensity', sunsetIntensity(clamped).toFixed(3));
      }
    });
    values.set(axis, mv);
  }
  return mv;
}

/* -- Sunset bloom (color-motion preset) -----------------------------------
 * Ported verbatim from the old useDepthEngine: a Gaussian 0->1->0 over the
 * depth sweep, peaking mid-transition so a warm "sunset" moment layers onto
 * the otherwise cool light<->dark cross-fade. The depth driver calls
 * `writeSunset()` each sweep frame; globals.css alpha-modulates a fixed amber
 * overlay by --sunset-intensity. */
const SUNSET_PEAK = 40; // depth where the bloom is strongest
const SUNSET_SIGMA = 20;

/** Sunset bloom intensity (0-1) for a given depth. Pure; testable. */
export function sunsetIntensity(depth: number): number {
  return Math.exp(-((depth - SUNSET_PEAK) ** 2) / (2 * SUNSET_SIGMA ** 2));
}

/** Project the sunset bloom for `depth` to --sunset-intensity. */
export function writeSunset(depth: number): void {
  root()?.style.setProperty('--sunset-intensity', sunsetIntensity(depth).toFixed(3));
}

/**
 * Sync the engine MotionValues to whatever is currently on :root - a FOUC
 * pre-paint script, SSR, or another writer. Call on mount so the JS value
 * matches the painted value and the first sweep starts from the right place
 * (ports useDepthEngine's mount-sync). SSR-safe no-op.
 */
export function syncEngineFromDom(): void {
  const el = root();
  if (!el || typeof getComputedStyle !== 'function') return;
  const style = getComputedStyle(el);
  (['heat', 'depth'] as const).forEach((axis) => {
    const n = parseFloat(style.getPropertyValue(VAR[axis]));
    if (Number.isFinite(n)) engineValue(axis).set(n);
  });
}

/**
 * Register the engine axes as typed `<number>` custom properties so the
 * browser interpolates them cheaply and correctly re-resolves dependent
 * `oklch()` / `calc()` (ADR 0028 perf model). Idempotent; SSR-safe no-op.
 * Call once on mount, before the first sweep.
 */
let registered = false;
export function registerEngineProps(): void {
  if (registered) return;
  if (typeof CSS === 'undefined' || typeof CSS.registerProperty !== 'function') return;
  registered = true;
  const props: Array<[string, string]> = [
    ['--ui-heat', '0'],
    ['--ui-depth', '100'],
    ['--sunset-intensity', '0'],
  ];
  for (const [name, initialValue] of props) {
    try {
      CSS.registerProperty({ name, syntax: '<number>', inherits: true, initialValue });
    } catch {
      // Already registered (HMR / double-mount) - registerProperty throws on
      // re-registration; safe to ignore.
    }
  }
}
