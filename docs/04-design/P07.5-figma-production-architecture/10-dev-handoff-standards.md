# THEKY P07.5 — Developer Handoff & Dev Mode Standards

> **Program P07.5: Figma Production Architecture**  
> **Document:** 10-dev-handoff-standards.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION ARCHITECTURE (LOCKED)  

---

## 1. Dev Mode Annotation Standards

Frontend and desktop engineers consume designs exclusively via **Figma Dev Mode**:

```
+-----------------------------------------------------------------------------------+
|                        DEVELOPER HANDOFF ANNOTATION SPEC                          |
|                                                                                   |
|  1. Token Inspections ── All dimensions display semantic token names               |
|                           (e.g., `sys.token.spacing.md`, not `16px`).            |
|  2. Code Snippets     ── Auto-generated CSS / Rust layout props match             |
|                           `types.rs` IPC struct definitions (**INV-04**).         |
|  3. Asset Export      ── SVG icons exported with vector path minification.        |
+-----------------------------------------------------------------------------------+
```

---
