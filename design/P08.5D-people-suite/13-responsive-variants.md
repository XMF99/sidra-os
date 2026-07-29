# THEKY P08.5D — Responsive People Suite Viewport UI Specifications

> **Program P08.5D: People Suite UI Production**  
> **Document:** 13-responsive-variants.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Five People Suite Viewport Adaptations

```
+---------------------------------------------------------------------------------------------------------+
|                                  PEOPLE SUITE RESPONSIVE ADAPTATION SPECTRUM                            |
+------------------+------------------+-----------------------+---------------------+---------------------+
| VIEWPORT NAME    | WIDTH BREAKPOINT | COLUMN GRID           | PANEL BEHAVIOR      | PRIMARY SURFACE     |
+------------------+------------------+-----------------------+---------------------+---------------------+
| `Ultra-Wide`     | 2560px+          | 16 Columns (8px Gap)  | 4 Split Canvases    | Parallel Org Chart  |
| `Desktop (Base)` | 1440px - 2559px  | 12 Columns (16px Gap) | 3 Panels (Nav+Canvas+AI HR Advisor Drawer)| HR Shell|
| `Laptop`         | 1024px - 1439px  | 12 Columns (16px Gap) | 2 Panels (Nav+Canvas, Overlay Drawer)| Directory Focus|
| `Tablet`         | 768px - 1023px   | 8 Columns (16px Gap)  | Touch Candidate Map | Bottom Sheet Specs  |
| `Mobile`         | 375px - 767px    | 4 Columns (12px Gap)  | Single Column Stack | Leave Companion     |
+------------------+------------------+-----------------------+---------------------+---------------------+
```

---
