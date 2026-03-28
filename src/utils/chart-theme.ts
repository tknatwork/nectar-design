/**
 * Token-aware chart color palette for Recharts, Nivo, ECharts, etc.
 * Reads from CSS custom properties — auto-updates with theme changes.
 *
 * @example
 * ```tsx
 * // Runtime (reads current theme)
 * const colors = getChartColors();
 * <BarChart data={data}>
 *   <Bar fill={colors.primary} />
 *   <Bar fill={colors.accent} />
 * </BarChart>
 *
 * // Static fallback (SSR / build-time)
 * import { chartColorsFallback } from 'nectar-design';
 * ```
 */

/** CSS variable names mapped to chart roles */
const CHART_VARS = {
  primary: '--primary',
  accent: '--accent',
  success: '--success',
  destructive: '--destructive',
  warning: '--warning',
  muted: '--muted',
  fg: '--fg',
  bg: '--bg',
  border: '--border',
} as const;

export type ChartColors = Record<keyof typeof CHART_VARS, string>;

/** Light theme fallback (matches tokens.css :root) */
export const chartColorsFallback: ChartColors = {
  primary: '#FFE082',
  accent: '#B3D4F0',
  success: '#15603A',
  destructive: '#993520',
  warning: '#6B4700',
  muted: '#F0EDED',
  fg: '#2D2A32',
  bg: '#FFFDF5',
  border: '#D9D4CE',
};

/**
 * Reads current chart colors from CSS custom properties.
 * Returns fallback values when called outside the browser (SSR).
 */
export function getChartColors(): ChartColors {
  if (typeof window === 'undefined') return chartColorsFallback;

  const styles = getComputedStyle(document.documentElement);
  const colors = {} as ChartColors;

  for (const [key, varName] of Object.entries(CHART_VARS)) {
    const value = styles.getPropertyValue(varName).trim();
    colors[key as keyof ChartColors] = value || chartColorsFallback[key as keyof ChartColors];
  }

  return colors;
}

/**
 * Ordered palette for multi-series charts (bar groups, pie slices, etc.).
 * Returns 5 visually distinct colors in a perceptually balanced order.
 */
export function getChartPalette(): string[] {
  const c = getChartColors();
  return [c.primary, c.accent, c.success, c.warning, c.destructive];
}
