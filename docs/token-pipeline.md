# Token Pipeline — 5-Tier Architecture

```mermaid
graph TD
  subgraph "Tier 1 — Primitives"
    P["primitives.json — 134 tokens"]
  end

  subgraph "Tier 2 — Seed"
    S["seed.json — 20 brand decisions"]
  end

  subgraph "Tier 3 — Map"
    M["map.json — 96 derived tokens"]
    M1["5×10 intent colors via color-mix"]
    M2["4 neutral text alphas 88/65/45/25%"]
    M3["Fills, bgs, borders"]
    M4["Size, radius, fontSize, lineHeight scales"]
  end

  subgraph "Tier 4 — Semantic"
    A["semantic.json — 93 alias tokens"]
  end

  subgraph "Tier 5a — Components"
    CB["button.json — 20"]
    CC["card.json — 8"]
    CI["input.json — 15"]
    CBa["badge.json — 18"]
  end

  subgraph "Tier 5b — Themes"
    TL["light.json — 33 vars"]
    TD["dark.json — 33 vars"]
  end

  subgraph "Build"
    BS["build-tokens-sd.mjs"]
    BM["build-motion-presets.mjs"]
  end

  subgraph "Output"
    CSS["css/tokens.css — 479 CSS vars"]
    GSAP["dist/gsap/presets.js"]
    FM["dist/framer/variants.js"]
    KF["dist/animation-keyframes.css"]
  end

  P -->|raw values| S
  S -->|brand decisions| M
  M --> M1 & M2 & M3 & M4
  M -->|derived| A
  M -->|derived| CB & CC & CI & CBa
  S -->|direct refs| A

  P & S & M & A --> BS
  CB & CC & CI & CBa --> BS
  TL & TD --> BS
  BS --> CSS

  P -->|motion tokens| BM
  BM --> GSAP & FM & KF
```

## Reference Chain Example

```text
--badge-primaryBg
  → var(--map-color-primary-Bg)
    → color-mix(in oklch, var(--seed-colorPrimary) 15%, white)
      → var(--seed-color-pastel-honey)
        → #FFE082
```

## CSS Output Structure

```css
@layer tokens {
  :root {
    /* Tier 1 Seed — raw primitives (--seed-*) */
    /* Tier 2 Map — derived (--map-*) */
    /* Tier 3 Semantic — aliases (--color-*, --spacing-*, ...) */
  }
  :root { /* Tier 4 Components (--button-*, --card-*, ...) */ }
  :root { /* Tier 5 Light theme */ }
  [data-theme="dark"] { /* Tier 5 Dark theme */ }
  @media (prefers-color-scheme: dark) { /* OS preference fallback */ }
}
```
