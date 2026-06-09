/**
 * ColorSwatch / ColorGrid — live colour specimens. Each reads its value via
 * useResolvedVar, so a swatch repaints when the engine (Heat/Depth) or sub-brand
 * changes — proving the token chain is live, not a snapshot.
 *
 *   <ColorSwatch cssVar="--primary" />
 *   <ColorGrid prefix="--seed-color-pastel" />
 *   <ColorGrid tokens={mySubset} />
 */
import { type TokenRow, tokensByPrefix, useResolvedVar } from '../tokens';

const MONO = 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)';

export function ColorSwatch({ cssVar, label }: { cssVar: string; label?: string }) {
  const resolved = useResolvedVar(cssVar);
  return (
    <figure style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0 }}>
      <div
        style={{
          height: 64,
          borderRadius: 'var(--radius-md, 8px)',
          background: `var(${cssVar})`,
          border: '1px solid color-mix(in oklch, var(--fg, #000) 12%, transparent)',
        }}
      />
      <figcaption style={{ fontSize: 12, fontWeight: 600, fontFamily: MONO }}>
        {label ?? cssVar.replace(/^--/, '')}
      </figcaption>
      <div style={{ fontFamily: MONO, fontSize: 11, opacity: 0.6 }}>{resolved || '…'}</div>
    </figure>
  );
}

export function ColorGrid({ prefix, tokens }: { prefix?: string; tokens?: TokenRow[] }) {
  const rows = tokens ?? (prefix ? tokensByPrefix(prefix) : []);
  if (!rows.length) return <p style={{ opacity: 0.6 }}>No colour tokens match.</p>;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 16,
        margin: '12px 0',
      }}
    >
      {rows.map((r) => (
        <ColorSwatch key={r.cssVar} cssVar={r.cssVar} label={r.cssVar.replace(/^--/, '')} />
      ))}
    </div>
  );
}
