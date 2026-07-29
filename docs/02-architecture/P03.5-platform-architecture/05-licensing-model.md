# THEKY P03.5 — Licensing Architecture & Enforcement Engine

> **Program P03.5: Platform Architecture & Multi-Tenant SaaS Foundation**  
> **Document:** 05-licensing-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** ARCHITECTURAL SOURCE OF TRUTH (LOCKED)  

---

## 1. Licensing Typology

THEKY supports 6 distinct licensing models enforced cryptographically:

1. **Named User License:** Bound to an authenticated individual identity (`identity::directory`).
2. **Seat License:** Enterprise floating or fixed seat pools managed via SCIM 2.0.
3. **Usage-Based License:** Metered credit allocation for cloud AI model bursts and compute node usage.
4. **Offline / Air-Gapped License:** Hardware TPM bound offline license certificates with annual renewal keys.
5. **Education License:** 50% discounted academic licenses for verified university domains.
6. **Partner / Developer License:** NFR (Not For Resale) licenses for certified ecosystem integration partners.

---
