'use client';

import { useEffect, useRef } from 'react';

import { createSensorium, type Sensorium, type SensoriumOptions } from './sensorium';
import type { SignalBus, SignalHandler, SignalType } from './signals';

/**
 * React layer for the interaction sensorium (ADR 0028 Layer 1). Mirrors the
 * `motion` / `motion/react` split: the core (`@/lib/interaction`) is
 * framework-agnostic; these hooks live behind `@/lib/interaction/react`.
 *
 * The sensorium is an app-lifetime singleton - one global bus for the whole
 * document, started once (the future NectarProvider owns this; until then the
 * hooks start it idempotently). It is intentionally not torn down on unmount:
 * the bus is global, like the motion engine's clock.
 */

let singleton: Sensorium | null = null;

/** Get (lazily creating) the global sensorium. Does not start it. */
export function getSensorium(options?: SensoriumOptions): Sensorium {
  singleton ??= createSensorium(options);
  return singleton;
}

/** Start (idempotently) the global sensorium and return its bus. */
export function useSensorium(options?: SensoriumOptions): SignalBus {
  const s = getSensorium(options);
  useEffect(() => {
    s.start();
  }, [s]);
  return s.bus;
}

/**
 * Subscribe to one interaction signal for this component's lifetime. The
 * handler is held in a ref so an inline closure never re-subscribes; the
 * sensorium is started idempotently so a lone `useSignal` works on its own.
 */
export function useSignal<T extends SignalType>(type: T, handler: SignalHandler<T>): void {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const s = getSensorium();
    s.start();
    return s.bus.on(type, (payload) => ref.current(payload));
  }, [type]);
}
