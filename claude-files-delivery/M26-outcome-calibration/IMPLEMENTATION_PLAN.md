# Outcome Calibration — Implementation Plan

**Milestone M26 · crate `sidra-calibration` · for AntiGravity**

| | |
|---|---|
| Architecture | `OUTCOME_CALIBRATION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0069 (revertible projection, never telemetry) · 0070 (numbers, never structure) · 0071 (applied only if it narrows; inspectable) |
| Crate | `sidra-calibration` at `services/calibration/` |
| Depends on | `sidra-store`, `sidra-security`, `sidra-domain`; reads the M15 `mission_outcomes` projection through the store |
| Must not depend on | `sidra-orchestrator`, `sidra-connectors`, `sidra-mission` (runtime), or any network crate (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. Section, AC, and migration references (`§`, `AC`, `0057`–`0060`) point into
`OUTCOME_CALIBRATION_ARCHITECTURE.md`.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4 and the M16/M25 plans, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Outcome-record ingestion & the sample model | the vocabulary + the `EstimateErrorSample` materialised from M15 outcome records; migration `0058` |
| E2 | The estimate-error metric & walk-forward baseline | `EE`/`bias`/`band_coverage`, per-estimand floors, walk-forward partitioning (ADR-0071, §4) |
| E3 | The calibration computation & held-out apply gate | candidate corrections, novelty map, risk weights; clamps + `M_min`; the held-out narrowing guard; the run pipeline (§5, §7) |
| E4 | Versioned, revertible parameter store | the projection planning reads; apply/revert; version 0 identity; rebuild; migrations `0057`, `0060` (ADR-0069, §8) |
| E5 | Inspection surface (provenance) | `CalibrationRun` + `Adjustment` with `sample_ids`; the inspect/report queries; migration `0059` (§6.5, §10) |
| E6 | Local-only / no-egress guarantees | the two redundant no-egress proofs, numeric-only, dependency-direction CI (ADR-0069, ADR-0070, §13) |
| E7 | The 50-Mission acceptance (the exit criterion) | the fixture and the narrows·inspectable·revertible proof — **the last thing green** (§19, §20) |

### 0.4 Recommended implementation order

```
E1 ──► E2 ─────────────────┐
   │                       ├──► E3 ──► E5 ──┐
   └──► E4 ────────────────┘         │      ├──► E7
                     E4 ─────────────┘      │
   E6 (no-egress · numeric-only · dep-direction CI) runs alongside E1–E5 ──┘
