# AI Context — nectar-design

> Quick orientation for AI models. Full details in [CLAUDE.md](./CLAUDE.md).

## What is this?

A public React component library and design token system. Ships 6 components (Button, Card, Badge, Input, Textarea, ProjectLayout), 2 hooks (useTheme, useReducedMotion), and a cn() utility.

## Key facts

- **Build:** tsup (ESM-only) with prebuild token + motion compilation
- **Tokens:** 5-tier pipeline (primitives → seed → map → semantic → components) → 479 CSS vars
- **Motion:** 6 animation patterns → GSAP presets, Framer Motion variants, CSS @keyframes
- **Styling:** cva + Tailwind v4 — never hardcode colors
- **Package manager:** pnpm only
- **Exports:** `nectar-design` (JS), `nectar-design/tokens.css`, `nectar-design/theme.css`, `nectar-design/gsap`, `nectar-design/framer`, `nectar-design/animation.css`

## Rules

- Named exports only, no default exports
- Never edit `css/tokens.css` (generated)
- All PRs require CODEOWNERS review
- See CLAUDE.md for full conventions
