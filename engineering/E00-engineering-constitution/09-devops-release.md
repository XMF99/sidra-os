# THEKY E00 — DevOps Pipeline & Release Management Standards

> **Program E00: Engineering Constitution**  
> **Document:** 09-devops-release.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENGINEERING CONSTITUTION (LOCKED)  

---

## 1. Branch Strategy & Release Lifecycle

* **Branch Protocol:** Direct pushes to `main` are disabled. All changes require feature branch pull requests with 2 engineer approvals.
* **CI Automation:** GitHub Actions runs `cargo check`, `cargo test`, `vitest`, `clippy`, and `prettier` on every PR.
* **Release Artifacts:** Production builds output signed desktop installers for Windows (`.msi` / `.exe`), macOS (`.dmg`), and Linux (`.AppImage`).

---
