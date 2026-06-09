/**
 * Nectar motion runtime - engine layer (ADR 0028, Stage C).
 *
 * Public surface for the one-clock / MotionValue-driver / channel-gate
 * substrate. Drivers (heat, depth), FLIP (`animate-layout`), and
 * view-transitions (`animate-view`) are added in subsequent Stage C steps.
 *
 * Relocated into nectar-design (ADR 0028 Stage F / consolidation P2): the
 * engine is generic design-system infrastructure, so it lives here as the
 * single source of truth. App-specific route policy stays app-side and is
 * injected at the provider boundary.
 *
 * @see docs/decisions/0028-dynamic-color-motion-system.md
 */
export { frameDelta, onFrame } from './clock';
// Animation policy — device-tier + reduced-motion gating the engine reads.
export {
  ANIMATION_CHANGE_EVENT,
  type AnimationPref,
  type DeviceTier,
  getAnimationPref,
  getDeviceTier,
  hasToggle,
  setAnimationPref,
  shouldAnimateCanvas,
  shouldAnimateOrbs,
  toggleAnimation,
} from './prefs';
export {
  currentDepth,
  isDark,
  sweepDepth,
  type SweepOptions,
  toggleDepth,
} from './depth';
export {
  engineValue,
  registerEngineProps,
  sunsetIntensity,
  syncEngineFromDom,
  writeSunset,
} from './engine';
export { flip } from './flip';
export { claimProperty, isPropertyClaimed } from './gate';
export { createHeatDriver, type HeatDriver, type HeatOptions } from './heat';
export type { Channel, EngineAxis, FrameTask, Unsubscribe } from './types';
export { view } from './view';
