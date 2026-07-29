# THEKY P08.5A — Executive CRM Dashboard High-Fidelity UI Specification

> **Program P08.5A: Customer & Revenue Suite UI Production**  
> **Document:** 01-crm-dashboard.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. High-Fidelity Executive CRM Dashboard UI Specs

```
+-------------------------------------------------------------------------------------------------------------------+
| [TOP BAR] THEKY Revenue Suite │ Org: Acme Corp │ ARR Target: $5,000,000 │ Cmd (`Cmd+K`) │ Status: Active Pipeline |
+----------------------+----------------------------------------------------+---------------------------------------+
| [NAV SIDEBAR]        | [EXECUTIVE REVENUE FLIGHT DECK]                    | [AI REVENUE INSIGHTS DRAWER]          |
| • CRM Home (Active)  |                                                    |                                       |
| • Leads [14]         |  Q3 REVENUE PERFORMANCE SUMMARY                    | [AI DEAL WIN STRATEGY]                |
| • Accounts [42]      |  • Total Pipeline: $1,420,000 ARR                  | • Deal: Acme Enterprise ELA ($120k)   |
| • Contacts [180]     |  • Weighted Forecast: $890,000 ARR (78% Probability)|   - AI Win Probability: 92%            |
| • Opportunities [8]  |  • Quarterly Target Attainment: 89.2%              |   - Next Step: Executive Sign-Off     |
| • Quotations         | -------------------------------------------------- |   - [1-CLICK APPROVE (`Cmd+Enter`)]   |
| • Sales Orders       | [CARD 1: PIPELINE STAGE BREAKDOWN]                 | ------------------------------------- |
| • Subscriptions      | • Discovery (2 Deals - $140,000 ARR)               | [CUSTOMER HEALTH RISK ALERTS]         |
| • Support Tickets    | • Proposal Drafted (3 Deals - $420,000 ARR)        | • Cyberdyne Systems: 74% Health Score |
| • Revenue Analytics  | • Executive Review (3 Deals - $860,000 ARR)        |   - Action: Trigger Renewal Playbook  |
+----------------------+----------------------------------------------------+---------------------------------------+
```

---

## 2. Token & Component Binding Specifications

* **Canvas Surface:** `sys.token.color.surface.base` (`#0B0F17`).
* **KPI Card Surface:** `bg: #141C2B`, `border: 1px solid #233248`, `radius: 8px` (`sys.token.radius.md`), `padding: 16px`.
* **Probability Badge:** `bg: #064E3B`, `color: #34D399`, `font: 12px / 600 Monospace`.

---
