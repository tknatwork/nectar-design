import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSensorium, type Sensorium } from '../sensorium';
import type { NavigatePayload, PressPayload, SecondaryPayload, SignalType, ZoomPayload } from '../signals';

interface Captured {
  type: SignalType;
  payload: unknown;
}

const ALL_SIGNALS: SignalType[] = [
  'activate', 'press', 'hover', 'pan', 'navigate', 'scroll-progress',
  'activity', 'pointer-position', 'secondary', 'dismiss', 'focus', 'zoom',
];

/** Subscribe to every signal and collect them in emission order. */
function collect(s: Sensorium): Captured[] {
  const events: Captured[] = [];
  for (const t of ALL_SIGNALS) s.bus.on(t, (payload) => events.push({ type: t, payload }));
  return events;
}

function pe(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, ...init });
}

function pressPhases(events: Captured[]): string[] {
  return events.filter((e) => e.type === 'press').map((e) => (e.payload as PressPayload).phase);
}

function sources(events: Captured[], type: SignalType): string[] {
  return events
    .filter((e) => e.type === type)
    .map((e) => (e.payload as SecondaryPayload).source);
}

describe('sensorium — pointer core + arbiter', () => {
  it('emits press start -> end and an activate on a clean tap', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 1, clientX: 10, clientY: 10, pointerType: 'mouse' }));
    document.dispatchEvent(pe('pointerup', { pointerId: 1, clientX: 11, clientY: 11, pointerType: 'mouse' }));
    s.stop();

    expect(events.map((e) => e.type)).toContain('activate');
    expect(pressPhases(events)).toEqual(['start', 'end']);
  });

  it('promotes a press past the threshold into a pan and cancels the press (no activate)', () => {
    const s = createSensorium({ target: document, panThresholdPx: 8 });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 2, clientX: 0, clientY: 0, pointerType: 'mouse' }));
    document.dispatchEvent(pe('pointermove', { pointerId: 2, clientX: 30, clientY: 0, pointerType: 'mouse' }));
    document.dispatchEvent(pe('pointerup', { pointerId: 2, clientX: 30, clientY: 0, pointerType: 'mouse' }));
    s.stop();

    const kinds = events.map((e) => e.type);
    expect(kinds).toContain('pan');
    expect(kinds).not.toContain('activate');
    expect(pressPhases(events)).toContain('cancel');
  });

  it('honours primary-pointer: a second pointer does not start a second press', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 10, clientX: 0, clientY: 0, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointerdown', { pointerId: 11, clientX: 50, clientY: 50, pointerType: 'touch' }));
    s.stop();

    expect(pressPhases(events).filter((p) => p === 'start')).toHaveLength(1);
  });

  it('emits hover for mouse but treats touch hover as a no-op', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerover', { pointerId: 1, clientX: 5, clientY: 5, pointerType: 'mouse' }));
    document.dispatchEvent(pe('pointerover', { pointerId: 2, clientX: 5, clientY: 5, pointerType: 'touch' }));
    s.stop();

    expect(events.filter((e) => e.type === 'hover')).toHaveLength(1);
  });

  it('stops emitting after stop()', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    s.stop();
    document.dispatchEvent(pe('pointerdown', { pointerId: 3, clientX: 0, clientY: 0, pointerType: 'mouse' }));
    expect(events).toHaveLength(0);
  });
});

describe('sensorium — secondary (one intent, three producers)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('fires secondary[longpress] after the delay and suppresses the tap', () => {
    const s = createSensorium({ target: document, longpressDelayMs: 500 });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 1, clientX: 10, clientY: 10, pointerType: 'touch' }));
    vi.advanceTimersByTime(600);
    document.dispatchEvent(pe('pointerup', { pointerId: 1, clientX: 10, clientY: 10, pointerType: 'touch' }));
    s.stop();

    expect(sources(events, 'secondary')).toContain('longpress');
    expect(events.map((e) => e.type)).not.toContain('activate');
  });

  it('does not fire long-press if the pointer moves past tolerance', () => {
    const s = createSensorium({ target: document, longpressDelayMs: 500, longpressTolerancePx: 10 });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 1, clientX: 0, clientY: 0, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointermove', { pointerId: 1, clientX: 40, clientY: 0, pointerType: 'touch' }));
    vi.advanceTimersByTime(600);
    s.stop();

    expect(sources(events, 'secondary')).not.toContain('longpress');
  });
});

describe('sensorium — contextmenu / keyboard / multi-touch / swipe', () => {
  it('maps contextmenu (right-click) to secondary', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 5, clientY: 5 }));
    s.stop();

    expect(sources(events, 'secondary')).toContain('contextmenu');
  });

  it('maps Escape to dismiss', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    s.stop();

    expect(events.filter((e) => e.type === 'dismiss')).toHaveLength(1);
  });

  it('recognizes a two-finger pinch as zoom (start -> move -> end), scale ~ distance ratio', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointerdown', { pointerId: 2, clientX: 200, clientY: 100, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointermove', { pointerId: 2, clientX: 300, clientY: 100, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointerup', { pointerId: 2, clientX: 300, clientY: 100, pointerType: 'touch' }));
    s.stop();

    const zoomPhases = events.filter((e) => e.type === 'zoom').map((e) => (e.payload as ZoomPayload).phase);
    expect(zoomPhases[0]).toBe('start');
    expect(zoomPhases).toContain('move');
    expect(zoomPhases).toContain('end');
    const move = events.find((e) => e.type === 'zoom' && (e.payload as ZoomPayload).phase === 'move');
    expect(move).toBeDefined();
    if (move) expect((move.payload as ZoomPayload).scale).toBeCloseTo(2, 1);
  });

  it('goes no-op on a 3rd simultaneous touch (cancels the pinch)', () => {
    const s = createSensorium({ target: document });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 1, clientX: 100, clientY: 100, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointerdown', { pointerId: 2, clientX: 200, clientY: 100, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointerdown', { pointerId: 3, clientX: 150, clientY: 200, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointermove', { pointerId: 2, clientX: 260, clientY: 100, pointerType: 'touch' }));
    s.stop();

    const zoomPhases = events.filter((e) => e.type === 'zoom').map((e) => (e.payload as ZoomPayload).phase);
    expect(zoomPhases).toContain('end'); // pinch was cancelled by the 3rd touch
    // no further zoom 'move' after the conflict
    const lastZoom = zoomPhases[zoomPhases.length - 1];
    expect(lastZoom).toBe('end');
  });

  it('normalizes a fast horizontal swipe to navigate', () => {
    const s = createSensorium({ target: document, swipeMinDx: 40, swipeMinVx: 0.1 });
    const events = collect(s);
    s.start();
    document.dispatchEvent(pe('pointerdown', { pointerId: 1, clientX: 200, clientY: 50, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointermove', { pointerId: 1, clientX: 120, clientY: 50, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointermove', { pointerId: 1, clientX: 40, clientY: 50, pointerType: 'touch' }));
    document.dispatchEvent(pe('pointerup', { pointerId: 1, clientX: 40, clientY: 50, pointerType: 'touch' }));
    s.stop();

    const nav = events.filter((e) => e.type === 'navigate');
    expect(nav).toHaveLength(1);
    expect((nav[0].payload as NavigatePayload).direction).toBe('next'); // leftward swipe
    expect((nav[0].payload as NavigatePayload).source).toBe('pan');
  });
});
