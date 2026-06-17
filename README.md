# nectar-design

> ## ⚠️ This repo is a downstream MIRROR — wound down 2026-06-17
>
> The canonical `nectar-design` is the **in-tree workspace package** inside `tknatwork/myportfolio` at `packages/nectar-design/` (per [mp ADR 0024](https://github.com/Tushar-Kant-Naik/myportfolio/blob/main/docs/decisions/0024-monorepo-nd-native.md)). All development — tokens, components, Storybook, CI, Renovate — happens in mp. This standalone repo receives a periodic one-way sync from mp (`scripts/sync-nd-to-nd-repo.mjs`) and is kept for archive / external publishing only.
>
> **No CI runs here** (0 self-hosted runners post-AD-072; previous workflows disabled / removed). **No Renovate runs here** (`renovate.json` has `"enabled": false`; the single Renovate source is mp). Do not open PRs against `main` — file issues in mp instead. Decision trail: [claude-bus #5](https://github.com/tknatwork/claude-bus/issues/5).

Private design system for the **Nectar Portfolio Platform**.
5-tier token pipeline generating **494 CSS custom properties** plus a Biomimetic Adaptive Theme engine that computes 16 runtime CSS variables from solar physics.

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
  → scripts/build-tokens-sd.mjs → css/tokens.css (494 CSS vars)
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
| Components | 77 (across 5 files: button, card, badge, input, glass) | Per-component tokens |
| Themes | 33 each (light, dark, high-contrast) | Theme overrides |

Total compiled output: 494 CSS custom properties in [`css/tokens.css`](css/tokens.css).

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

How nd changes reach the deployed catalog (post-[ADR 0024](https://github.com/tknatwork/myportfolio/blob/main/docs/decisions/0024-monorepo-nd-native.md)):

1. Edit `packages/nectar-design/**` in `tknatwork/myportfolio` (mp is the source of truth).
2. Feature branch → mp-dev → mp-main (single PR covers both nd + app changes).
3. Vercel rebuilds unified Storybook from mp-main and deploys.
4. This standalone `tknatwork/nectar-design` repo receives a periodic one-way sync from mp (mirror only — do not develop here).

## Relationship to myportfolio

- **Post-[ADR 0024](https://github.com/tknatwork/myportfolio/blob/main/docs/decisions/0024-monorepo-nd-native.md):** `packages/nectar-design/` is a **native pnpm workspace package** committed in-tree to [tknatwork/myportfolio](https://github.com/tknatwork/myportfolio). The git-submodule relationship is retired.
- **This standalone repo is a one-way sync target** — kept around for consumers who want to inspect nd in isolation. Do not commit edits here; they will be overwritten by the next sync from mp.
- **Single install graph** — mp's root `pnpm-lock.yaml` covers both `app/` and `packages/nectar-design/`. The standalone copy still ships a `pnpm-lock.yaml` for self-contained reads.
- **Dep bumps land in one feature branch** in mp — no 4-branch protocol.
- **Cross-repo compat matrix** in mp's [`config/integration-compat.yaml`](https://github.com/tknatwork/myportfolio/blob/main/config/integration-compat.yaml) still constrains nd's React / Tailwind / TypeScript / Chromatic versions.

## Documentation

| Document | Audience | Purpose |
| -------- | -------- | ------- |
| [`CLAUDE.md`](AGENTS.md) | AI + developers | Design system guide (deep dive) |
| [`design/STATE.md`](design/STATE.md) | AI + developers | Current system snapshot (Shipped / Provisional / Experimental) |
| [`design/OPEN.md`](design/OPEN.md) | AI + developers | Open questions, gaps, decisions worth challenging |
| [Portfolio README](https://github.com/tknatwork/myportfolio/blob/main/README.md) | Everyone | Project overview (parent repo) |
| [Portfolio CLAUDE.md](https://github.com/tknatwork/myportfolio/blob/main/AGENTS.md) | AI + developers | Complete project guide (parent repo) |
