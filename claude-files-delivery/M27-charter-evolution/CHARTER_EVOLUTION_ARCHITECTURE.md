# Charter Evolution — Architecture

**Milestone M27 · Release 4.0 "Continuum" · Layer 1 (kernel machinery over Layer-3 archetype data)**

| | |
|---|---|
| Milestone | M27 — Charter Evolution (`/MILESTONE_REGISTRY.md` §4, 4.0 "Continuum") |
| Release | 4.0 "Continuum" — the Firm improves itself |
| Layer | 1 — kernel machinery (`/docs-v2/02-layer-model.md` §1) governing Layer-3 archetype charter data (§3) |
| New crate | `sidra-evolution` at `services/evolution/` |
| Depends on | M26 (outcome calibration / performance data), M13 (departments & Role Archetypes), M2 (event log); reuses ADR-0033 (`Charter::relation_to`) and the Decision engine |
| Status | Documented (this package) · implementation Open, and gated on M26 (see `00-M26-AUDIT.md` D-1) |
| Exit criterion | A proposed charter revision that regresses its evaluation set is refused; an accepted one is a Decision the Principal confirmed — **proven by test, not by configuration** |

> **Authoritative precedence.** Where this document disagrees with `/docs-v2/adr/0033-charter-comparison-is-a-partial-order.md`
> about what "narrower", "wider", or `Incomparable` means, ADR-0033 governs. Where it disagrees with ADR-0014
> about the archetype/instance distinction or charter freezing, ADR-0014 governs. Where it disagrees with
> `/docs/03-decision-engine.md` about what constitutes a Decision, the decision engine governs. Where it
> disagrees with GUIDE §3 item 15 ("charters are data, versioned, with an evaluation set attached; a charter
> change that regresses its evaluation set does not merge") or item 9 ("the author never reviews their own
> work"), the GUIDE governs. This architecture *extends* those boundaries; it never re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

ADR-0014 closes on a promise it does not yet keep: *"Retire an archetype when its evaluation sets show it is
not earning its place."* Evaluation sets are named there as the instrument by which an archetype is judged, but
through M25 nothing produces the performance signal, nothing runs the evaluation set, and nothing turns a
judgement into a charter change. M26 supplies the first half — the local, inspectable outcome record that says
*this archetype under-delivered on these Missions.* M27 is the machinery for the second half: turning an
observed shortfall into an **improved charter** — a better-written responsibility, a sharper refusal, a
re-weighted KPI — **without the Firm ever promoting itself.**

The requirement is not "let the Firm rewrite its own charters." A Firm that can rewrite its own charters is a
self-authorising authority wearing a helpful face — the exact failure mode 4.0 is designed against
(`/MILESTONE_REGISTRY.md` §4: *"Nothing in this release may self-promote"*). The requirement is: **let the
Firm _propose_ a charter revision that is motivated by observed performance, gated by the archetype's own
evaluation set, refused at the gate if it regresses or widens authority, and merged only when the Principal
confirms it as a Decision on the record.** Two gates, both mandatory: (a) it passes its evaluation set, and (b)
the Principal confirms. Neither alone merges anything.

### 1.2 The stance

Two commitments define the subsystem, and each has an ADR:

1. **A charter revision that regresses its evaluation set is refused at the gate, structurally — and acceptance
   is a Principal Decision.** (ADR-0072) "Regress" is defined by ADR-0033's partial order applied at two sites:
   a revision that scores worse on its evaluation set, *or* that widens authority (relation `Wider`, or
   `Incomparable` treated as widening), is refused. The gate is mechanical and comes before any Principal
   involvement. A revision that survives the gate is not thereby accepted — it is merely *eligible*; acceptance
   is a separate Principal Decision (Principle 14; GUIDE §3 item 15).
2. **The evaluation set is attached to the archetype, versioned, and is the sole merge gate — and the proposer
   is never the reviewer.** (ADR-0073) No charter revision reaches a version without an evaluation run on the
   archetype's *current* evaluation-set version. The evolution engine proposes; the mechanical gate and the
   Principal review. The archetype whose charter is under revision has no path to evaluate or confirm its own
   revision — GUIDE §3 item 9 (author ≠ reviewer), applied at the charter layer.

These two together are the whole subsystem: **the Firm proposes, the eval set gates, the Principal confirms.**

### 1.3 What the subsystem is, mechanically

The **evolution engine** is kernel machinery (Layer 1). The **charters it revises** are the Layer-3 artifacts
it proposes changes to — exactly as the Mission Engine (kernel) owns Mission plans and the Registrar (kernel)
manages archetypes. This parallel is deliberate and load-bearing: it means M27 introduces **no new comparison
mechanism and no new authority.** It reuses `Charter::relation_to` (ADR-0033, shipped in M15), the archetype
versioning already in `agent_versions` (`/docs/04-database-design.md`), the Decision engine
(`/docs/03-decision-engine.md`), and the outcome-record surface M26 produces.

```
Layer 1  sidra-evolution   ← the engine: propose, evaluate, gate, route-to-Principal, materialise   (M27, THIS DOC)
Layer 3  a Role Archetype   ← charter data in a Department Pack, versioned in agent_versions          (M13; ADR-0014)
                              (M26 supplies the performance signal that motivates a proposal)
```

The evolution engine holds exactly one power the rest of the Firm does not: it may *write a proposal*. It holds
**no** power to write a charter version. That write happens only inside `confirm_revision`, and only with a
Principal Decision id in hand (§9, §12). The asymmetry is the point.

### 1.4 What the subsystem must never become

- **A self-promoting charter.** The instant an archetype's charter can change without a Principal Decision, the
  Firm has a meta-layer that edits itself outside the audit chain — precisely what Principle 14 forbids
  (`/docs-v2/02-v2-principles.md` §14). The exit criterion tests that acceptance is a Decision, not an event
  the Firm emits to itself.
- **An eval-set bypass.** No merge path may skip the evaluation run, and no setting may disable the gate. A
  missing evaluation set does not mean "merge freely" — it means "cannot prove non-regression, therefore no
  merge" (fail closed; GUIDE §3 item 15). The gate is machinery, not policy.
- **A silent authority widening.** A revision that quietly removes a Fence, raises an effect ceiling, or
  broadens `departments_allowed` is a widening even if it improves a KPI. Every revision is compared to its
  base with ADR-0033's partial order; `Wider` and `Incomparable` are caught structurally and refused at the
  automatic gate — a performance improvement can never smuggle authority (§7, §10).
- **A place learning leaves the machine.** Evaluation runs execute against local models over a local corpus;
  scores, provenance, and revisions are local data. No score, no ranking, no "this charter improved" signal is
  ever transmitted (ADR-0009, a permanent no; GUIDE §12).

### 1.5 Relationship to existing concepts

| Existing concept | How M27 relates |
|---|---|
| Role Archetype (ADR-0014) | The archetype is the unit that improves. A revision proposes a new *archetype* charter version; per ADR-0014, running instances keep their frozen charter until a natural boundary, and future instances instantiate from the new version. M27 changes templates, never live instances retroactively. |
| `Charter::relation_to` (ADR-0033) | The gate's authority comparison **is** ADR-0033's four-valued partial order, unchanged. M27 adds a second call site (evolution, alongside M15's replanning) and inherits `Incomparable`-is-widening and the `departments_allowed` inversion verbatim. |
| `agent_versions` (`/docs/04-database-design.md`) | Charters are versioned data here. A confirmed revision materialises as a new version row; prior rows are immutable (ADR-0014 freezing, ADR-0002 append-only). `turns.agent_version` already stamps every Turn, so old Turns stay interpretable against the version they ran under. |
| Outcome records (M26, M15 §27.3) | The performance signal that *motivates* a proposal and to which its provenance points. M27 reads this surface; it never writes it, and it never re-derives calibration. |
| Decision engine (`/docs/03-decision-engine.md`) | Acceptance of a revision **is** a Decision: criteria (the eval report), reversibility class, review date, `authority: principal`. `confirm_revision` creates the record; the new version cites its id. |
| Permission Broker (M3) | `confirm_revision` is an effectful act (it writes a new charter version). It passes the Broker like any effect and requires a Principal Seat actor — the mechanism behind author ≠ reviewer (GUIDE §3 item 9). |
| GUIDE §3 item 15 | This subsystem is item 15 made into machinery: charters are data, versioned, with an evaluation set attached; a revision that regresses does not merge. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A charter revision that regresses its evaluation set is refused, structurally, before any Principal involvement | ADR-0072; the regress gate (§8); the exit-criterion regressing-fixture test (§17, AC1) |
| G2 | The Firm never self-promotes a charter — acceptance is a Principal Decision, and the engine holds no write path to a version | ADR-0072/0073; `confirm_revision` is the only version-writer and requires a Decision id (§9, §12); Principle 14 |
| G3 | No silent authority widening — every revision is compared to its base with ADR-0033's partial order | ADR-0033 reused at the gate; `Wider`/`Incomparable` refused at the automatic gate (§7, §10) |
| G4 | The evaluation gate cannot be bypassed or disabled; a missing eval set fails closed | ADR-0073; `run_evaluation` is a mandatory predecessor of `confirm_revision`; no-eval-set → `Refused` (§8.4); CI gate-integrity check (§18) |
| G5 | Author ≠ reviewer at the charter layer — an archetype cannot evaluate or confirm its own revision | GUIDE §3 item 9; `confirm_revision` requires a Principal Seat actor; the engine, not the archetype, proposes (§9) |
| G6 | All learning is local — eval runs, scores, provenance, and revisions never leave the machine | ADR-0009; local corpus + local models; CI no-network assertion (§18, AC10) |
| G7 | Old versions stay interpretable — a confirmed revision is a new version; prior versions are immutable | ADR-0014 freezing; ADR-0002 append-only; `turns.agent_version` stamps every Turn (§11, AC9) |
| G8 | Evaluation runs are off the hot path — they never block a Mission or the scheduler | §15; eval runs are scheduled, bounded, cancellable; baseline scores cached |
| G9 | The engine contains no archetype-specific logic | CI grep (mirrors GUIDE §3 non-negotiable 12); no `if archetype == "code-reviewer"` anywhere (§18, AC12) |
| G10 | Everything is additive — an archetype with no proposed revision behaves exactly as pre-M27 | §11 forward-only migrations 0061–0063; a null revision set is a fully supported state, not a migration artifact |

---

## 3. The charter-revision lifecycle

### 3.1 States

A **charter revision** is a candidate new version of one archetype's charter. It is not a version until it is
confirmed. Its whole life is the propose → evaluate → (refuse | await) → (confirm | reject) path.

```
        propose_charter_revision(archetype, candidate, provenance)   ← the engine, never the archetype
  ─────────────────────────────────────────────────────────────►  PROPOSED
                                                                      │  run_evaluation
                                                                      ▼
                                                                  EVALUATING
                                                                      │
             ┌────────────────────────────────────────────────────────┼───────────────────────────────┐
             │ score < baseline (regress)                              │ eval pass                      │ relation ∈ {Wider, Incomparable}
             │  OR no eval set  OR wrong archetype                     │  AND relation ∈ {Same,Narrower}│  OR missing provenance
             ▼                                                         ▼                                ▼
          REFUSED  (terminal)                              AWAITING_PRINCIPAL                       REFUSED (terminal)
          {EvalRegression | NoEvaluationSet | WrongArchetype}      │                               {Widening | NoProvenance}
                                                                    │ confirm_revision(principal)   │ reject_revision(principal, reason)
                                                                    ▼                               ▼
                                                                CONFIRMED (terminal)            REJECTED (terminal)
                                                                    │  materialise new archetype version,
                                                                    │  tied to a Principal Decision id
                                                                    ▼
                                                             agent_versions += 1   (base_version + 1)
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `propose_charter_revision` | Proposed | actor is the evolution engine (not an archetype instance); candidate charter well-formed; provenance references existing local outcome/KPI rows for **this** archetype |
| Proposed | `run_evaluation` | Evaluating | the archetype has a current evaluation set; a baseline score for `(eval_set_version, base_version)` exists or is computed |
| Evaluating | `score_regressed` | Refused{EvalRegression} | candidate aggregate score < baseline aggregate score on the same eval-set version |
| Evaluating | `no_evaluation_set` | Refused{NoEvaluationSet} | the archetype has no evaluation set — fail closed (§8.4) |
| Evaluating | `wrong_archetype` | Refused{WrongArchetype} | candidate's `archetype_id` ≠ the eval set's / provenance's archetype |
| Evaluating | `widens_authority` | Refused{Widening} | `relation_to(candidate, base) ∈ {Wider, Incomparable}` (ADR-0033) — refused in the automatic path (§10.3) |
| Evaluating | `passes` | AwaitingPrincipal | eval pass **and** `relation ∈ {Same, Narrower}` **and** provenance present |
| AwaitingPrincipal | `confirm_revision` | Confirmed | actor is a Principal Seat (not an agent); revision still eligible; `base_version` still current (§14, F5) |
| AwaitingPrincipal | `reject_revision` | Rejected | actor is a Principal Seat; reason recorded |
| Confirmed | (materialise) | — | a new `agent_versions` row is written with `version = base_version + 1` and the Decision id; prior versions untouched |

### 3.3 Invariants

1. **No revision becomes a version except from `Confirmed`, and `Confirmed` requires a Principal Decision id.**
   There is no state, setting, or code path in which the engine writes a charter version on its own
   (Principle 14; ADR-0072). This is the exit criterion's second half.
2. **No revision reaches `AwaitingPrincipal` without a passing evaluation run on the current eval-set version.**
   The gate is a mandatory predecessor; a missing or failed run withholds the verdict and the revision cannot
   advance (fail closed; ADR-0073).
3. **A widening never transits to `AwaitingPrincipal` in the automatic path.** `Wider`/`Incomparable` is
   terminal-`Refused{Widening}` here; a widening can enter a charter only as a separately-authored Principal
   widening Decision that names the widened field (§10.3, F2). The Firm never proposes more authority for
   itself.
4. **`Refused` and `Rejected` are terminal.** The engine cannot retry a refused revision into acceptance; it
   must generate a fresh proposal with a fresh evaluation run. History of the prior revision is never rewritten
   (ADR-0002).
5. **Every transition lands on the hash chain** (ADR-0002), carrying `actor`, `archetype_id`, and the verdict
   or Decision id where applicable (§11.2).

---

## 4. Domain model

### 4.1 Core types

```
ArchetypeId(String)             // the archetype the charter belongs to (M13; ADR-0014)
RevisionId(String)              // a proposed charter revision
CharterVersion(u32)             // the versioning integer of agent_versions
EvalSetId(String)               // an evaluation set, attached to one archetype
EvalSetVersion(u32)             // eval sets are themselves versioned
EvalRunId(String)               // one execution of a charter over an eval set
Score(f64 in [0,1])             // an aggregate evaluation score, higher is better
DecisionId(String)              // a decision-engine record id (present only on Confirmed)
Charter                         // the ten-section employee-spec + four archetype fields (ADR-0014)
Relation ∈ {Same, Narrower, Wider, Incomparable}   // ADR-0033, reused unchanged
```

### 4.2 `CharterRevision` — the proposal

The whole proposal in one record, mirroring the "everything the gate needs is here" stance.

| Field | Type | Meaning |
|---|---|---|
| `revision_id` | `RevisionId` | identity |
| `archetype_id` | `ArchetypeId` | the archetype being revised |
| `base_version` | `CharterVersion` | the current archetype charter version this revises |
| `proposed_charter` | `Charter` | the candidate — same shape as the base, data only |
| `provenance` | `Provenance` | the M26 outcome/KPI records that motivated this proposal (REQUIRED) |
| `relation_to_base` | `Option<Relation>` | ADR-0033 result, filled at evaluation (None until Evaluating) |
| `status` | `RevisionStatus` | Proposed \| Evaluating \| Refused{reason} \| AwaitingPrincipal \| Confirmed \| Rejected |
| `decision_id` | `Option<DecisionId>` | present only on Confirmed — the Principal Decision that accepted it |
| `proposed_by` | `Actor` | the evolution engine; **never** an archetype instance (§9) |
| `proposed_at`, `resolved_at` | `Timestamp` | lifecycle stamps |

`proposed_charter` is data, not code — exactly the JSON shape already stored in `agent_versions.charter`
(purpose, responsibilities, refusals), `.decision_bounds`, `.kpis`, `.capabilities` (the standing fence — itself one of
the four archetype fields ADR-0014 formalizes: `model_class`, `capabilities`, `standards`, `instantiation`).

### 4.3 `Provenance` — why the proposal exists

A proposal with no provenance is refused (§8.5). Improvement must cite what performance motivated it, the way a
Decision cites its evidence (`/docs/03-decision-engine.md` §2).

| Field | Type | Meaning |
|---|---|---|
| `archetype_id` | `ArchetypeId` | must equal the revision's archetype (else `WrongArchetype`) |
| `outcome_refs` | `[OutcomeRef]` | `mission_outcomes` rows (M26/M15) showing the shortfall |
| `kpi_refs` | `[KpiSampleRef]` | `agent_kpi_samples` rows showing the drift |
| `rationale` | `String` | the engine's plain-language "why", carried into the Principal's approval request |

### 4.4 `EvaluationSet` — the gate's corpus (ADR-0073)

Attached to the archetype (GUIDE §3 item 15), versioned, local.

| Field | Type | Meaning |
|---|---|---|
| `eval_set_id` | `EvalSetId` | identity |
| `archetype_id` | `ArchetypeId` | the archetype it gates — bound, one-to-one at a version |
| `eval_set_version` | `EvalSetVersion` | eval sets are versioned; a run records the version it used |
| `cases` | `[EvaluationCase]` | the corpus |
| `scoring_spec` | `ScoringSpec` | how per-case results fold into an aggregate `Score` (weights, determinism, seed) |
| `registered_at`, `registered_by` | | registration is a logged act (author ≠ reviewer applies to eval sets too) |

### 4.5 `EvaluationCase` and `EvaluationRun`

```
EvaluationCase { case_id, input_scenario, grading: {rubric | expected}, weight }

EvaluationRun {
    run_id:            EvalRunId,
    eval_set_id:       EvalSetId,
    eval_set_version:  EvalSetVersion,   // the run is pinned to a version
    subject_kind:      Baseline | Candidate,
    subject_ref:       CharterVersion | RevisionId,
    aggregate_score:   Score,            // inspectable
    per_case:          [CaseResult],     // inspectable, revertible — mirrors M26's guarantee
    seed:              u64,              // deterministic where the grader permits
    ran_at:            Timestamp,
}
```

A run is the *only* producer of a `Score`. The gate compares a **Candidate** run to a **Baseline** run over the
**same** `eval_set_version` (§8.2). Baseline runs are cached per `(eval_set_version, base_version)` (§15).

### 4.6 The proposal → Decision link

On `confirm_revision`, three things happen atomically (§9):

1. A **Decision** record is created (`authority: principal`, criteria = the eval report, reversibility ≥ 2,
   review date set).
2. A new `agent_versions` row is written: `version = base_version + 1`, `charter = proposed_charter`.
3. The new version and the Decision id are stamped onto the hash chain in a `CharterRevisionConfirmed` event.

The version *cites* the Decision that authorised it. There is no version without a Decision, and no Decision is
edited after the fact (ADR-0002; decision engine §5).

### 4.7 Relationships (ASCII)

```
Archetype        1 ──── 1   EvaluationSet            (attached, at a version; ADR-0073)
Archetype        1 ──── *   agent_versions           (the versioned charter data; ADR-0014)
Archetype        1 ──── *   CharterRevision          (candidates, most never become versions)
CharterRevision  1 ──── 1   Provenance               (REQUIRED — the M26 refs that motivated it)
CharterRevision  1 ──── *   EvaluationRun            (one candidate run + the compared baseline run)
CharterRevision  0..1 ── 1  DecisionId               (present only on Confirmed)
CharterRevision  ──(confirm)──►  agent_versions row  (version = base_version + 1)  ONLY via §9
EvaluationRun    * ──── 1   EvaluationSet@version     (pinned; never mixes versions)
relation_to_base ∈ {Same,Narrower,Wider,Incomparable}   (ADR-0033, reused unchanged)
```

The `Archetype 1──1 EvaluationSet` edge is the gate. The `CharterRevision ──confirm──► agent_versions` edge is
the *only* write into charter versions, and it exists solely inside `confirm_revision` with a Decision id.

---

## 5. The candidate charter and proposal validation

### 5.1 Shape

A `proposed_charter` is the archetype charter shape (ADR-0014: v1's ten-section employee spec plus four
fields), as data. It is never code and never a prompt template with executable behaviour — it is the same JSON
that `agent_versions` already stores.

```
proposed_charter = {
  purpose, responsibilities[], refusals[],           # the ten-section spec (docs/03-employee-specs.md)
  personality, memory, goals[], routine, knowledge,
  kpis[]:            [{id, name, target, window}],
  decision_bounds:   {can_decide[], must_escalate[], never[]},
  capabilities[]:    ["..."],                         # the standing fence — authority-bearing (1 of the 4 archetype fields)
  model_class, standards[], instantiation             # the other 3 archetype fields (ADR-0014)
}
```

### 5.2 Which fields are authority-bearing (the ADR-0033 mapping)

The gate must know which charter fields carry authority, because a change to one of them is a candidate
widening. This is exactly ADR-0033's narrowing-direction table, applied to the charter fields M27 touches:

| Charter field | Narrower means | Authority-bearing? |
|---|---|---|
| `capabilities` (standing fence) | **superset** of capabilities is narrower only if fences tighten; a *subset* of fences / *superset* of capabilities is **wider** | **Yes** — removing a Fence or adding a capability widens (ADR-0033 `fences`) |
| `decision_bounds.never` / `.must_escalate` | more in `never`/`must_escalate` is narrower | **Yes** — moving an item out of `never` widens |
| `effect_ceiling` (via capabilities/standards) | lower class is narrower | **Yes** — ADR-0033 `effect_ceiling` |
| `departments_allowed` (where the archetype scopes it) | subset, **empty = universal** | **Yes** — the ADR-0033 inversion applies verbatim |
| `purpose`, `responsibilities`, `refusals`, `personality`, `kpis`, `standards` (content) | not an ordering — a genuine change is `Incomparable` on that field | Content-bearing; a change routes through eval, and if it perturbs an authority field it is caught by the fold |
| `model_class`, `instantiation` | not authority — routing/lifecycle | No (but still evaluated) |

The fold is ADR-0033's fold, unchanged: any authority field `Wider`, or a mix of `Narrower` and `Wider`, →
`Incomparable` → treated as widening → refused at the automatic gate (§10.3). **M27 declares no new narrowing
directions; it inherits ADR-0033's table and extends it only in the same change that adds a charter field, per
ADR-0033's normative rule.**

### 5.3 Proposal validation checks (hard refusal, no override)

Mirrors the ten install checks of a Pack. Each failure names its rule and lands a `CharterRevisionRefused`
event.

1. `proposed_charter` is well-formed against the `agent_versions` charter schema; every required section
   present.
2. `archetype_id` names an installed archetype (M13); `base_version` is that archetype's *current* version.
3. `proposed_by` is the evolution engine — **an archetype instance actor is refused here** (author ≠ reviewer;
   GUIDE §3 item 9).
4. `provenance` is present, its `archetype_id` equals the revision's, and its `outcome_refs`/`kpi_refs` resolve
   to existing local rows for this archetype (else `NoProvenance` or `WrongArchetype`).
5. The candidate touches no field outside the charter schema — a revision cannot introduce an executable hook,
   a network address, or a credential (redaction scan reused from M3 §9; charters are data).
6. The archetype has a registered evaluation set at a known version (else the run will fail closed at §8.4 —
   recorded now as a precondition so the refusal reason is precise).

Checks 1–6 run at `propose`; the authority relation (ADR-0033) and the eval score are computed at
`run_evaluation` (§8), because both require the baseline.

---

## 6. Component structure

```
                          ┌──────────────────────────────────────────────────┐
   M26 outcome record ───►│              sidra-evolution (kernel)             │
   (a shortfall observed) │                                                   │
                          │  Proposer                                         │
                          │    │  1. build candidate charter + provenance     │
                          │    ▼                                              │
                          │  RevisionStore ──► CharterRevision (Proposed)     │
                          │    │                                              │
                          │    ▼  2. run_evaluation                           │
                          │  Gate                                             │
                          │    ├─ EvalRunner  ── candidate run + baseline run │
                          │    │                    (over EvaluationSet@ver)  │
                          │    ├─ Comparator  ── relation_to (ADR-0033)       │
                          │    └─ verdict: Refused{...} | AwaitingPrincipal   │
                          │    │                                              │
                          └────┼──────────────────────┬─────────────────────┘
                               │ AwaitingPrincipal     │ Refused{...}
                               ▼                       ▼
                        ┌─────────────┐          audited CharterRevisionRefused
                        │  Principal  │          (event on hash chain — terminal)
                        │  (a Seat)   │
                        └──────┬──────┘  confirm_revision
                               ▼
                        Confirmer ──► DecisionEngine (create Decision, authority=principal)
                               │   └─► agent_versions += 1 (version = base+1, cites decision_id)
                               ▼
                        audited CharterRevisionConfirmed (decision_id + new version, hash chain)
```

Internal modules of `sidra-evolution`:

| Module | Responsibility |
|---|---|
| `proposer` | build a candidate charter + provenance from an M26 outcome signal; the *only* writer of a Proposed revision; holds no version-write path |
| `revision` | the `CharterRevision` store: create, list-by-archetype, status; forward-only history |
| `evalset` | register and version an archetype's evaluation set; the corpus of cases and the scoring spec |
| `evalrun` | execute a charter (candidate or baseline) over an eval set@version; deterministic where the grader permits; produce an inspectable `EvaluationRun` |
| `gate` | the regress gate: fold eval scores + the ADR-0033 `relation_to` into a `RevisionVerdict`; the refusal reasons of §8 |
| `confirm` | the propose→Decision link: create the Decision, materialise the version, stamp the chain — the sole version-writer |
| `provenance` | validate and resolve M26 outcome/KPI references; refuse a proposal with none |
| `events` | the `CharterRevisionEvent` variants; hash-chain emission (ADR-0002) |
| `mirror` | the human-readable Vault Markdown mirror on state transitions |
| `conformance` | the exit-criterion harness (regress-refused, accept-is-a-Decision) and the acceptance suite |

**Dependency direction (ADR-0011).** `packages/domain ← services/evolution ← apps/*`. `services/evolution`
depends on `services/security` (Broker, actor/Seat), `services/store`, `services/departments` (archetypes,
Registrar), the Decision engine (`services/decisions`), `packages/domain` (the `Charter` type and
`Charter::relation_to` from ADR-0033), and the M26 outcome-record **read** surface (working name
`services/calibration`). It does **not** depend on `services/orchestrator` or `services/mission`, and it has
**no write edge to `agent_versions` outside `confirm`** — both absences are compile/CI properties (§18).

---

## 7. Security

The evolution surface is unusual: it is the one subsystem whose *output is authority itself* — a charter is a
capability ceiling, a fence set, an effect ceiling. A defect here does not leak data; it grants power. Every
mitigation below is an application of an existing control (ADR-0033's comparison, the Broker, the Decision
engine, redaction), not a new one.

| Threat | How M27 addresses it |
|---|---|
| **T-E1 Self-promotion** — the Firm merges a charter without the Principal | Structurally impossible: `confirm_revision` is the only version-writer, requires a Principal Seat actor and a Decision id; the engine has no other write path (Principle 14; ADR-0072; invariant §3.3.1). CI asserts no version write outside `confirm`. |
| **T-E2 Silent authority widening** — a revision removes a Fence / raises an effect ceiling disguised as a performance tune | The gate computes `relation_to(candidate, base)` (ADR-0033). A subset of fences (broader authority) folds to `Wider`/`Incomparable` → `Refused{Widening}`. A performance improvement cannot smuggle authority; the comparison is structural, not a review heuristic (§10.3; F2). |
| **T-E3 Eval-set bypass** — merge a regressing revision by skipping the run | No path from `propose` to a version omits `run_evaluation` (invariant §3.3.2); the gate is not a setting (ADR-0073); CI asserts `confirm` is unreachable without a passing run (§18, AC7). |
| **T-E4 Eval-set weakening** — swap the corpus for a weaker one so a regression scores as a pass | Eval sets are versioned; registration is a logged event; the baseline is re-run on the **same** `eval_set_version` as the candidate (§8.2); changing the eval set is itself a change subject to author ≠ reviewer (a self-serving weakening authored by the archetype under revision is refused, §5.3 check 3, applied to eval-set registration). |
| **T-E5 Author = reviewer** — an archetype approves its own revision | `confirm_revision` requires a Principal Seat; an agent actor is refused (GUIDE §3 item 9; ADR-0008). The proposer (engine) is a different subject from the reviewer (gate + Principal). |
| **T-E6 Cross-archetype smuggling** — a revision for archetype B carries archetype A's (better) provenance or eval set | `WrongArchetype` refusal: the eval set is bound one-to-one to its archetype, and provenance's `archetype_id` must equal the revision's (§5.3 check 4; §8.3; F3). |
| **T-E7 Forged / absent provenance** — a proposal with no basis in observed performance | `NoProvenance` refusal: provenance is required and must resolve to existing local outcome/KPI rows for this archetype (§8.5; F8). |
| **T-E8 Telemetry leak** — a score or ranking leaves the machine | ADR-0009, a permanent no: eval runs use local models over a local corpus; scores and provenance are local data; CI no-network assertion over an evaluation run (§18, AC10). |

**The choke point holds.** A charter revision is proposed by the engine, gated mechanically, and merged only by
a Principal Decision through the Broker. M27 adds the gate *ahead* of the Principal and the Decision *at*
acceptance; it removes nothing. The Firm gains the power to *ask*, never the power to *grant itself*.

---

## 8. The regress gate (ADR-0072 in mechanism)

On `run_evaluation(revision)` the gate produces exactly one `RevisionVerdict`. The order is fixed and no step
is skippable.

### 8.1 Preconditions
Resolve the archetype's **current** evaluation set and its version. If none exists → `Refused{NoEvaluationSet}`
(§8.4). Resolve `base_version`; if the archetype has advanced past the revision's `base_version` since it was
proposed, the run is halted and the revision is refused/rebased (§14, F5).

### 8.2 Eval comparison — "does it regress its evaluation set?"
Execute a **Candidate** run (the `proposed_charter`) and a **Baseline** run (the `base_version` charter) over
the **same** `eval_set_version`, with the same seed where the grader is deterministic. Compare aggregate
scores:

- `candidate.aggregate_score < baseline.aggregate_score` → **`Refused{EvalRegression}`** (terminal). *This is
  the exit criterion's first half:* a proposed revision that regresses its evaluation set is refused — at the
  gate, before any Principal involvement, proven by a regressing-fixture test (§17, AC1).
- `candidate.aggregate_score ≥ baseline.aggregate_score` → the eval component **passes**; proceed to §8.3.

Both runs and their per-case results are stored and inspectable (mirrors M26's inspectable/revertible
guarantee). A tie (`==`) passes the eval component — it does not *improve*, but it does not *regress*; whether a
non-improving revision is worth the Principal's attention is the Principal's call, not the gate's.

### 8.3 Authority comparison — "does it widen?"
Compute `relation_to(candidate, base)` (ADR-0033, unchanged):

- `relation ∈ {Same, Narrower}` **and** provenance present → **`AwaitingPrincipal`**. The revision is eligible;
  it is not accepted (§9).
- `relation ∈ {Wider, Incomparable}` → **`Refused{Widening}`** (terminal in the automatic path; §10.3). A
  performance signal never justifies more authority; a widening is admissible only as a separate Principal
  widening Decision (§10.3, F2).
- provenance absent → **`Refused{NoProvenance}`**.

### 8.4 The missing-eval-set rule (fail closed)
No evaluation set → the gate **cannot prove non-regression** → **`Refused{NoEvaluationSet}`**. This is the
GUIDE §3 item 15 rule made mechanical: "a charter change that regresses its evaluation set does not merge"
degrades safely to "a charter change that *cannot be shown not to regress* does not merge." Absence is refusal,
never a free pass.

### 8.5 Provenance and archetype binding
The gate re-checks that the candidate's `archetype_id` equals the eval set's and the provenance's; a mismatch
is `Refused{WrongArchetype}` (§7 T-E6). A proposal that reached the gate without provenance (should be caught
at §5.3) is `Refused{NoProvenance}` here as a defence in depth.

### 8.6 The verdict is terminal or eligible, never accepted
The gate never accepts. Its two non-refusal outcomes are `AwaitingPrincipal` (eligible) and nothing else.
Acceptance is §9, and it is a Principal act.

---

## 9. The propose → confirm authorization path (ADR-0072/0073 in mechanism)

On `confirm_revision(revision, actor)`:

1. **Eligibility.** The revision must be in `AwaitingPrincipal`. A revision that is `Refused`, `Proposed`,
   `Evaluating`, `Confirmed`, or `Rejected` cannot be confirmed. There is no "confirm a refused revision"
   override.
2. **Actor is a Principal Seat.** The actor must be a Principal Seat (M21's actor field, already on the chain),
   **not** an agent — this is the author ≠ reviewer enforcement (GUIDE §3 item 9). An agent actor is refused
   structurally, through the Broker, before anything is written.
3. **Base still current.** `base_version` must still be the archetype's current version. If the archetype
   advanced (a different revision confirmed meanwhile), this revision is refused/rebased — a confirm never
   overwrites a newer version (§14, F5; ADR-0002).
4. **Create the Decision.** A decision-engine record is created: `authority: principal`, criteria = the eval
   report (candidate vs. baseline, per-case), reversibility ≥ 2 (a charter change is reversible at real cost),
   a review date, and the "what would make this wrong" field (decision engine §4).
5. **Materialise the version.** A new `agent_versions` row: `version = base_version + 1`,
   `charter = proposed_charter`, created atomically with the Decision id stamped in the
   `CharterRevisionConfirmed` event.

Steps 1–3 are the pre-flight; step 2 is the choke point (the Broker + Seat check); steps 4–5 are the only
version write in the subsystem. No step is skippable and the order is fixed. **No revision merges without both
(a) a passing evaluation run (§8) and (b) this Principal confirmation.**

---

## 10. What "regress" means — the comparison semantics (ADR-0033 applied)

M27 does not invent a comparison. It applies ADR-0033's partial order at two sites, and defines "regress" as
failing at *either*.

### 10.1 Regression on the evaluation set (a numeric drop)
A lower aggregate score on the same eval-set version. Numeric, deterministic where the grader permits, and the
exit criterion's first half. Caught at §8.2.

### 10.2 Regression as widening (the partial order)
ADR-0033 exists because a charter has many fields and "better" is not a total order. A revision that improves a
KPI while removing a Fence is *wider in one dimension* — and ADR-0033 folds that to `Incomparable`, treated as
widening. Caught at §8.3. This is the load-bearing reuse: **"does this revision regress?" is answered by the
same `relation_to` M15 uses for replanning, so the two subsystems cannot drift apart on what "wider" means.**

### 10.3 Why a widening is refused, not routed
A widening (`Wider`/`Incomparable`) is refused at the automatic gate — **not** routed to the Principal as a
performance improvement — for one reason: the Firm may not *propose more authority for itself* (Principle 14;
`/MILESTONE_REGISTRY.md` §4). A performance signal (M26 data) is evidence about *quality of work*, never a
mandate for *more power*. So:

- In M27's automatic propose→confirm loop, a widening is **`Refused{Widening}`** (terminal).
- A widening may still enter a charter — but only through a **separately-authored Principal widening Decision**
  that names the widened field and its direction (ADR-0033), initiated by the Principal, not proposed by the
  Firm. That path is a Charter Amendment, out of M27's automatic scope, and it never rides on an eval pass.

This reconciles the two true statements the registry and the design both require: a widening is *refused* (as a
self-promotion) **and** a widening *needs a Decision* (the only way it ever merges). The distinction is *who
initiates it*: the Firm never does; the Principal may.

### 10.4 The four-way outcome, compressed

| Eval component | ADR-0033 relation | Provenance | Verdict |
|---|---|---|---|
| regress (score down) | any | any | `Refused{EvalRegression}` |
| pass (≥ baseline) | Same / Narrower | present | `AwaitingPrincipal` (eligible) |
| pass | Wider / Incomparable | present | `Refused{Widening}` (automatic path) |
| pass | Same / Narrower | absent | `Refused{NoProvenance}` |
| — (no eval set) | — | — | `Refused{NoEvaluationSet}` |
| — (archetype mismatch) | — | — | `Refused{WrongArchetype}` |

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 New tables — all additive projections (forward-only migrations, `0061`–`0063`)

| Migration | Table | Purpose |
|---|---|---|
| `0061_charter_revisions.sql` | `charter_revisions` | the proposal: `revision_id`, `archetype_id`, `base_version`, `proposed_charter` (JSON), `relation_to_base`, `status`, refusal `reason`, `decision_id` (nullable until Confirmed), `proposed_by`, timestamps |
| `0061_charter_revisions.sql` | `charter_revision_provenance` | the M26 refs that motivated a revision: `revision_id`, `outcome_ref`, `kpi_ref`, `rationale` — a child of the same migration (kept in-band) |
| `0062_evaluation_sets.sql` | `evaluation_sets` | per-archetype corpus: `eval_set_id`, `archetype_id`, `eval_set_version`, `cases` (JSON), `scoring_spec` (JSON), `registered_at/by` |
| `0063_evaluation_runs.sql` | `evaluation_runs` | one run: `run_id`, `eval_set_id`, `eval_set_version`, `subject_kind`, `subject_ref`, `aggregate_score`, `per_case` (JSON), `seed`, `ran_at` |

**The set used:** three migrations, `0061`–`0063`, with the provenance child folded into `0061` to stay within
the pinned band. No existing table's meaning changes; `agent_versions` is *appended to* by `confirm` (a new
row), never altered. An archetype with no proposed revision has zero rows in all four tables and behaves
exactly as pre-M27 (G10). Migrations are forward-only, idempotent, and independently deployable (GUIDE DoD §6).

### 11.2 Domain events

Every event carries `actor`, `archetype_id`, and (where applicable) `revision_id`, `eval_run_id`, or
`decision_id`, and lands on the hash chain (ADR-0002):

`CharterRevisionProposed` · `EvaluationSetRegistered` · `EvaluationRunRecorded` · `CharterRevisionEvaluated`
(carries the run ids, aggregate scores, and `relation_to_base`) · `CharterRevisionRefused` (carries `reason` ∈
{EvalRegression, NoEvaluationSet, WrongArchetype, Widening, NoProvenance}) · `CharterRevisionAwaitingPrincipal`
· `CharterRevisionConfirmed` (carries `decision_id` and the new `version`) · `CharterRevisionRejected` (carries
the Principal's reason).

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── archetypes/
    └── <archetype-id>/
        ├── charter.md              current confirmed charter — human-readable
        ├── evaluation-set.md       the corpus: cases, scoring spec, version — no secrets, no code
        ├── revisions/
        │   └── <revision-id>.md    proposed charter, candidate-vs-baseline score, the ADR-0033
        │                           relation, the verdict, and (if confirmed) the Decision link
        └── versions/
            └── v<n>.md             each prior confirmed charter, interpretable on its own
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every archetype, every proposed revision, why it was refused or accepted, the score that gated it, and the
Decision that confirmed it — the whole "how did this charter come to be shaped this way" question with a
traceable answer (Principle 14).

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `propose_charter_revision(archetype, candidate, provenance) -> RevisionId` | Proposed | caller is the evolution engine; refused if `proposed_by` is an archetype instance, or provenance is absent/foreign (§5.3) |
| `run_evaluation(revision) -> RevisionVerdict` | Evaluating → Refused \| AwaitingPrincipal | runs candidate + baseline over the eval set@version; the §8 gate; a Refused verdict is terminal |
| `confirm_revision(revision, principal) -> DecisionId` | Confirmed | a Principal **Decision**; requires a Principal Seat actor; the **only** version-writer (§9) |
| `reject_revision(revision, principal, reason)` | Rejected | a Principal Seat records a reason; the motivating outcome data persists |
| `register_evaluation_set(archetype, cases, scoring) -> EvalSetVersion` | — | registers/versions the gate corpus; a logged act requiring a **Principal Seat actor through the Broker** (like `confirm`). Author ≠ reviewer is enforced at registration time by comparing the registering actor's identity to the target `archetype`: an actor that *is* an instance of the gated archetype (or acting on its behalf) is refused — an archetype cannot author the set that gates its own revisions |

### 12.2 Queries

| Query | Returns |
|---|---|
| `list_revisions(archetype)` | every revision and its status/verdict |
| `revision_status(revision)` | lifecycle state + refusal reason or Decision id |
| `evaluation_report(revision)` | candidate vs. baseline aggregate + per-case scores — inspectable |
| `list_evaluation_sets(archetype)` | the archetype's eval sets and versions |
| `charter_history(archetype)` | the version chain, each version's Decision id |

### 12.3 API rules

1. **No API materialises a charter version except `confirm_revision`, and it requires a Principal Decision.**
   There is no side-door; the engine cannot promote itself (ADR-0072; invariant §3.3.1).
2. **The evaluation gate cannot be disabled.** `run_evaluation` is a mandatory predecessor of
   `confirm_revision`; a Refused verdict is terminal; there is no flag that lets a revision skip the run
   (ADR-0073).
3. **`propose`, `confirm`, `reject`, `register_evaluation_set` are logged acts;** `confirm` and `reject` are
   Principal Decisions/records, with the eval report and the plain-language rationale shown before the act.
4. **A widening is refused in the automatic path** (§10.3). No API accepts a `Wider`/`Incomparable` revision as
   a performance improvement.
5. **All learning is local.** No API transmits a score, a ranking, or a revision off the machine (ADR-0009).

---

## 13. Sequence diagrams

### 13.1 The regressing revision refused at the gate (the exit criterion — first half)

```
Engine            sidra-evolution(gate)        EvalRunner            (no Principal involved)
  │ propose(archetype, candidate, provenance)      │
  ├───────────────────────────►│ §5.3 checks ok → Proposed          │
  │ run_evaluation             │                   │
  ├───────────────────────────►│ resolve eval set@ver               │
  │                            │ baseline run ─────►│ score = 0.81   │
  │                            │ candidate run ────►│ score = 0.73   │
  │                            │ 0.73 < 0.81  → REGRESS              │
  │◄── Refused{EvalRegression}─┤ audit CharterRevisionRefused       │
  │  (no relation computed for acceptance, no Principal asked, no version written — refusal is structural)
```

### 13.2 The accepted revision confirmed as a Principal Decision (the exit criterion — second half)

```
Engine        gate/EvalRunner     Comparator(ADR-0033)   Principal(Seat)   DecisionEngine   agent_versions
  │ propose+run_evaluation │             │                    │                │              │
  ├───────────────────────►│ baseline 0.81 · candidate 0.88   │                │              │
  │                        │ pass (0.88 ≥ 0.81)               │                │              │
  │                        ├── relation_to(candidate, base) ─►│ Narrower       │              │
  │◄── AwaitingPrincipal ──┤ audit CharterRevisionEvaluated   │                │              │
  │        (present the eval report + rationale to the Principal)                │              │
  │                        │                    confirm_revision(principal)      │              │
  │                        │                    ├──────────────►│ Seat actor ok  │              │
  │                        │                    │               ├─ create Decision(authority=principal) ─►│
  │                        │                    │               │◄── decision_id ─┤              │
  │                        │                    │               ├─ write version = base+1, cites decision_id ─►│
  │                        │◄── CharterRevisionConfirmed(decision_id, version) on the hash chain ─┤
  │  (old versions untouched; running instances keep their frozen charter until a natural boundary — ADR-0014)
```

### 13.3 The widening refused at the automatic gate

```
Engine            gate/Comparator(ADR-0033)
  │ propose (candidate removes a Fence) + run_evaluation │
  ├─────────────────────────────►│ baseline 0.80 · candidate 0.86 → pass
  │                              │ relation_to(candidate, base) = Wider  (fewer fences ⇒ broader authority)
  │◄── Refused{Widening} ────────┤ audit CharterRevisionRefused{Widening}
  │  (an eval pass does NOT carry a widening through; a widening is a Principal-initiated Amendment, never a Firm proposal — §10.3)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A revision scores worse on its eval set | `Refused{EvalRegression}` at §8.2, before the Principal; audited (exit criterion, AC1) |
| F2 | A revision passes eval but widens authority | `Refused{Widening}` at the automatic gate (§10.3); admissible only as a separately-authored Principal widening Decision naming the field (ADR-0033); never bundled into a performance acceptance |
| F3 | A revision proposed for archetype B carries A's eval set / provenance | `Refused{WrongArchetype}` (§8.3, §8.5); the eval set is bound to its archetype and provenance's archetype must match |
| F4 | An evaluation run crashes or times out | the run is marked failed; the verdict is **withheld** (no verdict = no merge, fail closed); retried off the hot path (§15); the revision never advances on a missing run |
| F5 | The archetype advanced (a different revision confirmed) while this one awaited the Principal | `base_version` conflict at §9 step 3; this revision is refused/rebased; a confirm never overwrites a newer version (ADR-0002) |
| F6 | The Principal rejects an eligible revision | `Rejected` with a recorded reason; the motivating outcome data persists; a fresh proposal + fresh run may follow later (a new revision, never a retry of the rejected one) |
| F7 | An agent attempts to confirm its own (or any) revision | refused at §9 step 2 — `confirm_revision` requires a Principal Seat; author ≠ reviewer (GUIDE §3 item 9) |
| F8 | A proposal arrives with no provenance / forged refs | `Refused{NoProvenance}` (§5.3 check 4, §8.5); provenance must resolve to existing local outcome/KPI rows for this archetype |
| F9 | No evaluation set is registered for the archetype | `Refused{NoEvaluationSet}` (§8.4); absence fails closed — never a free pass |
| F10 | An archetype tries to author (weaken) the eval set that gates it | refused: `register_evaluation_set` is a logged act subject to author ≠ reviewer; a self-serving weakening authored by the archetype under revision is rejected (§7 T-E4) |

---

## 15. Performance, local execution, and offline

- **Evaluation runs are off the hot path.** A `run_evaluation` is scheduled work, never inline with a Mission
  or a Work Order. The Mission scheduler's determinism (M15 §17) is untouched — an evaluation run is not a
  Mission and cannot block one. A proposal that is mid-evaluation delays nothing the Firm is doing for the
  Principal.
- **Baseline scores are cached.** A `(eval_set_version, base_version)` baseline is computed once and reused
  across every candidate against that base; a candidate run is the only new work per proposal.
- **The gate computation is trivial.** `relation_to` is O(charter fields) (ADR-0033); the eval fold is O(cases)
  over a bounded corpus. The cost of an evaluation run is the model calls of the corpus, and that budget is
  bounded and cancellable — an over-long run is terminated, its verdict withheld (F4), never blocking.
- **Learning is local and offline-safe.** Evaluation runs use the local models and the local corpus; nothing
  reaches the network (ADR-0009). Disconnect everything and the whole evolution loop still runs — propose,
  evaluate, gate, and (with the Principal present) confirm — because none of it depends on a remote service.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| **M26 — Outcome Calibration** | the performance signal that motivates a proposal and the outcome/KPI rows provenance points to. **D-1:** M26 must be Documented and its outcome-record read surface (`sidra-calibration`) must exist before M27 implementation completes (see `00-M26-AUDIT.md`). M27 architecture depends only on M26's registry-pinned contract; the implementation plan gates evaluation-run scoring behind this read surface (E2). |
| **M13 — Departments & Role Archetypes** | the unit that improves: archetypes as versioned charter data, the Registrar that resolves them (ADR-0014) |
| ADR-0033 — `Charter::relation_to` | the partial-order comparison the gate reuses to define "widens"; `Incomparable`-is-widening and the `departments_allowed` inversion, verbatim |
| Decision engine (`/docs/03-decision-engine.md`) | acceptance is a Decision (`authority: principal`, criteria, reversibility, review date) |
| M21 — Seats (actor field) | the Principal Seat actor that `confirm_revision` requires; author ≠ reviewer enforcement |
| M3 — Permission Broker, redaction | `confirm` passes the Broker; the charter redaction scan (no code/credential in a charter) |
| M2 — event log | audited revision events on the hash chain |

### 16.2 Assumptions

1. M26's outcome records are local, inspectable, and revertible (its exit criterion). M27 treats them as a
   read-only feed; if M26's read surface is not yet named as a crate, M27 depends on the contract and wires the
   module when M26 lands (D-1).
2. An archetype has, or can be given, a registered evaluation set. An archetype with none cannot be evolved —
   its revisions fail closed (§8.4) — which is the correct behaviour, not a gap.
3. Evaluation runs execute against the local models the Firm already uses. Non-local grading (a remote judge)
   is out of scope and would contradict ADR-0009 — it is a permanent no, not a future ADR.
4. The Principal is a Seat (M21). A Firm running as a single implicit Seat still has exactly one confirming
   actor; the model is unchanged.

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| ER-1 | An eval set that is too weak lets a truly worse charter score as "no regression" | eval sets are versioned and inspectable; weakening the set is a logged act under author ≠ reviewer (§7 T-E4); the mitigation is corpus quality, and it is the Principal's to inspect — the gate guarantees *non-regression against the declared set*, not omniscience |
| ER-2 | A widening slips through as `Incomparable` misread as "just different" | ADR-0033 folds `Incomparable` to widening at the type level; the gate treats it as `Wider`; no caller may collapse the distinction (ADR-0033 Consequences) |
| ER-3 | The engine accretes archetype-specific logic ("special-case the reviewer charter") | CI grep for archetype ids in the crate fails the build (G9), mirroring the kernel no-department-logic rule |
| ER-4 | A confirmed revision retroactively changes a running instance's behaviour | ADR-0014 freezing: a revision is a new *archetype* version; running instances keep their frozen charter; `turns.agent_version` proves which version a Turn ran under (G7) |
| ER-5 | Migration breaks a pre-M27 Firm | forward-only, additive; a null revision set is exactly pre-M27 behaviour; each migration independently deployable |
| ER-6 | Implementation begins before M26 exists and the eval feed is stubbed permanently | D-1 is the first line of the STOP note; E2 is explicitly gated on M26's read surface; the isolation of the feed behind one module keeps this a wiring risk, not a redesign |

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | **A proposed charter revision that regresses its evaluation set is refused at the gate**, before any Principal involvement and with no version written | the exit-criterion **regressing-fixture test** (§13.1): a candidate charter that scores below baseline yields `Refused{EvalRegression}`, asserted structurally |
| AC2 | **An accepted revision is a Principal-confirmed Decision** — a Decision record (`authority: principal`) exists and the new `agent_versions` row cites its id on the hash chain | the accept-path test (§13.2): assert the Decision record + the version→decision_id link + the `CharterRevisionConfirmed` event |
| AC3 | **No revision merges without both** a passing evaluation run and a Principal confirmation | two tests: (a) `confirm_revision` fails on a revision with no passing run; (b) a passing run alone produces no version |
| AC4 | A missing evaluation set → no merge (`Refused{NoEvaluationSet}`), fail closed | no-eval-set fixture test asserting refusal, not a free pass |
| AC5 | A revision that widens authority under ADR-0033 (`Wider`/`Incomparable`), including a smuggled broader Fence, is refused at the automatic gate | widening-fixture test (removed Fence / raised ceiling) asserting `Refused{Widening}` |
| AC6 | A revision targeting a different archetype than its eval set/provenance is refused | cross-archetype fixture test asserting `Refused{WrongArchetype}` |
| AC7 | The evaluation gate cannot be disabled or bypassed | CI check: no code path reaches a version write without a passing run; the gate is not a runtime setting |
| AC8 | Author ≠ reviewer — an agent actor cannot confirm a revision; only a Principal Seat | actor-check test asserting an agent-actor confirm is refused |
| AC9 | Old versions stay interpretable — a confirmed revision is a new version; prior versions are immutable; a Turn recorded under the old version replays against it | version-immutability + replay test over a lifecycle fixture (ADR-0014, ADR-0002) |
| AC10 | All learning is local — eval runs, scores, provenance never leave the machine | no-network assertion over a full evaluation run (ADR-0009) |
| AC11 | Every propose/evaluate/refuse/confirm/reject is an audited event on the hash chain | `audit.verify` over a revision-lifecycle fixture |
| AC12 | The engine has no write edge to `agent_versions` outside `confirm`, and no dependency on orchestrator/mission | dependency-direction + write-path check in CI; build fails on a hit |

---

## 18. Testing strategy and CI requirements

**Testing strategy.** The exit criterion is two fixtures: a **regressing** candidate (proves AC1 — refused at
the gate) and a **passing, narrowing** candidate carried through a Principal confirm (proves AC2/AC3 — a
Decision-backed version). Around them: a widening fixture (AC5), a cross-archetype fixture (AC6), a
no-eval-set fixture (AC4), an agent-actor-confirm fixture (AC8), and a version-immutability/replay fixture
(AC9). Every eval run in the suite is deterministic where the grader permits (seeded) so the gate's verdict is
reproducible.

**CI requirements** (mirroring GUIDE §7 gates, live from M1):

1. **The regress-refusal test is a required check.** The regressing-fixture test (AC1) must be green; it is the
   exit criterion and the *last* thing to go green (E6).
2. **The gate cannot be bypassed.** A CI check asserts no code path writes an `agent_versions` row except
   inside `confirm`, and `confirm` is unreachable without a passing evaluation run (AC7, AC12).
3. **No archetype-specific logic.** A CI grep for archetype ids in `sidra-evolution` fails the build (G9).
4. **No network during an evaluation run.** A CI assertion runs a full evaluation in a network-denied sandbox
   and asserts it completes (AC10; ADR-0009).
5. **Dependency direction.** CI fails on any edge `sidra-evolution → sidra-orchestrator` or `→ sidra-mission`
   (ADR-0011; AC12).
6. **Author ≠ reviewer.** A CI test asserts an agent-actor confirm is refused (AC8; GUIDE §3 item 9).

---

## Appendix A — Glossary additions

- **Charter Revision** — a candidate new version of one archetype's charter, motivated by observed performance,
  proposed by the evolution engine. Data, not code. Never a version until confirmed.
- **Evaluation Set** — a versioned corpus of evaluation cases attached to an archetype; the merge gate for any
  revision of that archetype's charter (GUIDE §3 item 15; ADR-0073).
- **Evaluation Run** — one execution of a charter (candidate or baseline) over an evaluation set at a version,
  producing an inspectable aggregate score and per-case results.
- **The Regress Gate** — the mechanical step that refuses a revision scoring below baseline on its eval set, or
  widening authority under ADR-0033, before any Principal involvement.
- **Regress** — to score lower on the evaluation set (a numeric drop), *or* to widen authority (ADR-0033
  `Wider`/`Incomparable`). Failing at either is a regression.
- **Provenance** — the M26 outcome and KPI records that motivated a proposal; required, and it must reference
  the same archetype.
- **Confirmation** — the Principal's Decision (`authority: principal`) accepting an eligible revision, which
  materialises the new version and ties it to the Decision id on the hash chain.
- **Widening** — a revision whose charter is `Wider` or `Incomparable` relative to its base (ADR-0033);
  refused in M27's automatic path; admissible only as a Principal-initiated Amendment.

## Appendix B — Repository placement

```
services/
└── evolution/                 NEW — crate sidra-evolution
    ├── proposer
    ├── revision
    ├── evalset
    ├── evalrun
    ├── gate
    ├── confirm
    ├── provenance
    ├── events
    ├── mirror
    └── conformance

services/store/migrations/      EXTENDED — 0061_charter_revisions.sql, 0062_evaluation_sets.sql,
                                           0063_evaluation_runs.sql (forward-only)

infrastructure/testing/
└── evolution/                 NEW — regress-refused proof, accept-is-a-Decision proof, widening refusal,
                                     cross-archetype refusal, no-eval-set fail-closed, author≠reviewer,
                                     version-immutability/replay, no-network
```

Dependency direction (ADR-0011): `packages/domain ← services/evolution ← apps/*`. `services/evolution` depends
on `services/security`, `services/store`, `services/departments`, `services/decisions`, `packages/domain`
(`Charter::relation_to`), and the M26 read surface (`services/calibration`); it does **not** depend on
`services/orchestrator` or `services/mission`, and it has **no write edge to `agent_versions` outside
`confirm`**.

## Appendix C — Implementation position

M27 is the second milestone of 4.0 "Continuum". It depends on M26 (the performance data) and M13 (departments &
archetypes). Building it before M26 is the mistake the 00-M26-AUDIT gate exists to prevent: an evolution loop
with no outcome record to point at means "the Firm improves itself" reduces to the Firm rewriting charters on
the basis of nothing — the exact failure ADR-0033's `departments_allowed` inversion and Principle 14 exist to
forbid. And building the *acceptance* side before the *gate* side would let a revision merge before the eval
set can refuse it, which is why E6 (the regress-refused / accept-is-a-Decision proof) is the last thing to go
green.

**Exit criterion.** A proposed charter revision that regresses its evaluation set is refused; an accepted one
is a Decision the Principal confirmed — proven by test, not by configuration (AC1, AC2).
