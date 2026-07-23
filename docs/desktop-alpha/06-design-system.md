# Design System

The visual and interaction foundation. Its single output is a **token layer**
(CSS custom properties, ADR-0084) that every component consumes. Values below are
the **Sprint-1 default palette and scales** — a coherent, accessible starting
system; exact brand values are ratified in Epic 0 and swapped at the token level
without touching components.

Naming convention: `--sd-<category>-<role>[-<variant>]`. Two tiers: **primitive**
(raw) → **semantic** (role). Components use **semantic** tokens only.

---

## 1. Color system

### 1.1 Primitives (raw ramps, 50→900)
Neutral, Brand (primary), and status ramps (success/warning/danger/info) each as
a 10-step scale. Example anchor values (indicative, ratify in Epic 0):

- Neutral: `--sd-neutral-0:#ffffff … --sd-neutral-950:#0b0d10`
- Brand: `--sd-brand-500:#3b6ef5` (primary), with 50…900 around it
- Success `#1f9d55`, Warning `#c77700`, Danger `#d64545`, Info `#2b7de9`
  (each as a ramp)

### 1.2 Semantic tokens (what components use)
Defined twice — under `:root[data-theme='light']` and `[data-theme='dark']`:

| Semantic token | Role |
|---|---|
| `--sd-color-bg-app` | window background |
| `--sd-color-bg-surface` | cards, panels |
| `--sd-color-bg-surface-raised` | popovers, menus |
| `--sd-color-bg-inset` | wells, inputs |
| `--sd-color-border` / `--sd-color-border-strong` | dividers, outlines |
| `--sd-color-text` / `--sd-color-text-muted` / `--sd-color-text-subtle` | text hierarchy |
| `--sd-color-primary` / `-hover` / `-active` / `-contrast` | primary actions |
| `--sd-color-focus` | focus ring |
| `--sd-color-status-{success,warning,danger,info}` + `-bg` | status |
| `--sd-color-overlay` | scrim behind modals |
| `--sd-color-selection` | selected rows/items |

### 1.3 Themes
- **Light** and **dark** are full semantic mappings (not a filter). **System**
  follows OS.
- **High-contrast** variant raises text/border contrast and thickens focus.
- **Contrast requirement:** all text/background pairings meet **WCAG 2.1 AA**
  (4.5:1 body, 3:1 large/UI). A CI/lint check (design-token contrast validator)
  is recommended in the checklist (`17`).

---

## 2. Typography

- **Families:** a UI sans (system stack fallback: `Inter, "Segoe UI", system-ui,
  …`) and a mono for code/ids/events (`"JetBrains Mono", ui-monospace, …`).
  **Arabic-first:** an Arabic-capable family in the stack (e.g. `"IBM Plex Sans
  Arabic"`) and correct `dir=rtl` shaping.
- **Type scale** (`--sd-font-size-*`), 1.2 ratio: `xs 12 · sm 13 · base 14 ·
  md 16 · lg 18 · xl 22 · 2xl 28 · 3xl 34`. Base UI text is 14px (desktop-dense).
- **Weights:** 400/500/600/700 (`--sd-font-weight-*`).
- **Line-height:** `--sd-leading-tight 1.25 · -normal 1.5 · -relaxed 1.7`.
- **Roles:** `display, title, heading, subheading, body, label, caption, code`
  each a token bundle (size+weight+leading+tracking).

---

## 3. Spacing

- **4px base grid.** `--sd-space-0:0 · 1:4 · 2:8 · 3:12 · 4:16 · 5:20 · 6:24 ·
  8:32 · 10:40 · 12:48 · 16:64`.
- Components and layout use only these steps. Gutters, paddings, and stack gaps
  reference tokens; no magic pixel values.
- **Layout tokens:** `--sd-sidebar-w:240px`, `--sd-sidebar-w-collapsed:64px`,
  `--sd-topbar-h:52px`, `--sd-statusbar-h:28px`, `--sd-titlebar-h:36px`,
  `--sd-content-max:1440px`.

---

## 4. Elevation

Five levels via layered shadows + surface tokens (`--sd-shadow-0…4`):

