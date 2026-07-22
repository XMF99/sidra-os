# M27 Charter Evolution — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `CHARTER_EVOLUTION_ARCHITECTURE.md` (why it exists, the stance, the
      charter-revision lifecycle, domain model, candidate-charter validation, component structure, security,
      the regress gate, the propose→confirm path, comparison semantics, persistence/events/mirror, public APIs,
      sequence diagrams, failure scenarios, performance/offline, dependencies/risks, acceptance criteria,
      testing/CI, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M26 audit (STEP 1 gate) — `00-M26-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0072 — A charter revision that regresses is refused at the gate, and acceptance is a Principal
      Decision
- [x] ADR-0073 — The evaluation set is the archetype's versioned merge gate, and the proposer is never the
      reviewer

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost) and is `Status: Proposed`. Numbering continues the sequence after ADR-0071.

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] **M26 (Outcome Calibration)** — the performance signal a proposal is motivated by and its provenance
      points to. **D-1 (non-blocking for architecture, bounding for implementation):** M26 must be Documented
      and its outcome-record read surface (`sidra-calibration`) must exist before M27 implementation completes;
      E2 is the gated epic (`00-M26-AUDIT.md`; architecture §16.1)
- [x] M13 (Departments & Role Archetypes) + ADR-0014 — the unit that improves: archetypes as versioned charter
      data (`agent_versions`), resolved by the Registrar
- [x] ADR-0033 (`Charter::relation_to`) — the partial-order comparison the gate reuses to define "widens";
      `Incomparable`-is-widening and the `departments_allowed` inversion, verbatim
- [x] Decision engine (`/docs/03-decision-engine.md`) — acceptance is a Decision (`authority: principal`,
      criteria, reversibility, review date)
- [x] M21 (Seats) — the Principal Seat actor `confirm_revision` requires (author ≠ reviewer)
- [x] M3 (Permission Broker, redaction) — `confirm` passes the Broker; the charter redaction scan
- [x] M2 (event log) — revision events land on the existing hash chain
- [x] Dependency direction preserved: `packages/domain ← services/evolution ← apps/*`; depends on
      `services/security`, `services/store`, `services/departments`, `services/decisions`, `services/domain`,
      `services/calibration`; **no** edge to `services/orchestrator` or `services/mission` (CI-enforced, AC12)

## 4. Consistency with authoritative sources

- [x] Archetype/instance distinction and charter freezing match ADR-0014: a revision is a new *archetype*
      version; running instances keep their frozen charter until a natural boundary; future instances
      instantiate from the new version — M27 never changes live instances retroactively
- [x] The authority comparison is ADR-0033's four-valued partial order, unchanged; M27 adds a second call site
      (evolution) and declares **no** new narrowing direction (architecture §5.2)
- [x] "Charters are data, versioned, with an evaluation set attached; a charter change that regresses its
      evaluation set does not merge" (GUIDE §3 item 15) is made mechanical, not restated as prose (ADR-0073)
- [x] "The author never reviews their own work" (GUIDE §3 item 9) applies at the charter layer: the engine
      proposes, the archetype cannot author its gate or confirm its revision (ADR-0073; §9 step 2)
- [x] The 4.0 "Continuum" constraint holds: *nothing in this release may self-promote*
      (`/MILESTONE_REGISTRY.md` §4) — the engine has no version-write path outside `confirm`, which requires a
      Principal Decision (ADR-0072; Principle 14)
- [x] All learning is local: eval runs, scores, provenance, and revisions never leave the machine (ADR-0009);
      a permanent no, not a future ADR (architecture §1.4, §15)
- [x] `agent_versions` is appended-to by `confirm`, never altered; prior versions immutable (ADR-0002)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M27, 4.0 "Continuum"); ADRs continue after 0071;
      migrations continue after `0060` at `0061`–`0063`
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated (M27 extends
      M26/M13/ADR-0014/ADR-0033, it does not re-decide them)

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E1–E6
- [x] The exit criterion is two claims: AC1 (a regressing revision is refused at the gate) owned by task T6.10,
      and AC2 (an accepted revision is a Principal-confirmed Decision) owned by task T6.1 — proven by test, not
      by configuration
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No self-promotion:** the engine holds exactly one power the rest of the Firm does not — to write a
      *proposal*; it holds no power to write a charter version. `confirm_revision` is the only version-writer
      and requires a Principal Decision id (architecture §1.3; ADR-0072)
- [x] **The eval gate cannot be bypassed or disabled:** `run_evaluation` is a mandatory predecessor of
      `confirm_revision`; a Refused verdict is terminal; a missing eval set fails closed; there is no flag that
      skips the run (ADR-0073; AC4, AC7)
- [x] **A widening is refused, never routed as a performance improvement:** admissible only as a
      separately-authored Principal widening Decision naming the field — a Charter Amendment, out of M27's
      automatic scope (architecture §10.3)
- [x] The Charter Amendment (Principal-initiated widening) path is flagged out of scope — it would ride its own
      Decision, never an eval pass

## 7. Open items carried forward (non-blocking)

- [ ] **D-1 (the carried constraint):** M27 *implementation* is gated on M26 being Documented and its
      outcome-record read surface (`sidra-calibration`) existing; E2 wires against the M26 registry-pinned
      contract behind one module until then — a wiring concern, not a redesign (`00-M26-AUDIT.md`; architecture
      §16.1, §16.3 ER-6). First line of the STOP note.
- [ ] ADR-0033 promotion `Proposed → Accepted` recommended in the same integration pass that lands M27's gate,
      since M27 makes it load-bearing at a second site (`00-M26-AUDIT.md` §2) — does not gate M27
- [ ] On integration, update `MILESTONE_REGISTRY.md` M27 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 8. Testing & CI

- [x] The exit criterion is two fixtures: a regressing candidate (AC1, refused at the gate) and a passing,
      narrowing candidate carried through a Principal confirm (AC2/AC3, a Decision-backed version)
- [x] Surrounding fixtures named: widening (AC5), cross-archetype (AC6), no-eval-set fail-closed (AC4),
      agent-actor-confirm (AC8), version-immutability/replay (AC9), no-network (AC10), audit (AC11)
- [x] Every eval run is deterministic where the grader permits (seeded), so the gate's verdict is reproducible
- [x] CI required checks: the regress-refusal test green **last** (T6.10); no `agent_versions` write outside
      `confirm` and `confirm` unreachable without a passing run (AC7, AC12); no archetype id in the crate (G9);
      no network during an evaluation run (AC10); no edge to orchestrator/mission (AC12); an agent-actor confirm
      refused (AC8) — architecture §18

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified (with D-1 carried as an implementation-sequencing constraint)
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2 (gated on M26), then E3 → E4, with E5 alongside.
      E6 (the regress-refused / accept-is-a-Decision proof) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M28 until AntiGravity completes M27 implementation and
integration, and the exit criterion is demonstrated.
