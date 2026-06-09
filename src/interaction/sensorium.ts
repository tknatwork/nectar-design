import { createSignalBus, type PointerKind, type SignalBus, type Unsubscribe } from './signals';

/** Tuning for gesture recognition. */
export interface SensoriumOptions {
  /** Event source (default: document). */
  target?: Document | HTMLElement;
  /** Movement (px) from press-start that promotes a press into a pan. */
  panThresholdPx?: number;
  /** Max press duration (ms) still counted as a tap / activate. */
  tapMaxMs?: number;
  /** Max movement (px) still counted as a tap / activate. */
  tapMaxMovePx?: number;
  /** Hold (ms) without moving that fires a long-press (secondary). */
  longpressDelayMs?: number;
  /** Movement (px) that cancels an arming long-press. */
  longpressTolerancePx?: number;
  /** Min end-velocity (px/ms) of a horizontal pan to read it as a navigate-swipe. */
  swipeMinVx?: number;
  /** Min horizontal distance (px) for a navigate-swipe. */
  swipeMinDx?: number;
}

/** A running sensorium: its signal bus + lifecycle. */
export interface Sensorium {
  readonly bus: SignalBus;
  start(): void;
  stop(): void;
}

interface TrackedPointer {
  type: PointerKind;
  downTarget: EventTarget | null;
  startX: number;
  startY: number;
  startTime: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  lastVx: number;
  lastVy: number;
  isPan: boolean;
  consumedBySecondary: boolean;
  longpressTimer: ReturnType<typeof setTimeout> | null;
}

interface ZoomState {
  idA: number;
  idB: number;
  startDist: number;
}

const DEFAULTS = {
  panThresholdPx: 8,
  tapMaxMs: 500,
  tapMaxMovePx: 4,
  longpressDelayMs: 500,
  longpressTolerancePx: 10,
  swipeMinVx: 0.5,
  swipeMinDx: 40,
} as const;

function pointerKind(e: PointerEvent): PointerKind {
  return e.pointerType === 'touch' ? 'touch' : e.pointerType === 'pen' ? 'pen' : 'mouse';
}

/**
 * The sensorium - normalizes raw Pointer / keyboard / scroll / focus events
 * into the device-agnostic intent vocabulary (ADR 0028 Layer 1). One model
 * (Pointer Events + pointerType), one global bus, one arbiter.
 *
 * Arbiter rules:
 *  - primary-pointer: only the first pointer drives press / activate / pan.
 *  - supersede + cancel: a press that crosses the pan threshold becomes a pan
 *    (press cancelled, no activate); a long-press that fires consumes the tap;
 *    a recognized pinch cancels the primary's press/pan.
 *  - capture on recognition: a recognized pan setPointerCaptures its pointer.
 *  - conflict -> no-op: a 3rd simultaneous touch cancels the pinch and
 *    suppresses single-pointer intents until every pointer lifts.
 *
 * `secondary` is one intent from three producers: contextmenu (right-click),
 * long-press, and the keyboard menu key. `navigate` is emitted from a
 * horizontal swipe; key-driven navigate stays component-scoped.
 */
