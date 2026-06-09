/**
 * VariantMatrix — renders a component's variant cross-product for its docs.
 * One axis → a labelled row of instances; two axes → a labelled grid.
 *
 *   <VariantMatrix component={Button}
 *     rows={{ prop: 'intent', values: ['primary','accent','outline'] }}
 *     cols={{ prop: 'size', values: ['sm','md','lg'] }}
 *     baseArgs={{ children: 'Button' }} />
 */
import { createElement, type ComponentType, type CSSProperties } from 'react';

const MONO = 'var(--font-mono, ui-monospace, SFMono-Regular, monospace)';
const label: CSSProperties = { fontFamily: MONO, fontSize: 11, opacity: 0.6 };

interface Axis {
  prop: string;
  values: Array<string | number>;
}

export interface VariantMatrixProps {
  component: ComponentType<Record<string, unknown>>;
  rows: Axis;
  cols?: Axis;
  baseArgs?: Record<string, unknown>;
}

export function VariantMatrix({ component: C, rows, cols, baseArgs = {} }: VariantMatrixProps) {
  if (!cols) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', margin: '12px 0' }}>
        {rows.values.map((rv) => (
          <div key={String(rv)} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
            {createElement(C, { ...baseArgs, [rows.prop]: rv })}
            <span style={label}>
              {rows.prop}={String(rv)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <table style={{ borderCollapse: 'collapse', margin: '12px 0' }}>
      <thead>
        <tr>
          <th />
          {cols.values.map((cv) => (
            <th key={String(cv)} style={{ ...label, padding: '6px 12px', textAlign: 'center' }}>
              {cols.prop}={String(cv)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.values.map((rv) => (
          <tr key={String(rv)}>
            <th style={{ ...label, padding: '6px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
              {rows.prop}={String(rv)}
            </th>
            {cols.values.map((cv) => (
              <td key={String(cv)} style={{ padding: '8px 12px', textAlign: 'center' }}>
                {createElement(C, { ...baseArgs, [rows.prop]: rv, [cols.prop]: cv })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
