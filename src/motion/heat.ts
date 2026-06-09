import { onFrame } from './clock';
import { engineValue } from './engine';
import type { Unsubscribe } from './types';

/** Tuning for the heat driver. Defaults port useHeatEngine's constants. */
export interface HeatOptions {
  /** Heat units gained per second while the pointer is moving. */
  risePerSecond?: number;
  /** Newton cooling constant (decay rate at full heat). */
  decayK?: number;
  /** Default heat added per `bump()` (an activate / click). */
  clickBurst?: number;
}

/** Imperative controls for a running heat driver. */
export interface HeatDriver {
  /** Pointer is moving (raises heat while true). */
  setMoving(moving: boolean): void;
  /** Add an instantaneous burst (drained smoothly so colour ramps, not pops). */
  bump(amount?: number): void;
  /** Current heat value (0-100). */
  value(): number;
  /** Stop the driver and unsubscribe from the clock. */
  stop(): void;
}

const DEFAULTS = { risePerSecond: 3, decayK: 0.06, clickBurst: 5 } as const;
const clamp = (v: number): number => (v < 0 ? 0 : v > 100 ? 100 : v);

/**
 * Heat driver - the rise / decay / burst-drain math from useHeatEngine, ported
 * onto the unified clock and the `heat` engine value.
 *
 * Pure engine (ADR 0028 Layer 2): it exposes imperative controls and owns NO
 * DOM listeners. The interaction layer (Stage D) - or, until then, the QA
 * harness - translates pointer / touch input into `setMoving` / `bump` calls.
 * The driver writes only the `heat` engine value; that value projects to
 * --ui-heat (one-write-CSS-derives).
 */
export function createHeatDriver(options: HeatOptions = {}): HeatDriver {
  const rise = options.risePerSecond ?? DEFAULTS.risePerSecond;
  const decay = options.decayK ?? DEFAULTS.decayK;
  const clickBurst = options.clickBurst ?? DEFAULTS.clickBurst;

  const heat = engineValue('heat');
  let pool = 0; // undrained burst
  let moving = false;

  const stopClock: Unsubscribe = onFrame((deltaMs) => {
    // Idle fast-path: not moving, already cool, nothing pooled -> skip frame.
    if (!moving && heat.get() === 0 && pool === 0) return;
    const dt = deltaMs / 1000; // seconds

    // Drain the burst pool so a click tweens in over ~300ms (no colour pop).
    let drained = 0;
    if (pool > 0) {
      drained = pool * Math.min(1, dt * 3.5);
      pool -= drained;
      if (pool < 0.05) pool = 0;
    }

    const current = heat.get();
    if (moving) {
      heat.set(clamp(current + rise * dt + drained));
    } else if (drained > 0) {
      heat.set(clamp(current + drained));
    } else if (current > 0.5) {
      // Cool-end speedup: decay accelerates as heat -> 0 so the final descent
      // to the cool tone feels snappy rather than lingering on the exp tail.
      const speedup = 1 + (1 - current / 100) * 3;
      heat.set(current * Math.exp(-decay * speedup * dt));
    } else if (current > 0) {
      heat.set(0);
    }
  });

  return {
    setMoving: (m: boolean) => {
      moving = m;
    },
    bump: (amount: number = clickBurst) => {
      pool += amount;
    },
    value: () => heat.get(),
    stop: stopClock,
  };
}
