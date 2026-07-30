# THEKY E00 — Security Engineering & Cryptographic Vault Standards

> **Program E00: Engineering Constitution**  
> **Document:** 07-security-engineering.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED ENGINEERING CONSTITUTION (LOCKED)  

---

## 1. Security Architecture & Encryption Rules

* **Vault Encryption:** Local storage relies on AES-256-GCM encryption for sensitive credentials and keys.
* **Passkey WebAuthn:** Authentication enforces FIDO2 / WebAuthn hardware passkeys or TPM hardware certificate bindings.
* **Separation of Powers (**INV-02**):** Enforcement checked in Rust backend before any approval or commit operation.
* **Cryptographic Hash Ledger (**INV-03**):** Audit trail event stream uses SHA-256 hash chaining.

---
