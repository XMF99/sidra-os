# THEKY P07.5 — Library Release & SemVer Management

> **Program P07.5: Figma Production Architecture**  
> **Document:** 11-library-release-management.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION ARCHITECTURE (LOCKED)  

---

## 1. Library Release SemVer Policy

Library updates are published strictly using **Semantic Versioning 2.0.0**:

* **MAJOR (`vX.0.0`):** Breaking component structure changes (e.g., removing a variant property). Requires an approved ADR and 6-month deprecation window.
* **MINOR (`vX.Y.0`):** New component additions or new variable modes. Fully backwards compatible.
* **PATCH (`vX.Y.Z`):** Non-breaking bug fixes or token value alignment.

---
