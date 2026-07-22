# Charter Evolution — Implementation Plan

**Milestone M27 · crate `sidra-evolution` · for AntiGravity**

| | |
|---|---|
| Architecture | `CHARTER_EVOLUTION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0072 (regressing revision refused; acceptance is a Principal Decision) · 0073 (eval set is the versioned merge gate; proposer ≠ reviewer) |
| Crate | `sidra-evolution` at `services/evolution/` |
| Depends on | `sidra-security` (Broker, actor/Seat, redaction), `sidra-store`, `sidra-departments` (archetypes, Registrar), `sidra-decisions`, `sidra-domain` (`Charter`, `Charter::relation_to`), and the M26 outcome-record read surface `sidra-calibration` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced) |
| Gated on | **M26** — evaluation-run scoring and proposal provenance read from M26's outcome-record surface, which must exist first (dependency **D-1**, `00-M26-AUDIT.md`; architecture §16.1). E2 is the gated epic. |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens ADR-0072 or ADR-0073, and no task re-decides ADR-0033 (the partial order), ADR-0014 (archetype
freezing), or the Decision engine — M27 reuses them unchanged (architecture §1.5).

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4, unchanged)

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
| E1 | Charter-revision domain model & versioning link | the vocabulary: ids, `CharterRevision`, `Provenance`, the candidate `Charter` shape, the `agent_versions` link — data, never code |
| E2 | Evaluation sets & evaluation runs (**gated on M26, D-1**) | the gate's corpus: attach-and-version an eval set, run a charter candidate/baseline over it, produce an inspectable `Score` |
| E3 | The regress gate (ADR-0033 partial order) | fold eval scores + `relation_to` into a `RevisionVerdict`; the §8 refusal reasons; widening refused in the automatic path |
| E4 | Propose → Principal-confirm Decision flow | the propose→confirm authorization path (§9): eligibility, Seat check, the Decision, the sole version write |
| E5 | Persistence, events & Vault mirror | migrations `0061`–`0063`, the `CharterRevisionEvent` variants, the Markdown mirror |
| E6 | Conformance suite — regress-refused / accept-is-a-Decision | the exit criterion made two fixtures, plus the AC coverage; **the last thing to go green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──┐
        │          ├──► E4 ──► E6
        └──────────┘
   E5 runs alongside E2–E4 (schema before the stores write to it)

E2 is gated on M26's read surface (D-1). Until sidra-calibration exists, E2's
scoring wires against the M26 contract behind one module (evalrun) and is the
milestone's completion gate — architecture §16.1, §16.3 ER-6.
```

E1 first (everything types against it). E2 next (nothing gates without a run and a score); E2's provenance and
scoring read from M26, so E2 is the epic D-1 bounds. E3 needs E2 (the gate compares two runs) and reuses
ADR-0033 from `sidra-domain`. E4 needs E3 (only an `AwaitingPrincipal` verdict is confirmable) and the Decision
engine. E5 lands the schema just ahead of the stores' writes. E6 closes the milestone; **E6 is the exit
criterion and the regress-refused / accept-is-a-Decision proof must be the last thing green** (architecture
§18.1, Appendix C).

---

## E1 — Charter-revision domain model & versioning link

### Purpose
The vocabulary every other epic types against: the ids, the `CharterRevision` proposal, its required
`Provenance`, the candidate `Charter` shape (data, not code), and the link to `agent_versions`.

