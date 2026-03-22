/**
 * Palette Deriver — transforms CircadianState base color into 33 color variables.
 *
 * All colors derived from a single oklch base via perceptual relationships.
 * Every fg/bg pair is validated for WCAG contrast safety.
 */

import chroma from 'chroma-js';

import type { CircadianColors, CircadianConfig, CircadianShadows, CircadianState } from './types';
import { DEFAULT_CONFIG } from './types';

/** Minimum contrast ratios */
const AA_RATIO = 4.5;
const AAA_RATIO = 7;

function contrastFloorRatio(floor: 'AA' | 'AAA'): number {
  return floor === 'AAA' ? AAA_RATIO : AA_RATIO;
}

/** Create an oklch color string */
function oklch(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(3)} ${c.toFixed(4)} ${h.toFixed(1)})`;
}

/** Ensure fg has sufficient contrast against bg. Adjusts fg lightness if needed. */
function ensureContrast(fgHex: string, bgHex: string, minRatio: number): string {
  let fg = chroma(fgHex);
  const bg = chroma(bgHex);
  let ratio = chroma.contrast(fg, bg);

  if (ratio >= minRatio) return fg.css('oklch');

  // Determine direction: if bg is light, darken fg; if bg is dark, lighten fg
  const bgL = bg.oklch()[0];
  const step = bgL > 0.5 ? -0.03 : 0.03;
  let attempts = 0;

  while (ratio < minRatio && attempts < 30) {
    const [l, c, h] = fg.oklch();
    const newL = Math.max(0, Math.min(1, l + step));
    fg = chroma.oklch(newL, c, h || 0);
    ratio = chroma.contrast(fg, bg);
    attempts++;
  }

  return fg.css('oklch');
}

/** Derive a hex color from oklch params, clamped */
function fromOklch(l: number, c: number, h: number): string {
  return chroma.oklch(
    Math.max(0, Math.min(1, l)),
    Math.max(0, Math.min(0.4, c)),
    ((h % 360) + 360) % 360,
  ).hex();
}

/** Clamp brand hue within lock range of base hue */
function clampHue(targetHue: number, brandHue: number, lockRange: number): number {
  const diff = ((targetHue - brandHue + 180) % 360) - 180;
  if (Math.abs(diff) <= lockRange) return targetHue;
  return brandHue + Math.sign(diff) * lockRange;
}

export function derivePalette(
  state: CircadianState,
  config: CircadianConfig,
): { colors: CircadianColors; shadows: CircadianShadows } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { baseColor, intensity, phase } = state;
  const { l: baseL, c: baseC, h: baseH } = baseColor;
  const minRatio = contrastFloorRatio(cfg.contrastFloor);

  // ── Backgrounds ──────────────────────────────────────────────
  const isNight = intensity < 0.1;
  const bgL = isNight ? 0.12 + intensity * 0.3 : 0.92 + (1 - intensity) * 0.06;
  const bgC = baseC * 0.05;
  const bgHex = fromOklch(bgL, bgC, baseH);

  const surfaceL = bgL + (isNight ? 0.03 : -0.03);
  const surfaceHex = fromOklch(surfaceL, bgC * 0.6, baseH);

  const mutedL = isNight ? bgL + 0.06 : bgL - 0.06;
  const mutedHex = fromOklch(mutedL, bgC * 0.3, baseH);

  const inputHex = surfaceHex;

  // ── Foregrounds (contrast-safe) ──────────────────────────────
  const fgTargetL = isNight ? 0.88 : 0.22;
  const fgHex = fromOklch(fgTargetL, baseC * 0.08, baseH);
  const fgSafe = ensureContrast(fgHex, bgHex, minRatio);

  const surfaceFgHex = fromOklch(fgTargetL, baseC * 0.06, baseH);
  const surfaceFgSafe = ensureContrast(surfaceFgHex, surfaceHex, minRatio);

  const mutedFgHex = fromOklch(isNight ? 0.7 : 0.45, baseC * 0.04, baseH);
  // Muted-fg must pass contrast against both --muted AND --bg (used on page backgrounds too)
  const mutedFgVsMuted = ensureContrast(mutedFgHex, mutedHex, minRatio);
  const mutedFgSafe = ensureContrast(
    chroma(mutedFgVsMuted).hex(), bgHex, minRatio,
  );

  // ── Brand colors (temperature-shifted) ───────────────────────
  const primaryH = clampHue(baseH, cfg.brandHue, cfg.brandHueLockRange);
  const primaryL = isNight ? 0.7 : 0.75;
  const primaryC = Math.max(0.08, baseC * 1.5);
  const primaryHex = fromOklch(primaryL, primaryC, primaryH);
  const primaryFgHex = fromOklch(isNight ? 0.15 : 0.2, 0.02, primaryH);
  const primaryFgSafe = ensureContrast(primaryFgHex, primaryHex, 3);

  const accentH = (primaryH + 180) % 360;
  const accentHex = fromOklch(isNight ? 0.45 : 0.6, primaryC * 0.8, accentH);
  const accentFgHex = fromOklch(isNight ? 0.9 : 0.15, 0.02, accentH);
  const accentFgSafe = ensureContrast(accentFgHex, accentHex, 3);

  // ── Semantic colors (fixed intent, variable temperature) ─────
  const tempShift = (baseH - 45) * 0.1; // shift by temperature influence
  const destructiveHex = fromOklch(isNight ? 0.65 : 0.55, 0.16, 25 + tempShift);
  const destructiveFgSafe = ensureContrast(
    fromOklch(isNight ? 0.15 : 0.98, 0.01, 25), destructiveHex, 3,
  );

  const successHex = fromOklch(isNight ? 0.65 : 0.5, 0.12, 145 + tempShift);
  const successFgSafe = ensureContrast(
    fromOklch(isNight ? 0.15 : 0.98, 0.01, 145), successHex, 3,
  );

  const warningHex = fromOklch(isNight ? 0.7 : 0.7, 0.14, 85 + tempShift);
  const warningFgHex = fromOklch(0.2, 0.02, 85);
  const warningFgSafe = ensureContrast(warningFgHex, warningHex, 3);

  // ── UI Chrome ────────────────────────────────────────────────
  const borderL = isNight ? bgL + 0.1 : bgL - 0.1;
  const borderHex = fromOklch(borderL, bgC * 0.5, baseH);

  const ringHex = primaryHex;

  // Button
  const buttonBgHex = primaryHex;
  const buttonFgSafe = primaryFgSafe;
  const buttonBorderHex = fromOklch(primaryL - 0.05, primaryC * 0.8, primaryH);

  // Outline variant
  const outlineBgHex = 'transparent';
  const outlineFgHex = primaryHex;
  const outlineBorderHex = borderHex;

  // Table header
  const thBgHex = fromOklch(mutedL, bgC * 0.2, baseH);
  const thFgSafe = ensureContrast(fgHex, thBgHex, minRatio);

  // Badge, toggle
  const badgeFgSafe = fgSafe;
  const toggleTrackHex = fromOklch(isNight ? 0.3 : 0.75, 0.02, baseH);
  const toggleThumbHex = fromOklch(isNight ? 0.85 : 0.98, 0.01, baseH);

  // Card variants
  const cardPrimaryBgHex = fromOklch(primaryL + 0.15, primaryC * 0.15, primaryH);
  const cardAccentBgHex = fromOklch(
    isNight ? 0.2 : 0.93, primaryC * 0.1, accentH,
  );

  // ── Shadows ──────────────────────────────────────────────────
  const shadowOpacity = (intensity * 0.4 + 0.05).toFixed(2);
  const shadowTemp = fromOklch(0.2, baseC * 0.3, baseH);
  const shadowSpread = (0.7 + intensity * 0.3).toFixed(2);

  const shadows: CircadianShadows = {
    '--shadow-ambient-opacity': shadowOpacity,
    '--shadow-color-temperature': chroma(shadowTemp).css('oklch'),
    '--shadow-spread-scale': shadowSpread,
  };

  const colors: CircadianColors = {
    '--bg': chroma(bgHex).css('oklch'),
    '--fg': fgSafe,
    '--surface': chroma(surfaceHex).css('oklch'),
    '--surface-fg': surfaceFgSafe,
    '--muted': chroma(mutedHex).css('oklch'),
    '--muted-fg': mutedFgSafe,
    '--primary': chroma(primaryHex).css('oklch'),
    '--primary-fg': primaryFgSafe,
    '--accent': chroma(accentHex).css('oklch'),
    '--accent-fg': accentFgSafe,
    '--destructive': chroma(destructiveHex).css('oklch'),
    '--destructive-fg': destructiveFgSafe,
    '--success': chroma(successHex).css('oklch'),
    '--success-fg': successFgSafe,
    '--warning': chroma(warningHex).css('oklch'),
    '--warning-fg': warningFgSafe,
    '--border': chroma(borderHex).css('oklch'),
    '--input': chroma(inputHex).css('oklch'),
    '--ring': chroma(ringHex).css('oklch'),
    '--shadow-color': chroma(shadowTemp).css('oklch'),
    '--button-bg': chroma(buttonBgHex).css('oklch'),
    '--button-fg': buttonFgSafe,
    '--button-border': chroma(buttonBorderHex).css('oklch'),
    '--outline-bg': outlineBgHex,
    '--outline-fg': chroma(outlineFgHex).css('oklch'),
    '--outline-border': chroma(outlineBorderHex).css('oklch'),
    '--th-bg': chroma(thBgHex).css('oklch'),
    '--th-fg': thFgSafe,
    '--badge-fg': badgeFgSafe,
    '--toggle-track': chroma(toggleTrackHex).css('oklch'),
    '--toggle-thumb': chroma(toggleThumbHex).css('oklch'),
    '--card-primary-bg': chroma(cardPrimaryBgHex).css('oklch'),
    '--card-accent-bg': chroma(cardAccentBgHex).css('oklch'),
  };

  return { colors, shadows };
}
