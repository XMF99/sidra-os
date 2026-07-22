# M29 Firm Self-Review — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `FIRM_SELF_REVIEW_ARCHITECTURE.md` (why it exists, the stance, review lifecycle,
      domain model, the absorbability test, component structure, the propose-never-enact security guarantee,
      department-health metrics from M26, the assessment path, confidence/evidence, persistence, public APIs,
      sequence diagrams, failure scenarios, performance/locality, dependencies, risks, acceptance criteria,
      appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M28 audit (STEP 1 gate) — `00-M28-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0076 — The self-review proposes and never enacts; structural change remains a Principal Decision
- [x] ADR-0077 — The absorbability test is Principle 13's test computed over M26 measured metrics, never an
      opinion

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the sequence after ADR-0075 (M28).

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M13 (departments, Registrar, Pack contract) — the subject: the installed roster, each department's
      Division (for neighbours), and each Pack's declared KPIs; present as a sibling package in this set
- [x] M26 (outcome-calibration measurement substrate) — the evidence: Mission outcome records and
      per-department quality signals that make "earned their overhead" and "no measured quality drop" objective
- [x] M2 (event log) — assessment, health, and proposal events land on the existing hash chain (ADR-0002)
- [x] The v1 decision engine + `decisions` table — the **only** structural-change path; M29 reads it to
      resolve proposals, never writes it
- [x] Dependency direction preserved: `packages/domain ← services/self-review ← apps/*`; **no** write edge to
      `departments`/`agents`/Packs and **no** dependency edge to any structural-mutation path (CI-enforced, AC8)

## 4. Consistency with authoritative sources

- [x] Principle 13 (structure earned by evidence) — M29 *is* Principle 13's quarterly Structure Review, made a
      machine and pointed at the Firm itself; the absorbability test in §13 is the test M29 computes
- [x] Principle 14 (no meta-layer) — M29 introduces **no** new mechanism for changing the org chart; a
      structural change remains a Principal Decision; M29 emits `StructureProposalRaised`, never
      `StructureChanged`
- [x] GUIDE failure mode 5 (structure without evidence) — the review M29 runs is failure mode 5's stated
      response; a health line or proposal with no measured evidence is not emitted (ADR-0077)
- [x] GUIDE failure mode 8 (silent structural change) — M29 holds no structural-write path; the §7 guarantee is
      the direct mitigation, enforced at build time
- [x] The absorbability test uses M26 metrics — `quality_drop ≤ 0` measured on comparable Work Orders, inputs
      asserted to be M26 records by the "absorbability-uses-M26-metrics" test (ADR-0077, AC3, SR-4)
- [x] The 4.0 "Continuum" propose-not-enact constraint — *the Firm proposes, the Principal confirms*; M29
      reuses the pattern M27/M28 established, applied to the org chart, the release's highest-stakes subject
- [x] All analysis is local (ADR-0009 / M26 locality) — no egress path in the crate; assessments and proposals
      live only in the local Vault (AC11)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M29, 4.0 "Continuum"); migrations `0067`–`0069` continue
      after M28's `0066`
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC13 defined in the architecture §17 and each mapped to a task in the plan
- [x] The exit criterion ("a department-health assessment with the absorbability test applied; it may propose,
      never enact") is AC7 + AC8 together, owned by task T7.8 (the last thing to go green)
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No structural-write path** — no `enact`/`apply`/`merge`/`retire`/`restructure` verb, no write to
      `departments`/`agents`/Packs, no dependency edge to a structural-mutation path (ADR-0076, AC8)
- [x] **Propose, never enact** — M29 writes exactly three record kinds (review, health, proposal); the org
      chart changes only by a Principal Decision that may *cite* a proposal
- [x] Enacting a structural change is **out of scope** by construction — it is a Decision through the decision
      engine, a different subsystem M29 does not write to

## 7. Open items carried forward (non-blocking)

- [ ] ADR-0076 / ADR-0077 promotion `Proposed → Accepted` when the M29 review closes — does not gate
      implementation
- [ ] M28 ADRs (0074, 0075) remain `Proposed`; promote when the M28 review closes (see `00-M28-AUDIT.md` §2) —
      does not gate M29
- [ ] On integration, update `MILESTONE_REGISTRY.md` M29 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 8. Testing and CI

- [x] Every task ships its own tests; `main` stays green per task (plan §0.2)
- [x] CI enforces the propose-never-enact guarantee: "no structural-write path in M29" (T5.1), no enact verb in
      the public surface (T5.2), no `StructureChanged` event (T5.4/T6.5)
- [x] CI enforces kernel neutrality: no department identifier in the crate (T7.7, AC12, G8)
- [x] Locality is tested: zero egress during a full review (T7.6, AC11)

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, with E3 alongside and E6 landing the schema
      early. E7 (the department-health-assessment / propose-never-enact proof, T7.8) is the last thing to go
      green.

**STOP.** Per the workflow, do not continue to M30 until AntiGravity completes M29 implementation and
integration, and the exit criterion is demonstrated — the assessment with the absorbability test applied, and a
proposal that alone changes nothing.
