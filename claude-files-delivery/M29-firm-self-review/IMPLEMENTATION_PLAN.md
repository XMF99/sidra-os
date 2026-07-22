# Firm Self-Review — Implementation Plan

**Milestone M29 · crate `sidra-self-review` · for AntiGravity**

| | |
|---|---|
| Architecture | `FIRM_SELF_REVIEW_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0076 (propose-never-enact; no structural-write path) · 0077 (absorbability computed over M26 metrics) |
| Crate | `sidra-self-review` at `services/self-review/` |
| Depends on | `sidra-store` (read paths for M26 records, budget ledger, `decisions`), `sidra-departments` (Registrar roster + Division neighbours), `sidra-domain`, `sidra-store` (M2 event log) |
| Must not depend on | any structural-mutation path; **no** write edge to `departments`/`agents`/Packs (CI-enforced, AC8) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens ADR-0076 or ADR-0077. In particular: **no task adds an enact/apply/merge/retire verb, a write to
`departments`/`agents`/Packs, or a `StructureChanged` event** — those absences are the milestone (architecture
§7), and a task proposing one is a defect, not a feature.

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
| E1 | Domain model & department-health metrics from M26 | the vocabulary + measured overhead and quality per department (ADR-0077, §4, §8) |
| E2 | The absorbability test | Principle 13's test computed over M26 comparisons; the verdict + evidence (ADR-0077, §5) |
| E3 | The quarterly structure-review run | the runner, lifecycle state machine, immutability on conclude (§3) |
| E4 | Structure proposals with evidence | inert Merge/Retire records; refuse any proposal lacking evidence or confidence (§4.5) |
| E5 | The propose-only guarantee + Principal-Decision linkage | ADR-0076: no enact path; the read-only resolution observer over `decisions` (§7, §9) |
| E6 | Persistence, events & Vault mirror | migrations 0067–0069, event variants, the human-readable assessment mirror (§11) |
| E7 | The assessment / propose-never-enact acceptance | the exit criterion, made a test — **the last thing to go green** (§17) |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E4 ──► E5 ──► E7
  │            ▲       ▲      ▲
  └──► E3 ─────┘       │      │
        (runner drives gather→assess→absorbability→propose)
E6 runs alongside E1 (schema before any writer touches it)
```

E1 first — every other epic types against its domain model and consumes its metrics. E2 (absorbability) needs
E1's per-department metrics. E3 (the runner + lifecycle) needs E1 and sequences E2/E4 through the state machine.
E4 (proposals) needs E2's verdicts. E5 (the propose-only guarantee + resolution observer) needs E4's records.
E6 lands the schema just ahead of the writers in E1/E4/E5. E7 closes the milestone; **E7 is the exit criterion
and its final task must be the last thing to go green** (architecture §17: AC7 + AC8 together are the exit
criterion).

---

## E1 — Domain model & department-health metrics from M26

### Purpose
The vocabulary every other epic types against, plus the measured half of Principle 13: each department's
overhead against its measured Deliverable quality, computed from M26 records and the budget ledger — never
asserted (ADR-0077, §8).

### Scope
In: the value objects (§4.1), the `StructureReview` / `DepartmentHealth` aggregates (§4.2–§4.3), the metric
gatherer (`metrics` module, **read-only** over M26 + budget ledger + KPI samples), the health assessor
(`health` module, computes `earned_overhead`). Out: the absorbability test (E2), the runner/lifecycle (E3),
persistence DDL (E6).

### Dependencies
`sidra-domain`; `sidra-store` (read paths for M26 outcome records, budget ledger, KPI samples);
`sidra-departments` (Registrar roster — introduce/confirm `DepartmentId` against it before duplicating).

### Public APIs
Constructors that reject invalid construction; a `DepartmentHealth` that cannot be constructed without a
non-empty `evidence` set (ADR-0077). No mutating methods on the aggregates.

