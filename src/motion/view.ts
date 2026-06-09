import { animateView, type ViewTransitionBuilder, type ViewTransitionOptions } from 'motion-dom';

/**
 * View transition - run a DOM mutation (a route swap, content reveal, reorder)
 * inside the browser View Transitions API, animated by Motion. Use the CSS
 * `view-transition-name` property on shared elements for cross-state morphing.
 *
 * Tooling reconciliation (ADR 0028): we use motion-dom's IMPERATIVE
 * `animateView` rather than motion-plus's `<AnimateView>` - the motion-plus
 * animate-view export is a React component, whereas this runtime is
 * framework-agnostic (Stage F relocates it into nectar-design, React-optional).
 * motion-plus still earns its keep via `flip` (animate-layout / FLIP), which
 * core does not surface imperatively. The motion-plus React component remains
 * available to re-source at the component layer if shared-element
 * orchestration is needed.
 *
 * Motion's animateView falls back to an immediate update where the View
 * Transitions API is unsupported.
 */
export function view(
  update: () => void | Promise<void>,
  options?: ViewTransitionOptions,
): ViewTransitionBuilder {
  return animateView(update, options);
}
