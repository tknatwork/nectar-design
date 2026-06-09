'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { dismiss, subscribe, type ToastItem } from './toast-store';

// CARD_SPRING values (stiffness 300, damping 20) inlined so nd's toast doesn't
// depend on the app's springs module.
const TOAST_SPRING = { stiffness: 300, damping: 20 } as const;

// Toast colours resolve to CSS vars provided by the consuming app
// (--toast-default/success/error/warning in app globals.css). Distinct from
// nd's static --success/--warning/--destructive semantic vars (in-flow UI);
// toast colours want attention-grabbing brightness for transient notices.
const variantColors: Record<string, string> = {
  default: 'var(--toast-default)',
  success: 'var(--toast-success)',
  error:   'var(--toast-error)',
  warning: 'var(--toast-warning)',
};

/**
 * GlassToastContainer — mount once at the app root to render toasts published
 * via the `toast()` store. Glass-styled (`.glass .glass--floating`) with a
 * Framer-Motion enter / exit / reflow.
 *
 * Migrated from the app into nd (ADR 0026 Stage B), replacing nd's prior
 * @base-ui Toast. The glass classes + `--toast-*` / engine vars are supplied by
 * the consuming app's globals.css, so the toast is app-styled at runtime;
 * standalone nd-Storybook styling is a follow-up (it arrives once the glass
 * system itself moves into nd).
 */
export function GlassToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribe(setToasts), []);

  return (
    <div
      aria-live="polite"
      role="status"
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-3 mobile:bottom-4 mobile:right-4 mobile:left-4"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', ...TOAST_SPRING }}
            // Glass treatment via .glass .glass--floating (the consuming app's
            // glass system). The 3px left border (variant accent) is an inline
            // override since it's information-bearing, not style.
            className="glass glass--floating relative rounded-card-lg px-5 py-3 text-sm"
            style={{
              color: 'oklch(var(--L-heading) 0.02 var(--dynamic-hue))',
              borderLeftWidth: '3px',
              borderLeftColor: variantColors[t.variant] ?? variantColors.default,
            }}
          >
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="absolute top-2 right-3 text-xs opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              &times;
            </button>
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
