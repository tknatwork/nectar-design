<!-- === SYSTEM PAIRING ===
Consumed by: AI sessions at session-start in the nd repo
Updated by: manual (humans + AI sessions when adding new system-level files in nd)
Pairs with: CLAUDE.md, CONTEXT.md, REFERENCES.md, design/STATE.md, design/OPEN.md
Update trigger: any new system-level file added to nd OR new pairing header introduced
Last verified: 2026-05-16
Index: self
=== END PAIRING === -->

# Nectar Design — System Index

> **Scope**: this index is local to the standalone `nectar-design` mirror repo. The full multi-repo central+federal pairing pattern is established in the parent portfolio at `Portfolio/docs/SYSTEM-INDEX.md`. Post-[ADR 0024](https://github.com/tknatwork/myportfolio/blob/main/docs/decisions/0024-monorepo-nd-native.md), nd lives in-tree in mp as a native pnpm workspace package; this repo is a one-way sync target. AI sessions in this clone are read-only with respect to development; canonical edits land in mp.
>
> **Rule**: every entry below has a corresponding `<!-- === SYSTEM PAIRING === ... === END PAIRING === -->` block at the top of the file itself. Adding a new nd system-level file requires both: a row here AND a header in the file.

## Top-level files

| File | Consumed by | Updated by | Pairs with | Update trigger |
|------|-------------|------------|------------|----------------|
| `CLAUDE.md` | every AI session at boot in nd | manual | CONTEXT.md, REFERENCES.md, design/STATE.md, design/OPEN.md | new system file class added OR new architectural rule |
| `CONTEXT.md` | AI sessions for what-we're-building reference | manual | CLAUDE.md, REFERENCES.md | product direction shift OR new what-good-looks-like criteria |
| `REFERENCES.md` | AI sessions for examples + links | manual | CONTEXT.md, CLAUDE.md | new exemplar or canonical link |

## Design state

| File | Consumed by | Updated by | Pairs with | Update trigger |
|------|-------------|------------|------------|----------------|
| `design/STATE.md` | AI sessions before any UI work in nd | manual | design/OPEN.md, CLAUDE.md | shipped/provisional/experimental status change for any subsystem |
| `design/OPEN.md` | AI sessions when designing — read alongside STATE.md | manual | design/STATE.md, CLAUDE.md | new open question OR resolved question moves to STATE |

## Cross-repo

| Portfolio file | What it provides nd | Consequence for nd |
|----------------|---------------------|---------------------|
| `Portfolio/config/integration-compat.yaml` | version compatibility matrix nd's `package.json` must respect | bumping nd's React/Tailwind/etc requires a coordinated portfolio update |
| `Portfolio/docs/SYSTEM-INDEX.md` | central registry of portfolio-side paired files | post-[ADR 0024](https://github.com/tknatwork/myportfolio/blob/main/docs/decisions/0024-monorepo-nd-native.md), nd files live in-tree in mp and are indexed alongside everything else |
| `Portfolio/.github/dependabot.yml` (Dependabot) + `renovate.json` here (Renovate) | dependency bump automation | see "Dependency Management" in `CLAUDE.md` for the full split |

## How the pairing pattern works in nd

Same as portfolio:

1. New paired file? Add a row above + a `<!-- === SYSTEM PAIRING === ... -->` block in the file itself.
2. Pairing header schema:

   ```text
   <!-- === SYSTEM PAIRING ===
   Consumed by: <comma-separated list>
   Updated by: auto OR manual
   Pairs with: <comma-separated paths>
   Update trigger: <when to revisit>
   Last verified: <ISO date>
   Index: docs/SYSTEM-INDEX.md
   === END PAIRING === -->
   ```

3. Validator: nd does not yet have its own `validate-system-pairing.mjs` — the central validator lives in portfolio. nd-side AI sessions verify pairing manually until that validator is mirrored here.

## See also

- Portfolio's [`docs/SYSTEM-INDEX.md`](https://github.com/tknatwork/myportfolio/blob/main/docs/SYSTEM-INDEX.md) — full pairing pattern reference (where this convention originated)
- Parent workspace [`design-docs/CLAUDE.md`](../../AGENTS.md) — post-ADR 0024 source-of-truth model (nd lives in mp as a workspace package; this standalone clone is a one-way sync target)
