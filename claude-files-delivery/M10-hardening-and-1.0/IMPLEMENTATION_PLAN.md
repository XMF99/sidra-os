# M10 — Hardening and 1.0 · Implementation Plan

**For AntiGravity.** Epics E0–E8. Task conventions inherited from the Mission Engine plan §0.4: one task =
one commit = one review; S <200 LOC, M 200–600, L 600+; every task ships tests; every task leaves `main`
green.

Each task carries: Purpose · Files to create/modify · APIs · Events · DB/Migration · Tests · Acceptance
Criteria · Review steps · Dependencies · Completion definition. Where a field is "none", it is stated so the
reviewer knows it was considered, not skipped.

---

## E0 — Workspace restoration (precondition)

**Purpose.** Make the M1–M9 substrate build as a workspace before hardening it. The audit found only
`services/mission` + `services/connectors` are workspace members.

| Task | Cx | Deps | Files to modify | Acceptance criteria | Completion definition |
|---|---|---|---|---|---|
| **T0.1** Add all crates to `[workspace] members` | S | — | `Cargo.toml` | Every crate under `services/`, `packages/`, `apps/*` is a member | `cargo metadata` lists all crates (once toolchain present) |
| **T0.2** Resolve path-dependency graph; confirm ADR-0011 direction | M | T0.1 | each `Cargo.toml` | `domain ← services ← apps`; no reverse edge | dependency-direction CI check passes |
| **T0.3** Fill or delete stub crates presented as complete (`ingest`, `tool-sdk`, `testkit`, thin `kernel`) | L | T0.2 | those crates | No crate is a doc-comment-only stub; each either implements its M-scope or is removed with its milestone reopened | audit note in `docs` records the decision per crate |
| **T0.4** Green baseline: `cargo check --workspace` + `cargo fmt --check` | M | T0.1–T0.3 | — | Both pass (requires toolchain — else report BUILD NOT VERIFIED) | CI job green |

**Subtasks T0.3:** (a) ingest → implement M5 document extractors/chunker/embedding pipeline or reopen M5;
(b) testkit → the shared harness M-suites depend on; (c) tool-sdk → the tool author SDK M9 assumes;
(d) kernel → the command/query API + event bus beyond `get_status`.

---

## E1 — Crash-recovery matrix

**Purpose.** Prove exactly-once effect and full resume across `kill -9` at every state transition.

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T1.1** Enumerate every Work Order / Engagement state transition | S | E0 | `infrastructure/testing/chaos/transitions.rs` | A complete transition list derived from the orchestrator state machine | list matches source enum exhaustively |
| **T1.2** Chaos harness: kill at each transition, restart, assert resume | L | T1.1 | `chaos/matrix.rs` | Every transition resumes; no Work Order lost | matrix green |
| **T1.3** Idempotency-key enforcement on effectful replay | M | T1.2 | `services/orchestrator/` | A replayed effect after crash does not double-execute | property test green |
| **T1.4** Report: `RecoveryReport` per run, stored to the diagnostic bundle | S | T1.2 | orchestrator | Report names the transition, the resume point, and the effect ledger | AC1 |

**AC1** proven when T1.2+T1.3 are green over the full transition set.

---

## E2 — Corruption recovery

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T2.1** Corruption corpus: damaged page, truncated WAL, flipped hash byte | M | E0 | `infrastructure/testing/corruption/` | Corpus covers page/WAL/chain cases | corpus builds |
| **T2.2** Detection: `audit.verify` names the first bad sequence | M | T2.1 | `services/security/audit.rs` | Detection is exact, not "somewhere" | AC2 (detect) |
| **T2.3** Projection rebuild from the event log after corruption | M | T2.1 | `services/store/` | Projections rebuild to a correct state; no silent loss | AC2 (recover) |
| **T2.4** SQLCipher page-HMAC failure surfaces as a named recovery, not a crash | S | T2.1 | store | A bad page is a `RecoveryReport`, not a panic | AC2 |

---

