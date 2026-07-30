# THEKY Engineering Architecture: Testing Architecture

**Document ID:** `E01-11`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/11-testing-architecture.md`  

---

## 1. Testing Pyramid & Layering Strategy

THEKY enforces an automated testing pyramid designed to achieve maximum confidence, rapid feedback, and non-regression guarantees.

```
                         / \
                        /   \
                       / E2E \       <-- Playwright / Tauri Desktop E2E (M13-M14)
                      /-------\
                     / Contract \    <-- IPC Command & Schema Contract Tests
                    /------------\
                   / Integration  \  <-- Tokio Async + SQLite Roundtrip Tests
                  /----------------\
                 /   Unit Testing   \ <-- Pure Rust `cargo test` & Vitest (≥85% Coverage)
                +--------------------+
```

---

## 2. CI Verification Gates & Automation Framework

All commits and pull requests must pass the automated gate scripts in `infrastructure/ci/gates/`:

```
   Commit / PR Trigger
            |
            v
[ GATE 1: Domain Purity Gate ] -----------> Fails if domain imports IO crates (`domain_purity_gate.py`)
            |
            v
[ GATE 2: Additivity Audit ] -------------> Fails if hash-chained schema modified destructively (`additivity_audit.py`)
            |
            v
[ GATE 3: Rust Unit & Integration ] ------> Executes `cargo test --workspace`
            |
            v
[ GATE 4: Frontend Vitest ] --------------> Executes `pnpm test`
            |
            v
[ GATE 5: Performance Budget Gate ] ------> Fails if cold start > 1200ms or idle RAM > 400MB
            |
            v
      [ PASSED & MERGED ]
```

---

## 3. Mandatory Coverage & Quality Metrics

1. **Domain Logic (`packages/domain`):** **≥ 90%** Line & Branch Coverage.
2. **Security & Permission Broker (`packages/permission-broker`):** **100%** Path Coverage.
3. **Event Store & Vault (`packages/vault`):** **≥ 95%** Coverage (Includes corruption & round-trip verification tests).
4. **IPC Bridge & DTOs:** **100%** Type-checking & serialization coverage.

---

## 4. Regression & Round-Trip Validation Policies

1. **Round-Trip Test Policy (`infrastructure/testing/backup/round_trip.py`):** Every database migration or schema update MUST execute a full export, wipe, import, and hash verification round-trip test.
2. **Golden Evaluation Sets:** Prompts, agent charters, and executive briefs are versioned alongside unit tests. Any charter update that regresses its associated Golden Evaluation Set is blocked from merging.

---
