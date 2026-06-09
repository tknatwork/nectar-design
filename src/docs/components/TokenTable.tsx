/**
 * TokenTable — auto-generated token reference, sourced from the parsed
 * css/tokens.css (see ../tokens). Every row resolves its value LIVE via
 * useResolvedVar, so the table repaints when the Heat/Depth/Brand toolbars
 * change. Colour rows get a swatch chip (detected from the resolved value).
 *
 *   <TokenTable tier="Map" group="borderRadius" />
 *   <TokenTable prefix="--button-" showVar />
 *   <TokenTable tokens={mySubset} />
 */
import type { CSSProperties } from 'react';
import { type Tier, type TokenRow, tokenByName, tokensByPrefix, tokensByTier, useResolvedVar } from '../tokens';

const MONO = 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)';
const cell: CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid color-mix(in oklch, var(--border, #888) 50%, transparent)',
  verticalAlign: 'top',
  textAlign: 'left',
};
const th: CSSProperties = {
  ...cell,
  fontWeight: 600,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  opacity: 0.65,
};

/** A computed value is a colour if it starts with a colour token. */
function isColor(v: string): boolean {
  return /^(#|rgb|hsl|oklch|lab|lch|color\()/i.test(v.trim());
}

function TokenRowView({ row, showVar }: { row: TokenRow; showVar: boolean }) {
  const resolved = useResolvedVar(row.cssVar);
  const color = isColor(resolved);
  return (
    <tr>
      <td style={cell}>
        <strong style={{ fontSize: 13, fontFamily: MONO }}>{row.cssVar.replace(/^--/, '')}</strong>
        {row.description && (
          <div style={{ fontSize: 11, opacity: 0.62, marginTop: 2, maxWidth: 320 }}>{row.description}</div>
        )}
      </td>
      <td style={{ ...cell, fontFamily: MONO, fontSize: 12, opacity: 0.85 }}>{row.rawValue}</td>
      <td style={{ ...cell, fontFamily: MONO, fontSize: 12 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {color && (
            <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: `var(${row.cssVar})`,
                border: '1px solid color-mix(in oklch, var(--fg, #000) 18%, transparent)',
                flex: 'none',
              }}
            />
          )}
          {resolved || <span style={{ opacity: 0.4 }}>…</span>}
        </span>
      </td>
      {showVar && (
        <td style={{ ...cell, fontFamily: MONO, fontSize: 12, opacity: 0.6 }}>var({row.cssVar})</td>
      )}
    </tr>
  );
}

export interface TokenTableProps {
  /** Pick a whole tier… */
  tier?: Tier;
  /** …or a var-name prefix (e.g. `--map-color`, `--button-`)… */
  prefix?: string;
  /** …or pass an explicit row subset. */
  tokens?: TokenRow[];
  /** …or an explicit, ordered list of CSS var names (for a "Tokens used" section). */
  names?: string[];
  /** Further narrow by a substring of the var name. */
  group?: string;
  /** Show the raw `var(--x)` column (off by default). */
  showVar?: boolean;
}

export function TokenTable({ tier, prefix, tokens, names, group, showVar = false }: TokenTableProps) {
  let rows: TokenRow[] =
    tokens ??
    (names
      ? names.map((n) => tokenByName(n)).filter((r): r is TokenRow => Boolean(r))
      : prefix
        ? tokensByPrefix(prefix)
        : tier
          ? tokensByTier(tier)
          : []);
  if (group) rows = rows.filter((r) => r.cssVar.includes(group));
  if (!rows.length) return <p style={{ opacity: 0.6 }}>No tokens match.</p>;
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', margin: '12px 0', fontSize: 13 }}>
      <thead>
        <tr>
          <th style={th}>Token</th>
          <th style={th}>Value</th>
          <th style={th}>Resolved</th>
          {showVar && <th style={th}>CSS var</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <TokenRowView key={r.cssVar} row={r} showVar={showVar} />
        ))}
      </tbody>
    </table>
  );
}
