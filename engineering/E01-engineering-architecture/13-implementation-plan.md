# THEKY Engineering Architecture: Implementation Plan & Phase Roadmap

**Document ID:** `E01-13`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/13-implementation-plan.md`  

---

## 1. Engineering Phases & Milestone Mapping

Implementation is divided into six sequential, gate-checked phases mapping directly to system Milestones M1 through M14:

```
[ Phase 0: Workspace & Core Rust Foundation ] (M1 - M2)
                     |
                     v
[ Phase 1: Security, Event Store & Vault Storage ] (M3 - M5)
                     |
                     v
[ Phase 2: React Desktop Shell & Typed IPC RPC ] (M6 - M8)
                     |
                     v
[ Phase 3: AI Runtime, Planner & Model Router ] (M9 - M10)
                     |
                     v
[ Phase 4: Enterprise Departments & Wasm Connectors ] (M11 - M12)
                     |
                     v
[ Phase 5: Hardening, Performance Audits & Packaging ] (M13 - M14)
```

---

## 2. Phase Execution Specifications

### Phase 0: Workspace & Core Rust Setup (Milestones M1 - M2)
- **Focus:** Initialize Cargo & pnpm workspaces, set up project layout, implement `packages/domain` core traits, and wire initial CI purity gates.
- **Dependencies:** None.
- **Exit Gate:** `domain_purity_gate.py` passes cleanly with zero IO dependencies in `packages/domain`.

### Phase 1: Storage, Vault & Security Broker (Milestones M3 - M5)
- **Focus:** Implement SQLite WAL event store, hash chaining algorithms, AES-256-GCM zero-knowledge secret vault, and the **Permission Broker** single choke point.
- **Dependencies:** Phase 0 complete.
- **Exit Gate:** `additivity_audit.py` and `round_trip.py` pass 100% of event log hash verification tests.

### Phase 2: Presentation Shell & IPC RPC Bridge (Milestones M6 - M8)
- **Focus:** Build Tauri v2 desktop window shell, React 18+ application UI layout, `@theky/ui` design system, and type-safe IPC RPC command/event transport.
- **Dependencies:** Phase 1 complete.
- **Exit Gate:** Cold start latency ≤ 1200ms; UI frame rate rock-solid at 60 FPS.

### Phase 3: AI Runtime Engine & Memory (Milestones M9 - M10)
- **Focus:** Implement AI sidecar process management, Executive 5 tools (retrieve, delegate, convene, decide, report), RAG vector store (`sqlite-vec`), and multi-provider model routing.
- **Dependencies:** Phase 2 complete.
- **Exit Gate:** Agent mission state machine completes verification benchmark suite within budget.

### Phase 4: Enterprise Suites & Integration Connectors (Milestones M11 - M12)
- **Focus:** Implement Department business engines (Finance, Operations, Revenue, People, Platform Admin) and Wasm connector framework (`wasmtime`).
- **Dependencies:** Phase 3 complete.
- **Exit Gate:** All cross-department calls execute strictly via contract interfaces.

### Phase 5: Hardening, Performance & Packaging (Milestones M13 - M14)
- **Focus:** E2E automated testing suite, crash reporting, security penetration audit, Tauri installers (.msi, .dmg, .AppImage), and update release signing.
- **Dependencies:** Phase 4 complete.
- **Exit Gate:** Zero open high/critical security issues; idle memory ≤ 400 MB.

---

## 3. Critical Path & Dependency Graph

```
M1-M2 (Workspace) ---> M3-M5 (Storage & Security) ---> M6-M8 (Frontend & IPC)
                                                                 |
                                                                 v
M13-M14 (Hardening) <--- M11-M12 (Departments) <--- M9-M10 (AI Engine & RAG)
```

---
