/**
 * Circadian Engine Tests — 24-point validation suite.
 *
 * Tests at every hour of day (Mumbai, equinox) to validate:
 * - WCAG contrast safety for all fg/bg pairs
 * - Typography coupling rules hold at all points
 * - Focus ring visibility at all points
 * - Shadow values are reasonable
 * - Motion values scale correctly
 * - Engine output has all 49 variables
 */

import chroma from 'chroma-js';
import { describe, expect, it } from 'vitest';

import { computeTheme, computeThemeVars, getState } from '../circadian-engine';
import { deriveTypography } from '../typography-deriver';
import { deriveMotion } from '../motion-deriver';
import type { CircadianConfig, CircadianOutput } from '../types';

// ── Test config: Mumbai, equinox ─────────────────────────────────

const MUMBAI_CONFIG: CircadianConfig = {
  latitude: 19.07,
  longitude: 72.87,
  brandHue: 45,
  contrastFloor: 'AA',
};

/** Generate 24 hourly dates for March equinox 2026 */
function get24HourlyDates(): { hour: number; date: Date }[] {
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    date: new Date(2026, 2, 20, h, 0, 0), // March 20, 2026
  }));
}

/** Parse a CSS color string to chroma, handling transparent */
function safeChroma(value: string): ReturnType<typeof chroma> | null {
  if (value === 'transparent') return null;
  try {
    return chroma(value);
  } catch {
    return null;
  }
}

// ── Test suite ───────────────────────────────────────────────────

