/**
 * Circadian entry point — separate from main nectar-design bundle.
 *
 * Consumers who don't use CircadianProvider pay zero cost.
 * Tree-shakeable: only imports what you use.
 *
 * Usage:
 *   import { CircadianProvider, useCircadian } from 'nectar-design/circadian';
 *   import 'nectar-design/circadian.css';
 */

// Provider + hook
export {
  CircadianProvider,
  useCircadian,
} from '../hooks/useCircadianTheme';
export type { CircadianProviderProps } from '../hooks/useCircadianTheme';

// Engine (for advanced consumers, Storybook, testing)
export {
  computeTheme,
  computeThemeVars,
  getState,
} from '../engine/circadian-engine';

// Types
export type {
  CircadianConfig,
  CircadianOutput,
  CircadianState,
  CircadianVarMap,
} from '../engine/types';
export { DEFAULT_CONFIG } from '../engine/types';
export type { VisionRegime, SolarPhase } from '../engine/types';

// Theme mode type from useTheme
export type { ThemeMode } from '../hooks/useTheme';
