# THEKY P04 — System Onboarding & Provisioning Flow Architecture

> **Program P04: Experience Flow Architecture (XFA)**  
> **Document:** 02-onboarding-flow.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED FLOW ARCHITECTURE (LOCKED)  

---

## 1. Seven-Stage Onboarding Flow Sequence

```
[ Step 1: Identity Key Auth (`identity::directory`) ]
                        │
                        ▼
[ Step 2: Org & Tenant Boundary Creation (`tenant::scim`) ]
                        │
                        ▼
[ Step 3: Local Workspace Vault Binding (AES-256 TPM Key) ]
                        │
                        ▼
[ Step 4: Local Vector Index & Memory Graph Init ]
                        │
                        ▼
[ Step 5: Synthetic Agent Charter Provisioning ]
                        │
                        ▼
[ Step 6: Sovereign Markdown Vault Initialization ]
                        │
                        ▼
[ Step 7: Enterprise Connector OAuth & Delta Sync Binding ]
```

---

## 2. Onboarding Guarantees

All onboarding steps execute locally by default. Hardware encryption keys never leave the host machine's Secure Enclave (**INV-04**, **INV-05**).

---