### Acceptance criteria
Overhead and measured quality are computed from M26 records and the budget ledger; every emitted health line
names its evidence, and a line with no evidence is refused (AC2). A thin-data department yields
`insufficient_evidence` with confidence below the floor (AC4).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-self-review` crate: module skeleton, CI wiring, dependency-direction + no-structural-write-path check stubbed | S | — | `services/self-review/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any write edge `sidra-self-review → departments/agents/Packs` and on any structural-mutation dependency edge (AC8) |
| **T1.2** | Value objects: `ReviewId`, `DepartmentId`, `Quarter`, `OverheadScore`, `QualityScore`, `Confidence(0.0..=1.0)`, `EvidenceRef`, `DecisionId` | S | T1.1 | `domain/values.rs` | `Confidence` rejects out-of-range; `EvidenceRef` is opaque; `DecisionId` carries no write capability; property tests (§4.1) |
| **T1.3** | `StructureReview` aggregate: id, quarter, status, departments_assessed, overall_confidence, timestamps, run_by | S | T1.2 | `domain/review.rs` | Immutable once Concluded; `overall_confidence` is the lowest per-department confidence (§4.2) |
| **T1.4** | `DepartmentHealth` aggregate with **required non-empty** `evidence` set | M | T1.2 | `domain/health.rs` | Cannot construct with an empty `evidence` set — the type refuses it (ADR-0077, invariant §3.3.3); unit tests |
| **T1.5** | Metric gatherer: read M26 outcome records + budget ledger + KPI samples into per-department overhead + measured quality; **read-only** | L | T1.4, `sidra-store` | `metrics/gather.rs` | Overhead assembled from budget share + Principal-attention cost + coordination cost; quality from M26 KPIs; store handle exposes no write to `departments`/`agents`/Packs (§8, AC2) |
| **T1.6** | Health assessor: compute `earned_overhead` vs history + Division peers; assemble each `DepartmentHealth` with evidence, or emit a low-confidence line if evidence is thin | M | T1.5 | `health/assess.rs` | Below the evidence floor → `confidence` under floor and verdict deferred to `insufficient_evidence`; every emitted line names its evidence (AC2, AC4) |

---

## E2 — The absorbability test (ADR-0077)

### Purpose
Principle 13's own test, computed: whether a Division **neighbour** could absorb a department's Work Orders
with no *measured* drop in Deliverable quality — `quality_drop ≤ 0` over M26 comparisons — never a novel score
(§5).

### Scope
In: neighbour resolution via the Registrar (same Division), comparable-Work-Order matching by declared
capability requirements, the measured quality-drop computation, the `AbsorbabilityResult` verdict with
evidence, the no-neighbour case. Out: writing the proposal (E4).

### Dependencies
E1; `sidra-departments` (Registrar Division roster). All comparisons read M26 outcome records only.

### Public APIs
`assess_absorbability(department, review_metrics) -> AbsorbabilityResult` (internal to the pipeline; no public
enact surface).

### Acceptance criteria
A department is `Absorbable` only when a Division neighbour is at least as good, measured, on comparable Work
Orders, with evidence above the floor (AC3). A department with no Division neighbour is never `Absorbable`
(AC5). Thin evidence yields `InsufficientEvidence`, no proposal (AC4).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `AbsorbabilityResult` type: candidate_absorber, projected_quality, quality_drop, verdict (`Absorbable`/`NotAbsorbable`/`InsufficientEvidence`), **required** evidence | S | E1 | `domain/absorbability.rs` | Folds 1:1 into the health row (§4.4, §4.6); a result cannot be `Absorbable` with an empty evidence set |
| **T2.2** | Neighbour resolution: the other departments in the same Division from the Registrar; a Division of one has no neighbour | S | T2.1, `sidra-departments` | `absorbability/neighbours.rs` | Cross-Division candidates are never returned; a single-department Division returns no neighbour (§5.1, AC5) |
| **T2.3** | Comparable-Work-Order matching by declared capability requirements, never by department identity | M | T2.2 | `absorbability/comparable.rs` | Comparability decided by capability, not name (kernel neutrality, G8); CI grep finds no department identifier (AC12) |
| **T2.4** | Measured quality-drop: `quality_drop = measured_quality(D) − projected_quality(absorber on comparable WOs)`, both from M26 | M | T2.3 | `absorbability/compute.rs` | `Absorbable` iff `quality_drop ≤ 0` with evidence above floor; inputs are M26 records, asserted by the "absorbability-uses-M26-metrics" test (AC3, SR-4) |
| **T2.5** | Verdict + confidence gating: below the evidence floor → `InsufficientEvidence`, no proposal; a Division of one → `NotAbsorbable` reason "no neighbour" | S | T2.4 | `absorbability/verdict.rs` | Thin evidence never produces `Absorbable`; the health line is flagged low-confidence (AC4, AC5, §10) |

---

## E3 — The quarterly structure-review run

