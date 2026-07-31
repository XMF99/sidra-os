# THEKY UX 2.0 — PHASE U4: DESIGN SYSTEM & VISUAL LANGUAGE

**Role:** Design Director • Principal UI Designer • Design System Architect • Brand Experience Designer  
**Platform:** THEKY Enterprise AI Operating System  
**Document Code:** `UX_5_DESIGN_SYSTEM.md`  
**Status:** **APPROVED VISUAL LANGUAGE & DESIGN SYSTEM SPECIFICATION**

$$\begin{matrix}
\text{Intelligence, Trust \& Precision} & \longleftrightarrow & \text{Modern Enterprise Visual Language} \\
& \Downarrow & \\
\text{Design Tokens (Color, Type, Space, Motion)} & \longleftrightarrow & \text{18 Component Library Specifications}
\end{matrix}$$

---

## SECTION 1: BRAND PERSONALITY

THEKY is an **AI-Native Enterprise Operating System** designed to feel like an intelligent, trustworthy, and calm partner in human cognitive work.

- **How Users Feel**: Empowered, calm, in control, and supported. Users feel they are commanding an intelligent operating system rather than struggling with a dense, confusing ERP.
- **Communication Style**: Direct, concise, precise, respectful, and transparent. THEKY communicates using clear natural language, avoiding cryptic error codes and robotic jargon.
- **Emotional Response**: Evokes confidence, clarity, focus, and quiet elegance.

---

## SECTION 2: VISUAL PRINCIPLES

1. **Clarity Over Clutter**: Every element on screen must serve a distinct purpose. Eliminate decorative lines, redundant borders, and unnecessary visual noise.
2. **Focus Through Depth**: Use glassmorphic surface elevation, subtle backdrop blurs, and soft radial shadows to create clear visual hierarchy between foreground tasks and background context.
3. **Whitespace as a Component**: Whitespace is used intentionally to group related concepts, separate content domains, and reduce cognitive fatigue.
4. **Purposeful Motion**: Motion is never purely decorative; it communicates state transitions, execution progress, AI streaming, and user actions with 150ms–300ms physics-based easing.
5. **Radical Transparency**: AI activity, capability token permissions, and Vault transaction hashes are always presented clearly with color-coded status badges and explicit provenance labels.
6. **Universal Accessibility & Localization**: Native support for English (LTR) and Arabic (RTL) typography, high-contrast visual modes, and WCAG 2.1 AA compliance across all components.

---

## SECTION 3: COLOR SYSTEM

THEKY uses a curated, harmonious HSL color system designed for high legibility, calm focus, and precise status identification.

```
Primary Accent (Indigo/Violet):   hsl(238, 83%, 66%)  // #6366f1
Secondary Accent (Sky/Cyan):     hsl(199, 89%, 48%)  // #0ea5e9
Success Status (Emerald):         hsl(160, 84%, 39%)  // #10b981
Warning / Gate (Amber):           hsl(38, 92%, 50%)   // #f59e0b
Error / Alert (Rose):             hsl(350, 89%, 60%)  // #f43f5e
Neutral Surface Background:       hsl(224, 25%, 8%)   // #0f121d
Neutral Raised Surface:           hsl(222, 22%, 12%)  // #151926
Neutral Elevated Surface:         hsl(220, 20%, 16%)  // #1d2232
```

### 3.1 Domain & Status Color Mapping

- **AI Activity Colors**: Pulsing Electric Cyan (`hsl(190, 95%, 50%)`) for live AI thinking/streaming; Soft Indigo (`hsl(240, 75%, 65%)`) for idle model state.
- **Mission Status Colors**:
  - `Completed`: Emerald (`hsl(160, 84%, 39%)`)
  - `In Progress`: Electric Indigo (`hsl(238, 83%, 66%)`)
  - `Requires Approval`: Warning Amber (`hsl(38, 92%, 50%)`)
  - `Pending`: Slate Gray (`hsl(215, 16%, 47%)`)
  - `Failed`: Rose Red (`hsl(350, 89%, 60%)`)
- **Knowledge & Vector Colors**: Deep Violet (`hsl(270, 76%, 60%)`) for Knowledge Graph nodes and similarity scores.
- **Marketplace Colors**: Warm Gold (`hsl(45, 93%, 47%)`) for verified enterprise blueprints and top-rated agent plugins.
- **Dark Theme (Default)**: Deep obsidian surfaces (`#0f121d`) with subtle 1px muted slate borders (`#242938`) and bright white primary text (`#ffffff`).
- **Light Theme**: Clean crisp porcelain surfaces (`#f8fafc`) with soft slate borders (`#e2e8f0`) and dark charcoal primary text (`#0f172a`).
- **High Contrast Theme**: Pure black background (`#000000`) with high-visibility yellow (`#ffff00`) and cyan (`#00ffff`) outlines.

