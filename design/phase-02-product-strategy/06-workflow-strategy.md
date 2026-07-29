# THEKY Phase 02 — End-to-End Workflow Strategy & Lifecycles

> **Phase 02: Product Strategy**  
> **Document:** 06-workflow-strategy.md  
> **Governance Authority:** [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md)  
> **Status:** APPROVED STRATEGY  

---

## 1. Workflow Governance & Principles

This document defines the 7 primary lifecycles governing how work, context, decisions, and approvals flow through the **THEKY** ecosystem. All lifecycles enforce frozen invariants: **Delegation over Prompting (INV-01)**, **Separation of Powers (INV-02)**, and **Immutable Hash Ledger Logging (INV-03)**.

---

## 2. Core Operational Lifecycles

### 2.1 Mission Lifecycle

The Mission Lifecycle represents the primary end-to-end journey from strategic human intent to audited corporate execution.

```
[ Step 1: Intent Declaration (`Cmd+K`) ]
                   │
                   ▼
[ Step 2: Context Retrieval & Memory Graph Query ]
                   │
                   ▼
[ Step 3: Mission Graph & Department Task Decomposition ]
                   │
                   ▼
[ Step 4: Capability Fence & Token Budget Verification ]
                   │
                   ▼
[ Step 5: Parallel Synthetic Department Execution ]
                   │
                   ▼
[ Step 6: Independent Reviewer Audit Gate (QA + Security) ]
                   │
                   ▼
[ Step 7: Consolidated Executive Brief Compilation ]
                   │
                   ▼
[ Step 8: Human Principal Review & Sign-Off ]
                   │
                   ▼
[ Step 9: Atomic Ledger Commit & File System Deployment ]
```

#### Detailed Phase Mechanics:
* **Step 1 (Declaration):** Human Principal hits `Cmd+K` and types a high-level intent statement (e.g., *"Add automated billing usage alerts for enterprise plans"*).
* **Step 2 (Context Retrieval):** `memory::graph` retrieves relevant ADRs, codebase files, and past financial constraints.
* **Step 3 (Decomposition):** `mission::intent_parser` breaks intent into a DAG (Directed Acyclic Graph) of departmental tasks (Product -> Eng -> Security -> QA).
* **Step 4 (Fence Check):** `governance::pbac` verifies data classification egress rules (**INV-05**) and token spend caps.
* **Step 5 (Execution):** Synthetic Author Agents draft code diffs and PRDs in isolated workspace sandboxes.
* **Step 6 (Review Gate):** Independent QA and Security Reviewer Agents test code and scan for vulnerabilities (**INV-02**).
* **Step 7 (Brief Compilation):** `mission::brief_compiler` consolidates all outputs into ONE decision-ready Executive Brief (**INV-07**).
* **Step 8 (Sign-Off):** Human Principal reviews brief summary and issues sign-off (`Cmd+Enter`).
* **Step 9 (Commit):** Changes deploy atomically to local disk files, and a SHA-256 block appends to `hash_ledger.jsonl`.

---

### 2.2 Decision Lifecycle

Governs single-signature, dual-signature, and board resolution decision approvals.

```
[ Decision Request Generated ]
              │
              ▼
[ Decision Domain & Risk Classification ]
              │
              ├───────────────────────────────┬──────────────────────────────┐
              ▼                               ▼                              ▼
    [ Single-Sig (Operational) ]    [ Dual-Sig (Financial/Tech) ]   [ Board Resolution (>66.7%) ]
              │                               │                              │
              ▼                               ▼                              ▼
    [ Principal Sign-Off ]          [ CFO + CTO Dual Sign ]        [ Multi-Sig Voting Panel ]
              │                               │                              │
              └───────────────────────────────┴──────────────────────────────┘
                                              │
                                              ▼
                             [ Cryptographic Signature Verification ]
                                              │
                                              ▼
                             [ Commit to Hash-Chain Ledger ]
```

---

### 2.3 Knowledge Lifecycle

Governs document creation, vector indexing, and memory graph evolution.

```
[ New Workspace Artifact Created ] ──> [ Markdown File Written to Vault (AES-256) ]
                                                        │
                                                        ▼
[ Local Vector Indexing (ONNX/NPU) ] <── [ Background Text Chunking (AU-01) ]
                  │
                  ▼
[ Entity Extraction & Graph Linking ] ──> [ Memory Graph Updated (`memory::graph`) ]
```

---

### 2.4 AI Delegation Lifecycle

Governs how synthetic agents receive, execute, and return tasks safely within capability fences.

```
[ Task Assigned to Agent ]
            │
            ▼
[ Charter & Fence Verification (`governance::pbac`) ] ──> [ DENY: Raise Fence Alert ]
            │ (ALLOW)
            ▼
[ Model Routing Engine (`ai::router`) ] ──> [ Layer 1 Local / Layer 4 Cloud Burst ]
            │
            ▼
[ Task Execution in Sandbox Vault ]
            │
            ▼
[ Mandatory Independent Review Gate (`ai::reviewer`) ] ──> [ REJECT: Rework in Sandbox ]
            │ (PASS)
            ▼
[ Return Verified Output to Mission Pipeline ]
```

---

### 2.5 Review & Approval Lifecycle

Enforces **INV-02 (Separation of Powers)**: Author agents can NEVER approve their own work.

```
[ Author Agent Draft Output ] ──> [ Isolated Sandbox Storage ]
                                             │
                                             ▼
                             [ Independent QA Reviewer Agent ]
                             (Runs Unit Tests & Fuzzing)
                                             │
                                             ▼
                             [ Independent Security Reviewer ]
                             (Scans SAST & Capability Leaks)
                                             │
                  ┌──────────────────────────┴──────────────────────────┐
                  ▼ (Fails Test / Risk Detected)                       ▼ (100% Pass Rate)
        [ Flag Uncertainty in Brief ]                         [ Compile High-Trust Brief ]
                  │                                                    │
                  └──────────────────────────┬─────────────────────────┘
                                             ▼
                             [ Human Principal Approval Queue ]
                                             │
                                             ▼
                             [ One-Click Executive Sign-Off ]
```

---

## 3. Exception Handling & Escalation Strategy

```
+-----------------------------------------------------------------------------------+
|                        EXCEPTION & ESCALATION PROTOCOLS                           |
+--------------------------+-----------------------+--------------------------------+
| TRIGGER CONDITION        | AUTOMATED SYSTEM ACTION| ESCALATION TARGET              |
+--------------------------+-----------------------+--------------------------------+
| High Ambiguity Intent    | Halt Execution        | Renders Clarification Brief    |
| Budget Cap Reached (>100%)| Fallback to Local L1  | Financial Elevation Prompt     |
| Security Fence Violation | Block Network Egress  | Security Admin Alert          |
| Reviewer Audit Failure   | Max 2 Rework Loops    | Flag Rework Failure in Brief   |
| Co-Founder Deadlock      | 24-Hr Cooling Window  | Tie-Breaker Vote Escalation    |
+--------------------------+-----------------------+--------------------------------+
```

---

## 4. Human Checkpoints & Override Rules

1. **Human Sign-Off Checkpoint:** Synthetic agents work asynchronously, but **no work product deploys to production without human sign-off**.
2. **Human Override Rule:** A human Principal with valid authority can explicitly override an AI uncertainty warning, logging the rationale to the hash ledger.
3. **Emergency Kill-Switch Checkpoint:** Hitting `Cmd+Shift+K` instantly cancels all active background agent executions and revokes API credentials.

---
