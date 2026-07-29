# THEKY P08.6 — Responsive Platform Suite Viewport UI Specifications

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 13-responsive-variants.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Five Platform Suite Viewport Adaptations

```
+---------------------------------------------------------------------------------------------------------+
|                                 PLATFORM SUITE RESPONSIVE ADAPTATION SPECTRUM                           |
+------------------+------------------+-----------------------+---------------------+---------------------+
| VIEWPORT NAME    | WIDTH BREAKPOINT | COLUMN GRID           | PANEL BEHAVIOR      | PRIMARY SURFACE     |
+------------------+------------------+-----------------------+---------------------+---------------------+
| `Ultra-Wide`     | 2560px+          | 16 Columns (8px Gap)  | 4 Split Canvases    | Parallel Audit      |
| `Desktop (Base)` | 1440px - 2559px  | 12 Columns (16px Gap) | 3 Panels (Nav+Canvas+AI Telemetry Drawer)| Admin Shell|
| `Laptop`         | 1024px - 1439px  | 12 Columns (16px Gap) | 2 Panels (Nav+Canvas, Overlay Drawer)| Admin Focus |
| `Tablet`         | 768px - 1023px   | 8 Columns (16px Gap)  | Touch Health Canvas | Bottom Sheet Specs  |
| `Mobile`         | 375px - 767px    | 4 Columns (12px Gap)  | Health Companion    | Mobile Revoke       |
+------------------+------------------+-----------------------+---------------------+---------------------+
```

---
