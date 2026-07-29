# THEKY P08.6 — Users, Profiles, & Active Sessions UI Specification

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 03-users.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. User Directory & Active Sessions UI Specs

```
+---------------------------------------------------------------------------------------------------------+
| USERS DIRECTORY │ Total Users: 142 │ Active Sessions: 124 │ MFA Enforced: 100% │ [+ Invite User]     |
+---------------------------------------------------------------------------------------------------------+
| USER NAME          │ ROLE             │ MFA STATUS       │ DEVICE BINDING        │ SESSION STATUS │ ACTION
| ------------------ │ ---------------- │ ---------------- │ --------------------- │ -------------- │ ------
| Alex Sterling      | Principal Admin  | Hardware Passkey | TPM Workstation Rig 1 | Active Now     | [Revoke]
| Sara Al-Mansoor    | Lead Designer    | WebAuthn FIDO2   | MacBook Pro M3 Max    | Active Now     | [Revoke]
+---------------------------------------------------------------------------------------------------------+
| [ACTIVE SESSION REVOCATION DRAWER]                                                                      |
| • Session ID: `sess_8912_desktop` │ Device: Windows Desktop App │ IP: `127.0.0.1` (Local Loopback)      |
| • [1-CLICK REVOKE SESSION & WIPE SENSITIVE LOCAL CACHE (`Cmd+R`)]                                       |
+---------------------------------------------------------------------------------------------------------+
```

---
