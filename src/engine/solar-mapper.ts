/**
 * Solar Mapper — converts (time, latitude, longitude) to CircadianState.
 *
 * Uses SunCalc for solar position, then derives:
 * - Color temperature (Kelvin) from atmospheric path length
 * - Light intensity from solar elevation
 * - Vision regime from intensity thresholds
 * - Base oklch color from blackbody radiation via chroma-js
 */

import chroma from 'chroma-js';
import SunCalc from 'suncalc';

import type { CircadianConfig, CircadianState, SolarPhase, VisionRegime } from './types';
import { DEFAULT_CONFIG } from './types';

/**
 * Map solar elevation (radians) to color temperature (Kelvin).
 * Based on atmospheric Rayleigh scattering path length.
 */
function elevationToKelvin(elevation: number, kelvinOffset: number): number {
  const degrees = (elevation * 180) / Math.PI;

  let kelvin: number;
  if (degrees >= 60) kelvin = 6500;
  else if (degrees >= 45) kelvin = 5500 + ((degrees - 45) / 15) * 1000;
  else if (degrees >= 15) kelvin = 4000 + ((degrees - 15) / 30) * 1500;
  else if (degrees >= 5) kelvin = 3000 + ((degrees - 5) / 10) * 1000;
  else if (degrees >= 0) kelvin = 2200 + (degrees / 5) * 800;
  else if (degrees >= -6) kelvin = 1800 + ((degrees + 6) / 6) * 400;
  else kelvin = 1200 + Math.max(0, (degrees + 18) / 12) * 600;

  return Math.max(1200, Math.min(6500, kelvin + kelvinOffset));
}

/**
 * Map solar elevation to perceived light intensity (0–1).
 * Bell curve based on cosine of zenith angle with atmospheric extinction.
 */
function elevationToIntensity(elevation: number, exponent: number): number {
  const degrees = (elevation * 180) / Math.PI;

  if (degrees <= -6) return 0;
  if (degrees <= 0) return Math.pow((degrees + 6) / 6, 2) * 0.05;

  const zenithAngle = Math.PI / 2 - elevation;
  const raw = Math.cos(zenithAngle);
  return Math.pow(Math.max(0, raw), exponent);
}

/** Classify phase from elevation */
function elevationToPhase(elevation: number): SolarPhase {
  const degrees = (elevation * 180) / Math.PI;
  if (degrees < -6) return 'night';
  if (degrees < 0) return 'twilight';
  if (degrees < 15) return 'golden';
  return 'day';
}

/** Classify vision regime from intensity */
function intensityToRegime(intensity: number): VisionRegime {
  if (intensity > 0.3) return 'photopic';
  if (intensity > 0.01) return 'mesopic';
  return 'scotopic';
}

/**
 * Convert Kelvin color temperature to oklch base color.
 * Uses chroma-js temperature() for Planckian locus mapping.
 */
function kelvinToBaseColor(
  kelvin: number,
  intensity: number,
  chromaMultiplier: number,
  minimumChroma: number,
): { l: number; c: number; h: number } {
  const rgb = chroma.temperature(kelvin);
  const [l, c, h] = rgb.oklch();

  // Lightness driven by intensity curve
  const adjustedL = 0.1 + intensity * 0.8;

  // Chroma: low at night (desaturated), peaks at golden hour
  const adjustedC = Math.max(minimumChroma, c * chromaMultiplier * (0.2 + intensity * 0.8));

  return { l: adjustedL, c: adjustedC, h: h || 0 };
}

/**
 * Compute CircadianState from time and location.
 *
 * @param config - Engine configuration (lat, lng, tuning params)
 * @param date - Optional date override for testing (defaults to now)
 */
export function getCircadianState(
  config: CircadianConfig,
  date?: Date,
): CircadianState {
  const now = date ?? new Date();
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const sunPos = SunCalc.getPosition(now, cfg.latitude, cfg.longitude);
  const elevation = sunPos.altitude;
  const azimuth = sunPos.azimuth;

  const kelvin = elevationToKelvin(elevation, cfg.kelvinOffset);
  const intensity = elevationToIntensity(elevation, cfg.intensityCurveExponent);
  const phase = elevationToPhase(elevation);
  const visionRegime = intensityToRegime(intensity);
  const baseColor = kelvinToBaseColor(
    kelvin,
    intensity,
    cfg.chromaMultiplier,
    cfg.minimumChroma,
  );

  return {
    kelvin,
    intensity,
    elevation,
    azimuth,
    phase,
    visionRegime,
    baseColor,
  };
}
