# References

## Examples of good work

- `tokens/core/primitives.json` — Tier 1 raw values (134 entries, DTCG format)
- `src/components/Button/` — Reference cva component with 8 variants
- `src/engine/circadian-provider.tsx` — Complex state management with solar physics
- `src/engine/palette-deriver.ts` — OKLCH color derivation with WCAG contrast checks
- `scripts/build-tokens-sd.mjs` — Token compiler (Style Dictionary)

## Relevant links

- Storybook (live): <https://design.tusharkantnaik.com>
- Chromatic: linked via GitHub PR checks on `packages/nectar-design/**`
- Repo: <https://github.com/tknatwork/nectar-design> (private)
- Parent repo (Portfolio): <https://github.com/tknatwork/myportfolio> (private)
- Token pipeline docs: `docs/token-pipeline.md`

## Notes

- This package is a git submodule in the Portfolio repo at `packages/nectar-design/`
- Always commit/push nectar-design BEFORE the parent repo
- The circadian engine uses SunCalc — test with the time slider in Storybook's Circadian Explorer
- Token validation: `pnpm validate:tokens` (checks refs, color format, spacing scale)
- Namespace audit: `pnpm audit:theme` (detects Tailwind v4 @theme collisions)
- Token + motion scripts run twice: `prebuild` (generates css/) and post-tsup (generates dist/)
