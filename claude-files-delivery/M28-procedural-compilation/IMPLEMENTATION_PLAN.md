# Procedural Compilation — Implementation Plan

**Milestone M28 · crate `sidra-compilation` · for AntiGravity**

| | |
|---|---|
| Architecture | `PROCEDURAL_COMPILATION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0074 (cited candidate; activation is a Principal Decision; no self-widening) · 0075 (normalized order-preserving signature) |
| Crate | `sidra-compilation` at `services/compilation/` |
| Depends on | `sidra-store`, `sidra-security` (Broker + Decision engine), `sidra-calibration` (M26 observation substrate), `sidra-domain` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced, AC11) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. In particular, no task adds a `propose_candidate`, `compile_candidate`, or `observe`
command (§9.2 — compilation is triggered by the arrival of the fifth distinct observation, never by request),
and no task adds an edge from `Proposed` to `Activated` that does not carry a Principal `DecisionId` (§5.2).

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
| E1 | Signature normalization & observation | ADR-0075: `NormalizedStep`/`ProcedureSignature`, the model-free digest, the off-hot-path observer, `ProcedureObservation` |
| E2 | Recurrence counting & the five-threshold | the per-signature distinct-Mission counter, distinctness enforcement, the fifth-distinct-Mission trigger |
| E3 | Candidate compilation, citation & capability ceiling | ADR-0074: the frozen `WorkflowCandidate`, the mandatory `derived_from` citation, the no-widening ceiling, the M7 validator run |
| E4 | Propose → Principal-activate Decision flow | the `proposed` state, the registry/queries, `activate`/`reject` as Principal Decisions, `proposed → active`, supersession |
| E5 | Persistence, events & Vault mirror | migrations `0064`–`0066`, the seven event variants, the Markdown mirror |
| E6 | Conformance suite & the five-recurrences cited-proposal proof | the exit criterion made a test, plus AC coverage — **the last thing to go green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──► E4 ──► E6
                             ▲
E5 lands each migration just ahead of its first writer ────┘
  (0064 before E1's observation write · 0065 before E3's candidate write · 0066 before E4's activation write)
```

E1 first (everything types against the signature, and nothing counts without an observation). E2 needs E1 (it
counts observations). E3 runs only at E2's threshold (it compiles the candidate, computes the ceiling, attaches
the citation). E4 wires the Decision flow onto E3's `Proposed` candidate. E5 lands the schema, events, and
mirror just ahead of the writes in E1/E3/E4. E6 closes the milestone; **E6 is the exit criterion and must be
the last thing green.**

---

## E1 — Signature normalization & observation

### Purpose
The model-free identity of a procedure (ADR-0075) and the off-hot-path sighting that records it: project a
concluded Mission's Work Order sequence to a normalized, order-preserving digest, and write one
`ProcedureObservation` per distinct signature it exhibited.

### Scope
In: the domain value objects (`NormalizedStep`, `ProcedureSignature`, `ProcedureObservation`), the normalization
/ abstraction / canonicalization / hashing pipeline (§3.2), the fan-out collapse (§3.2 rule 3), and the
`observer` subscription to `mission.concluded`. Out: counting (E2), compilation (E3), the schema itself (E5).

### Dependencies
`sidra-domain` (`EffectClass`, `Capability`, `DepartmentId`, `RoleArchetypeId`, `ContractShapeId`);
`sidra-calibration` (M26 — the `mission.concluded` trigger and the outcome-record read path); `sidra-store`
(E5/T5.1 for the observation write).

### Public APIs
No caller-facing API — observation is an internal subscription, not a command (§9.2). Internal: `signature_of(outcome_record) -> ProcedureSignature`; the observer's `on_mission_concluded` handler.

