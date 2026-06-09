'use client';

import { motion } from 'motion/react';
import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useNectarOptional } from '../provider';

/** Shape the host's link component must accept (Next's `Link`, a plain `<a>`, etc.). */
export interface NavPillLinkProps {
  href: string;
  className?: string;
  style?: CSSProperties;
  'aria-current'?: 'page';
  children: ReactNode;
}

export interface NavPillItem {
  label: string;
  href: string;
  /** Host computes active (it owns routing); the active item gets the sliding pill. */
  active?: boolean;
}

export interface NavPillProps {
  /** Nav destinations. The host supplies these + which is `active`. */
  items: NavPillItem[];
  /** Brand mark (e.g. `{ label: 'TKN', href: '/' }`) — renders with a blinking accent dot. */
  brand: { label: string; href: string };
  /**
   * Link component the host injects so nd stays framework-agnostic (Next's
   * `Link`, React Router's, or a plain anchor). Defaults to `<a>`.
   */
  LinkComponent?: ComponentType<NavPillLinkProps>;
  /** Override the self-managed dark state (optional). */
  isDark?: boolean;
  /** Override the self-managed theme toggle (optional). */
  onToggleTheme?: () => void;
}

// Each nav colour reads a self-contained sub-brand override (--nav-*, ADR 0026)
// and falls back to the engine-derived default. Those vars are UNSET except
// under a .sub-brand-{slug} wrapper that opts in, so the master-brand nav is
// unchanged. (EAST renders this NavPill under .sub-brand-systems-thinking.)
const ACTIVE_BG = 'var(--nav-active-bg, oklch(var(--L-heading) 0.01 var(--dynamic-hue)))';
const ACTIVE_TEXT = 'var(--nav-active-fg, oklch(var(--L-bg) 0.005 var(--dynamic-hue)))';
const REST_TEXT = 'var(--nav-fg-muted, oklch(var(--L-body) 0.02 var(--dynamic-hue)))';

const DefaultLink: ComponentType<NavPillLinkProps> = (props) => <a {...props} />;

/**
 * Self-managed depth read + toggle. `isDark` observes --ui-depth on
 * documentElement (engine-agnostic — the Nectar engine writes it there each
 * frame during a sweep). The toggle defers to NectarProvider's depth control
 * (animated golden-hour sweep + persistence) when a provider is mounted, and
 * falls back to a direct instant write in isolation (Storybook / tests).
 */