```

E1 first — the value objects, the `OutcomeRecord` read model, and the `EstimateErrorSample` everything else
types against. E2 next — the metric over those samples. **E4 (the store) lands before E3's apply step**, because
a run needs a versioned place to write an `Applied` parameter set and version 0 (the identity) must be seeded
before anything reads `active_parameters()`. E3 then assembles E1+E2+E4 into the run pipeline whose held-out
guard applies a candidate only if it narrows. E5 records the provenance of what E3 did. **E6 runs alongside
from E1 onward** — the no-egress closure check, the numeric-only check, and the dependency-direction check are
CI gates that should be red before the first non-conforming line is written, not bolted on at the end. E7 closes
the milestone; **its final task, the exit-criterion test (T7.10 — error narrows, inspectable, revertible), is
the last thing to go green.**

---

## E1 — Outcome-record ingestion & the sample model

### Purpose
The vocabulary every other epic types against, plus the one input to calibration: the `EstimateErrorSample`
materialised from the M15 outcome records. Calibration reads `mission_outcomes`; it never writes or mutates it.

### Scope
In: value objects and the `OutcomeRecord` read model in `packages/domain` / `services/calibration/domain`; the
`ingest` module; migration `0058_estimate_error_samples.sql`; the `EstimateErrorSampled` event. Out: the metric
(E2), the candidate computation (E3).

### Dependencies
`sidra-domain`; `sidra-store` (the `mission_outcomes` projection is read-only here — M15 owns it).

### Public APIs
Internal: `ingest(window) -> Vec<EstimateErrorSample>`. No external command; ingestion is a step of a run (E3).

### Acceptance criteria
One `EstimateErrorSample` per concluded Mission × estimand × Task; each cites the **frozen** plan version
(ADR-0023); the samples table is rebuildable from `mission_outcomes`; the read model has no write path.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-calibration` crate: module skeleton, `Cargo.toml`, CI wiring, dependency-direction check stub | S | — | `services/calibration/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-calibration → sidra-orchestrator`, `→ sidra-connectors`, `→ sidra-mission`, or any network crate (AC13) |
| **T1.2** | Value objects: `MissionId`, `TaskSignature`, `Estimand{Cost,Duration,Effort}`, `EstimateSource{Department,Historical,Heuristic}`, `ParameterVersion(u64)`, `CalibrationRunId` (ULID) | S | T1.1 | `domain/values.rs` | `ParameterVersion(0)` is the identity marker; `Estimand`/`EstimateSource` total; property tests over each |
| **T1.3** | `OutcomeRecord` read model over `mission_outcomes` — read-only, never written | S | T1.2, `sidra-store` | `ingest/read_model.rs` | Reads `mission_outcomes` (§6.2 fields); exposes no mutator; a write attempt does not compile |
| **T1.4** | `0058_estimate_error_samples.sql` migration | S | T1.1 | `services/store/migrations/` | Forward-only, idempotent, independently deployable; row shape per §12.1; rebuildable from `mission_outcomes` |
| **T1.5** | `EstimateErrorSample` materialisation: per concluded Mission × estimand × Task; `r`/`abs` with per-estimand ε floors; `within_band`; `concluded_at` for ordering | M | T1.3, T1.4 | `ingest/sample.rs` | One sample per estimand × Task; cites frozen `plan_version` (ADR-0023); `actual` from the outcome record; §4.1 formula exactly |
| **T1.6** | `EstimateErrorSampled` event + serde round-trip; lands on the existing hash chain | S | T1.5 | `domain/events.rs` | Carries mission_id, plan_version, estimand, signature, p50/p90, actual, signed/abs error, within_band (§11); schema snapshot committed |

---

## E2 — The estimate-error metric & walk-forward baseline (ADR-0071)

### Purpose
The metric the exit criterion turns on: `EE` (median absolute relative error), `bias`, `band_coverage`, with
per-estimand floors, computed **walk-forward** with no lookahead.

### Scope
In: the `metric` module — aggregation, floors, walk-forward partitioning, the trailing-window comparison. Out:
the candidate computation that *uses* the metric to backtest (E3).

### Dependencies
E1.

### Public APIs
Internal: `metric(samples) -> CalibrationMetric`; `walk_forward_partition(samples, W)`; `narrowed(before, after,
δ) -> bool`.

### Acceptance criteria
`EE` is the **median** absolute relative error (not a mean), per estimand, with declared per-estimand floors,
computed walk-forward so no sample is scored using a parameter derived from a later-concluded Mission (AC2).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `EE`/`bias`/`band_coverage` over a sample set: median via selection; per-estimand breakdown | M | E1 | `metric/aggregate.rs` | Matches hand-computed values on a tiny fixture; a single 10× outlier does not dominate `EE` (median, §4.2, AC2) |
| **T2.2** | Per-estimand floors `ε_k` (`cost`=$0.01, `duration`=1 s, `effort`=1 unit) as declared constants | S | T2.1 | `metric/floors.rs` | A near-zero estimate does not blow up relative error; floors are declared constants, not tuned (§4.1) |
| **T2.3** | Walk-forward partitioning: order by `concluded_at`; attribute Mission `m`'s error to parameters as of just before `m` concluded | M | T2.1 | `metric/walk_forward.rs` | No sample scored with a parameter derived from a later-concluded Mission (no lookahead, §4.3); property test |
| **T2.4** | `CalibrationMetric` type + `window_w`; the disjoint trailing-window `NARROWED` predicate | S | T2.3 | `metric/window.rs` | `NARROWED ⟺ EE(last W) ≤ (1−δ)·EE(first W)` (§4.3); `δ` (0.10) and `W` (25) declared and recorded in the run |

