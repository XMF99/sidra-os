# THEKY P03 — Universal Search Model & Semantic Retrieval

> **Program P03: Cognitive Experience Architecture (CXA)**  
> **Document:** 08-search-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED COGNITIVE MODEL  

---

## 1. Unified Search Architecture

Search in THEKY is a single unified cognitive engine that blends **Fuzzy Command Indexing** with **Local HNSW Vector Semantic Retrieval**.

```
[ User Search Input (`Cmd+K`) ]
               │
               ├───────────────────────────────┐
               ▼                               ▼
 [ Sub-10ms Fuzzy Index Search ]     [ Sub-40ms Local Vector Embedding Search ]
 (Matches Commands, Files, ADRs)     (Matches Concepts, Decisions, Memory Graph)
               │                               │
               └───────────────┬───────────────┘
                               ▼
            [ Unified Rank-Ordered Result Stream ]
```

---

## 2. Eight Search Modes

1. **Semantic Search:** Concepts, natural language questions, contextual similarities.
2. **Keyword Search:** Exact file paths, ADR numbers, code symbols (`JetBrains Mono`).
3. **Memory Search:** Past decisions, meeting minutes, historical brief rationales.
4. **People Search:** Org hierarchy roles, human team members, synthetic employee charters.
5. **Project Search:** Active sprint milestones, PRDs, feature release graphs.
6. **Mission Search:** Current and historical intent execution DAGs.
7. **Knowledge Search:** Sovereign `.md` documents, guidelines, templates.
8. **Action Search:** Instant system triggers (e.g., *"Deploy agent"*, *"Export ledger"*).

---