### Acceptance criteria
Two Missions differing only in ids/parameters/costs/timestamps produce an equal `SignatureHash`; two differing
in order, effect class, role, or contract shape produce different hashes; a fan-out over N collapses to one
normalized step regardless of N (AC7). Observation runs off the hot path and writes one sighting per distinct
signature per Mission.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-compilation` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/compilation/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-compilation → sidra-orchestrator` or `→ sidra-mission` (AC11) |
| **T1.2** | Value objects: `MissionId`, `EngagementId`, `SignatureHash(Bytes32)`, `RoleArchetypeId`, `ContractShapeId`, `EffectClass(1..3)` | S | T1.1 | `domain/values.rs` | `EffectClass` rejects 0 and >3; `SignatureHash` is opaque 32-byte; property tests over construction |
| **T1.3** | `NormalizedStep`: `(task_kind, role_archetype, effect_class, contract_shape, child_template?)`; the tuple carries no id, parameter, or free text | S | T1.2 | `domain/normalized_step.rs` | `child_template` present only for `fanout`; a step carrying an agent-instance id is unconstructable (role only) |
| **T1.4** | `ProcedureSignature`: ordered `steps` + `edges` (positions) + `hash`; canonical serialization + hashing | M | T1.3 | `domain/signature.rs` | Canonical encoding is fixed and deterministic; `hash` is a pure function of `steps`/`edges`; equal shapes ⇒ equal hash |
| **T1.5** | Normalization pipeline: project each dispatched Work Order → `NormalizedStep`; abstract away ids/params/costs/timestamps/retries; **collapse fan-out of N to one step** carrying its child template (§3.2) | M | T1.4 | `signature/normalize.rs` | Runs of one procedure over 3 vs 5 documents produce an equal signature; ids/params/costs never enter the hash (AC7) |
| **T1.6** | `signature_of(outcome_record)`: read the outcome-record shape (§3.1) and compute the signature; a Mission whose shape cannot be projected produces **no** observation, not a malformed one (F/assumption 2) | M | T1.5, `sidra-calibration` | `signature/mod.rs` | An unprojectable outcome record yields `None`; a well-formed one yields exactly one `ProcedureSignature` per recognized sub-procedure (§3.4) |
| **T1.7** | `ProcedureObservation`: `mission_id`, `engagement_id`, `signature`, `departments`, `capabilities`, `observed_at`; the distinctness key is `mission_id` | S | T1.2 | `domain/observation.rs` | `capabilities` = the union the Work Orders actually held (for the ceiling, §7); construction requires a `mission_id` |
| **T1.8** | `observer`: subscribe to `mission.concluded`; compute the signature; write one `ProcedureObservation` per distinct signature; runs asynchronously, low-priority, off the scheduling loop (§8) | M | T1.6, T1.7, E5/T5.1 | `observer/mod.rs` | Observation never runs during planning/dispatch; a concluded Mission writes ≤1 observation per distinct signature it exhibited; determinism of the scheduler untouched |

---

## E2 — Recurrence counting & the five-threshold

### Purpose
Turn observations into a per-signature tally of **distinct** Missions and fire exactly once, at the fifth
distinct Mission, without ever counting a replay or retry twice.

### Scope
In: the per-`SignatureHash` distinct-Mission counter, the distinctness rule (`UNIQUE(signature_hash,
mission_id)`), the `signature_recurrence` query, and the internal threshold signal that E3 consumes. Out: the
candidate object (E3) — crossing the threshold **signals** compilation; it does not itself compile.

### Dependencies
E1; `sidra-store` (E5/T5.1 — the `procedure_observations` table the counter reads).

### Public APIs
`signature_recurrence(signature) -> { distinct_count, missions_counted }` (query, §9.1). No command exposes
counting.

### Acceptance criteria
The counter increments once per distinct `mission_id`; one Mission replayed/retried five times counts once
(AC6); the fifth distinct Mission crosses the threshold and the fourth does not (AC1, AC3).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `RecurrenceCounter`: per-`SignatureHash` distinct-Mission tally over `procedure_observations`; O(1) indexed hash lookup, bounded increment (§8) | M | E1, E5/T5.1 | `recurrence/counter.rs` | Matching is a `SignatureHash` equality lookup, no similarity search; count does not grow with stored-signature count beyond the index |
| **T2.2** | Distinctness enforcement: an observation whose `mission_id` already counts for that signature is inert; the `UNIQUE(signature_hash, mission_id)` constraint backs it at the storage layer | S | T2.1 | `recurrence/distinct.rs` | One Mission replayed/retried ×5 → distinct count = 1 → no threshold (AC6, F2) |
| **T2.3** | The five-threshold signal: fire on the transition `4 → 5` distinct Missions, exactly once; a below-threshold observation increments and stops (F1) | S | T2.1, T2.2 | `recurrence/threshold.rs` | Fourth distinct Mission → `Counting`, no signal; fifth → one threshold signal carrying the ≥5 distinct `mission_id`/`engagement_id` set (AC1, AC3) |
| **T2.4** | `signature_recurrence` query: distinct count + the Missions counted so far, for inspecting a below-threshold tally | S | T2.1 | `recurrence/query.rs` | Returns the running tally; never fabricates a candidate for a sub-threshold signature |

---

