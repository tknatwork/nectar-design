#!/usr/bin/env node
/**
 * emit-figma-drawplan.mjs — computes a complete on-canvas DRAW PLAN for the
 * design-system comparison board (canvas tables, NOT variables/styles).
 *
 * Layout: two stacked sections.
 *   MAIN — 5-tier token pipeline: Primitives → Seed → Map → Semantic → Component → Theme
 *          (six tables in a left→right row, connectors between consecutive tiers)
 *   NEW  — sub-brand update: Master defaults + Ambiguity + Systems override tables
 *          (connectors: Master → each sub-brand; sub-brand section → Theme)
 *
 * Each table = { id, title, origin{x,y}, colSpec, rows:[{cells, swatch?}], w, h }.
 * Connectors = { from, to, fromPt{x,y}, toPt{x,y}, label }.
 * Output: /tmp/figma-drawplan.json
 */
import { readFileSync, writeFileSync } from 'fs';

const P = JSON.parse(readFileSync('/tmp/figma-payloads.json', 'utf8'));
const RES = JSON.parse(readFileSync('/tmp/nectar-tokens-resolved.json', 'utf8'));

const ROW_H = 30, HEAD_H = 64, GAP_X = 140, isHex = (v) => typeof v === 'string' && /^#([0-9a-f]{3,8})$/i.test(v);

// Column layouts per table kind
const COLS_COLOR = [{ k: 'swatch', w: 40 }, { k: 'name', w: 230 }, { k: 'value', w: 110 }, { k: 'css', w: 260 }];
const COLS_PLAIN = [{ k: 'name', w: 230 }, { k: 'value', w: 150 }, { k: 'css', w: 260 }];
const tableW = (cols) => cols.reduce((s, c) => s + c.w, 0);

function buildTable(id, title, subtitle, items, origin) {
  // items: [{n, v, t, css}]
  const anyColor = items.some((it) => it.t === 'COLOR' || isHex(it.v));
  const cols = anyColor ? COLS_COLOR : COLS_PLAIN;
  const rows = items.map((it) => ({
    name: it.n,
    value: String(it.v),
    css: it.css || '',
    swatch: (it.t === 'COLOR' || isHex(it.v)) ? it.v : null,
  }));
  const w = tableW(cols);
  const h = HEAD_H + rows.length * ROW_H;
  return { id, title, subtitle, origin, cols, rows, w, h };
}

const tables = [];
const connectors = [];

// ── MAIN: 5-tier pipeline, left→right ──────────────────────────────────────────
const mainY = 220;
let x = 80;
const tierDefs = [
  ['main/primitives', 'Primitives', 'tier 1 · raw values', P.primitives],
  ['main/seed', 'Seed', 'tier 2 · brand decisions', P.seed],
  ['main/map', 'Map', 'tier 3 · derived (color-mix resolved)', P.map],
  ['main/semantic', 'Semantic', 'tier 4 · aliases', P.semantic],
  ['main/component', 'Component', 'tier 5 · per-component', P.component],
];
for (const [id, title, sub, items] of tierDefs) {
  const t = buildTable(id, title, sub, items, { x, y: mainY });
  tables.push(t);
  x += t.w + GAP_X;
}
// Theme table (flatten light mode for display; note 3 modes)
const themeItems = Object.entries(P.themes.light).map(([n, v]) => ({ n, v, t: 'COLOR', css: `--${n}` }));
const themeTable = buildTable('main/theme', 'Theme', 'tier 5 · Light / Dark / High-Contrast (Light shown)', themeItems, { x, y: mainY });
tables.push(themeTable);

// connectors between consecutive main tables (header band → header band)
const mainIds = ['main/primitives', 'main/seed', 'main/map', 'main/semantic', 'main/component', 'main/theme'];
for (let i = 0; i < mainIds.length - 1; i++) {
  const a = tables.find((t) => t.id === mainIds[i]);
  const b = tables.find((t) => t.id === mainIds[i + 1]);
  connectors.push({
    from: a.id, to: b.id,
    fromPt: { x: a.origin.x + a.w, y: a.origin.y + 32 },
    toPt: { x: b.origin.x, y: b.origin.y + 32 },
    label: i === mainIds.length - 2 ? 'resolves to' : '→',
  });
}

// ── NEW: sub-brand update section, below ────────────────────────────────────────
const tallestMain = Math.max(...tables.map((t) => t.origin.y + t.h));
const newY = tallestMain + 260;

// Master defaults table (the 12-knob baseline)
const sb = RES.subBrands;
function knobRows(obj) {
  const rows = [];
  for (const [grp, props] of Object.entries(obj)) {
    if (!props || typeof props !== 'object') continue;
    for (const [k, val] of Object.entries(props)) {
      const v = (val && typeof val === 'object' && 'value' in val) ? val.value : val;
      rows.push({ n: `${grp}.${k}`, v: String(v), t: isHex(v) ? 'COLOR' : 'STRING', css: '' });
    }
  }
  return rows;
}
const masterTable = buildTable('new/master', 'Master defaults', 'baseline · 12-knob surface', knobRows(sb._master), { x: 80, y: newY });
tables.push(masterTable);

let sx = 80 + masterTable.w + GAP_X;
for (const name of Object.keys(sb).filter((k) => k !== '_master')) {
  const rec = sb[name];
  const t = buildTable(`new/${name}`, rec.displayName || name, `sub-brand · overrides only`, knobRows(rec.overrides), { x: sx, y: newY });
  tables.push(t);
  connectors.push({
    from: 'new/master', to: t.id,
    fromPt: { x: masterTable.origin.x + masterTable.w, y: masterTable.origin.y + 32 },
    toPt: { x: t.origin.x, y: t.origin.y + 32 },
    label: 'inherits',
  });
  sx += t.w + GAP_X;
}
// connector: sub-brand section overrides the Theme tier
connectors.push({
  from: 'new/master', to: 'main/theme',
  fromPt: { x: masterTable.origin.x + masterTable.w / 2, y: masterTable.origin.y },
  toPt: { x: themeTable.origin.x + themeTable.w / 2, y: themeTable.origin.y + themeTable.h },
  label: 'layers onto theme (v2: brand modes)',
});

const plan = {
  meta: { rowH: ROW_H, headH: HEAD_H,
    sections: [{ name: 'MAIN — 5-Tier Token Pipeline', y: mainY - 90 }, { name: 'NEW — Sub-Brand Update (Branded House)', y: newY - 90 }] },
  tables, connectors,
};
writeFileSync('/tmp/figma-drawplan.json', JSON.stringify(plan));
// per-table files for compact embedding during render (positional rows: [name,value,css,swatch])
for (const t of tables) {
  const compact = { id: t.id, title: t.title, subtitle: t.subtitle, origin: t.origin, w: t.w, h: t.h,
    rows: t.rows.map((r) => [r.name, r.value, r.css, r.swatch]) };
  writeFileSync(`/tmp/dt-${t.id.replace(/\//g, '_')}.json`, JSON.stringify(compact));
}
writeFileSync('/tmp/figma-connectors.json', JSON.stringify(connectors));

console.log('✅ draw plan → /tmp/figma-drawplan.json');
console.log('tables:', tables.map((t) => `${t.id}(${t.rows.length}r ${t.w}x${t.h} @${t.origin.x},${t.origin.y})`).join('\n  '));
console.log('connectors:', connectors.length);
