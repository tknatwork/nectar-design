# AI Context — nectar-design

> Quick orientation for AI models. Full details in [CLAUDE.md](./CLAUDE.md).

## What is this?

A private React component library and design token system. Ships 30+ components (Button, Card, Badge, Input, Textarea, Container, Stack, Grid, Icon, Toggle, Select, Dialog, and more), hooks (useTheme, useReducedMotion, useCircadian), and a cn() utility.

Includes the **Biomimetic Adaptive Theme** — a physics-based circadian engine (`nectar-design/circadian`) that computes 49 CSS variables from solar position in real-time, with 60-second GPU-accelerated crossfade transitions.

## Key facts

- **Build:** tsup (ESM-only), then token gen (tokens.css + echarts-theme.json) + motion presets + namespace audit post-tsup
- **Tokens:** 5-tier pipeline (primitives → seed → map → semantic → components) → 479 CSS vars
- **Circadian Engine:** Solar physics → 49 CSS vars (33 color + 10 typography + 3 motion + 3 shadow) with WCAG contrast safety
- **Motion:** 6 animation patterns → GSAP presets, Framer Motion variants, CSS @keyframes
- **Styling:** cva + Tailwind v4 — never hardcode colors
- **Testing:** 353 unit tests (Vitest + React Testing Library), Chromatic visual regression
- **Package manager:** pnpm only
- **Exports:** `nectar-design` (JS), `nectar-design/tokens.css`, `nectar-design/theme.css`, `nectar-design/gsap`, `nectar-design/framer`, `nectar-design/animation.css`, `nectar-design/circadian` (theme engine), `nectar-design/circadian.css` (@property + transitions), `nectar-design/tiptap.css` (rich text theme), `nectar-design/echarts-theme` (build-time ECharts theme JSON)
- **Storybook:** [design.tusharkantnaik.com](https://design.tusharkantnaik.com)

## Rules

- Named exports only, no default exports
- Never edit `css/tokens.css` (generated)
- All PRs require CODEOWNERS review
- See CLAUDE.md for full conventions