## E3 — Candidate compilation, citation & capability ceiling (ADR-0074)

### Purpose
At the threshold — and only there — compile the frozen candidate: build the `WorkflowDefinition`, compute the
no-widening ceiling, attach the mandatory citation, and validate against the M7 Workflow validator. This is the
heart of the milestone.

### Scope
In: the `compiler` (frozen definition from the signature), the `ceiling` check (union of source capabilities,
refuse-at-proposal on widening), the `WorkflowCandidate` construction invariant (`|derived_from| ≥ 5`), and the
M7 validator run (F5). Out: persistence (E5), the Decision flow (E4).

### Dependencies
E1, E2; `sidra-security` (the Broker, for the ceiling check); the M7 Workflow validator
(`/docs/01-workflow-engine.md` §2); `sidra-store` (E5/T5.2).

### Public APIs
No caller-facing command — a candidate is proposed by the arrival of the fifth distinct observation, never by
request (§9.2). Internal: `compile(signature, observations) -> Result<WorkflowCandidate, RefusalReason>`.

### Acceptance criteria
A `WorkflowCandidate` is unconstructable with `|derived_from| < 5` or empty `cited_missions` (AC2); a compiled
definition requiring a capability outside the source union is **refused at proposal**, not clamped (AC5); a
definition that fails the Workflow validator is refused with the named failure (F5).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `WorkflowCandidate` type with the **citation construction invariant**: no value exists with `\|derived_from\| < 5` distinct or empty `cited_missions`; provenance is a precondition of existence (§4.4) | M | E1 | `domain/candidate.rs` | A four-recurrence input produces **no candidate object at all**; a five produces one whose `derived_from` names exactly the five (AC2, AC3) |
| **T3.2** | `compiler`: build the frozen `WorkflowDefinition` (the `playbooks.steps` DAG) from the `ProcedureSignature`; freeze order and structure; the fan-out bound derives from the child template, not any single run's width (ADR-0075) | M | T3.1, E2 | `compiler/build.rs` | Definition is frozen and inspectable; matches the M7 Playbook `steps` shape (§4.6) |
| **T3.3** | `ceiling`: compute `capability_ceiling = ⋃ observation.capabilities`; refuse compilation if the definition requires any capability outside it; default-deny (§7); emit `CandidateWideningRefused` on refusal | M | T3.1, `sidra-security` | `ceiling/check.rs` | A widening compilation is **refused, not clamped**; refusal is logged, not silent (AC5, F3) |
| **T3.4** | Citation attach + candidate naming: attach the ≥5 engagement ids as `derived_from`, the ≥5 Missions as `cited_missions`, and a human-readable name/`trigger_desc` derived from the shape | S | T3.1, T3.2 | `compiler/cite.rs` | `derived_from` and `cited_missions` populated at construction; a candidate with a null citation is unrepresentable (§4.4) |
| **T3.5** | M7 Workflow-validator run over the compiled definition (acyclic, reviewer ≠ assignee, budgets, grants ⊆ fences — `/docs/01-workflow-engine.md` §2); refuse with the named failure on any violation (F5) | M | T3.2, `sidra-security` | `compiler/validate.rs` | An invalid definition is refused and **not stored**; a valid one passes and advances to `Proposed` |

---

## E4 — Propose → Principal-activate Decision flow

### Purpose
Bring the compiled candidate into existence as a `Proposed` `playbooks` row, expose it for inspection, and gate
every path to `active` behind a Principal `DecisionId` — activation and rejection are Decisions; the kernel
never activates on its own.

### Scope
In: the `PROPOSED` transition (write the `proposed` playbook + `workflow_candidates` projection, emit
`WorkflowCandidateProposed`), the `registry` queries, `activate_candidate` / `reject_candidate` as Principal
Decisions, `proposed → active` / `proposed → retired`, and supersession. Out: the M7 engine that runs an
activated candidate (a separate crate — M28 has no execution path, §6).

### Dependencies
E3; `sidra-security` (the Decision engine — raises the Decision, returns the `DecisionId`; the Broker — re-verifies
the ceiling at activation); `sidra-store` (E5/T5.2, T5.3).

### Public APIs
Queries (§9.1): `list_workflow_candidates(status?)`, `inspect_candidate_provenance(candidate)`,
`candidate_status(candidate)`. Commands (§9.2): `activate_candidate(candidate) -> Result`,
`reject_candidate(candidate) -> Result`. **No `propose_candidate` and no `compile_candidate` command exists.**