---

## E3 — The calibration computation & held-out apply gate (ADR-0071)

### Purpose
The one pass of arithmetic that produces a candidate parameter set — estimate corrections, novelty mapping, risk
weights — and the held-out narrowing guard that applies it **only if** it narrows. No inference, no model, no
randomness (§7.1): a run is a pure function of the records it read plus the declared constants.

### Scope
In: the `compute` module (the three targets, clamps, `M_min`), the held-out narrowing guard, and the `runner`
pipeline (§5). Out: versioned storage (E4, which E3 writes through), provenance recording (E5), the no-egress
guarantees (E6).

### Dependencies
E1, E2, E4 (a run needs the store to write an `Applied` version).

### Public APIs
`run_calibration(window?) -> CalibrationRun` — a new version **iff** it narrows, else a recorded rejection.
There is **no** `apply` command (§10.1).

### Acceptance criteria
Candidates are clamped (§7.2); a signature/parameter with `< M_min = 5` samples keeps its prior value; a
candidate is applied only if held-out `EE` narrows by `δ`, else `Rejected`; the safety structure (§7.3) is not
expressible in the schema the computation writes.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Estimate corrections: per-signature `c = median(actual / raw_p50)`, `s` from p90/p50 dispersion; clamp `c ∈ [1/K, K]` (K=4), `s ≥ 1.0` | M | E2 | `compute/estimates.rs` | `c`/`s` clamped; `clamped` flag set on a bound hit (§7.2); a signature `< M_min` keeps the identity (`c=1, s=raw`) |
| **T3.2** | Novelty mapping: interior breakpoints `n∈1..4` from comparable-count vs outcome variance; `n=0 → 3` fixed; monotonic non-increasing | M | E2 | `compute/novelty.rs` | `n=0 → 3` always; mapping monotonic; never below the fixed endpoints; no field for the endpoint exists (§3.2, AC7) |
| **T3.3** | Risk weights: weighted mean over the four `mean`-dimensions; `Σw = 1`, each `≥ w_floor = 0.10`; `max(reversibility, blast_radius)` untouched | M | E2 | `compute/risk.rs` | `Σw = 1`; no weight below `w_floor`; the `max` term, `⊕` combinator, and risk bands are **not representable** in the schema (§3.3, §7.3, AC7) |
| **T3.4** | `M_min` sample floor: `< 5` matched samples ⇒ prior retained; a run over `< 50` Missions records `Insufficient{needed, had}` | S | T3.1–T3.3 | `compute/threshold.rs` | `Insufficient` recorded; parameters unchanged; exactly pre-M26 behaviour (§7.5, AC9); `M_min=5` matches M15 §11.2 |
| **T3.5** | Held-out narrowing guard: backtest the candidate walk-forward; apply iff `EE(after) ≤ (1−δ)·EE(before)`, else `Rejected{would_not_narrow}` | M | T3.1–T3.4, E2, E4/T4.2 | `guard/held_out.rs` | A worsening candidate is `Rejected` and `active_parameters()` is unchanged (§7.4, AC8); no `apply` path can force a candidate active |
| **T3.6** | `runner` pipeline: `Gathering → Computing → Backtesting → Applied \| Rejected`; serialise concurrent runs; emit `CalibrationRun` | L | T3.5, E4 | `runner/mod.rs` | State transitions match §5.2; two runs cannot activate two versions (F6); a run is a pure function of records + constants (§5.3.3, supports AC12) |

---

## E4 — Versioned, revertible parameter store (ADR-0069)

### Purpose
The `CalibrationParameterSet` the Mission Engine reads at plan time — a versioned projection, not mutable state.
Version 0 is the identity (pre-M26 behaviour); apply appends a version and moves the `active` pointer; revert
re-activates a retained prior version exactly.

