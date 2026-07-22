# Hardening and 1.0 — Implementation Plan

**Milestone M10 · no new crate · for AntiGravity**

| | |
|---|---|
| Architecture | `HARDENING_AND_RELEASE_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0038 (release gate is a proof obligation, not a date) · 0039 (hardening adds no authoritative tables) |
| New crate | **none** — extends `infrastructure/ci/` and `infrastructure/testing/`; adds tests inside existing crates |
| New migrations | **none** — no table added (architecture §11.1; ADR-0039) |
| Depends on | all of M1–M9 (see `00-M9-AUDIT.md`) |
| Must not | add a product feature, relax a performance budget, or waive a gate to hit a date (ADR-0038) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR, adds a product feature, or relaxes a budget.

### 0.2 Task conventions (inherited from the M16 plan §0.2, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** A hardening task whose deliverable *is* a test still ships the fixture,
  the oracle, and a demonstrated failing case (a gate that cannot fail is not a gate).
- **Every task leaves `main` green.** A new gate lands green (or feature-flagged behind its own enablement) and
  is only made blocking once it passes on the frozen surface; it never breaks the build on arrival.
- **No production code in this package.** This plan is the specification AntiGravity implements. M10 adds no
  product feature and no migration (architecture §1.4, §11.1).

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | CI-gate hardening & enforcement | the eight permanent 1.0 gates as first-class objects (architecture §4) |
| E2 | Chaos & recovery harness | the seeded crash matrix, corruption cases, migration rehearsal, the Chaos gate oracle (§6) |
| E3 | Performance-budget gates | the three release budgets + secondary budgets as permanent gates on both machines (§7) |
| E4 | Audit-coverage proof | the closed effect-coverage enumeration + projection rebuild-and-diff (§8) |
| E5 | Second security review & red-team corpus | the red-team suite and the five-layer injection corpus (§5) |
| E6 | Backup/restore & degradation ladder | snapshot/restore + export round-trip; the four-stage ladder (§9) |
| E7 | Dogfood acceptance harness & 1.0 release checklist | the thirty-day protocol, the release-gate Decision, the checklist (§10) |

### 0.4 Recommended implementation order

```
E1 (gates as objects) ──┬──► E2 (chaos)          ──┐
                        ├──► E3 (performance)     ──┤
                        └──► E4 (audit coverage)  ──┼──► E5 (security review) ──► E6 (backup/ladder) ──► E7
                                                    │        needs a hardened, gate-green surface
                                                    │        + the M9 plugin surface (impl-plan §3)
                                          (E2/E3/E4 run in parallel once E1 lands)
