# THEKY P07 — Iconography System & Semantic Symbol Architecture

> **Program P07: Enterprise Design System**  
> **Document:** 06-iconography-system.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENTERPRISE DESIGN SYSTEM (LOCKED)  

---

## 1. Semantic Icon Categories

```
+---------------------------------------------------------------------------------------------------------+
|                                      SIX SEMANTIC ICON GROUPS                                           |
+----------------------+----------------------+----------------------+------------------------------------+
| 1. NAVIGATION ICONS  | 2. ACTION ICONS      | 3. OBJECT ICONS      | 4. SECURITY ICONS                  |
| • Folder, Arrow, Node| • Edit, Delete, Run  | • Document, Brief, DAG| • Lock, Shield, TPM Fence          |
+----------------------+----------------------+----------------------+------------------------------------+
| 5. STATUS ICONS      | 6. AI ICONS          |                      |                                    |
| • Check, Warning, Fail| • Agent, Reviewer Gate|                      |                                    |
+----------------------+----------------------+----------------------+------------------------------------+
```

---

## 2. RTL Mirroring & ARIA Accessibility

Directional navigation icons automatically flip horizontal orientation for Arabic (RTL) locales. All icons include non-visual ARIA description labels (`aria-label`).

---
