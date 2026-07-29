# THEKY P03 — Context Architecture & Inheritance Engine

> **Program P03: Cognitive Experience Architecture (CXA)**  
> **Document:** 05-context-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED COGNITIVE MODEL  

---

## 1. Context Layers & Hierarchy

Context in THEKY is structured as a dynamic 7-layer sub-graph that is automatically assembled and injected into synthetic agent tasks.

```
Layer 7: Live Context ────────── Real-time local hardware, active task state
  └── Layer 6: Mission Context ──── Intent ID, specific task DAG goals
        └── Layer 5: Project Context ── Active PRD, branch diffs, sprint constraints
              └── Layer 4: Department Context ─ Department charter, code style, ADRs
                    └── Layer 3: Company Context ── Org hierarchy, budget caps, security policy
                          └── Layer 2: Personal Context ─ Principal role, preferences, auth keys
                                └── Layer 1: Memory Context ── Local HNSW vector embeddings
```

---

## 2. Context Isolation & Inheritance Mechanics

1. **Downward Context Inheritance:** Child tasks automatically inherit ADR constraints and security rules from parent projects and company nodes.
2. **Horizontal Context Isolation:** Sandbox execution tasks running in Department A cannot read memory or file contexts from Department B unless explicit cross-workspace permission is granted (**INV-05**).
3. **Context Transition Protocol:** When a user closes a brief or toggles between projects, active working state is saved to the local database in <10ms. Re-opening the project restores 100% of context without mental recovery drag.

---
