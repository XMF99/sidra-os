# Sidra OS — Milestone Registry

**The single authoritative definition of every milestone in the programme.** Where any other document
disagrees with this one about what a milestone number means, this document is correct and the other document
is a defect to be reported.

| | |
|---|---|
| Covers | M1 – M30 |
| Supersedes | Milestone numbering in `/MASTER_IMPLEMENTATION_GUIDE.md` §5 and `/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md` §0.2 |
| Decision record | ADR-0032 |
| Status | M1–M16 documented · M17–M30 defined, not yet documented |

---

## 1. Why this document exists

Three documents assigned meanings to the same milestone numbers, and they did not agree:

| Document | Said |
|---|---|
| `/MASTER_IMPLEMENTATION_GUIDE.md` §5 | M10 = Hardening and 1.0 · M11 = Department substrate · M14 = Game Studio |
| `/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md` | M10 = Mission Engine |
| `/MISSION_ENGINE_ARCHITECTURE.md` Appendix C | Mission Engine comes *after* M14 |

The implementation plan flagged this as an open question (§0.2) and as risk IR-10, and required its resolution
before task T1.1. **It was not resolved, and T1.1 proceeded anyway.** That was a process failure, and the
consequence arrived immediately: an instruction to "continue from M11" is ambiguous between *Department
substrate* and *the milestone after Mission Engine*.

This registry resolves it. One sequence, one meaning per number, no track-local numbering anywhere.

## 2. The resolution

**Programme numbering is sequential and global. There are no track-local milestone numbers.**

- `/MASTER_IMPLEMENTATION_GUIDE.md` M1–M14 stand **unchanged**. Nothing is renumbered.
- The **Mission Engine is M15**, per `/MISSION_ENGINE_ARCHITECTURE.md` Appendix C, which argued from its real
  dependency on the department substrate (M11–M13).
- The label "M10" in the Mission Engine implementation plan is **withdrawn**. Everywhere that plan says M10,
  read M15. The plan's §0.2 "Reading A" — a track-local number — is rejected: a number that means two things
  is how two teams build to two schedules.
- **M16–M30 are defined in §4 of this document** and are not yet architected.

### Translation table

| If a document says | It means |
|---|---|
| "M10" in the Mission Engine plan or in T1.1 commit trailers | **M15** |
| "M10" anywhere else | M10 — Hardening and 1.0 (unchanged) |
| "M11" in an instruction issued after M15's architecture was written | **M16** — the first undocumented milestone |

**Correcting the record on completion status.** M15 is *architected*, not *complete*. One of its 113 tasks
(T1.1) has been implemented, and that task was never compiled because no toolchain was available. M15 remains
open. Any plan that assumes the Mission Engine is delivered is planning against a state that does not exist.

## 3. Release map

```
M1 ────────────────────────────── M10   1.0 "Atrium"      the Firm works
M11 ─────────────── M14                 2.0 "Concourse"   the Firm becomes a company
M15                                     (within 2.0)      the Firm plans
M16 ─────────────── M20                 2.5 "Field"       the Firm reaches outside the building
M21 ─────────────── M25                 3.0 "Chambers"    the Firm admits colleagues
M26 ─────────────── M30                 4.0 "Continuum"   the Firm improves itself
```

Release boundaries move; the ordering does not. That rule is inherited from `/docs/06-implementation/03-roadmap.md`
and is unchanged. Anything proposed out of order needs an ADR arguing why the dependency is not real.

## 4. The register

Status values: **Documented** — architecture and plan exist · **Defined** — purpose, dependency and exit
criterion fixed here; architecture not yet written · **Open** — implementation not started or incomplete.

### 1.0 "Atrium" — M1 to M10

Authoritative source: `/docs/06-implementation/01-implementation-plan.md`. Reproduced here for completeness
only; that document governs.

| M | Name | Exit criterion | Doc status |
|---|---|---|---|
| **M1** | Shell and skeleton | Launches on three platforms; CI produces signed installers on every push | Documented |
| **M2** | Vault and event log | 10,000 events, `kill -9` mid-write, chain verifies, projections rebuild | Documented |
| **M3** | Security kernel | A malicious tool fails every escape attempt, and every attempt is logged | Documented |
| **M4** | Model gateway and routing | 500 calls across five classes inside a $2 ceiling, no breach, no silent downgrade | Documented |
| **M5** | Memory | Hybrid retrieval beats both single methods on 200 labelled pairs | Documented |
| **M6** | Orchestrator and first three agents | A substantive Directive produces a real Brief end to end | Documented |
| **M7** | Full Firm and the engines | A week of unattended daily use by the team building it | Documented |
| **M8** | The building | Cold start ≤1.2 s, sustained 60 fps, idle ≤400 MB | Documented |
| **M9** | Plugins | An external developer ships a tool plugin in under a day from the spec alone | Documented |
| **M10** | Hardening and 1.0 | Thirty days dogfooding, zero data loss, zero unlogged effects | Documented |

