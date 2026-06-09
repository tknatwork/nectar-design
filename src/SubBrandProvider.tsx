'use client';

/**
 * SubBrandProvider (ADR 0026 — Branded House with sub-brands)
 *
 * Activates a sub-brand for everything inside it:
 *   1. Adds `class="sub-brand-{name}"` + `data-sub-brand` to a wrapper, which
 *      switches on the CSS-var overrides emitted in sub-brands.css.
 *   2. Provides the sub-brand's runtime info (atmosphere, hero, tagline,
 *      assets) via context to descendant hooks.
 *   3. Force-mounts the sub-brand's atmosphere component (resolved from the
 *      AtmosphereRegistry the app registered at root).
 *
 * Nesting works: an inner SubBrandProvider wins both for context (nearest
 * provider) and for CSS (inner wrapper class has equal specificity but later
 * cascade position). The master brand is simply the absence of any provider —
 * hooks fall back to MASTER_DEFAULTS.
 *
 * @example
 * ```tsx
 * // app/projects/ambiguity/layout.tsx
 * <SubBrandProvider name="ambiguity">{children}</SubBrandProvider>
 * ```
 */

import { createContext, useContext, type ReactNode } from 'react';

import { useAtmosphereComponent } from './atmosphere/AtmosphereRegistry';
import {
  MASTER_DEFAULTS,
  SUB_BRANDS,
  type AtmospherePreset,
  type HeroComposition,
  type SubBrandRecord,
} from './sub-brands.generated';

const SubBrandContext = createContext<SubBrandRecord | null>(null);

export interface SubBrandProviderProps {
  /** Sub-brand slug. Must exist in tokens/sub-brands/ (see SUB_BRANDS). */
  name: string;
  children: ReactNode;
  /**
   * Render the sub-brand's atmosphere component. Default true. Set false on a
   * route that supplies its own atmosphere or wants none (overrides the
   * force-mount default per ADR 0026's "force-mount with route escape hatch").
   */
  withAtmosphere?: boolean;
}

export function SubBrandProvider({
  name,
  children,
  withAtmosphere = true,
}: SubBrandProviderProps) {
  const record = SUB_BRANDS[name];
  if (!record) {
    const known = Object.keys(SUB_BRANDS).join(', ') || '(none registered)';
    throw new Error(
      `SubBrandProvider: unknown sub-brand "${name}". ` +
        `Add tokens/sub-brands/${name}.json and rebuild. Known: ${known}.`,
    );
  }

  return (
    <SubBrandContext.Provider value={record}>
      <div data-sub-brand={record.name} className={`sub-brand-${record.name}`}>
        {withAtmosphere && <AtmosphereSlot preset={record.atmosphere} />}
        {children}
      </div>
    </SubBrandContext.Provider>
  );
}

/** Internal: force-mounts the atmosphere component for a preset, if registered. */
function AtmosphereSlot({ preset }: { preset: AtmospherePreset }) {
  const Component = useAtmosphereComponent(preset);
  return Component ? <Component /> : null;
}

// ── Hooks ──────────────────────────────────────────────────────────────────────

/** The active sub-brand record, or null when under the master brand. */
export function useSubBrand(): SubBrandRecord | null {
  return useContext(SubBrandContext);
}

/** Active atmosphere preset (falls back to the master default). */
export function useAtmospherePreset(): AtmospherePreset {
  return useSubBrand()?.atmosphere ?? MASTER_DEFAULTS.atmosphere;
}

/** Active hero composition (falls back to the master default). */
export function useHeroComposition(): HeroComposition {
  return useSubBrand()?.hero ?? MASTER_DEFAULTS.hero;
}

/** Active sub-brand tagline for OG/metadata (master default when unbranded). */
export function useTagline(): string | null {
  return useSubBrand()?.tagline ?? MASTER_DEFAULTS.tagline;
}
