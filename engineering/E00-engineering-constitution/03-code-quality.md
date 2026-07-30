# THEKY E00 — Code Quality Standards & Complexity Limits

> **Program E00: Engineering Constitution**  
> **Document:** 03-code-quality.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENGINEERING CONSTITUTION (LOCKED)  

---

## 1. Code Standards & Tooling Rules

* **Rust Backend Formatting:** Enforced via `cargo fmt` and `cargo clippy -- -D warnings`.
* **TypeScript / React Formatting:** Enforced via `prettier --check` and `eslint`.
* **Cyclomatic Complexity Cap:** Maximum allowable function complexity score is $10$. Functions exceeding 10 must be refactored.
* **Inline Documentation:** 100% of public Rust functions, structs, and TypeScript props require doc comments (`///` in Rust, `/** */` in TSX).

---
