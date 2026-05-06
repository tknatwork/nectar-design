# Audit — repo vs. live vs. on-site docs

**As of:** May 5, 2026
**Sources audited:**
- `tknatwork/myportfolio` (the running site, Next.js 16 app)
- `tknatwork/nectar-design` (the published token package)
- `https://tusharkantnaik.com` (the live render, behind AccessGate)
- `https://design.tusharkantnaik.com` (the on-site `/design-system` route)

The point of this document is to surface where the system disagrees with itself
*before* we extend it. Everything below is a real divergence, not a stylistic
preference.

---

## 1. Two design systems run in parallel, and the runtime one wins

`globals.css` (in `myportfolio`) imports the Nectar token pipeline:

```css
@import "nectar-design/tokens.css" layer(tokens);
@import "nectar-design/theme.css";
@import "nectar-design/circadian.css" layer(circadian);
```

…and then, immediately below, **redefines every consumed CSS variable** from a
Heat × Depth oklch engine:

```css
:root {
  --ui-heat: 0;     /* 0–100 — interaction → hue */
  --ui-depth: 100;  /* 0–100 — toggle → lightness */
  --dynamic-hue: calc(250 - (var(--ui-heat) * 2.1) + var(--golden-hue-shift));

  --L-bg:      calc(0.96 - (var(--ui-depth) / 100) * 0.81);
  --L-heading: calc(0.20 + (var(--ui-depth) / 100) * 0.75);
  /* …six more lightness anchors… */

  --bg:      oklch(var(--L-bg) var(--C-bg) var(--dynamic-hue));
  --fg:      oklch(var(--L-body) 0.03 var(--dynamic-hue));
  --primary: oklch(var(--L-accent) var(--C-accent) var(--dynamic-hue));
  /* …all other semantic vars overridden the same way… */
}
```

So:

- **The `nectar-design` package loads** (its CSS is parsed, its `@font-face`
  rules register, its tokens are present at `--seed-*`).
- **But the values that paint pixels** (`--bg`, `--fg`, `--primary`,
  `--surface`, `--muted-fg`, `--border`, `--ring`) are *all* replaced by the
  Heat × Depth engine.

The on-site `/design-system` route documents the **token package**. The chrome
the visitor is reading those docs *inside* is rendered by the **engine**. They
describe two different systems.

**Reconciliation:** This project treats the **Heat × Depth engine** as the
source of truth for color. The Nectar token tiers stay documented as the
authoring layer (where seeds live, where future themes get registered), but
any color you actually write into a component must read from the engine vars
(`oklch(var(--L-…) var(--C-…) var(--dynamic-hue))`) or from the bridged
semantic aliases (`bg-bg`, `text-fg`, `bg-primary`, `text-muted-fg`).

---

## 2. Documented fonts ≠ shipped fonts

The on-site Typography page lists:

| Slot | Documented | Actually loaded in `layout.tsx` |
|---|---|---|
| Display | Libre Baskerville | **Google Sans Flex** (1–1000 wght) — primary, preloaded |
| Sans | Switzer | **Plus Jakarta Sans** (200–800, italic) |
| Caption | Merriweather | **Crimson Pro** (200–900, italic) |
| Mono | Roboto Mono | **Monaspace Neon** |
| Serif | (not listed) | **Playfair Display** (400–900, italic) |

All five are self-hosted as woff2 under `app/fonts/` and exposed as
CSS variables:
`--font-google-sans-flex`, `--font-plus-jakarta`, `--font-playfair`,
`--font-crimson`, `--font-monaspace`. The Tailwind theme aliases are then
mapped at the *app* level, not the package level:

```css
@theme {
  --font-sans:    var(--font-plus-jakarta, var(--seed-typography-fontFamily-sans));
  --font-display: var(--font-google-sans-flex, var(--seed-typography-fontFamily-display));
  --font-serif:   var(--font-playfair, var(--seed-typography-fontFamily-serif));
  --font-caption: var(--font-crimson, var(--seed-typography-fontFamily-caption));
  --font-mono:    var(--font-monaspace, var(--seed-typography-fontFamily-mono));
}
```

