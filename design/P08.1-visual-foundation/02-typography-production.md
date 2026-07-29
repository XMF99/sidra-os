# THEKY P08.1 — Production Typography System & Font Specs

> **Program P08.1: Visual Foundation Production**  
> **Document:** 02-typography-production.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION VISUAL FOUNDATION (LOCKED)  

---

## 1. Production Font Family Assignments

```
+---------------------------------------------------------------------------------------------------------+
|                                      FONT FAMILY PRODUCTION SELECTION                                   |
+----------------------+------------------------------------+---------------------------------------------+
| SCRIPT / ROLE        | PRIMARY FONT FAMILY                | FALLBACK FONT STACK                         |
+----------------------+------------------------------------+---------------------------------------------+
| English (LTR) Sans   | `Inter`                            | `system-ui, -apple-system, BlinkMacSystemFont`|
| Arabic (RTL) Sans    | `IBM Plex Sans Arabic`             | `Cairo, Noto Sans Arabic, sans-serif`       |
| Monospace (Audit/DAG)| `JetBrains Mono`                   | `ui-monospace, SFMono-Regular, Consolas`    |
+----------------------+------------------------------------+---------------------------------------------+
```

---

## 2. Typographic Scale & Hierarchy Specifications

```
+------------------+----------+-------------+---------+---------------+-----------------------------------+
| ROLE LEVEL       | FONT SIZE| LINE HEIGHT | WEIGHT  | TRACKING (LTR)| USAGE SCOPE                       |
+------------------+----------+-------------+---------+---------------+-----------------------------------+
| `Display`        | 36px     | 44px (1.22) | 700 Bold| -0.02em       | Executive Flight Deck Hero Titles |
| `Heading 1`      | 28px     | 36px (1.28) | 600 Semi| -0.015em      | Module Header Titles              |
| `Heading 2`      | 22px     | 28px (1.27) | 600 Semi| -0.01em       | Drawer & Modal Titles             |
| `Title`          | 16px     | 24px (1.50) | 600 Semi| 0.00em        | Card Titles & Table Headers       |
| `Body`           | 14px     | 20px (1.43) | 400 Reg | 0.00em        | Sovereign Markdown Text Body      |
| `Caption`        | 12px     | 16px (1.33) | 400 Reg | +0.01em       | Metadata Badges & Timestamps      |
| `Code Mono`      | 13px     | 18px (1.38) | 500 Med | 0.00em        | Hash Ledgers & WASM Sandbox Logs  |
+------------------+----------+-------------+---------+---------------+-----------------------------------+
```

---
