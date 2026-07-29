# THEKY P08.6 — Executive Platform Dashboard High-Fidelity UI Specification

> **Program P08.6: Platform & Administration Suite UI Production**  
> **Document:** 01-platform-dashboard.md  
> **Governance Authority:** Supreme Governance ([ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/docs/02-architecture/ARCHITECTURE-LOCK.md))  
> **Status:** RATIFIED PRODUCTION UI SPECIFICATION (LOCKED)  

---

## 1. High-Fidelity Executive Platform Dashboard UI Specs

```
+-------------------------------------------------------------------------------------------------------------------+
| [TOP BAR] THEKY Admin │ Platform Health: 100% │ Kernel Latency: 1.2ms (**INV-06**) │ Cmd (`Cmd+K`) │ Vault Locked  |
+----------------------+----------------------------------------------------+---------------------------------------+
| [NAV SIDEBAR]        | [PLATFORM ADMINISTRATION FLIGHT DECK]              | [AI PLATFORM TELEMETRY DRAWER]        |
| • Dashboard (Active) |                                                    |                                       |
| • Organizations      |  KERNEL & LOCAL INFRASTRUCTURE METRICS             | [AI MODEL PROXY STATUS (INV-09)]      |
| • Users & Sessions   |  • Core Kernel Status: 100% Operational (Sub-50ms)| • Primary Proxy: Local ONNX Engine    |
| • Roles & Access     |  • Active WASM Sandboxes: 4 Fenced Containers      |   - Latency: 1.2ms (Sub-50ms SLA PASS)|
| • Identity & SSO     |  • Local Vault Storage: 14.2 MB (`.md` / `.jsonl`) | • Secondary Proxy: Cloud Model Bridge |
| • Security Center    |  • Daily Token Spend: $14.20 / $50.00 Budget Cap   |   - Provider Health: 100% Operational |
| • Audit Center       | -------------------------------------------------- | ------------------------------------- |
| • Integrations       | [CARD 1: WASM CAPABILITY FENCES STATUS (INV-05)]   | [SECURITY THREAT MONITORING RADAR]    |
| • AI Model Proxies   | • Sandbox #1 (Dev Builder): Network Egress OFF     | • Unauthorized Egress Attempts: 0     |
| • Developer API      | • Sandbox #2 (Sec Auditor): Network Egress OFF     | • Failed Login Attempts: 0           |
| • Plugin Marketplace | • Sandbox #3 (Sales Author): Network Egress OFF    | • Hash Ledger Verification: PASSED    |
| • System & Backups   | • Hardware Sandbox Enforcement: 100% Verified       | • [RUN SYSTEM DIAGNOSTICS (`Cmd+D`)]  |
+----------------------+----------------------------------------------------+---------------------------------------+
```

---

## 2. Token & Component Binding Specifications

* **Canvas Surface:** `sys.token.color.surface.base` (`#0B0F17`).
* **Metric Card Surface:** `bg: #141C2B`, `border: 1px solid #233248`, `radius: 8px` (`sys.token.radius.md`), `padding: 16px`.
* **Kernel Latency Badge:** `bg: #064E3B`, `color: #34D399`, `font: 14px / 600 Monospace`.

---
