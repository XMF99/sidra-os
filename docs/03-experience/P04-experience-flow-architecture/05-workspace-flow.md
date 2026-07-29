# THEKY P04 — Workspace Context Switching & Vault Traversal Flow

> **Program P04: Experience Flow Architecture (XFA)**  
> **Document:** 05-workspace-flow.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED FLOW ARCHITECTURE (LOCKED)  

---

## 1. Context Transition Mechanics

When a user switches between Workspace Vaults (e.g., from *Personal Vault* to *Company Vault*):

1. **Working Memory Persistence (<10ms):** Active editor state, cursor positions, and uncommitted draft inputs serialize locally.
2. **Key Re-Binding:** Local TPM releases current AES-256 key and binds destination vault key.
3. **Graph Partition Reload:** Local HNSW vector index switches query scope to target Workspace UUID (**INV-05**).

---
