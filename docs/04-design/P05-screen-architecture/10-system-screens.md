# THEKY P05 — System Settings & Security Screens Architecture

> **Program P05: Screen Architecture**  
> **Document:** 10-system-screens.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED SCREEN ARCHITECTURE (LOCKED)  

---

## 1. Eight System Screen Views

```
1. APP SETTINGS VIEW  ── Local storage paths, theme modes, RTL/LTR language.
2. USER PROFILE VIEW  ── Principal identity keys & auth credentials.
3. NOTIFICATIONS VIEW ── Silent mode toggles & priority filter thresholds (**INV-01**).
4. ACTIVITY STREAM    ── Real-time local event ledger.
5. SECURITY SCREEN    ── AES-256 vault encryption & hardware egress gates (**INV-05**).
6. PERMISSIONS VIEW   ── Role-based (RBAC) & Policy-based (PBAC) controls.
7. API KEYS SCREEN    ── Local provider API key management (**INV-09**).
8. DEVICE MANAGER VIEW── Hardware TPM node bindings & active desktop sessions.
```

---
