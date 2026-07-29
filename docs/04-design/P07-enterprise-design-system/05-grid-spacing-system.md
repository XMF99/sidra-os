# THEKY P07 — Grid, Spacing, & Breakpoint Architecture

> **Program P07: Enterprise Design System**  
> **Document:** 05-grid-spacing-system.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENTERPRISE DESIGN SYSTEM (LOCKED)  

---

## 1. 8px Base Grid Rhythm

All component paddings, container margins, and panel dimensions adhere strictly to an 8px base grid rhythm:

```
+---------------------------------------------------------------------------------------------------------+
|                                      SPACING SCALE HIERARCHY                                            |
+------------------+------------------+------------------+--------------------+---------------------+
| `space.xs` (4px) | `space.sm` (8px) | `space.md` (16px)| `space.lg` (24px)  | `space.xl` (32px)   |
+------------------+------------------+------------------+--------------------+---------------------+
| • Micro Padding  | • Element Gap    | • Card Padding   | • Container Margin | • Section Separator |
+------------------+------------------+------------------+--------------------+---------------------+
```

---

## 2. Multi-Platform Responsive Grids

* **Desktop Shell (12-Column Grid):** Multi-panel split views and docking drawers.
* **Web Client (12/8-Column Grid):** Responsive browser viewports.
* **Mobile Companion (4-Column Grid):** Single-hand brief approval zones.

---
