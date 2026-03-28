/**
 * Typography Deriver — adapts 10 typography CSS variables from CircadianState.
 *
 * Based on human visual system science:
 * - Photopic (>3 cd/m², cones): high acuity, fine weights, tight tracking
 * - Mesopic (0.01–3 cd/m², mixed): reduced acuity, medium weights
 * - Scotopic (<0.01 cd/m², rods): low acuity, heavy weights, wide tracking
 *
 * All parameters are continuous functions of intensity (0–1),
 * NOT discrete switches between regimes. Smooth interpolation
 * ensures typography transitions are as seamless as color transitions.
 */

import type { CircadianState, CircadianTypography } from './types';

// ── Regime boundaries ────────────────────────────────────────────

/** Smoothstep interpolation for perceptually smooth transitions */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Compute a continuous "regime blend" from intensity.
 *
 * Returns a value from 0 (scotopic) through 0.5 (mesopic) to 1 (photopic).
 * The smoothstep transitions avoid abrupt jumps at regime boundaries.
 */
function regimeBlend(intensity: number): number {
  // Scotopic → mesopic transition around 0.01
  const mesoFactor = smoothstep(0.005, 0.05, intensity);
  // Mesopic → photopic transition around 0.30
  const photoFactor = smoothstep(0.15, 0.45, intensity);
  return mesoFactor * 0.5 + photoFactor * 0.5;
}

// ── Interpolation helper ─────────────────────────────────────────

/** Linearly interpolate between scotopic and photopic values using regime blend */
function lerp(scotopicVal: number, photopicVal: number, blend: number): number {
  return scotopicVal + (photopicVal - scotopicVal) * blend;
}

// ── Derivation ───────────────────────────────────────────────────

/**
 * Derive 10 typography CSS variables from circadian state.
 *
 * Each parameter is a continuous function of light intensity,
 * grounded in visual neuroscience:
 *
 * - Body weight increases at low light (reduced contrast sensitivity → need heavier strokes)
 * - Display weight DECREASES at low light (irradiation illusion → light-on-dark bloats)
 * - Tracking widens at low light (reduced acuity → wider spacing aids letter discrimination)
 * - Leading increases at low light (line tracking harder with reduced acuity)
 * - Size adjust compensates for irradiation illusion on dark backgrounds
 * - Optical size forces larger rendering at night for thicker fine details
 * - Contrast ratio flattens hierarchy at night (display/body weight gap narrows)
 */
export function deriveTypography(state: CircadianState): CircadianTypography {
  const { intensity } = state;
  const blend = regimeBlend(intensity);

  // ── Body weight ──────────────────────────────────────────────
  // Scotopic: 420 (heavier strokes for reduced acuity)
  // Photopic: 380 (fine detail readable, lighter weight sufficient)
  const bodyWeight = lerp(420, 380, blend);

  // ── Display weight ───────────────────────────────────────────
  // Scotopic: 580 (LIGHTER — irradiation illusion makes light-on-dark
  //   text appear bolder than it is, so reduce actual weight)
  // Photopic: 700 (strong hierarchy in bright light)
  const displayWeight = lerp(580, 700, blend);

  // ── Body tracking (letter-spacing) ───────────────────────────
  // Scotopic: +0.015em (wider spacing aids letter discrimination)
  // Photopic: -0.01em (high acuity allows tight tracking)
  const bodyTracking = lerp(0.015, -0.01, blend);

  // ── Display tracking ─────────────────────────────────────────
  // Scotopic: -0.01em (large text less affected by acuity loss)
  // Photopic: -0.03em (tight display tracking in bright light)
  const displayTracking = lerp(-0.01, -0.03, blend);

  // ── Body leading (line-height) ───────────────────────────────
  // Scotopic: 1.65 (more vertical separation for line tracking)
  // Photopic: 1.5 (standard readable leading)
  const bodyLeading = lerp(1.65, 1.5, blend);

  // ── Display leading ──────────────────────────────────────────
  // Scotopic: 1.2 (same principle, proportionally less for large text)
  // Photopic: 1.1 (tight display leading)
  const displayLeading = lerp(1.2, 1.1, blend);

  // ── Body size adjust ─────────────────────────────────────────
  // Scotopic: 0.97 (irradiation: light-on-dark appears ~3-5% larger)
  // Photopic: 1.0 (no compensation needed on light backgrounds)
  const bodySizeAdjust = lerp(0.97, 1.0, blend);

  // ── Display size adjust ──────────────────────────────────────
  // Scotopic: 0.95 (larger text = more visible irradiation effect)
  // Photopic: 1.0 (no compensation)
  const displaySizeAdjust = lerp(0.95, 1.0, blend);

  // ── Optical size ─────────────────────────────────────────────
  // Scotopic: force 16 (larger optical rendering for thicker fine details)
  // Photopic: auto (browser default, natural optical sizing)
  // Transition: below mesopic threshold, force a value
  const opticalSize = intensity < 0.05 ? '16' : 'auto';

  // ── Contrast ratio (hierarchy flattening) ────────────────────
  // Scotopic: 0.7 (flatten display/body weight difference — subtle hierarchy)
  // Photopic: 1.0 (full hierarchy, strong display/body contrast)
  const contrastRatio = lerp(0.7, 1.0, blend);

  return {
    '--typo-body-weight': bodyWeight.toFixed(0),
    '--typo-display-weight': displayWeight.toFixed(0),
    '--typo-body-tracking': `${bodyTracking.toFixed(4)}em`,
    '--typo-display-tracking': `${displayTracking.toFixed(4)}em`,
    '--typo-body-leading': bodyLeading.toFixed(3),
    '--typo-display-leading': displayLeading.toFixed(3),
    '--typo-body-size-adjust': bodySizeAdjust.toFixed(3),
    '--typo-display-size-adjust': displaySizeAdjust.toFixed(3),
    '--typo-optical-size': opticalSize,
    '--typo-contrast-ratio': contrastRatio.toFixed(3),
  };
}
