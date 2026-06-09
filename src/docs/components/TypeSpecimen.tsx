/**
 * TypeSpecimen / TypeRamp — live type specimens. Each renders a sample at a
 * font-size token and reads the resolved value live. TypeRamp walks every token
 * under a prefix (default the `--map-fontSize-*` scale).
 *
 *   <TypeSpecimen sizeVar="--map-fontSize-Heading1" family="display" />
 *   <TypeRamp />
 */
import { tokensByPrefix, useResolvedVar } from '../tokens';

const MONO = 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)';

export function TypeSpecimen({
  sizeVar,
  label,
  sample = 'The quick brown fox jumps over the lazy dog',
  family,
}: {
  sizeVar: string;
  label?: string;
  sample?: string;
  family?: string;
}) {
  const size = useResolvedVar(sizeVar);
  return (
    <div
      style={{
        borderBottom: '1px solid color-mix(in oklch, var(--border, #888) 40%, transparent)',
        padding: '14px 0',
      }}
    >
      <div
        style={{
          fontSize: `var(${sizeVar})`,
          lineHeight: 1.15,
          fontFamily: family ? `var(--font-${family}, inherit)` : 'inherit',
          margin: 0,
        }}
      >
        {sample}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        {label ?? sizeVar.replace(/^--/, '')} · {size || '…'}
      </div>
    </div>
  );
}

export function TypeRamp({ prefix = '--map-fontSize', sample }: { prefix?: string; sample?: string }) {
  const rows = tokensByPrefix(prefix);
  if (!rows.length) return <p style={{ opacity: 0.6 }}>No type tokens match.</p>;
  return (
    <div style={{ margin: '12px 0' }}>
      {rows.map((r) => (
        <TypeSpecimen key={r.cssVar} sizeVar={r.cssVar} sample={sample} />
      ))}
    </div>
  );
}
