# THEKY P04 — Multi-Tier Memory Consolidation & Expiration Flow

> **Program P04: Experience Flow Architecture (XFA)**  
> **Document:** 07-memory-flow.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED FLOW ARCHITECTURE (LOCKED)  

---

## 1. Memory Consolidation Pipeline

```
[ Active Working Task Context ] ──> Ephemeral Short-Term Buffer
                                               │
                                               ▼ (Task Completed)
[ Local ONNX Embedding Engine ] ──> Chunking & Vector Extraction
                                               │
                                               ▼
[ Long-Term HNSW Index ] <── Ingestion ── [ Organizational Memory Graph ]
```

---
