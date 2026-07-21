# Design System — "Night Atrium"

The visual identity of Sidra OS. Named for what it is: a lit atrium in a building at night, seen from the
inside.

## 1. Direction

**The reference is not other software.** It is the material world of institutions that operate after dark
and take themselves seriously — trading floors, control rooms, ship bridges, law-firm libraries. Ink and
brass. Glass with weight. Instruments that report.

Three deliberate rejections, made because they are where this category defaults:

| Default we rejected | Why |
|---|---|
| Near-black + acid green/violet accent | The universal "AI product" tell. Reads as a demo, not an institution |
| Cream + high-contrast serif + terracotta | The other universal tell; wrong register entirely for a dark control room |
| Purple-blue gradient glass over a blurred blob | Decoration pretending to be depth |

**What we chose instead:** a blue-black ink field, layered glass with real elevation, and a single **brass**
accent — a metal, not a light. Brass is warm, structural, and unmistakably not a notification color, which
is exactly why signals get their own separate hue. The one aesthetic risk taken: the executive documents
(Briefs, Decisions, Minutes) are set in a **serif** on a dark field, at generous size. Serif on dark is
unusual and slightly difficult — and it is right, because it marks the difference between *reading a
considered document* and *scanning an interface*. That distinction is the whole product.

## 2. Color

All colors are CSS custom properties. Hard-coded values are a lint error.

### Surfaces (dark theme, default)

| Token | Value | Use |
|---|---|---|
| `--sd-color-canvas` | `#070A0F` | App background, behind everything |
| `--sd-color-surface` | `#0C111A` | Rail, Sidebar, Dock |
| `--sd-color-surface-raised` | `#121927` | Cards, panels, table headers |
| `--sd-color-surface-overlay` | `#182133` | Popovers, menus, palette |
| `--sd-color-surface-sunken` | `#050810` | Inputs, code blocks, wells |
| `--sd-color-hairline` | `#243044` | 1 px dividers, borders |
| `--sd-color-hairline-strong` | `#33445E` | Focus-adjacent borders, active dividers |

### Text

| Token | Value | Contrast on canvas | Use |
|---|---|---|---|
| `--sd-color-text` | `#E9EEF6` | 15.8:1 | Primary |
| `--sd-color-text-secondary` | `#A3B0C2` | 8.1:1 | Labels, metadata |
| `--sd-color-text-tertiary` | `#6B7A8F` | 4.6:1 | Timestamps, disabled-adjacent |
| `--sd-color-text-inverse` | `#0A0E15` | — | On brass fills |

### Accent — Brass

| Token | Value | Use |
|---|---|---|
| `--sd-color-brass` | `#C9A227` | Primary actions, the Ledger Line, active nav |
| `--sd-color-brass-bright` | `#E3BE4A` | Hover, focus ring |
| `--sd-color-brass-dim` | `#8A6F1B` | Pressed, disabled accent |
| `--sd-color-brass-wash` | `rgba(201,162,39,0.10)` | Selected row, active tab background |

Brass is used *sparingly* — target under 5% of pixels on any screen. It marks what is active and what the
Principal should touch. Nothing else.

### Signals

Deliberately cool and separate from brass, so a status never looks like an action.

| Token | Value | Meaning |
|---|---|---|
| `--sd-color-live` | `#3FB9AE` | An agent is working right now |
| `--sd-color-ok` | `#4FA97A` | Passed, accepted, healthy |
| `--sd-color-warn` | `#D8973C` | Degraded, partial, needs attention |
| `--sd-color-danger` | `#D95C63` | Blocked, failed, destructive |
| `--sd-color-info` | `#5E8FD6` | Informational, links |
| `--sd-color-dissent` | `#9B7FD4` | Dissent and contested Canon — its own hue on purpose |

Status is never conveyed by color alone: every signal pairs with a glyph and a label.

### Agent identity

