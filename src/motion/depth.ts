import { animate } from 'motion';

import { engineValue } from './engine';
import { claimProperty } from './gate';

/** Options for a depth sweep. */
export interface SweepOptions {
  /** Sweep length in ms (default 450 - the useDepthEngine golden-hour value). */
  durationMs?: number;
  /** Skip the animation and set instantly (reduced-motion / pref off). */
  instant?: boolean;
  /** Called once the sweep (or instant set) settles. */
  onComplete?: () => void;
}

const LIGHT = 0;
const DARK = 100;
const DURATION_MS = 450;

/** Quadratic ease-in-out - the exact curve useDepthEngine used for the sweep. */
const easeInOutQuad = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

function rootEl(): HTMLElement | null {
  return typeof document === 'undefined' ? null : document.documentElement;
}

/**
 * Sweep the depth axis to `to` (0 = light, 100 = dark) over a golden-hour
 * cross-fade. The `depth` engine value drives both --ui-depth and the sunset
 * bloom every frame (see engine.ts), so the warm midpoint comes for free.
 *
 * While sweeping, the gate claims `color` on <html> so CSS colour transitions
 * stand down and don't fight the per-frame write (generalizes the old
 * `depth-animating` class). Pure engine: the caller decides WHEN to sweep and
 * whether to go instant.
 */
export function sweepDepth(to: number, options: SweepOptions = {}): void {
  const depth = engineValue('depth');
  const el = rootEl();

  // SSR / no DOM: set the value, fire the callback, no animation.
  if (!el) {
    depth.set(to);
    options.onComplete?.();
    return;
  }

  const release = claimProperty(el, 'color');

  if (options.instant) {
    depth.set(to);
    // Release next frame so consumers repaint in lockstep before the gate lifts.
    requestAnimationFrame(() => {
      release();
      options.onComplete?.();
    });
    return;
  }

  animate(depth, to, {
    duration: (options.durationMs ?? DURATION_MS) / 1000,
    ease: easeInOutQuad,
  }).then(() => {
    release();
    options.onComplete?.();
  });
}

/** Current depth value (0-100). */
export function currentDepth(): number {
  return engineValue('depth').get();
}

/** True when the current depth is in the dark half. */
export function isDark(): boolean {
  return currentDepth() > 50;
}

/** Sweep to the opposite half. Returns the target depth (LIGHT or DARK). */
export function toggleDepth(options?: SweepOptions): number {
  const to = isDark() ? LIGHT : DARK;
  sweepDepth(to, options);
  return to;
}
