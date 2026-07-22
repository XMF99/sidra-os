# M10 — Hardening and 1.0 · Architecture

**Release 1.0 "Atrium"**

| | |
|---|---|
| Milestone | M10 — Hardening and 1.0 (`MILESTONE_REGISTRY.md` §4, 1.0 "Atrium") |
| Authoritative source | `docs/01-implementation-plan.md` §M10; `docs/07-security-model.md`; `docs/06-implementation`-era testing rules |
| Nature | Hardening only — no new capability, no new domain, no schema change |
| Exit criterion | Thirty days dogfooding, zero data-loss, zero unlogged effects, every defect fixed or accepted in writing |

> This milestone re-decides nothing. It proves the M1–M9 architecture under stress and packages it for
> release. Where this document appears to add a behaviour, it is a defect — M10 adds only tests, recovery
> paths for already-specified guarantees, and release machinery.

## 1. Overview

1.0 is not "the features are done"; 1.0 is "the guarantees hold when things go wrong." The M1–M9 substrate
makes strong promises — a hash-chained event log that never loses history (ADR-0002), a single-file
encrypted Vault with a Markdown mirror (ADR-0003), effect classes that make "irreversible" mechanical, and a
Permission Broker that is the sole choke point. M10 is the milestone that turns each promise into a passing
adversarial test and a documented recovery path, then wraps it in a signed installer.

## 2. Architecture — the seven hardening surfaces

| Surface | Guarantee under test | Mechanism |
|---|---|---|
| Crash recovery | No Work Order is lost or double-executed across a `kill -9` at any state transition | Durable Work Orders (ADR-0010); resume-from-log; idempotency keys |
| Corruption recovery | A damaged page, a truncated write, or a broken hash link is detected and recovered without silent loss | `audit.verify`; SQLCipher page HMAC; projection rebuild from the event log |
| Migration rehearsal | The current binary opens a Vault written by every prior schema version | Forward-only migrations replayed from each historical schema fixture |
| Export / re-import | A full Vault exports and re-imports byte-faithfully, with redaction applied and contents listed | The Markdown mirror + encrypted blob export; round-trip hash equality |
| Security review #2 | The prompt-injection corpus scores 100% flag / 0% tool-grant; keys never leak | The 60-payload corpus (security model §11) rerun against the full M9 capability surface |
| Performance regression | Cold start ≤1.2 s, sustained 60 fps, idle ≤400 MB — as a CI gate, not a one-off | A perf harness with recorded budgets that fails the build on regression |
| Release integrity | The app refuses unsigned or downgraded updates | Signed manifests; Ed25519 over the update manifest; downgrade refusal |

## 3. Domain model

**No new domain types.** M10 introduces test fixtures, a `RecoveryReport`, and a `ReleaseManifest` value
object used only by the release pipeline. None enters the Vault schema. The event log, Work Order, and Brief
contracts are unchanged.

## 4. Services / crates

No new crate. M10 extends existing crates with hardening code and tests:

- `services/store` — corruption detection, migration-rehearsal harness, export/import round-trip.
- `services/security` — the second-review corpus runner; key-leak scan.
- `services/orchestrator` — crash-recovery matrix (resume at every transition).
- `infrastructure/testing` — the chaos matrix, perf regression harness, injection corpus.
- `infrastructure/release` — installer, signing, update channel.
- `apps/*` — Principal-facing documentation surface (help, diagnostics export).

## 5–8. Events · Database · Migrations · Persistence

**None.** M10 is additive in tests and release tooling only. The compatibility contract
(`docs-v2/01-migration-strategy.md` §2) is honoured trivially because nothing about persistence changes.

## 9. ADRs

**No new ADR required.** M10 proves existing decisions (ADR-0002/0003/0009/0010, security model). The
`adr/` folder documents this mapping explicitly so a reviewer can confirm no decision was skipped.

## 10. Testing strategy (the core of M10)

M10 *is* a testing milestone. Every guarantee becomes an adversarial suite in CI:

- **Chaos matrix** — `kill -9` injected at each Work Order state transition and each DB write boundary;
  assert exactly-once effect and full resume.
- **Corruption corpus** — deliberately damaged DB pages, truncated WAL, one flipped hash byte; assert
  detection names the first bad sequence and projection rebuild recovers.
- **Migration rehearsal** — a fixture Vault per historical schema version; assert the current binary opens
  each and migrates forward without touching column meaning.
