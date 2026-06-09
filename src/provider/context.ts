'use client';

import { createContext, useContext } from 'react';

import type { SignalBus } from '../interaction';
import type { DepthControls } from '../motion/react';

/** Root configuration descendants can read (ADR 0028 provider). */
export interface NectarConfig {
  /** Default component density for descendants. */
  componentSize: 'sm' | 'md' | 'lg';
  /** Live `prefers-reduced-motion` state. */
  reducedMotion: boolean;
}

/** The value provided by NectarProvider. */
export interface NectarContextValue {
  /** The global interaction signal bus (ADR 0028 Layer 1). */
  bus: SignalBus;
  /** Depth (light <-> dark) controls (ADR 0028 Layer 2). */
  depth: DepthControls;
  /** Root config. */
  config: NectarConfig;
}

export const NectarContext = createContext<NectarContextValue | null>(null);

/** Read the Nectar root context. Throws if used outside <NectarProvider>. */
export function useNectar(): NectarContextValue {
  const ctx = useContext(NectarContext);
  if (!ctx) {
    throw new Error('useNectar must be used within <NectarProvider>');
  }
  return ctx;
}

/**
 * Read the Nectar root context, or `null` if no provider is mounted. For
 * surfaces that render both inside the app (provider present) and in isolation
 * (Storybook, tests) — e.g. NavPill — so they can prefer the engine when it's
 * there and fall back gracefully when it isn't.
 */
export function useNectarOptional(): NectarContextValue | null {
  return useContext(NectarContext);
}
