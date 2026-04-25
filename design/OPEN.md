# Nectar — Open Questions

> **What this is:** unresolved design questions, gaps, and decisions worth challenging.
> **What this is not:** a backlog or roadmap. Items here may sit for months. Some will get rejected.
> **Companion:** [STATE.md](./STATE.md) — what currently exists.

This file exists because Nectar is half-built. Writing the system down as a contract would make every documented choice harder to change, and most of these questions deserve to stay open until the work tells us the answer. Treat anything here as fair game to challenge.

---

## Component coverage gaps

Things likely needed but not yet shipped. Each is a candidate primitive — but "you don't need this, use X instead" is also a valid answer.

- **Tabs / SegmentedControl** — multiple surfaces want this; currently faked with grouped Buttons.
- **Dialog / Modal** — `GlassCard` at `floating` depth is the prototype. Needs focus trap, dismiss patterns, escape handling.
- **Tooltip / Popover** — no primitive yet. Currently inline with `title` attributes (poor a11y).
- **Select / Combobox** — design-system docs and admin will both want this.
- **Toast queue / orchestrator** — `GlassToast` exists; no orchestrator to manage stacking, timing, dismissal.
- **Skeleton / loading state** — currently static placeholders. Unclear whether one primitive serves all surfaces or each context wants its own.
- **DataTable** — admin needs one. Building it is a project; using a third-party fights the rest of the system.
- **Form layout primitives** — `Field`, `Label`, `HelperText`, `ErrorText`. Currently inline per form.

**For agents:** when a layout calls for any of these, propose the primitive *and* note whether it's a one-off or a system addition.

---

## Token / scale questions

- **`wide:` breakpoint** — earning its keep? Sparse usage. Considering collapsing to 3 breakpoints.
- **Accent / intent hue** — Heat hue tracks user attention. But success/error/warning aren't tied to attention — they currently inherit `--dynamic-hue`, which feels wrong on a green success state. Does Nectar need a separate intent-color axis, or should those states *break* the dual-axis convention deliberately?
- **L-token density** — 6 semantic lightness tokens. Does `--L-elevated` justify itself versus collapsing to `surface`/`text`/`muted`/`border`/`bg`?
- **Spacing scale completeness** — has the current scale been audited against tight UI (dense data tables, compact admin views)? Workarounds with `gap-px` would be a smell.
- **Floating glass depth** — usage is thin. Either find more cases or remove and rename `raised → floating`.
- **Rounded scale** — currently inferred from primitives + semantic tokens. Worth surfacing as a first-class scale (Stitch-style `{rounded.sm}`, `{rounded.md}`)?

---

## Theme / runtime questions

- **Cooling decay constants** — `+3/s`, `+21 burst`, Newton's-law decay. All chosen by feel. Once PostHog has enough interaction data, validate against actual behavior.
- **Depth toggle on slow devices** — 1.8s timeline can stutter on low-end. Should there be a snappier instant-swap fallback distinct from reduced-motion? No data yet.
- **Constellation density on low-end** — `DeviceProfile` heuristic hasn't been profiled against real bottom-of-the-stack hardware.
- **Multi-tab Heat sync** — currently per-tab. Should heat sync via `BroadcastChannel`? Feels right that it doesn't, but unconfirmed.
- **Circadian engine integration** — built but lightly integrated. What surfaces should it actually drive? Type? Motion? Color? All? Unclear.

---

## Pattern questions

- **`'use client'` proliferation** — most components need it. Worth investing in server-component variants for the static ones (Card, Badge)?
- **CVA at small scale** — Badge has 3 variants × 2 sizes. Is cva overkill for trivial components, or worth the consistency tax? Probably keep, but worth re-examining.
- **Motion presets vs inline** — 3 named springs. When a new feel is needed, do we add a 4th preset or inline a one-off? No rule yet.
- **Per-project CSS var injection** — works for current 3 projects. Will the pattern hold at 30?
- **GSAP vs motion.dev for new work** — the split is clear for existing categories, but a new animation category (e.g., scroll-driven layout) doesn't have a default tool assignment.

---

## Documentation questions

- **Stitch-shaped sections** — considered, deferred. The system isn't stable enough to commit to canonical sections without paying a codification tax. Revisit when component coverage is ~80% of intended scope.
- **5-tier token pipeline concept doc** — currently scattered across `docs/system/tokens.md`, ADR 0001, STATE.md. Could benefit from one canonical concept doc with inline diagram.
- **ADR for the *not*-DESIGN.md decision** — the choice to write STATE.md + OPEN.md instead of a Stitch-style spec is itself worth recording, so a future me/agent doesn't redo this analysis.
- **Storybook coverage** — what fraction of components have stories? Token docs? Unknown. Worth measuring.

---

## Decisions worth revisiting

Committed to but not pressure-tested.

- **OKLCH everywhere** — held up beautifully. Revisit only if a browser support edge case bites.
- **Tailwind v4 + cva + cn stack** — solid; revisit if Tailwind v5 lands with breaking changes.
- **GSAP + motion.dev split** — solid; revisit if motion.dev gets a competitive canvas ticker.
- **Submodule for nectar-design** — slightly painful (4-branch protocol). Revisit when the system stabilizes — could collapse to a monorepo package.
- **NDA password gate separate from Supabase Auth** — works at current scope; revisit if NDA flow needs richer state (per-section unlocks, expiring tokens).
- **WCAG AAA target** — aspirational. Revisit honestly: what fraction of the site actually meets AAA today vs AA?

---

## How to add to this file

When you (or an agent) hit something unclear:

1. Add an item under the right section above
2. Phrase as a question, not a complaint
3. Include enough context that the next reader picks it up cold
4. Don't propose the answer here — that's the work's job

Items get removed when:
- Decided → move to STATE.md or write an ADR
- Stop mattering → delete with a one-line "why this no longer matters"

Don't let this file calcify either. If a question has been open for 6 months without anyone caring, it probably wasn't a real question.
