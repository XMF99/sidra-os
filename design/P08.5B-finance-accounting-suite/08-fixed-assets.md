# THEKY P08.5B — Fixed Assets Register & Depreciation UI Specification

> **Program P08.5B: Finance & Accounting Suite UI Production**  
> **Document:** 08-fixed-assets.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Fixed Assets Register & Depreciation Schedule UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| FIXED ASSETS │ Total Net Book Value: $185,000 │ YTD Depreciation: $24,000 │ Active Assets: 18          |
+---------------------------------------------------------------------------------------------------------+
| ASSET ID   │ DESCRIPTION               │ ACQUIRED   │ COST ($)    │ DEPRECIATION METHOD │ NET BOOK VALUE|
| ---------- │ ------------------------- │ ---------- │ ----------- │ ------------------- │ --------------|
| `FA-1001`  | On-Prem TPM Hardware Server| 2025-01-15 | $120,000.00 | Straight Line 5 Yr  | $84,000.00    |
| `FA-1002`  | Executive Workstation Rig | 2025-06-10 | $15,000.00  | Straight Line 3 Yr  | $8,500.00     |
+---------------------------------------------------------------------------------------------------------+
| [POST MONTHLY DEPRECIATION JOURNAL ENTRY]                                                               |
| • Monthly Depreciation Amount: $2,450.00 ──> [POST TO GENERAL LEDGER (`Cmd+Enter`)]                     |
+---------------------------------------------------------------------------------------------------------+
```

---
