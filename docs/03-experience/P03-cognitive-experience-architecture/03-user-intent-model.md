# THEKY P03 — Universal User Intent Model & Behavioral Grammar

> **Program P03: Cognitive Experience Architecture (CXA)**  
> **Document:** 03-user-intent-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED COGNITIVE MODEL  

---

## 1. Universal Intent Taxonomy

In THEKY OS, every user interaction is categorized into one of 18 universal intent primitives. Intent is declared via natural language or shortcut triggers in the universal command palette (`Cmd+K`).

```
+---------------------------------------------------------------------------------------------------------+
|                                    18 UNIVERSAL INTENT PRIMITIVES                                       |
+----------------------+----------------------+----------------------+------------------------------------+
| 1. ASK               | 2. CREATE            | 3. ANALYZE           | 4. COMPARE                         |
| • Context Query      | • Artifact Drafting  | • Pattern & Metrics  | • Trade-Off Evaluation             |
+----------------------+----------------------+----------------------+------------------------------------+
| 5. ORGANIZE          | 6. REVIEW            | 7. SEARCH            | 8. AUTOMATE                        |
| • Structural Mapping | • Quality & Safety   | • Memory Graph Retrieval| • Recurring Workflow Cron         |
+----------------------+----------------------+----------------------+------------------------------------+
| 9. BUILD             | 10. DELEGATE         | 11. MONITOR          | 12. SCHEDULE                       |
| • Code & Release Exec| • Mission Assignment | • Telemetry Tracking | • Milestone Timeline Setup         |
+----------------------+----------------------+----------------------+------------------------------------+
| 13. COMMUNICATE      | 14. APPROVE          | 15. REJECT           | 16. EXPLAIN                        |
| • Executive Brief    | • Ledger Sign-Off    | • Rework Dispatch    | • Architectural Rationale          |
+----------------------+----------------------+----------------------+------------------------------------+
| 17. TRANSFORM        | 18. PREDICT          |                      |                                    |
| • Format Conversion  | • Capacity & Burn Est|                      |                                    |
+----------------------+----------------------+----------------------+------------------------------------+
```

---

## 2. Intent Behavioral Specifications

### 1. Intent: ASK
* **Cognitive Input:** Natural query seeking factual or historical context (e.g., *"What were our Q2 token costs?"*).
* **Behavior:** Queries local memory graph (`memory::graph`); computes exact answer with citations.
* **Output:** Concise contextual answer + source document links. Zero task execution.

### 2. Intent: CREATE
* **Cognitive Input:** Request to generate a new workspace artifact (e.g., *"Create PRD for usage alerts"*).
* **Behavior:** Dispatches task to Synthetic Product Author Agent; applies standard markdown templates.
* **Output:** Draft `.md` document in sandbox vault awaiting reviewer gate.

### 3. Intent: DELEGATE
* **Cognitive Input:** High-level strategic assignment to synthetic departments (e.g., *"Launch payments v2"*).
* **Behavior:** Decomposes mission into multi-department execution DAG; orchestrates author and reviewer agents.
* **Output:** One Consolidated Executive Brief presented to Principal for approval (**INV-07**).

### 4. Intent: APPROVE
* **Cognitive Input:** Principal sign-off action on a presented brief (`Cmd+Enter`).
* **Behavior:** Verifies digital signature; executes atomic disk write; appends SHA-256 block to hash ledger (**INV-03**).
* **Output:** Executed mission state; updated event ledger.

### 5. Intent: REJECT
* **Cognitive Input:** Principal rejection of a brief with optional feedback.
* **Behavior:** Flags brief as rejected; dispatches rework feedback loop to author agents in sandbox.
* **Output:** Updated task queue item; sandbox rework initiation.

---