### Purpose
The runner that sequences enumerate → gather → assess → absorbability → propose → conclude, the lifecycle state
machine (§3.1), and immutability on conclusion.

### Scope
In: `run_structure_review`, the state machine with the §3.2 transition table and guards, roster enumeration via
the Registrar, run immutability on `Concluded`. Out: proposal writing (E4), resolution observation (E5).

### Dependencies
E1, E2; `sidra-departments` (Registrar roster + Divisions).

### Public APIs
`run_structure_review(quarter) -> ReviewId`; `list_reviews()`; `inspect_assessment(review)`.

### Acceptance criteria
A quarterly review runs over the installed roster and produces a `StructureReview` with one `DepartmentHealth`
per department (AC1). A review is immutable once Concluded (invariant §3.3.4). The roster is the one enumerated
at `begin` (F7).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Lifecycle state machine: Scheduled → GatheringMetrics → Assessing → AbsorbabilityApplied → ProposalsEmitted/Concluded, with the §3.2 guards | M | E1 | `runner/state.rs` | Illegal transitions rejected; the `no_absorbable_department` path reaches Concluded with zero proposals (§3.1) |
| **T3.2** | `run_structure_review`: enumerate the installed roster + Divisions (Registrar), drive the pipeline | M | T3.1, E2, `sidra-departments` | `runner/run.rs` | One `DepartmentHealth` per installed department; roster fixed at `begin`; reads only — no install/remove/reorder (AC1, F7) |
| **T3.3** | Conclude + immutability: write the `StructureReview`, freeze it; re-run next quarter produces a new row | S | T3.2 | `runner/conclude.rs` | A Concluded review is never rewritten; only proposal `resolution` may update later (invariant §3.3.4) |
| **T3.4** | Queries `list_reviews()` + `inspect_assessment(review)`: every `DepartmentHealth` with its evidence refs and confidence | M | T3.3 | `runner/query.rs` | `inspect_assessment` returns evidence per line; a line the API cannot back with evidence was never written (AC2, G6) |

---

## E4 — Structure proposals with evidence

### Purpose
Write the inert `StructureProposal` (Merge or Retire) — a recommendation carrying its evidence and nothing that
could enact anything — and refuse any proposal lacking evidence or above-floor confidence (§4.5, ADR-0077).

### Scope
In: the `StructureProposal` type, the proposal writer (`proposal` module), the evidence/confidence gate, the
`list_proposals` / `proposal_evidence` queries. Out: resolution observation (E5), the enact path (**does not
exist**).

### Dependencies
E2 (the verdict a proposal derives from), E1 (the health line and its evidence).

### Public APIs
`list_proposals(review)`; `proposal_evidence(proposal)`. **No** proposal-writing verb is public: proposals are
emitted only inside the run.

### Acceptance criteria
An `Absorbable` department above the confidence floor raises a Merge or Retire proposal citing its M26 evidence
(AC6). A proposal with no evidence, or below-floor confidence, is not raised (AC4, F1). The record carries no
field that could enact anything (§4.5).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `StructureProposal` type: id, review_id, department_id, kind (`Merge{into}`/`Retire`), rationale, **required** evidence, confidence, resolution (default `Open`), decision_id (default `None`) | S | E1 | `domain/proposal.rs` | The type has no target manifest, no write instruction, no capability — inert by construction (§4.5, invariant §3.3.2) |
| **T4.2** | Proposal writer: emit a proposal **only** on `Absorbable` + above-floor confidence + non-empty evidence; `Merge` names the neighbour, `Retire` for near-zero measured volume | M | T4.1, E2 | `proposal/write.rs` | No proposal for `NotAbsorbable`/`InsufficientEvidence`/below-floor; every raised proposal has non-empty evidence (AC6, §5.5) |
| **T4.3** | Evidence/confidence refusal gate: refuse any proposal with an empty evidence set or below-floor confidence | S | T4.2 | `proposal/write.rs` | A drafted proposal without measured evidence is refused, and the department is recorded `InsufficientEvidence`, not absorbable (F1, ADR-0077) |
| **T4.4** | Queries `list_proposals(review)` + `proposal_evidence(proposal)` | S | T4.2 | `proposal/query.rs` | Returns each Merge/Retire recommendation, its evidence, and its resolution; the inspectability path (G6) |

---

## E5 — The propose-only guarantee + Principal-Decision linkage (ADR-0076)

