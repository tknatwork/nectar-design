# README — Engine + Motion sections

The `nectar-design` README on `dev` documents the foundational tokens
(seed → alias → mapped) but does not describe the runtime engine the
consuming app overlays on top. This patch adds two short sections —
copy them into `README.md` directly under the existing **Tokens**
section.

---

## §X. Heat × Depth engine *(opt-in)*

The package ships a runtime theme engine as a separate stylesheet.
Consumers that want the adaptive, interaction-driven theme behaviour
the reference app (`tknatwork/myportfolio`) uses import it after the
foundational tiers:

```css
@import "tailwindcss";
@import "nectar-design/tokens.css" layer(tokens);
@import "nectar-design/theme.css";
@import "nectar-design/engine.css";          /* ← Heat × Depth */
@import "nectar-design/motion.css";          /* ← motion tokens */
```

The engine drives two CSS variables:

| Var          | Range  | Source                | Effect                                 |
|--------------|--------|-----------------------|----------------------------------------|
| `--ui-heat`  | 0–100  | scroll, drag, idle    | Hue: cool indigo 260° → warm sand 60° |
| `--ui-depth` | 0–100  | theme toggle / system | Lightness: 0 = light, 100 = dark       |

Every paint-relevant token (`--bg`, `--fg`, `--primary`, `--surface`,
`--muted-fg`, `--border`, `--ring`, `--shadow-color`) is recomputed from
these axes plus a fixed lightness/chroma curve. Reading the variables
directly from JS or driving them from any DOM event reframes the whole
page — that's the whole point of the abstraction.

The engine does not require glassmorphism. Non-glass apps still
benefit from the harmonised lightness curves and the depth-responsive
border tones.

## §Y. Motion *(opt-in)*

`motion.css` exposes the durations, easings, and spring approximations
used by every interactive component in the reference app:

```
--dur-fast   120ms   hover, focus
--dur-base   200ms   buttons, tabs
--dur-slow   300ms   card lift, modal
--dur-cross  800ms   theme + heat cross-fade

--ease-out          cubic-bezier(0.215, 0.61, 0.355, 1)
--ease-out-circ     cubic-bezier(0.08,  0.82, 0.17,  1)
--spring-card       cubic-bezier(0.34, 1.56, 0.64, 1)   /* k=300, d=20 */
--spring-button     cubic-bezier(0.34, 1.80, 0.64, 1)   /* k=500, d=25 */
--spring-nav        cubic-bezier(0.45, 1.20, 0.40, 1)   /* k=200, d=30 */
```

`prefers-reduced-motion: reduce` collapses every duration to `0.01ms`,
preserving layout transitions while suppressing animation.

## §Z. Specimens

Living, side-by-side specimens for type, colour, spacing, components,
motion, and brand live in `docs/specimens/*.html`. Open any of them in
a browser — they are self-contained, no build step. Each specimen
imports `_foundation.css` (a copy of the engine + tokens + fonts)
sitting next to it.
