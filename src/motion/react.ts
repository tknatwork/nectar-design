'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAnimationPref } from './prefs';

import { isDark as readIsDark, sweepDepth, toggleDepth } from './depth';
import { engineValue, registerEngineProps } from './engine';
import { createHeatDriver, type HeatOptions } from './heat';
import type { EngineAxis } from './types';

/**
 * React layer for the Nectar motion runtime (ADR 0028, Stage C).
 *
 * Mirrors Motion's own `motion` / `motion/react` split: the core modules
 * (clock, engine, gate, drivers, flip, view) are framework-agnostic and
 * importable from `@/lib/motion`; these hooks live behind `@/lib/motion/react`
 * so the core stays server-importable.
 */

/** Register the engine @property typed vars once, on mount. SSR-safe. */
export function useEngineProps(): void {
  useEffect(() => {
    registerEngineProps();
  }, []);
}

/**
 * Subscribe to a live engine axis value (0-100) for meters / readouts.
 * Re-renders on change. Read-only - does not drive the engine.
 */
export function useEngineAxis(axis: EngineAxis): number {
  const [value, setValue] = useState<number>(() => engineValue(axis).get());
  useEffect(() => {
    const mv = engineValue(axis);
    setValue(mv.get());
    return mv.on('change', setValue);
  }, [axis]);
  return value;
}

/** Inactivity window after the last pointer move before heat stops rising. */
const HEAT_INACTIVITY_MS = 150;

/**
 * Heat hook - creates a heat driver and wires the TEMPORARY input adapter
 * (pointer move -> setMoving + inactivity timeout, click -> bump).
 *
 * The adapter is the Stage-C stand-in for the Stage-D sensorium: once the
 * interaction layer emits `activity` / `activate` signals, this window-listener
 * bridge is deleted and the driver is fed from there instead. Touch
 * synthesizes click, so real movement is tracked only off-touch.
 */
export function useHeat(options?: HeatOptions): void {
  useEffect(() => {
    const driver = createHeatDriver(options);
    let inactivity: ReturnType<typeof setTimeout> | null = null;

    const onMove = (): void => {
      driver.setMoving(true);
      if (inactivity) clearTimeout(inactivity);
      inactivity = setTimeout(() => driver.setMoving(false), HEAT_INACTIVITY_MS);
    };
    const onClick = (): void => driver.bump();

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    return () => {
      if (!isTouch) window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      if (inactivity) clearTimeout(inactivity);
      driver.stop();
    };
    // Options are captured once on mount (matches the legacy engine hook).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** Whether a depth sweep should be instant (reduced-motion or animation pref off). */
function sweepInstant(): boolean {
  if (typeof window === 'undefined') return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return getAnimationPref() === 'off';
}

/** Imperative controls for the depth (light <-> dark) axis. */
export interface DepthControls {
  /** Sweep to the opposite half (light <-> dark). */
  toggle: () => void;
  /** Sweep to an explicit depth (0 = light, 100 = dark). */
  setDepth: (to: number) => void;
  /** Read whether the current depth is in the dark half. */
  isDark: () => boolean;
}

/**
 * Depth hook - a golden-hour light<->dark toggle on the engine, honouring
 * reduced-motion and the animation pref (instant when either is set).
 *
 * Stage C scope: drives the sweep only. Persistence (localStorage) and the
 * pathname / homepage rules from the legacy useDepthEngine stay in the app
 * until Stage E re-sources surfaces onto this runtime.
 */
export function useDepth(): DepthControls {
  const toggle = useCallback(() => {
    toggleDepth({ instant: sweepInstant() });
  }, []);
  const setDepth = useCallback((to: number) => {
    sweepDepth(to, { instant: sweepInstant() });
  }, []);
  const isDark = useCallback(() => readIsDark(), []);
  return { toggle, setDepth, isDark };
}

/**
 * Root convenience hook: registers engine props, wires heat input, and returns
 * depth controls. The single call a provider / harness makes to bring the
 * engine alive.
 */
export function useNectarEngine(options?: HeatOptions): DepthControls {
  useEngineProps();
  useHeat(options);
  return useDepth();
}
