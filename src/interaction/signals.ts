/**
 * Signal vocabulary + bus for the Nectar interaction sensorium (ADR 0028
 * Layer 1). Raw mouse / pen / touch events are normalized into ONE set of
 * device-agnostic intent signals; the engine and components subscribe to
 * these, never to raw DOM events.
 *
 * @see docs/decisions/0028-dynamic-color-motion-system.md
 */

/** Teardown handle returned by every subscribe-style API. */
export type Unsubscribe = () => void;

/** Viewport (client-space) coordinates. */
export interface Point {
  x: number;
  y: number;
}

/** Normalized pointer kind from the Pointer Events `pointerType`. */
export type PointerKind = 'mouse' | 'pen' | 'touch';

interface PointerSignal extends Point {
  pointerType: PointerKind;
  target: EventTarget | null;
}

/** A clean tap / click (press-release with negligible movement). */
export type ActivatePayload = PointerSignal;

/** Press lifecycle: down -> (end | cancel). Cancel fires when a press becomes a pan. */
export interface PressPayload extends PointerSignal {
  phase: 'start' | 'end' | 'cancel';
}

/** Hover (pointer-only enhancement; never fires for touch). */
export interface HoverPayload extends Point {
  phase: 'enter' | 'leave';
  target: EventTarget | null;
}

/** Drag / swipe lifecycle, with cumulative delta and instantaneous velocity (px/ms). */
export interface PanPayload extends PointerSignal {
  phase: 'start' | 'move' | 'end';
  dx: number;
  dy: number;
  vx: number;
  vy: number;
}

/** Continuous pointer position (pointer-only; feeds the Wave origin, etc.). */
export interface PointerPositionPayload extends Point {
  pointerType: PointerKind;
}

/** A liveness pulse; `kind` hints the producing gesture. */
export interface ActivityPayload {
  kind: 'move' | 'press' | 'activate';
}

/** Context intent: right-click === long-press === keyboard menu key. */
export interface SecondaryPayload extends Point {
  target: EventTarget | null;
  source: 'contextmenu' | 'longpress' | 'key';
}

/** Pinch-zoom (multi-touch); x/y is the centroid. */
export interface ZoomPayload extends Point {
  phase: 'start' | 'move' | 'end';
  scale: number;
}

/** Scroll progress (0-1) for a tracked region. */
export interface ScrollProgressPayload {
  progress: number;
  target: EventTarget | null;
}

/** A normalized navigation step (arrows/keys or swipe -> one intent). */
export interface NavigatePayload {
  direction: 'next' | 'prev' | 'up' | 'down';
  source: 'key' | 'pan';
}

/** A dismissal intent (Escape, outside press, dismiss-swipe). */
export interface DismissPayload {
  source: 'escape' | 'pointer-outside' | 'swipe';
}

/** Focus lifecycle for a tracked region. */
export interface FocusPayload {
  phase: 'in' | 'out';
  target: EventTarget | null;
}

/** The full signal vocabulary (ADR 0028 Layer 1). */
export interface SignalMap {
  activate: ActivatePayload;
  press: PressPayload;
  hover: HoverPayload;
  pan: PanPayload;
  navigate: NavigatePayload;
  'scroll-progress': ScrollProgressPayload;
  activity: ActivityPayload;
  'pointer-position': PointerPositionPayload;
  secondary: SecondaryPayload;
  dismiss: DismissPayload;
  focus: FocusPayload;
  zoom: ZoomPayload;
}

export type SignalType = keyof SignalMap;
export type SignalHandler<T extends SignalType> = (payload: SignalMap[T]) => void;

/** A typed publish/subscribe bus for interaction signals. */
export interface SignalBus {
  on<T extends SignalType>(type: T, handler: SignalHandler<T>): Unsubscribe;
  emit<T extends SignalType>(type: T, payload: SignalMap[T]): void;
}

/**
 * Create an empty signal bus. Handlers are stored per type; `emit` is
 * synchronous. The `never` casts are the standard typed-emitter pattern -
 * type-safety is enforced at the public `on` / `emit` boundary.
 */
export function createSignalBus(): SignalBus {
  const handlers = new Map<SignalType, Set<(payload: never) => void>>();
  return {
    on(type, handler) {
      let set = handlers.get(type);
      if (!set) {
        set = new Set();
        handlers.set(type, set);
      }
      const s = set;
      s.add(handler as (payload: never) => void);
      return () => {
        s.delete(handler as (payload: never) => void);
      };
    },
    emit(type, payload) {
      const set = handlers.get(type);
      if (!set) return;
      for (const h of set) h(payload as never);
    },
  };
}