### Scope
In: the `store` module; migrations `0057_calibration_parameters.sql` (seeds version 0) and
`0060_calibration_weights.sql`; `active_parameters()`/`revert_calibration()`/`list_parameter_versions()`; the
`CalibrationApplied`/`CalibrationReverted` events; the `parameters.md` Vault mirror; projection rebuild. Out:
the run that produces a candidate (E3, which writes through this store).

### Dependencies
E1; `sidra-store`; `sidra-security` (`run`/`revert` are Decisions — logged, attributed, permanent).

### Public APIs
`active_parameters() -> CalibrationParameterSet`; `revert_calibration(to_version) -> CalibrationParameterSet`;
`list_parameter_versions() -> [ParameterVersion]`.

### Acceptance criteria
Exactly one active version at a time; version 0 seeded at `0057` so `active_parameters()` is defined from the
first boot; revert restores the prior version **byte-for-byte**; the active parameters are rebuildable from the
outcome records + the run log.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `0057_calibration_parameters.sql` (seeds version 0 identity) + `0060_calibration_weights.sql` | M | E1/T1.1 | `services/store/migrations/` | Forward-only, additive, independently deployable; version 0 seeded so `active_parameters()` is defined from first boot (G9) |
| **T4.2** | `CalibrationParameterSet` type + store write: new version (`supersedes`, `active=true`), clear prior `active`; single writer | M | T4.1 | `store/params.rs` | Exactly one active version; `Applied` **appends**, never overwrites; the prior version persists byte-for-byte (§5.3.2, §8.2) |
| **T4.3** | `active_parameters()` query: indexed lookup of the active version; identity if never calibrated | S | T4.2 | `store/read.rs` | Constant-time single lookup (§14); returns version 0 when no run has applied (AC10) |
| **T4.4** | `revert_calibration(to_version)`: re-activate a retained prior version; a Principal Decision; emit `CalibrationReverted` | M | T4.2, `sidra-security` | `store/revert.rs` | Post-revert parameters `==` the pre-run snapshot, byte-for-byte (§8.3, AC4); logged, attributed, permanent |
| **T4.5** | `CalibrationApplied`/`CalibrationReverted` events + `parameters.md` Vault mirror (on transitions, not continuously) | S | T4.2, T4.4 | `domain/events.rs`, `mirror/params.rs` | Pointer-move events on the hash chain (§11); the mirror holds numbers only — no secret, no capability (§12.3) |
| **T4.6** | Projection rebuild: replay the run log → active parameters; the rebuild-and-diff assertion | M | T4.2, E3/T3.6 | `store/rebuild.rs` | Replaying runs (same clamps, same guard) reproduces the live projection (§8.4, AC12); a mismatch fails the test (F7) |

---

## E5 — Inspection surface (provenance)

### Purpose
The whole content of "inspectable": every applied adjustment records old/new/statistic and the exact
`sample_ids` it aggregated, and the queries a Principal inspects and reports with. A rejected candidate is
recorded in full but never governs planning.

### Scope
In: the `provenance` module; migration `0059_calibration_runs.sql` (+ `calibration_adjustments`);
`inspect_calibration`/`estimate_error_report`/`list_calibration_runs`; the `CalibrationRun`/`CalibrationRejected`
events; the `runs/` and `error-report.md` Vault mirror. Out: the computation itself (E3).

### Dependencies
E3, E4.

### Public APIs
`inspect_calibration(version?) -> CalibrationRun + Adjustments`; `estimate_error_report(window) ->
CalibrationMetric×2`; `list_calibration_runs() -> [CalibrationRun]`.

