# M27 Architecture Audit — gate before M28

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M28 (Procedural Compilation). The registry
orders M27 (Charter Evolution) before M28 within 4.0 "Continuum"; this audit confirms M27 is complete and
introduces no change M28 contradicts.

| | |
|---|---|
| Milestone audited | M27 — Charter Evolution |
| Registry status | Documented · Open (implementation gated on M26, per M27 `00-M26-AUDIT.md` D-1) |
| Audit verdict | **Architecturally complete. No gap blocks M28.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, §5; `M27-charter-evolution/CHARTER_EVOLUTION_ARCHITECTURE.md` (§1–§18 + appendices); `M27-charter-evolution/00-M26-AUDIT.md`; `/docs-v2/adr/0033-charter-comparison-is-a-partial-order.md`; ADR-0014 |

---

## 1. Checklist result

Every artifact the workflow requires for a Documented milestone is present in the `M27-charter-evolution/`
package:

| Required artifact | Present | Location |
|---|---|---|
| Architecture document | ✅ | `CHARTER_EVOLUTION_ARCHITECTURE.md` (§1–§18 + Appendices A–C) |
| ADRs | ✅ | ADR-0072 (regress gate + acceptance-is-a-Decision) and ADR-0073 (evaluation set is the sole merge gate; proposer ≠ reviewer), articulated in-doc at §1.2, §8, §9, §10 and threaded through the design goals (§2) — the same "ADRs embedded in the architecture" pattern the M15 audit accepted |
| Specifications | ✅ | Candidate charter & proposal validation §5; regress-gate mechanism §8; propose→confirm path §9; comparison semantics §10 |
| Domain model | ✅ | §4 (`CandidateCharter`, `EvaluationSet`, `EvaluationRun`, revision/version value objects; relationships §4 map) |
| Component diagram | ✅ | §6 component structure + internal modules |
| Sequence diagrams | ✅ | §13 |
| Repository structure | ✅ | Appendix B (`services/evolution/`, crate `sidra-evolution`) |
| Public APIs | ✅ | §12 commands/queries + API rules (`confirm_revision` the sole version-writer) |
| Domain events | ✅ | §11 persistence & events |
| State machines | ✅ | §3 charter-revision lifecycle + invariants §3.3 |
| Error handling | ✅ | §14 failure scenarios; §8.4 fail-closed on a missing evaluation set |
| Security | ✅ | §7 threat table (self-promotion, eval-set bypass, author-reviews-own-work) |
| Performance | ✅ | §15 local execution and offline |
| Risks | ✅ | §16.3 risk register; §14 failure scenarios |
| Dependencies | ✅ | §16.1 (M26, M13, M2; reuses ADR-0033, Decision engine); Appendix C |
| Acceptance criteria | ✅ | §17 (exit criterion decomposed to testable ACs) |
| Implementation plan | ✅ | §18 testing strategy + CI requirements; epic/task structure carried in the M27 package plan |
| Review checklist | ✅ | Definition of Done / gate integrity in §18 |

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if a dependency is not yet where you assumed, or registry metadata appears stale, note
it and continue":

1. **M27 implementation is gated on M26 being Documented.** M27's `00-M26-AUDIT.md` records dependency **D-1**:
   M27's evaluation-run scoring and proposal provenance read from M26's outcome-record surface, which must
   exist first. This is a **sequencing constraint on M27 implementation, not an architectural gap in M27**, and
   it does not gate M28's architecture — M28 depends on M26 directly (the observation loop) and inherits the
   same "M26 must be live before certification" constraint (architecture §14). Recorded here so the two audits
   agree.

2. **ADR-0072 and ADR-0073 are `Proposed`, not `Accepted`.** Their content is complete and internally
   consistent (Context → Options → Decision → Consequences, threaded through §1.2/§8/§9/§10). Per the rule that
   ADR status does not block downstream architecture when the content is complete, this does not gate M28. M28
   does not depend on M27's Charter machinery. Recommended: promote both to `Accepted` in the integration pass
   that lands M27's gate.

3. **ADR-0033 is `Proposed`, not `Accepted`.** ADR-0033 (Charter comparison is a partial order) is load-bearing
   for M27's regress gate and is complete. M28 does not use the Charter comparison. Non-blocking; recommended
   for promotion alongside M27.

## 3. Gate decision

M27 is architecturally complete. **Proceed to M28 (Procedural Compilation).** No M27 architecture is modified
by the M28 package. M27 evolves Layer-3 *archetype charters* by proposal-and-Decision; M28 compiles Layer-3
*candidate procedures* by proposal-and-Decision — sibling readers of the same M26 observation substrate, each
staying inside the same "nothing self-promotes" discipline (`/MILESTONE_REGISTRY.md` §4, Principle 14). M28
introduces no change that contradicts M27; the two subsystems share the substrate they extend (concluded-Mission
outcome records, the Decision engine, ADR-0009 locality) — the correct dependency direction.

**One carried-forward constraint, non-negotiable:** M28 *implementation and certification* are gated on M26
(Outcome Calibration) being implemented and its `mission.concluded` observation loop live (architecture §14).
Without concluded-Mission outcome records there is nothing to observe. This constraint is the first line of the
M28 STOP note.
