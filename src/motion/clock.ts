import { cancelFrame, frame, frameData } from 'motion-dom';

import type { FrameTask, Unsubscribe } from './types';

/**
 * The clock - the single timeline for the whole runtime (ADR 0028 Layer 2).
 *
 * Motion's internal frameloop IS the clock: every Motion-based animator
 * (springs, `animate()`, these tasks) runs inside the same loop, so there is
 * genuinely one timeline and no competing scheduler. We register exactly one
 * keep-alive process and fan it out to subscribers, then park it when the
 * subscriber set empties - so an idle page costs zero frames.
 *
 * This replaces the two ad-hoc schedulers the old engine used: GSAP's ticker
 * in `useHeatEngine` and raw `requestAnimationFrame` in `useDepthEngine`.
 */

const tasks = new Set<FrameTask>();
let running = false;

/** The one process Motion calls each frame; fans out to all subscribers. */
function tick(): void {
  // `frameData.delta` is Motion's measured ms since the previous frame - the
  // same value every task sees this frame, keeping them on one timeline.
  const deltaMs = frameData.delta;
  for (const task of tasks) task(deltaMs);

  // Self-park: when nothing is subscribed, cancel the loop so an idle page
  // does no per-frame work. `onFrame` restarts it on the next subscribe.
  if (tasks.size === 0) {
    cancelFrame(tick);
    running = false;
  }
}

/**
 * Subscribe a task to the clock. Returns an unsubscribe handle. Starts the
 * frameloop on the first subscriber; parks it after the last unsubscribes.
 */
export function onFrame(task: FrameTask): Unsubscribe {
  tasks.add(task);
  if (!running) {
    running = true;
    // keepAlive = true -> Motion re-runs `tick` every frame until cancelled.
    frame.update(tick, true);
  }
  return () => {
    tasks.delete(task);
  };
}

/** Current frame delta in ms. Only meaningful when read inside a frame task. */
export function frameDelta(): number {
  return frameData.delta;
}
