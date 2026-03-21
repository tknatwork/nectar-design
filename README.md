# nectar-design

Design token pipeline + React component library for the Nectar Portfolio Platform.
5-tier token architecture producing 479 CSS custom properties with Tailwind v4 integration.
Includes the **Biomimetic Adaptive Theme** — a physics-based circadian engine that computes
49 CSS variables in real-time from solar position, delivering smooth 60-second crossfade
transitions driven by actual light physics.

## Install

```bash
pnpm add nectar-design
```

## Usage

```ts
// Components (30+ components)
import { Button, Card, Badge, Input, Textarea, Container, Stack, Grid, Icon } from 'nectar-design';
import { useTheme, useReducedMotion, cn } from 'nectar-design';

// Styles (import in your root layout)
import 'nectar-design/tokens.css';    // 479 CSS custom properties
import 'nectar-design/theme.css';     // Tailwind @theme mapping
import 'nectar-design/animation.css'; // CSS @keyframes + utility classes

// Biomimetic Adaptive Theme (optional — tree-shakeable, separate entry point)
import { CircadianProvider, useCircadian } from 'nectar-design/circadian';
import 'nectar-design/circadian.css'; // @property declarations + 60s transitions

// Rich text editor theme (optional)
import 'nectar-design/tiptap.css';

// Animation presets (tree-shakeable)
import { presets, duration, easing } from 'nectar-design/gsap';
import { pageEnter, scrollReveal } from 'nectar-design/framer';

// ECharts theme (build-time generated from DTCG tokens)
import echartsTheme from 'nectar-design/echarts-theme';
// → { light: EChartsThemeObject, dark: EChartsThemeObject }
```

### Circadian Theme (Biomimetic Adaptive Theme)

The circadian engine computes a complete 49-variable theme from solar position:

```tsx
// In your root layout — wraps app, manages lifecycle
<CircadianProvider latitude={19.07} longitude={72.87}>
  {children}
</CircadianProvider>
```

- 33 color variables derived from blackbody radiation physics (Planckian locus)
- 10 perceptual typography variables (weight, tracking, leading adapt to vision regime)
- 3 motion variables (duration/intensity scale with time of day)
- 3 shadow variables (opacity/spread/temperature adapt to ambient light)
- WCAG AA contrast safety on all fg/bg pairs, validated at every computation
- 60-second GPU-accelerated CSS transitions via `@property` declarations
- Multi-tab sync via BroadcastChannel leader election
- Zero FOUC via `useInsertionEffect` synchronous injection
- Theme modes: `light | dark | high-contrast | auto` (auto = circadian engine active)

## Token Architecture (5-Tier Pipeline)

```text
Tier 1: tokens/core/primitives.json  (134 raw values)
Tier 2: tokens/core/seed.json        (20 brand decisions)
Tier 3: tokens/core/map.json         (96 derived via color-mix)
Tier 4: tokens/core/semantic.json    (97 aliases)
Tier 5: tokens/components/*.json     (61 per-component)
        tokens/themes/light|dark.json (33 overrides each — SSR fallbacks)

Build:  scripts/build-tokens-sd.mjs      → css/tokens.css (479 vars)
                                         → dist/echarts-theme.json (light + dark)
        scripts/build-motion-presets.mjs  → GSAP + Framer + CSS @keyframes

Runtime: src/engine/circadian-engine.ts  → 49 CSS vars computed from solar physics
         src/engine/snapshot-generator.ts → regenerates static theme fallbacks
```

Visual diagram: [`docs/token-pipeline.md`](docs/token-pipeline.md)

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build: tsup → token gen (+ echarts-theme.json) → motion presets → copy CSS
pnpm dev              # Watch mode (tsup --watch)
pnpm test             # Run 353 unit tests (Vitest)
pnpm storybook        # Launch Storybook dev server (port 6006)
pnpm build-storybook  # Build static Storybook
```

## Tech Stack

- **Components:** React 18+ with cva (class-variance-authority) — 30+ components
- **Styling:** Tailwind v4 + tailwind-merge
- **Tokens:** Ant Design v6-inspired 5-tier pipeline
- **Theme Engine:** Biomimetic Adaptive Theme (SunCalc + chroma-js + oklch)
- **Build:** tsup (ESM-only, .d.ts generation)
- **Testing:** Vitest + React Testing Library (353 tests)
- **Visual:** Storybook + Chromatic
- **Storybook:** [design.tusharkantnaik.com](https://design.tusharkantnaik.com)

## License

MIT — Tushar Kant Naik
