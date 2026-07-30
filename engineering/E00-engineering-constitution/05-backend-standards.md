# THEKY E00 — Rust Backend Architecture & IPC Standards

> **Program E00: Engineering Constitution**  
> **Document:** 05-backend-standards.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENGINEERING CONSTITUTION (LOCKED)  

---

## 1. Rust Domain Kernel & IPC Architecture

* **Core Package:** `packages/domain/src/types.rs` defines authoritative Rust domain structs.
* **IPC Protocol:** Strongly-typed serde JSON IPC between Tauri frontend and Rust backend.
* **Sovereign Persistence (**INV-04**):** File IO relies on async `tokio::fs` reading/writing plain text `.md` and `.jsonl`.
* **Zero Panic Policy:** Production code must handle all `Result<T, E>` explicitly via `thiserror`. Unhandled `unwrap()` calls in production paths are rejected by clippy.

---