export function createSensorium(options: SensoriumOptions = {}): Sensorium {
  const panThreshold = options.panThresholdPx ?? DEFAULTS.panThresholdPx;
  const tapMaxMs = options.tapMaxMs ?? DEFAULTS.tapMaxMs;
  const tapMaxMove = options.tapMaxMovePx ?? DEFAULTS.tapMaxMovePx;
  const longpressDelay = options.longpressDelayMs ?? DEFAULTS.longpressDelayMs;
  const longpressTolerance = options.longpressTolerancePx ?? DEFAULTS.longpressTolerancePx;
  const swipeMinVx = options.swipeMinVx ?? DEFAULTS.swipeMinVx;
  const swipeMinDx = options.swipeMinDx ?? DEFAULTS.swipeMinDx;

  const bus = createSignalBus();
  const pointers = new Map<number, TrackedPointer>();
  const cleanups: Unsubscribe[] = [];
  let primaryId: number | null = null;
  let zoom: ZoomState | null = null;
  let conflicted = false;
  let started = false;

  function firstPointerId(): number | null {
    const next = pointers.keys().next();
    return next.done ? null : next.value;
  }

  function clearLongpress(p: TrackedPointer): void {
    if (p.longpressTimer !== null) {
      clearTimeout(p.longpressTimer);
      p.longpressTimer = null;
    }
  }

  function touchPointerIds(): number[] {
    const ids: number[] = [];
    for (const [id, p] of pointers) if (p.type === 'touch') ids.push(id);
    return ids;
  }

  function startZoom(idA: number, idB: number): void {
    const pa = pointers.get(idA);
    const pb = pointers.get(idB);
    if (!pa || !pb) return;
    // Supersede the primary's single-pointer intent.
    if (primaryId !== null) {
      const pp = pointers.get(primaryId);
      if (pp) {
        clearLongpress(pp);
        if (!pp.isPan) {
          bus.emit('press', { phase: 'cancel', x: pp.lastX, y: pp.lastY, pointerType: pp.type, target: pp.downTarget });
        }
      }
    }
    const startDist = Math.hypot(pa.lastX - pb.lastX, pa.lastY - pb.lastY) || 1;
    zoom = { idA, idB, startDist };
    bus.emit('zoom', { phase: 'start', scale: 1, x: (pa.lastX + pb.lastX) / 2, y: (pa.lastY + pb.lastY) / 2 });
  }

  function onDown(e: PointerEvent): void {
    const p: TrackedPointer = {
      type: pointerKind(e),
      downTarget: e.target,
      startX: e.clientX,
      startY: e.clientY,
      startTime: e.timeStamp,
      lastX: e.clientX,
      lastY: e.clientY,
      lastTime: e.timeStamp,
      lastVx: 0,
      lastVy: 0,
      isPan: false,
      consumedBySecondary: false,
      longpressTimer: null,
    };
    pointers.set(e.pointerId, p);

    if (primaryId === null) {
      primaryId = e.pointerId;
      bus.emit('press', { phase: 'start', x: e.clientX, y: e.clientY, pointerType: p.type, target: p.downTarget });
      bus.emit('activity', { kind: 'press' });
      p.longpressTimer = setTimeout(() => {
        // Arm -> fire: still down, hasn't panned, no competing gesture.
        if (!p.isPan && !zoom && !conflicted && pointers.has(e.pointerId)) {
          p.consumedBySecondary = true;
          bus.emit('secondary', { x: p.lastX, y: p.lastY, target: p.downTarget, source: 'longpress' });
        }
      }, longpressDelay);
    }

    // Multi-touch arbitration (scope/opt-in routing is a Stage-E refinement).
    const touches = touchPointerIds();
    if (touches.length === 2 && !zoom && !conflicted) {
      startZoom(touches[0], touches[1]);
    } else if (touches.length > 2) {
      conflicted = true; // conflict -> no-op
      if (zoom) endZoom();
    }
  }

  function onMove(e: PointerEvent): void {
    if (e.pointerType !== 'touch') {
      bus.emit('pointer-position', { x: e.clientX, y: e.clientY, pointerType: pointerKind(e) });
    }
    bus.emit('activity', { kind: 'move' });

    const p = pointers.get(e.pointerId);
    if (!p) return;

    const dx = e.clientX - p.startX;
    const dy = e.clientY - p.startY;
    if (Math.hypot(dx, dy) > longpressTolerance) clearLongpress(p);

    if (!conflicted && !zoom && e.pointerId === primaryId) {
      if (!p.isPan && Math.hypot(dx, dy) > panThreshold) {
        p.isPan = true;
        clearLongpress(p);
        bus.emit('press', { phase: 'cancel', x: e.clientX, y: e.clientY, pointerType: p.type, target: p.downTarget });
        if (p.downTarget instanceof Element) {
          try {
            p.downTarget.setPointerCapture(e.pointerId);
          } catch {
            /* capture can fail if the node is detached - safe to ignore */
          }
        }
        bus.emit('pan', { phase: 'start', x: e.clientX, y: e.clientY, dx, dy, vx: 0, vy: 0, pointerType: p.type, target: p.downTarget });
      } else if (p.isPan) {
        const dt = Math.max(1, e.timeStamp - p.lastTime);
        p.lastVx = (e.clientX - p.lastX) / dt;
        p.lastVy = (e.clientY - p.lastY) / dt;
        bus.emit('pan', { phase: 'move', x: e.clientX, y: e.clientY, dx, dy, vx: p.lastVx, vy: p.lastVy, pointerType: p.type, target: p.downTarget });
      }
    }

    p.lastX = e.clientX;
    p.lastY = e.clientY;
    p.lastTime = e.timeStamp;

    if (zoom && (e.pointerId === zoom.idA || e.pointerId === zoom.idB)) {
      const pa = pointers.get(zoom.idA);
      const pb = pointers.get(zoom.idB);
      if (pa && pb) {
        const dist = Math.hypot(pa.lastX - pb.lastX, pa.lastY - pb.lastY);
        bus.emit('zoom', { phase: 'move', scale: dist / zoom.startDist, x: (pa.lastX + pb.lastX) / 2, y: (pa.lastY + pb.lastY) / 2 });
      }
    }
  }

  function endZoom(): void {
    if (!zoom) return;
    const pa = pointers.get(zoom.idA);
    const pb = pointers.get(zoom.idB);
    if (pa && pb) {
      const dist = Math.hypot(pa.lastX - pb.lastX, pa.lastY - pb.lastY);
      bus.emit('zoom', { phase: 'end', scale: dist / zoom.startDist, x: (pa.lastX + pb.lastX) / 2, y: (pa.lastY + pb.lastY) / 2 });
    }
    zoom = null;
  }

  function finish(e: PointerEvent, cancelled: boolean): void {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    clearLongpress(p);

    // A pinch pointer lifting ends the zoom (both still present for the centroid).
    if (zoom && (e.pointerId === zoom.idA || e.pointerId === zoom.idB)) {
      endZoom();
      pointers.delete(e.pointerId);
      primaryId = firstPointerId();
      if (pointers.size === 0) conflicted = false;
      return;
    }

    pointers.delete(e.pointerId);
    const wasPrimary = e.pointerId === primaryId;
    if (pointers.size === 0) conflicted = false;

    if (!wasPrimary || conflicted) {
      if (wasPrimary) primaryId = firstPointerId();
      return;
    }

    if (p.isPan) {
      const dx = e.clientX - p.startX;
      const dy = e.clientY - p.startY;
      bus.emit('pan', { phase: 'end', x: e.clientX, y: e.clientY, dx, dy, vx: p.lastVx, vy: p.lastVy, pointerType: p.type, target: p.downTarget });
      // A fast horizontal swipe normalizes to a navigate (carousel/tags).
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > swipeMinDx && Math.abs(p.lastVx) > swipeMinVx) {
        bus.emit('navigate', { direction: dx < 0 ? 'next' : 'prev', source: 'pan' });
      }
    } else if (cancelled) {
      bus.emit('press', { phase: 'cancel', x: e.clientX, y: e.clientY, pointerType: p.type, target: p.downTarget });
    } else {
      bus.emit('press', { phase: 'end', x: e.clientX, y: e.clientY, pointerType: p.type, target: p.downTarget });
      const held = e.timeStamp - p.startTime;
      const moved = Math.hypot(e.clientX - p.startX, e.clientY - p.startY);
      if (!p.consumedBySecondary && held <= tapMaxMs && moved <= tapMaxMove) {
        bus.emit('activate', { x: e.clientX, y: e.clientY, pointerType: p.type, target: p.downTarget });
        bus.emit('activity', { kind: 'activate' });
      }
    }
    primaryId = firstPointerId();
  }

  function onOver(e: PointerEvent): void {
    if (e.pointerType === 'touch') return; // hover is a pointer-only enhancement
    bus.emit('hover', { phase: 'enter', x: e.clientX, y: e.clientY, target: e.target });
  }

  function onOut(e: PointerEvent): void {
    if (e.pointerType === 'touch') return;
    bus.emit('hover', { phase: 'leave', x: e.clientX, y: e.clientY, target: e.target });
  }

  function onContextMenu(e: MouseEvent): void {
    // Emit only; suppressing the native menu is a per-component opt-in.
    bus.emit('secondary', { x: e.clientX, y: e.clientY, target: e.target, source: 'contextmenu' });
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      bus.emit('dismiss', { source: 'escape' });
    } else if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
      const el = typeof document === 'undefined' ? null : document.activeElement;
      const rect = el instanceof Element ? el.getBoundingClientRect() : null;
      bus.emit('secondary', { x: rect ? rect.left : 0, y: rect ? rect.top : 0, target: el, source: 'key' });
    }
  }

  function onScroll(): void {
    if (typeof document === 'undefined') return;
    const el = document.scrollingElement ?? document.documentElement;
    const max = el.scrollHeight - el.clientHeight;
    bus.emit('scroll-progress', { progress: max > 0 ? el.scrollTop / max : 0, target: document });
  }

  function onFocusIn(e: FocusEvent): void {
    bus.emit('focus', { phase: 'in', target: e.target });
  }

  function onFocusOut(e: FocusEvent): void {
    bus.emit('focus', { phase: 'out', target: e.target });
  }

  function start(): void {
    if (started) return;
    const target = options.target ?? (typeof document === 'undefined' ? null : document);
    if (!target) return; // SSR / no DOM
    started = true;
    const add = <E extends Event>(type: string, handler: (e: E) => void): void => {
      target.addEventListener(type, handler as EventListener, { passive: true });
      cleanups.push(() => target.removeEventListener(type, handler as EventListener));
    };
    add<PointerEvent>('pointerdown', onDown);
    add<PointerEvent>('pointermove', onMove);
    add<PointerEvent>('pointerup', (e) => finish(e, false));
    add<PointerEvent>('pointercancel', (e) => finish(e, true));
    add<PointerEvent>('pointerover', onOver);
    add<PointerEvent>('pointerout', onOut);
    add<MouseEvent>('contextmenu', onContextMenu);
    add<KeyboardEvent>('keydown', onKeyDown);
    add<Event>('scroll', onScroll);
    add<FocusEvent>('focusin', onFocusIn);
    add<FocusEvent>('focusout', onFocusOut);
  }

  function stop(): void {
    if (!started) return;
    started = false;
    for (const c of cleanups) c();
    cleanups.length = 0;
    for (const p of pointers.values()) clearLongpress(p);
    pointers.clear();
    primaryId = null;
    zoom = null;
    conflicted = false;
  }

  return { bus, start, stop };
}
