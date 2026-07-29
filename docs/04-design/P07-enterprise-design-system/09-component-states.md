# THEKY P07 — Universal Component State Architecture

> **Program P07: Enterprise Design System**  
> **Document:** 09-component-states.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENTERPRISE DESIGN SYSTEM (LOCKED)  

---

## 1. Twelve Universal Component States

Every component family in THEKY explicitly supports 12 functional states:

```
+---------------------------------------------------------------------------------------------------------+
|                                      TWELVE UNIVERSAL COMPONENT STATES                                  |
+----------------------+----------------------+----------------------+------------------------------------+
| 1. DEFAULT           | 2. HOVER             | 3. FOCUS (KEYBOARD)  | 4. PRESSED                         |
| • Resting State      | • Subtle Pointer Accent| • High Contrast Ring| • Active Click                     |
+----------------------+----------------------+----------------------+------------------------------------+
| 5. DISABLED          | 6. LOADING           | 7. EMPTY             | 8. SUCCESS                         |
| • Non-Interactive    | • Async Fetch        | • Zero Items         | • Audit Gate Passed                |
+----------------------+----------------------+----------------------+------------------------------------+
| 9. WARNING           | 10. DANGER / RISK    | 11. OFFLINE          | 12. READ-ONLY                      |
| • Spend Limit Near   | • WASM Fence Block   | • Local Kernel Active| • Sealed Vault Artifact            |
+----------------------+----------------------+----------------------+------------------------------------+
```

---
