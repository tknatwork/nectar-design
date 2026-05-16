<!-- === SYSTEM PAIRING ===
Consumed by: AI sessions before any UI work in nd
Updated by: manual
Pairs with: design/OPEN.md, CLAUDE.md, docs/SYSTEM-INDEX.md
Update trigger: shipped / provisional / experimental status change for any subsystem
Last verified: 2026-05-16
Index: docs/SYSTEM-INDEX.md
=== END PAIRING === -->

# Nectar — System State

> **Version:** v0.x — half-built, solo, evolving. Expect breakage.
> **Last reviewed:** 2026-04-25
> **Companion file:** [OPEN.md](./OPEN.md) — open questions, things being reconsidered.

This file describes what currently exists in Nectar. It's a snapshot, not a spec. Anything documented here can be questioned, replaced, or thrown out. If a choice no longer serves the work, change the work first; update this file when the dust settles.

If this file disagrees with the code, **the code wins**.

---

## How to read this

Three solidity tiers. Items move between tiers as the system matures.

- **Shipped** — in use across multiple components or pages, has survived iteration, I'd be annoyed to lose it.
- **Provisional** — exists and works, but hasn't been pushed hard enough to know if it's right.
- **Experimental** — fragile, sparsely used, possibly cut.

For each item: what it is + where the truth actually lives. Confidence levels are deliberately not ratings — read OPEN.md for what's unsettled.

---

## Shipped

### 5-tier token pipeline

- Primitives → seed → map → semantic → component (+ themes overlay)
- 479 CSS custom properties generated via `build-tokens-sd.mjs`
- Source: `tokens/core/*.json`, `tokens/components/*.json`, `tokens/themes/*.json`
- Output: `css/tokens.css` (generated — never edit)
- ADR: `docs/decisions/0001-token-pipeline.md`

### OKLCH dual-axis color (Heat × Depth)

- `--ui-heat` 0–100 → `--dynamic-hue` via Heat Engine (GSAP, 60fps)
- `--ui-depth` 0–100 → lightness via Depth Engine (1.8s timeline)
- Pattern: `oklch(var(--L-*) <C> var(--dynamic-hue))` for every color
- 6 semantic L-tokens: `--L-bg`, `--L-surface`, `--L-elevated`, `--L-text`, `--L-muted`, `--L-border`
- Truth lives in: `app/hooks/useHeatEngine.ts`, `useDepthEngine.ts`, `app/globals.css`
- ADR: `docs/decisions/0004-oklch-color-mix.md`, `0011-heat-engine-and-glass.md`

### Component pattern (cva + cn + forwardRef)

- Named export, `forwardRef` + `displayName`, `cva` variants, `cn()` for merging
- Shipped components: `Button`, `Card`, `Badge`, `Input`, `Textarea`, `GlassCard`, `GlassToast`
- Code: `Portfolio/app/components/ui/*.tsx`
- The pattern is solid. Component coverage is partial — see OPEN.md.

### Animation tool split (the one rule that matters)

- Heat Engine → GSAP (main thread ticker)
- Constellation → Web Worker `requestAnimationFrame` (off-main via OffscreenCanvas)
- Depth toggle → View Transitions API (GPU-composited)
- DOM springs (cards, nav, modals) → motion.dev 12
- **Never mix tools on the same target.**
- ADR: `docs/decisions/0002-animation-stack.md`

### Reduced-motion enforcement

- Every decorative animation checks `useReducedMotion()`
- motion.dev: `initial={false}`, `transition={{ duration: 0 }}`
- GSAP: skip, render final state
- Sound: muted automatically
- Non-negotiable. Audited in tests.

### Custom breakpoints

- `mobile:` <640px · `tablet:` 640–1024 · `desktop:` 1024–1440 · `wide:` >1440
- Static px in `theme.css` (Tailwind v4 requirement)
- Never use Tailwind defaults (`sm:`/`md:`/`lg:`)
- ADR: `docs/decisions/0007-responsive-layout.md`

### Fluid typography

- Clamp-based heading scales: `text-fluid-hero`, `text-fluid-h1`, `text-fluid-h2`
- Body stays 1rem (16px) at all viewports
- No media queries needed for type

---

## Provisional

### Glass system (3 depths)

- `surface` (16px blur) · `raised` (24px) · `floating` (32px)
- Always via `GlassCard` — never raw `backdrop-filter`
- Surface and raised in heavy use; floating coverage is thin — see OPEN.md.

### Motion presets (3 springs)

- `CARD_SPRING` (300/20/1) · `BUTTON_SPRING` (500/25/0.8) · `NAV_SPRING` (200/30/1)
- Numbers chosen by feel. Held up so far.

### Per-project theming

- `ProjectLayout` injects per-project CSS vars
- The single sanctioned exception to the no-inline-style rule
- Works at current scale; pattern not yet pressured.

### Storybook + Chromatic

- Catalog at design.tusharkantnaik.com
- Visual regression in nectar-design repo (separate Vercel project)
- ADR: `docs/decisions/storybook.md` (concept doc) — works, but separation is a moving target.

---

## Experimental

### Constellation background

- Canvas 2D, Web Worker, OffscreenCanvas
- Dark-mode only — opacity tied to `--ui-depth`, worker pauses in light mode
- DeviceProfile scales density
- Performance acceptable on tested devices; not profiled on low-end.

### Heat Engine cooling decay

- Mouse +3/s, click +21 burst, Newton's-law idle decay
- All numbers picked by feel — no validation against actual interaction data yet.

### Sound layer

- `audio/engine.ts` Web Audio API
- Used sparingly; possibly cut.

### Biomimetic Adaptive Theme (16 vars from solar physics)

- `src/engine/circadian-engine.ts` + `solar-mapper.ts`
- Multi-tab sync, FOUC prevention, perceptual typography adaptation
- Engine is built; integration story is still emerging.

---

## Where the truth actually lives

| What | Authoritative file(s) |
|---|---|
| Tokens | `tokens/core/*.json`, `tokens/components/*.json`, `tokens/themes/*.json` |
| Compiled CSS | `css/tokens.css` (generated) |
| Component code | `Portfolio/app/components/ui/*.tsx` |
| Heat / Depth runtime | `Portfolio/app/hooks/useHeatEngine.ts`, `useDepthEngine.ts` |
| Theme overrides | `Portfolio/app/globals.css` |
| Motion patterns | `tokens/motion/patterns.json`, `src/engine/motion-deriver.ts` |
| Decisions (the *why*) | `Portfolio/docs/decisions/*.md` (11 ADRs) |
| Concept docs (deep dives) | `Portfolio/docs/system/*.md` |

Documentation describes; these files **are** the system.

---

## Using this file with an agent

- **Designing a new screen:** read this for what's available, then read OPEN.md for what's unsettled.
- **Adding a component:** propose, don't assume. The shipped list is what exists, not what's complete.
- **Changing a token:** thread through the 5-tier pipeline (primitive → seed → map → semantic → component). Don't shortcut.
- **Disagreeing with anything here:** good. Log it in OPEN.md. The point is to keep things questionable.
