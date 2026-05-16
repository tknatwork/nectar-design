# nectar-design

Private design system for the **Nectar Portfolio Platform**.
5-tier token pipeline generating **474 CSS custom properties** plus a Biomimetic Adaptive Theme engine that computes 16 runtime CSS variables from solar physics.

> **For AI agents:** Read [`CLAUDE.md`](AGENTS.md) for full design system instructions.

## Quick Start

```bash
pnpm install         # Install dependencies
pnpm build           # Build tokens + components + presets
pnpm storybook       # Launch standalone Storybook dev server (port 6006)
```

## Token Pipeline (5-Tier)

```text
primitives.json → seed.json → map.json → semantic.json → components/*.json
  → scripts/build-tokens-sd.mjs → css/tokens.css (474 CSS vars)
                                → dist/echarts-theme.json (light + dark)
  → scripts/build-motion-presets.mjs → dist/gsap/presets.js
                                     → dist/framer/variants.js
                                     → dist/animation-keyframes.css
```

| Tier | Count | Purpose |
| ---- | ----- | ------- |
| Primitives | 135 | Raw values (hex, px, cubic-bezier) |
| Seed | 19 | Brand decisions (colorPrimary, controlHeight) |
| Map | 96 | Derived via `color-mix(in oklch)` (color states + alpha scales) |
| Semantic | 87 | Aliases (spacing, typography, grid, motion, a11y) |
| Components | 57 (across 4 files: button, card, badge, input) | Per-component tokens |
| Themes | 33 each (light, dark, high-contrast) | Theme overrides |

Total compiled output: 474 CSS custom properties in [`css/tokens.css`](css/tokens.css).

## Biomimetic Adaptive Theme

A physics-based circadian engine (`src/engine/`) computes 16 CSS variables at runtime from solar position:

- 10 perceptual typography vars (size, line-height, letter-spacing — adapts to vision regime)
- 3 motion adaptation vars (duration, easing — adapts to circadian state)
- 3 shadow vars (opacity decreases at night)

Colors stay owned by the parent app's Heat Engine; this package provides the typography + motion + shadow channels. Includes 60-second GPU-accelerated transitions, multi-tab leader election via BroadcastChannel, FOUC prevention, and 24-hour validated test coverage (Mumbai equinox baseline).

Pipeline: `(time, lat, lng) → solar position → CircadianState → palette + typography + motion → consistency validation → 16 CSS vars`

## Component Conventions

- All UI components use `cva` for variant management
- `cn()` from `lib/cn.ts` for Tailwind class merging (`clsx` + `tailwind-merge`)
- `'use client'` on all interactive components
- Named exports (no default exports)
- `forwardRef` + `displayName` on form elements
- Never hardcode hex colors — use token-based Tailwind classes
- Never import portfolio-specific paths (`@/lib/`, `@/hooks/`)

## Scripts

| Script | Purpose |
| ------ | ------- |
| `pnpm build` | Full build (tokens + tsup + audit + CSS copy + motion presets) |
| `pnpm dev` | Build in watch mode (`tsup --watch`) |
| `pnpm test` | Vitest unit tests (353 tests, including 24-hour circadian validation) |
| `pnpm storybook` | Launch standalone Storybook dev server |
| `pnpm build-storybook` | Build static Storybook → `storybook-static/` |
| `pnpm audit:theme` | Validate no Tailwind v4 `@theme` namespace collisions |
| `pnpm validate:tokens` | Validate token refs, color format, spacing scale monotonicity |

## Testing

- **Unit:** Vitest + React Testing Library — 353 tests covering component variants, hooks, token CSS output, circadian engine (24-hour validation at Mumbai equinox), palette derivation, typography derivation, motion adaptation, consistency layer, solar mapping, snapshot generator
- **Visual regression:** This repo's `chromatic.yml` workflow is **PAUSED** since 2026-05-08 ([ADR 0017 in mp](https://github.com/tknatwork/myportfolio/blob/main/docs/decisions/0017-chromatic-paused-during-quota-window.md) — free-tier quota window). Coverage is provided from the parent repo via Lost Pixel (component-level on the unified Storybook) and Percy (route-level on the app)

## Deployed Storybook

The public design catalog at [design.tusharkantnaik.com](https://design.tusharkantnaik.com) is served from the **unified Storybook in [tknatwork/myportfolio](https://github.com/tknatwork/myportfolio)** ([ADR 0015](https://github.com/tknatwork/myportfolio/blob/main/docs/decisions/0015-unified-storybook-from-mp.md), live 2026-05-07). This repo's standalone Storybook still exists for nd-only iteration (`pnpm storybook` here), but does not deploy publicly — the nd-side Vercel project was decommissioned in the Path F migration.

How nd changes reach the deployed catalog:

1. nd-feature → nd-dev → nd-main (PR flow in this repo)
2. mp bumps submodule pointer to new nd-main HEAD (separate PR in `tknatwork/myportfolio`)
3. Vercel rebuilds unified Storybook from mp-main and deploys

## Relationship to myportfolio

- **Consumed via git submodule** at `packages/nectar-design/` in [tknatwork/myportfolio](https://github.com/tknatwork/myportfolio); pointer always tracks nd-main
- **Independent install graph** — nd has its own `pnpm-lock.yaml` (uses `pnpm install --ignore-workspace` in standalone CI)
- **Coordinated dep bumps** follow the 4-branch protocol: see [submodule.md in mp](https://github.com/tknatwork/myportfolio/blob/main/docs/system/submodule.md)
- **Cross-repo compat matrix** in mp's [`config/integration-compat.yaml`](https://github.com/tknatwork/myportfolio/blob/main/config/integration-compat.yaml) constrains nd's React / Tailwind / TypeScript / Chromatic versions

## Documentation

| Document | Audience | Purpose |
| -------- | -------- | ------- |
| [`CLAUDE.md`](AGENTS.md) | AI + developers | Design system guide (deep dive) |
| [`design/STATE.md`](design/STATE.md) | AI + developers | Current system snapshot (Shipped / Provisional / Experimental) |
| [`design/OPEN.md`](design/OPEN.md) | AI + developers | Open questions, gaps, decisions worth challenging |
| [Portfolio README](https://github.com/tknatwork/myportfolio/blob/main/README.md) | Everyone | Project overview (parent repo) |
| [Portfolio CLAUDE.md](https://github.com/tknatwork/myportfolio/blob/main/AGENTS.md) | AI + developers | Complete project guide (parent repo) |
