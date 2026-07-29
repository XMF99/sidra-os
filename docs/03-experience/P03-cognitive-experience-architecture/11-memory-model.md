# THEKY P03 — Multi-Tier Cognitive Memory Architecture

> **Program P03: Cognitive Experience Architecture (CXA)**  
> **Document:** 11-memory-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED COGNITIVE MODEL  

---

## 1. Multi-Tier Cognitive Memory Spectrum

THEKY structures memory across 9 cognitive memory classes operating on local hardware:

```
+---------------------------------------------------------------------------------------------------------+
|                                    NINE COGNITIVE MEMORY CLASSES                                        |
+----------------------+----------------------+----------------------+------------------------------------+
| 1. SHORT-TERM MEMORY | 2. LONG-TERM MEMORY  | 3. SEMANTIC MEMORY   | 4. PROCEDURAL MEMORY               |
| • Active Task Buffer | • Local `.md` Vaults | • Vector Embeddings  | • Workflow Steps & Cron Routines   |
+----------------------+----------------------+----------------------+------------------------------------+
| 5. ORGANIZATIONAL    | 6. PROJECT MEMORY    | 7. USER MEMORY       | 8. AI MEMORY                       |
| • Org Tree & ADRs    | • PRDs & Branch Diffs| • Principal Rules    | • Agent Task Audit Logs            |
+----------------------+----------------------+----------------------+------------------------------------+
| 9. SHARED VS PRIVATE |                      |                      |                                    |
| • Encrypted Fences   |                      |                      |                                    |
+----------------------+----------------------+----------------------+------------------------------------+
```

---

## 2. Memory Persistence & Privacy

All memory layers are persisted locally in standard Markdown files (`knowledge::docstore`) or local HNSW vector indices (`memory::vector_index`). Zero remote cloud memory uploading without explicit policy clearance (**INV-04**, **INV-05**).

---
