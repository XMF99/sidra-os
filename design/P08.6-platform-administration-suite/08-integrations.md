# THEKY P08.6 — Integration Hub & Connector Directory UI Specification

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 08-integrations.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Enterprise Integration Directory UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| INTEGRATION HUB │ Active Connectors: 10 │ Egress Gates: Hardware WASM Sandboxed (**INV-05**) │ [+ Add] |
+---------------------------------------------------------------------------------------------------------+
| CONNECTOR          │ TYPE              │ AUTHENTICATION       │ EGRESS GATE STATUS   │ ACTION           |
| ------------------ │ ----------------- │ -------------------- │ -------------------- │ ---------------- |
| Google Workspace   | Cloud Productivity| OAuth 2.0 / OIDC     | Sandbox Gate Passed  | [Configure]      |
| Microsoft 365      | Cloud Productivity| Azure AD / Entra ID  | Sandbox Gate Passed  | [Configure]      |
| GitHub Enterprise  | Code Repository   | Personal Access Token| Sandbox Gate Passed  | [Configure]      |
| Slack Enterprise   | Messaging         | Bot OAuth Token      | Sandbox Gate Passed  | [Configure]      |
| OpenRouter Proxy   | AI Model Gateway  | API Bearer Key       | Proxy Adapter Bound  | [Manage Models]  |
+---------------------------------------------------------------------------------------------------------+
```

---
