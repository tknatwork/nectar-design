/**
 * useCircadianTheme — React hook for the Biomimetic Adaptive Theme engine.
 *
 * Manages the full lifecycle:
 * 1. Computes initial theme synchronously (no FOUC — SunCalc is pure math)
 * 2. Injects CSS vars via useInsertionEffect (fires before paint)
 * 3. Updates every minute (configurable)
 * 4. Multi-tab sync via TabLeader (only leader computes)
 * 5. Cleans up inline styles when unmounted or mode switches away from 'auto'
 *
 * Usage:
 *   <CircadianProvider latitude={19.07} longitude={72.87}>
 *     {children}
 *   </CircadianProvider>
 */

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useInsertionEffect,
  useRef,
  useState,
} from 'react';

import { computeThemeVars, getState } from '../engine/circadian-engine';
import { TabLeader } from '../engine/tab-leader';
import type { CircadianConfig, CircadianState, CircadianVarMap } from '../engine/types';
import { DEFAULT_CONFIG } from '../engine/types';

// ── All 49 CSS variable keys for cleanup ─────────────────────────

// Color vars removed — Heat Engine now owns color via --ui-heat → --dynamic-hue.
// Only typography (10), motion (3), and shadows (3) remain under circadian control.
const ALL_VAR_KEYS: string[] = [
  '--typo-body-weight', '--typo-display-weight',
  '--typo-body-tracking', '--typo-display-tracking',
  '--typo-body-leading', '--typo-display-leading',
  '--typo-body-size-adjust', '--typo-display-size-adjust',
  '--typo-optical-size', '--typo-contrast-ratio',
  '--motion-duration-scale', '--motion-intensity-scale', '--motion-reduced',
  '--shadow-ambient-opacity', '--shadow-color-temperature', '--shadow-spread-scale',
];

// ── Context ──────────────────────────────────────────────────────

interface CircadianContextValue {
  state: CircadianState | null;
  vars: CircadianVarMap | null;
  isLeader: boolean;
}

const CircadianContext = createContext<CircadianContextValue>({
  state: null,
  vars: null,
  isLeader: false,
});

export function useCircadian(): CircadianContextValue {
  return useContext(CircadianContext);
}

// ── CSS injection ────────────────────────────────────────────────

/** Inject all 49 vars as inline styles on <html> */
function injectVars(vars: CircadianVarMap): void {
  const el = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value);
  }
}

/** Remove all 49 inline styles from <html> (falls back to CSS cascade) */
function removeVars(): void {
  const el = document.documentElement;
  for (const key of ALL_VAR_KEYS) {
    el.style.removeProperty(key);
  }
}

// ── Provider ─────────────────────────────────────────────────────

export interface CircadianProviderProps {
  children: React.ReactNode;
  /** Latitude in decimal degrees */
  latitude?: number;
  /** Longitude in decimal degrees */
  longitude?: number;
  /** Full config override (latitude/longitude props take precedence) */
  config?: Partial<CircadianConfig>;
  /** Force a specific mode — 'static' disables the engine */
  mode?: 'auto' | 'static';
}

export function CircadianProvider({
  children,
  latitude,
  longitude,
  config,
  mode = 'auto',
}: CircadianProviderProps) {
  const cfg: CircadianConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    ...(latitude !== undefined ? { latitude } : {}),
    ...(longitude !== undefined ? { longitude } : {}),
  };

  const configRef = useRef(cfg);
  configRef.current = cfg;

  const [contextValue, setContextValue] = useState<CircadianContextValue>(() => {
    // Synchronous initial compute — no FOUC
    if (typeof window === 'undefined') {
      return { state: null, vars: null, isLeader: false };
    }
    const vars = computeThemeVars(cfg);
    const state = getState(cfg);
    return { state, vars, isLeader: false };
  });

  // Inject initial vars before first paint (prevents FOUC)
  useInsertionEffect(() => {
    if (contextValue.vars && mode === 'auto') {
      // First injection: disable transitions to prevent flash
      const el = document.documentElement;
      el.style.setProperty('--circadian-transition', 'none');
      injectVars(contextValue.vars);

      // Re-enable transitions after one frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.removeProperty('--circadian-transition');
        });
      });
    }
  }, []); // Only on mount

  // Compute function for leader tab
  const compute = useCallback(() => {
    const vars = computeThemeVars(configRef.current);
    const state = getState(configRef.current);
    injectVars(vars);
    return { state, vars };
  }, []);

  // Engine lifecycle
  useEffect(() => {
    if (mode !== 'auto') {
      removeVars();
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const leader = new TabLeader({
      onBecomeLeader: () => {
        // Compute immediately
        const { state, vars } = compute();
        setContextValue({ state, vars, isLeader: true });
        leader.broadcastVars(vars);

        // Then every updateIntervalMs
        intervalId = setInterval(() => {
          const result = compute();
          setContextValue({ state: result.state, vars: result.vars, isLeader: true });
          leader.broadcastVars(result.vars);
        }, configRef.current.updateIntervalMs ?? DEFAULT_CONFIG.updateIntervalMs);
      },

      onBecomeFollower: () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        setContextValue((prev) => ({ ...prev, isLeader: false }));
      },

      onReceiveVars: (vars) => {
        injectVars(vars);
        const state = getState(configRef.current);
        setContextValue({ state, vars, isLeader: false });
      },
    });

    leader.start();

    return () => {
      if (intervalId) clearInterval(intervalId);
      leader.dispose();
      removeVars(); // Clean up inline styles on unmount
    };
  }, [mode, compute]);

  return createElement(
    CircadianContext.Provider,
    { value: contextValue },
    children,
  );
}
