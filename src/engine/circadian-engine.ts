/**
 * Circadian Engine — core orchestrator for the Biomimetic Adaptive Theme.
 *
 * Pipeline: (time, lat, lng) → solar position → CircadianState
 *   → palette (33 colors + 3 shadows)
 *   → typography (10 vars)
 *   → motion (3 vars)
 *   → consistency validation
 *   → 49 CSS variables
 *
 * This is the single entry point for computing a complete theme snapshot.
 */

import type {
  CircadianConfig,
  CircadianOutput,
  CircadianState,
  CircadianVarMap,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { validateOutput } from './consistency-layer';
import { deriveMotion } from './motion-deriver';
import { derivePalette } from './palette-deriver';
import { getCircadianState } from './solar-mapper';
import { deriveTypography } from './typography-deriver';

/**
 * Compute a complete circadian theme from time and location.
 *
 * @param config - Engine configuration (lat, lng, tuning params)
 * @param date - Optional date override for testing (defaults to now)
 * @returns Validated CircadianOutput with all 49 CSS variables
 */
export function computeTheme(
  config: CircadianConfig,
  date?: Date,
): CircadianOutput {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Step 1: Solar position → CircadianState
  const state = getCircadianState(cfg, date);

  // Step 2: Derive all variable groups in parallel
  const { colors, shadows } = derivePalette(state, cfg);
  const typography = deriveTypography(state);
  const motion = deriveMotion(state, cfg.motionAdaptation ?? true);

  // Step 3: Validate and correct (max 3 passes)
  const output: CircadianOutput = { colors, typography, motion, shadows };
  return validateOutput(output, state, cfg);
}

/**
 * Compute a complete theme and return as a flat CSS variable map.
 * Ready for direct injection via document.documentElement.style.setProperty().
 *
 * Note: Colors are excluded — the Heat Engine now owns color via --dynamic-hue.
 * Circadian retains: typography (10 vars), motion (3 vars), shadows (3 vars).
 */
export function computeThemeVars(
  config: CircadianConfig,
  date?: Date,
): CircadianVarMap {
  const output = computeTheme(config, date);
  return {
    // Colors intentionally omitted — Heat Engine owns color via --ui-heat → --dynamic-hue
    ...output.typography,
    ...output.motion,
    ...output.shadows,
  };
}

/**
 * Get the current CircadianState without computing the full theme.
 * Useful for debugging, Storybook controls, and conditional logic.
 */
export function getState(
  config: CircadianConfig,
  date?: Date,
): CircadianState {
  return getCircadianState({ ...DEFAULT_CONFIG, ...config }, date);
}

// Re-export types for consumer convenience
export type {
  CircadianConfig,
  CircadianOutput,
  CircadianState,
  CircadianVarMap,
} from './types';
export { DEFAULT_CONFIG } from './types';