- **Round-trip** — export → wipe → import → assert Brief/Decision/artifact set is identical and redaction ran.
- **Injection corpus** — the 60 payloads (security model §11) embedded in fixtures; assert 0 tool grants,
  100% flag.
- **Performance gates** — cold start, frame rate, idle memory, each with a recorded budget and a CI failure
  on regression.

## 11–13. Epics / Tasks / Subtasks

See `IMPLEMENTATION_PLAN.md` (E1–E8).

## 14. Acceptance criteria

| # | AC | Verification |
|---|---|---|
| AC1 | `kill -9` at every Work Order transition resumes with no lost or duplicated effect | chaos matrix green |
| AC2 | A corrupted page/truncated write/broken hash is detected; `audit.verify` names the first bad sequence; projections rebuild | corruption corpus green |
| AC3 | The current binary opens and forward-migrates a Vault from every prior schema version | migration rehearsal green |
| AC4 | A full export re-imports with identical Briefs/Decisions/artifacts and redaction applied; the export lists its contents before writing | round-trip test green |
| AC5 | The prompt-injection corpus scores 100% flag / 0% tool-grant against the full M9 surface | security review #2 report |
| AC6 | Keys never appear in any prompt, log, or event; the runtime scan finds none | key-leak scan green |
| AC7 | Cold start ≤1.2 s, sustained 60 fps, idle ≤400 MB, verified as CI gates | perf harness green |
| AC8 | The app refuses an unsigned or downgraded update | update-integrity test green |
| AC9 | Principal-facing documentation exists for install, recovery, export, and lock/unlock | docs review |
| AC10 | Thirty days of dogfooding recorded with zero data-loss, zero unlogged effects; every defect fixed or accepted in writing | dogfood log + defect register |

## 15. Review checklist

See `REVIEW_CHECKLIST.md`.

## 16. Exit criteria

The exit criterion is AC10, gated by AC1–AC9. All must be green; the 30-day dogfood is the final gate and
cannot be shortened, because the guarantees M10 proves are the ones that only fail under real, sustained use.

## 17. Testing strategy

§10. Every suite runs on every commit for M10 and remains in CI permanently (they are the 1.0 regression
floor for all later releases).

## 18. CI changes

Add: chaos matrix job, corruption corpus job, migration rehearsal job, round-trip job, injection corpus job,
perf regression job (with recorded budgets), release-signing + update-integrity job. All are blocking.

## 19. Workspace changes

Add `infrastructure/release` to the workspace if not present. **Add the M1–M9 crates and packages to
`[workspace] members`** — the verification audit found only `services/mission` and `services/connectors` are
members; a 1.0 hardening milestone cannot pass `cargo check --workspace` while the substrate it hardens is
outside the workspace. This is a prerequisite task (E0).

## 20. Repository structure

```
infrastructure/
├── testing/
│   ├── chaos/                  crash matrix (extends existing)
│   ├── corruption/             NEW — corruption corpus
│   ├── migration-rehearsal/    NEW — per-version schema fixtures
│   ├── roundtrip/              NEW — export/import
│   ├── injection/              the 60-payload corpus (security model §11)
│   └── perf/                   NEW — recorded budgets + regression gate
└── release/
    ├── installer/              NEW — per-platform installers
    ├── signing/                NEW — Ed25519 manifest signing
    └── update/                 NEW — update channel + downgrade refusal
docs/principal/                 NEW — Principal-facing documentation
```

## 21. Risks

| # | Risk | Mitigation |
|---|---|---|
| HR-1 | M1–M9 do not compile (no toolchain to date) | E0 restores workspace membership and a green build before any hardening; M10 cannot start otherwise |
| HR-2 | Idle-memory budget exceeded at 1.0 | profile and reduce; do not raise the budget (v1 rule) |
| HR-3 | A corruption case recovers lossily | treat as a release blocker; Principle 3 forbids silent loss |
| HR-4 | 30-day dogfood surfaces a data-loss defect late | the clock restarts on any data-loss incident — the criterion is zero, not few |

## 22. Implementation notes

M10 is where the workspace is made whole (E0). Every later milestone (M11–M16) assumes a green
`cargo check --workspace`; that assumption is established here. Do not treat E0 as optional cleanup — it is
the precondition for every build-verification step in the mission brief.
