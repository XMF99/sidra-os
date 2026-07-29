# THEKY P03 — Conceptual Workspace Architecture & Vault Topology

> **Program P03: Cognitive Experience Architecture (CXA)**  
> **Document:** 06-workspace-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED COGNITIVE MODEL  

---

## 1. Workspace Conceptual Architecture

A Workspace in THEKY is a **Conceptual Cryptographic Vault Boundary**. It is not a visual tab or UI dashboard page; it is a isolated execution and storage space on local hardware.

```
+-----------------------------------------------------------------------------------+
|                        7 CONCEPTUAL WORKSPACE TYPES                               |
|                                                                                   |
|  1. Personal Workspace    ── Private Principal notes, personal keys, private memory.|
|  2. Company Workspace     ── Root org hierarchy, corporate ADRs, company memory.  |
|  3. Project Workspace     ── Bounded sprint initiative, PRDs, feature branches.   |
|  4. Mission Workspace     ── Atomic intent execution sandbox for synthetic agents.|
|  5. Temporary Sandbox     ── Isolated scratchpad for unverified agent runs.       |
|  6. Shared Team Workspace ── Encrypted multi-principal collaborative vault.       |
|  7. Executive Control     ── C-level decision queue & capital spend dials.        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Vault Security & Access Boundaries

* **AES-256-GCM Encryption:** Every workspace vault is encrypted with a unique hardware-locked key stored in the machine's Secure Enclave / TPM.
* **Isolation Guarantee:** Synthetic agents executing a task inside a *Mission Workspace* are sandboxed—they cannot write to or read from parent *Company Vaults* without explicit capability tokens (**INV-05**, **INV-10**).

---
