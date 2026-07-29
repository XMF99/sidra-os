# THEKY P03.6 — Entry, Onboarding, & Launch Experience Architecture

> **Program P03.6: Product Surface Architecture**  
> **Document:** 02-entry-experience.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCT SURFACE (LOCKED)  

---

## 1. Launch & Entry Scenarios

```
[ THEKY OS Launch Trigger ]
            │
            ├── Scenario A: First Launch ───────> Hardware TPM Key Gen + Master Vault Provisioning
            ├── Scenario B: Returning Launch ───> Sub-50ms Local State Restore (**INV-06**)
            ├── Scenario C: Offline Launch ─────> 100% Local Kernel & Local Vault Execution
            └── Scenario D: Mobile Launch ──────> Read-Only Brief Approval Mode (`Cmd+B`)
```

---

## 2. Onboarding Experience Steps

1. **Identity & Authority Provisioning:** Establish Principal identity key (`identity::directory`).
2. **Local Vault Cryptographic Binding:** Create AES-256 encrypted local workspace container on local storage (**INV-04**).
3. **Synthetic Staff Initial Activation:** Provision default Synthetic Executive Coordinator and Independent Reviewer agents (**INV-02**).

---