```

E1 first: the gate scaffolding every other epic wires into (`infrastructure/ci/`, ADR-0031 placement). E2, E3,
and E4 are the three independent proofs and can proceed in parallel once E1 lands. E5 (the second security
review) needs the surface hardened and the M9 plugin capability present, so it follows E2–E4. E6 proves
backup/restore and the degradation ladder. **E7 closes the milestone; its final task (T7.4) is the exit
criterion and must be the last thing to go green** — thirty consecutive clean dogfood days and the recorded
release-gate Decision (architecture §3, §10; ADR-0038).

---

## E1 — CI-gate hardening & enforcement

### Purpose
Make the eight 1.0 CI gates first-class, permanent objects on the frozen surface — the scaffolding every other
epic plugs its proof into (architecture §4).

### Scope
In: confirming and hardening the Build, Dependency-direction, Generated-bindings, Domain-purity, and
Evaluation-sets gates on the frozen 1.0 surface; wiring the Chaos gate's enablement (its oracle is E2); the
scope-freeze enforcement. Out: the Performance gate's measurement (E3), the Audit-coverage enumeration (E4),
the Chaos oracle (E2).

### Dependencies
M1 (CI, signed installers), ADR-0011 (dependency direction), ADR-0031 (`infrastructure/ci/` placement).

### Public APIs
None. Gate definitions under `infrastructure/ci/gates/`.

### Acceptance criteria
Each of the eight gates exists as a named object that runs on every commit and can be demonstrated failing on a
seeded violation; the four already-established gates are green on the frozen surface.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scope-freeze guard: refuse a PR that adds a product feature or a `services/*`/`packages/*` non-test surface during M10; document the frozen 1.0 scope from the roadmap "not in 1.0" list | S | — | `infrastructure/ci/gates/scope-freeze.*` | A feature-adding PR is refused with the frozen-scope reason (architecture §1.4, F12); test-only diffs pass |
| **T1.2** | Confirm the **Build** gate on the frozen surface: signed installers on all three platforms, plugins included | S | M1 | `infrastructure/ci/gates/build.*` | Any platform failure or unsigned installer fails the build (GATE-1; AC14) |
| **T1.3** | Confirm the **Dependency-direction** and **Domain-purity** gates hold under all hardening additions | S | — | `infrastructure/ci/gates/dependency-direction.*`, `domain-purity.*` | A seeded back-edge (`domain → services`) or an I/O dep in `domain` fails the build (GATE-2/4; AC14) |
| **T1.4** | Confirm the **Generated-bindings** gate: `packages/bindings` is generated, never hand-edited | S | — | `infrastructure/ci/gates/generated-bindings.*` | A hand-edit to `packages/bindings` fails the build (GATE-3; AC14) |
| **T1.5** | Wire the **Chaos** gate enablement: `infrastructure/ci/` invokes the crash harness (oracle from E2) and fails on a recovery failure | S | E2/T2.1 | `infrastructure/ci/gates/chaos.*` | A seeded kill with failed recovery fails the build (GATE-8; AC4) |
| **T1.6** | Wire the **Evaluation-sets** gate: the five 1.0 evals (retrieval, Brief, delegation, honesty, charter) as regression gates; honesty fabrication is a release blocker | M | M5, M6, M7 | `infrastructure/ci/gates/evaluation-sets.*` | A charter change that regresses its set fails; a fabricated honesty answer is a release blocker (GATE-7; AC13) |

---

## E2 — Chaos & recovery harness

### Purpose
Prove `kill -9` loses at most one in-flight model call and never committed state, across every state
transition, corruption case, and released schema version (architecture §6).

### Scope
In: the seeded crash-injection harness with the equivalence oracle; the corruption/adversarial-storage matrix;
migration rehearsal from every released fixture; the recovery-routine assertions. Out: the CI wiring of the
Chaos gate (E1/T1.5); backup/restore (E6).

### Dependencies
M2 (event log, hash chain, projections), system-design §6 (recovery contract), testing §3.

### Public APIs
None. Harness under `infrastructure/testing/chaos/`.

### Acceptance criteria
The harness kills at every transition and asserts equivalence to an uninterrupted run of the same seed; the
corruption matrix each asserts its required outcome; migration rehearsal carries every fixture forward.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Seeded crash-injection harness: run a workload, `kill -9` at pseudo-random seeded points, relaunch, verify chain from genesis, rebuild+diff projections | M | M2 | `infrastructure/testing/chaos/inject.*` | Reproducible from a seed; chain verifies; every projection rebuilds byte-identically (AC1; testing §3) |
| **T2.2** | Equivalence oracle: assert the resumed Engagement produces the same Deliverable as an uninterrupted run of the same seed, killing at every Engagement/WorkOrder/Turn transition | L | T2.1 | `infrastructure/testing/chaos/equivalence.*` | Resumed Deliverable == uninterrupted-run Deliverable at every transition, else fail (AC1; system-design §3, §6) |
| **T2.3** | Corruption/adversarial-storage matrix: disk-full, read-only Vault, DB-replaced, truncated final event, corrupted mid-page (named, not truncated), clock-backwards, sleep-mid-Turn | L | T2.1 | `infrastructure/testing/chaos/corruption.*` | Each case asserts its required outcome; a corrupted mid-page names the first bad event and does not truncate (AC2; §6.2) |
| **T2.4** | Migration rehearsal: seeded fixture DB per released schema version (M1–M9); migrate all forward on every schema change; forward-only, idempotent | M | M2 | `infrastructure/testing/chaos/migration-rehearsal.*` | Every fixture migrates forward; re-running is idempotent; the oldest fixture round-trips forward (AC3; testing §3) |
| **T2.5** | Recovery-routine assertions: running-without-result → queued attempt+1 (else escalated at 3); effectful tool with intent, no result → Approval Request; `system.recovered` emitted | M | T2.1 | `infrastructure/testing/chaos/recovery.*` | Recovery matches system-design §6 step-for-step; recovery is visible, not silent (AC1) |

---

## E3 — Performance-budget gates

### Purpose
Make the three release budgets and the secondary budgets permanent 1.0 gates on both the reference and the
lowest-spec machine, with breaches fixed by doing less work (architecture §7; ADR-0038).

### Scope
In: the cold-start, frame-rate, and idle-memory measurements as permanent gates on both machines; the secondary
budgets; the "names the number" regression report. Out: any budget-raising (forbidden without an ADR; testing
§6).

### Dependencies
M8 (the building — the budgets to enforce), testing §6.

### Public APIs
None. Harness under `infrastructure/testing/performance/`; gate under `infrastructure/ci/gates/performance.*`.

### Acceptance criteria
Each budget is measured on reference and lowest-spec; the gate is the lower of the two; a regression fails the
build and names the number.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Cold-start gate: instrumented launch, p50 of 20 runs, on reference **and** lowest-spec; gate = lower; ≤1.2 s | M | M8 | `infrastructure/testing/performance/cold-start.*`, `ci/gates/performance.*` | A regression past 1.2 s fails the build and names the number (AC10; testing §6) |
| **T3.2** | Frame-rate gate: automated trace over a 60 s scripted Engagement; 60 fps sustained, no frame >32 ms, both machines | M | M8 | `infrastructure/testing/performance/frame-rate.*` | A dropped-frame regression fails and names the frame (AC10) |
| **T3.3** | Idle-memory gate: sampled after 10 min idle, both machines; ≤400 MB | S | M8 | `infrastructure/testing/performance/idle-memory.*` | A regression past 400 MB fails and names the number (AC10) |
| **T3.4** | Secondary-budget gates: command palette ≤50 ms, search first wave ≤120 ms, retrieval p95 ≤120 ms, DB write p99 ≤8 ms | M | M5, M8 | `infrastructure/testing/performance/secondary.*` | Each secondary budget regresses → build fails and names the number (AC10; testing §6) |

---

## E4 — Audit-coverage proof

### Purpose
Prove zero unlogged effects: the effectful set is closed, every member has a paired log-entry assertion, and no
effect writes state outside the log (architecture §8).

### Scope
In: the effect-coverage enumeration gate; the log-entry assertions on every class-≥1 path in existing crates
(tests only); the projection rebuild-and-diff harness. Out: the audit chain's crash behaviour (E2).

### Dependencies
M2 (event log, projections), M3 (effect classes), testing §1.

### Public APIs
None. Gate under `infrastructure/ci/gates/audit-coverage.*`; assertions live beside the effectful code as
tests.

### Acceptance criteria
Every effectful tool (class ≥1) has a paired log assertion or CI fails; the set is closed; projection
rebuild-and-diff is byte-identical after every integration test.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Effect-coverage enumeration: derive the closed set of class-≥1 tools/paths from the registry; a member without a paired log assertion fails the build | M | M3 | `infrastructure/ci/gates/audit-coverage.*` | An effectful path with no log assertion fails the build; the set is closed (AC5; testing §1, GUIDE §7) |
| **T4.2** | Log-entry assertions for every existing class-≥1 path (tests only, inside their crates) | L | T4.1 | `services/*/tests/`, `packages/*/tests/` | Every effectful path asserts the exact log entry it emits; no path is exempt (AC5; GUIDE §3.4) |
| **T4.3** | Projection rebuild-and-diff harness: after every integration test, rebuild every projection from events and diff against persisted | M | M2 | `infrastructure/testing/audit/rebuild-diff.*` | Any drift fails; proves no effect wrote state outside the log (AC6; testing §1, §8.2) |
| **T4.4** | Full-chain `audit.verify` over a lifecycle fixture and over a synthetic tampered row | S | M2 | `infrastructure/testing/audit/verify.*` | Verifies from genesis; a tampered row is detected and named by sequence (AC5; security §11) |

---

## E5 — Second security review & red-team corpus

### Purpose
Red-team the whole 1.0 surface — kernel *and* the M9 plugin capability — and prove the five-layer injection
defense (architecture §5). The second of the two external security reviews (testing §5).

### Scope
In: the red-team suite (hostile tool + hostile plugin across the eight vectors); the injection corpus with
layered assertions; the supply-chain gate. Out: the controls themselves (they are M3/M9 and are re-exercised,
not rebuilt).

### Dependencies
E1–E4 (a hardened, gate-green surface), **M9 (the plugin capability surface must exist)**, M3 (the controls),
testing §5, security §3/§7/§11.

### Public APIs
None. Harness under `infrastructure/testing/security/`.

### Acceptance criteria
Every red-team case is denied **and** logged (a silent denial fails); the injection corpus is defeated at every
layer; supply-chain gates are zero-known-critical.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Hostile-tool red-team: path traversal, symlink escape, unlisted egress, forged-envelope escalation, log suppression, parallel-Turn budget bypass, keychain read | L | E1–E4, M3 | `infrastructure/testing/security/hostile-tool.*` | Every case denied **and** logged; a silent denial fails (AC7; testing §5) |
| **T5.2** | Hostile-plugin red-team (the M9 surface): the same vectors plus reading another plugin's storage | L | T5.1, M9 | `infrastructure/testing/security/hostile-plugin.*` | Every case denied and logged; cross-plugin storage read denied and logged (AC7; testing §5) |
| **T5.3** | Injection corpus (≥60 payloads) with layered assertions: provenance `untrusted`, fence survives, scanner flags (100%), zero class-≥1 grants in untrusted-context Turns, egress inspection | L | E1–E4, M3 | `infrastructure/testing/security/injection-corpus.*` | An item defeating any single layer is a finding; one defeating all five is a release blocker (AC8; security §7/§11) |
| **T5.4** | Supply-chain gate: `cargo audit` / `cargo deny` / `npm audit` zero-known-critical; lockfiles committed; reproducible build verified | S | — | `infrastructure/ci/gates/supply-chain.*` | A known-critical advisory or a non-reproducible build fails (AC9; testing §5) |

---

## E6 — Backup/restore & degradation ladder

### Purpose
Prove any Vault backs up and restores to a byte-identical state, and that the Firm degrades in defined stages
with no data loss (architecture §9).

### Scope
In: snapshot-before-migration + daily, retention, `integrity_check` verification, restore-to-byte-identical,
full export/re-import round-trip; the four-stage degradation-ladder harness. Out: the crash matrix (E2).

### Dependencies
M2 (store), system-design §6 (snapshots, recovery), technical-architecture §9 (degradation ladder), impl-plan
§M10 (export round-trip).

### Public APIs
None. Harness under `infrastructure/testing/backup/` and `infrastructure/testing/degradation/`.

### Acceptance criteria
Snapshots verify and restore byte-identically; export/re-import is byte-identical; each degradation stage is
entered on its trigger, exited cleanly, and loses no committed state.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Snapshot proof: taken before every migration + daily; retained 7 daily/4 weekly; each verified by open + `integrity_check`; restore reproduces a byte-identical Vault | M | M2 | `infrastructure/testing/backup/snapshot.*` | Snapshot cadence and retention hold; restore is byte-identical (AC11; system-design §6) |
| **T6.2** | Full export / re-import round-trip: export, wipe store, re-import, assert byte-identical to the original (including the Vault Markdown mirror) | M | T6.1 | `infrastructure/testing/backup/round-trip.*` | Export → wipe → re-import == original, byte-for-byte (AC11; impl-plan §M10, architecture §11.3) |
| **T6.3** | Degradation-ladder harness: full → no-network (Turns queue, local work continues) → budget-capped (fast class only) → read-only (browse/search/archive); each transition entered and exited cleanly | L | M4 | `infrastructure/testing/degradation/ladder.*` | Each stage behaves per technical-architecture §9; no stage loses committed state (AC12) |

---

## E7 — Dogfood acceptance harness & 1.0 release checklist

### Purpose
Operationalize the exit criterion: thirty consecutive clean days, the release-gate Decision, the 1.0 release
checklist (architecture §10; ADR-0038). **The last epic; T7.4 is the last thing to go green.**

### Scope
In: the dogfood ledger (a projection over existing `system.*`/`decision.*` events), the clean-day/incident
definitions, the reset-on-incident logic, the release checklist, the release-gate Decision. Out: any new
authoritative table (forbidden; ADR-0039).

### Dependencies
All prior epics; the release gate depends on E1–E6 being green and the second security review (E5) passing.

### Public APIs
None. Harness under `infrastructure/testing/dogfood/`; the release-gate Decision is a `decision.*` event.

### Acceptance criteria
The ledger is a projection (no new table); a data-loss or unlogged-effect incident resets the counter; thirty
consecutive clean days plus a passed security review plus all defects closed yields a recorded, demonstrated
release-gate Decision.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Dogfood ledger as a projection over existing `system.*`/`decision.*` events (window open, day recorded, incident/reset); no new authoritative table | M | E1–E6 | `infrastructure/testing/dogfood/ledger.*` | The ledger rebuilds from the event log; no migration added (ADR-0039; architecture §11) |
| **T7.2** | Clean-day / incident definitions and the reset-on-incident counter: data-loss and unlogged-effect incidents each reset the thirty-day counter to zero | M | T7.1 | `infrastructure/testing/dogfood/acceptance.*` | An incident on day N resets to zero; only thirty *consecutive* clean days count (AC15; architecture §3.3, §10.2–§10.3) |
| **T7.3** | The 1.0 release checklist: eight gates green + second security review passed + every open defect fixed or accepted in writing, all enumerated and machine-checkable | M | E1–E6, E5 | `infrastructure/testing/dogfood/release-checklist.*` | The checklist blocks release unless every item is satisfied (architecture §3.2; impl-plan §M10) |
| **T7.4** | **Exit-criterion acceptance:** run the thirty-day window; record thirty consecutive clean days; the release-gate Decision (`decision.*`) is recorded and demonstrated to someone who does not trust the author | L | T7.1–T7.3 | `infrastructure/testing/dogfood/exit-criterion.*` | **Thirty consecutive clean days, zero data loss, zero unlogged effects, release-gate Decision recorded and demonstrated — the last thing green** (AC15; registry §4; GUIDE §6; ADR-0038) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | the eight permanent 1.0 CI gates as first-class objects + scope-freeze guard |
| E2 | the seeded crash matrix, corruption cases, migration rehearsal, recovery assertions (Chaos gate oracle) |
| E3 | the three release budgets + secondary budgets as permanent gates on both machines |
| E4 | the closed effect-coverage enumeration + log assertions + projection rebuild-and-diff |
| E5 | the second security review: red-team suite (kernel + plugins) + five-layer injection corpus + supply-chain |
| E6 | snapshot/restore + export round-trip + the four-stage degradation ladder |
| E7 | the dogfood acceptance harness + 1.0 release checklist + the exit-criterion Decision (last thing green) |
