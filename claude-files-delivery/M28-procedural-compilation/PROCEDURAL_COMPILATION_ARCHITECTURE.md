# Procedural Compilation — Architecture

**Milestone M28 · Release 4.0 "Continuum" · Layer 1 (kernel) over Layer 3 (departments) and Layer 6 (Missions)**

| | |
|---|---|
| Milestone | M28 — Procedural Compilation (`/MILESTONE_REGISTRY.md` §4, 4.0 "Continuum") |
| Release | 4.0 "Continuum" — the Firm improves itself |
| Layer | 1 — kernel machinery reading Layer-6 outcome records, writing Layer-3 candidate procedures |
| New crate | `sidra-compilation` at `services/compilation/` |
| Depends on | M26 (Outcome Calibration — the measurement/observation loop), M7 (Full Firm & the engines — Workflows), M15 (Mission Engine — the observed procedures), M13 (departments — capability scope), M2 (event log) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A procedure repeated five times is proposed as a Workflow; the proposal cites the Missions it derives from — **proven by test, not by configuration** |

> **Authoritative precedence.** Where this document disagrees with `/docs/01-workflow-engine.md` about what a
> Workflow is, that document governs — a candidate is a *proposed Workflow*, nothing more. Where it disagrees
> with `/docs/04-database-design.md` about the shape of `playbooks`, `workflows`, or `workflow_steps`, the
> schema governs — M28 reuses that model and does not redefine it. Where it disagrees with
> `/docs-v2/02-v2-principles.md` (Principle 14) or `/MASTER_IMPLEMENTATION_GUIDE.md` §12 about the
> propose-never-enact constraint, those govern. Where it disagrees with `/docs/0009-no-telemetry.md`
> (ADR-0009) about locality, that ADR governs. This architecture *extends* those boundaries; it never
> re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M27 the Firm plans every Mission from judgement. The Mission Engine (M15) decomposes a Directive into
Objectives and Tasks, sequences them, prices them, and — on `mission.concluded` — writes an **outcome
record**: the Mission's shape, its plan-versus-reality, its verification history, its failures and risks
(`/docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` §23.3). M26 reads those records to calibrate
estimates, novelty scores, and risk weights. That is the measurement loop, and it is local (ADR-0009).

But the Firm re-derives the *same procedure* over and over. When Backend, Cybersecurity, and Software
Engineering each run a Mission whose Tasks are — abstracting away the specific repository, the specific issue,
the specific reviewer — the identical ordered sequence of Work Orders, the Mission Engine plans that sequence
from scratch every time. The plan is a judgement (`MISSION_ENGINE_ARCHITECTURE.md` §1.7), and re-exercising
judgement on solved shapes is exactly the waste the Workflow engine was built to remove: *"Playbooks are
templates learned from experience … so a new procedure needs no code"* (`/docs/01-workflow-engine.md` §9).

The schema has anticipated this since 1.0. The `playbooks` table already carries `derived_from` — a JSON array
of the engagement ids a playbook was learned from — a `status` domain of `proposed | active | retired`, a
`uses` counter, and a `success_rate` (`/docs/04-database-design.md` §6). The column exists; nothing writes it.
**M28 is the machinery that writes it.**

