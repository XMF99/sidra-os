# THEKY P08.1 — Production Icon System & Symbol Specifications

> **Program P08.1: Visual Foundation Production**  
> **Document:** 05-icon-production.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION VISUAL FOUNDATION (LOCKED)  

---

## 1. Icon Library & Geometry Specifications

```
+---------------------------------------------------------------------------------------------------------+
|                                    ICON GEOMETRY PRODUCTION SPECS                                       |
+------------------+------------------------------------+-------------------------------------------------+
| ATTRIBUTE        | SPECIFICATION VALUE                | PRODUCTION RATIONALE                            |
+------------------+------------------------------------+-------------------------------------------------+
| Icon Set         | `Lucide Icons Enterprise Subset`   | Clean, highly consistent open-source vectors    |
| Default Stroke   | `1.5px`                            | Monastic, high-precision line weight            |
| Active Fill      | `Solid Fill (Same Color)`          | High-contrast state distinction                 |
| Bounding Box     | Square 1:1 Aspect Ratio            | Zero layout reflow during icon swaps            |
+------------------+------------------------------------+-------------------------------------------------+
```

---

## 2. Icon Sizing Grid & RTL Mirroring

* **Dense Icon (`16px / 1.5px stroke`):** Inside data tables, micro badges, and metadata tags.
* **Standard Control Icon (`20px / 1.5px stroke`):** Inside buttons, inputs, and list rows.
* **Header Icon (`24px / 1.75px stroke`):** Inside module page headers and modal titles.
* **RTL Mirroring Rule:** Directional arrows (`arrow-right`, `chevron-right`) mirror horizontally in Arabic locales (`transform: scaleX(-1)`).

---
