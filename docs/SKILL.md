# Nectar Design System — Skill

This is the build-time skill manifest for AI agents working in this project.
It tells you what to read first, where the source of truth lives, and the
non-negotiables when proposing changes.

## What this project is

A flattened, prototype-friendly mirror of two production repos:

- `tknatwork/nectar-design` — the published token + component package.
- `tknatwork/myportfolio` — the Next.js 16 app that runs the live site,
  including the Heat × Depth engine and the circadian engine.

This project ships:

- `colors_and_type.css` — Heat × Depth engine, semantic aliases, fonts,
  GlassCard variants, action button pair.
- `fonts/` — six variable woff2 files (Plus Jakarta Sans, Google Sans Flex,
  Playfair Display + Italic, Crimson Pro, Monaspace Neon).
- `preview/` — five specimen pages: type, colors, spacing, components, brand.
- `kits/` — full-page UI kits: `portfolio.html`, `storybook.html`.
- `audit/INCONSISTENCIES.md` — the recorded diff between the package, the
  on-site `/design-system` docs, and the live site.
- `README.md` — voice, capitalization, engine docs, extension protocol.

## Reading order

1. `audit/INCONSISTENCIES.md` — read this **first**. The repo and the
   on-site docs disagree about fonts, color tokens, and surface treatment.
   The audit explains which side this project takes (always: the live site).
2. `README.md` — voice, engines, capitalization, extension protocol.
3. `colors_and_type.css` — the wire format. Heat × Depth math is at
   the top; semantic aliases, classes, and component utilities below.
4. `preview/colors.html` and `preview/components.html` — see the engine
   rendered, with sliders.
5. `kits/portfolio.html` — canonical layout pattern, verbatim from
   `GlassHome`.

## Source of truth

- **Color & lightness:** `myportfolio/app/globals.css` Heat × Depth block.
  All semantic vars are `oklch(var(--L-…) var(--C-…) var(--dynamic-hue))`.
  *Not* `nectar-design/css/tokens.css` — that file is loaded by the app
  but every consumed value is overridden at `:root`. (See audit §1.)
- **Type:** the five `--font-*` variables wired into Tailwind v4's
  `@theme` block in `globals.css` — Plus Jakarta Sans / Google Sans Flex /
  Playfair Display / Crimson Pro / Monaspace Neon. (See audit §2.)
- **Components:** `nectar-design/src/components/*.tsx` (35 files,
  `cva` + `forwardRef` + named exports).
- **Surface variants:** `glassCardVariants` in `GlassCard.tsx` —
  size: `sm | md | lg | hero`, depth: `surface | raised | floating`.
- **Live engines:** Heat × Depth (`--ui-heat`, `--ui-depth`,
  `--dynamic-hue`, six `--L-*` anchors) and Biomimetic circadian
  (16 vars from solar position).
- **Structural escape hatches:** `AccessGate` (server component, gates
  every route except `/privacy` and `/admin/*`) and Ink Routes
  (`isInkRoute(pathname)` in `app/lib/ink-routes.ts`, opaque
  art-directed long-reads).

## Working rules

- **Never invent hex values.** Use bridged semantics (`var(--bg)`,
  `var(--fg)`, `var(--primary)`) or oklch expressions referencing
  `--dynamic-hue`. The only allowed hex literals in this entire system
  are the two Ink-Route constants: `#0A0A0D` and `#F4ECE0`.
- **Never invent fonts.** Five families exist; use them. The on-site
  Typography page lists Libre Baskerville / Switzer / Merriweather /
  Roboto Mono — those are stale; ignore them.
- **Sentence case headings.** Buttons follow the live convention
  (Title Case: `View Work`, `Get in Touch`). Eyebrows are ALL CAPS,
  tracked +0.14em.
- **No emoji** in production surfaces. Tabler icons at 24px stroke 1.5px.
- **No graphical logo.** The wordmark in Google Sans Flex Black is the brand.
- **One surface idiom: glass.** Three depths (`surface | raised | floating`)
  cover everything from chips to hero. There is no flat slab, no hard
  shadow, no neo-brutalist control.
- **Two button variants: `btn--primary` and `btn--secondary`.** Both scale
  to 1.04 on hover. Don't add a third without a real reason.
- **Plain language.** No "leverages," "stunning," "next-generation."
- **First-person when the work is yours.** "I'm a tinkerer." Not "We're."
- **Show the receipts.** Numbers must be real and current.
- **4px grid.** All spacing is a multiple of `--space-xs`.
- **Mobile-first.** Stack at 390px, side-by-side at 768px, optimized at 1024px.
- **Reduce motion = real reduce motion.** Transitions go to 0ms.

## Aesthetic — one rule

**Glass on atmosphere.**

Every visible surface is a `GlassCard` (translucent fill, hairline borders,
backdrop-blur 12–24px with saturate(2), the `--glass-shadow` cast). The
background is the Heat-driven `--bg`, optionally tinted by a circular
gradient at the page level. There is no second surface treatment.

Where you need contrast or weight, *do not* invert to a flat slab — instead:

- raise the depth variant (`raised` → `floating`),
- fill with the action color (`bg-action`),
- or use the project-tint mechanism (`color-mix(in oklch, $identity-hue,
  var(--dynamic-hue))`) so the surface still breathes with Heat.

**Earlier drafts of this project named "brutalist controls + glass surfaces"
as a pairing rule. That rule was invented and is wrong.** There is no
brutalism on the live site. Don't reintroduce it.

## When the user asks for…

- **A landing page** → `kits/portfolio.html` is the canonical pattern.
  Floating GlassNav pill (top-center) → hero GlassCard with eyebrow,
  Google Sans Flex headline + Playfair italic accent → CaseStudyGrid →
  AboutSection → footer GlassCard.
- **A docs / Storybook surface** → `kits/storybook.html`. Three-column
  shell (sidebar / canvas / controls).
- **A token swatch / specimen** → `preview/*.html` files.
- **A new project tile** → add a row to `WORK_SECTION_OVERRIDES[slug]`
  in `CaseStudyGrid.tsx`. Don't fork the component.
- **An art-directed long-read** → make it an Ink Route. Add to
  `isInkRoute()`, suppress `GlassNav` and `HeatLayer`, render on
  `#0A0A0D` / `#F4ECE0`.
- **A new component** → sketch in a `<DCArtboard>` first, then port to
  `nectar-design/src/components/` with `cva` + `forwardRef` + a
  `.stories.tsx`.
- **A change to color math** → that's the engine; it lives in
  `myportfolio/app/globals.css`, not in `nectar-design`.

## Asset registry

Files registered with the review pane (visible under Design System):

| Group | File | Asset |
| --- | --- | --- |
| Type | `preview/type.html` | type_preview |
| Colors | `preview/colors.html` | colors_preview |
| Spacing | `preview/spacing.html` | spacing_preview |
| Components | `preview/components.html` | components_preview |
| Components | `kits/portfolio.html` | portfolio_kit |
| Components | `kits/storybook.html` | storybook_kit |
| Brand | `preview/brand.html` | brand_preview |