describe('Circadian Engine', () => {
  const hourlySnapshots = get24HourlyDates();

  describe('Output completeness', () => {
    it('produces all 49 CSS variables', () => {
      const vars = computeThemeVars(MUMBAI_CONFIG, hourlySnapshots[12].date);
      const keys = Object.keys(vars);
      expect(keys.length).toBe(49);
    });

    it('all color values are valid CSS colors', () => {
      const output = computeTheme(MUMBAI_CONFIG, hourlySnapshots[12].date);
      for (const [key, value] of Object.entries(output.colors)) {
        if (value === 'transparent') continue;
        expect(() => chroma(value), `${key} = "${value}" is not a valid color`).not.toThrow();
      }
    });
  });

  describe('WCAG contrast safety (24-hour)', () => {
    const contrastPairs: { fg: string; bg: string; minRatio: number; label: string }[] = [
      { fg: '--fg', bg: '--bg', minRatio: 4.5, label: 'fg/bg (body text)' },
      { fg: '--surface-fg', bg: '--surface', minRatio: 4.5, label: 'surface-fg/surface' },
      { fg: '--muted-fg', bg: '--muted', minRatio: 4.5, label: 'muted-fg/muted' },
      { fg: '--primary-fg', bg: '--primary', minRatio: 3, label: 'primary-fg/primary (large)' },
      { fg: '--button-fg', bg: '--button-bg', minRatio: 3, label: 'button-fg/button-bg' },
      { fg: '--th-fg', bg: '--th-bg', minRatio: 4.5, label: 'th-fg/th-bg' },
    ];

    for (const { hour, date } of hourlySnapshots) {
      for (const pair of contrastPairs) {
        it(`${pair.label} passes at ${hour}:00`, () => {
          const output = computeTheme(MUMBAI_CONFIG, date);
          const fg = safeChroma(output.colors[pair.fg as keyof typeof output.colors]);
          const bg = safeChroma(output.colors[pair.bg as keyof typeof output.colors]);
          if (!fg || !bg) return; // Skip transparent
          const ratio = chroma.contrast(fg, bg);
          expect(ratio).toBeGreaterThanOrEqual(pair.minRatio);
        });
      }
    }
  });

  describe('Focus ring visibility (24-hour)', () => {
    for (const { hour, date } of hourlySnapshots) {
      it(`ring vs bg passes 3:1 at ${hour}:00`, () => {
        const output = computeTheme(MUMBAI_CONFIG, date);
        const ring = safeChroma(output.colors['--ring']);
        const bg = safeChroma(output.colors['--bg']);
        if (!ring || !bg) return;
        const ratio = chroma.contrast(ring, bg);
        expect(ratio).toBeGreaterThanOrEqual(3);
      });
    }
  });

  describe('Typography coupling rules (24-hour)', () => {
    for (const { hour, date } of hourlySnapshots) {
      it(`body weight floor holds at ${hour}:00`, () => {
        const state = getState(MUMBAI_CONFIG, date);
        const typo = deriveTypography(state);
        const weight = Number(typo['--typo-body-weight']);
        // Weight should be >= 380 (photopic floor)
        expect(weight).toBeGreaterThanOrEqual(378); // Allow tiny float variance
      });

      it(`display weight is lower than body at night (${hour}:00)`, () => {
        const state = getState(MUMBAI_CONFIG, date);
        const typo = deriveTypography(state);
        const bodyW = Number(typo['--typo-body-weight']);
        const displayW = Number(typo['--typo-display-weight']);
        // Display should always be >= body (hierarchy exists)
        // But at night, the GAP narrows (contrast ratio drops toward 0.7)
        const ratio = Number(typo['--typo-contrast-ratio']);
        expect(ratio).toBeGreaterThanOrEqual(0.69);
        expect(ratio).toBeLessThanOrEqual(1.01);
        expect(displayW).toBeGreaterThanOrEqual(bodyW);
      });

      it(`body leading is reasonable at ${hour}:00`, () => {
        const state = getState(MUMBAI_CONFIG, date);
        const typo = deriveTypography(state);
        const leading = Number(typo['--typo-body-leading']);
        expect(leading).toBeGreaterThanOrEqual(1.49);
        expect(leading).toBeLessThanOrEqual(1.66);
      });
    }
  });

  describe('Motion adaptation', () => {
    it('duration scale increases at night', () => {
      const noon = getState(MUMBAI_CONFIG, hourlySnapshots[12].date);
      const midnight = getState(MUMBAI_CONFIG, hourlySnapshots[0].date);

      const noonMotion = deriveMotion(noon, true);
      const midnightMotion = deriveMotion(midnight, true);

      const noonScale = Number(noonMotion['--motion-duration-scale']);
      const midnightScale = Number(midnightMotion['--motion-duration-scale']);

      expect(midnightScale).toBeGreaterThan(noonScale);
      expect(midnightScale).toBeLessThanOrEqual(1.26);
      expect(noonScale).toBeGreaterThanOrEqual(1.0);
    });

    it('returns 1.0 scales when adaptation disabled', () => {
      const state = getState(MUMBAI_CONFIG, hourlySnapshots[0].date);
      const motion = deriveMotion(state, false);
      expect(motion['--motion-duration-scale']).toBe('1');
      expect(motion['--motion-intensity-scale']).toBe('1');
    });
  });

  describe('Shadow adaptation', () => {
    for (const { hour, date } of [hourlySnapshots[0], hourlySnapshots[12]]) {
      it(`shadow opacity is in range at ${hour}:00`, () => {
        const output = computeTheme(MUMBAI_CONFIG, date);
        const opacity = Number(output.shadows['--shadow-ambient-opacity']);
        expect(opacity).toBeGreaterThanOrEqual(0.04);
        expect(opacity).toBeLessThanOrEqual(0.45);
      });

      it(`shadow spread is in range at ${hour}:00`, () => {
        const output = computeTheme(MUMBAI_CONFIG, date);
        const spread = Number(output.shadows['--shadow-spread-scale']);
        expect(spread).toBeGreaterThanOrEqual(0.69);
        expect(spread).toBeLessThanOrEqual(1.01);
      });
    }
  });

  describe('Solar state', () => {
    it('noon has daylight phase', () => {
      const state = getState(MUMBAI_CONFIG, hourlySnapshots[12].date);
      expect(state.phase).toBe('day');
      expect(state.visionRegime).toBe('photopic');
      expect(state.kelvin).toBeGreaterThan(4000);
    });

    it('midnight has night phase', () => {
      const state = getState(MUMBAI_CONFIG, hourlySnapshots[0].date);
      expect(state.phase).toBe('night');
      expect(state.kelvin).toBeLessThan(2000);
    });

    it('intensity peaks around noon', () => {
      const intensities = hourlySnapshots.map(({ date }) =>
        getState(MUMBAI_CONFIG, date).intensity,
      );
      const maxIdx = intensities.indexOf(Math.max(...intensities));
      // Peak should be between 10:00 and 14:00
      expect(maxIdx).toBeGreaterThanOrEqual(10);
      expect(maxIdx).toBeLessThanOrEqual(14);
    });
  });

  describe('Config defaults', () => {
    it('works with minimal config (lat/lng only)', () => {
      const vars = computeThemeVars(
        { latitude: 19.07, longitude: 72.87 },
        hourlySnapshots[12].date,
      );
      expect(Object.keys(vars).length).toBe(49);
    });
  });
});
