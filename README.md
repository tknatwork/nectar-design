# nectar-design

Private design system for the Nectar Portfolio Platform.
5-tier token pipeline generating 473 CSS custom properties.
Includes a **Biomimetic Adaptive Theme** — a circadian engine that computes
16 CSS variables (typography, motion, shadows) from solar physics.

- **Storybook:** [design.tusharkantnaik.com](https://design.tusharkantnaik.com)

> **For AI agents:** Read [`CLAUDE.md`](CLAUDE.md) for design system instructions.

## Quick Start

```bash
pnpm install    # Install dependencies
pnpm build      # Build tokens + components
pnpm storybook  # Launch Storybook dev server
```

## Token Pipeline (5-Tier)

```text
primitives.json → seed.json → map.json → semantic.json → components/*.json
  → build-tokens-sd.mjs → tokens.css (473 CSS vars)
  → build-motion-presets.mjs → GSAP presets + Framer variants + CSS @keyframes
```

| Tier | Count | Purpose |
| ---- | ----- | ------- |
| Primitives | 134 | Raw values (hex, px, cubic-bezier) |
| Seed | 20 | Brand decisions (colorPrimary, controlHeight) |
| Map | 96 | Derived via color-mix(in oklch) |
| Semantic | 93 | Aliases (spacing, typography, grid) |
| Components + Themes | 61 + 33 | Per-component tokens + light/dark |

## Component Conventions

- All UI components use `cva` for variant management
- `cn()` from `lib/cn.ts` for Tailwind class merging
- `'use client'` on all interactive components
- Named exports (not default) for components
- `forwardRef` + `displayName` on form elements
- Never hardcode hex colors — use token Tailwind classes

## Scripts

| Script | Purpose |
| ------ | ------- |
| `pnpm build` | Full build (tokens + tsup + audit + CSS copy) |
| `pnpm dev` | Build in watch mode (tsup --watch) |
| `pnpm test` | Vitest unit tests (353 tests) |
| `pnpm storybook` | Launch Storybook dev server |
| `pnpm build-storybook` | Build static Storybook |
| `pnpm audit:theme` | Validate no Tailwind v4 namespace collisions |
| `pnpm validate:tokens` | Validate token refs, color format, spacing scale |

## Testing

- **Unit:** Vitest + React Testing Library — 353 tests
- **Visual:** Chromatic via Storybook — 31 snapshots, 9 components
- **Live:** [design.tusharkantnaik.com](https://design.tusharkantnaik.com)

## Documentation Map

| Document | Audience | Purpose |
| -------- | -------- | ------- |
| [CLAUDE.md](CLAUDE.md) | AI + developers | Design system guide |
| [Portfolio README](../../README.md) | Everyone | Project overview |
| [Portfolio CLAUDE.md](../../CLAUDE.md) | AI + developers | Complete project guide |
| [System Overview](../../docs/guidelines/system-overview.md) | Humans | Visual system guide |
| [Token Pipeline](../../docs/diagrams/token-pipeline.md) | Everyone | Visual token flow |
| [Architecture Data](../../docs/architecture.yaml) | AI agents | Structured YAML |
