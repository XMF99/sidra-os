# THEKY P08.6 — Identity Provider, SSO, & Passkeys UI Specification

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 05-identity-access.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. Identity Provider & Hardware Passkeys UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| IDENTITY & ACCESS │ SSO: Enabled (SAML 2.0 / Okta) │ Hardware Passkeys: Enforced │ Offline: Vault Ready|
+---------------------------------------------------------------------------------------------------------+
| IDENTITY PROVIDER  │ TYPE            │ DOMAIN ASSIGNMENT    │ STATUS       │ HARDWARE ENFORCEMENT       |
| ------------------ │ --------------- │ -------------------- │ ------------ │ -------------------------- |
| Okta Enterprise IdP| SAML 2.0 / OIDC | `acme.com`           | Active       | WebAuthn FIDO2 Required    |
| Local TPM Vault IdP| Hardware Passkey| `local.sidra.internal`| Active       | TPM 2.0 Certificate Bound  |
+---------------------------------------------------------------------------------------------------------+
| [REGISTER NEW HARDWARE PASSKEY / WEBAUTHN DEVICE]                                                       |
| • Connect YubiKey / TPM Security Key ──> [1-CLICK BIND HARDWARE PASSKEY (`Cmd+Shift+K`)]               |
+---------------------------------------------------------------------------------------------------------+
```

---
