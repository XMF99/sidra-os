# M28 Procedural Compilation — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `PROCEDURAL_COMPILATION_ARCHITECTURE.md` (problem/stance, what "the same
      procedure" means, domain model, candidate state machine, component structure, security, performance,
      public APIs, sequence diagrams, persistence & events, failure scenarios, dependencies, certification gate,
      testing strategy, CI requirements, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M27 audit (STEP 1 gate) — `00-M27-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0074 — A procedure repeated five times is a cited candidate Workflow; activation is a Principal
      Decision; a candidate never widens capability beyond its source procedures held
- [x] ADR-0075 — "The same procedure" is a normalized, order-preserving, model-free signature over Work Order
      types (byte-equality of a canonical digest)

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the sequence (0074–0075).

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M26 (Outcome Calibration — the observation loop) — the substrate M28 subscribes to on `mission.concluded`;
      the local-only learning discipline (ADR-0009) it inherits. **Hard dependency:** M28 cannot be certified on
      a Firm without M26's observation loop live (architecture §14).
- [x] M7 (Full Firm & the engines — Workflows) — the Workflow definition format a candidate compiles to, the
      validator it must pass (`/docs/01-workflow-engine.md` §2), and the engine that runs an *activated* candidate.
      M28 produces the definition; M7 runs it.
- [x] M15 (Mission Engine) — the source of the observed procedures: the outcome record (§23.3), the Work Order
      sequence, the `mission_id` distinctness unit.
- [x] M13 (departments) — the `RoleArchetypeId` in a normalized step (a role, not a person, ADR-0014) and the
      capability scope for the ceiling check.
- [x] M3 (Permission Broker + Decision engine) — the ceiling check against source capabilities and the Decision
      that activates a candidate (Principle 14).
- [x] M2 (event log) — every M28 event lands on the existing hash chain (ADR-0002).
- [x] Dependency direction preserved: `packages/domain ← services/compilation ← apps/*`; `services/compilation`
      depends on `services/store`, `services/security`, `services/calibration`; **no** edge to
      `services/orchestrator` or `services/mission` (CI-enforced, AC11)

## 4. Consistency with authoritative sources

- [x] Exit criterion matches the registry verbatim: *"A procedure repeated five times is proposed as a
      Workflow; the proposal cites the Missions it derives from"* — proven by test (AC1, AC2)
- [x] The candidate reuses the `playbooks` model (`/docs/04-database-design.md` §6): `status='proposed'`,
      `derived_from=[engagement ids]` (the citation), `steps`; `status` domain `proposed | active | retired`;
      activation is `proposed → active`. No parallel procedure store is added (§4.6, AC12)
- [x] The 4.0 propose-never-enact constraint holds (`/MILESTONE_REGISTRY.md` §4, Principle 14,
      `/MASTER_IMPLEMENTATION_GUIDE.md` §12): compilation is inert; the only edge into `Activated` carries a
      Principal `DecisionId`; there is no `propose_candidate`/`compile_candidate`/`observe` command (§9.2)
- [x] "The same procedure" is signature byte-equality (ADR-0075), deterministic and model-free — the same
      discipline as the deterministic scheduler (`MISSION_ENGINE_ARCHITECTURE.md` G5, Principle 8); no embedding,
      no clustering, no model call in the core comparison
- [x] Local only (ADR-0009): observation, counting, and compilation make no network connection; nothing
      self-promotes and nothing leaves the machine (AC8)
- [x] Layer model respected: kernel machinery (Layer 1) reads Layer-6 outcome records and writes Layer-3
      candidate procedures; the runner (M7) is a separate crate M28 cannot import (§6, AC11)
- [x] Migration band `0064`–`0066` sits above the prior milestones' migrations (end at `0063`); no existing
      column's meaning changes (§11.1)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E6 (with construction-time ACs also
      owned by E1/E3/E4)
- [x] The exit criterion (five distinct Missions with an equal signature → one `Proposed` cited candidate; four
      → none) is AC1/AC2, owned by task T6.11 — the last thing to go green
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] A candidate is **never auto-activated**: the state machine (§5.2) has no automatic edge into `Activated`;
      the CI grep-and-test check (T6.5) fails the build if the activation transition is reachable without a
      Principal `DecisionId`
- [x] **Citations are mandatory**: a `WorkflowCandidate` is unconstructable with fewer than five distinct cited
      Missions (§4.4); there is no uncited candidate to fabricate
- [x] **No capability widening**: the ceiling is the union of source capabilities; a widening compilation is
      refused at proposal, not clamped (§7, AC5)
- [x] Out of scope, each correctly deferred: running an activated candidate (M7); policing an activated
      Workflow's ongoing value / self-retirement (automation engine + M29, F9); a fuzzy/similarity match (would
      need its own ADR and threat model, §1.4); a configurable threshold (deliberately fixed at five, §13.2)

## 7. Open items carried forward (non-blocking)

- [ ] ADR-0074/0075 promotion `Proposed → Accepted` on Principal approval during integration
- [ ] ADR-0072/0073 and ADR-0033 promotion (M27's decisions) — noted in `00-M27-AUDIT.md`; does not gate M28
- [ ] **Hard sequencing constraint:** M28 implementation and certification are gated on M26 being implemented
      and its `mission.concluded` observation loop live (architecture §14, `00-M27-AUDIT.md` §3). Without
      concluded-Mission outcome records there is nothing to observe.
- [ ] On integration, update `MILESTONE_REGISTRY.md` M28 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2 → E3 → E4, with E5 landing each migration just
      ahead of its first writer. E6 (the five-recurrences cited-proposal proof, T6.11) is the last thing to go
      green.

**STOP.** Per the workflow, do not continue to M29 (Firm Self-Review) until AntiGravity completes M28
implementation and integration, and the exit criterion is demonstrated.
