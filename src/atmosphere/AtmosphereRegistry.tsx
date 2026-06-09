'use client';

/**
 * AtmosphereRegistry (ADR 0026 — Branded House with sub-brands)
 *
 * Sub-brands declare an `atmosphere.preset` (orbs | heat | birds | ink-route |
 * none). The actual atmosphere components live in the consuming app
 * (app/components/AtmosphereOrbs, HeatLayer, BirdFlock, InkRouteController),
 * NOT in nectar-design — so nd must not import them. Instead the app registers
 * its atmosphere components once at the root via AtmosphereRegistryProvider, and
 * SubBrandProvider's internal <AtmosphereSlot> looks up the right one by preset.
 *
 * This inverts the dependency: nd defines the contract (preset names), the app
 * supplies the implementations. No nd → app coupling.
 */

import { createContext, useContext, type ComponentType, type ReactNode } from 'react';

import type { AtmospherePreset } from '../sub-brands.generated';

export type AtmosphereComponents = Partial<Record<AtmospherePreset, ComponentType>>;

const AtmosphereRegistryContext = createContext<AtmosphereComponents>({});

export interface AtmosphereRegistryProviderProps {
  /** Map of preset name → component. Omit a preset to render nothing for it. */
  components: AtmosphereComponents;
  children: ReactNode;
}

/**
 * Register the app's atmosphere components once, near the root layout.
 *
 * @example
 * ```tsx
 * <AtmosphereRegistryProvider components={{ orbs: AtmosphereOrbs, heat: HeatLayer }}>
 *   <SubBrandProvider name="portfolio">{children}</SubBrandProvider>
 * </AtmosphereRegistryProvider>
 * ```
 */
export function AtmosphereRegistryProvider({
  components,
  children,
}: AtmosphereRegistryProviderProps) {
  return (
    <AtmosphereRegistryContext.Provider value={components}>
      {children}
    </AtmosphereRegistryContext.Provider>
  );
}

/** Resolve the component registered for a preset, or null if none / `'none'`. */
export function useAtmosphereComponent(preset: AtmospherePreset): ComponentType | null {
  const registry = useContext(AtmosphereRegistryContext);
  if (preset === 'none') return null;
  return registry[preset] ?? null;
}
