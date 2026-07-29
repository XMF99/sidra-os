# THEKY P08.6 — API Developer Console & SDK Manager UI Specification

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 10-api-developer-center.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. API Keys & WASM Developer Console UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| DEVELOPER CENTER │ API Keys: 4 Active │ Rate Limit: 1,000 Req/min │ SDK Version: v2.4 (Rust WASM)        |
+---------------------------------------------------------------------------------------------------------+
| KEY NAME           │ CREATED BY        │ SCOPES                │ RATE LIMIT   │ LAST USED │ ACTION       |
| ------------------ │ ----------------- │ --------------------- │ ------------ │ --------- │ ------------ |
| `key_prod_billing` | Alex Sterling     | `vault:read`, `post`  | 1,000/min    | 2m ago    | [Revoke]     |
| `key_sast_auditor` | `syn_sec_auditor` | `audit:read`, `write` | 5,000/min    | Just now  | [Revoke]     |
+---------------------------------------------------------------------------------------------------------+
| [WASM SDK & STRUCT DEFINITIONS]                                                                         |
| • Rust IPC Bindings File: `packages/domain/src/types.rs`                                                |
| • [DOWNLOAD RUST WASM SDK CRATE (`Cmd+D`)]                                                              |
+---------------------------------------------------------------------------------------------------------+
```

---
