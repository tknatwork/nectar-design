#!/usr/bin/env node
/**
 * emit-component-drawplan.mjs — lays out the 32 component API tables as a masonry
 * grid below the token comparison board. Reads the workflow's extracted specs.
 *
 * Input:  /tmp/component-specs.json  (array of specs from extract-nectar-component-specs)
 * Output: /tmp/component-tables.json (per-table draw specs: title, subtitle, origin, w, h, rows[[tag,label,value]])
 *         /tmp/ct-<name>.json        (one compact file per component table for embedding)
 *
 * Row model: [tag, label, value]  tag ∈ ◆ axis · prop ▣ states # tokens + parts
 */
import { readFileSync, writeFileSync } from 'fs';

const specs = JSON.parse(readFileSync('/tmp/component-specs.json', 'utf8'));

const COLS = 4;
const COL_W = 460;
const COL_GAP = 60;
const ROW_GAP = 64;
const ROW_H = 26;
const HEAD_H = 70;
const SECTION_Y = 5360;          // below the sub-brand section (newY 4564 + ~360 + gap)
const X0 = 80;

function rowsFor(s) {
  const rows = [];
  for (const a of (s.variantAxes || [])) {
    rows.push(['◆', a.axis + (a.default ? ` (def: ${a.default})` : ''), (a.options || []).join(' · ')]);
  }
  for (const p of (s.props || []).slice(0, 10)) {
    const v = p.values && p.values.length ? p.values.join(' · ') : p.type;
    rows.push(['·', p.name, v]);
  }
  if (s.states && s.states.length) rows.push(['▣', 'states', s.states.join(', ')]);
  if (s.subcomponents && s.subcomponents.length) rows.push(['+', 'parts', s.subcomponents.join(', ')]);
  if (s.dependsOn && s.dependsOn !== 'none') rows.push(['⚙', 'depends on', s.dependsOn]);
  // tokens — may be many; chunk into rows of ~4 per line for readability
  const toks = s.tokensConsumed || [];
  for (let i = 0; i < toks.length; i += 4) {
    rows.push(['#', i === 0 ? 'tokens' : '', toks.slice(i, i + 4).join(' ')]);
  }
  return rows;
}

// masonry: place each table in the currently-shortest column
const colY = new Array(COLS).fill(SECTION_Y);
const tables = specs
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((s) => {
    const rows = rowsFor(s);
    const h = HEAD_H + rows.length * ROW_H + 12;
    const col = colY.indexOf(Math.min(...colY));
    const x = X0 + col * (COL_W + COL_GAP);
    const y = colY[col];
    colY[col] = y + h + ROW_GAP;
    return {
      id: 'cmp/' + s.name,
      title: s.name,
      subtitle: `${s.kind || 'component'} · ${s.variantCount || 1} variant${(s.variantCount || 1) === 1 ? '' : 's'}`,
      desc: s.description || '',
      origin: { x, y },
      w: COL_W,
      h,
      rows,
    };
  });

const plan = { sectionY: SECTION_Y - 90, tables, count: tables.length, bottom: Math.max(...colY) };
writeFileSync('/tmp/component-tables.json', JSON.stringify(plan));
for (const t of tables) writeFileSync(`/tmp/ct-${t.title}.json`, JSON.stringify(t));

console.log('✅ component draw plan → /tmp/component-tables.json');
console.log(`tables: ${tables.length}, canvas bottom y ≈ ${plan.bottom}`);
console.log(tables.map((t) => `${t.title}(${t.rows.length}r @${t.origin.x},${t.origin.y})`).join('\n  '));