### Acceptance criteria
Every edge into `Activated` requires a `DecisionId`; no code path flips a candidate to `active` without one
(AC4); no candidate is returned without its citation (§9.3 rule 2); `activate_candidate` re-verifies the ceiling
(AC5); the promoted `playbooks` row is a valid M7 Workflow definition (AC12).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `CandidateActivation` type: requires a `DecisionId` — no constructor activates without one; symmetric `CandidateRejection` also carries its own `decision_id` (§4.5) | S | E3 | `domain/activation.rs` | A `CandidateActivation` is unconstructable without a `DecisionId`; activation is structurally a Principal act |
| **T4.2** | The `PROPOSED` transition: at the threshold, write `playbooks{status:'proposed', derived_from:[E#1..E#5], steps}` + the `workflow_candidates` provenance projection; emit `WorkflowCandidateProposed`; candidate is now cited, inert | M | T4.1, E3, E5/T5.2 | `activation/propose.rs` | The candidate exists **only** at this transition (§5.1); it is `proposed`, cited, and runs nothing |
| **T4.3** | `registry` queries: `list_workflow_candidates` (default `Proposed`), `inspect_candidate_provenance` (the ≥5 cited Missions + normalized `steps`/`edges` + ceiling — the exit-criterion evidence), `candidate_status` | M | T4.2 | `registry/mod.rs` | No candidate is returned without `derived_from` (§9.3 rule 2); provenance is human-readable (AC2) |
| **T4.4** | `activate_candidate`: raise a Decision, require the returned `DecisionId`, re-verify the ceiling ⊆ source, flip `playbooks.status proposed → active`, write `CandidateActivation`, emit `CandidateActivated` | M | T4.1, T4.2, `sidra-security` | `activation/activate.rs` | No activation without a `DecisionId`; ceiling re-verified; a widening candidate cannot advance (AC4, AC5, AC12) |
| **T4.5** | `reject_candidate`: raise a Decision, flip `proposed → retired`, write `CandidateRejection`, emit `CandidateRejected`; `Rejected` is terminal and immutable; a re-recurrence compiles a **fresh** candidate (§5.3 inv. 4, F6) | S | T4.4 | `activation/reject.rs` | Rejection is a logged Decision; the prior record stays queryable forever; re-recurrence never edits it |
| **T4.6** | Supersession: a newer activated candidate for the same signature `Supersedes` the earlier; only one `active` at a time; history immutable; emit `CandidateSuperseded` (F7) | S | T4.4 | `activation/supersede.rs` | The superseding `candidate_id` is recorded; both remain in history (§5.2, §5.3 inv. 4) |

---

## E5 — Persistence, events & Vault mirror

### Purpose
Additive, forward-only schema in the band `0064`–`0066`; the seven event variants on the hash chain; the
human-readable Markdown mirror. Zero observations = pre-M28 behaviour.

### Scope
In: migrations `0064`–`0066` (§11.1), the `CompilationEvent` variants (§11.2), the Vault mirror writer (§11.3).
Out: business logic (E1–E4).

### Dependencies
`sidra-store`; prior milestones' migrations end at `0063`, so compilation migrations start at `0064`.

### Acceptance criteria
Forward-only, idempotent, independently deployable; a Firm with zero observations behaves byte-identically to a
pre-M28 Firm (AC10); the mirror holds procedure *shape* and citations, never Mission content or credentials.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `0064_procedure_observations.sql`: `mission_id`, `engagement_id`, `signature_hash`, `departments` (JSON), `capabilities` (JSON), `observed_at`; **`UNIQUE(signature_hash, mission_id)`** enforces distinctness | S | — | `services/store/migrations/` | Forward-only; idempotent; the unique constraint rejects a duplicate sighting at the storage layer (AC6) |
| **T5.2** | `0065_workflow_candidates.sql`: `candidate_id`, `playbook_id` (FK to `playbooks.id`), `signature_hash`, `normalized_steps` (JSON), `capability_ceiling` (JSON), `cited_missions` (JSON, ≥5), `status`, `proposed_at` | S | T5.1 | `migrations/` | Projection over a `playbooks` row; `derived_from` on the linked `playbooks` row is the authoritative citation |
| **T5.3** | `0066_candidate_activations.sql`: `candidate_id` (FK), `decision_id` (FK, **NOT NULL**), `activated_playbook_id`, `resolution` (`activated`\|`rejected`\|`superseded`), `actor`, `resolved_at` | S | T5.2 | `migrations/` | **`decision_id` NOT NULL** — no activation row can exist without a Decision (AC4) |
| **T5.4** | `CompilationEvent` enum — the seven variants (`ProcedureObserved`, `RecurrenceThresholdReached`, `WorkflowCandidateProposed`, `CandidateWideningRefused`, `CandidateActivated`, `CandidateRejected`, `CandidateSuperseded`), each with `actor` + `signature_hash` (+ `candidate_id`/`decision_id` where applicable), on the hash chain | M | E1 | `domain/events.rs` | Every kind in §11.2 present; serde round-trip; `decision_id` carried on activation/rejection; schema snapshot committed |
| **T5.5** | Vault Markdown mirror writer (on state transitions, not continuously): `candidates/<id>.md`, `observations/<signature>.md` | M | T5.4 | `mirror/write.rs` | `candidates/`/`observations/` written; no credential and no Mission *content* appears — shape and citations only (§11.3) |