## E3 — Migration rehearsal

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T3.1** One fixture Vault per historical schema version | M | E0 | `infrastructure/testing/migration-rehearsal/fixtures/` | Fixtures for every shipped schema version | fixtures present |
| **T3.2** Rehearsal harness: open + forward-migrate each fixture with the current binary | M | T3.1 | `migration-rehearsal/run.rs` | Each opens and migrates; no column meaning changed | AC3 |
| **T3.3** Assert forward-only + idempotent on re-run | S | T3.2 | store | Re-running a migration is a no-op | AC3 |

---

## E4 — Export / re-import round-trip

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T4.1** Full Vault export: encrypted blob + Markdown mirror + contents manifest | M | E0 | `infrastructure/testing/roundtrip/`, `services/store/` | Export lists exactly what it contains before writing (security model §9) | AC4 |
| **T4.2** Re-import into an empty Vault | M | T4.1 | store | Import reconstructs schema + data | AC4 |
| **T4.3** Round-trip equality: Briefs, Decisions, artifacts identical; redaction applied | M | T4.2 | roundtrip | Hash equality on the reconstructed set; secrets redacted | AC4 |

---

## E5 — Security review #2

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T5.1** Rerun the 60-payload injection corpus against the full M9 capability surface | M | E0 | `infrastructure/testing/injection/` | 100% flag, 0% tool-grant | AC5 |
| **T5.2** Key-leak runtime scan over prompts, logs, events | M | T5.1 | `services/security/` | No key pattern anywhere written | AC6 |
| **T5.3** Effect-class-3-always-approved property test over the tool registry | S | T5.1 | security | Every class-3 tool asks | AC5 |
| **T5.4** Written second-review report with findings + accepted-risk register | S | T5.1–T5.3 | `docs/principal/` or security docs | Findings each fixed or accepted in writing | AC5, AC10 |

---

## E6 — Performance regression suite

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T6.1** Perf harness with recorded budgets: cold start, frame rate, idle memory | M | E0 | `infrastructure/testing/perf/` | Budgets recorded (≤1.2 s, 60 fps, ≤400 MB) | AC7 |
| **T6.2** CI gate fails the build on regression beyond budget | S | T6.1 | `infrastructure/ci/` | A regression fails CI | AC7 |
| **T6.3** Idle-memory profile; reduce to budget without raising it | M | T6.1 | apps/services | Idle ≤400 MB by reducing work, not raising the number | AC7 |

---

## E7 — Release pipeline

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T7.1** Signed installers per platform (macOS, Windows, Linux) | L | E0 | `infrastructure/release/installer/` | Installer builds and installs on all three | AC8 |
| **T7.2** Ed25519 manifest signing; app refuses unsigned updates | M | T7.1 | `release/signing/` | Unsigned update refused | AC8 |
| **T7.3** Update channel with downgrade refusal | M | T7.2 | `release/update/` | A downgrade is refused | AC8 |

---

## E8 — Principal documentation & dogfood

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T8.1** Principal docs: install, recovery, export, lock/unlock, diagnostics export | M | E1–E7 | `docs/principal/` | Written for the Principal, not the builder (§M10) | AC9 |
| **T8.2** Diagnostic bundle export runs redaction and lists its contents | S | T8.1 | apps/security | Bundle lists contents before writing | AC9 |
| **T8.3** Thirty-day dogfood: defect register; zero data-loss / zero unlogged-effect gate | L | E1–E7 | `docs/principal/dogfood-log.md` | 30 days, zero data-loss, zero unlogged effects, every defect fixed or accepted in writing | AC10 (exit) |

---

## Recommended order

E0 (blocking) → E1–E6 in parallel once E0 is green → E7 → E8. **T8.3 (the 30-day dogfood) is the final gate
and cannot be compressed.**

## Deliverables summary

| Epic | Deliverable |
|---|---|
| E0 | green `cargo check --workspace` over M1–M9 |
| E1 | crash-recovery matrix |
| E2 | corruption recovery |
| E3 | migration rehearsal |
| E4 | export/import round-trip |
| E5 | second security review + reports |
| E6 | perf regression CI gate |
| E7 | signed installer + update channel |
| E8 | Principal docs + 30-day dogfood record |
