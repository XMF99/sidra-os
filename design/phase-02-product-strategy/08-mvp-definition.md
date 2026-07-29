# THEKY Phase 02 — MVP Scope Definition & Feature Roadmap

> **Phase 02: Product Strategy**  
> **Document:** 08-mvp-definition.md  
> **Governance Authority:** [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md)  
> **Status:** APPROVED STRATEGY  

---

## 1. MVP Governance & Prioritization Principles

This document establishes the feature boundary for **THEKY OS Version 1.0 (MVP)** and maps subsequent releases (v1.5, v2.0, v3.0). Scope decisions strictly honor frozen invariants: **Principal Attention Supremacy (INV-01)**, **Separation of Powers (INV-02)**, and **Local Data Sovereignty (INV-04)**.

---

## 2. Version 1.0 (MVP) Core Scope Matrix

```
+---------------------------------------------------------------------------------------------------------+
|                                  THEKY OS VERSION 1.0 (MVP) FEATURE MATRIX                              |
+---------------------------------------------------------------------------------------------------------+
| MUST EXIST (P0 - Non-Negotiable Core)                                                                   |
| • Local-First Desktop Shell (Rust Kernel + Native Window Manager)                                       |
| • Command Palette & High-Level Intent Launcher (`Cmd+K`)                                                |
| • Consolidated Executive Brief Queue View (`Cmd+B`)                                                      |
| • AES-256-GCM Encrypted Local Workspace Vault (`workspace::vault`)                                      |
| • Local Semantic Vector Indexer & Search (`memory::vector_index`)                                       |
| • Cryptographic SHA-256 Append-Only Hash Ledger (`automation::hash_ledger`)                             |
| • Multi-Agent Synthetic Department Orchestrator (Eng, Product, Security, QA)                            |
| • Independent QA & Security Reviewer Audit Gates (**INV-02**)                                           |
| • 7-Parameter Deterministic Model Routing Engine (Layer 1 Local + Layer 4 Cloud Fallback)              |
| • Basic Role-Based Capability Fence Sandbox (`governance::pbac`)                                        |
+---------------------------------------------------------------------------------------------------------+
| SHOULD EXIST (P1 - High-Priority Experience Boosters)                                                   |
| • Local Semantic Response Embedding Cache                                                               |
| • Daily Department Token Spend Cap Controls (`finance::budget_manager`)                                 |
| • Emergency Provider Failover Switch (Control Center metadata)                                          |
| • Markdown Sovereign Export & PRD Template Engine                                                       |
+---------------------------------------------------------------------------------------------------------+
| MUST NOT EXIST IN V1.0 (P2/P3 - Explicitly Deferred)                                                    |
| ❌ Real-time Multi-User Cloud Editing (Deferred to v1.5)                                                |
| ❌ Third-Party Agent Marketplace Catalog (Deferred to v2.0)                                             |
| ❌ Mobile FaceID Brief Sign-Off Companion (`THEKY Mobile` - Deferred to v2.0)                          |
| ❌ Spatial Workflow Canvas (`THEKY Studio` - Deferred to v3.0)                                          |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Multi-Release Scope Horizon

```
[ Version 1.0: Core Sovereign MVP ] ──> Single Founder / Small Team Local Execution
             │
             ▼
[ Version 1.5: Enterprise Fleet Expansion ] ──> SCIM 2.0, Multi-Sig Governance, SIEM Audit Streaming
             │
             ▼
[ Version 2.0: Platform Ecosystem ] ──> Third-Party Agent Marketplace & `THEKY Mobile`
             │
             ▼
[ Version 3.0: Spatial & Mesh Era ] ──> `THEKY Studio` Canvas & Local Neural Mesh Workstations
```

### 3.1 Version 1.5 (Enterprise Fleet & Governance Expansion)
* **Target Audience:** Mid-Market Enterprises & High-Growth Scale-Ups (20 to 500 Employees).
* **Key Capabilities:**
  * 9-Level Fractal Org Hierarchy Manager (`people::org_manager`).
  * SCIM 2.0 Automated Provisioning & SAML/OIDC SSO Integration (`identity::directory`).
  * Cryptographic Multi-Signature Decision Workflows (`governance::pbac`).
  * Real-Time SIEM Audit Log Streaming (Splunk / Datadog).
  * WebAuthn TPM Hardware Key Authentication.

### 3.2 Version 2.0 (Platform Ecosystem & Marketplace)
* **Target Audience:** Ecosystem Developers, Enterprise Partners, Global Teams.
* **Key Capabilities:**
  * `THEKY Developer Platform` SDK, CLI, and Capability Test Sandbox.
  * `THEKY Control Center` Third-Party Agent Static Code Auditor & Certification Pipeline.
  * 70/30 Marketplace Revenue Share Reconciliation.
  * `THEKY Mobile` Executive Brief & FaceID Approval Companion App.

### 3.3 Version 3.0 (Spatial & Neural Mesh Era)
* **Target Audience:** Enterprise Systems Architects, Creative Directors, Air-Gapped Defense Nodes.
* **Key Capabilities:**
  * `THEKY Studio` Spatial Workflow Canvas and Relationship Graph Viewer.
  * Local LAN Peer Workstation Neural Mesh Offloading (Layer 2 LAN Compute).
  * Federated Model Weight Fine-Tuning across private org clusters.

---

## 4. Prioritization Rationale & Trade-Off Analysis

1. **Why Defer the Marketplace to v2.0?** Launching a marketplace before solidifying core execution trust will lead to low-quality agent packs. v1.0 must focus on perfecting the core synthetic execution and reviewer audit engine.
2. **Why Defer Mobile to v2.0?** Founders and executives do 90% of their complex decision-making at their workstations. Desktop flow state velocity (`Cmd+K`) takes precedence over mobile companions.
3. **Why Include Security Reviewers in v1.0?** High-trust output (>95% verification rate) is THEKY's core differentiator against generic AI chat tools. Independent Reviewer gates cannot be compromised or delayed.

---
