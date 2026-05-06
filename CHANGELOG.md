# Changelog

All notable changes to `nectar-design` are documented here.

## Unreleased — design system & layout reconciliation

### Added

- `css/engine.css` — opt-in Heat × Depth runtime engine. Two-axis
  oklch theme (`--ui-heat`, `--ui-depth`) that overrides the semantic
  token tier so every Tailwind utility (`bg-bg`, `text-fg`, etc.)
  responds to interaction + theme without per-component wiring. Mirrors
  the engine that has been living inline in
  `tknatwork/myportfolio:app/globals.css` — shipping it from the package
  means future consumers don't have to copy-paste it.
- `css/motion.css` — motion vocabulary (`--dur-*`, `--ease-*`,
  `--spring-*`) extracted from the reference app. Includes a
  `prefers-reduced-motion` collapse to `0.01ms`.
- `docs/specimens/` — six self-contained HTML specimens (colors, type,
  spacing, components, motion, brand) that load `_foundation.css` from
  alongside. No build step; open in a browser.
- `docs/SKILL.md` — agent-facing reading order + working rules. Aimed
  at AI assistants that need to extend or audit the system.
- `docs/audit/INCONSISTENCIES.md` — point-in-time reconciliation of
  the package, the reference app, and the live site. Useful as a
  reference for future audits.

### Changed

- `README.md` — adds Engine, Motion, and Specimens sections under the
  existing Tokens documentation. See `README.PATCH.md` in the same PR
  for the exact insertion.

### Notes

- Nothing previously exported is removed or renamed.
- The engine and motion stylesheets are **opt-in**: consumers that
  only want the existing token + theme tiers see no behavioural change.
- The "brutalism" framing that appeared in some README drafts has
  been dropped — the live system is glass + Heat × Depth, never was
  brutalist. See `docs/audit/INCONSISTENCIES.md` §3 for the full
  reconciliation.
