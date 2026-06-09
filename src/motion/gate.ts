import type { Unsubscribe } from './types';

/**
 * The central gate - one animator per property (ADR 0028 Layer 2).
 *
 * When the raf channel drives a property every frame, any CSS transition on
 * that same property must stand down, or the compositor cross-fade fights the
 * per-frame write (the bug the old `depth-animating` class fixed - here
 * generalized from "the whole theme sweep" to "any property on any element").
 *
 * JS side (this module): track raf owners and stamp a marker attribute.
 * CSS side (wired in Stage E/F): a rule keyed off the marker drops the
 * matching transition, e.g.
 *
 *   [data-nectar-raf~="color"] { transition-property: none; }
 *
 * A space-separated token list (`~=` selector) lets several properties be
 * gated independently on one element.
 */

const ATTR = 'data-nectar-raf';

// Per-element ref counts: a property may be claimed by overlapping animators
// (interrupt-and-blend), so the marker must persist until the last releases.
// WeakMap keyed by element so detached nodes are GC'd without leaking.
const counts = new WeakMap<HTMLElement, Map<string, number>>();

function refCounts(el: HTMLElement): Map<string, number> {
  let m = counts.get(el);
  if (!m) {
    m = new Map();
    counts.set(el, m);
  }
  return m;
}

function tokens(el: HTMLElement): Set<string> {
  const raw = el.getAttribute(ATTR);
  return raw ? new Set(raw.split(/\s+/).filter(Boolean)) : new Set();
}

function writeTokens(el: HTMLElement, set: Set<string>): void {
  if (set.size) el.setAttribute(ATTR, [...set].join(' '));
  else el.removeAttribute(ATTR);
}

/**
 * Claim `property` on `el` for the raf channel - suppresses the matching CSS
 * transition for as long as the claim is held. Returns a release handle.
 * Ref-safe: overlapping claims on the same property are counted, so the marker
 * clears only when the last claim releases. The handle is idempotent.
 */
export function claimProperty(el: HTMLElement, property: string): Unsubscribe {
  const c = refCounts(el);
  c.set(property, (c.get(property) ?? 0) + 1);
  const set = tokens(el);
  set.add(property);
  writeTokens(el, set);

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const next = (c.get(property) ?? 1) - 1;
    if (next <= 0) {
      c.delete(property);
      const set2 = tokens(el);
      set2.delete(property);
      writeTokens(el, set2);
    } else {
      c.set(property, next);
    }
  };
}

/** Is `property` currently raf-owned on `el`? */
export function isPropertyClaimed(el: HTMLElement, property: string): boolean {
  return tokens(el).has(property);
}
