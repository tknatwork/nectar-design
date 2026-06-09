import type { CSSProperties, ReactNode } from 'react';

export interface FlipCardProps {
  /**
   * Cumulative rotation in degrees. The visible face is `rotation mod 360`
   * (0 = front, 180 = back). The CALLER owns this value: passing a cumulative,
   * always-forward number makes the flip read as a continuous spin (e.g. add a
   * full 360° to force a visible spin even when the target face is unchanged) —
   * something a boolean `flipped` prop can't express.
   */
  rotation: number;
  /**
   * The two faces. Provide a front (in flow — it defines the card's size) and a
   * back that is absolutely positioned (`inset: 0`), pre-rotated 180° on the
   * same axis, and `backface-visibility: hidden`. Faces are content-specific
   * (chrome, colour, copy), so the caller styles them; FlipCard owns only the
   * rotating `preserve-3d` container + the transition.
   */
  children: ReactNode;
  /** Flip axis (default 'x' — a top-over-bottom flip). */
  axis?: 'x' | 'y';
  /** Transition duration in seconds (default 0.6). */
  durationSec?: number;
  /** Transition timing function (default the standard ease). */
  easing?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * FlipCard — the generic 3D flip container (ADR 0026 Stage B primitive).
 *
 * Owns only the flip MECHANIC: a `position: relative; transform-style: preserve-3d`
 * container that rotates to `rotation` over a transition. It carries no
 * colour/token styling and does not position the faces — the caller passes
 * fully-styled front/back faces as children (front in flow; back `inset:0` +
 * pre-rotated 180° + backface-hidden). Extracted from the app's FlipBadge, which
 * keeps its phase/credits rotation logic, pill chrome, and face content, and now
 * consumes this container (so the inline transform-transition no longer lives in
 * app code — ADR 0027).
 */
export function FlipCard({
  rotation,
  children,
  axis = 'x',
  durationSec = 0.6,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  className,
  style,
}: FlipCardProps) {
  const rotate = axis === 'x' ? 'rotateX' : 'rotateY';
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `${rotate}(${rotation}deg)`,
        transition: `transform ${durationSec}s ${easing}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
