# THEKY P03.6 — THEKY Control Center Surface Architecture

> **Program P03.6: Product Surface Architecture**  
> **Document:** 08-control-center-surface.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCT SURFACE (LOCKED)  

---

## 1. Owner Control Center Subsystems Surface

THEKY Control Center provides an isolated management surface for THEKY operators:

```
+-----------------------------------------------------------------------------------+
|                        11 OWNER CONTROL CENTER SUBSYSTEMS                         |
|                                                                                   |
|  1. Customer Management     ── Tenant accounts, org trees, contact admins.        |
|  2. Subscription Management ── Plan tiers, upgrades, cancellation holds.          |
|  3. Billing & Tax           ── Global invoice ledger, Moyasar / Stripe sync.      |
|  4. Licensing Center        ── TPM key generation, offline cert provisioning.     |
|  5. AI Model Management     ── AIOps provider failover dials, proxy latency.      |
|  6. Marketplace Operations  ── Code audit review queue, 70/30 payout splits.      |
|  7. Support Operations      ── Ticket triage, SLA tracking, platform health.      |
|  8. Platform Health         ── Edge relay latencies, regional node status.        |
|  9. Audit Center            ── Cryptographic ledger verification streams.         |
| 10. Feature Flags           ── Progressive canary rollout toggles.                |
| 11. Executive Ops Dashboard ── Global MRR, churn rate, API cost margins.          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Hard Vault Isolation (INV-10)

Control Center operators **NEVER** possess technical capability to view, search, or read client local workspace vaults. All customer vault files remain encrypted on local user disks.

---