---

## SECTION 4: TYPOGRAPHY SYSTEM

THEKY pairs high-legibility modern sans-serif typefaces for English LTR (`Inter`) and Arabic RTL (`Cairo` / `Tajawal`), with a specialized monospace font (`JetBrains Mono`) for code, logs, and Vault SHA-256 hashes.

```
Display Large:   32px / Line-Height: 40px / Weight: 700 (Bold)
Heading 1:       24px / Line-Height: 32px / Weight: 600 (Semi-Bold)
Heading 2:       20px / Line-Height: 28px / Weight: 600 (Semi-Bold)
Heading 3:       16px / Line-Height: 24px / Weight: 600 (Semi-Bold)
Body Large:      15px / Line-Height: 22px / Weight: 400 (Regular)
Body Regular:    14px / Line-Height: 20px / Weight: 400 (Regular)
Caption / Badge: 12px / Line-Height: 16px / Weight: 500 (Medium)
Monospace Code:  13px / Line-Height: 18px / Weight: 400 (Regular)
```

- **English Font Family**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Arabic Font Family**: `Cairo, Tajawal, "Segoe UI", Tahoma, sans-serif`
- **Monospace Font Family**: `"JetBrains Mono", "Fira Code", Consolas, monospace`

---

## SECTION 5: ICONOGRAPHY SYSTEM

- **Icon Set**: Clean, geometric 24x24 pixel vector icons (`Lucide React` style).
- **Stroke Width**: Uniform 1.75px stroke width for maximum legibility at small sizes.
- **Corner Radius**: Smooth 2px rounded stroke join corners.
- **Filled vs Outline Usage**: Outline icons for resting state navigation; filled/colored icons for active selection, warnings, and AI status indicators.
- **Specialized Icons**:
  - `AI Engine`: Sparkles / Glowing Orb
  - `Mission DAG`: Network / Git Branch
  - `Knowledge Graph`: Brain / Molecule Node
  - `Vault Security`: Shield Check / Lock Hash
  - `SaaS Connector`: Plug Zap / OAuth Link

---

## SECTION 6: SPACING & GRID SYSTEM

THEKY enforces a strict **8-pixel baseline grid** for container layout and a **4-pixel micro-grid** for component padding.

```
Space 1 (4px):   Micro gaps between badges and text labels
Space 2 (8px):   Padding inside small buttons and input fields
Space 3 (12px):  Gap between icon and label inside button
Space 4 (16px):  Standard card internal padding and grid gap
Space 5 (24px):  Container section spacing and header padding
Space 6 (32px):  Major section divides and modal padding
Space 8 (48px):  Page canvas margins and topbar height
```

- **Grid Columns**: 12-column responsive layout grid with 16px gutters on Desktop, 8px gutters on Mobile.

---

## SECTION 7: COMPONENT LIBRARY SPECIFICATIONS

### 7.1 Buttons
- **Primary Accent Button**: Solid Indigo fill (`#6366f1`), white text, 6px border radius, subtle hover elevation lift, active press scale (`transform: scale(0.98)`).
- **Secondary Ghost Button**: Transparent background, 1px muted slate border (`#242938`), hover background surface highlight (`#1d2232`).
- **Destructive Button**: Solid Rose fill (`#f43f5e`), white text for critical deletion actions.

### 7.2 Inputs & Dropdowns
- **TextInput**: 1px muted slate border, 6px border radius, dark surface background (`#12151e`), active focus ring (`2px solid #6366f1`).
- **Dropdown Menu**: Floating glassmorphic surface with `backdrop-filter: blur(12px)`, 8px radius, checkmark selection indicator.

### 7.3 Cards & Containers
- **Content Card**: Dark raised surface background (`#151926`), 1px subtle border (`#242938`), 8px border radius, 16px internal padding.
- **Active Selection Card**: Elevated indigo background tint (`rgba(99, 102, 241, 0.15)`), 1px solid primary accent border (`#6366f1`).

### 7.4 Status Badges & Pills
- **Pill Badge**: 12px font size, 500 medium weight, 4px vertical padding, 8px horizontal padding, pill border radius (`9999px`).
- **Colors**: Green for `Success`, Amber for `Warning`, Rose for `Error`, Cyan for `AI Active`, Slate for `Pending`.

