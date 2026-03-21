/**
 * Type definitions for the Biomimetic Adaptive Theme System.
 *
 * The engine pipeline: (time, lat, lng) → CircadianState → derivers → CircadianOutput → CSS vars
 */

// ── Vision Regimes ──────────────────────────────────────────────

/** Human visual system state based on ambient luminance */
export type VisionRegime = 'photopic' | 'mesopic' | 'scotopic';

/** Solar phase derived from elevation angle */
export type SolarPhase = 'night' | 'twilight' | 'golden' | 'day';

// ── Circadian State (computed from solar position) ──────────────

export interface CircadianState {
  /** Color temperature in Kelvin (1200–6500) */
  kelvin: number;
  /** Perceived light intensity (0–1) */
  intensity: number;
  /** Solar elevation in radians (-π/2 to +π/2) */
  elevation: number;
  /** Solar azimuth in radians */
  azimuth: number;
  /** Discrete phase label */
  phase: SolarPhase;
  /** Human visual system regime */
  visionRegime: VisionRegime;
  /** Base color in oklch derived from blackbody radiation */
  baseColor: { l: number; c: number; h: number };
}

// ── Circadian Config (consumer-provided) ────────────────────────

export interface CircadianConfig {
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;

  /** Brand hue in degrees (from seed tokens) */
  brandHue?: number;
  /** Max hue drift from brand (default: 15°) */
  brandHueLockRange?: number;
  /** Minimum chroma at night (default: 0.01) */
  minimumChroma?: number;

  /** Minimum WCAG contrast level (default: 'AA') */
  contrastFloor?: 'AA' | 'AAA';

  /** Shift entire Kelvin curve warmer/cooler (default: 0) */
  kelvinOffset?: number;
  /** Global chroma multiplier (default: 1.0) */
  chromaMultiplier?: number;
  /** Steepen/flatten intensity bell curve (default: 1.0) */
  intensityCurveExponent?: number;

  /** Enable circadian motion scaling (default: true) */
  motionAdaptation?: boolean;

  /** Update interval in ms (default: 60000 = 1 minute) */
  updateIntervalMs?: number;
}

// ── Circadian Output (injected as CSS vars) ─────────────────────

export interface CircadianColors {
  '--bg': string;
  '--fg': string;
  '--surface': string;
  '--surface-fg': string;
  '--muted': string;
  '--muted-fg': string;
  '--primary': string;
  '--primary-fg': string;
  '--accent': string;
  '--accent-fg': string;
  '--destructive': string;
  '--destructive-fg': string;
  '--success': string;
  '--success-fg': string;
  '--warning': string;
  '--warning-fg': string;
  '--border': string;
  '--input': string;
  '--ring': string;
  '--shadow-color': string;
  '--button-bg': string;
  '--button-fg': string;
  '--button-border': string;
  '--outline-bg': string;
  '--outline-fg': string;
  '--outline-border': string;
  '--th-bg': string;
  '--th-fg': string;
  '--badge-fg': string;
  '--toggle-track': string;
  '--toggle-thumb': string;
  '--card-primary-bg': string;
  '--card-accent-bg': string;
}

export interface CircadianTypography {
  '--typo-body-weight': string;
  '--typo-display-weight': string;
  '--typo-body-tracking': string;
  '--typo-display-tracking': string;
  '--typo-body-leading': string;
  '--typo-display-leading': string;
  '--typo-body-size-adjust': string;
  '--typo-display-size-adjust': string;
  '--typo-optical-size': string;
  '--typo-contrast-ratio': string;
}

export interface CircadianMotion {
  '--motion-duration-scale': string;
  '--motion-intensity-scale': string;
  '--motion-reduced': string;
}

export interface CircadianShadows {
  '--shadow-ambient-opacity': string;
  '--shadow-color-temperature': string;
  '--shadow-spread-scale': string;
}

export interface CircadianOutput {
  colors: CircadianColors;
  typography: CircadianTypography;
  motion: CircadianMotion;
  shadows: CircadianShadows;
}

/** Flat map of all 49 CSS variables for injection */
export type CircadianVarMap = CircadianColors &
  CircadianTypography &
  CircadianMotion &
  CircadianShadows;

// ── Defaults ────────────────────────────────────────────────────

export const DEFAULT_CONFIG: Required<CircadianConfig> = {
  latitude: 40,
  longitude: -74,
  brandHue: 45,
  brandHueLockRange: 15,
  minimumChroma: 0.01,
  contrastFloor: 'AA',
  kelvinOffset: 0,
  chromaMultiplier: 1.0,
  intensityCurveExponent: 1.0,
  motionAdaptation: true,
  updateIntervalMs: 60_000,
};
