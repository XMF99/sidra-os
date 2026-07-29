# THEKY P03.5 — Global Billing & Monetization Platform

> **Program P03.5: Platform Architecture & Multi-Tenant SaaS Foundation**  
> **Document:** 11-billing-platform.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** ARCHITECTURAL SOURCE OF TRUTH (LOCKED)  

---

## 1. Multi-Gateway Payment Architecture

THEKY supports global and regional Middle East payment processing via Stripe, Moyasar, HyperPay, and STC Pay:

```
[ Customer Subscription Action ]
               │
               ▼
[ Payment Gateway Router ] ── Maps Gateway by Tenant Region & Currency
               │
               ├── US / Global ──────> Stripe (USD, EUR, GBP)
               ├── Saudi Arabia ─────> Moyasar / STC Pay (SAR)
               └── MENA Regional ────> HyperPay (AED, KWD, QAR)
```

---

## 2. Metering & Enterprise ELA Contracts

* **Hybrid Seat + Metered Billing:** Charges fixed base seat rates + metered AI cloud burst credits.
* **VAT & Tax Engine:** Automated local VAT compliance (e.g., 15% ZATCA VAT in Saudi Arabia).

---