### Acceptance criteria
Inspection is **total**: every applied adjustment resolves to `sample_ids` that reproduce its statistic; a
rejected candidate is inspectable but leaves `active_parameters()` unchanged; every run/apply/reject/revert is
an audited event on the hash chain.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `0059_calibration_runs.sql` (+ `calibration_adjustments`) migration | M | E1/T1.1 | `services/store/migrations/` | Stores run, window, from/to version, outcome, metric before/after; per-adjustment old/new/statistic/sample_count and the sample ids (§12.1) |
| **T5.2** | `Adjustment` recording: each applied number cites the exact `sample_ids` it aggregated + the `clamped` flag | M | E3/T3.6, T5.1 | `provenance/adjustment.rs` | `recompute(sample_ids) == statistic` for every applied adjustment (§6.5, AC3) |
| **T5.3** | `inspect_calibration(version?)` — total: every adjustment traceable; a rejected candidate visible but never active | M | T5.2 | `provenance/inspect.rs` | Inspection totality (AC3); a `Rejected` candidate is inspectable and `active_parameters()` is unchanged (§10.3 rule 4, AC8) |
| **T5.4** | `estimate_error_report(window)` + `list_calibration_runs()`: before/after `EE`/`bias`/`band_coverage` per estimand; full applied + rejected history | S | T5.1, E2 | `provenance/report.rs` | Metrics per estimand (§10.2); rejected runs listed with their metrics |
| **T5.5** | `CalibrationRun`/`CalibrationRejected` events + `runs/*.md` and `error-report.md` Vault mirror | S | T5.1 | `domain/events.rs`, `mirror/runs.rs` | `audit.verify` passes over a calibration-lifecycle fixture (AC11); mirror written on transitions only (§12.3) |

---

## E6 — Local-only / no-egress guarantees (ADR-0069, ADR-0070)

### Purpose
The guarantees that make M26 safe as the first 4.0 milestone: nothing leaves the machine (two redundant proofs),
calibration writes numbers only, and the crate keeps its forbidden dependency edges absent. These are CI gates
and a runtime guard, not business logic.

### Scope
In: the `guard` module's no-egress runtime assertion; the compile-time closure check, numeric-only check, and
dependency-direction check in `infrastructure/ci/`; the auto-export exclusion. Out: the metric/compute/store
logic those checks protect.

### Dependencies
E1 (the crate exists); E3 (a run to guard); E4 (the schema to check).

### Public APIs
None new; a runtime guard wraps `run_calibration`/`revert_calibration`/ingestion.

### Acceptance criteria
No HTTP/socket crate anywhere in the transitive closure (compile-time); a run that opens a socket aborts with an
audited failure (runtime); the crate has no dependency on any capability/Standard/Guard/department write API and
the parameter schema exposes no non-numeric field; no forbidden dependency edge.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Compile-time no-egress closure check: walk the transitive dependencies; fail the build on any HTTP/socket crate | S | E1 | `infrastructure/ci/` | Build fails on any network dependency in `sidra-calibration`'s closure (§13.1, AC5) — same shape as the forbidden-edge check |
| **T6.2** | Runtime no-egress assertion: guard around `run`/`revert`/ingest aborts on a socket open and raises an audited failure | M | T6.1, E3 | `guard/no_egress.rs` | A run that opens a socket aborts; packet-capture-verifiable on ADR-0009's standard (§13.1, AC5, F3) |
| **T6.3** | Numeric-only check: no crate dependency on capability/Standard/Guard/department write APIs; the parameter schema exposes no non-numeric field | S | E4 | `infrastructure/ci/` | A hypothetical structural-write edge fails the build; the schema has no `capability`/`forbidden`/`standard`/`guard`/`department`/`ceiling` field (§13.3, AC6, F5) |
| **T6.4** | Dependency-direction check: no edge `sidra-calibration → sidra-orchestrator`/`sidra-connectors`/`sidra-mission` (runtime); the parameter store is the only seam | S | E1 | `infrastructure/ci/` | Build fails on any such edge (§9, AC13) |
| **T6.5** | Auto-export exclusion: outcome records, error samples, and parameters excluded from any diagnostics bundle | S | E4 | `store/export_policy.rs` | Samples/parameters never enter an automatic export; only the Principal's explicit, redacted, previewed export (ADR-0009, §13.1) |

---

