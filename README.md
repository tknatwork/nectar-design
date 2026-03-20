# nectar-design

Design token pipeline + React component library for the Nectar Portfolio Platform.
5-tier token architecture producing 479 CSS custom properties with Tailwind v4 integration.

## Install

```bash
pnpm add nectar-design
```

## Usage

```ts
// Components
import { Button, Card, Badge, Input, Textarea, ProjectLayout } from 'nectar-design';
import { useTheme, useReducedMotion, cn } from 'nectar-design';

// Styles (import in your root layout)
import 'nectar-design/tokens.css';    // 479 CSS custom properties
import 'nectar-design/theme.css';     // Tailwind @theme mapping
import 'nectar-design/animation.css'; // CSS @keyframes + utility classes

// Animation presets (tree-shakeable)
import { presets, duration, easing } from 'nectar-design/gsap';
import { pageEnter, scrollReveal } from 'nectar-design/framer';
```

## Token Architecture (5-Tier Pipeline)

```text
Tier 1: tokens/core/primitives.json  (134 raw values)
Tier 2: tokens/core/seed.json        (20 brand decisions)
Tier 3: tokens/core/map.json         (96 derived via color-mix)
Tier 4: tokens/core/semantic.json    (93 aliases)
Tier 5: tokens/components/*.json     (61 per-component)
        tokens/themes/light|dark.json (33 overrides each)

Build:  scripts/build-tokens-sd.mjs      → css/tokens.css (479 vars)
        scripts/build-motion-presets.mjs  → GSAP + Framer + CSS @keyframes
```

Visual diagram: [`docs/token-pipeline.md`](docs/token-pipeline.md)

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build tokens + compile with tsup + copy CSS
pnpm dev              # Watch mode (tsup --watch)
```

## Tech Stack

- **Components:** React 18+ with cva (class-variance-authority)
- **Styling:** Tailwind v4 + tailwind-merge
- **Tokens:** Ant Design v6-inspired 5-tier pipeline
- **Build:** tsup (ESM-only, .d.ts generation)

## License

MIT — Tushar Kant Naik