function useSelfDepth(): { isDark: boolean; toggle: () => void } {
  const [isDark, setIsDark] = useState(false);
  const nectar = useNectarOptional();
  const engineToggle = nectar?.depth.toggle;

  useEffect(() => {
    const read = () => {
      const v = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--ui-depth'),
      );
      setIsDark((Number.isFinite(v) ? v : 100) > 50);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => {
    if (engineToggle) {
      engineToggle();
      return;
    }
    const root = document.documentElement;
    const current = parseFloat(getComputedStyle(root).getPropertyValue('--ui-depth'));
    const next = (Number.isFinite(current) ? current : 100) > 50 ? 0 : 100;
    try {
      localStorage.setItem('nectar-depth', String(next));
    } catch {
      /* localStorage unavailable (private window / sandboxed iframe) */
    }
    root.style.setProperty('--ui-depth', String(next));
  }, [engineToggle]);

  return { isDark, toggle };
}

/**
 * NavPill — the presentational floating nav primitive (relocated into nd in the
 * consolidation; the app's former `app/components/v2/NavPill` is now a thin
 * wrapper that injects Next's `Link` + routes + active state). Renders the glass
 * (now solid-by-default) chrome, a brand mark, the nav items with a shared
 * sliding active pill (Framer `layoutId`), and an engine-aware depth toggle.
 *
 * Framework-agnostic: routing arrives via `items` (+ `active`) and `LinkComponent`.
 * Sub-brand theming is automatic via the `--nav-*` CSS vars under a
 * `.sub-brand-{slug}` scope. Position/centring are owned by the host wrapper —
 * this is a plain `<nav>` with no `position`/`top`/`left`.
 */
export function NavPill({
  items,
  brand,
  LinkComponent = DefaultLink,
  isDark: isDarkProp,
  onToggleTheme,
}: NavPillProps) {
  const self = useSelfDepth();
  const isDark = isDarkProp ?? self.isDark;
  const toggle = onToggleTheme ?? self.toggle;
  const Link = LinkComponent;

  return (
    <nav
      aria-label="Site navigation"
      // Glass treatment is driven by the .glass + .glass--chrome class pair
      // (solid-by-default since 2026-06-08; opt into translucency with
      // data-glass-effect="on"). Sub-brands override the chrome material.
      className="glass glass--chrome"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 6,
        // Keep the signature fully-rounded pill shape (overrides the DS radius).
        borderRadius: 9999,
      }}
    >
      <Link
        href={brand.href}
        style={{
          fontFamily: "var(--typography-display-family, 'Plus Jakarta Sans', var(--font-sans))",
          fontWeight: 'var(--seed-typography-fontWeight-bold)',
          letterSpacing: '-0.02em',
          fontSize: 14,
          padding: '8px 14px 8px 16px',
          color: 'var(--nav-fg, oklch(var(--L-heading) 0.01 var(--dynamic-hue)))',
          textDecoration: 'none',
        }}
      >
        {brand.label}
        <span
          style={{
            color: 'var(--nav-active-bg, oklch(var(--L-accent) var(--C-accent) var(--dynamic-hue)))',
            animation: 'blink 1.6s ease-in-out infinite',
          }}
        >
          .
        </span>
      </Link>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          style={{
            position: 'relative',
            textDecoration: 'none',
            padding: '8px 14px',
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 'var(--seed-typography-fontWeight-medium)',
            // Sub-brand label treatment (ADR 0026). Unset → none/normal/inherit.
            textTransform: 'var(--nav-label-transform, none)' as CSSProperties['textTransform'],
            letterSpacing: 'var(--nav-label-tracking, normal)',
            fontFamily: 'var(--nav-label-family, inherit)',
            color: item.active ? ACTIVE_TEXT : REST_TEXT,
            transition: 'color 280ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {item.active && (
            <motion.span
              layoutId="nav-active-pill"
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 9999,
                background: ACTIVE_BG,
                zIndex: 0,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.8 }}
            />
          )}
          <span style={{ position: 'relative', zIndex: 1 }}>{item.label}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          // Hidden under sub-brands that omit the toggle (--nav-toggle-display).
          display: 'var(--nav-toggle-display, flex)',
          alignItems: 'center',
          justifyContent: 'center',
          width: 34,
          height: 34,
          borderRadius: '50%',
          border: 'none',
          background: 'oklch(var(--L-heading) 0.01 var(--dynamic-hue) / 0.08)',
          color: 'oklch(var(--L-heading) 0.01 var(--dynamic-hue))',
          cursor: 'pointer',
          marginLeft: 2,
          transition: 'background-color 200ms, transform 200ms var(--ease-out)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isDark ? (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx={12} cy={12} r={5} />
            <line x1={12} y1={1} x2={12} y2={3} />
            <line x1={12} y1={21} x2={12} y2={23} />
            <line x1={4.22} y1={4.22} x2={5.64} y2={5.64} />
            <line x1={18.36} y1={18.36} x2={19.78} y2={19.78} />
            <line x1={1} y1={12} x2={3} y2={12} />
            <line x1={21} y1={12} x2={23} y2={12} />
            <line x1={4.22} y1={19.78} x2={5.64} y2={18.36} />
            <line x1={18.36} y1={5.64} x2={19.78} y2={4.22} />
          </svg>
        ) : (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </nav>
  );
}
