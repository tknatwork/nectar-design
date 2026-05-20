<!-- === SYSTEM PAIRING ===
Consumed by: Claude Code (legacy path), tools that hardcode CLAUDE.md
Updated by: manual
Pairs with: AGENTS.md (canonical), docs/SYSTEM-INDEX.md (parent repo)
Update trigger: never (this is a redirect file — edit AGENTS.md instead)
Last verified: 2026-05-21 (read-order block added — START_HERE.md first, then AGENTS.md)
Index: docs/SYSTEM-INDEX.md
=== END PAIRING === -->

# CLAUDE.md — pointer (nectar-design)

> This file is a pointer for Claude Code's built-in file lookup and any tooling that still hardcodes the legacy path.
>
> **The canonical AI-instruction file for nectar-design is [AGENTS.md](AGENTS.md).** Follow that.
>
> All builder LLMs should read [AGENTS.md](AGENTS.md). AGENTS.md is the Sourcegraph universal convention (https://agents.md).
>
> **Do NOT add content here.** Edits to AI-builder rules for nd belong in [AGENTS.md](AGENTS.md).
>
> ---
>
> **Read order for new sessions:**
>
> 1. [START_HERE.md](START_HERE.md) — Boot check + environment inventory. `pnpm install` + `pnpm build` verified before any work.
> 2. [AGENTS.md](AGENTS.md) — Canonical AI-builder rules (token pipeline, conventions, dual-clone protocol).
>
> Reading 1 first prevents wasted cycles on un-built tokens.css or stale Storybook state.
