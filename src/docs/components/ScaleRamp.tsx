/**
 * ScaleRamp — live spacing / radius scale specimens, driven by the token rows.
 * `kind="radius"` renders rounded squares from `--map-borderRadius-*`;
 * `kind="spacing"` renders proportional bars from `--seed-spacing-*`. Each cell
 * reads its value live, so the ramp reflects the current build.
 *
 *   <ScaleRamp kind="radius" />
 *   <ScaleRamp kind="spacing" />
 */
import { tokensByPrefix, useResolvedVar } from '../tokens';

const MONO = 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)';

function RadiusCell({ cssVar }: { cssVar: string }) {
  const v = useResolvedVar(cssVar);
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div
        style={{
          width: 72,
          height: 72,
          background: 'color-mix(in oklch, var(--primary, #888) 20%, transparent)',
          border: '2px solid color-mix(in oklch, var(--primary, #888) 55%, transparent)',
          borderRadius: `var(${cssVar})`,
        }}
      />
      <figcaption style={{ fontFamily: MONO, fontSize: 11 }}>
        {cssVar.replace(/^--map-borderRadius-/, '')}
        <span style={{ opacity: 0.55 }}> · {v || '…'}</span>
      </figcaption>
    </figure>
  );
}

function SpacingBar({ cssVar }: { cssVar: string }) {
  const v = useResolvedVar(cssVar);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
      <code style={{ fontFamily: MONO, fontSize: 11, width: 150, opacity: 0.8 }}>{cssVar.replace(/^--/, '')}</code>
      <div style={{ height: 14, width: `var(${cssVar})`, background: 'var(--primary, #888)', borderRadius: 3, flex: 'none' }} />
      <span style={{ fontFamily: MONO, fontSize: 11, opacity: 0.55 }}>{v || '…'}</span>
    </div>
  );
}

export function ScaleRamp({ kind, prefix }: { kind: 'radius' | 'spacing'; prefix?: string }) {
  const p = prefix ?? (kind === 'radius' ? '--map-borderRadius' : '--seed-spacing');
  const rows = tokensByPrefix(p);
  if (!rows.length) return <p style={{ opacity: 0.6 }}>No scale tokens match.</p>;
  if (kind === 'radius') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, margin: '12px 0' }}>
        {rows.map((r) => (
          <RadiusCell key={r.cssVar} cssVar={r.cssVar} />
        ))}
      </div>
    );
  }
  return (
    <div style={{ margin: '12px 0' }}>
      {rows.map((r) => (
        <SpacingBar key={r.cssVar} cssVar={r.cssVar} />
      ))}
    </div>
  );
}
