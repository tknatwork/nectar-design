# CLAUDE.md — nectar-design

> **Public design system package** extracted from the Nectar Portfolio Platform.
> All UI components, design tokens, hooks, and utilities for building themed interfaces.
> Includes the **Biomimetic Adaptive Theme** — a physics-based circadian engine that
> computes 49 CSS variables from solar position with 60-second GPU-accelerated transitions.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Components | React 18+ with cva (class-variance-authority) — 30+ components |
| Styling | Tailwind v4 (CSS-first `@theme`) + tailwind-merge |
| Tokens | 5-tier pipeline: primitives → seed → map → semantic → components → tokens.css (479 vars) |
| Theme Engine | Biomimetic Adaptive Theme (SunCalc + chroma-js + oklch) → 49 CSS vars from solar physics |
| Motion | Animation presets: patterns.json → GSAP presets + Framer variants + CSS @keyframes |
| Build | tsup (ESM-only, .d.ts generation) |
| Testing | Vitest + React Testing Library (353 tests) + Chromatic visual regression |
| Package manager | **pnpm** (never npm or yarn) |

---

## Package Exports

```ts
import { Button, Card, Badge, Input, Textarea, Container, Stack, Grid, Icon } from 'nectar-design';
import { useTheme, useReducedMotion, cn } from 'nectar-design';
import 'nectar-design/tokens.css';   // 479 CSS custom properties
import 'nectar-design/theme.css';    // Tailwind @theme mapping
import 'nectar-design/animation.css'; // CSS @keyframes + utility classes

// Biomimetic Adaptive Theme (optional — separate entry point, tree-shakeable)
import { CircadianProvider, useCircadian } from 'nectar-design/circadian';
import 'nectar-design/circadian.css'; // @property declarations + 60s transitions

// Rich text editor theme (optional)
import 'nectar-design/tiptap.css';

// Animation presets (tree-shakeable)
import { presets, duration, easing } from 'nectar-design/gsap';
import { pageEnter, scrollReveal } from 'nectar-design/framer';
```

---

## Token Architecture (5-Tier Pipeline)

```text
Tier 1: tokens/core/primitives.json  (134 raw values — hex, px, cubicBezier)
Tier 2: tokens/core/seed.json        (19 brand decisions — colorPrimary, controlHeight)
Tier 3: tokens/core/map.json         (96 derived — 50 intent colors via color-mix, neutral alphas, scales)
Tier 4: tokens/core/semantic.json    (93 aliases — spacing, typography, grid, motion)
Tier 5: tokens/components/*.json     (57 tokens — button, card, input, badge)
        tokens/themes/light|dark.json (33 vars each)

Build:  scripts/build-tokens-sd.mjs  → css/tokens.css (479 CSS custom properties)
        scripts/build-motion-presets.mjs → dist/gsap/presets.js
                                        → dist/framer/variants.js
                                        → dist/animation-keyframes.css

Runtime: src/engine/circadian-engine.ts → 49 CSS vars from solar physics
```

- Both build scripts run as `prebuild` before tsup
- `color-mix(in oklch)` generates 10-state color derivatives per intent
- Alpha-based neutral text hierarchy (88/65/45/25% opacity)
- `css/theme.css` maps CSS custom properties to Tailwind utilities via `@theme`
- See `docs/token-pipeline.md` for full Mermaid diagram

### Biomimetic Adaptive Theme Engine

The circadian engine (`src/engine/`) computes 49 CSS variables from solar position:

```text
src/engine/
├── types.ts               Type definitions (CircadianConfig, CircadianState, CircadianOutput)
├── circadian-engine.ts    Core orchestrator: solar state → palette + typography + motion + shadows
├── solar-mapper.ts        SunCalc wrapper: (time, lat, lng) → CircadianState
├── palette-deriver.ts     oklch base → 33 color vars + 3 shadow vars (WCAG contrast-safe)
├── typography-deriver.ts  Vision regime → 10 perceptual typography vars
├── motion-deriver.ts      Circadian state → 3 motion adaptation vars
├── consistency-layer.ts   Detect/handle/manage color↔typography coherence (max 3 passes)
├── tab-leader.ts          BroadcastChannel leader election for multi-tab sync
└── __tests__/             353 tests including 24-hour circadian validation
```