The requirement is not "let the Firm learn Workflows automatically." A subsystem that promotes its own
procedures into standing capability is the single most dangerous thing 4.0 could ship — it is the failure mode
the whole release is defined against (`/MILESTONE_REGISTRY.md` §4: *"Nothing in this release may self-promote:
the Firm proposes, the Principal confirms"*). The requirement is: **observe repeated procedures across Missions
by a normalized signature; when one procedure recurs five times, compile it into a candidate Workflow that
names the exact Missions it derives from; and stop there — a candidate is a proposal, never an activation, and
activating it is a Principal Decision.**

### 1.2 The stance

Two commitments define the subsystem, and each has an ADR:

1. **A procedure repeated five times is *proposed* as a candidate Workflow that cites its source Missions;
   activation is a Principal Decision.** (ADR-0074) The five-recurrence threshold produces a *proposal* in
   status `proposed` — the exact `playbooks` status already in the schema — not a runnable Workflow. Its
   `derived_from` names the ≥5 Missions it was compiled from; the citation is mandatory, not optional. It runs
   only after a Principal activates it, and activation is a Decision (criteria, reversibility, dissent, review
   date — v1 decision engine). A candidate can never grant broader capability than its source procedures held.
2. **"The same procedure" is a normalized procedure signature over the ordered sequence of Work Order shapes.**
   (ADR-0075) Recurrence is decidable only if "the same procedure" is a mechanical fact, not a similarity
   judgement. The signature is a canonical, order-preserving digest over the sequence of Work Order *types*
   (task kind × resolved department-role × effect class × contract shape), with ids, parameters, free text,
   timestamps, and costs abstracted away. Two Missions exhibit the same procedure **iff** their signatures are
   byte-equal. Five *distinct* Missions with an equal signature are the threshold.

### 1.3 What the subsystem is, mechanically

Procedural Compilation is **kernel machinery** (Layer 1) that reads Layer-6 Mission outcome records and writes
Layer-3 candidate procedures. It is a sibling of M26's calibration loop: same substrate (concluded Missions),
same locality (ADR-0009), same "nothing self-promotes" discipline. It reuses the `playbooks` model already in
the store, the Workflow definition format M7 already runs, the event log and hash chain (ADR-0002), and the
Permission Broker and Decision engine that gate every effect (M3). **M28 introduces no new promotion mechanism
and no new execution path.** It observes, it counts, it compiles a proposal, and it hands that proposal to the
Principal.

```
Layer 6  Mission outcome record   ← the observed procedure, written on mission.concluded (M15 §23.3)
Layer 1  sidra-compilation        ← THIS DOC: signature, observation, recurrence, candidate compilation
Layer 3  a workflow_candidate      ← a proposed playbook, cited, awaiting a Principal Decision
Layer 1  M7 Workflow engine        ← runs an ACTIVATED candidate; M28 never runs anything
```

The parallel to M26 is deliberate and load-bearing. M26 turns concluded Missions into *calibrated numbers*;
M28 turns concluded Missions into *proposed procedures*. Neither changes a Mission, neither runs a Turn,
neither self-promotes. The difference is only what they emit — a weight versus a candidate — and both emissions
are inspectable and revertible.

### 1.4 What the subsystem must never become

- **An auto-activated Workflow.** The moment a compiled candidate can run without a Principal Decision, the
  Firm has widened its own standing capability behind the Principal's back — a direct violation of Principle 14
  and `/MASTER_IMPLEMENTATION_GUIDE.md` §12. A candidate is `proposed`; only a Decision moves it to `active`.
  The exit criterion tests that the five-recurrence event produces a *proposal*, and the no-auto-activation
  test asserts that no code path activates a candidate without a Decision.
- **An uncited proposal.** A candidate that cannot name the ≥5 Missions it was compiled from is not a
  candidate; it is a fabrication. Provenance (`derived_from`) is a construction invariant: a `WorkflowCandidate`
  cannot exist with fewer than five distinct cited Missions. The citation-required test asserts this.
- **A candidate that widens capability.** A compiled Workflow whose capability ceiling exceeds the capabilities
  its source procedures actually held cannot be proposed with that widening. Default-deny still holds
  (security model §5): the candidate's ceiling is bounded by the union of the source procedures' held
  capabilities, and a request to exceed it is refused at proposal time, not at activation.
- **A similarity engine.** M28 does not cluster "roughly similar" Missions with a model or an embedding. "The
  same procedure" is signature equality — a deterministic, replayable, model-free fact (ADR-0075), the same
  discipline the scheduler holds (M15 G5, Principle 8). A fuzzy match is a different subsystem that would need
  its own ADR and its own threat model.
- **A second procedural memory.** The outcome record is already a procedural-memory candidate
  (`MISSION_ENGINE_ARCHITECTURE.md` §23.3); the `playbooks` table is already the learned-procedure store. M28
  connects the two. It does not introduce a third store or a parallel taxonomy.

### 1.5 Relationship to existing concepts

| Existing concept | How M28 relates |
|---|---|
| **Mission outcome record** (M15 §23.3) | The observation input. On `mission.concluded` the outcome record carries the Mission's shape — objectives, task count, departments, contracts, risk profile. M28 derives a *signature* from that shape and records one `ProcedureObservation`. It reads the record; it never writes a Mission. |
| **M26 Outcome Calibration** (the measurement loop) | The substrate M28 observes on. M26 established that concluded Missions feed a local, inspectable, revertible learning loop. M28 is a second reader of the same loop, adding procedure recurrence to the numbers M26 already calibrates. M28 depends on M26 for the observation trigger and the locality guarantee. |
| **`playbooks` table** (`/docs/04-database-design.md` §6) | The candidate *is* a `playbooks` row. `derived_from` = the cited Missions (as engagement ids, the column's existing meaning); `status = 'proposed'` at compilation; `steps` = the compiled ordered steps; `uses`/`success_rate` populated only after activation and real runs. Activation promotes `proposed → active` — the transition the status domain was designed for. M28 writes no new procedure store. |
| **Workflow / `workflows` / `workflow_steps`** (M7, `/docs/01-workflow-engine.md`) | A Workflow is a frozen DAG of Steps compiled from a Mandate *or instantiated from a Playbook* (§1). An activated candidate is instantiated exactly this way — as a Playbook the M7 engine already knows how to run. M28 produces the Playbook definition; **M7 runs it**. M28 has no execution path (§9 dependency rule). |
| **Automation engine** (`/docs/04-automation-engine.md`) | The *activation surface*. The automation engine already infers recurring intent ("inferred from three similar Directives", §4) and already proposes-then-dry-runs-then-asks. M28 supplies a stronger, structural signal — five recurrences of an identical *procedure*, not three similar Directives — into the same propose→confirm discipline. An activated candidate may be attached to a `manual` or `event` trigger, subject to the automation engine's existing fence rules; M28 does not create triggers. |
| **Decision engine** (`/docs/03-decision-engine.md`, Principle 14) | Activation is a Decision. Rejecting a candidate is a Decision. Both are logged, reversible-class-stated, review-dated. M28 raises the Decision; the Principal resolves it. |
| **Permission Broker** (M3) | The no-widening ceiling is computed against the capabilities the source Work Orders actually held. On activation, the promoted Playbook's steps are still checked per-Dispatch by the Broker, unchanged. M28 adds a pre-proposal ceiling check; it never replaces the choke point. |
| **ADR-0009 (no telemetry / local learning)** | Every observation, count, and compilation happens on-device and stays on-device. No signature, no candidate, no citation ever leaves the machine. M28 makes no network connection at all. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A procedure recurring five times across **distinct** Missions is mechanically detectable | ADR-0075 normalized signature; §4 domain model; §6 recurrence counter; the exit-criterion test (§17 AC1) |
| G2 | Every candidate names the ≥5 Missions it was compiled from | ADR-0074; `derived_from` is a construction invariant (§4.4, §5.3); the citation-required test (AC2) |
| G3 | A candidate is a **proposal**, never auto-activated; activation is a Principal Decision | ADR-0074; state machine (§5) has no automatic edge into `Activated`; the no-auto-activation test (AC4) |
| G4 | A candidate cannot grant broader capability than its source procedures held | ADR-0074 no-widening rule; §7 ceiling check; default-deny (security model §5); the widening-refusal test (AC5) |
| G5 | Observation is off the hot path; signature matching is bounded | §8; observation runs on `mission.concluded`, asynchronously, like Night Shift consolidation; O(steps) signature, O(1) match |
| G6 | All observation and compilation is **local**; nothing self-promotes | ADR-0009; §7 threat table; no egress; the locality test (AC8) |
| G7 | The candidate reuses the `playbooks` model, not a new store | §4.6, §11.1; a candidate is a `proposed` playbook; activation is `proposed → active` (AC12) |
| G8 | Everything is additive | §11 forward-only migrations 0064–0066; zero observations = exactly pre-M28 behaviour (AC10) |
| G9 | The compilation crate has no path to execution | §6 dependency direction; `sidra-compilation` has no edge to `sidra-orchestrator`/`sidra-mission` (AC11, CI-enforced) |
| G10 | "The same procedure" is deterministic and replayable, not a model judgement | ADR-0075; signature is a pure function of the outcome record; property test over normalization (AC7) |

---

## 3. What is observed, and what "the same procedure" means

### 3.1 The observation input

On `mission.concluded` the Mission Engine writes an outcome record whose **shape** section already contains
what M28 needs (`MISSION_ENGINE_ARCHITECTURE.md` §23.3): *"objectives, task count, departments, contracts, risk
profile"*, and — reconstructable from the `mission_dispatches` and `work_orders` projections (§27.3 there) —
the **ordered sequence of Work Orders** the Mission actually dispatched, each with its task kind, its resolved
department-role, its effect class, and its contract shape.

M28 reads that ordered sequence. It reads nothing about *content* — not the repository name, not the issue
text, not the reviewer's identity, not the cost, not the timestamps. It reads the *shape of the procedure*: in
what order, what kinds of Work Order, to what kinds of role, at what effect classes, under what contract
shapes.

### 3.2 The normalized procedure signature (ADR-0075)

A **procedure signature** is a canonical, order-preserving digest over the sequence of Work Order *types* in a
concluded Mission. It is computed by:

1. **Projecting** each dispatched Work Order to its **normalized step tuple**:

   ```
   NormalizedStep = (
       task_kind,              // e.g. work_order | meeting | gate — the Workflow step kind (workflow-engine §1)
       role_archetype_id,      // the RESOLVED role, not the agent instance (a role, not a person)
       effect_class,           // 1 | 2 | 3 — the declared class of the Work Order (security model §5)
       contract_shape,         // the typed request/response shape (Exchange contract id), NOT its arguments
   )
   ```

2. **Abstracting away** everything that makes two runs of one procedure look different: Work Order ids, agent
   instance ids, engagement ids, mission ids, parameter values, free text, artifact paths, costs, durations,
   timestamps, and retry counts. None of these enter the signature.

3. **Preserving** order and structure: the ordered vector of `NormalizedStep`s, plus the dependency edges
   between them projected to positions (so a fan-out of N is normalized to a single `fanout` step with its
   child template, never to N distinct steps — otherwise the same procedure over 3 documents and over 5
   documents would look different, which it must not).

4. **Canonicalizing and hashing**: the normalized step vector is serialized in a fixed, deterministic
   encoding and hashed. The resulting `SignatureHash` is the identity of the procedure. Two concluded
   Missions have "the same procedure" **iff** their `SignatureHash` values are equal.

The full definition, the abstraction/preservation rules, and why fan-out is collapsed rather than expanded are
ADR-0075. The property the whole milestone rests on: **signature equality is a deterministic, model-free,
replayable function of the outcome record** — the same discipline as the deterministic scheduler
(`MISSION_ENGINE_ARCHITECTURE.md` G5, Principle 8). Given the same concluded Missions, the same signatures are
computed and the same recurrence is detected, forever.

### 3.3 Why five, and why distinct

The threshold is **five distinct Missions**, from the registry exit criterion verbatim: *"A procedure repeated
five times is proposed as a Workflow."* Five, not three (the automation engine's weaker "three similar
Directives" heuristic, §4 there), because a candidate Workflow is a *standing procedural capability* and
carries more weight than a scheduled digest: it is a shape the Firm is proposing to institutionalize. Five
gives enough evidence that the recurrence is a real pattern and not a coincidence, while staying low enough
that a genuinely repeated procedure surfaces within a normal quarter of work.

**Distinct** is load-bearing. Five recurrences must come from five *different* Missions, each with its own
`mission_id`. The same Mission re-planned, retried, or replayed contributes exactly one observation to a
signature's count — otherwise a single Mission with three internal retries could manufacture a threshold, and
the "repeated across Missions" meaning (registry: *"Repeated procedures observed in Missions"*) would be a
lie. §6 enforces distinctness at the counter.

---

## 4. Domain model

### 4.1 Core types

```
MissionId(String)              // from the Mission Engine (M15) — the citation unit
EngagementId(String)           // the id derived_from actually stores (a Mission produces ≥1 Engagement)
SignatureHash(Bytes32)         // canonical digest of the normalized procedure (ADR-0075)
RoleArchetypeId(String)        // the resolved role in a normalized step (M13, ADR-0014)
ContractShapeId(String)        // the typed Exchange/Work Order contract shape, not its arguments
EffectClass(1|2|3)             // the declared class of a Work Order (security model §5)
Capability(String)             // a capability string on the security model's grammar
CandidateId(String)            // stable id of a compiled candidate
DecisionId(String)             // the Principal Decision that activates or rejects (decision engine)
PlaybookId(String)             // the playbooks row a candidate becomes on activation
```

### 4.2 `NormalizedStep` and `ProcedureSignature`

```
NormalizedStep {
    task_kind:        StepKind,          // work_order | meeting | gate | fanout | join | ...
    role_archetype:   RoleArchetypeId,   // the role, never the agent instance
    effect_class:     EffectClass,
    contract_shape:   ContractShapeId,   // shape only — arguments are abstracted away
    child_template:   Option<Box<NormalizedStep>>,  // present only for fanout; the per-child shape
}

ProcedureSignature {
    hash:  SignatureHash,                // the identity — signature equality is procedure equality
    steps: Vec<NormalizedStep>,          // the ordered, canonicalized step vector
    edges: Vec<(usize, usize)>,          // dependency edges projected to positions (structure preserved)
}
```

The `hash` is the whole point: it is what makes "the same procedure" a lookup instead of a judgement. The
`steps`/`edges` are retained so a candidate is *inspectable* — a Principal reviewing a proposal sees the
normalized shape, not only an opaque digest.

### 4.3 `ProcedureObservation` — one sighting per Mission

```
ProcedureObservation {
    mission_id:    MissionId,            // the Mission this sighting came from — the distinctness key
    engagement_id: EngagementId,         // stored in derived_from on compilation (the schema's unit)
    signature:     SignatureHash,        // which procedure was seen
    departments:   Set<DepartmentId>,    // which departments participated (for the ceiling, §7)
    capabilities:  Set<Capability>,      // the union of capabilities the Work Orders actually held (§7)
    observed_at:   Timestamp,            // when mission.concluded fired
}
```

One `ProcedureObservation` is written per concluded Mission per distinct signature it exhibited. (A Mission
normally exhibits exactly one procedure; a compound Mission may exhibit more than one recognizable
sub-procedure — §6.4 — but each sub-procedure is still one sighting keyed to the same `mission_id`, and the
distinctness rule counts each `mission_id` once per signature.)

### 4.4 `WorkflowCandidate` — the proposal

```
WorkflowCandidate {
    candidate_id:      CandidateId,
    signature:         ProcedureSignature,        // the shape being proposed
    derived_from:      Set<EngagementId>,          // REQUIRED, |·| ≥ 5 distinct — the citation (ADR-0074)
    cited_missions:    Set<MissionId>,             // the ≥5 Missions, for human-readable provenance
    definition:        WorkflowDefinition,         // the compiled frozen DAG (playbooks.steps shape)
    capability_ceiling: Set<Capability>,           // = ⋃ source capabilities; the candidate may not exceed it (§7)
    status:            CandidateStatus,            // Proposed | Activated | Rejected | Superseded
    proposed_at:       Timestamp,
    proposed_by:       Actor,                      // the kernel — a machine proposal, not a Principal act
}
```

A `WorkflowCandidate` **cannot be constructed** with `|derived_from| < 5` or with an empty `cited_missions`.
Provenance is not a field that may be null; it is a precondition of existence. This is the citation-required
invariant made structural — the same technique M16 used to make a firm-wide connector grant unrepresentable
(ADR-0035): the type has no valid uncited value.

### 4.5 `CandidateActivation` — the Principal Decision link

```
CandidateActivation {
    candidate_id:      CandidateId,
    decision_id:       DecisionId,         // the Principal Decision — REQUIRED; no activation without one
    activated_playbook: PlaybookId,        // the playbooks row promoted proposed → active
    activated_at:      Timestamp,
    actor:             Actor,              // the Principal (or a delegated Seat, M21) — never the kernel
}
```

`CandidateActivation` requires a `DecisionId`. There is no constructor that activates a candidate without one.
Activation is therefore *structurally* a Principal act, exactly as a connector grant was structurally
per-department in M16. A rejected candidate produces a symmetric record (`CandidateRejection`) carrying its own
`decision_id`.

### 4.6 Relationships and the map to `playbooks` / `workflows`

```
Mission (M15)  1 ──── 1 outcome record ──── 1 ProcedureSignature  (per recognized sub-procedure)
ProcedureObservation  * ──── 1 SignatureHash      (many sightings, one procedure identity)
SignatureHash         1 ──── 0..1 WorkflowCandidate  (a candidate exists once count ≥ 5)
WorkflowCandidate     * ──── ≥5 EngagementId       (derived_from — the mandatory citation)
WorkflowCandidate     1 ──── 0..1 CandidateActivation ──── 1 DecisionId   (activation is a Decision)
WorkflowCandidate.definition ≅ playbooks.steps      (same JSON DAG the M7 engine runs)
```

**The candidate *is* a `playbooks` row.** The mapping is exact, which is why M28 adds no parallel store:

| `WorkflowCandidate` field | `playbooks` column (`/docs/04-database-design.md` §6) |
|---|---|
| `definition` | `steps` — JSON: ordered steps with agent + acceptance |
| `derived_from` (≥5 engagement ids) | `derived_from` — JSON array of engagement ids (**the citation**) |
| `status = Proposed` | `status = 'proposed'` |
| `status = Activated` (via a Decision) | `status = 'active'` |
| `status = Rejected` / lapsed | `status = 'retired'` |
| (populated only after real runs) | `uses`, `success_rate` |
| a human name derived from the shape | `name`, `trigger_desc` |

`workflow_candidates` (migration 0065) is the *compilation-time staging and provenance* projection over that
`playbooks` row — it holds the `SignatureHash`, the normalized `steps`/`edges` for inspection, the
`capability_ceiling`, and the citation, none of which the base `playbooks` schema has a column for. The
`playbooks` row and the `workflow_candidates` row share the candidate's identity. On activation the `playbooks`
row flips `proposed → active`; on rejection it flips to `retired`. The `derived_from` written into `playbooks`
at compilation **is** the exit-criterion citation, in the column the schema already reserved for it.

---

## 5. Candidate state machine

### 5.1 States

```
   observations accumulate (count < 5, no candidate yet)
   ─────────────────────────────────────────────────────►  COUNTING   (a SignatureHash with a tally)
                                                                │  fifth DISTINCT Mission observed
                                                                ▼
                                                            PROPOSED  ────────────────┐
                                                    (status='proposed', cited ≥5,      │
                                                     ceiling computed, definition       │  Principal Decision:
                                                     frozen — a candidate now exists)   │  reject
                                                                │  Principal Decision:  ▼
                                                                │  activate          REJECTED  (status='retired')
                                                                ▼
                                                            ACTIVATED  (status='active' — M7 may now run it)
                                                                │  a newer candidate for the same signature
                                                                ▼   is proposed and activated
                                                            SUPERSEDED (status='retired'; history preserved)
```

`COUNTING` is not a candidate — it is a signature with a running tally of distinct Missions. A
`WorkflowCandidate` object comes into existence **only** at the `PROPOSED` transition, when and because the
fifth distinct Mission is observed, the citation is complete, the capability ceiling is computed, and the
definition is compiled and frozen. There is no state in which a candidate exists uncited or unproposed.

### 5.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `observe` (mission.concluded) | Counting | signature computed; Mission not already counted for this signature (distinctness) |
| Counting | `observe` (5th **distinct** Mission) | Proposed | `|distinct missions| ≥ 5`; citation set = those Missions' engagement ids; capability ceiling ⊇ nothing beyond source (§7); definition compiles and validates against the Workflow validator (`/docs/01-workflow-engine.md` §2) |
| Counting | `observe` (< 5 distinct) | Counting | count incremented; **no candidate produced** (F1) |
| Proposed | `activate` | Activated | a **Principal `DecisionId`** is present; ceiling check re-verified; `playbooks.status → active` |
| Proposed | `reject` | Rejected | a Principal `DecisionId` is present; `playbooks.status → retired` |
| Proposed | (a newer candidate for the same signature is activated) | Superseded | the superseding candidate's `candidate_id` recorded; history immutable (ADR-0002) |
| Proposed \| Activated | (widening detected on re-verify) | — refused | a candidate whose ceiling would exceed source capability cannot advance; refusal is structural (§7) |

### 5.3 Invariants

1. **No candidate reaches `Proposed` with fewer than five distinct cited Missions.** Provenance is a
   construction precondition (§4.4). The citation-required test asserts a four-recurrence signature produces
   *no candidate object at all*, and a five-recurrence signature produces one whose `derived_from` names
   exactly the five (AC1, AC2, AC3).
2. **No candidate reaches `Activated` except through a Principal `DecisionId`.** There is no automatic edge into
   `Activated` in §5.2 — every arrow into it carries a Decision guard. The no-auto-activation test asserts
   that the `PROPOSED` transition leaves the candidate in `proposed` and that no code path flips it to `active`
   without a `DecisionId` (AC4).
3. **A candidate's `capability_ceiling` never exceeds the union of its source procedures' held capabilities.**
   Computed at proposal (§7); re-verified at activation. A widening request is refused, not clamped-and-warned
   (AC5).
4. **`Rejected` and `Superseded` are terminal for that candidate; history is never rewritten.** A
   re-recurrence after rejection compiles a *fresh* candidate with a fresh `candidate_id` and a fresh Decision
   (ADR-0002 event log); the prior rejection remains queryable forever.
5. **`Counting` and `Proposed` observation is inert.** Neither counting nor proposing changes any Mission, runs
   any Turn, or grants any capability. The only effect of the whole subsystem short of activation is a proposal
   the Principal may ignore.

---

## 6. Component structure

```
                          ┌──────────────────────────────────────────────────────────┐
   mission.concluded      │              sidra-compilation (kernel, Layer 1)          │
   event (M15/M26) ──────►│                                                           │
                          │  Observer                                                 │
                          │    │  1. read outcome record shape (read-only, off-hot)    │
                          │    ▼                                                       │
                          │  Signature ──► ProcedureSignature (ADR-0075, model-free)   │
                          │    │  2. normalize + canonicalize + hash                    │
                          │    ▼                                                       │
                          │  RecurrenceCounter ──► per-signature distinct-Mission tally │
                          │    │  3. increment iff mission_id not already counted        │
                          │    ▼  4. fifth distinct Mission?                            │
                          │  Compiler (only at the threshold)                          │
                          │    │  5. build frozen definition; compute capability ceiling │
                          │    │  6. attach citation (≥5 engagement ids) — MANDATORY     │
                          └────┼──────────────────┬──────────────────┬────────────────┘
                               ▼                  ▼                  ▼
                        CeilingCheck        WorkflowValidator   playbooks/store
                        (sidra-security)    (M7 §2 checks)      (proposed row + candidate projection)
                        7. ceiling ⊆ source  8. acyclic, reviewer  9. persist; emit
                           capabilities         ≠ assignee, etc.       WorkflowCandidateProposed
                               │                  │                       │
                               └──────────────────┴───────────────────────┘
                                                  ▼
                                        a PROPOSED candidate — inspectable, cited, inert
                                                  ▼
                        Principal Decision (decision engine) ──► activate | reject
                                                  ▼
                        Activator ──► playbooks.status proposed→active; CandidateActivated on the chain
                                                  ▼
                                        M7 Workflow engine may now instantiate it (separate crate)
```

Internal modules of `sidra-compilation`:

| Module | Responsibility |
|---|---|
| `observer` | subscribe to `mission.concluded`; read the outcome-record shape read-only, off the hot path |
| `signature` | the normalized procedure signature: projection, abstraction, canonicalization, hashing (ADR-0075) |
| `recurrence` | the per-signature distinct-Mission counter and the five-threshold; distinctness enforcement |
| `compiler` | at the threshold: compile the frozen `WorkflowDefinition`, attach the mandatory citation, name the candidate |
| `ceiling` | compute and verify the capability ceiling against source procedures (no widening); calls the Broker |
| `registry` | the org-facing source of truth: list candidates, inspect provenance, candidate status |
| `activation` | the propose→Decision→activate/reject flow; promotes `proposed → active` on a Decision; supersession |
| `conformance` | the acceptance harness, including the five-recurrences-proposed-with-citations proof (§17) |

**Dependency direction (ADR-0011).** `packages/domain ← services/compilation ← apps/*`. `services/compilation`
depends on `services/store`, `services/security` (the Broker, for the ceiling check and the Decision), and the
M26 calibration substrate (`services/calibration`, for the observation trigger and the locality guarantee). It
does **not** depend on `services/orchestrator` or `services/mission` — it reads outcome records via the store
and the M26 substrate, and it emits a *candidate definition as data*; it never runs a Workflow. **The absence
of that edge is a compile-time property enforced in CI**, exactly as M16's connector crate and the Mission
Engine's Appendix B do it. This is what makes G9 true: a subsystem that cannot import the runner cannot run
anything.

---

## 7. Security

Procedural Compilation is a *learning* surface, and the defining risk of a learning surface is that it teaches
the Firm to widen itself. Every mitigation below is an application of an existing control — the Broker
(M3), default-deny (security model §5), the Decision engine (Principle 14), and locality (ADR-0009) — not a new
one.

| Threat | How M28 addresses it |
|---|---|
| **Self-promotion** — the Firm grants itself standing capability | Structurally impossible: a candidate is `proposed`; the only edges into `Activated` (§5.2) carry a Principal `DecisionId`. No code path activates without a Decision (AC4). This is the whole 4.0 constraint (`/MILESTONE_REGISTRY.md` §4, Principle 14), enforced by the state machine, not by intention. |
| **Capability widening via a compiled Workflow** — a candidate that can do more than the Missions it came from | The `capability_ceiling` is computed as the union of the capabilities the source Work Orders *actually held* (from each `ProcedureObservation.capabilities`). A candidate whose compiled definition requires a capability outside that ceiling is **refused at proposal**, not clamped. Default-deny holds (security model §5): absence of a source capability is denial. On activation the ceiling is re-verified, and the promoted Playbook's steps are still Broker-checked per-Dispatch, unchanged (AC5). |
| **Uncited / fabricated proposal** — a candidate that cannot prove its provenance | A `WorkflowCandidate` cannot exist with `|derived_from| < 5` (§4.4). Provenance is a construction invariant; there is no uncited candidate to fabricate (AC2). |
| **Count gaming** — one Mission retried/replayed to manufacture a threshold | Distinctness: the counter increments only on a `mission_id` not already counted for that signature (§5.2, §6). Five *distinct* Missions are required; retries and replays of one Mission count once (AC6). |
| **Procedure poisoning** — a malicious or low-quality procedure recurs five times and is proposed | Recurrence produces only a *proposal*. The Principal inspects the provenance — the exact five Missions, their normalized shape, their capability ceiling — before any Decision. No auto-activation means a poisoned candidate is inert until a human chooses it, and the Decision is logged and reversible (Principle 14). |
| **Exfiltration of firm procedure** — signatures or candidates leaving the machine | Local only (ADR-0009). Observation, counting, and compilation make no network connection. No signature, citation, or candidate is ever transmitted; a packet capture during a full compilation shows nothing (AC8). |
| **History rewriting** — a superseded or rejected candidate quietly disappearing | Every state transition is an event on the hash chain (ADR-0002); `Rejected`/`Superseded` are terminal and immutable (§5.3 inv. 4). A re-recurrence compiles a fresh candidate; it never edits the old one (AC9). |

**The propose-never-enact boundary holds.** Compilation is inert: it reads, counts, and proposes. The single
act that turns a proposal into a running capability is a Principal Decision, and that act is the same
Decision-engine machinery the whole Firm already uses for org changes (Principle 14). M28 adds a proposal
source; it removes no gate.

---

## 8. Performance and locality

- **Observation is off the hot path.** M28 does its work on `mission.concluded`, after the Mission is done —
  never during planning or dispatch. It runs in the same asynchronous, low-priority lane as Night Shift
  consolidation (`/docs/04-automation-engine.md` §6). The Mission scheduler's determinism
  (`MISSION_ENGINE_ARCHITECTURE.md` G5, §17) is untouched because compilation is not in the scheduling loop at
  all: a Mission that concludes has already spent its budget, and observing it costs the scheduler nothing.
- **Signature computation is bounded.** Normalizing a concluded Mission is O(steps) in the Mission's Work Order
  count — a Mission has tens of Tasks, not thousands (the Mission Engine plans at Task granularity and never
  below, §1.5 rule 2 there). Hashing the canonical encoding is a single pass.
- **Recurrence matching is a hash lookup.** A signature is matched by `SignatureHash` equality — an O(1)
  indexed lookup into `procedure_observations`, then a bounded counter increment. There is no similarity
  search, no embedding, no pairwise comparison; matching cost does not grow with the number of stored
  signatures beyond the index.
- **Compilation happens once per threshold, not per observation.** The `compiler` runs only on the fifth
  distinct Mission for a signature — an infrequent event. The common path (an observation below threshold) is a
  hash, a distinctness check, and an increment.
- **Locality is total.** No step of the pipeline reaches the network (ADR-0009). Disconnect everything and
  compilation continues exactly as before — it reads local outcome records and writes local candidates.

---

## 9. Public APIs

### 9.1 Queries

| Query | Returns | Notes |
|---|---|---|
| `list_workflow_candidates(status?)` | candidates and their status | the org-facing "what has the Firm proposed" list; default lists `Proposed` |
| `inspect_candidate_provenance(candidate)` | the ≥5 cited Missions, the normalized signature (`steps`/`edges`), the capability ceiling, per-Mission outcome links | the citation record made human-readable — **the exit-criterion evidence** (AC2) |
| `candidate_status(candidate)` | lifecycle state (§5) | |
| `signature_recurrence(signature)` | the distinct-Mission count and the Missions counted so far | inspecting a below-threshold tally |

### 9.2 Commands

| Command | Effect | Notes |
|---|---|---|
| `activate_candidate(candidate)` → `Result` | `Proposed → Activated`; `playbooks.status → active` | **a Principal Decision** — raises a Decision, requires a `DecisionId`; re-verifies the ceiling; never callable by the kernel on its own |
| `reject_candidate(candidate)` → `Result` | `Proposed → Rejected`; `playbooks.status → retired` | a Principal Decision; logged and review-dated |

There is **no** `propose_candidate` command and no `compile_candidate` command. A candidate is never proposed
*by request*; it is proposed *by the arrival of the fifth distinct observation*, inside the kernel, on the hash
chain. There is likewise **no** `observe` command exposed to any caller — observation is an internal
subscription to `mission.concluded`, not an API.

### 9.3 API rules

1. **No API activates a candidate without a Principal Decision.** `activate_candidate` raises a Decision and
   requires the resulting `DecisionId`; there is no side door and no kernel-initiated activation (Principle 14,
   §5.3 inv. 2).
2. **No candidate is returned without its citation.** `list_workflow_candidates` and
   `inspect_candidate_provenance` always carry `derived_from`; a candidate with no citation is unrepresentable,
   so there is no uncited response to return (§4.4).
3. **No API widens capability.** `activate_candidate` re-verifies the ceiling; a candidate that would exceed
   its source capability cannot be activated (§7).
4. **Everything is a logged event on the hash chain.** Proposal, activation, rejection, and supersession are
   all events (§11.2); the record of *why the Firm has the procedures it has* is traceable (Principle 14, the
   "how did the Firm come to be shaped this way" test).

---

## 10. Sequence diagrams

### 10.1 The exit criterion — five recurrences produce a cited proposal

```
Mission Engine        sidra-compilation                          store / chain
   │ mission.concluded (M#1) │                                       │
   ├────────────────────────►│ signature = S ; count(S)=1            │
   │                         ├── write ProcedureObservation(M#1,S) ──►│
   │ mission.concluded (M#2) │                                       │
   ├────────────────────────►│ signature = S ; distinct? yes ; count=2│
   │ mission.concluded (M#3) │  … count=3                             │
   │ mission.concluded (M#4) │  … count=4   → NO candidate (F1)       │
   ├────────────────────────►│                                       │
   │ mission.concluded (M#5) │ signature = S ; distinct? yes ; count=5│
   ├────────────────────────►│ THRESHOLD                              │
   │                         │ compile frozen definition from S       │
   │                         │ ceiling = ⋃ caps(M#1..M#5)             │
   │                         │ citation = {E#1..E#5} (≥5) — MANDATORY  │
   │                         ├── validate (M7 §2 checks) ────────────►│ acyclic, reviewer≠assignee …
   │                         ├── write playbooks{status:proposed,      │
   │                         │        derived_from:[E#1..E#5]}         │
   │                         ├── write workflow_candidates{S,ceiling}  │
   │                         ├── emit WorkflowCandidateProposed ──────►│ (hash chain)
   │                         │                                        │
   │   (candidate is PROPOSED, cited, inert — nothing runs)           │
```

### 10.2 A Principal activates the candidate — a Decision

```
Principal        sidra-compilation        Decision engine      Broker        store/chain
   │ inspect_candidate_provenance         │                    │              │
   ├────────────────────────────────────►│ return {E#1..E#5},  │              │
   │◄─── 5 cited Missions + shape + ceiling┤ signature, ceiling │              │
   │ activate_candidate                   │                    │              │
   ├────────────────────────────────────►│ raise Decision ────►│              │
   │   (Principal confirms: criteria, reversibility, review date)│             │
   │◄──────────── DecisionId ─────────────┤◄───────────────────┤              │
   │                                      │ re-verify ceiling ─►│ ⊆ source? yes│
   │                                      ├── playbooks.status  │              │
   │                                      │      proposed→active ┼─────────────►│
   │                                      ├── write CandidateActivation(Decision)│
   │                                      ├── emit CandidateActivated ─────────►│ (hash chain)
   │◄──────────── Activated ──────────────┤                                    │
   │   (M7 may now instantiate the playbook as a Workflow — a SEPARATE crate)  │
```

### 10.3 The refusals

```
(a) FOUR recurrences → NO proposal
   mission.concluded (M#4) ─► count(S)=4  →  Counting  →  no WorkflowCandidate object exists  (F1)

(b) A candidate that would widen capability → refused at proposal
   fifth observation ─► ceiling = ⋃caps(source) ; compiled def requires cap ∉ ceiling
                      → REFUSED ; emit CandidateWideningRefused ; no candidate proposed  (F3, AC5)

(c) Auto-activation attempt → structurally refused
   any code path calling the activation transition without a Principal DecisionId
                      → rejected by the state-machine guard (§5.2) ; candidate stays Proposed  (F4, AC4)

(d) Count gaming — one Mission replayed 5× → NOT a threshold
   mission.replayed(M#1) ×5 ─► distinct mission_id count = 1  →  Counting  →  no proposal  (F2, AC6)
```

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 New tables and reused columns (forward-only migrations `0064`–`0066`)

M28 **reuses the `playbooks` table** (`/docs/04-database-design.md` §6) for the candidate itself — it writes
`status='proposed'`, `derived_from=[engagement ids]` (the citation), `steps` (the compiled definition),
`name`, and `trigger_desc`, leaving `uses`/`success_rate` for post-activation real runs. It adds three additive
projections that hold what the base `playbooks` schema has no column for:

| Migration | Table | Purpose |
|---|---|---|
| `0064` | `procedure_observations` | one row per (mission_id, signature): `mission_id`, `engagement_id`, `signature_hash`, `departments` (JSON), `capabilities` (JSON), `observed_at` — the normalized sightings the counter reads. `UNIQUE(signature_hash, mission_id)` enforces distinctness at the storage layer. |
| `0065` | `workflow_candidates` | the compilation-time provenance projection over a `playbooks` row: `candidate_id`, `playbook_id` (FK to `playbooks.id`), `signature_hash`, `normalized_steps` (JSON: the `steps`/`edges` for inspection), `capability_ceiling` (JSON), `cited_missions` (JSON, ≥5), `status`, `proposed_at`. `derived_from` on the linked `playbooks` row is the authoritative citation; `cited_missions` is its human-readable mirror. |
| `0066` | `candidate_activations` | the candidate→Decision link: `candidate_id` (FK), `decision_id` (FK to the decisions/decision-engine record), `activated_playbook_id`, `resolution` (`activated` \| `rejected` \| `superseded`), `actor`, `resolved_at`. **`decision_id` is NOT NULL** — no activation row can exist without a Decision. |

Additive columns only elsewhere; no existing column's meaning changes. A Firm on which no Mission has concluded
under M28 — or one that concludes Missions but never repeats a procedure five times — has an empty
`procedure_observations` (or one with tallies below five) and no `workflow_candidates`, and behaves **exactly**
as it did before M28. Zero observations is a fully supported state, not a migration artifact (G8, AC10). The
band `0064`–`0066` sits above the prior milestones' migrations (M15 `0019`–`0024`, M16 `0025`–`0029`, and
M17–M27 occupying `0030`–`0063`); nothing already committed is disturbed.

### 11.2 Domain events

Every event carries `actor`, `signature_hash`, and (where applicable) `candidate_id` and `decision_id`, and
lands on the hash chain (ADR-0002):

`ProcedureObserved` · `RecurrenceThresholdReached` · `WorkflowCandidateProposed` · `CandidateWideningRefused` ·
`CandidateActivated` · `CandidateRejected` · `CandidateSuperseded`.

`ProcedureObserved` records a sighting (below or at threshold). `RecurrenceThresholdReached` fires on the fifth
distinct Mission, immediately before `WorkflowCandidateProposed`. `CandidateActivated` and `CandidateRejected`
each carry the Principal `decision_id` — the audit link that makes "why does the Firm have this procedure"
answerable (Principle 14). `CandidateWideningRefused` records a refused compilation so a suppressed widening is
never silent.

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── compilation/
    ├── candidates/
    │   └── <candidate-id>.md   the normalized shape, the ≥5 cited Missions, the capability ceiling,
    │                           the status, and — if activated — the Decision that activated it
    └── observations/
        └── <signature>.md      the running distinct-Mission tally for a procedure below threshold
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every procedure the Firm proposed, exactly which Missions each proposal derived from, and which the Principal
activated and why — the provenance survives the software. No credential and no Mission *content* appears; the
mirror holds procedure *shape* and citations, never the work itself.

---

## 12. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A procedure recurs **four** times | Count stays at 4; the signature is `Counting`; **no `WorkflowCandidate` object is created**. The candidate comes into existence only at the fifth distinct Mission (§5.2, AC3). |
| F2 | One Mission replayed/retried five times | Distinctness rejects the repeats: the `UNIQUE(signature_hash, mission_id)` constraint and the counter's distinct-Mission rule count `mission_id` once. Count = 1; no proposal (AC6). |
| F3 | The compiled candidate would require a capability outside its source ceiling | Refused at proposal; `CandidateWideningRefused` logged; no candidate produced. Default-deny holds (§7, AC5). |
| F4 | Some code path attempts to activate a candidate without a Principal Decision | The state-machine guard on the `activate` edge requires a `DecisionId`; the transition is rejected; the candidate stays `Proposed` (§5.3 inv. 2, AC4). |
| F5 | A candidate is compiled but its definition fails the Workflow validator (`/docs/01-workflow-engine.md` §2 — acyclic, reviewer ≠ assignee, budgets, grants ⊆ fences) | The proposal is refused with the named validator failure; no invalid candidate is stored. A candidate is a Workflow, so it must pass the Workflow's own compilation checks. |
| F6 | The same signature recurs again after its candidate was rejected | A **fresh** candidate with a fresh `candidate_id` is compiled and re-proposed; the prior `Rejected` record is immutable and remains queryable (§5.3 inv. 4). The Principal may reject repeatedly; nothing is auto-activated. |
| F7 | Two candidates for the same signature exist (e.g. a re-compilation with a refined normalization) | The later, once activated, `Supersedes` the earlier; both remain in history. Only one is `active` at a time. |
| F8 | A Mission concludes with no recognizable procedure shape (a one-off, fully novel Mission) | One observation is written for its signature; its count is 1; it contributes to no threshold unless it recurs. Novelty is not penalized and not proposed (registry: absent history raises risk, never lowers it). |
| F9 | An activated candidate later underperforms in real runs | Out of M28's scope — retirement of an *active* playbook by measured `success_rate`/`uses` is the automation engine's self-retirement path (`/docs/04-automation-engine.md` §5) and the quarterly review (M29). M28 proposes; it does not police an activated Workflow's ongoing value. |

---

## 13. Dependencies, assumptions, risks

### 13.1 Dependencies

| On | For |
|---|---|
| **M26 — Outcome Calibration** (the measurement/observation loop) | the substrate M28 observes on: the `mission.concluded` trigger, the outcome-record read path, and the local-only learning discipline M26 established (ADR-0009). Without M26 there is no observation loop to attach to. |
| **M7 — Full Firm & the engines (Workflows)** | the Workflow definition format a candidate compiles to (`/docs/01-workflow-engine.md`), the Workflow validator a candidate must pass (§2), and the engine that runs an *activated* candidate. M28 produces the definition; M7 runs it. |
| **M15 — Mission Engine** | the source of the observed procedures: the outcome record and its shape (§23.3), the Work Order sequence, the `mission_id` distinctness unit. |
| **M13 — departments** | the `RoleArchetypeId` in a normalized step (a role, not a person, ADR-0014) and the capability scope for the ceiling check. |
| **M3 — Permission Broker + Decision engine** | the ceiling check against source capabilities and the Decision that activates a candidate (Principle 14). |
| **M2 — event log** | the hash chain every M28 event lands on (ADR-0002). |

### 13.2 Assumptions

1. **M26 is implemented and its observation loop is live.** M28 subscribes to the same `mission.concluded`
   substrate M26 established. If M26's loop is not present, M28 has nothing to observe and cannot be certified
   (§14 gate).
2. **Missions carry a reconstructable Work Order sequence in their outcome record.** The Mission Engine records
   `mission_dispatches` ↔ `work_orders` correlation with contracts and resolved departments
   (`MISSION_ENGINE_ARCHITECTURE.md` §27.3). If a Mission's shape cannot be projected to a normalized step
   vector, it produces no observation rather than a malformed one.
3. **The `playbooks` schema is present as specified** (`/docs/04-database-design.md` §6). M28 writes its
   candidate as a `proposed` playbook and does not alter the table's shape.
4. **Five is the threshold for this release.** It is fixed by the registry exit criterion; making it
   configurable is deliberately out of scope, because a configurable threshold is a way to lower the bar on
   self-proposal, and 4.0's whole point is not to.

### 13.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| PC-1 | An over-eager normalization treats genuinely different procedures as "the same", proposing a wrong candidate | The signature is conservative (ADR-0075): it preserves order, effect class, role, and contract shape, so two procedures that differ in any of those differ in signature. A candidate is only ever a *proposal* the Principal inspects before activating (§5, §7). |
| PC-2 | An over-strict normalization treats the same procedure as different, so a real recurrence never reaches five | Fan-out collapsing (§3.2) and argument abstraction keep runs of one procedure equal despite differing collection sizes and parameters. The failure mode is *under*-proposing (no candidate), which is safe: M28 defaults to silence, not to a wrong proposal. |
| PC-3 | The Firm self-promotes a procedure | Structurally impossible: `proposed`-only compilation; activation requires a Principal `DecisionId` (§5.3 inv. 2, §7). This is the risk the whole release is defined against, and it is enforced by the state machine and CI, not by intention. |
| PC-4 | A candidate widens capability | Ceiling ⊆ union of source capabilities, verified at proposal and re-verified at activation; a widening request is refused (§7, AC5). |
| PC-5 | A proposal leaks the Firm's procedures off-machine | Local only (ADR-0009); no network path exists in the crate; the locality test asserts zero egress (AC8). |
| PC-6 | Compilation logic drifts into the execution engine | CI forbids an edge from `sidra-compilation` to `sidra-orchestrator`/`sidra-mission`; the crate cannot import the runner (§6, AC11). |
| PC-7 | Migration breaks a pre-M28 Firm | Forward-only, additive (`0064`–`0066`); zero observations = pre-M28 behaviour; each migration independently deployable (§11.1, AC10). |

---

## 14. Certification gate (STEP-1 dependency on M26 and M27)

M28's exit criterion cannot be demonstrated on a Firm without M26's observation loop. Before M28 is certified:

- **M26 (Outcome Calibration) must be implemented and its `mission.concluded` observation loop live.** M28's
  `observer` subscribes to it. This is the hard dependency stated in the registry (M28 depends on M26).
- **M27 (Charter Evolution) must be architecturally complete** — the STEP-1 audit (`00-M27-AUDIT.md`) records
  the verdict. M28 does not depend on M27's Charter machinery, but the registry orders M27 before M28 within
  4.0, and the audit confirms M27 introduces no change that M28 contradicts.

The certification evidence is the exit-criterion test (§17 AC1–AC2, task in the last epic): a fixture of five
distinct Missions with an equal signature produces one `Proposed` candidate whose `derived_from` names exactly
those five, and no candidate is produced at four.

---

## 15. Testing strategy

| Layer | What it proves |
|---|---|
| **Unit — signature** | Normalization is deterministic and model-free: two Missions differing only in parameters/ids/costs produce equal `SignatureHash`; two differing in order, effect class, role, or contract shape produce different hashes (AC7). Fan-out over N collapses to one normalized step regardless of N (§3.2). |
| **Unit — recurrence** | The counter increments once per distinct `mission_id`; replays/retries of one Mission count once (AC6); the fifth distinct Mission crosses the threshold and the fourth does not (AC1, AC3). |
| **Unit — candidate construction** | A `WorkflowCandidate` cannot be constructed with `|derived_from| < 5` or empty `cited_missions` — the citation invariant (AC2). |
| **Unit — ceiling** | A compiled definition requiring a capability outside the source union is refused; one inside is admitted (AC5). |
| **Unit — state machine** | Every edge into `Activated` requires a `DecisionId`; no automatic edge exists; illegal transitions are rejected (AC4). |
| **Integration — the observation loop** | Fed real `mission.concluded` events from a fixture, the pipeline writes observations, crosses the threshold, and proposes a cited candidate as a `proposed` playbook (AC1, AC2, AC12). |
| **Integration — activation** | `activate_candidate` raises a Decision, requires the `DecisionId`, promotes `proposed → active`, writes a `CandidateActivation` with the Decision, and emits `CandidateActivated`; the promoted playbook is a valid M7 Workflow definition (AC12). |
| **Property — locality** | No pipeline step opens a socket; a packet capture across a full compilation is empty (AC8). |
| **Property — audit** | Every proposal/activation/rejection/supersession is an event on the hash chain; `audit.verify` passes over a full compilation-lifecycle fixture (AC9). |
| **Property — dependency direction** | `services/compilation` has no edge to `services/orchestrator` or `services/mission` (AC11). |
| **Regression — additivity** | A Firm with zero observations behaves byte-identically to a pre-M28 Firm (AC10). |

---

## 16. CI requirements

The permanent CI gates from `/MASTER_IMPLEMENTATION_GUIDE.md` §7 apply. M28 adds:

1. **The no-auto-activation test** — a CI test asserts that no code path in `sidra-compilation` transitions a
   candidate to `Activated` without a Principal `DecisionId`; a grep-and-test check fails the build if the
   activation transition is reachable without a Decision (AC4). This is the mechanical expression of the 4.0
   propose-never-enact constraint.
2. **The citation-required test** — a CI test asserts that a `WorkflowCandidate` is unconstructable with fewer
   than five distinct cited Missions, and that a four-recurrence fixture produces no candidate (AC2, AC3).
3. **The no-widening test** — a candidate whose ceiling exceeds source capability is refused (AC5).
4. **The dependency-direction check** — the build fails on any edge `sidra-compilation → sidra-orchestrator`
   or `→ sidra-mission` (AC11), exactly as M16 and the Mission Engine enforce it.
5. **The locality check** — a test asserts the crate makes no network connection during observation or
   compilation (AC8), consistent with ADR-0009's verifiability stance.

---

## 17. Acceptance criteria

The exit criterion — *"A procedure repeated five times is proposed as a Workflow; the proposal cites the
Missions it derives from"* — decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | **A procedure repeated five times is proposed as a Workflow** — a fixture of five distinct Missions with an equal signature produces exactly one `Proposed` candidate (a `proposed` playbook) | the five-recurrence exit-criterion fixture (§10.1); the last epic's final task |
| AC2 | **The proposal cites the Missions it derives from** — the candidate's `derived_from` names exactly the ≥5 source Missions, and a candidate is unconstructable without them | the citation-record assertion over the fixture; the construction-invariant unit test |
| AC3 | **Four recurrences produce no proposal** — the threshold is exactly five distinct Missions | the four-recurrence fixture asserting no `WorkflowCandidate` object exists |
| AC4 | **A candidate is not auto-activated** — activation requires a Principal Decision; no code path activates without a `DecisionId` | the no-auto-activation state-machine test + the CI grep-and-test check |
| AC5 | **A candidate cannot widen capability** beyond the union of its source procedures' held capabilities | the ceiling-refusal test asserting a widening compilation is refused, not clamped |
| AC6 | **Recurrence counts distinct Missions** — one Mission replayed/retried counts once | the distinctness test over replayed fixtures + the `UNIQUE(signature_hash, mission_id)` constraint |
| AC7 | **The signature is deterministic and model-free** — same procedure ⇒ equal hash despite differing params/ids/costs; different procedure ⇒ different hash | the normalization property test |
| AC8 | **Observation and compilation are local** — no signature, citation, or candidate leaves the machine | the locality test asserting zero egress across a full compilation |
| AC9 | **Every proposal/activation/rejection/supersession is an audited event on the hash chain** | `audit.verify` over a compilation-lifecycle fixture |
| AC10 | **Everything is additive** — a Firm with zero observations behaves exactly as pre-M28 | the additivity regression against a pre-M28 fixture Vault |
| AC11 | **`services/compilation` has no dependency edge to `services/orchestrator` or `services/mission`** | the dependency-direction check in CI |
| AC12 | **The candidate reuses the `playbooks` model** — a proposal is a `proposed` playbook with `derived_from` populated; activation is `proposed → active`; the definition is a valid M7 Workflow | the playbooks-mapping integration test + the M7 validator run over the compiled definition |

---

## Appendix A — Glossary additions

- **Procedure signature** — a canonical, order-preserving digest over the sequence of Work Order *types* in a
  concluded Mission, with ids, parameters, and content abstracted away. Two Missions exhibit "the same
  procedure" iff their signatures are byte-equal. Deterministic and model-free (ADR-0075).
- **Procedure observation** — one sighting of a signature in one concluded Mission, keyed to its `mission_id`.
  The distinctness unit of the recurrence count.
- **Workflow candidate** — a compiled, frozen Workflow definition *proposed* (status `proposed`) once a
  procedure recurs across five distinct Missions, carrying the mandatory citation of those Missions and a
  capability ceiling it may not exceed. A `proposed` playbook, not a running Workflow (ADR-0074).
- **Citation (`derived_from`)** — the ≥5 Missions (as engagement ids, the `playbooks.derived_from` column's
  existing meaning) a candidate was compiled from. Mandatory: a candidate cannot exist without it.
- **Capability ceiling** — the union of the capabilities a candidate's source Work Orders actually held. A
  candidate's definition may not require a capability outside it; a widening request is refused (no self-widening).
- **Activation** — the Principal Decision that promotes a candidate from `proposed` to `active`, after which
  the M7 Workflow engine may instantiate it. Never automatic.

## Appendix B — Repository placement

```
services/
└── compilation/                NEW — crate sidra-compilation
    ├── observer
    ├── signature
    ├── recurrence
    ├── compiler
    ├── ceiling
    ├── registry
    ├── activation
    └── conformance

packages/domain/                EXTENDED — NormalizedStep, ProcedureSignature, WorkflowCandidate,
                                           CandidateActivation value objects and events

services/store/migrations/      EXTENDED — 0064_procedure_observations.sql,
                                           0065_workflow_candidates.sql,
                                           0066_candidate_activations.sql (forward-only)

infrastructure/testing/
└── compilation/                NEW — the five-recurrence exit-criterion proof, the no-auto-activation test,
                                      the citation-required test, no-widening, locality, distinctness
```

Dependency direction (ADR-0011): `packages/domain ← services/compilation ← apps/*`. `services/compilation`
depends on `services/store`, `services/security`, and `services/calibration` (M26); it does **not** depend on
`services/orchestrator` or `services/mission`.

## Appendix C — Implementation position

M28 is the third milestone of 4.0 "Continuum" and sits between M27 (Charter Evolution) and M29 (Firm
Self-Review). It depends on M26 (the observation loop it attaches to) and M7 (the Workflow engine that runs an
activated candidate). Building it before M26 is the mistake the registry's dependency structure exists to
prevent: without concluded-Mission outcome records there is nothing to observe, and a "learned procedure"
compiled from nothing is exactly the self-referential fiction 4.0 is defined against
(`/MILESTONE_REGISTRY.md` §5, dependency 1). Building it as an auto-activating loop, rather than a proposer, is
the mistake Principle 14 and `/MASTER_IMPLEMENTATION_GUIDE.md` §12 exist to prevent.

**Exit criterion.** A procedure repeated five times is proposed as a Workflow; the proposal cites the Missions
it derives from — proven by test, not by configuration (AC1, AC2). The candidate is never auto-activated;
activation is a Principal Decision (AC4).