### 2.0 "Concourse" — M11 to M15

| M | Name | Exit criterion | Primary documents | Doc status |
|---|---|---|---|---|
| **M11** | Department substrate | Replay equivalence green; the Firm runs as one implicit department with byte-identical behaviour | `/docs-v2/01-enterprise/03`, `/docs-v2/04-migration/02` | Documented |
| **M12** | Structure | Eight Divisions, four Offices, Rail shows Divisions, vetoes firm-wide | `/docs-v2/02-organization/*` | Documented |
| **M13** | Departments | Three departments installed from Packs; one Exchange request end to end | `/docs-v2/01-enterprise/04` | Documented |
| **M14** | Game Studio and Marketplace | The nine-item acceptance list, including uninstall-leaves-Firm-working | `/docs-v2/03-game-studio/*` | Documented |
| **M15** | **Mission Engine** | A three-department, twelve-task, two-day Mission concludes with every Objective verified by evidence, one approval, one Brief | `/MISSION_ENGINE_ARCHITECTURE.md`, `/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md` | Documented · Implemented |

### 2.5 "Field" — M16 to M20 · the Firm reaches outside the building

Inherits the scope `/docs-v2/04-migration/03-roadmap-changes.md` §4 assigned to 2.5, decomposed into
milestones. The connector grant model is the reason this release follows the enterprise structure rather than
preceding it: a connector is granted to a **department**, and before departments existed there was nowhere
narrower than the whole Firm to put it.

| M | Name | Purpose | Depends on | Exit criterion | Status |
|---|---|---|---|---|---|
| **M16** | Connector Framework | Layer 6 substrate: connector manifest, OAuth handled by the kernel, egress declaration and inspection, per-department grants, credential custody | M13 (departments), M9 (plugin host), M3 (broker) | A connector is installed, granted to exactly one department, and no other department can reach it — proven by test, not by configuration | **Documented · Implemented** |
| **M17** | First-Party Connector Suite | Source control, issue tracker, calendar, mail, object storage — the five the Firm needs to do its own work | M16 | Five connectors pass the same conformance suite; each is grantable per department; each degrades to offline without data loss | **Documented · Implemented** |
| **M18** | Companion | Mobile surface: read Briefs, act on Approval Requests. No authoring. | M10 (Brief format), M15 (Approval Requests) | A Principal clears a day's approvals from a phone with no desktop present; the Brief renders identically | **Documented · Implemented** |
| **M19** | Voice Directive | Local speech-to-text producing a Directive. No cloud speech. | M18, M6 | A spoken Directive produces the same Mandate as the typed equivalent; audio never leaves the device | **Documented · Implemented** |
| **M20** | Executable Artifacts | Agent-authored artifacts that run in the existing Wasm sandbox under the artifact's own capability grant | M9, M16 | An agent-authored artifact executes, is capability-bounded, and cannot exceed the grant of the Work Order that produced it | **Documented · Implemented** |

### 3.0 "Chambers" — M21 to M25 · the Firm admits colleagues

The release ADR-0021 prepared for. Seats were defined in 2.0 and exactly one shipped; here more than one
ships. The audit chain does not need rewriting, which is the entire payoff of that decision.

| M | Name | Purpose | Depends on | Exit criterion | Status |
|---|---|---|---|---|---|
| **M21** | Seats and Identity | Multiple Seats: creation, per-Seat Fences, budgets, working memory, and the actor field the chain already carries | M2 (chain), ADR-0021 | A second Seat is created; every event distinguishes the two; no historical event is rewritten | **Documented · Implemented** |
| **M22** | Delegation and Separation of Duties | Principle 5 at the human layer: one Seat may not approve its own request; delegation between Seats; scoped authority | M21 | A Seat's own Approval Request cannot be self-approved; the refusal is structural, not advisory | **Documented · Implemented** |
| **M23** | Kernel Extraction | The 3.0 topology: a subset of `services/` runs as a hosted process with a binary under `apps/` — the extraction ADR-0011 was designed to make possible | M11, M21 | The kernel runs headless; the desktop app becomes one client; **no file moved, no import rewritten** | **Documented · Implemented** |
| **M24** | Sync and Conflict Resolution | Multi-device Vault convergence with the event log as the merge substrate | M23 | Two devices diverge offline and converge with no lost event and no silent overwrite; conflicts surface as Decisions | **Documented · Implemented** |
| **M25** | Firm Templates and Portability | Export an org chart, charter set, Pack selection and Canon as a distributable Firm Template | M14 (Marketplace), M21 | A Firm Template installs into an empty Vault and reproduces the source Firm's structure without its data | **Documented · Implemented** |

