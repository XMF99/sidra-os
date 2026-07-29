# THEKY P07.5 — Figma Variable Architecture & Mode Synchronization

> **Program P07.5: Figma Production Architecture**  
> **Document:** 06-variable-architecture.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION ARCHITECTURE (LOCKED)  

---

## 1. Three-Tier Variable Collections

Figma Variables are structured across 3 layered collections:

```
Collection 1: `sys-primitives` (Raw Scale Values: Spacing, Radius, Base Swatches)
  └── Collection 2: `sys-semantic` (Contextual Roles: Surface, Text, Border, Status)
        └── Collection 3: `sys-component` (Component Bindings: Button.Surface, Card.Border)
```

---

## 2. Variable Modes Matrix

Figma Variables support 4 synchronized modes:
1. **Mode 1: Dark Monastic (Default)** — High-contrast dark theme canvas.
2. **Mode 2: Light High-Contrast** — Light theme surface for executive printing.
3. **Mode 3: LTR English** — Left-to-right spacing and icon direction.
4. **Mode 4: RTL Arabic** — Right-to-left layout direction and icon mirroring.

---
