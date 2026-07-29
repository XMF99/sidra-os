# THEKY P08.1 — Production Corner Radius, Elevation, & Shadow Specs

> **Program P08.1: Visual Foundation Production**  
> **Document:** 04-radius-shadow-production.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION VISUAL FOUNDATION (LOCKED)  

---

## 1. Corner Radius Production Tokens

```
+------------------+----------+-------------------------------------------------------------------+
| RADIUS TOKEN     | VALUE    | TARGET COMPONENT USAGE SCOPE                                      |
+------------------+----------+-------------------------------------------------------------------+
| `radius-none`    | 0px      | Full-Bleed Desktop Window Canvases, Tab Splitters                 |
| `radius-sm`      | 4px      | Status Badges, Code Tags, Dense Table Cells                       |
| `radius-md`      | 8px      | Standard Buttons, Form Inputs, Dropdown Menus, Card Containers    |
| `radius-lg`      | 12px     | Executive Brief Modals, Docking Drawers, Floating Command Palette |
| `radius-full`    | 9999px   | User Avatar Badges, Active Task Status Pills                      |
+------------------+----------+-------------------------------------------------------------------+
```

---

## 2. Elevation & Shadow CSS Specifications

```css
/* Elevation Level 1: Low Cards & Input Focus */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.15);

/* Elevation Level 2: Standard Cards & Hover States */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15);

/* Elevation Level 3: Floating Panels & Drawers */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.20);

/* Elevation Level 4: Command Palette & Approval Modals */
--shadow-overlay: 0 25px 50px -12px rgba(0, 0, 0, 0.50);
--backdrop-blur: backdrop-filter: blur(12px) saturate(180%);
```

---