Each agent has a fixed hue used only in its avatar ring and its nodes in the progress spine — never as a
surface fill.

| Kai | Rune | Iris | Vega | Orin | Mira | Argus | Atlas | Sable | Cass | Quill |
|---|---|---|---|---|---|---|---|---|---|---|
| `#C9A227` | `#5E8FD6` | `#3FB9AE` | `#7FB069` | `#9B7FD4` | `#E28FA8` | `#D95C63` | `#8AA1B8` | `#D8973C` | `#4FA97A` | `#B0A48A` |

### Light theme (P1)

Same token names, remapped: canvas `#F5F6F8`, surface `#FFFFFF`, hairline `#DCE1E8`, text `#0C111A`, brass
darkened to `#8A6F1B` for contrast. Every token is verified against WCAG AA in both themes by a test.

## 3. Typography

Three faces, three jobs. This pairing is the identity.

| Role | Face | Why |
|---|---|---|
| **Interface** | **Inter Tight** | Dense, narrow, excellent at 12–14 px, designed for tight UI. Not plain Inter — the tighter widths let us hit the density target without shrinking the type |
| **Document** | **Newsreader** | A variable serif with real optical sizing. Used for Briefs, Decisions, Minutes, and artifact previews. Signals "this is a considered document, read it" versus "this is chrome, scan it" |
| **Data** | **JetBrains Mono** | Tabular figures, code, ids, costs, traces. Its distinct zero and clear ambiguity handling matter when reading ULIDs |

All three are variable fonts, subset and bundled locally. No network font loading, ever.

### Scale

An 8-step scale on a 1.2 ratio, tuned by hand at small sizes.

| Token | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|
| `--sd-type-display` | 32/38 | 400 | -0.02em | Brief title (Newsreader) |
| `--sd-type-title` | 22/28 | 400 | -0.01em | Room titles, document headings (Newsreader) |
| `--sd-type-heading` | 16/22 | 600 | -0.01em | Section headers (Inter Tight) |
| `--sd-type-body` | 14/21 | 400 | 0 | Interface body (Inter Tight) |
| `--sd-type-prose` | 16/26 | 400 | 0 | Document body (Newsreader) |
| `--sd-type-label` | 12/16 | 500 | 0.01em | Labels, metadata |
| `--sd-type-micro` | 11/14 | 500 | 0.04em | Eyebrows, table headers — uppercase |
| `--sd-type-mono` | 12/18 | 400 | 0 | Data, ids, costs |

Rules: prose measure capped at 72ch. Numeric columns always `font-variant-numeric: tabular-nums`. Uppercase
only at `micro` with tracking. No font-weight below 400 anywhere on dark.

## 4. Glass

Glass is used for **floating** surfaces only — things that are above the plane: the command palette, popovers,
the approval sheet, the Dock, and the Ledger Line. Never for content that scrolls, and never more than three
simultaneously (a measured GPU constraint, not a style preference).

```css
.sd-glass {
  background: color-mix(in oklab, var(--sd-color-surface-overlay) 72%, transparent);
  backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid color-mix(in oklab, var(--sd-color-hairline-strong) 60%, transparent);
  box-shadow:
    0 1px 0 0 rgba(255,255,255,0.06) inset,   /* top edge catch-light — the "thickness" */
    0 16px 48px -12px rgba(0,0,0,0.72),
    0 2px 8px -2px rgba(0,0,0,0.5);
}
@supports not (backdrop-filter: blur(1px)) {
  .sd-glass { background: var(--sd-color-surface-overlay); }
}
@media (prefers-reduced-transparency: reduce) {
  .sd-glass { background: var(--sd-color-surface-overlay); backdrop-filter: none; }
}
```

The inset top highlight is what makes it read as a physical pane rather than a translucent rectangle. It is
1 px, 6% white, and it is the detail that carries the whole material.

## 5. Elevation

