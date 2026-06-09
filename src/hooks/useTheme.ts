'use client';

import { useCallback, useEffect, useSyncExternalStore } from 'react';

export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'auto';

const STORAGE_KEY = 'nectar-theme';

/** Valid stored modes */
const VALID_MODES = new Set<ThemeMode>(['light', 'dark', 'high-contrast', 'auto']);

function getSnapshot(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && VALID_MODES.has(stored as ThemeMode)) return stored as ThemeMode;
  return 'auto';
}

function getServerSnapshot(): ThemeMode {
  return 'light';
}

function subscribe(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  window.addEventListener('storage', onStorage);
  return () => {
    mq.removeEventListener('change', callback);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * Resolve the effective data-theme attribute for non-auto modes.
 * Auto mode delegates theming to the circadian engine (no data-theme needed).
 */
function resolveDataTheme(mode: ThemeMode): string | null {
  if (mode === 'auto') return null;
  if (mode === 'high-contrast') return 'high-contrast';
  if (mode === 'dark') return 'dark';
  return 'light';
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const dataTheme = resolveDataTheme(mode);
    if (dataTheme) {
      document.documentElement.setAttribute('data-theme', dataTheme);
    } else {
      // Auto mode — remove data-theme so circadian engine's inline styles take precedence
      document.documentElement.removeAttribute('data-theme');
    }
  }, [mode]);

  const setTheme = useCallback((next: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, next);
    const dataTheme = resolveDataTheme(next);
    if (dataTheme) {
      document.documentElement.setAttribute('data-theme', dataTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  const toggle = useCallback(() => {
    const current = getSnapshot();
    // Cycle: light → dark → auto → light (skip high-contrast in toggle)
    const next: ThemeMode = current === 'light' ? 'dark'
      : current === 'dark' ? 'auto'
      : 'light';
    setTheme(next);
  }, [setTheme]);

  /** Whether the circadian engine should be active */
  const isAuto = mode === 'auto';

  return { theme: mode, setTheme, toggle, isAuto } as const;
}
