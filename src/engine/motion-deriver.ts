/**
 * Motion Deriver — adapts 3 animation CSS variables from CircadianState.
 *
 * Based on chronobiology: human reaction time slows at night,
 * and aggressive motion is more disruptive in low-light conditions.
 *
 * - Daytime (photopic): full animation intensity, standard durations
 * - Evening (mesopic): 15% slower, 10% reduced easing intensity
 * - Night (scotopic): 25% slower, 20% reduced intensity (calmer)
 *
 * The --motion-reduced variable is an override for prefers-reduced-motion.
 */

import type { CircadianMotion, CircadianState } from './types';

/**
 * Derive 3 motion CSS variables from circadian state.
 *
 * @param state - Current circadian state
 * @param motionAdaptation - Whether circadian motion scaling is enabled
 */
export function deriveMotion(
  state: CircadianState,
  motionAdaptation: boolean,
): CircadianMotion {
  if (!motionAdaptation) {
    return {
      '--motion-duration-scale': '1',
      '--motion-intensity-scale': '1',
      '--motion-reduced': '0',
    };
  }

  const { intensity } = state;

  // Duration scale: 1.0 at full daylight → 1.25 at night
  // Inverse relationship with intensity (lower light = slower animations)
  const durationScale = 1 + (1 - Math.min(1, intensity / 0.8)) * 0.25;

  // Intensity scale: 1.0 at full daylight → 0.8 at night
  // Reduces bounce, overshoot, and easing aggressiveness
  const intensityScale = 0.8 + Math.min(1, intensity / 0.8) * 0.2;

  return {
    '--motion-duration-scale': durationScale.toFixed(3),
    '--motion-intensity-scale': intensityScale.toFixed(3),
    '--motion-reduced': '0',
  };
}
