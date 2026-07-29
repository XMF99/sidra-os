# THEKY Phase 02 — Master Capability Map & Taxonomy

> **Phase 02: Product Strategy**  
> **Document:** 02-capability-map.md  
> **Governance Authority:** [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md)  
> **Status:** APPROVED STRATEGY  

---

## 1. Capability Governance & Mapping Framework

This document categorizes every atomic capability within the **THEKY** ecosystem into a 3-level hierarchy. All capabilities map directly to authorized products defined in [01-product-definition.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/phase-02-product-strategy/01-product-definition.md) and adhere strictly to frozen invariants (**INV-01** through **INV-10**).

```
Level 1: Capability Category (e.g., Executive Governance)
  └── Level 2: Feature Domain (e.g., Multi-Signature Decision Engine)
        └── Level 3: Atomic Capability (e.g., Biometric Multi-Sig Sign-Off)
```

---

## 2. Core Capability Taxonomy

```
+---------------------------------------------------------------------------------------------------------+
|                                    MASTER CAPABILITY TAXONOMY MAP                                       |
+----------------------+----------------------+----------------------+----------------------+------------------+
| 1. EXECUTIVE DELEGATION| 2. SOVEREIGN MEMORY  | 3. AI ORCHESTRATION  | 4. ENTERPRISE FLEET  | 5. AIOPS & ROUTING|
|    & BRIEFS          |    & AUDIT LEDGER    |    & VERIFICATION    |    GOVERNANCE        |    ENGINE        |
|                      |                      |                      |                      |                  |
| • Intent Parsing     | • Local Disk Encrypt | • Layer 1-4 Model    | • 9-Level Org Tree   | • 7-Vector Model |
| • Mission Decomp     | • Vector Embedding   |   Routing Engine     | • SCIM 2.0 Auto Provision Router        |
| • Brief Consolidator | • Hash-Chain Ledger  | • Independent QA/Sec | • WebAuthn TPM Keys  | • Provider Switch|
| • Decision Prompter  | • Sovereign Markdown |   Reviewer Gates     | • Multi-Sig Approvals| • Prompt Compression|
+----------------------+----------------------+----------------------+----------------------+------------------+
| 6. BILLING & REVENUE | 7. MARKETPLACE & PACK| 8. SPATIAL & MOBILE  | 9. DEVELOPER SDK &   | 10. RECOVERY &   |
|    OPERATIONS        |    CERTIFICATION     |    COMPANION         |     EXTENSIBILITY    |     CONTINUITY   |
|                      |                      |                      |                      |                  |
| • Recurring Sub Engine| • Static Code Audits| • Spatial Workflow   | • Agent Charter CLI  | • 100% Offline   |
| • ASC 606 Rev Recog  | • 70/30 Rev Share    |   Canvas Map         | • Local Capability   |   Fallback Engine|
| • Token Overage Audit| • Security Sandbox   | • Mobile FaceID Brief|   Fence Sandbox      | • CRDT Local     |
| • Enterprise ELA Manager|  Certification    |   Approval Companion | • Package Publisher  |   State Merger   |
+----------------------+----------------------+----------------------+----------------------+------------------+
```

---

## 3. Detailed Capability Hierarchy & Mapping

