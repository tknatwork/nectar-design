/**
 * Shared types for the Nectar motion runtime — the engine layer of ADR 0028
 * (Interaction -> Engine -> Token -> Output). Stage C builds the engine: one
 * clock, MotionValue drivers, two output channels, and a central gate.
 *
 * @see docs/decisions/0028-dynamic-color-motion-system.md
 */

/**
 * The substrate has two output channels (ADR 0028 Layer 2):
 *  - `css` - browser-owned, compositor-side; the cheap ~80% (duration +
 *    cubic-bezier + opacity/transform + simple state transitions).
 *  - `raf` - Motion-owned; the ~20% (springs, orchestration, the imperative
 *    drivers that write engine vars every frame).
 */
export type Channel = 'css' | 'raf';

/** The two continuous engine axes that drive the Heat x Depth gamut. */
export type EngineAxis = 'heat' | 'depth';

/**
 * A per-frame task. Receives the frame delta in milliseconds; Motion's single
 * frameloop supplies it, so every task shares one timeline.
 */
export type FrameTask = (deltaMs: number) => void;

/** Teardown handle returned by every subscribe / claim-style API. */
export type Unsubscribe = () => void;
