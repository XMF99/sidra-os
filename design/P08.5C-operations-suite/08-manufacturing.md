# THEKY P08.5C — Manufacturing, BOM, & Work Centers UI Specification

> **Program P08.5C: Operations Suite UI Production**  
> **Document:** 08-manufacturing.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Work Order & Bill of Materials (BOM) UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| MANUFACTURING │ Active Work Orders: 4 │ Work Center: Assembly Line 1 │ Capacity: 84% Utilization         |
+------------------------------------+--------------------------------------------------------------------+
| [WORK ORDER DIRECTORY]             | [BILL OF MATERIALS (BOM) TREE EXPLORER]                            |
| • `WO-401`: TPM Server Assembly    | Assembly: THEKY TPM Hardware Server Rig                            |
|   - Qty: 10 Units                  | ├── 🛠️ `SKU-1002` Server Chassis 2U Rack (Qty: 1)                  |
|   - Progress: 80% (In Assembly)    | ├── 🛡️ `SKU-1005` TPM 2.0 Security Chip (Qty: 1)                   |
| • `WO-402`: Micro-Chassis Batch    | └── ⚡ `SKU-1008` Power Supply Unit 750W (Qty: 2)                   |
|   - Qty: 25 Units                  | ------------------------------------------------------------------ |
|   - Progress: 30% (Pre-BOM Pick)   | Quality Gate Status: Inspection Passed (Zero Defect)               |
+------------------------------------+--------------------------------------------------------------------+
```

---
