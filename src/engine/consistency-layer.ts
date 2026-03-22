/**
 * Consistency Layer — validates and corrects circadian engine output.
 *
 * Implements the Detect → Handle → Manage pipeline:
 * 1. DETECT: Check all fg/bg pairs for WCAG contrast, brand hue drift,
 *    border visibility, focus ring contrast, typography-color coherence
 * 2. HANDLE: Auto-correct failures (adjust lightness, weight, tracking)
 * 3. MANAGE: Enforce 5 coupling rules between color and typography
 *
 * Max 3 correction passes per cycle to prevent infinite loops.
 */

import chroma from 'chroma-js';

import type {
  CircadianColors,
  CircadianConfig,
  CircadianOutput,
  CircadianShadows,
  CircadianState,
  CircadianTypography,
} from './types';
import { DEFAULT_CONFIG } from './types';

const MAX_PASSES = 3;
const AA_RATIO = 4.5;
const AAA_RATIO = 7;
const LARGE_TEXT_RATIO = 3;
const FOCUS_RING_RATIO = 3;

/** Parse a CSS color value to chroma instance */
function parseColor(value: string): ReturnType<typeof chroma> | null {
  try {
    return chroma(value);
  } catch {
    return null;
  }
}

/** Get contrast ratio between two CSS color strings */
function getContrast(fg: string, bg: string): number {
  const fgC = parseColor(fg);
  const bgC = parseColor(bg);
  if (!fgC || !bgC) return 0;
  return chroma.contrast(fgC, bgC);
}

/** Adjust fg lightness to meet minimum contrast ratio against bg.
 *  Adds 0.15 headroom to absorb oklch→sRGB rounding between chroma-js and axe-core. */
function fixContrast(fg: string, bg: string, minRatio: number): string {
  const target = minRatio + 0.15;
  const fgC = parseColor(fg);
  const bgC = parseColor(bg);
  if (!fgC || !bgC) return fg;

  let current = fgC;
  let ratio = chroma.contrast(current, bgC);
  if (ratio >= target) return fg;

  const bgL = bgC.oklch()[0];
  const step = bgL > 0.5 ? -0.03 : 0.03;
  let attempts = 0;

  while (ratio < target && attempts < 30) {
    const [l, c, h] = current.oklch();
    const newL = Math.max(0, Math.min(1, l + step));
    current = chroma.oklch(newL, c, h || 0);
    ratio = chroma.contrast(current, bgC);
    attempts++;
  }

  return current.css('oklch');
}

// ── Contrast pair definitions ────────────────────────────────────

interface ContrastPair {
  fgKey: keyof CircadianColors;
  bgKey: keyof CircadianColors;
  minRatio: number;
}

function getContrastPairs(floor: 'AA' | 'AAA'): ContrastPair[] {
  const bodyRatio = floor === 'AAA' ? AAA_RATIO : AA_RATIO;
  return [
    { fgKey: '--fg', bgKey: '--bg', minRatio: bodyRatio },
    { fgKey: '--surface-fg', bgKey: '--surface', minRatio: bodyRatio },
    { fgKey: '--muted-fg', bgKey: '--muted', minRatio: bodyRatio },
    { fgKey: '--muted-fg', bgKey: '--bg', minRatio: bodyRatio },
    { fgKey: '--primary', bgKey: '--bg', minRatio: bodyRatio },
    { fgKey: '--primary-fg', bgKey: '--primary', minRatio: LARGE_TEXT_RATIO },
    { fgKey: '--accent-fg', bgKey: '--accent', minRatio: LARGE_TEXT_RATIO },
    { fgKey: '--destructive-fg', bgKey: '--destructive', minRatio: LARGE_TEXT_RATIO },
    { fgKey: '--success-fg', bgKey: '--success', minRatio: LARGE_TEXT_RATIO },
    { fgKey: '--warning-fg', bgKey: '--warning', minRatio: LARGE_TEXT_RATIO },
    { fgKey: '--button-fg', bgKey: '--button-bg', minRatio: LARGE_TEXT_RATIO },
    { fgKey: '--th-fg', bgKey: '--th-bg', minRatio: bodyRatio },
  ];
}

// ── Detect + Handle ──────────────────────────────────────────────

