import type { HTMLAttributes } from 'react';

import { cn } from '../cn';

/**
 * Eyebrow — the recurring all-caps section label: 11px / 600 weight / uppercase
 * / 0.14em tracking / accent colour. Sits above hero titles and section headers
 * ("Selected Work", "Practice", …).
 *
 * A standalone primitive rather than a `Heading` variant (ADR 0026 Stage B,
 * migrated from the app 2026-06-08): an eyebrow is a `<p>` label, not a semantic
 * heading, so overloading `Heading` would be wrong. `text-accent` resolves to
 * nd's `--color-accent` token (and to the engine-driven accent in the consuming
 * app). Pass extra Tailwind via `className` — the eyebrow pattern wins, the
 * `className` extends. For an entrance fade, wrap this in a `motion` element
 * rather than reaching for `motion.p`, to keep the typography pattern central.
 */
export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-[11px] font-semibold uppercase tracking-[0.14em] text-accent',
        className,
      )}
      {...props}
    />
  );
}
