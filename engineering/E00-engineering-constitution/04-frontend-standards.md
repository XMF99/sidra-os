# THEKY E00 — Frontend Architecture & Tauri Desktop Standards

> **Program E00: Engineering Constitution**  
> **Document:** 04-frontend-standards.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENGINEERING CONSTITUTION (LOCKED)  

---

## 1. React & Tauri Desktop Specifications

* **Framework:** React 18+ with TypeScript in `apps/desktop/`.
* **Desktop Shell Engine:** Tauri v2 with Rust backend IPC.
* **State Management:** Local component state for transient UI; Zustand for global shell state.
* **Performance Budget:** Bundle initial paint $< 150\text{ ms}$, layout reflow $< 16.6\text{ ms}$ (60 FPS).
* **Accessibility:** WCAG AAA compliance, focus ring outlines (`#38BDF8`), ARIA live regions.

---