### Category 1: Executive Delegation & Brief Management
* **Target Product:** `THEKY OS` / `THEKY Mobile`
* **Strategic Status:** Core MVP (Version 1.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-ED-01** | High-Level Intent Parser | Strategic MVP | `THEKY OS` | **INV-01** (Attention Supremacy) |
| **CAP-ED-02** | Mission Dependency Graph Generator | Strategic MVP | `THEKY OS` | **INV-07** (Single Brief) |
| **CAP-ED-03** | Consolidated Executive Brief Compiler | Strategic MVP | `THEKY OS` | **INV-07** (Single Brief) |
| **CAP-ED-04** | Single Decision Prompt Render | Strategic MVP | `THEKY OS` | **INV-01** (Attention Supremacy) |
| **CAP-ED-05** | Biometric Multi-Sig Mobile Sign-Off | Future (v2.0) | `THEKY Mobile` | **INV-08** (Multi-Sig Governance)|

---

### Category 2: Sovereign Memory & Cryptographic Audit
* **Target Product:** `THEKY OS`
* **Strategic Status:** Core MVP (Version 1.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-SM-01** | AES-256-GCM Local Workspace Vault | Strategic MVP | `THEKY OS` | **INV-04** (Sovereign Storage) |
| **CAP-SM-02** | Local Semantic Vector Indexer | Strategic MVP | `THEKY OS` | **INV-04** (Sovereign Storage) |
| **CAP-SM-03** | SHA-256 Append-Only Hash Ledger | Strategic MVP | `THEKY OS` | **INV-03** (Immutable Ledger) |
| **CAP-SM-04** | Sovereign Open Markdown Exporter | Strategic MVP | `THEKY OS` | **INV-04** (Sovereign Storage) |
| **CAP-SM-05** | Cryptographic Legal Hold Lock | Enterprise (v1.5) | `THEKY OS` | **INV-03** (Immutable Ledger) |

---

### Category 3: AI Orchestration & Independent Review
* **Target Product:** `THEKY AI` / `THEKY OS`
* **Strategic Status:** Core MVP (Version 1.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-AI-01** | Multi-Agent Synthetic Department Exec | Strategic MVP | `THEKY AI` | **INV-02** (Separation of Powers)|
| **CAP-AI-02** | Independent QA Reviewer Audit Gate | Strategic MVP | `THEKY AI` | **INV-02** (Separation of Powers)|
| **CAP-AI-03** | Independent Security Reviewer Gate | Strategic MVP | `THEKY AI` | **INV-02** (Separation of Powers)|
| **CAP-AI-04** | Honest Uncertainty Quantifier | Strategic MVP | `THEKY AI` | **INV-02** (Separation of Powers)|
| **CAP-AI-05** | Heterogeneous Model Reviewer Check | Enterprise (v1.5) | `THEKY AI` | **INV-02** (Separation of Powers)|

---

### Category 4: Enterprise Fleet Governance & Security
* **Target Product:** `THEKY Control Center` / `THEKY OS`
* **Strategic Status:** Business / Enterprise (Version 1.5 - 2.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-EG-01** | 9-Level Fractal Org Hierarchy Manager | Business (v1.5) | `THEKY OS` | **INV-08** (Multi-Sig Governance)|
| **CAP-EG-02** | SCIM 2.0 Automated Provisioning | Enterprise (v1.5) | `THEKY Control Center` | **INV-10** (Owner Isolation) |
| **CAP-EG-03** | WebAuthn TPM Hardware Key Auth | Enterprise (v1.5) | `THEKY OS` | **INV-05** (Egress Gates) |
| **CAP-EG-04** | Real-Time SIEM Audit Log Streamer | Enterprise (v1.5) | `THEKY Control Center` | **INV-03** (Immutable Ledger) |
| **CAP-EG-05** | Zero-Trust Capability Fence Engine | Strategic MVP | `THEKY OS` | **INV-05** (Egress Gates) |

---

### Category 5: AIOps & Intelligent Model Routing
* **Target Product:** `THEKY AI` / `THEKY Control Center`
* **Strategic Status:** Core MVP (Version 1.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-AR-01** | 7-Parameter Deterministic Router | Strategic MVP | `THEKY AI` | **INV-09** (Vendor Agnostic) |
| **CAP-AR-02** | One-Click Emergency Provider Switch | Enterprise (v1.5) | `THEKY Control Center` | **INV-09** (Vendor Agnostic) |
| **CAP-AR-03** | Semantic Prompt Compressor | Strategic MVP | `THEKY AI` | **INV-06** (Sub-50ms Speed) |
| **CAP-AR-04** | Local Semantic Response Cache | Strategic MVP | `THEKY AI` | **INV-06** (Sub-50ms Speed) |
| **CAP-AR-05** | Hardware Data Egress Gatekeeper | Strategic MVP | `THEKY OS` | **INV-05** (Egress Gates) |

---

### Category 6: Marketplace & Platform Extensibility
* **Target Product:** `THEKY Developer Platform` / `THEKY Control Center`
* **Strategic Status:** Future Expansion (Version 2.0 - 3.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-MP-01** | Third-Party Agent Static Code Auditor| Future (v2.0) | `THEKY Control Center` | **INV-10** (Owner Isolation) |
| **CAP-MP-02** | 70/30 Revenue Share Reconciliation | Future (v2.0) | `THEKY Control Center` | **INV-10** (Owner Isolation) |
| **CAP-MP-03** | Agent Charter & Fence CLI Test Tool | Future (v2.0) | `THEKY Dev Platform` | **INV-05** (Egress Gates) |
| **CAP-MP-04** | Certified Department Pack Catalog | Future (v2.0) | `THEKY OS` | **INV-04** (Sovereign Storage) |

---

### Category 7: Spatial & Mobile Experience
* **Target Product:** `THEKY Studio` / `THEKY Mobile`
* **Strategic Status:** Reserved Future (Version 3.0)

| Capability ID | Atomic Capability Name | Strategic Level | Product Mapping | Invariant Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **CAP-SM-01** | Spatial Workflow Graph Canvas | Future (v3.0) | `THEKY Studio` | **INV-06** (Sub-50ms Speed) |
| **CAP-SM-02** | Mobile Brief Push & FaceID Sign-off | Future (v2.0) | `THEKY Mobile` | **INV-08** (Multi-Sig Governance)|
| **CAP-SM-03** | Zero-Knowledge Peer Mobile Sync | Future (v2.0) | `THEKY Cloud` | **INV-04** (Sovereign Storage) |

---
