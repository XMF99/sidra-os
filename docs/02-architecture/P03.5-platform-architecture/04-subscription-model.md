# THEKY P03.5 — Subscription Architecture & Plan Matrix

> **Program P03.5: Platform Architecture & Multi-Tenant SaaS Foundation**  
> **Document:** 04-subscription-model.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** ARCHITECTURAL SOURCE OF TRUTH (LOCKED)  

---

## 1. Subscription Tier Architecture

```
+---------------------------------------------------------------------------------------------------------+
|                                      SUBSCRIPTION TIER MATRIX                                           |
+------------------+------------------+------------------+--------------------+---------------------+
| FREE SOVEREIGN   | PRO              | BUSINESS         | ENTERPRISE         | GOVERNMENT          |
| $0 / Month       | $29 / User / Mo  | $79 / User / Mo  | Custom ($25k+ ACV) | Custom (Defense ELA)|
+------------------+------------------+------------------+--------------------+---------------------+
| • Local Kernel   | • Full Local OS  | • Multi-Agent    | • Unlimited Air-   | • FIPS 140-3        |
| • Single User    | • 1,000 Monthly  |   Orchestration  |   Gapped Nodes     | • FedRAMP High      |
| • BYO API Keys   |   AI Credits     | • SCIM 2.0 Sync  | • Custom GPU Nodes | • Sovereign Cloud   |
| • Community Docs | • Standard Agents| • 5,000 Credits  | • Dedicated SIEM   | • Custom DPA & SLA  |
+------------------+------------------+------------------+--------------------+---------------------+
```

---

## 2. Upgrade, Downgrade, & Grace Period Mechanics

* **Upgrades:** Instant feature flag enablement; mid-cycle pro-rated billing calculation via `THEKY Control Center`.
* **Grace Period:** 14-day grace period for failed billing payments before account falls back to Free Sovereign mode. Zero user workspace data is ever deleted.

---
