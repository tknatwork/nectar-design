import { unstable_animateLayout } from 'motion-plus/animate-layout';

/**
 * FLIP - animate the layout delta caused by a DOM mutation.
 *
 * Wraps motion-plus `unstable_animateLayout`: it measures elements before the
 * change, applies your `mutate` callback, measures after, and tweens the
 * difference with transforms (compositor-side). Two call forms are preserved:
 *
 *   flip(mutate, options?)            // track the whole document
 *   flip(scope, mutate, options?)     // limit tracking to a scope
 *
 * FLIP-continuity (ADR 0028 output arbitration): interrupting a running FLIP
 * blends from the current transform into the new target rather than stacking
 * or snapping - Motion's layout engine handles the blend, no extra wiring.
 *
 * This is the capability that earns motion-plus its place in the stack:
 * motion-dom core exposes the `LayoutAnimationBuilder` type but not this
 * imperative entry point. The upstream name is `unstable_` - this wrapper is
 * the stable boundary, so an upstream rename is a one-line change here.
 */
export const flip = unstable_animateLayout;