**Reconciliation:** Type in this project follows the *shipped* stack
(Google Sans Flex / Plus Jakarta / Playfair / Crimson Pro / Monaspace Neon).
The on-site docs page is a known-stale artifact and is filed under
"things to fix in `myportfolio`," not something to copy.

---

## 3. There is no brutalism on the live site

Earlier in this project I described "brutalist controls + glass surfaces" as a
pairing rule. **That rule was invented.** The live site has one surface
treatment — `GlassCard` (and the matching `glass-surface` utility) — and
"controls" (buttons, chips, the nav pill) are rendered with the same
honey-tinted oklch background, 1.5px borders, and backdrop-blur as the
cards themselves.

The CTAs in `HeroSection` are the proof:

```tsx
// Primary CTA — filled, but in engine colors, not flat black/white
<Link className="rounded-[14px] bg-action px-5 py-3 text-sm font-semibold text-action"
      style={{ boxShadow: '0 4px 16px oklch(0.3 0.1 var(--dynamic-hue) / 0.35)' }}>
  View Work →
</Link>

// Secondary CTA — translucent, hairline border, body-color text
<Link className="rounded-[14px] border border-white/[0.08] bg-white/[0.03]
                 px-5 py-3 text-sm font-semibold text-body">
  Get in Touch
</Link>
```

Both buttons live inside the same `GlassCard` and inherit its idiom.

**Reconciliation:** Drop "brutalist controls." The full system is
**glass-on-atmosphere** — translucent surfaces over a Heat-driven background.
Where contrast or weight is needed, raise depth (`floating`) or fill
with `bg-action`, not invert to a flat slab.

---

## 4. AccessGate, Ink Routes, and per-project tints — patterns I missed

These are real, in-production patterns that any new component or page has to
acknowledge:

**AccessGate** — Server Component at the layout root. Every route except
`/privacy` and `/admin/*` is gated behind a terms-acceptance overlay
(`GateOverlay`) until the visitor sets the `ACCEPTED_COOKIE`. The gate
is what crawlers see; SSR only emits the gate markup unless the cookie
is present. Anything we mock that is supposed to be "what visitors see"
must show the AccessGate first, *or* the post-gate state with the
`AccessGate` already cleared.

**Ink Routes** — bespoke case-study pages (currently only
`/projects/systems-thinking-experiments` — the E.A.S.T case study) opt
out of the glass + Heat engine entirely. They render on opaque
`#0A0A0D` ink with `#F4ECE0` bone text, ship their own top nav, and
suppress `GlassNav` and `HeatLayer`. The shared predicate is
`isInkRoute(pathname)` in `app/lib/ink-routes.ts`. If we add a new
case study and want full art direction control, this is the escape
hatch — not a tweak to the global engine.

**Per-project glass tints** — `CaseStudyGrid` carries a
`WORK_SECTION_OVERRIDES[slug]` map. Each entry can override
`renderTitle`, `renderRole`, `renderDescription`, `renderTag`,
`hoverLift`, and `glassStyle`. The Ambiguity card is the only one
populated today, and it tints its glass via `color-mix(in oklch, …)`
between a fixed identity hue and `--dynamic-hue` so the card breathes
with the Heat engine while still reading as "the red project."
This is the documented mechanism for project-specific brand
expression — don't fork the component, add a row to the override map.

---

## 5. Voice corrections

I had earlier paraphrased the voice as "designer-engineer notebook." The
shipped copy is more specific and has a different rhythm. Quoting the live
strings verbatim, since they're the ground truth:

> "Trained at IIITDM Jabalpur and NID Ahmedabad. This site is part
> showcase, part open notebook — built hands-on, with AI tooling, while
> I learn the engineering that ships design."

> "A designer. Learning the engineering that ships design."

> "I'm a tinkerer; I pick up new tools, play with them, and keep what
> sticks."