## E7 — The 50-Mission acceptance (narrows · inspectable · revertible)

### Purpose
The exit criterion, made a test. **The last thing to go green.** A deterministic 50-Mission fixture with a known
injected bias, and the proof that estimate error narrows measurably with calibration on (and not with it off),
that every adjustment is inspectable, and that a revert restores prior parameters exactly.

### Scope
In: the 50-Mission fixture, the error-narrowing proof, and the named tests covering AC1–AC13. Out: M27 charter
evolution, M28 procedural compilation, M29 self-review — they *consume* this substrate and are not exercised
here (§20.3).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC13 each covered by a named test; the error-narrows + inspectable + revertible proof (AC1 + AC3 + AC4) is
the last test to pass.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | The 50-Mission fixture: deterministic synthetic outcome records with a **known injected systematic bias** (cost under-estimated by a consistent factor + a too-narrow spread); fully local, no secret | M | E1–E3 | `infrastructure/testing/calibration/fixture.rs` | Deterministic; the injected bias makes the true narrowing large and unambiguous; the substrate for AC1/AC2/AC12 (§20.1) |
| **T7.2** | Metric-stability property test: `EE`/`bias`/`band_coverage` vs hand-computed values; per-estimand floors bound near-zero estimates | S | E2, T7.1 | `.../metric_stability.rs` | AC2 |
| **T7.3** | Inspection-totality test: `recompute(sample_ids) == statistic` for every applied adjustment | S | E5, T7.1 | `.../inspection.rs` | AC3 |
| **T7.4** | Revert-exactness test: pre-run snapshot `==` post-revert parameters, byte-for-byte | S | E4 | `.../revert_exact.rs` | AC4 |
| **T7.5** | Worsening-guard test: a poisoned fixture yields `Rejected` and an unchanged active version | S | E3 | `.../worsening.rs` | AC8, F2/F4 |
| **T7.6** | Insufficient-samples & additivity tests: `< M_min` ⇒ identity retained; `< 50` Missions ⇒ `Insufficient`; version-0 planning `==` pre-M26 planning | M | E3, E4 | `.../insufficient.rs`, `.../additivity.rs` | AC9, AC10 |
| **T7.7** | Safety-invariance test: risk `max` term, novelty endpoint (`n=0 → 3`), and non-zero weights hold before and after a calibration | S | E3 | `.../safety_invariance.rs` | AC7, TC-5 |
| **T7.8** | Rebuild-and-diff + `audit.verify` test: replay runs `==` live projection; every run/apply/reject/revert audited on the chain | M | E4, E5 | `.../rebuild_diff.rs`, `.../audit_verify.rs` | AC12, AC11 |
| **T7.9** | No-egress runtime harness: a run under a socket guard aborts on a socket open; the compile-time closure check is green | S | E6 | `.../no_egress.rs` | AC5, F3 |
| **T7.10** | **The exit-criterion test — the last thing green:** over the 50-Mission fixture, walk-forward `EE(last W) ≤ (1−δ)·EE(first W)` with calibration on and **no** such narrowing with calibration off; the applied calibration is inspectable (every adjustment traces to its samples) and revertible (a revert restores prior parameters exactly) | M | T7.1–T7.9 | `.../exit_criterion.rs` | **AC1 + AC3 + AC4 in one lifecycle** — proven by test, not configuration; last of all (§19, §21 E7) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | ingestion + the `EstimateErrorSample` model + migration `0058` |
| E2 | the estimate-error metric + walk-forward baseline (ADR-0071) |
| E3 | the calibration computation + held-out apply gate + run pipeline (ADR-0071) |
| E4 | the versioned, revertible parameter store + migrations `0057`, `0060` (ADR-0069) |
| E5 | the inspection surface + provenance + migration `0059` |
| E6 | the no-egress / numeric-only / dependency-direction guarantees (ADR-0069, ADR-0070) |
| E7 | the 50-Mission acceptance — narrows · inspectable · revertible (the exit criterion) |
