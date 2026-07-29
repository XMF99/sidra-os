# THEKY P08.6 — RBAC & Access Control Matrix UI Specification

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 04-roles-permissions.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Role Builder & Access Matrix UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| ROLES & PERMISSIONS │ Active Roles: 8 │ Separation of Powers: 100% Enforced (**INV-02**) │ [+ Create Role]
+---------------------------------------------------------------------------------------------------------+
| ROLE TITLE             │ VAULT READ/WRITE │ MULTI-SIG AUTHORIZATION │ WASM EXECUTION SCOPE │ SEPARATION
| ---------------------- │ ---------------- │ ----------------------- │ -------------------- │ ----------
| Principal Executive    | Full Access      | Quorum Authority        | Unrestricted Sandbox | Enforced (**INV-02**)
| Security Auditor Agent | Read Only        | Audit Approval Gate     | Fenced WASM Engine   | Enforced (**INV-02**)
| Sales Author Agent     | Write Drafts     | None                    | Fenced WASM Engine   | Enforced (**INV-02**)
+---------------------------------------------------------------------------------------------------------+
| [SEPARATION OF POWERS AUDIT VERIFICATION (INV-02)]                                                     |
|  [x] Rule verified: Author agents (`syn_sales_01`) cannot review or approve own drafts.                 |
+---------------------------------------------------------------------------------------------------------+
```

---
