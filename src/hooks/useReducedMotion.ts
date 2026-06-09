'use client';

import { useSyncExternalStore } from 'react';

const mq =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

function subscribe(cb: () => void) {
  mq?.addEventListener('change', cb);
  return () => mq?.removeEventListener('change', cb);
}

function getSnapshot() {
  return mq?.matches ?? false;
}

function getServerSnapshot() {
  return false;
}

/** Returns true when the user prefers reduced motion. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