| Level | Shadow | Used by |
|---|---|---|
| 0 | none | Canvas, inline content |
| 1 | `0 1px 2px rgba(0,0,0,0.4)` | Raised cards, table headers |
| 2 | `0 4px 12px -2px rgba(0,0,0,0.55)` | Dropdowns, tooltips |
| 3 | glass shadow above | Palette, sheets, Dock |
| 4 | `0 24px 64px -16px rgba(0,0,0,0.8)` | Modal (rare) |

## 6. Space and shape

4 px base grid. Spacing tokens: `2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

Radii: `--sd-radius-sm: 6px` (inputs, chips), `-md: 10px` (cards, buttons), `-lg: 14px` (panels, sheets),
`-xl: 20px` (palette), `-full: 999px` (avatars, pills). Nothing is square except tables and dividers.

Borders are 1 px hairlines. Structure comes from hairlines and elevation, not from boxes inside boxes.

## 7. Motion

| Token | Duration | Easing | Use |
|---|---|---|---|
| `--sd-motion-instant` | 90 ms | `cubic-bezier(0.2,0,0.4,1)` | Hover, focus, checkbox |
| `--sd-motion-quick` | 140 ms | `cubic-bezier(0.2,0,0,1)` | Menus, tooltips, chips |
| `--sd-motion-standard` | 200 ms | `cubic-bezier(0.2,0,0,1)` | Panels, sheets, room transitions |
| `--sd-motion-emphasis` | 320 ms | `cubic-bezier(0.16,1,0.3,1)` | Palette open, approval sheet |
| `--sd-motion-spring` | — | spring(stiffness 320, damping 32) | Panel drag release, Dock cards |

Rules:
- Everything the user is waiting on completes in ≤240 ms.
- Motion moves along the axis of causality: the palette drops from the top because it comes from the
  command line; the Inspector slides from the right because that is where it lives.
- Enter animations are faster than exits — arriving should feel immediate, leaving can be graceful.
- One orchestrated moment exists in the whole product: **app launch**. The Ledger Line draws across the top
  left-to-right over 420 ms, the Rail fades in, then the Lobby's Brief rises 8 px into place. It happens
  once per session, it takes under half a second, and it is the only moment the building performs.
- `prefers-reduced-motion: reduce` replaces every transform/opacity transition with an instant state change,
  including the launch sequence.

## 8. The signature: the Ledger Line

A 2 px hairline across the very top of the Shell, below the title bar. It is the Firm's pulse.

- **Idle** — flat brass at 25% opacity. Barely there.
- **Active** — segments of `--sd-color-live` travel left to right, one segment per running Turn, at a speed
  proportional to nothing at all (it is not a progress bar and never pretends to be). It shows *that* work
  is happening and *how much*.
- **Blocked** — the line holds a static amber segment at the position of the blocked step.
- **Approval pending** — a single brass pip pulses at 0.5 Hz until answered.
- **Night Shift** — a slow, dim traverse, 1/8 speed. The building is running with the lights off.

It is 2 px tall, it is always visible in every room, it never demands attention, and after a week the
Principal reads it without looking at it. That is the intent: an ambient instrument, like a ship's engine
note.

## 9. Iconography

Lucide, 16 px and 20 px, 1.5 px stroke, aligned to the pixel grid. Icons are always paired with a label
except in the Rail (which has tooltips and keyboard bindings). Agent avatars are not icons: they are a
monogram in the agent's hue inside a 1.5 px ring, and the ring animates only while that agent is running.

## 10. Token contract

```css
:root {
  /* color, space, radius, type, motion, elevation — full set generated from tokens.json */
}
```

`design/tokens.json` is the single source. It generates `tokens.css`, a TypeScript type union for
autocomplete, and the Tailwind preset. Rules enforced in CI: no hex values outside `tokens.json`; no
arbitrary Tailwind values; every new token requires a rationale in the PR; contrast pairs are verified
programmatically in both themes.
