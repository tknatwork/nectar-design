/**
 * Nectar interaction sensorium - device-agnostic intent signals (ADR 0028
 * Layer 1). Built on the Pointer Events API; a single global bus + arbiter
 * normalize mouse / pen / touch into one signal vocabulary that the engine
 * and components subscribe to.
 *
 * The React layer + the wiring of `activity` / `pointer-position` into the
 * motion engine's heat driver land in later sub-steps.
 *
 * @see docs/decisions/0028-dynamic-color-motion-system.md
 */
export { createSensorium, type Sensorium, type SensoriumOptions } from './sensorium';
export * from './signals';
