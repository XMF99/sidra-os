# THEKY P08.4 — Personal Collaboration Workspace High-Fidelity UI Specification

> **Program P08.4: Collaboration & Productivity UI Production**  
> **Document:** 01-collaboration-home.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. High-Fidelity Personal Collaboration Workspace UI Specs

```
+-------------------------------------------------------------------------------------------------------------------+
| [TOP BAR] THEKY Workplace │ Org: Acme Corp │ Vault: Sovereign Main │ Cmd (`Cmd+K`) │ Status: Offline Ready        |
+----------------------+----------------------------------------------------+---------------------------------------+
| [NAV SIDEBAR]        | [PERSONAL COLLABORATION DASHBOARD]                 | [TEAM ACTIVITY & AGENDA DRAWER]       |
| • Workplace (Active) |                                                    |                                       |
| • Calendar           |  TODAY'S EXECUTIVE AGENDA                          | [TODAY'S SCHEDULED SESSIONS]          |
| • Task Center        |  • 09:00 - Q3 Product Architecture Review          | • 09:00 AM - Sprint Sync (Confirmed)  |
| • File Vault         |  • 11:30 - Executive Brief #102 Sign-Off           | • 02:00 PM - Security Audit Review    |
| • Notes & Scratchpad |  • 04:00 PM - Engineering Sync with `syn_dev_01`   | ------------------------------------- |
| • Meetings           | -------------------------------------------------- | [SHARED TEAM DECISIONS FEED]          |
| • Team Channels      | [CARD 1: SHARED ACTIVE WORK & DECISION PROMPTS]    | • 10:15 - ELA License Contract        |
| • Productivity       | • `doc_prd_billing_v2.md` (Co-author: Alex & Agent)|   - Status: Approved by Principal     |
| • Settings           | • `ADR-0005-model-routing.md` (In Review)          | • 09:30 - SAST Scan Passed 100%       |
+----------------------+----------------------------------------------------+---------------------------------------+
```

---

## 2. Token & Component Binding Specifications

* **Canvas Surface:** `sys.token.color.surface.base` (`#0B0F17`).
* **Agenda Item Container:** `bg: #141C2B`, `border-left: 3px solid #38BDF8`, `radius: 6px`, `padding: 12px`.
* **Decision Action Badge:** `bg: #064E3B`, `color: #34D399`, `font: 12px / 600 SemiBold`.

---