### Purpose
Make propose-never-enact a property of the build: no enact verb, no structural-write capability, no
structural-mutation dependency edge — and the read-only resolution observer that links a proposal to a
Principal Decision that cited it (§7, §9).

### Scope
In: the CI "no structural-write path in M29" assertion, the public-surface audit (no enact verb), the
resolution observer (`resolution` module, **read-only** over `decisions`), the resolution transitions
(`Open → EnactedByPrincipal | Declined`). Out: writing a Decision (M29 never does — a different subsystem).

### Dependencies
E4; `sidra-store` (read-only handle on the `decisions` table).

### Public APIs
No new command. The observer is internal; it exposes no verb to change structure. The surface stays
`run_structure_review` + read-only queries (§12).

### Acceptance criteria
There is no `enact`/`apply`/`merge`/`retire`/`restructure` command and no structural-write capability (AC8). A
structural change occurs only when a Principal Decision cites a proposal; M29 then observes and marks the
resolution, writing no Decision and performing no structural change (AC9). M29 emits `StructureProposalRaised`,
never `StructureChanged` (AC10).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | CI "no structural-write path in M29": build fails on any write edge to `departments`/`agents`/Packs or any structural-mutation dependency edge | M | T1.1 | `infrastructure/ci/no_structural_write.rs` | Build fails on a hit; the store handle exposes no such write to this crate (AC8, §7 levels 1–2) |
| **T5.2** | Public-surface audit: assert the crate exposes no `enact`/`apply`/`merge`/`retire`/`restructure` verb | S | E4 | `infrastructure/ci/no_enact_verb.rs` | The public surface is one analysis command + read-only queries; a hidden write-bearing query fails the check (AC8, §12, §7 level 3) |
| **T5.3** | Resolution observer: read the `decisions` table; when a Decision cites a proposal, set `resolution = EnactedByPrincipal` + `decision_id`; a recorded decline sets `Declined`; none → stays `Open` | M | T4.1, `sidra-store` | `resolution/observe.rs` | The observer only reads `decisions`; it writes no Decision and no structural change; an un-cited proposal stays `Open` forever (AC9, §3.1, F9) |
| **T5.4** | Assert no `StructureChanged` originates in M29: the observer emits `StructureProposalLinkedToDecision`/`StructureProposalDeclined` bookkeeping only | S | T5.3, E6/T6.5 | `resolution/events.rs` | No `StructureChanged` event exists in the crate; `audit.verify` over a lifecycle fixture confirms it (AC10, §11.2) |

---

## E6 — Persistence, events & Vault mirror

### Purpose
Additive, forward-only schema (`0067`–`0069`); the domain event variants; the human-readable assessment mirror
written on conclusion (§11).

### Scope
In: migrations `0067_structure_reviews.sql`, `0068_department_health.sql`, `0069_structure_proposals.sql`; the
event enum; the Vault Markdown mirror writer (`mirror` module). Out: business logic.

### Dependencies
`sidra-store`; the M28 compilation migrations end at `0066`, so M29 migrations start at `0067`.

### Acceptance criteria
Forward-only, idempotent, independently deployable; a null review set = pre-M29 behaviour (AC13); the schema
has no column/table/FK by which a row could enact a structural change (§11.1); the mirror contains no enact
instruction (§11.3).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | `0067_structure_reviews.sql` — id, quarter, status, departments_assessed, overall_confidence, started_at, concluded_at, run_by | S | — | `services/store/migrations/0067_structure_reviews.sql` | Forward-only; idempotent; independently deployable (AC13) |
| **T6.2** | `0068_department_health.sql` — review_id, department_id, overhead, measured_quality, earned_overhead, absorbable verdict, candidate_absorber, quality_drop, **evidence_refs JSON NOT NULL non-empty**, confidence | S | T6.1 | `migrations/0068_department_health.sql` | `evidence_refs` cannot be empty at the DB layer; folds the `AbsorbabilityResult` 1:1 (§11.1) |
| **T6.3** | `0069_structure_proposals.sql` — id, review_id, department_id, kind, target_department (merge), rationale, **evidence_refs JSON NOT NULL non-empty**, confidence, resolution, **decision_id nullable FK → decisions** | S | T6.1 | `migrations/0069_structure_proposals.sql` | `decision_id` points *at* a Decision, is never a Decision, and is set only by observing one; no enact column exists (§11.1) |
| **T6.4** | Null-review + migration test: three empty tables = pre-M29 behaviour; each migration additive and independently deployable | S | T6.1–T6.3 | `migrations/tests/` | A Firm that never runs a review behaves exactly as pre-M29 (AC13, G9) |
| **T6.5** | Event enum: `StructureReviewScheduled`, `StructureReviewStarted`, `DepartmentHealthAssessed`, `AbsorbabilityTested`, `StructureProposalRaised`, `StructureReviewConcluded`, `StructureProposalLinkedToDecision`, `StructureProposalDeclined` — **and no `StructureChanged`** | M | E1 | `domain/events.rs` | Every §11.2 variant present with actor + review_id (+ department_id/proposal_id); serde round-trip; schema snapshot committed; `StructureChanged` is absent (AC10) |
| **T6.6** | Vault Markdown mirror writer (on conclusion, not continuously): `assessment.md`, `absorbability.md`, `proposals.md` under `structure-reviews/<quarter>/` | M | T6.5 | `mirror/write.rs` | Written on conclude; the mirror records these are *proposals* and carries no enact instruction or structural mutation (§11.3) |

