# M12 Structure — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `STRUCTURE_ARCHITECTURE.md` (why it exists, design goals, org model, domain
      model, the veto mechanism, the Rail, archetype/instance, the five-tool invariant, failure mode 4,
      persistence, events, APIs, sequence diagrams, failure scenarios, performance, dependencies, risks,
      acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M11 audit (STEP 1 gate) — `00-M11-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0042 — A firm-wide veto is enforced as a non-downgradable blocking Guard at the choke point
      (operationalises ADR-0015; the one new decision M12 originates)
- [x] No other new ADR is required. M12 is largely a consolidation of already-accepted decisions: Divisions
      between Executive and Departments (0012), Offices hold vetoes / Departments hold delivery (0015), the
      five-tool executive (0004), and Role Archetypes / lazy instantiation (0014). None is re-decided.

ADR-0042 follows the repo format (Context → Options → Decision → Consequences, with accepted / gained /
reversal cost); this package holds the single new ADR-0042, immediately after M11's 0040–0041.

- [ ] **Integration action (AntiGravity):** copy ADR-0042 into `docs-v2/adr/`, add its row to
      `docs-v2/adr/README.md`, and mark it `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M11 (Registrar org graph, Guard Runner, Standards Engine, Exchange, one implicit department, replay
      equivalence) — the substrate M12 builds on; confirmed in `00-M11-AUDIT.md`
- [x] M3 (Permission Broker) — the choke point the veto Guard extends
- [x] M2 (event log) — structural and veto events land on the existing hash chain
- [x] **No new crate.** The org graph extends `sidra-departments`; the veto extends `sidra-security`; routing
      extends `sidra-orchestrator`; executive charters extend `sidra-agents`; types extend `sidra-domain`
- [x] Dependency direction preserved: `packages/domain ← services/* ← apps/*`; `packages/domain` gains no I/O
      edge (ADR-0011; `/docs/01-technical-architecture.md` §6)

## 4. Consistency with authoritative sources

- [x] Org model matches `/docs-v2/01-org-chart-v2.md`: eight Divisions (Engineering, Platform, Intelligence,
      Security, Product, Game Studio, Commercial, Corporate), four Offices (Quality, Cost, Architecture,
      Security), thirteen named agents, Corvus and Lyra new
- [x] Divisions sit between the Executive and Departments, depth 3, fast-lane 65% (ADR-0012)
- [x] Offices hold firm-wide vetoes and perform no delivery work; Cass does not head Finance; the dual-hat
      boundary (`reviewer_division != author_division`) is enforced mechanically (ADR-0015; org-chart §3)
- [x] Office precedence Security > Quality > Architecture > Cost (ADR-0015; org-chart §5)
- [x] Every Division executive holds exactly five tools (ADR-0004; layer-model §2)
- [x] Archetype/instance split respected: Division executives named/eager, Office reviewer instances lazy
      (ADR-0014; agent-architecture-v2 §1)
- [x] Migration policy: additive, forward-only, band 0007–0010; null structure = M11 behaviour
      (`/docs/04-database-design.md` §10; migration-strategy §2)
- [x] Milestone meaning per `/MILESTONE_REGISTRY.md` §4 (M12 = Structure; exit criterion verbatim); M11 gates
      M12 absolutely
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC13 defined in the architecture §Acceptance criteria and each mapped to a task in E7
- [x] The exit criterion — eight Divisions, four Offices, Rail shows Divisions, a veto blocks firm-wide proven
      by test — is decomposed across AC1–AC4, owned by tasks T7.1–T7.3
- [x] The firm-wide-veto proof (AC4) is the last epic's final proof and the last thing to go green (T7.3)
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No latency regression:** the added Division hop and the vetoes are gated by the latency/token CI
      budget against the v1 baseline (R-01, failure mode 4); AC6 owns it; it is a release blocker
- [x] Departments are **out of scope** — they are M13; M12 establishes the Executive-Layer skeleton (Divisions
      + Offices) the departments later populate. A Division with zero departments is a valid M12 end state
- [x] Ceremonial review is guarded, not merely warned about: the veto blocks (never warns), and the
      veto-rate instrument makes an above-95% approval Office a detectable defect (failure mode 3)

## 7. Open items carried forward (non-blocking)

- [ ] AntiGravity must confirm the **replay-equivalence CI gate is green** before demonstrating E7 — the one
      implementation precondition this architecture cannot certify from the documents (`00-M11-AUDIT.md` §3)
- [ ] The migration narrative in `/docs-v2/01-migration-strategy.md` §3 shows four Divisions at the upgrade
      moment; M12 establishes the full eight-Division skeleton with departments arriving in M13 — reconciled
      in `STRUCTURE_ARCHITECTURE.md` §3.1, note only
- [ ] On integration, update `MILESTONE_REGISTRY.md` M12 status per registry rule 4 (renumbering becomes
      forbidden once Documented)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete (one new: 0042)
- [x] Dependencies verified (no new crate)
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2 (with E6 alongside), then E3/E4/E5. E7 (the
      firm-wide-veto proof and the latency/token gate) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M13 until AntiGravity completes M12 implementation and
integration and the exit criterion is demonstrated.
</content>
