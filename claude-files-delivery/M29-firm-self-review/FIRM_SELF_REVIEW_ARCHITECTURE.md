# Firm Self-Review — Architecture

**Milestone M29 · Release 4.0 "Continuum" · Layer 1 (Core Platform)**

| | |
|---|---|
| Milestone | M29 — Firm Self-Review (`/MILESTONE_REGISTRY.md` §4, 4.0 "Continuum") |
| Release | 4.0 "Continuum" — the Firm improves itself; nothing self-promotes |
| Layer | 1 — Core Platform (`/docs-v2/02-layer-model.md` §1); reads Layer 3 (Departments) and the M26 measurement substrate |
| New crate | `sidra-self-review` at `services/self-review/` |
| Depends on | M13 (departments, Registrar, Pack contract), M26 (outcome-calibration measurement substrate), M2 (event log), the v1 decision engine (the Principal-Decision path it links to but never invokes) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | The Firm produces a department-health assessment with the absorbability test applied; **it may propose, never enact** — proven by the absence of any structural-write path and a test that a proposal alone changes nothing |

> **Authoritative precedence.** Where this document disagrees with `/docs-v2/02-v2-principles.md` about
> Principle 13 (structure earned by evidence) or Principle 14 (no meta-layer; a structural change is a
> Principal Decision), the principles govern. Where it disagrees with `/MASTER_IMPLEMENTATION_GUIDE.md` §10
> about failure mode 5 ("structure without evidence" + the absorbability test) or failure mode 8 ("silent
> structural change"), the guide governs. Where it disagrees with `/docs/04-database-design.md` about the
> `departments` or `decisions` tables, the database design governs. This architecture *extends* those
> boundaries; it never re-decides them. In particular, it introduces **no** new mechanism for changing the
> org chart — that mechanism already exists (a Decision through the decision engine, Principle 14) and M29
> does not touch it.

---

## 1. Why this subsystem exists

### 1.1 The problem

Principle 13 says structure must be earned by evidence: *"if a department's Work Orders could be absorbed by a
neighbouring department without a measured drop in Deliverable quality, the department is overhead"*
(`/docs-v2/02-v2-principles.md` §13). It names a test — the **absorbability test** — and it names a cadence:
*"This applies at instantiation and it applies again at quarterly review — v1's KPI-based pruning, promoted
from agents to departments."* The Master Guide names the same thing as the response to failure mode 5,
*"Structure without evidence… all twenty-one departments installed for a company shipping two products,"*
whose signal is *"a department whose Work Orders a neighbour could absorb with no measured quality drop,"* and
whose response is *"Principle 13, enforced at the quarterly Structure Review"* (`/MASTER_IMPLEMENTATION_GUIDE.md`
§10.5).

Through M28 there is no machine that runs that review. The quarterly Structure Review is a slogan with a
cadence and a test but no instrument: nobody computes each department's overhead against its measured quality,
nobody applies the absorbability test to a real pair of departments, and "which departments earned their
overhead" is answered — when it is answered at all — by opinion. M26 shipped the measurement substrate that
makes the answer objective: Mission outcome records, per-department quality signals, calibrated estimates. M13
shipped the departments to assess. M29 is the machine that runs Principle 13's review **on the Firm itself**,
turning "we should probably retire that department" into a department-health assessment with measured evidence
behind every line.

The requirement is not "let the Firm reorganise itself." A Firm that can reshape its own org chart is exactly
the failure mode 8 the Master Guide names — *"silent structural change… the org chart edited outside the event
log,"* signal *"any admin path that changes the Firm's shape without producing a Decision,"* response
*"Principle 14 — there is no meta-layer"* (`/MASTER_IMPLEMENTATION_GUIDE.md` §10.8). The requirement is the
opposite: **let the Firm produce an evidence-backed assessment of its own structure, with the absorbability
test applied to each department, and let it propose a merge or a retire — while holding no path whatsoever to
enact one.** The org chart changes only by a Principal Decision, exactly as it does today; M29 adds an
instrument that informs that Decision, never a shortcut that bypasses it.

### 1.2 The stance

Two commitments define the subsystem, and each has an ADR:

1. **The self-review assesses and proposes; it never enacts. There is no structural-write path.** (ADR-0076)
   M29 reads the department substrate and the measurement substrate and writes exactly three kinds of record:
   an assessment run, a per-department health record, and a proposal. It holds no capability, no API, no
   event, and no code path that adds, removes, merges, or restructures a Division, Office, or Department. That
   change is a Decision through the decision engine (Principle 14), and M29 does not call it. The absence of
   the path is a compile-time and test-time property, not a policy.
2. **The absorbability test is defined over M26's measured metrics, not over opinion.** (ADR-0077) "Earned
   their overhead" and "no measured quality drop" are computed from the outcome records and per-department
   quality signals M26 produces. A department-health line with no measured evidence behind it is not emitted;
   a proposal with no measured evidence is not raised; where M26 data is too thin to decide, the assessment
   flags **low confidence** rather than inventing a verdict.

This is the 4.0 "Continuum" constraint in one milestone: *the Firm proposes, the Principal confirms*
(`/MILESTONE_REGISTRY.md` §4, 4.0 intro). M29 is the release's clearest case, because the thing it proposes is
the shape of the Firm itself — the one thing that, if a machine could change it silently, would put every
other guarantee in the system out of the Principal's sight.

### 1.3 What the self-review is, mechanically

The **self-review** is kernel machinery (Layer 1). It sits beside the other analysis engines the kernel owns —
the decision engine, the workflow engine, the calibration loop from M26 — and, like them, it *reads* the
organisation and *records* findings without being part of the delivery line. It is emphatically **not** an
Executive-Layer authority and **not** an Office: an Office holds a veto and performs no delivery work
(`/docs-v2/01-org-chart-v2.md` §3), whereas the self-review holds no veto and takes no action — it produces a
record a human reads. It is **not** a department, because a department that could assess and reshape other
departments would be a meta-layer, which Principle 14 forbids by name.

```
Layer 1  sidra-self-review   ← the machine: gather metrics → assess → absorbability → propose   (M29, THIS DOC)
Layer 3  the 21 departments  ← the subject being assessed; a Pack per department                (M13)
                              the org chart itself changes only by a Principal Decision          (Principle 14)
```

The parallel to M26 is deliberate and load-bearing: M27 (Charter Evolution) proposes a charter revision but
the Principal confirms it; M28 (Procedural Compilation) proposes a Workflow but cites the Missions it derives
from and the Principal confirms it; **M29 proposes a structural change but cites the measured evidence and the
Principal — and only the Principal — enacts it.** M29 introduces no new "propose, never enact" trust mechanism.
It applies the one 4.0 already established to the highest-stakes subject in the system: the org chart.

### 1.4 What the self-review must never become

- **A self-enacting reorg.** The moment M29 can add, remove, merge, or restructure a department, the audit
  chain has a hole and Principle 14's "there is no meta-layer" is false. The exit criterion tests exactly
  this: a raised proposal, left alone, changes nothing. There is no `enact` command, no structural-write
  capability, and no dependency edge from `sidra-self-review` to any crate that mutates the org chart
  (§6, §7).
- **A silent structural change.** Failure mode 8. Every structural change in the Firm produces a Decision on
  the event log; M29 never produces a `StructureChanged` event, because M29 never changes structure. It emits
  a `StructureProposalRaised` — a *proposal*, distinguishable in the chain from the Decision that may later
  cite it. An admin path that reshapes the Firm without a Decision is the defect this milestone exists to make
  structurally impossible.
- **An assessment without evidence.** A department-health line, or a proposal, that is not backed by M26
  measurement is not a Principle-13 review; it is the "structure by opinion" the principle was written against
  (failure mode 5). ADR-0077 makes measured evidence a precondition of every emitted line, and low-confidence
  flagging the required behaviour where evidence is thin.
- **A quality signal disconnected from Principle 13.** The absorbability test is not a novel metric M29
  invents; it is Principle 13's own test — *"could a neighbour absorb this department's Work Orders with no
  measured quality drop"* — computed. If the test M29 runs is not that test, M29 is measuring the wrong thing,
  however sophisticated the number.
- **A telemetry channel.** All analysis is local (ADR-0009; M26's "local only — no telemetry leaves the
  machine"). No assessment, health metric, or proposal leaves the Vault. The instrument that judges the Firm's
  shape is as local as the Firm.

### 1.5 Relationship to existing concepts

| Existing concept | How M29 relates |
|---|---|
| Principle 13 (structure earned by evidence) | M29 *is* Principle 13's quarterly review, made a machine and pointed at the Firm itself. The absorbability test in §13 of the principles is the test M29 computes (§5). |
| Principle 14 (no meta-layer) | M29 is the milestone that proves Principle 14 rather than eroding it: it holds no structural-write path, so the org chart still changes only by a Decision. The self-review is subject to the Firm's own rules like everything else. |
| Failure mode 5 (structure without evidence) | The review M29 runs is failure mode 5's stated response. Its output answers the signal ("a department a neighbour could absorb with no measured quality drop") with a computed verdict, not an opinion. |
| Failure mode 8 (silent structural change) | M29 is the path most tempted to become an admin shortcut, and the one this milestone hard-refuses to let become one. Its guarantee (§7) is the direct mitigation. |
| M13 departments & the Pack contract | The subject of the assessment. M29 reads the `departments` table, the Registrar's department roster, and each Pack's declared KPIs and Work Order history. It never writes a Pack or a department row. |
| M26 outcome calibration | The evidence. M29 reads Mission outcome records and per-department quality signals to compute overhead and "no measured quality drop." Without M26, "earned their overhead" is opinion (registry dependency 1, restated for structure). |
| The decision engine (v1) & `decisions` table | The **only** path that changes structure. A proposal M29 raises may later be *cited by* a Principal Decision recorded there; M29 reads that link to mark a proposal resolved, but never writes a Decision and never enacts one. |
| M27 / M28 (Continuum "propose, never enact") | Same 4.0 stance, different subject. M29 reuses the pattern (assessment → proposal → Principal Decision) that M27 established for charters and M28 for workflows, applied to the org chart. |
| The Exchange & Registrar (M13) | The Registrar enumerates the installed departments and resolves neighbours (same Division) for the absorbability test. M29 reads this roster; it issues no `department.request` and moves no work. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | The self-review proposes but cannot enact — no structural-write path exists | ADR-0076; §7; CI "no structural-write path" assertion; the exit-criterion test (a proposal alone changes nothing) |
| G2 | Every department-health line and every proposal is backed by measured M26 evidence | ADR-0077; §5, §8; a line with no evidence is not emitted; a proposal without evidence is not raised |
| G3 | The absorbability test M29 runs is Principle 13's own test, computed | §5; "a neighbour could absorb these Work Orders with no measured quality drop" mapped to M26 metrics, not a novel score |
| G4 | Thin evidence produces low confidence, never a fabricated verdict | §10; the review flags `insufficient_evidence` and withholds a proposal rather than guessing |
| G5 | Structural change remains a Principal Decision on the event log | Principle 14; §9; a proposal is linkable to a Decision but never is one; no `StructureChanged` event originates in M29 |
| G6 | The review is inspectable and every conclusion is traceable to its evidence | §11 records; `inspect_assessment` returns evidence refs per line; the Vault Markdown mirror |
| G7 | All analysis is local; nothing leaves the machine | ADR-0009; M26 locality inherited; no egress path in the crate |
| G8 | The crate contains no department-specific logic (kernel neutrality) | §6; CI grep for department identifiers (the M11 rule); no `if department == "…"` anywhere |
| G9 | Everything is additive; a Firm that never runs a review behaves exactly as pre-M29 | §11 forward-only migrations 0067–0069; a null review set is a fully supported state |

---

## 3. The review lifecycle

### 3.1 States

A **structure review** is a quarterly run over the installed departments. It is a read-and-record pipeline; no
state it can occupy is a structural change.

```
        schedule (quarter boundary, or run_structure_review by the Principal)
  ──────────────────────────────────────────────────────────────►  SCHEDULED
                                                                       │  begin
                                                                       ▼
                                                                 GATHERING_METRICS   ← reads M26 + Registrar
                                                                       │  metrics assembled per department
                                                                       ▼
                                                                   ASSESSING         ← overhead vs measured quality
                                                                       │  each department scored
                                                                       ▼
                                                              ABSORBABILITY_APPLIED   ← the Principle-13 test per dept
                                                                       │  emit proposals for absorbable depts (with evidence)
                                                                       ▼
                                                                PROPOSALS_EMITTED ───────────────┐
                                                                       │                         │ no absorbable department
                                                                       │ ≥1 proposal             │ (all earned their overhead)
                                                                       ▼                         ▼
                                                                  CONCLUDED  ◄───────────────────┘
                                                                       │
                                          (a Principal Decision may later CITE a proposal — external to M29)
                                                                       │
                                            ┌──────────────────────────┴──────────────────────────┐
                                            ▼                                                       ▼
                                 proposal.resolution = ENACTED_BY_PRINCIPAL              proposal.resolution = DECLINED
                                 (a Decision changed the org chart;                      (the Principal chose not to;
                                  M29 observed the link, changed nothing)                 M29 observed, changed nothing)
```

The two terminal proposal resolutions — `ENACTED_BY_PRINCIPAL` and `DECLINED` — are set by **observing** the
`decisions` table, never by M29 acting. A proposal that is never cited by a Decision stays `OPEN` forever; that
is correct and is the default. "Enacted by Principal" means *a Principal Decision, recorded through the decision
engine, changed the structure and named this proposal as evidence* — the structural change happened entirely
outside M29.

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `schedule` \| `run_structure_review` | Scheduled | a quarter boundary reached, or an explicit Principal run; the department substrate (M13) is installed |
| Scheduled | `begin` | GatheringMetrics | the M26 measurement substrate is present and readable |
| GatheringMetrics | `metrics_assembled` | Assessing | each installed department has a health record (possibly `insufficient_evidence`) |
| Assessing | `scored` | AbsorbabilityApplied | overhead and measured-quality computed per department from M26 |
| AbsorbabilityApplied | `proposals_emitted` | ProposalsEmitted | the absorbability test applied to each department; every proposal carries evidence refs |
| AbsorbabilityApplied | `no_absorbable_department` | Concluded | every department earned its overhead; a clean assessment with zero proposals |
| ProposalsEmitted | `conclude` | Concluded | the assessment run is written and immutable |
| Concluded | *(observe)* `decision_cited_proposal` | *(proposal resolution → EnactedByPrincipal)* | a `decisions` row exists whose evidence names this proposal and whose effect changed structure — **written by the decision engine, not by M29** |
| Concluded | *(observe)* `decision_declined` \| timeout | *(proposal resolution → Declined \| stays Open)* | the Principal recorded a decision not to act, or none was recorded |

### 3.3 Invariants

1. **No state is a structural change.** Every transition above is a read or a record within M29's own three
   tables. None writes `departments`, `agents`, a Pack, or the org chart. The absence of that write is the
   invariant, enforced by §7's guarantee and CI.
2. **A proposal is never a Decision.** `StructureProposalRaised` and a `decisions` row are distinct records
   with distinct schemas on the same hash chain. A proposal has no `chosen_option`, no `authority`, no
   `reversibility` — it is a recommendation awaiting a Decision, not a Decision (§4.5).
3. **Every emitted line carries its evidence.** A `department_health` row or a `structure_proposal` row that
   cannot name the M26 records it derives from is not written; the pipeline refuses it at emission (ADR-0077).
4. **A review is immutable once Concluded.** Re-running the review next quarter produces a new
   `structure_reviews` row; the prior assessment is never rewritten (ADR-0002 event log). Proposal
   *resolution* is the only field that updates after conclusion, and only by observing a Decision.

---

## 4. Domain model

### 4.1 Core types

```
ReviewId(String)               // stable id of a quarterly run, e.g. "review-2026-Q3"
DepartmentId(String)           // from the department substrate (M13)
Quarter(Year, Q1..Q4)          // the review period
OverheadScore(f64)             // normalised cost/attention overhead of a department, from M26 + budget ledger
QualityScore(f64)              // measured Deliverable quality of a department, from M26 outcome records
Confidence(f64 in 0.0..=1.0)   // evidence sufficiency behind a line; low ⇒ flagged, no proposal
EvidenceRef(String)            // an opaque reference to an M26 outcome record / KPI sample / budget-ledger row
DecisionId(String)             // from the v1 decisions table — the ONLY thing that changes structure
```

### 4.2 `StructureReview` — a quarterly run

| Field | Type | Meaning |
|---|---|---|
| `id` | `ReviewId` | identity of the run |
| `quarter` | `Quarter` | the period assessed |
| `status` | lifecycle state | §3.1 |
| `departments_assessed` | `[DepartmentId]` | the installed roster from the Registrar at run time |
| `overall_confidence` | `Confidence` | the lowest per-department confidence, surfaced so a thin quarter is visible |
| `started_at`, `concluded_at` | timestamps | run bounds |
| `run_by` | `Actor` | the Principal or the scheduler; never an agent acting on the org chart |

A review is a **record of an analysis**, exactly as the database design frames assessments — a row, not an
action (`/docs/04-database-design.md`).

### 4.3 `DepartmentHealth` — the per-department metric

The heart of "which departments earned their overhead." One row per department per review.

| Field | Type | Meaning |
|---|---|---|
| `review_id` | `ReviewId` | the run this belongs to |
| `department_id` | `DepartmentId` | the department assessed |
| `overhead` | `OverheadScore` | its share of budget, Principal attention, and cross-department coordination cost (from the budget ledger + M26) |
| `measured_quality` | `QualityScore` | its Deliverable quality from M26 outcome records over the quarter |
| `earned_overhead` | `bool` | quality justifies overhead — the Principle-13 question, computed |
| `absorbability` | `AbsorbabilityResult` | §4.4 |
| `evidence` | `[EvidenceRef]` | the M26 records behind every number here — REQUIRED, non-empty, or the row is not emitted (ADR-0077) |
| `confidence` | `Confidence` | evidence sufficiency; below the floor ⇒ `insufficient_evidence`, no proposal |

### 4.4 `AbsorbabilityResult` — Principle 13's test, computed

```
AbsorbabilityResult {
    candidate_absorber:   Option<DepartmentId>,   // the neighbour that could absorb the Work Orders (same Division)
    projected_quality:    Option<QualityScore>,   // the absorber's measured quality on comparable Work Orders (M26)
    quality_drop:         Option<f64>,            // measured_quality(dept) − projected_quality(absorber)
    absorbable:           Verdict,                // Absorbable | NotAbsorbable | InsufficientEvidence
    evidence:             [EvidenceRef],          // the M26 records comparing the two departments — REQUIRED
}
```

The test is Principle 13's exact wording turned into arithmetic: a department is **Absorbable** when a
neighbouring department could take its Work Orders with `quality_drop ≤ 0` **measured** on comparable Work
Orders in M26's outcome records — *"no measured drop in Deliverable quality."* When the evidence to compare the
two departments does not exist or is too thin, the verdict is **InsufficientEvidence**, never a guess (G4).

### 4.5 `StructureProposal` — a recommendation, never an act

```
StructureProposal {
    id:            ProposalId,
    review_id:     ReviewId,
    department_id: DepartmentId,          // the department the proposal concerns
    kind:          ProposalKind,          // Merge{ into: DepartmentId } | Retire
    rationale:     String,                // plain language, drawn from the health + absorbability lines
    evidence:      [EvidenceRef],         // the M26 records — REQUIRED, non-empty, or the proposal is not raised
    confidence:    Confidence,            // must exceed the floor, or no proposal is raised
    resolution:    Resolution,            // Open | EnactedByPrincipal | Declined  — set by OBSERVING a Decision
    decision_id:   Option<DecisionId>,    // set only when a Principal Decision cited this proposal; NEVER written by M29's own act
}
```

The proposal is the entire propose-never-enact stance compressed into one record. It carries a
*recommendation* (`kind`), the *evidence* that justifies it, and a *resolution* that M29 can only ever set by
reading the `decisions` table — never by acting. Crucially, the record has **no field that could enact
anything**: no target manifest, no write instruction, no capability. It is inert by construction. A proposal
sitting at `resolution = Open` with `decision_id = None` is the normal, indefinite resting state; the Firm's
shape is unchanged until and unless a Principal Decision, recorded through the decision engine, changes it and
names this proposal as evidence.

### 4.6 Relationships

```
StructureReview 1 ──── * DepartmentHealth        (one per installed department per run)
DepartmentHealth 1 ──── 1 AbsorbabilityResult    (the Principle-13 test for that department)
StructureReview 1 ──── * StructureProposal        (zero or more; zero is a valid, clean review)
StructureProposal * ──── 0..1 DecisionId          (the ONLY link to structural change; read, never written by M29)
DepartmentHealth  * ──── + EvidenceRef            (non-empty; from M26 — ADR-0077)
StructureProposal * ──── + EvidenceRef            (non-empty; from M26 — ADR-0077)
```

The one edge that matters for Principle 14 is `StructureProposal → DecisionId`, and its direction is fixed:
**a Decision cites a proposal; a proposal never produces a Decision.** M29 reads across that edge to update a
resolution; it never writes across it.

---

## 5. The absorbability test and its evidence (ADR-0077 in mechanism)

Principle 13's test — *"if a department's Work Orders could be absorbed by a neighbouring department without a
measured drop in Deliverable quality, the department is overhead"* — is computed, not judged. The mechanism:

1. **Identify the candidate absorber.** For a department `D` in Division `V`, the candidate absorbers are the
   other departments in `V` (the Registrar resolves the Division roster). A department is only absorbable by a
   *neighbour* — Principle 13's word — because cross-Division absorption would violate the Division grouping
   rationale in the catalogue (`/docs-v2/04-department-catalog.md`). A Division of one (e.g. Cybersecurity)
   has no neighbour and is therefore never `Absorbable` — correctly, since it reports to Kai directly by
   design (Principle 5).
2. **Assemble comparable Work Orders.** From M26's outcome records, gather `D`'s concluded Work Orders over the
   quarter and the candidate absorber's concluded Work Orders of comparable kind. "Comparable" is decided by
   the Work Order's declared capability requirements, which both departments' Packs can be matched against —
   never by department identity (kernel neutrality, G8).
3. **Compute the measured quality drop.** `quality_drop = measured_quality(D) − projected_quality(absorber on
   comparable Work Orders)`, both drawn from M26 outcome records (Deliverable quality, rework rate, review
   rejection rate — the KPIs the catalogue already declares per department). A department is **Absorbable**
   only when `quality_drop ≤ 0` with sufficient evidence: the neighbour is *at least as good, measured*.
4. **Require evidence or withhold the verdict.** If either department has too few concluded Work Orders in M26
   to compare (below the evidence floor, §10), the verdict is `InsufficientEvidence`. No proposal follows an
   `InsufficientEvidence` verdict; the health line is emitted with a low-confidence flag so the Principal sees
   *"we could not tell this quarter,"* which is itself a useful, honest output.
5. **Emit a proposal only on Absorbable + confidence.** A `Retire` or `Merge` proposal is raised **only** when
   the department is `Absorbable`, the confidence exceeds the floor, and the evidence set is non-empty. `Merge`
   names the absorbing neighbour; `Retire` is raised when the department's Work Orders have effectively ceased
   (measured near-zero volume) rather than migrating to a specific neighbour.

The test is deliberately conservative: it errs toward `NotAbsorbable`/`InsufficientEvidence` and toward *not*
raising a proposal, because a false "retire this department" wastes the Principal's attention (Principle 1) and
a false "keep it" merely defers a finding to next quarter. Overhead without evidence is the failure mode;
proposing a retire without evidence would be the same failure mode wearing the reviewer's face.

---

## 6. Component structure

```
                          ┌───────────────────────────────────────────────────┐
   quarter boundary       │            sidra-self-review (kernel)             │
   or Principal run ──────►│                                                   │
                          │  ReviewRunner                                      │
                          │    │  1. enumerate installed departments (Registrar)│
                          │    ▼                                                │
                          │  MetricGatherer ──► reads M26 outcome records,      │
                          │    │                budget ledger, KPI samples      │
                          │    ▼  2. per-department overhead + measured quality  │
                          │  HealthAssessor                                     │
                          │    │                                                │
                          │    ▼  3. Principle-13 absorbability, per department  │
                          │  AbsorbabilityEngine (neighbour comparison, M26)    │
                          │    │                                                │
                          │    ▼  4. emit proposals — evidence REQUIRED          │
                          │  ProposalWriter (inert records; NO enact capability)│
                          │    │                                                │
                          │    ▼  5. observe decisions table for resolutions     │
                          │  ResolutionObserver (READ-ONLY on `decisions`)      │
                          └────┼───────────────────────┬──────────────────────┘
                               ▼                       ▼
                        sidra-departments        sidra-store (M26 records,
                        (Registrar: roster,       budget ledger, decisions —
                         Division neighbours)      READ paths only for M29)
                               │                       │
                               └───────────┬───────────┘
                                           ▼
                             assessment + proposals recorded  ─────►  event log (hash chain, ADR-0002)
                                           │                          StructureProposalRaised — never StructureChanged
                                           ▼
                                    Vault Markdown mirror (assessment, human-readable, no enact instruction)
```

Internal modules of `sidra-self-review`:

| Module | Responsibility |
|---|---|
| `runner` | the quarterly run: schedule, lifecycle state machine (§3), immutability on conclude |
| `metrics` | read M26 outcome records + budget ledger + KPI samples into per-department overhead and measured quality; **read-only** |
| `health` | compute `earned_overhead`; assemble each `DepartmentHealth` with its required evidence |
| `absorbability` | Principle 13's test (§5): neighbour resolution, comparable-Work-Order matching, measured quality-drop, verdict |
| `proposal` | write inert `StructureProposal` records; refuse any proposal lacking evidence or confidence; **holds no enact path** |
| `resolution` | observe the `decisions` table read-only; set a proposal's resolution when a Decision cites it |
| `mirror` | the human-readable assessment written to the Vault on conclusion |

**Dependency direction (ADR-0011).** `packages/domain ← services/self-review ← apps/*`. `services/self-review`
depends on `services/store` (read paths for M26 records, budget ledger, and `decisions`), `services/departments`
(Registrar roster + Division neighbours), and the domain crate. It does **not** depend on any crate that can
mutate the org chart — no edge to a hypothetical structural-write service exists because no such service is a
dependency, and critically **it has no write path to `departments`, `agents`, or a Pack.** The absence of
those edges is a compile-time property enforced in CI (§7, the "no structural-write path" assertion), exactly
as the Connector Framework enforces the absence of its forbidden edges (M16 Appendix B).

---

## 7. Security — the propose-never-enact guarantee

M29's attack surface is not outward-facing like a connector's; it is *inward*-facing, and the asset it
protects is the integrity of the org chart and its audit chain. The whole security posture is one property:
**M29 has no code path to alter a Division, Office, or Department. The org chart changes only by a Principal
Decision.**

This is enforced structurally, at four levels, so that it is a property of the build rather than a promise in
prose:

1. **No structural-write capability.** M29 requests no capability that writes `departments`, `agents`, a Pack
   manifest, or the org chart. Its store handle is read-only for those tables (write access is limited to its
   own three tables, §11). A write attempt does not fail at runtime — it does not compile, because the handle
   exposes no such method to this crate.
2. **No structural-write dependency edge.** `sidra-self-review` does not depend on the decision engine's
   *write* path, on the Registrar's *mutation* path, or on any Pack-install path. It reads the roster and the
   `decisions` table; it invokes nothing that changes them. CI asserts the absence of these edges (the "no
   structural-write path in M29" check).
3. **No enact API.** The public surface (§12) contains `run_structure_review`, `inspect_assessment`, and
   proposal queries — and no `enact`, `apply`, `merge`, `retire`, or `restructure` command. A caller cannot
   ask M29 to change the Firm's shape because M29 exposes no verb for it.
4. **No `StructureChanged` event.** M29 emits assessment and proposal events (§11.2). It never emits an event
   that records a structural change, because it never performs one. The only structural-change record in the
   system is a Decision through the decision engine, which M29 does not write.

| Threat | How M29 addresses it |
|---|---|
| A caller attempts to auto-enact a proposal | Structurally impossible — no `enact`/`apply` verb exists, and the crate holds no structural-write capability. The attempt has no method to call (level 3, level 1). |
| A compromised or buggy review tries to write `departments` | Does not compile — M29's store handle exposes no write to `departments`/`agents`/Packs (level 1); CI fails the build on any such edge (level 2). |
| A proposal is smuggled into the chain as a Decision | A `StructureProposal` has a distinct schema with no `chosen_option`/`authority`/`reversibility`; it cannot be mistaken for or promoted to a `decisions` row (invariant §3.3.2). |
| A silent structural change is attempted "for now" | Failure mode 8. M29 emits no `StructureChanged` event and holds no write path; the only way to change structure remains a Decision on the chain, which is auditable and Principal-authored. |
| An assessment is fabricated to justify a retire | ADR-0077: every proposal requires non-empty M26 evidence and above-floor confidence, or it is not raised (§5, §10). A retire with no measured evidence is the exact defect the review exists to prevent, applied to itself. |
| Analysis leaks off the machine | ADR-0009 / M26 locality: the crate has no egress path; assessments and proposals live only in the local Vault (G7). |

**The Principal Decision holds as the sole structural gate.** Changing the org chart is a Decision under
Principle 14 — criteria first, reversibility stated, dissent recorded, review date set — recorded in the
`decisions` table with `authority = 'principal'` (`/docs/04-database-design.md`). M29 informs that Decision
with evidence; it is never a substitute for it, and there is no path by which it could become one.

---

## 8. Department-health metrics from M26 (ADR-0077 in mechanism)

"Earned their overhead" is objective because both halves of the ratio are measured, not asserted.

1. **Overhead** is assembled from three measured sources: the department's **budget share** over the quarter
   (the budget ledger, `/docs/04-database-design.md`), its **Principal-attention cost** (how many of the
   quarter's Approval Requests and Brief lines it generated — Principle 1's currency), and its
   **coordination cost** (the volume of cross-department `department.request` traffic it required through the
   Exchange). A department that spends much budget, much attention, and much coordination has high overhead —
   a fact, from ledgers.
2. **Measured quality** is read from M26's outcome records: the department's Deliverable quality, rework rate,
   review rejection rate, and defect-escape rate over the quarter — the KPIs the catalogue already declares
   per department (`/docs-v2/04-department-catalog.md`). M26 is the milestone that made these into calibrated,
   inspectable numbers rather than dashboard decoration; M29 consumes them.
3. **`earned_overhead`** is the comparison of the two against the department's own history and its Division
   peers — *did this quarter's measured quality justify this quarter's measured overhead?* A department can
   have high overhead and still earn it (Cybersecurity is expensive and irreplaceable); a department can have
   low overhead and still fail the absorbability test (a neighbour does the same work as well for less). The
   two questions — *earned its overhead* and *absorbable by a neighbour* — are related but distinct, and the
   assessment reports both.
4. **Evidence is mandatory.** Every number above names the M26 records / ledger rows it came from
   (`EvidenceRef`). A `DepartmentHealth` row that cannot cite its evidence is not written (ADR-0077, invariant
   §3.3.3). This is what makes the assessment inspectable (G6): the Principal can follow any line back to the
   Missions and ledgers behind it.

Where M26 has too few concluded Missions for a department this quarter (a new or rarely-used department), the
health line is emitted with `confidence` below the floor and the verdict `insufficient_evidence` — an honest
"we cannot yet tell," never an invented score (G4, §10).

---

## 9. The assessment path and the propose-never-enact boundary (ADR-0076 in mechanism)

On `run_structure_review(quarter)`:

1. **Enumerate departments.** The Registrar returns the installed roster and each department's Division. M29
   reads; it does not install, remove, or reorder.
2. **Gather metrics.** The metric gatherer reads M26 outcome records, the budget ledger, and KPI samples into
   per-department overhead and measured quality. Read-only.
3. **Assess health.** For each department, compute `earned_overhead` and assemble a `DepartmentHealth` with
   its required evidence, or emit a low-confidence line if evidence is thin.
4. **Apply the absorbability test.** For each department, run §5's test against its Division neighbours using
   M26 comparisons. Produce an `AbsorbabilityResult` with evidence.
5. **Emit proposals.** For each `Absorbable` department above the confidence floor, write an inert
   `StructureProposal` (Merge or Retire) with its evidence. No proposal is written for a `NotAbsorbable`,
   `InsufficientEvidence`, or below-floor department.
6. **Conclude.** Write the immutable `StructureReview`; emit events (§11.2). **The pipeline ends here.** M29
   takes no further action. Whether the Firm's shape changes is now entirely a matter for the Principal.

Steps 1–6 are all reads and records within M29's three tables. **There is no step 7 that enacts anything**, and
that absence is the milestone. The one thing that can change the org chart is a Principal Decision recorded
*outside* M29, through the decision engine; when such a Decision cites a proposal, M29's resolution observer
(a read on the `decisions` table) updates the proposal's `resolution` to `EnactedByPrincipal` — a bookkeeping
read, long after and entirely downstream of the structural change the Principal, not M29, made.

---

## 10. Confidence and evidence sufficiency

Where the security model gives connector operations effect classes, M29 gives every emitted line a
**confidence**, and confidence gates whether a proposal is raised at all.

| Confidence band | Meaning | Behaviour |
|---|---|---|
| Above floor | Enough concluded M26 Missions to compare the department to its neighbours with a stable measured quality | A verdict (`Absorbable`/`NotAbsorbable`) is emitted; an `Absorbable` verdict may raise a proposal |
| Below floor (`insufficient_evidence`) | Too few concluded Missions this quarter to measure the department or a comparison | The health line is emitted **flagged**; the verdict is `InsufficientEvidence`; **no proposal is raised** (G4) |

The floor is a declared, inspectable threshold (a minimum count of comparable concluded Work Orders in M26),
not a runtime guess. It exists because Principle 13's test is *measured* — a verdict without enough measurement
is not the test, it is opinion, which is the failure mode 5 the review exists to answer. The conservative bias
is deliberate: M29 would rather report *"not enough evidence to judge this department this quarter"* than spend
the Principal's attention on a proposal built on three data points.

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 New tables — all additive (forward-only migrations, `0067`–`0069`)

| Migration | Table | Purpose |
|---|---|---|
| `0067` | `structure_reviews` | one row per quarterly run: id, quarter, status, departments_assessed, overall_confidence, started_at, concluded_at, run_by |
| `0068` | `department_health` | per-department metric: review_id, department_id, overhead, measured_quality, earned_overhead, absorbable verdict, candidate_absorber, quality_drop, **evidence_refs (JSON, non-empty)**, confidence |
| `0069` | `structure_proposals` | merge/retire recommendation: id, review_id, department_id, kind, target_department (for merge), rationale, **evidence_refs (JSON, non-empty)**, confidence, resolution, **decision_id (nullable FK → decisions, set only by observing a Decision)** |

Three tables, matching the pinned band exactly. `department_health` folds the `AbsorbabilityResult` into the
health row (it is 1:1 per §4.6), which keeps the migration set at three. All columns are additive; no existing
column's meaning changes. **A Firm that never runs a review has three empty tables and behaves exactly as it
did before M29** — a null review set is a fully supported state, not a migration artifact (G9). Note what is
*absent* from the schema: there is no column, table, or foreign key by which any of these rows could enact a
structural change. `structure_proposals.decision_id` points *at* a Decision; it is never a Decision, and
writing it is a downstream read of the `decisions` table, never an act (§9).

### 11.2 Domain events

Every event carries `actor`, `review_id`, and (where applicable) `department_id` / `proposal_id`, and lands on
the hash chain (ADR-0002):

`StructureReviewScheduled` · `StructureReviewStarted` · `DepartmentHealthAssessed` · `AbsorbabilityTested` ·
`StructureProposalRaised` · `StructureReviewConcluded` · `StructureProposalLinkedToDecision` ·
`StructureProposalDeclined`.

**The event that does not exist is `StructureChanged`.** M29 emits `StructureProposalRaised` — a proposal, not
a change — and, when it later observes a Principal Decision citing a proposal, `StructureProposalLinkedToDecision`
— a bookkeeping link, not a change. The structural change itself is recorded by the decision engine as a
`decisions` row, on the same chain, authored by the Principal. Anyone auditing the chain can therefore
distinguish, unambiguously, "the Firm proposed X" from "the Principal decided X" — which is the 4.0 constraint
made legible in the log.

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── structure-reviews/
    └── 2026-Q3/
        ├── assessment.md       per-department overhead, measured quality, earned-overhead verdict — human-readable
        ├── absorbability.md    the Principle-13 test per department, with the measured quality-drop and evidence
        └── proposals.md        each merge/retire recommendation, its evidence, and its resolution — plain language
```

Written on conclusion, not continuously. A Principal who abandons Sidra OS keeps a readable record of every
quarterly review, every department's measured health, and every proposal the Firm ever raised — and, crucially,
**a record that these were proposals.** The mirror contains no enact instruction and no structural mutation,
because M29 produced none. "How did the Firm come to be shaped this way" is answerable from the `decisions`
these assessments informed, exactly as Principle 14 requires.

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `run_structure_review(quarter)` → `ReviewId` | a new `StructureReview` | reads M26 + Registrar; writes only M29's three tables; a Principal action or the quarterly scheduler |

That is the **entire** command surface: one verb, and it produces an assessment. There is deliberately **no**
`enact_proposal`, `apply_merge`, `retire_department`, or `restructure` command. The absence is the milestone
(§7, level 3). Changing the org chart is a Decision through the decision engine — a different subsystem, a
different verb, a Principal authority — and M29 exposes no shortcut to it.

### 12.2 Queries

| Query | Returns |
|---|---|
| `inspect_assessment(review)` | the full assessment: every `DepartmentHealth` with its evidence refs and confidence |
| `list_reviews()` | all quarterly runs and their status |
| `list_proposals(review)` | the merge/retire recommendations, their evidence, and their resolution |
| `proposal_evidence(proposal)` | the M26 records / ledger rows behind a proposal — the inspectability path (G6) |

### 12.3 API rules

1. **No API changes the org chart.** Not a command, not a side effect, not a query with a hidden write. The
   surface is one analysis command and read-only queries.
2. **`decision_id` is set only by observing a Decision.** The resolution observer reads the `decisions` table
   and links a proposal to a Decision that cited it. There is no API that writes a Decision or enacts one from
   within M29.
3. **`run_structure_review` is a local analysis.** It makes no network call, reads only local M26 records and
   ledgers, and writes only the local Vault (ADR-0009, G7).
4. **Every returned line is traceable.** `inspect_assessment` and `proposal_evidence` return the evidence refs;
   a line the API cannot back with evidence was never written (ADR-0077).

---

## 13. Sequence diagrams

### 13.1 A quarterly review producing a clean assessment (every department earned its overhead)

```
Scheduler/Principal   ReviewRunner   Registrar   M26(store)   ProposalWriter   EventLog
   │ run_structure_review(Q3) │           │           │            │             │
   ├─────────────────────────►│ enumerate departments ►│           │             │
   │                          │◄── roster + divisions ─┤           │             │
   │                          │ gather metrics ────────────────────►│           │
   │                          │◄── overhead + measured quality ─────┤            │
   │                          │ assess health + absorbability (per dept, M26)    │
   │                          │ every dept: earned_overhead=true / NotAbsorbable │
   │                          │ emit proposals? ──────────────────►│ NONE        │
   │                          │ conclude review ────────────────────────────────►│ StructureReviewConcluded
   │◄── assessment (0 proposals) ─────────┤           │           │             │
   │  (the Firm's shape is unchanged; the review says "structure is earned")
```

### 13.2 The exit-criterion path — a department-health assessment, absorbability applied, a merge proposed, and only the Principal decides

```
Principal   ReviewRunner   Absorbability   M26   ProposalWriter   DecisionEngine(external)   OrgChart
  │ run_structure_review(Q3) │        │      │         │                  │                    │
  ├─────────────────────────►│ assess deptX vs Division neighbour deptY   │                    │
  │                          ├── compare Work Orders (M26) ►│             │                    │
  │                          │◄── quality_drop = −0.02 (Y at least as good, measured) ─┤        │
  │                          │ verdict: Absorbable, confidence above floor │           │        │
  │                          ├── raise Merge{X into Y} + evidence ───────►│           │        │
  │                          │                              StructureProposalRaised    │        │
  │◄── assessment: "propose merging X into Y (evidence: 41 Missions)" ────┤           │        │
  │                                                                                    │        │
  │  ── the Principal reads it, and MAY open a Decision (entirely outside M29) ──      │        │
  │  Decision{merge X into Y, criteria, reversibility=3, cites proposal} ─────────────►│ writes │
  │                                                                                    ├───────►│ org chart changes
  │                                                                    (decision engine + Registrar do this)
  │  ResolutionObserver reads decisions table ◄────────────────────────────────────────────────┤
  │  proposal.resolution = EnactedByPrincipal ; StructureProposalLinkedToDecision (bookkeeping) │
  │
  │  ── OR the Principal declines / does nothing: proposal stays Open or Declined, org chart UNCHANGED,
  │     and M29 changed nothing either way. The structural change, if any, was the Principal's Decision alone.
```

### 13.3 The propose-never-enact refusal (there is no verb to call)

```
Caller        sidra-self-review
  │ enact_proposal(p)?  │
  ├────────────────────►│  ── no such command exists in the public surface (§12) ──
  │◄── does not compile / no method ─┤  the crate holds no structural-write capability and no enact verb
  │  (nothing merged, nothing retired, org chart untouched — the refusal is structural, not a runtime check)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A proposal is drafted with no measured evidence | Not raised. The proposal writer refuses any `StructureProposal` with an empty evidence set (ADR-0077, invariant §3.3.3); the assessment records the department as `InsufficientEvidence`, not as absorbable |
| F2 | A caller attempts to enact a proposal | Refused structurally — no `enact`/`apply`/`merge` verb exists and the crate holds no structural-write capability (§7). The refusal is a missing method, not a runtime deny (F13.3) |
| F3 | M26 data is too thin to judge a department | The health line is emitted with `confidence` below the floor and verdict `insufficient_evidence`; no proposal follows (G4, §10) — an honest "cannot tell this quarter" |
| F4 | A department has no Division neighbour (a Division of one, e.g. Cybersecurity) | Never `Absorbable`; the absorbability engine returns `NotAbsorbable` with the reason "no neighbour," correctly, since such a department reports to Kai by design (§5) |
| F5 | Two consecutive quarters both propose retiring the same department | Two independent proposals in two immutable reviews; neither enacts anything. The recurrence is itself signal for the Principal, surfaced in the Brief; the org chart is unchanged until a Decision |
| F6 | A Principal Decision enacts a merge, then is later reversed | The reversal is another Decision on the chain; M29 never rewrites the original proposal or its `EnactedByPrincipal` resolution. History is append-only (invariant §3.3.4, ADR-0002) |
| F7 | The department roster changes between gather and conclude | The review records the roster it enumerated at `begin`; a mid-run install/uninstall is reflected in the *next* quarterly review, not retconned into this one |
| F8 | A buggy assessor tries to write the `departments` table | Does not compile — M29's store handle exposes no write to `departments`/`agents`/Packs (§7, level 1); CI fails on any such edge (level 2) |
| F9 | A proposal is never acted on | The normal, indefinite resting state: `resolution = Open`, `decision_id = None`, org chart unchanged. Doing nothing is a fully supported outcome, not an error |

---

## 15. Performance and locality

- **Quarterly, off the hot path.** A structure review runs once per quarter (or on an explicit Principal run).
  It is a batch analysis over concluded Missions, never in the path of a live Directive, Mission, or Brief. No
  interactive latency budget applies; the review does its reads, records its assessment, and stops.
- **Bounded by the department count, not the Mission count in the loop.** The review iterates over the
  installed departments (at most twenty-one, usually far fewer, Principle 13) and, per department, over its
  concluded Work Orders for the quarter — a bounded set from M26. It touches no live scheduler and holds no
  long-running lock.
- **All analysis is local (ADR-0009).** The review reads local M26 outcome records, the local budget ledger,
  and the local `decisions` table, and writes the local Vault. It makes no network call. The instrument that
  judges the Firm's shape never leaves the machine — the same guarantee M26 makes for calibration, inherited
  (G7).
- **Never blocks a structural change.** Because M29 enacts nothing, it can never be on the critical path of a
  reorganisation; the Principal's Decision proceeds through the decision engine whether or not a review ran.
  M29 is an advisor that is always optional and never a gate.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| M13 — departments, Registrar, Pack contract | the subject: the installed roster, each department's Division (for neighbours), and each Pack's declared KPIs |
| M26 — outcome-calibration measurement substrate | the evidence: Mission outcome records and per-department quality signals that make "earned their overhead" and "no measured quality drop" objective |
| M2 — event log | the assessment, health, and proposal events on the hash chain (ADR-0002) |
| The v1 decision engine + `decisions` table | the **only** structural-change path; M29 reads it to resolve proposals, never writes it |
| The budget ledger (`/docs/04-database-design.md`) | the overhead half of the department-health metric |

### 16.2 Assumptions

1. **The department substrate (M13) is installed** and the Registrar can enumerate departments and their
   Divisions. A Firm running "as one implicit department" (M11) has one department, no neighbour, and therefore
   no absorbable department — the review runs and reports "structure is trivially earned," which is correct.
2. **M26 has accumulated enough concluded Missions** for at least some departments to be judged. Where it has
   not, the review honestly reports low confidence (§10) rather than failing; a young Firm's first few reviews
   may be mostly `insufficient_evidence`, which is the correct and expected output.
3. **Structural change happens only through the decision engine.** M29's guarantee assumes the org chart has no
   *other* write path either (Principle 14, failure mode 8). If a future milestone added an admin path that
   edited the org chart outside the event log, that path — not M29 — would be the failure mode 8 defect; M29's
   design does not create one.

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| SR-1 | The review's proposals are treated as decisions and rubber-stamped, eroding Principle 14 | The proposal record carries no authority and no enact field; a Decision is a separate, deliberate act with criteria/reversibility/dissent recorded; the Brief presents a proposal *as* a proposal, never as a done deal |
| SR-2 | A thin-evidence quarter produces a confidently wrong "retire" | The evidence floor and conservative bias (§10, §5): `InsufficientEvidence` withholds the proposal entirely; ADR-0077 forbids an evidence-free proposal |
| SR-3 | Someone adds an `enact` shortcut "to save the Principal a step" | The exact failure mode 8 / convenient-exception pattern the Master Guide names; CI's "no structural-write path" assertion fails the build, and the missing capability means the shortcut cannot be written without a boundary-changing ADR |
| SR-4 | The absorbability test drifts into a novel metric that is no longer Principle 13's test | ADR-0077 pins the test to *measured quality drop on comparable Work Orders* — Principle 13's exact wording; the CI "absorbability-uses-M26-metrics" test asserts the inputs are M26 records, not an invented score |
| SR-5 | The crate accretes department-specific logic | CI grep for department identifiers fails the build (G8, the M11 kernel-neutrality rule); neighbours and comparability are resolved by capability and Division, never by name |
| SR-6 | Migration breaks a pre-M29 Firm | Forward-only, additive; three empty tables = pre-M29 behaviour; each migration independently deployable (G9) |

---

## 17. Acceptance criteria

The exit criterion — *"The Firm produces a department-health assessment with the absorbability test applied; it
may propose, never enact"* — decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | A quarterly structure review runs over the installed departments and produces a `StructureReview` with one `DepartmentHealth` per department | run test over a fixture Firm; assert a health row per installed department |
| AC2 | Each department's overhead and measured quality are computed from M26 records and the budget ledger, and every health line names its evidence | assess test asserting non-empty `evidence_refs` on every emitted line; a line with no evidence is refused (ADR-0077) |
| AC3 | **The absorbability test is applied to each department using measured M26 comparisons** — a department is `Absorbable` only when a Division neighbour is at least as good, measured, on comparable Work Orders | absorbability test with a fixture where the neighbour's measured quality ≥ the department's; assert `Absorbable` with `quality_drop ≤ 0` and evidence |
| AC4 | Thin M26 evidence yields `InsufficientEvidence` and **no** proposal, never a fabricated verdict | low-data fixture; assert the verdict is `insufficient_evidence`, the confidence is below floor, and no proposal is raised (G4) |
| AC5 | A department with no Division neighbour is never `Absorbable` | single-department-Division fixture (e.g. Cybersecurity); assert `NotAbsorbable`, reason "no neighbour" |
| AC6 | An `Absorbable` department above the confidence floor raises a Merge or Retire proposal that cites its M26 evidence | proposal test asserting a raised proposal with non-empty evidence and above-floor confidence |
| AC7 | **A raised proposal, left alone, changes nothing** — the org chart, the `departments` table, and every Pack are byte-identical before and after the review | the exit-criterion propose-never-enact test: run a review that raises a Merge proposal, then assert the org chart is unchanged |
| AC8 | **There is no structural-write path in M29** — no `enact`/`apply`/`merge`/`retire` command, no capability that writes `departments`/`agents`/Packs, and no dependency edge to a structural-mutation path | CI "no structural-write path" assertion (build fails on a hit) + a test that the public surface exposes no enact verb |
| AC9 | A structural change occurs only when a Principal Decision, recorded through the decision engine, cites a proposal; M29 then observes and marks the resolution | end-to-end test: a Decision cites a proposal → M29's observer sets `resolution = EnactedByPrincipal`; assert M29 wrote no Decision and performed no structural change |
| AC10 | M29 emits `StructureProposalRaised` but never `StructureChanged`; every event lands on the hash chain | `audit.verify` over a review-lifecycle fixture; assert no `StructureChanged` event originates in M29 |
| AC11 | The review is local: no network call, reads only local M26/ledger/decisions, writes only the local Vault | locality test asserting zero egress during a full review (ADR-0009, G7) |
| AC12 | The crate contains no department-specific identifier | CI grep check, build fails on a hit (G8, the M11 kernel-neutrality rule) |
| AC13 | A Firm that never runs a review behaves exactly as pre-M29; migrations 0067–0069 are forward-only and independently deployable | null-review test + migration test asserting additive, idempotent, independently deployable schema |

**AC7 and AC8 together are the exit criterion.** AC3 proves the assessment is Principle 13's test with M26
evidence; AC7 proves a proposal alone changes nothing; AC8 proves there is no path by which it could. The last
of these to go green (§ the implementation plan's final task) is the department-health-assessment /
propose-never-enact proof.

---

## Appendix A — Glossary additions

- **Structure Review** — the quarterly run (Principle 13) in which the Firm assesses its own structure:
  which departments earned their overhead, which are absorbable. A record, not an action.
- **Department Health** — the per-department metric pairing measured overhead against measured Deliverable
  quality (from M26), with the absorbability verdict and the evidence behind both.
- **Absorbability Test** — Principle 13's own test, computed: whether a Division neighbour could absorb a
  department's Work Orders with no *measured* drop in Deliverable quality (`quality_drop ≤ 0`), using M26
  outcome records. `Absorbable` / `NotAbsorbable` / `InsufficientEvidence`.
- **Structure Proposal** — an inert recommendation (Merge or Retire) with its M26 evidence, awaiting a
  Principal Decision. It carries no authority and no enact field; it is never a Decision.
- **Propose-never-enact** — the 4.0 stance applied to the org chart: the Firm proposes a structural change and
  cites its evidence; only a Principal Decision, recorded through the decision engine, enacts one. M29 holds no
  structural-write path.
- **Evidence Ref** — an opaque reference to the M26 outcome record, KPI sample, or ledger row behind an
  assessment line. Every emitted line has a non-empty set; a line without one is not written.

## Appendix B — Repository placement

```
services/
└── self-review/                NEW — crate sidra-self-review
    ├── runner                  the quarterly run + lifecycle state machine
    ├── metrics                 read M26 outcome records + budget ledger + KPI samples (READ-ONLY)
    ├── health                  compute earned_overhead; assemble DepartmentHealth with evidence
    ├── absorbability           Principle 13's test: neighbours, comparable Work Orders, measured quality-drop
    ├── proposal                write inert StructureProposal records; NO enact path
    ├── resolution              observe the decisions table READ-ONLY; set proposal resolutions
    └── mirror                  the human-readable assessment written to the Vault

services/store/migrations/      EXTENDED — 0067_structure_reviews.sql, 0068_department_health.sql,
                                           0069_structure_proposals.sql (forward-only)

infrastructure/testing/
└── self-review/                NEW — propose-never-enact proof, absorbability-uses-M26, no-structural-write-path,
                                      insufficient-evidence, locality, null-review
```

Dependency direction (ADR-0011): `packages/domain ← services/self-review ← apps/*`. `services/self-review`
depends on `services/store` (read paths for M26 records, budget ledger, and `decisions`) and
`services/departments` (Registrar roster + Division neighbours). It has **no** write path to `departments`,
`agents`, or a Pack, and **no** dependency edge to any structural-mutation path — both absences are CI-enforced.

## Appendix C — Implementation position

M29 is the fourth milestone of 4.0 "Continuum" and its highest-stakes application of the release's constraint.
It depends on M13 (the departments to assess) and M26 (the measured evidence that makes the assessment
objective) — the two dependencies the registry names (`/MILESTONE_REGISTRY.md` §4). Building it before M26 is
the mistake the registry warns against for the whole release: *"without outcome records, 'the Firm learns'
means the Firm adjusts numbers on the basis of nothing"* — applied to structure, a self-review without M26 is
structure-by-opinion, the failure mode 5 it exists to answer.

M29 inherits, unchanged, the propose-never-enact pattern M27 (Charter Evolution) and M28 (Procedural
Compilation) established earlier in 4.0. It applies that pattern to the one subject where a silent change would
be most damaging — the org chart — and proves, by the absence of any structural-write path, that Principle 14's
"there is no meta-layer" is a property of the build, not a promise.

**Exit criterion.** The Firm produces a department-health assessment with the absorbability test applied; it
may propose, never enact — proven by the absence of any structural-write path (AC8) and a test that a proposal
alone changes nothing (AC7).