Section headers split work into **Practice** (filled chips: Industrial
Design, Product Design, Design Systems, Prototyping, Motion Design,
Accessibility, Design Tokens) and **In the lab — currently learning**
(dashed-outline chips: React / Next.js, TypeScript, Tailwind CSS,
GSAP · motion.dev, Claude · Copilot). The dashed border is *intentional*
— it visually marks "under construction."

The all-caps eyebrow `text-[11px] font-semibold uppercase tracking-[0.14em]
text-accent` is the recurring section-label pattern, used everywhere from
the hero eyebrow to the "Selected Work" header.

---

## What this audit changes in this project

1. `colors_and_type.css` is being rewritten to expose the Heat × Depth
   engine variables and the bridged semantic aliases as the *primary*
   API, with the Nectar seed/alias tiers preserved for completeness.
2. `README.md` drops the brutalism pairing rule, documents the two
   engines (Heat, Depth) as the real foundation, and replaces speculative
   voice notes with the verbatim shipped copy patterns.
3. `preview/components.html` is being rewritten around real `GlassCard`
   sizes and depths and the `bg-action` / glass-secondary CTA pair —
   no brutalist variants.
4. `preview/colors.html` is being rewritten to show the two axes
   (Heat sweep at fixed Depth, Depth sweep at fixed Heat) instead of
   a flat semantic swatch grid.
5. `kits/portfolio.html` is being aligned to the actual `GlassHome`
   composition: `HeroSection` → `CaseStudyGrid` → `AboutSection` →
   `GlassFooter`, with the `GlassNav` floating pill on top.
6. `SKILL.md` will point any future agent at the engines + the override
   map first, *before* reaching for the token package.

---

## 6. The on-site `/design-system` route — what's actually there

The route is **not** a stale single page. As of `myportfolio@dev`, it's
a structured docs site under `app/app/design-system/`:

```
design-system/
  layout.tsx              ← shared chrome (sidebar from components/DesignSystem/Sidebar.tsx)
  page.tsx                ← landing
  colors/page.tsx
  typography/page.tsx
  spacing/page.tsx
  motion/page.tsx
  theming/page.tsx
  components/
    badge/page.tsx
    button/page.tsx
    card/page.tsx
    input/page.tsx
```

So the "design.tusharkantnaik.com" reference in §1 is misleading —
the design-system docs render **at the same origin as the rest of the
site**, not on a separate Storybook deploy. Storybook still exists in
`nectar-design`, but the live, public-facing docs are these Next.js
routes.

**Site-side fixes the audit logs (for the future `myportfolio` PR):**

- **`typography/page.tsx`** — confirm the listed families match what
  `app/layout.tsx` actually loads. The layout loads Google Sans Flex,
  Plus Jakarta Sans, Playfair Display, Crimson Pro, Monaspace Neon.
  Anything else (Libre Baskerville, Switzer, Merriweather, Roboto Mono)
  on the page is documenting an older stack and must be corrected.
- **`components/button/page.tsx`** and **`components/card/page.tsx`** —
  ensure the documented variants reflect the live `bg-action` + glass
  pair from `HeroSection`. Drop any "brutalist" naming if present.
- **`theming/page.tsx`** — must document the **Heat × Depth engine**
  (the variables in `app/globals.css`), not just the seed/map/semantic
  tiers from `nectar-design`. The engine is what paints pixels; the
  tiers are the authoring layer.
- **Add a `theming/overrides` section** — `WORK_SECTION_OVERRIDES` in
  `CaseStudyGrid.tsx` is the documented escape hatch for per-project
  glass tints. It's currently undocumented in the on-site route.
- **`layout.tsx`** — the shared design-system layout (with
  `Sidebar.tsx`) sits *inside* `AccessGate`. Confirm gated routing
  is intentional; if these docs should be pre-gate (so crawlers and
  unaccepted visitors can read them), move the route group.

None of the above are bugs in this project — they are tracked here so
that the next agent working in `myportfolio` has the diff in one place.
