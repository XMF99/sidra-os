# THEKY P08.5B — Figma Production Readiness Specs for Finance Suite UI

> **Program P08.5B: Finance & Accounting Suite UI Production**  
> **Document:** 14-figma-production-ready.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Figma Production File Specifications

All Finance & Accounting Suite UI screens are published in production file `[PROD-02] 02-Desktop Shell UI`:

* **Auto Layout Alignment:** 100% of Finance Dashboards, General Ledger Grids, Tax Center Summaries, and Income Statements use nested Auto Layout with fixed, hugging, or fill container constraints. Zero manual absolute positioning.
* **Variable Collections Bound:** Colors and spacing bind to `sys-semantic` variable collection modes (`Dark Monastic`, `Executive Light`, `RTL Arabic`).
* **Dev Mode Annotation:** Frames tagged with explicit token names and Rust IPC payload bindings matching `packages/domain/src/types.rs`.

---