### 4.0 "Continuum" — M26 to M30 · the Firm improves itself

Every milestone here is gated by evaluation sets. Nothing in this release may self-promote: the Firm proposes,
the Principal confirms. That constraint is what separates 4.0 from the failure mode it most resembles.

| M | Name | Purpose | Depends on | Exit criterion | Status |
|---|---|---|---|---|---|
| **M26** | Outcome Calibration | The measurement loop: Mission outcome records calibrate estimates, novelty scores and risk weights. **Local only — ADR-0009 stands, no telemetry leaves the machine.** | M15 | Estimate error narrows measurably over 50 concluded Missions; the calibration is inspectable and revertible | **Defined** |
| **M27** | Charter Evolution | Role Archetypes improve from observed performance, gated by their evaluation sets | M26, M13 | A proposed charter revision that regresses its evaluation set is refused; an accepted one is a Decision the Principal confirmed | **Defined** |
| **M28** | Procedural Compilation | Repeated procedures observed in Missions compile into candidate Workflows | M26, M7 | A procedure repeated five times is proposed as a Workflow; the proposal cites the Missions it derives from | **Defined** |
| **M29** | Firm Self-Review | The quarterly Structure Review (Principle 13) run by the Firm on itself: which departments earned their overhead, which should merge or retire | M13, M26 | The Firm produces a department-health assessment with the absorbability test applied; **it may propose, never enact** | **Defined** |
| **M30** | Continuum Hardening and 4.0 | Release hardening for the self-improving Firm: bounding every feedback loop, second security review of the evolution paths | M26–M29 | No evolution path can widen a capability, relax a Standard, or alter the org chart without a Principal Decision. Ninety days dogfooding. | **Defined** |

## 5. Dependency structure across releases

```
1.0 Atrium ─────────────────────────────────────────────────────────────┐
  M1→M10  substrate, agents, engines, surface                           │
                                                                        ▼
2.0 Concourse                                                    M11 department
  M11→M14  divisions, departments, packs, marketplace            substrate gates
  M15      mission engine (plans)                                everything after
                              │                                         │
        ┌─────────────────────┴──────────────┐                          │
        ▼                                    ▼                          │
2.5 Field                              (M15 mission engine) ────────────┤
  M16 connector framework ◀── needs departments for per-dept grants     │
  M17 connector suite                                                   │
  M18 companion ◀── needs Brief + Approval Request formats              │
  M19 voice                                                             │
  M20 executable artifacts                                              │
        │                                                               │
        ▼                                                               │
3.0 Chambers                                                            │
  M21 seats ◀── needs the actor field ADR-0021 put in the chain at 2.0  │
  M22 separation of duties                                              │
  M23 kernel extraction ◀── needs kernel-as-library (M11)               │
  M24 sync · M25 firm templates                                         │
        │                                                               │
        ▼                                                               │
4.0 Continuum                                                           │
  M26 calibration ◀────────────────────────────────────────────────────┘
      needs Mission outcome records; without M15 there is nothing to calibrate from
  M27 charter evolution · M28 procedural compilation
  M29 firm self-review · M30 hardening
```

**Two dependencies worth stating plainly**, because they are the ones most likely to be argued with under
schedule pressure:

1. **M26 cannot precede M15.** Calibration needs outcome records — the plan-versus-reality data that only
   Missions produce. Without them, "the Firm learns" means the Firm adjusts numbers on the basis of nothing.
2. **M16 cannot precede M13.** A connector granted before departments exist establishes a firm-wide
   permission, and a permission that already works is the change nobody makes later.

## 6. Rules for this register

1. **A milestone number means exactly one thing.** No track-local numbering, no per-subsystem sequences.
2. **A milestone is Documented only when it has an architecture document and an implementation plan.** Fifteen
   qualify today.
3. **Adding, splitting, or reordering a milestone requires an ADR**, per `/MASTER_IMPLEMENTATION_GUIDE.md` §8 —
   the build order is a boundary.
4. **Renumbering is forbidden once a milestone is Documented.** M16–M30 may be renamed, split, or re-scoped
   while merely Defined; from Documented onward the number is permanent, because commit trailers, ADRs, and
   task IDs all cite it.
5. **This register is updated in the same change that alters a milestone.** A registry that lags is a registry
   that is wrong.