---

## E7 — The assessment / propose-never-enact acceptance

### Purpose
The exit criterion, made a test. **The last thing to go green.** AC7 (a proposal alone changes nothing) and
AC8 (no structural-write path) together are the exit criterion (architecture §17).

### Scope
In: the propose-never-enact proof, the absorbability-uses-M26 proof, the acceptance harness covering AC1–AC13,
the locality proof. Out: any change to prior epics beyond wiring the harness.

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC13 each covered by a named test; the propose-never-enact proof (AC7) asserts the org chart, the
`departments` table, and every Pack are byte-identical before and after a review that raised a Merge proposal.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Absorbability-uses-M26 + neighbour-comparison proof: a fixture where the neighbour's measured quality ≥ the department's | M | E2 | `infrastructure/testing/self-review/absorbability.rs` | `Absorbable` with `quality_drop ≤ 0` and evidence; inputs are M26 records, asserted (AC3, SR-4) |
| **T7.2** | Insufficient-evidence proof: a low-data fixture yields `insufficient_evidence`, confidence below floor, no proposal | S | E2 | `.../insufficient_evidence.rs` | No fabricated verdict; no proposal raised (AC4, G4) |
| **T7.3** | No-neighbour proof: a single-department-Division fixture (e.g. Cybersecurity) is never `Absorbable` | S | E2 | `.../no_neighbour.rs` | `NotAbsorbable`, reason "no neighbour" (AC5, F4) |
| **T7.4** | Proposal-with-evidence proof: an `Absorbable` above-floor department raises a Merge/Retire proposal citing its M26 evidence | S | E4 | `.../proposal_evidence.rs` | A raised proposal with non-empty evidence and above-floor confidence (AC6) |
| **T7.5** | Principal-Decision linkage proof: a Decision cites a proposal → the observer sets `EnactedByPrincipal`; M29 wrote no Decision and no structural change | M | E5 | `.../decision_linkage.rs` | Resolution updated by observation only; no `StructureChanged`; `audit.verify` passes (AC9, AC10) |
| **T7.6** | Locality proof: a full review makes no network call, reads only local M26/ledger/decisions, writes only the local Vault | S | E3 | `.../locality.rs` | Zero egress during a full review (AC11, ADR-0009, G7) |
| **T7.7** | Null-review + kernel-neutrality CI: a Firm that never runs a review = pre-M29; no department identifier in the crate | S | E6 | `.../null_review.rs`, `infrastructure/ci/` | Null review supported (AC13); CI grep fails the build on a department identifier (AC12, G8) |
| **T7.8** | **The exit-criterion propose-never-enact proof (last to go green):** run a review that raises a Merge proposal, leave it alone, assert the org chart, `departments`, and every Pack are byte-identical before and after — and that no enact verb / structural-write capability exists | M | T7.1–T7.7, E5 | `.../propose_never_enact.rs` | AC7 + AC8: a proposal alone changes nothing, and there is no path by which it could (the exit criterion) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | domain model + department-health metrics from M26 (ADR-0077) |
| E2 | the absorbability test computed over M26 comparisons (ADR-0077) |
| E3 | the quarterly runner + lifecycle state machine |
| E4 | inert Merge/Retire proposals with mandatory evidence |
| E5 | the propose-only guarantee + read-only resolution observer (ADR-0076) |
| E6 | migrations 0067–0069, events, Vault mirror |
| E7 | the assessment / propose-never-enact acceptance (exit criterion — last green) |
