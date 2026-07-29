# THEKY P08.2 — Home Dashboard High-Fidelity UI Specification

> **Program P08.2: Core Product UI Production**  
> **Document:** 01-home-dashboard.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. High-Fidelity UI Layout & Visual Specification

```
+-------------------------------------------------------------------------------------------------------------------+
| [TOP BAR] THEKY OS │ Org: Acme Enterprise Inc │ Vault: Sovereign Main │ Cmd (`Cmd+K`) │ Status: Offline Ready     |
+----------------------+----------------------------------------------------+---------------------------------------+
| [NAV SIDEBAR]        | [HOME FLIGHT DECK CANVAS]                          | [EXECUTIVE SUMMARY DRAWER]            |
| • Home (Active)      |                                                    |                                       |
| • Brief Queue [3]    |  WELCOME BACK, ALEX                                | [EXECUTIVE BRIEF QUEUE (INV-07)]      |
| • Mission DAGs       |  Sovereign Vault Status: 100% Encrypted & Local    | • Brief #102: Q3 Enterprise ELA       |
| • Projects           | -------------------------------------------------- |   - Amount: $120,000 ARR              |
| • Knowledge          | [CARD 1: AI DAILY COGNITIVE SUMMARY]               |   - Review Gate: PASSED 100%          |
| • AI Employees       |  "3 missions active. 1 executive brief requires     |   - [1-CLICK APPROVE (`Cmd+Enter`)]   |
| • CRM                |   your sign-off. All local WASM sandboxes clean."  | • Brief #103: Marketing Spend Cap     |
| • Settings           | -------------------------------------------------- | ------------------------------------- |
|                      | [CARD 2: RECENT WORK & PINNED WORKSPACES]          | [RECENT SYSTEM ACTIVITY STREAM]       |
|                      | • `01-product-definition.md` (Updated 10m ago)     | • 21:10 - Block #8912 Hash Committed  |
|                      | • `ADR-0004-model-routing.md` (Pinned)             | • 20:45 - SAST Scan Passed            |
+----------------------+----------------------------------------------------+---------------------------------------+
```

---

## 2. Token & Component Binding Specifications

* **Canvas Background:** `sys.token.color.surface.base` (`#0B0F17`).
* **Card Containers:** `sys.token.color.surface.elevated` (`#141C2B`), `border: 1px solid #233248`, `radius: 8px` (`sys.token.radius.md`), `padding: 16px` (`sys.token.spacing.space-4`).
* **Primary Sign-Off Button:** `bg: #38BDF8`, `color: #0F172A`, `font: 14px / 600 SemiBold`, `radius: 8px`.

---
