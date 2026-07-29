# THEKY Phase 02 — Information Architecture & Navigation Strategy

> **Phase 02: Product Strategy**  
> **Document:** 07-information-architecture.md  
> **Governance Authority:** [ARCHITECTURE-LOCK.md](file:///c:/Users/a_ala/OneDrive/سطح%20المكتب/sidra-os/design/ARCHITECTURE-LOCK.md)  
> **Status:** APPROVED STRATEGY  

---

## 1. Information Architecture Governance & Invariants

This document establishes the structural information architecture, navigation model, and mental frameworks for **THEKY OS** and **THEKY Control Center**. Every structural rule complies with frozen invariants: **Principal Attention Supremacy (INV-01)**, **Sub-50ms Desktop Latency (INV-06)**, and **Single Accountable Brief (INV-07)**.

---

## 2. Navigation Philosophy & Mental Model

### 2.1 The Executive Command Center Mental Model
THEKY OS rejects the mental model of "navigating browser tabs, nested database tables, and chaotic sidebars." 

THEKY OS adopts the mental model of an **Executive Flight Deck & Sovereign Vault**:
* **The Flight Deck (Command Bar & Brief Queue):** Where high-level intent is declared and decision briefs are reviewed.
* **The Vault (Workspace & Memory Graph):** Where sovereign enterprise knowledge, versioned documents, and audit ledgers reside safely.

```
+-----------------------------------------------------------------------------------+
|                        THEKY OS INFORMATION NAVIGATION MAP                        |
|                                                                                   |
|  [ Cmd + K ] ── Global Intent Launcher & Fuzzy Command Palette                    |
|  [ Cmd + B ] ── Executive Brief Queue (Single Accountable Brief View)              |
|  [ Cmd + V ] ── Sovereign Workspace Vault & Document Inspector                    |
|  [ Cmd + D ] ── Department Topology & Agent Charter Manager                       |
|  [ Cmd + G ] ── Governance, Fences, & Financial Spend Controls                    |
+-----------------------------------------------------------------------------------+
```

---

## 3. Structural Information Hierarchy

```
THEKY OS Root Shell
  │
  ├── 1. Command Bar (`Cmd+K`) ────────── Intent Submission & Global Fuzzy Search
  │
  ├── 2. Executive Brief View (`Cmd+B`) ── Consolidated Brief, Risk Flags, 1-Click Sign-Off
  │
  ├── 3. Workspace Vault (`Cmd+V`) ────── Sovereign Markdown Files, PRDs, ADRs, Artifacts
  │
  ├── 4. Memory Inspector (`Cmd+M`) ───── Semantic Vector Index & Organizational Graph
  │
  ├── 5. Department Center (`Cmd+D`) ──── Synthetic Department Pools, Charters, Velocity
  │
  └── 6. Governance & Control (`Cmd+G`) ── Org Hierarchy, Capability Fences, Spend Ceilings
```

---

## 4. Navigation Modes & Controls

### 4.1 Primary Keyboard Navigation Matrix

| Shortcut | Navigation Target | Primary Action | Latency Target |
| :--- | :--- | :--- | :---: |
| `Cmd + K` | **Intent Launcher** | State intent, search docs, trigger global actions. | **< 15ms** |
| `Cmd + B` | **Brief Queue** | Review consolidated briefs, issue decision sign-offs.| **< 30ms** |
| `Cmd + V` | **Workspace Vault** | Browse local sovereign Markdown files & PRDs. | **< 20ms** |
| `Cmd + M` | **Memory Graph** | Inspect semantic embeddings & relationship graphs.| **< 40ms** |
| `Cmd + D` | **Department Manager**| Inspect agent charters & department execution DAGs.| **< 30ms** |
| `Cmd + G` | **Governance Panel** | Adjust budget caps, capability fences, & permissions.| **< 30ms** |
| `Cmd + Enter`| **Approve Brief** | Sign off on brief & commit to hash-chain ledger. | **< 50ms** |
| `Cmd + Shift + K` | **Emergency Kill-Switch** | Immediately cancel active background executions. | **< 10ms** |

---

## 5. Search & Context Preservation Architecture

```
[ Search Input (`Cmd+K`) ]
            │
            ├───────────────────────────────┐
            ▼                               ▼
[ Sub-10ms Fuzzy File / Command Index ]  [ Sub-40ms Local Vector Semantic Index ]
(Matches file paths, actions, ADRs)       (Matches semantic context & memory graph)
            │                               │
            └───────────────┬───────────────┘
                            ▼
           [ Unified High-Velocity Result List ]
```

### Context Preservation Principles:
* **Zero View Loss:** Opening `Cmd+K` renders a transient modal over the active brief or document. Dismissing `Cmd+K` returns the user to the exact cursor position.
* **Persistent Breadcrumb Trail:** The current workspace vault path, active mission ID, and org node are visible in the unobtrusive footer line.

---

## 6. Progressive Disclosure & Cognitive Load Management

```
+-----------------------------------------------------------------------------------+
|                        PROGRESSIVE DISCLOSURE ARCHITECTURE                        |
|                                                                                   |
|  Level 1 (Executive Summary View):                                                |
|  Renders the ONE consolidated brief, key risk flags, and 1-Click decision buttons. |
|                                                                                   |
|  Level 2 (Inspection Detail View):                                                |
|  Expandable sections rendering verified code diffs, financial impact models,      |
|  and test coverage reports.                                                       |
|                                                                                   |
|  Level 3 (Audit & Traceability View):                                             |
|  Full SHA-256 hash block inspection, model token usage, and prompt trace logs.   |
+-----------------------------------------------------------------------------------+
```

---

## 7. Consistency Rules & Design Standards

1. **Rule 1 (Monochrome Foundation):** Interface renders in deep dark obsidian by default. Color is used strictly for state semantics (Audited Emerald = Pass; Sovereign Amber = Risk/Uncertainty; Crimson = Fence Violation).
2. **Rule 2 (Monospaced Technical Precision):** Timestamps, hash block IDs, token counts, and file paths must render in monospaced typography (`JetBrains Mono` / `SF Mono`).
3. **Rule 3 (Zero Layout Shift):** UI panels maintain fixed spatial bounds. Content stream updates preserve scroll position.

---
