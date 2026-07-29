# THEKY P07.5 — Auto Layout Standards & Responsive Framing

> **Program P07.5: Figma Production Architecture**  
> **Document:** 07-auto-layout-standards.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION ARCHITECTURE (LOCKED)  

---

## 1. Auto Layout Mandate & Rules

1. **100% Auto Layout Standard:** Manual pixel frame placement is strictly forbidden. Every container, screen, card, drawer, and modal must use Figma Auto Layout.
2. **Variable Binding:** Spacing gaps, padding, and stroke weights must be bound to `sys-semantic` variable tokens.
3. **Resizing Rules:**
   - **Horizontal Resizing:** Primary document content uses `Fill Container` (with max-width constraints).
   - **Vertical Resizing:** Cards and buttons use `Hug Contents`.

---