---

## E6 — Conformance suite & the five-recurrences cited-proposal proof

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the five-recurrence exit-criterion proof, the acceptance-criteria coverage (AC1–AC12), and the CI gates
(§16). Out: any activated Workflow's execution (M7) and its ongoing value-policing (M29, F9).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the five-recurrences-proposed-with-citations proof (AC1, AC2) is this
epic's **final task** and the last thing to go green.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Signature normalization property test: same procedure ⇒ equal hash despite differing params/ids/costs; different order/effect/role/contract ⇒ different hash; fan-out over N collapses regardless of N | M | E1 | `infrastructure/testing/compilation/signature_property.rs` | AC7 |
| **T6.2** | Distinctness test: one Mission replayed/retried ×5 counts once; five distinct Missions cross, four do not | S | E2 | `.../distinctness.rs` | AC6, AC3 |
| **T6.3** | Citation-invariant unit test: a `WorkflowCandidate` is unconstructable with `<5` distinct cited Missions; a four-recurrence fixture produces no candidate object | S | E3 | `.../citation_invariant.rs` | AC2, AC3 |
| **T6.4** | No-widening test: a compiled definition requiring a capability outside the source union is refused, not clamped; `CandidateWideningRefused` emitted | S | E3 | `.../no_widening.rs` | AC5 |
| **T6.5** | No-auto-activation state-machine test + CI grep-and-test: no code path transitions a candidate to `Activated` without a Principal `DecisionId`; the build fails if the activation transition is reachable without a Decision | M | E4 | `.../no_auto_activation.rs`, `infrastructure/ci/` | AC4 |
| **T6.6** | Activation integration test: `activate_candidate` raises a Decision, requires the `DecisionId`, promotes `proposed → active`, writes `CandidateActivation`, emits `CandidateActivated`; the promoted playbook passes the M7 validator | M | E4, E5 | `.../activation.rs` | AC12 |
| **T6.7** | Locality property test: no pipeline step opens a socket; a packet capture across a full compilation is empty | S | E1–E5 | `.../locality.rs` | AC8 |
| **T6.8** | Audit property test: every proposal/activation/rejection/supersession is an event on the hash chain; `audit.verify` passes over a full compilation-lifecycle fixture | S | E5 | `.../audit.rs` | AC9 |
| **T6.9** | Additivity regression: a Firm with zero observations behaves byte-identically to a pre-M28 fixture Vault | S | E5 | `.../additivity.rs` | AC10 |
| **T6.10** | Dependency-direction CI check: the build fails on any edge `sidra-compilation → sidra-orchestrator` or `→ sidra-mission` | S | E1/T1.1 | `infrastructure/ci/` | AC11 |
| **T6.11** | **The exit-criterion proof (LAST — the last thing to go green):** a fixture of five distinct Missions with an equal signature produces exactly one `Proposed` candidate (a `proposed` playbook) whose `derived_from` names exactly those five; four produce none; the candidate is inert until a Principal Decision | M | T6.1–T6.10 | `.../five_recurrences_cited_proposal.rs` | **AC1, AC2** — proven by test, not by configuration (§10.1, §14) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | signature domain types + the model-free digest + the off-hot-path observer (ADR-0075) |
| E2 | distinct-Mission recurrence counter + the five-threshold |
| E3 | frozen candidate compilation + mandatory citation + no-widening ceiling (ADR-0074) |
| E4 | propose → Principal-activate Decision flow + registry + supersession |
| E5 | migrations 0064–0066, the seven events, the Vault mirror |
| E6 | conformance suite + the five-recurrences cited-proposal proof (exit criterion) |
