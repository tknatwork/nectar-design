'use client';

import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { getSensorium } from '../interaction/react';
import {
  createHeatDriver,
  currentDepth,
  registerEngineProps,
  syncEngineFromDom,
} from '../motion';
import { type DepthControls, useDepth } from '../motion/react';
import { type NectarConfig, NectarContext, type NectarContextValue } from './context';

/** Inactivity window after the last pointer move before heat stops rising. */
const HEAT_INACTIVITY_MS = 150;
/** Default localStorage key for the depth toggle (read by the host's FOUC pre-paint script). */
const DEFAULT_DEPTH_KEY = 'nectar-depth';

/** Synchronous reduced-motion read (SSR-safe). Lazy initial state so the heat
 *  effect is gated correctly on the very first client render. */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Default heat-isolation predicate: an interaction target sits inside a surface
 * that opts out of driving ambient heat — any `[aria-modal="true"]` dialog or an
 * explicit `[data-no-heat]` element. Keeps modal interactions from bumping
 * --ui-heat (ADR 0028 Stage F). Hosts can pass their own to extend it.
 */
export function defaultIsHeatIsolated(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('[aria-modal="true"], [data-no-heat]') !== null
  );
}

export interface NectarProviderProps {
  children: ReactNode;
  /** Default component density for descendants (config). */
  componentSize?: NectarConfig['componentSize'];
  /** localStorage key the depth toggle persists to (the host's FOUC pre-paint
   *  script must read the same key). */
  depthStorageKey?: string;
  /**
   * Host-injected route policy: when true, the ambient heat driver is NOT wired
   * and depth auto-resolution is skipped. The app computes this from its own
   * route rules (e.g. bespoke reading surfaces / ink routes). This is the
   * ConfigProvider seam — nd owns the engine, the host owns route policy.
   */
  engineSuppressed?: boolean;
  /**
   * Host-injected depth auto-resolution key. When non-null, on (re)mount and
   * whenever it changes the provider reads the saved depth from localStorage and
   * sweeps to it. When null, depth is left at the visitor's current value (the
   * host passes null for routes that should not auto-resolve, e.g. a homepage
   * whose cold-start state is set by the FOUC script). Typically the host passes
   * the current route key, or null when suppressed/home.
   */
  autoDepthKey?: string | null;
  /** Predicate gating which interaction targets may drive heat. Defaults to the
   *  modal / `[data-no-heat]` isolation; hosts can compose their own. */
  isHeatIsolated?: (target: EventTarget | null) => boolean;
}

/**
 * NectarProvider — the headless engine root (ADR 0028, relocated into nd in
 * consolidation P4). Mount once at the host's app root. On mount it registers
 * the typed engine vars, adopts the FOUC pre-paint state (`syncEngineFromDom`),
 * starts the app-lifetime interaction sensorium, and wires Layer 1 → Layer 2
 * (the heat driver is fed by the sensorium's `activity` / `activate` signals).
 *
 * This component is framework-agnostic: it carries NO route knowledge. The host
 * injects route policy via `engineSuppressed` + `autoDepthKey` (see
 * AppNectarProvider in the consuming app for the Next.js wiring). Sub-brand token
 * activation is orthogonal and stays with <SubBrandProvider> (ADR 0026).
 */
export function NectarProvider({
  children,
  componentSize = 'md',
  depthStorageKey = DEFAULT_DEPTH_KEY,
  engineSuppressed = false,
  autoDepthKey = null,
  isHeatIsolated = defaultIsHeatIsolated,
}: NectarProviderProps) {
  const baseDepth = useDepth();
  const { setDepth: baseSetDepth } = baseDepth;
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  // Mount-once: register typed engine props, adopt the FOUC pre-paint state,
  // start the app-lifetime interaction sensorium, and track reduced-motion.
  useEffect(() => {
    registerEngineProps();
    syncEngineFromDom(); // adopt the FOUC pre-paint --ui-depth / --ui-heat
    getSensorium().start();

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMq = (): void => setReducedMotion(mq.matches);
    syncMq();
    mq.addEventListener('change', syncMq);
    return () => mq.removeEventListener('change', syncMq);
    // The sensorium is app-lifetime (a global bus); it is not stopped here.
  }, []);

  // Layer 1 → Layer 2: heat is driven by interaction INTENT, not raw events, and
  // only where the host allows it — off when suppressed and under reduced-motion.
  useEffect(() => {
    if (engineSuppressed || reducedMotion) return;
    const sensorium = getSensorium();
    const heat = createHeatDriver();
    let inactivity: ReturnType<typeof setTimeout> | null = null;
    const offActivity = sensorium.bus.on('activity', (a) => {
      if (a.kind !== 'move') return;
      heat.setMoving(true);
      if (inactivity) clearTimeout(inactivity);
      inactivity = setTimeout(() => heat.setMoving(false), HEAT_INACTIVITY_MS);
    });
    const offActivate = sensorium.bus.on('activate', (a) => {
      // The sensorium still REPORTS activations inside a modal/overlay (other
      // consumers may want them) — only heat opts out. Cursor MOVE is not gated
      // because the `activity`/move signal carries no target.
      if (isHeatIsolated(a.target)) return;
      heat.bump();
    });
    return () => {
      offActivity();
      offActivate();
      heat.stop();
      if (inactivity) clearTimeout(inactivity);
    };
  }, [engineSuppressed, reducedMotion, isHeatIsolated]);

  // Depth auto-resolution, keyed on the host-injected `autoDepthKey`. When the
  // key is non-null (host: a non-home, non-suppressed route), read the saved
  // depth and sweep to it; when null, leave depth at the visitor's value. Ported
  // from the legacy useDepthEngine pathname watcher, with the route decision
  // lifted to the host.
  useEffect(() => {
    if (autoDepthKey === null) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(depthStorageKey);
    } catch {
      /* private windows / sandboxed iframes */
    }
    const target = stored !== null ? Number(stored) : 0;
    if (Number.isFinite(target) && currentDepth() !== target) {
      baseSetDepth(target);
    }
  }, [autoDepthKey, baseSetDepth, depthStorageKey]);

  // Persist the depth target to localStorage FIRST (so rapid toggles never race
  // and the FOUC pre-paint script reads the latest), then drive the sweep.
  const persist = useCallback(
    (to: number) => {
      try {
        localStorage.setItem(depthStorageKey, String(to));
      } catch {
        /* private windows / sandboxed iframes - in-memory state still updates */
      }
    },
    [depthStorageKey],
  );

  const depth = useMemo<DepthControls>(
    () => ({
      isDark: baseDepth.isDark,
      setDepth: (to: number) => {
        persist(to);
        baseDepth.setDepth(to);
      },
      toggle: () => {
        const to = baseDepth.isDark() ? 0 : 100;
        persist(to);
        baseDepth.setDepth(to);
      },
    }),
    [baseDepth, persist],
  );

  const value = useMemo<NectarContextValue>(
    () => ({ bus: getSensorium().bus, depth, config: { componentSize, reducedMotion } }),
    [depth, componentSize, reducedMotion],
  );

  return <NectarContext.Provider value={value}>{children}</NectarContext.Provider>;
}