### Scope
In: value objects and aggregates in `services/evolution/domain` (per the crate's dependency rules), the
proposal-validation checks that need no baseline (§5.3 checks 1–5), and the proposer that is the *only* writer
of a `Proposed` revision. Out: the eval run and the authority relation (E2/E3 — they need the baseline);
persistence (E5).

### Dependencies
`sidra-domain` (`Charter`, `Relation`, `Charter::relation_to` from ADR-0033); `sidra-departments`
(`ArchetypeId`, `CharterVersion` semantics over `agent_versions`, the Registrar — confirm before duplicating
any type).

### Public APIs
`propose_charter_revision(archetype, candidate, provenance) -> Result<RevisionId, RefuseReason>` — the caller
is the evolution engine; constructors for each type reject invalid construction; no mutator on a `Charter`.

### Acceptance criteria
Every type rejects invalid construction; a `CharterRevision` cannot be constructed without `Provenance`; a
`proposed_by` that is an archetype instance is refused (author ≠ reviewer, ADR-0073); the candidate is data
only — a revision carrying an executable hook, a network address, or a credential is refused by the redaction
scan (§5.3 check 5).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-evolution` crate: manifest, module skeleton (proposer/revision/evalset/evalrun/gate/confirm/provenance/events/mirror/conformance), CI wiring, dependency-direction check | S | — | `services/evolution/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-evolution → sidra-orchestrator` or `→ sidra-mission` (AC12; architecture §18.5) |
| **T1.2** | Value objects: `ArchetypeId`, `RevisionId`, `CharterVersion(u32)`, `EvalSetId`, `EvalSetVersion(u32)`, `EvalRunId`, `Score(f64 in [0,1])`, `DecisionId` | S | T1.1 | `domain/values.rs` | `Score` rejects values outside `[0,1]`; ids opaque; property tests; reuse `sidra-domain` types where they exist rather than duplicate |
| **T1.3** | `RevisionStatus` enum: `Proposed \| Evaluating \| Refused{reason} \| AwaitingPrincipal \| Confirmed \| Rejected`; `RefuseReason` ∈ {EvalRegression, NoEvaluationSet, WrongArchetype, Widening, NoProvenance} | S | T1.2 | `domain/status.rs` | Every §3.1 state and every §10.4 refusal reason present; `Refused`/`Rejected`/`Confirmed` marked terminal; serde round-trip |
| **T1.4** | `Provenance`: `archetype_id`, `outcome_refs[]`, `kpi_refs[]`, `rationale` — required on every revision | S | T1.2 | `domain/provenance.rs` | Cannot construct a `Provenance` with empty `outcome_refs` **and** empty `kpi_refs`; `archetype_id` field mandatory (resolution to live rows is E2/T2.5) |
| **T1.5** | `CharterRevision` aggregate: `revision_id`, `archetype_id`, `base_version`, `proposed_charter: Charter`, `provenance`, `relation_to_base: Option<Relation>` (None until Evaluating), `status`, `decision_id: Option`, `proposed_by: Actor`, timestamps | M | T1.3, T1.4 | `domain/revision.rs` | Cannot construct without `Provenance`; `relation_to_base` and `decision_id` start `None`; `proposed_charter` is the `agent_versions` charter shape (data) — carries no code field (architecture §4.2, §5.1) |
| **T1.6** | Proposal-validation checks 1–5 (well-formed against the charter schema; archetype installed & `base_version` current; `proposed_by` is the engine, **not** an archetype instance; provenance present & `archetype_id` matches; redaction scan — no hook/host/credential) | M | T1.5, `sidra-security` (redaction) | `proposer/validate.rs` | Each check has a failing fixture naming its rule; an archetype-instance `proposed_by` is refused (AC8 precursor); a candidate with an embedded credential is refused (architecture §5.3) |
| **T1.7** | `Proposer`: build a candidate `CharterRevision` from an M26 outcome signal + provenance; the **only** writer of a `Proposed` revision; holds no version-write path | M | T1.6 | `proposer/mod.rs` | Emits a `Proposed` revision only after checks 1–5 pass; there is no method on `Proposer` that writes an `agent_versions` row (architecture §6, §1.3) |

---

## E2 — Evaluation sets & evaluation runs (gated on M26, D-1)

### Purpose
The gate's corpus and the only producer of a `Score`: attach an evaluation set to an archetype and version it,
resolve provenance against M26's local outcome/KPI rows, and run a charter (candidate or baseline) over the set
at a version to produce an inspectable `EvaluationRun`.

### Scope
In: `register_evaluation_set` (a logged act under author ≠ reviewer), the versioned `EvaluationSet`/
`EvaluationCase`/`ScoringSpec`, provenance resolution against the M26 read surface, and the deterministic-where-
permitted `EvalRunner`. Out: the fold into a verdict (E3); the confirm path (E4); persistence (E5).

### Dependencies
E1; **M26's outcome-record read surface `sidra-calibration`** (dependency D-1 — provenance resolution and any
outcome-motivated scoring read from it; until it lands, wire against the M26 registry-pinned contract behind
the `evalrun`/`provenance` modules only, architecture §16.1); local models (the same the Firm already uses,
architecture §16.2 assumption 3). **No network** (ADR-0009).

### Public APIs
`register_evaluation_set(archetype, cases, scoring) -> EvalSetVersion`; `run_evaluation_subject(charter,
eval_set@version, seed) -> EvaluationRun`; provenance resolution `resolve(provenance) -> Result<(),
RefuseReason>`.

### Acceptance criteria
An eval set is bound one-to-one to its archetype and versioned; an archetype cannot author the set that gates
it (author ≠ reviewer); a run is pinned to its `eval_set_version` and is inspectable per-case; provenance
resolves to existing local rows for **this** archetype or is refused `WrongArchetype`/`NoProvenance`; no network
during a run.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `EvaluationSet` + `EvaluationCase` + `ScoringSpec` types: `eval_set_id`, `archetype_id` (one-to-one), `eval_set_version`, `cases[]`, `scoring_spec{weights, determinism, seed}`, `registered_at/by` | S | E1 | `evalset/types.rs` | Set bound to exactly one archetype; `scoring_spec` folds per-case results to an aggregate `Score`; property test over the fold (architecture §4.4, §4.5) |
| **T2.2** | `register_evaluation_set`: register and version a set; a logged act; author ≠ reviewer — an archetype-instance actor authoring the set that gates it is refused | M | T2.1, `sidra-security` (Broker/Seat) | `evalset/register.rs` | Registration is logged; re-registration bumps `eval_set_version`; an archetype authoring its own gate is refused (F10; ADR-0073; architecture §14) |
| **T2.3** | `EvaluationRun` type + `EvalRunner`: execute a charter (`subject_kind = Baseline \| Candidate`) over an eval set@version, seeded where the grader is deterministic; produce `aggregate_score` + inspectable `per_case[]` | M | T2.1 | `evalrun/run.rs` | A run is the only producer of a `Score`; pinned to `eval_set_version`; per-case results stored and inspectable (mirrors M26's guarantee); same seed → same score where grader permits (architecture §4.5, §8.2) |
| **T2.4** | Baseline caching per `(eval_set_version, base_version)`; off-hot-path scheduling; bounded, cancellable run budget (over-long run → verdict withheld) | M | T2.3 | `evalrun/schedule.rs` | A baseline is computed once and reused; an evaluation run never blocks a Mission or the scheduler (G8); a timed-out run withholds its verdict, never errors into a merge (F4; architecture §15) |
| **T2.5** | Provenance resolution against the M26 read surface (`sidra-calibration`): `outcome_refs` → `mission_outcomes` rows, `kpi_refs` → `agent_kpi_samples` rows, all for **this** archetype (**D-1 gate**) | M | T1.4, `sidra-calibration` | `provenance/resolve.rs` | Refs resolve to existing local rows for the revision's archetype, else `Refused{NoProvenance}`; a foreign archetype's refs → `Refused{WrongArchetype}` (T-E6, T-E7; architecture §8.5) |
| **T2.6** | No-network guarantee over a run: eval runs use local models over a local corpus; nothing reaches the network | S | T2.3 | `evalrun/tests/no_network.rs` | A full run completes in a network-denied sandbox (AC10; ADR-0009; architecture §18.4) |

---

## E3 — The regress gate (ADR-0033 partial order)

### Purpose
The one mechanical step that turns two runs and an authority comparison into exactly one `RevisionVerdict` —
refusing a regression or a widening before any Principal involvement. ADR-0072 in mechanism.

### Scope
In: `run_evaluation(revision)`, the fixed-order §8 gate (preconditions → eval comparison → authority
comparison → provenance/archetype binding), the ADR-0033 `relation_to` call site and the authority-bearing
field mapping, and the four-way verdict. Out: the eval run itself (E2); confirmation (E4).

### Dependencies
E1, E2; `sidra-domain` (`Charter::relation_to`, ADR-0033, reused unchanged — M27 adds a call site, it does not
re-decide the order).

### Public APIs
`run_evaluation(revision) -> RevisionVerdict` where `RevisionVerdict ∈ {Refused{reason}, AwaitingPrincipal}` —
the gate never accepts; `AwaitingPrincipal` is *eligible*, not accepted.

### Acceptance criteria
The step order is fixed and unskippable; a candidate scoring below baseline → `Refused{EvalRegression}`; a
`Wider`/`Incomparable` relation → `Refused{Widening}` in the automatic path; no eval set → `Refused{
NoEvaluationSet}` (fail closed); the gate's only non-refusal outcome is `AwaitingPrincipal`.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Gate preconditions: resolve the archetype's **current** eval set + version; if none → `Refused{NoEvaluationSet}`; if the archetype advanced past `base_version` since propose → halt & refuse/rebase | M | E2 | `gate/precondition.rs` | No eval set fails closed (AC4; architecture §8.1, §8.4); a stale `base_version` halts the run (F5) |
| **T3.2** | Eval comparison: run Candidate + Baseline over the same `eval_set_version`, same seed; `candidate < baseline` → `Refused{EvalRegression}`; `==` passes (non-improving, non-regressing); `≥` proceeds | M | T3.1, E2/T2.3 | `gate/eval_compare.rs` | A candidate scoring below baseline → `Refused{EvalRegression}`, terminal, before any Principal (AC1 core; architecture §8.2) |
| **T3.3** | Authority-bearing field mapping (the ADR-0033 charter-field table): `capabilities`/fences, `decision_bounds.never`/`.must_escalate`, `effect_ceiling`, `departments_allowed` (empty = universal inversion) | S | E1 | `gate/authority_fields.rs` | Mapping matches architecture §5.2 verbatim; M27 declares **no** new narrowing direction — it inherits ADR-0033's table (architecture §5.2) |
| **T3.4** | Authority comparison via `Charter::relation_to` (ADR-0033): `relation ∈ {Same, Narrower}` + provenance present → `AwaitingPrincipal`; `{Wider, Incomparable}` → `Refused{Widening}`; provenance absent → `Refused{NoProvenance}` | M | T3.2, T3.3, `sidra-domain` | `gate/authority_compare.rs` | `Wider`/`Incomparable` refused in the automatic path (AC5; architecture §8.3, §10.3); `Incomparable` folded to widening, not "just different" (ER-2) |
| **T3.5** | Archetype-binding re-check (defence in depth): candidate `archetype_id` = eval set's = provenance's, else `Refused{WrongArchetype}` | S | T3.1, E2/T2.5 | `gate/binding.rs` | A cross-archetype revision → `Refused{WrongArchetype}` (AC6; architecture §8.5; T-E6) |
| **T3.6** | Verdict assembly: fold the four-way outcome (architecture §10.4) into one `RevisionVerdict`; the gate never accepts; every verdict lands its event (E5) | S | T3.2, T3.4, T3.5 | `gate/verdict.rs` | Only non-refusal outcome is `AwaitingPrincipal` (architecture §8.6); the compressed §10.4 table reproduced exactly by a property test |

---

## E4 — Propose → Principal-confirm Decision flow

### Purpose
The only path from an eligible revision to a charter version: the §9 authorization path, whose sole writer of an
`agent_versions` row is `confirm_revision`, and only with a Principal Seat actor and a Decision id. ADR-0072 in
mechanism.

### Scope
In: `confirm_revision` (eligibility → Seat check → base-still-current → create Decision → materialise version,
atomically), `reject_revision`, and the propose→Decision link (§4.6). Out: the gate (E3); the schema the write
lands in (E5).

### Dependencies
E3; `sidra-security` (Broker, Principal Seat actor — M21); `sidra-decisions` (the Decision engine);
`sidra-departments`/`sidra-store` (the `agent_versions` write).

### Public APIs
`confirm_revision(revision, principal) -> DecisionId`; `reject_revision(revision, principal, reason)`.

### Acceptance criteria
`confirm_revision` is the **only** version-writer; it requires an `AwaitingPrincipal` revision, a Principal Seat
actor (an agent actor refused), and the base still current; it creates a Decision (`authority: principal`,
criteria = the eval report, reversibility ≥ 2, review date) and writes one `agent_versions` row (`version =
base_version + 1`) citing the Decision id, atomically; a passing run alone produces no version.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Confirm pre-flight: revision must be `AwaitingPrincipal` (no confirm-a-refused override); `base_version` still current, else refuse/rebase | S | E3 | `confirm/preflight.rs` | A `Refused`/`Proposed`/`Evaluating`/`Confirmed`/`Rejected` revision cannot be confirmed; a stale base is refused/rebased, never overwrites a newer version (F5; architecture §9 steps 1,3) |
| **T4.2** | Actor choke point: `confirm_revision` requires a Principal Seat actor through the Broker; an agent actor is refused before anything is written | M | T4.1, `sidra-security` | `confirm/actor.rs` | An agent-actor confirm is refused structurally (AC8; GUIDE §3 item 9; architecture §9 step 2; ADR-0073) |
| **T4.3** | Create the Decision via the Decision engine: `authority: principal`, criteria = the eval report (candidate vs. baseline, per-case), reversibility ≥ 2, review date, "what would make this wrong" | M | T4.2, `sidra-decisions` | `confirm/decision.rs` | A Decision record exists with `authority: principal`; its criteria carry the eval report (AC2; architecture §9 step 4, §4.6) |
| **T4.4** | Materialise the version: write one `agent_versions` row (`version = base_version + 1`, `charter = proposed_charter`) atomically with the Decision id stamped on `CharterRevisionConfirmed`; prior versions untouched | M | T4.3, E5/T5.1 | `confirm/materialise.rs` | The **only** `agent_versions` write in the crate; new row cites the Decision id; prior rows immutable (AC2, AC9; architecture §9 step 5, §11) |
| **T4.5** | `reject_revision`: a Principal Seat records a reason; the motivating outcome data persists; terminal `Rejected` | S | T4.1, `sidra-security` | `confirm/reject.rs` | A Principal Seat rejects with a recorded reason; outcome data survives; a fresh proposal (never a retry of the rejected one) may follow (F6; architecture §12.1) |
| **T4.6** | Confirm atomicity: Decision + version + event commit together or not at all; no partial state where a version exists without its Decision | M | T4.4 | `confirm/atomic.rs` | No state has an `agent_versions` row without a Decision id on the chain (invariant §3.3.1; architecture §4.6) |

---

## E5 — Persistence, events & Vault mirror

### Purpose
Additive, forward-only schema; the domain event variants; the human-readable Markdown mirror. An archetype with
no proposed revision has zero rows and behaves exactly as pre-M27.

### Scope
In: migrations `0061`–`0063` (with the provenance child folded into `0061`), the `CharterRevisionEvent`
variants on the hash chain, the Vault mirror writer. Out: business logic (E1–E4).

### Dependencies
`sidra-store`; the M25 migrations end at `0060`, so evolution migrations start at `0061` (architecture §11.1,
Appendix B). `sidra-domain`/`sidra-security` (event actor, redaction).

### Acceptance criteria
Forward-only, idempotent, independently deployable; a null revision set is exactly pre-M27 behaviour (G10);
`agent_versions` is appended-to by `confirm`, never altered; the mirror holds no secret and no code.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `0061_charter_revisions.sql` — `charter_revisions` (`revision_id`, `archetype_id`, `base_version`, `proposed_charter` JSON, `relation_to_base`, `status`, refusal `reason`, `decision_id` nullable, `proposed_by`, timestamps) **and** the `charter_revision_provenance` child (`revision_id`, `outcome_ref`, `kpi_ref`, `rationale`) folded in-band | M | — | `services/store/migrations/` | Forward-only; idempotent; independently deployable; provenance child in the same migration to stay in the pinned band (architecture §11.1) |
| **T5.2** | `0062_evaluation_sets.sql` — `evaluation_sets` (`eval_set_id`, `archetype_id`, `eval_set_version`, `cases` JSON, `scoring_spec` JSON, `registered_at/by`) | S | T5.1 | `migrations/` | Forward-only; one archetype per set at a version; rebuildable from registration events |
| **T5.3** | `0063_evaluation_runs.sql` — `evaluation_runs` (`run_id`, `eval_set_id`, `eval_set_version`, `subject_kind`, `subject_ref`, `aggregate_score`, `per_case` JSON, `seed`, `ran_at`) | S | T5.1 | `migrations/` | Forward-only; a run pinned to `eval_set_version`; per-case results inspectable |
| **T5.4** | `CharterRevisionEvent` enum — all §11.2 variants, each with `actor`, `archetype_id`, and (where applicable) `revision_id`/`eval_run_id`/`decision_id`, on the hash chain | M | E1 | `events/mod.rs` | Every §11.2 kind present (`Proposed`, `EvaluationSetRegistered`, `EvaluationRunRecorded`, `Evaluated`, `Refused{reason}`, `AwaitingPrincipal`, `Confirmed`, `Rejected`); serde round-trip; schema snapshot committed |
| **T5.5** | Vault Markdown mirror writer (on state transitions, not continuously): `charter.md`, `evaluation-set.md`, `revisions/<id>.md`, `versions/v<n>.md` | M | T5.4 | `mirror/write.rs` | Files written on transition per architecture §11.3; no secret and no code appears; each prior version file interpretable on its own (G7) |
| **T5.6** | Additivity check: a null revision set is pre-M27 behaviour; zero rows in all four tables for an un-evolved archetype | S | T5.1–T5.3 | `migrations/tests/additive.rs` | An archetype with no proposed revision behaves exactly as pre-M27 (G10; ER-5; architecture §11.1) |

---

## E6 — Conformance suite — regress-refused / accept-is-a-Decision

### Purpose
The exit criterion, made two fixtures, plus the acceptance-criteria coverage. **The last thing to go green.**

### Scope
In: the regressing-fixture proof (AC1), the passing-narrowing-then-confirm proof (AC2/AC3), and the surrounding
AC fixtures (widening, cross-archetype, no-eval-set, agent-actor-confirm, version-immutability/replay,
no-network, audit, dependency/write-path CI). Out: any change to E1–E5 behaviour — this epic proves it.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the exit criterion (AC1 refused-at-the-gate + AC2 accept-is-a-Decision)
is proven structurally, not by configuration; the regress-refusal test is a required CI check and green last.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Accept-is-a-Decision proof: a passing, **narrowing** candidate carried through `confirm_revision`; assert the Decision record (`authority: principal`) + the `version → decision_id` link + the `CharterRevisionConfirmed` event on the chain | M | E4, E5 | `infrastructure/testing/evolution/accept_is_a_decision.rs` | AC2 — a version exists only with a citing Decision; asserted, not configured (architecture §13.2) |
| **T6.2** | No-merge-without-both proof: (a) `confirm_revision` fails on a revision with no passing run; (b) a passing run alone produces no version | M | E3, E4 | `.../no_merge_without_both.rs` | AC3 — neither gate alone merges anything (architecture §9) |
| **T6.3** | Widening-refusal fixture: a candidate that removes a Fence / raises an effect ceiling → `Refused{Widening}` at the automatic gate | S | E3 | `.../widening_refused.rs` | AC5 — a performance improvement cannot smuggle authority (architecture §8.3, §10.3, §13.3) |
| **T6.4** | Cross-archetype fixture: a revision whose eval set/provenance names a different archetype → `Refused{WrongArchetype}` | S | E3 | `.../cross_archetype.rs` | AC6 (architecture §8.5; T-E6) |
| **T6.5** | No-eval-set fail-closed fixture: an archetype with no registered set → `Refused{NoEvaluationSet}`, not a free pass | S | E3 | `.../no_eval_set.rs` | AC4 (architecture §8.4) |
| **T6.6** | Author ≠ reviewer fixture: an agent-actor `confirm_revision` is refused; only a Principal Seat confirms | S | E4 | `.../author_not_reviewer.rs` | AC8 (architecture §9 step 2; GUIDE §3 item 9) |
| **T6.7** | Version-immutability + replay fixture: a confirmed revision is a new version; prior versions immutable; a Turn recorded under the old version replays against it | M | E4, E5 | `.../version_immutability_replay.rs` | AC9 (ADR-0014 freezing; ADR-0002 append-only; `turns.agent_version`) |
| **T6.8** | Audit + local-learning coverage: `audit.verify` over a revision-lifecycle fixture; a full evaluation run in a network-denied sandbox | S | E5, E2/T2.6 | `.../audit_and_local.rs` | AC11 (every propose/evaluate/refuse/confirm/reject audited); AC10 (no-network) |
| **T6.9** | CI gate-integrity + dependency checks: no `agent_versions` write outside `confirm`; `confirm` unreachable without a passing run; no archetype id in the crate; no edge to orchestrator/mission | S | E1, E4 | `infrastructure/ci/` | AC7, AC12, G9 — build fails on a hit (architecture §18.2, §18.3, §18.5) |
| **T6.10** | **The regress-refused proof (the exit criterion — first half, and the LAST thing green):** a candidate charter scoring below baseline yields `Refused{EvalRegression}` at the gate, before any Principal involvement, with zero versions written | M | T6.1–T6.9 | `.../regress_refused.rs` | AC1 — asserted structurally; a **required** CI check and the last thing to go green (architecture §18.1, §13.1, Appendix C) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | charter-revision domain types + the proposer (the only writer of a `Proposed` revision) |
| E2 | evaluation sets + evaluation runs + provenance resolution (gated on M26, D-1) |
| E3 | the regress gate (ADR-0033 partial order; ADR-0072 in mechanism) |
| E4 | propose → Principal-confirm Decision flow (the sole version-writer) |
| E5 | migrations 0061–0063, events, Vault mirror |
| E6 | conformance suite — regress-refused / accept-is-a-Decision (exit criterion, green last) |
