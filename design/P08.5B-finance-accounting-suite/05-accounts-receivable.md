# THEKY P08.5B — Accounts Receivable & Invoicing UI Specification

> **Program P08.5B: Finance & Accounting Suite UI Production**  
> **Document:** 05-accounts-receivable.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Accounts Receivable & Overdue Aging UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| ACCOUNTS RECEIVABLE │ Total AR: $420,000 │ Current: $380,000 │ 1-30 Days: $40,000 │ 61+ Days: $0       |
+---------------------------------------------------------------------------------------------------------+
| INVOICE ID │ CUSTOMER          │ DUE DATE   │ AGING BUCKET │ AMOUNT ($)   │ STATUS       │ ACTION       |
| ---------- │ ----------------- │ ---------- │ ------------ │ ------------ │ ------------ │ ------------ |
| `#INV-8912`| Acme Enterprise   | 2026-08-28 | Current      | $120,000.00  | Issued       | [View Invoice|
| `#INV-8890`| Titan Dynamics    | 2026-07-15 | 1-30 Days    | $40,000.00    | Overdue      | [Send Remind]|
+---------------------------------------------------------------------------------------------------------+
| [AI COLLECTIONS ASSISTANT: Invoice #INV-8890 Titan Dynamics]                                            |
| • AI Recommendation: Trigger 1-Click Payment Reminder Email to CFO Elena Rostova.                      |
| • [1-CLICK DISPATCH PAYMENT REMINDER]                                                                   |
+---------------------------------------------------------------------------------------------------------+
```

---