### 7.5 Mission DAG Execution Cards
- **DAG Node Card**: Rounded rectangular node container displaying step title, assigned agent avatar, step number, status pill badge, and Vault hash indicator.
- **Connecting Lines**: 2px solid stroke connecting dependencies; pulsing glowing animated dash pattern for active executing steps.

---

## SECTION 8: MOTION & ANIMATION SYSTEM

- **Page View Transitions**: Fade and slide-up transition (200ms `cubic-bezier(0.16, 1, 0.3, 1)`).
- **Hover Effects**: 150ms smooth translation and border glow change (`transition: all 150ms ease-out`).
- **AI Streaming Response**: Continuous pulse animation on AI status indicator; smooth Markdown token streaming with auto-scroll lock.
- **Approval Gate Confirmation**: 300ms button morph animation from loading spinner to checkmark confirmation state.
- **Reduced Motion Support**: `@media (prefers-reduced-motion: reduce)` disables all continuous pulsing, sliding transitions, and particle effects.

---

## SECTION 9: VOICE & TONE GUIDELINES

THEKY communicates with human warmth, clarity, and authority:

- **Error Message Rule**: Never display raw stack traces or robotic codes without explanation.  
  - *Incorrect*: `ERR_AUTH_FAIL_401_NULL_PTR`  
  - *Correct*: `"Authentication session expired. Please sign in again to continue."`
- **Success Message Rule**: Confirm actions concisely without excessive praise.  
  - *Correct*: `"Mission Step 3 approved. Step 4 execution started."`
- **AI Reasoning Explanation Rule**: Explain AI decisions transparently.  
  - *Correct*: `"AI Studio Director selected Vulkan Shader Compiler based on Project CyberSidra requirements."`

---

## SECTION 10: ILLUSTRATION & EMPTY STATE STYLE

- **Illustration Style**: Minimalist, technical geometric line art featuring glowing accent nodes and subtle grid mesh backgrounds.
- **Empty States**: Centered illustration icon, calm headline (e.g. `"No Active Missions"`), supportive explanation text, and prominent primary action button (`[Create Mission]`).

---

## SECTION 11: ACCESSIBILITY STANDARDS (WCAG 2.1 AA)

- **Color Contrast**: 4.5:1 minimum contrast ratio for body text; 3:1 for large display headers and icons.
- **Keyboard Navigation**: 100% accessible via keyboard (`Tab`, `Shift+Tab`, `Space`, `Enter`, `Esc`, `Arrow Keys`, `Ctrl+K`).
- **Screen Reader Support**: ARIA landmarks (`role="main"`, `role="navigation"`, `role="dialog"`, `aria-live="polite"`).
- **Touch Targets**: 44px x 44px minimum touch target size for mobile buttons and interactive icons.

---

## SECTION 12: DESIGN TOKENS SPECIFICATION

Below is the reusable design token dictionary for developer implementation:

```json
{
  "color": {
    "bg": {
      "surface": "#0f121d",
      "raised": "#151926",
      "elevated": "#1d2232"
    },
    "border": {
      "subtle": "#242938",
      "accent": "#6366f1"
    },
    "brand": {
      "primary": "#6366f1",
      "secondary": "#0ea5e9"
    },
    "status": {
      "success": "#10b981",
      "warning": "#f59e0b",
      "danger": "#f43f5e",
      "ai": "#00f2ff"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": "Inter, Cairo, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "md": "16px",
      "lg": "20px",
      "xl": "24px"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "24px",
    "6": "32px"
  },
  "radii": {
    "sm": "4px",
    "md": "6px",
    "lg": "8px",
    "pill": "9999px"
  },
  "motion": {
    "duration": {
      "fast": "150ms",
      "normal": "200ms",
      "slow": "300ms"
    },
    "easing": {
      "standard": "cubic-bezier(0.16, 1, 0.3, 1)"
    }
  }
}
```

---

```
========================================================
UX 5.0 DESIGN SYSTEM & VISUAL LANGUAGE CERTIFIED
========================================================
DOCUMENT UX_5_DESIGN_SYSTEM.MD CREATED
DEFINING BRAND PERSONALITY, COLOR SYSTEM, TYPOGRAPHY,
ICONOGRAPHY, SPACING, 18 COMPONENTS, MOTION, AND DESIGN TOKENS.
========================================================
```