Pipeline: `(time, lat, lng) → solar position → CircadianState → palette + typography + motion → consistency validation → 49 CSS variables`

Theme modes: `light | dark | high-contrast | auto` — auto delegates to circadian engine.
Static theme files (`light.json`, `dark.json`) remain as SSR/no-JS fallbacks.

---

## Component Conventions

1. All UI components use `cva` for variant management
2. Named exports only (no default exports)
3. `cn()` for merging Tailwind classes (clsx + tailwind-merge)
4. `forwardRef` + `displayName` on form elements (Input, Textarea)
5. Never hardcode hex colors — always use token-based Tailwind classes

---

## Testing

| Layer | Framework | What it covers |
|-------|-----------|----------------|
| Unit | Vitest + React Testing Library | 353 tests: component variants, hooks, token CSS output, circadian engine (24-hour validation at Mumbai equinox), palette derivation, typography derivation, motion adaptation, consistency layer, solar mapping, snapshot generator |
| Visual | Chromatic (via Storybook) | Screenshot diffs on PRs — component + circadian explorer stories |

```bash
pnpm test             # Run Vitest unit tests (353 tests)
pnpm test -- --watch  # Watch mode
```

### Circadian Engine Tests

The engine test suite validates all 49 CSS variables at 24 hourly snapshots:

- WCAG AA contrast on all fg/bg pairs at every hour
- Color-typography coupling rules hold across the full curve
- Focus ring visibility (≥3:1 contrast vs bg) at all times
- Shadow adaptation (opacity decreases at night)
- Brand hue drift stays within ±15° of seed value

---

## Storybook

Visual component catalog for browsing all components and token documentation.

- **Config:** `.storybook/`
- **Stories:** `src/**/*.stories.tsx`
- **Components:** Button (8 variants), Card (3 sizes), Badge (5 variants), Input, Textarea, ProjectLayout, and more
- **Circadian Explorer:** Interactive story with time slider (0–1439 min), live preview panel, 24-hour color strip, solar info, typography/motion/shadow panels — 4 presets (Mumbai, Helsinki, HighContrast, CoolBrand)
- **Token pages:** Color swatches, spacing scale, typography specimens

```bash
pnpm storybook        # Launch dev server (default port 6006)
pnpm build-storybook  # Build static Storybook
```

**Visual regression (Chromatic):**

- Runs automatically on PRs touching `packages/nectar-design/**`
- CI workflow: `.github/workflows/chromatic.yml`
- Requires `CHROMATIC_PROJECT_TOKEN` GitHub Actions secret
- Review visual diffs in the Chromatic dashboard — no code review needed for visual changes

---

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build tokens + compile with tsup + copy CSS
pnpm dev              # Watch mode (tsup --watch)
pnpm test             # Vitest unit tests (353 tests)
pnpm storybook        # Launch Storybook dev server
pnpm build-storybook  # Build static Storybook
```

---

## What NOT to Do

- **Never edit `css/tokens.css` directly** — generated by `build-tokens-sd.mjs`
- **Never use npm or yarn** — pnpm only
- **Never hardcode hex colors** in components — use Tailwind token classes
- **Never add default exports** — named exports only
- **Never add runtime dependencies on React internals** — peer dependency only
- **Never import from portfolio-specific paths** (`@/lib/`, `@/hooks/`)

---

## Protected Files

- `tokens/**/*.json` — 5-tier token architecture
- `scripts/build-tokens-sd.mjs` — token compiler (479 CSS vars)
- `scripts/build-motion-presets.mjs` — animation preset compiler
- `css/theme.css` — Tailwind @theme contract
- `css/circadian.css` — @property declarations + transition rules
- `tokens/motion/patterns.json` — animation pattern tokens
- `src/engine/` — Biomimetic Adaptive Theme engine (all files)
- `src/hooks/useCircadianTheme.ts` — Circadian provider + hook
- `.storybook/` — Storybook configuration
- `vitest.config.ts` — Test configuration

---

## Contributing

See `.github/CONTRIBUTING.md`. All changes go through PRs to `main`. CODEOWNERS requires review from @tknatwork.