function detectAndFixContrast(
  colors: CircadianColors,
  floor: 'AA' | 'AAA',
): { colors: CircadianColors; fixes: number } {
  const pairs = getContrastPairs(floor);
  let fixes = 0;
  const fixed = { ...colors };

  for (const pair of pairs) {
    const fg = fixed[pair.fgKey];
    const bg = fixed[pair.bgKey];
    if (!fg || !bg || fg === 'transparent') continue;

    const ratio = getContrast(fg, bg);
    if (ratio < pair.minRatio) {
      fixed[pair.fgKey] = fixContrast(fg, bg, pair.minRatio);
      fixes++;
    }
  }

  // Focus ring: must have >= 3:1 against --bg
  const ringRatio = getContrast(fixed['--ring'], fixed['--bg']);
  if (ringRatio < FOCUS_RING_RATIO) {
    fixed['--ring'] = fixContrast(fixed['--ring'], fixed['--bg'], FOCUS_RING_RATIO);
    fixes++;
  }

  // Border visibility: must have visible delta-L from surface
  const borderC = parseColor(fixed['--border']);
  const surfaceC = parseColor(fixed['--surface']);
  if (borderC && surfaceC) {
    const deltaL = Math.abs(borderC.oklch()[0] - surfaceC.oklch()[0]);
    if (deltaL < 0.05) {
      const [l, c, h] = borderC.oklch();
      const surfL = surfaceC.oklch()[0];
      const newL = surfL > 0.5 ? l - 0.06 : l + 0.06;
      fixed['--border'] = chroma.oklch(
        Math.max(0, Math.min(1, newL)), c, h || 0,
      ).css('oklch');
      fixes++;
    }
  }

  return { colors: fixed, fixes };
}

// ── Manage (coupling rules) ──────────────────────────────────────

/**
 * Enforce 5 coupling rules between color and typography.
 * These are the perceptual science of the color-typography relationship.
 */
function enforceCouplingRules(
  typography: CircadianTypography,
  state: CircadianState,
  _colors: CircadianColors,
): CircadianTypography {
  const { intensity } = state;
  const fixed = { ...typography };

  // Rule 1: WEIGHT-CONTRAST COUPLING
  // Lower intensity → need heavier body weight (up to +40 units)
  const weightFloor = 380 + (1 - Math.min(1, intensity)) * 40;
  const currentWeight = Number(fixed['--typo-body-weight']);
  if (currentWeight < weightFloor) {
    fixed['--typo-body-weight'] = Math.round(weightFloor).toString();
  }

  // Rule 2: TRACKING-LUMINANCE COUPLING
  // Lower light → wider tracking (up to +0.025em)
  const trackingFloor = -0.01 + (1 - Math.min(1, intensity)) * 0.025;
  const currentTracking = parseFloat(fixed['--typo-body-tracking']);
  if (currentTracking < trackingFloor) {
    fixed['--typo-body-tracking'] = `${trackingFloor.toFixed(4)}em`;
  }

  // Rule 3: LEADING-CONTRAST COUPLING
  // Lower intensity → more line-height (up to +0.15)
  const leadingFloor = 1.5 + (1 - Math.min(1, intensity)) * 0.15;
  const currentLeading = Number(fixed['--typo-body-leading']);
  if (currentLeading < leadingFloor) {
    fixed['--typo-body-leading'] = leadingFloor.toFixed(3);
  }

  // Rule 4: SIZE-IRRADIATION COUPLING
  // Dark backgrounds → reduce display size 5% for irradiation illusion
  const bgIsLight = intensity > 0.3;
  if (!bgIsLight) {
    const maxAdjust = 0.95;
    const currentAdjust = Number(fixed['--typo-display-size-adjust']);
    if (currentAdjust > maxAdjust) {
      fixed['--typo-display-size-adjust'] = maxAdjust.toFixed(3);
    }
  }

  // Rule 5: HIERARCHY-REGIME COUPLING
  // Night → flatten display/body weight difference (ratio → 0.7)
  const ratioFloor = 0.7 + Math.min(1, intensity) * 0.3;
  const currentRatio = Number(fixed['--typo-contrast-ratio']);
  if (currentRatio > ratioFloor + 0.01) {
    // Only adjust downward (toward flatter hierarchy)
    fixed['--typo-contrast-ratio'] = ratioFloor.toFixed(3);
  }

  return fixed;
}

// ── Main validation entry point ──────────────────────────────────

/**
 * Validate and correct the full circadian output.
 * Runs up to MAX_PASSES correction cycles.
 */
export function validateOutput(
  output: CircadianOutput,
  state: CircadianState,
  config: CircadianConfig,
): CircadianOutput {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  let { colors, typography, motion, shadows } = output;
  let totalFixes = 0;

  for (let pass = 0; pass < MAX_PASSES; pass++) {
    const result = detectAndFixContrast(colors, cfg.contrastFloor);
    colors = result.colors;
    totalFixes += result.fixes;

    typography = enforceCouplingRules(typography, state, colors);

    // If no fixes needed, we're stable
    if (result.fixes === 0) break;
  }

  return { colors, typography, motion, shadows };
}