| Level | Use | Note |
|---|---|---|
| 0 | flush surfaces | border only |
| 1 | cards | subtle |
| 2 | raised cards, sticky headers | |
| 3 | popovers, dropdowns, command palette | |
| 4 | modals, sheets | + overlay scrim |

Dark theme reduces shadow spread and leans on `border`/`bg-raised` contrast
(shadows read weakly on dark).

---

## 5. Corner radius

`--sd-radius-none:0 · -sm:4 · -md:8 · -lg:12 · -xl:16 · -pill:999 · -circle:50%`.
Defaults: inputs/buttons `md`, cards `lg`, sheets/modals `xl`, avatars/badges
`pill`/`circle`. One radius language across the app.

---

## 6. Icons

- **Single icon set** (outline, 1.5px stroke, 24px grid; recommend Lucide or
  Phosphor — pick one in Epic 0), sized via `--sd-icon-{sm:16,md:20,lg:24}`.
- Icons are **decorative or labeled**: standalone icon buttons carry
  `aria-label`; icon+text needs no label.
- Status/entity icons are semantic (mission, agent, department, connector,
  event, memory) and reused everywhere for recognizability.
- Icons inherit `currentColor` so they theme automatically.

---

## 7. Motion (animations & transitions)

- **Duration tokens:** `--sd-motion-fast:120ms · -base:180ms · -slow:260ms`.
- **Easing tokens:** `--sd-ease-standard`, `-decelerate`, `-accelerate` (cubic-
  beziers). Enter decelerates, exit accelerates.
- **Patterns:** overlays fade+scale (98%→100%); sheets slide from edge; toasts
  slide+fade; skeleton shimmer; route change is an instant swap with content
  fade (no heavy page transitions in a desktop app).
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses all
  durations toward 0 and removes non-essential movement (`--sd-motion-*`→~0).
- **Purposeful only:** motion communicates state/continuity, never decoration.

---

## 8. Component tokens

Each component reads a small set of component-scoped tokens that *reference*
semantic tokens, so a component can be retuned without a global change. Examples:

- Button: `--sd-btn-height-{sm,md,lg}`, `--sd-btn-padding-x`, `--sd-btn-radius`,
  and per-variant color refs (`primary/secondary/ghost/danger`).
- Card: `--sd-card-bg`(→`bg-surface`), `--sd-card-border`, `--sd-card-radius`,
  `--sd-card-padding`, `--sd-card-shadow`.
- Input: `--sd-input-height`, `--sd-input-bg`(→`bg-inset`), `--sd-input-border`,
  `--sd-input-focus`(→`color-focus`).
- Badge, Tab, Sidebar item, Timeline node, Data grid row each have an analogous
  token bundle (enumerated in `07-component-library.md`).

This three-tier flow — primitive → semantic → component — is the theming
contract: brand ratification changes primitives; a component tweak changes only
that component's bundle.

---

## 9. Accessibility (baseline for Sprint 1)

- **WCAG 2.1 AA** color contrast across both themes (validator in checklist).
- **Keyboard-complete:** every action reachable and operable by keyboard; visible
  focus ring (`--sd-color-focus`, ≥2px, ≥3:1 contrast) never suppressed.
- **Focus management:** overlays trap focus and restore it on close; route
  changes move focus to the page heading; skip-to-content link.
- **Semantics/ARIA:** correct roles for nav, lists, grids, dialogs, tabs, live
  regions (status bar & toasts use `aria-live` politely).
- **Targets:** interactive targets ≥ 24×24 (≥ 32 preferred for primary).
- **Motion & density:** reduced-motion honored; comfortable/compact density
  never drops targets below the minimum.
- **RTL & i18n:** logical properties; no text baked into images; numerals/dates
  locale-aware.
- **Screen-reader labels** on all icon-only controls and status indicators.

---

## 10. Light & dark theme parity

Both themes are **first-class**: every component is designed and reviewed in both.
Rules: never encode meaning in a single hue without a second cue (icon/label);
status colors keep AA contrast on their `-bg` tokens in both themes; imagery/
illustrations have theme variants or are theme-neutral SVG using `currentColor`;
charts pull series colors from a theme-aware categorical token set
(`--sd-chart-1…8`) validated for contrast and color-blind safety in both themes.
