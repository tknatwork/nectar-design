/**
 * Lightweight toast pub/sub store (no dependencies). Imperative API:
 * `toast()`, `toast.success()`, `toast.error()`, `toast.warning()`. Mount
 * <GlassToastContainer> once at the app root to subscribe + render.
 *
 * Migrated from the app into nd (ADR 0026 Stage B), replacing nd's prior
 * @base-ui-based Toast (which was unused). Framework-agnostic — no React, no
 * motion — so it stays a plain module.
 */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number; /* ms, 0 = sticky */
}

type Listener = (items: ToastItem[]) => void;

let nextId = 0;
let items: ToastItem[] = [];
const listeners = new Set<Listener>();
const MAX_VISIBLE = 3;

function notify() {
  for (const fn of listeners) fn([...items]);
}

function add(message: string, variant: ToastVariant = 'default', duration = 4000) {
  const id = `toast-${++nextId}`;
  items = [{ id, message, variant, duration }, ...items].slice(0, MAX_VISIBLE);
  notify();

  if (duration > 0) {
    setTimeout(() => dismiss(id), duration);
  }
}

export function dismiss(id: string) {
  items = items.filter((t) => t.id !== id);
  notify();
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  fn([...items]);
  return () => listeners.delete(fn);
}

/** Show a default toast. */
export function toast(message: string, duration?: number) {
  add(message, 'default', duration);
}

toast.success = (message: string, duration?: number) => add(message, 'success', duration);
toast.error = (message: string, duration?: number) => add(message, 'error', duration ?? 6000);
toast.warning = (message: string, duration?: number) => add(message, 'warning', duration ?? 5000);
