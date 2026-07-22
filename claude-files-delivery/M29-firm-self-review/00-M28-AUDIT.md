# M28 Architecture Audit — gate before M29

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M29 (Firm Self-Review).

| | |
|---|---|
| Milestone audited | M28 — Procedural Compilation |
| Registry status | Documented · Open (implementation incomplete) |
| Audit verdict | **Architecturally complete. No gap blocks M29.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `M28-procedural-compilation/PROCEDURAL_COMPILATION_ARCHITECTURE.md`, `M28-procedural-compilation/adr/0074-*.md`, `M28-procedural-compilation/adr/0075-*.md` |

---

## 1. Checklist result

Every artifact the workflow requires for a Documented milestone is present in the M28 architecture package
(`M28-procedural-compilation/`):

| Required artifact | Present | Location |
|---|---|---|
| Architecture document | ✅ | `PROCEDURAL_COMPILATION_ARCHITECTURE.md` (§1–§17 + Appendices A–C) |
| ADRs | ✅ | `adr/0074-procedure-repeated-five-times-is-a-cited-candidate-workflow.md`, `adr/0075-procedure-signature-is-a-normalized-order-preserving-digest.md` |
| Specifications | ✅ | procedure signature / observation / candidate models §3–§4; APIs §9 |
| Domain model | ✅ | §4 (NormalizedStep, ProcedureSignature, WorkflowCandidate, CandidateActivation); data model §11 |
| Component diagram | ✅ | §6 component structure (observer → signature → recurrence → compiler → ceiling → registry → activation) |
| Sequence diagrams | ✅ | §10.1–§10.x |
| Repository structure | ✅ | Appendix B |
| Public APIs | ✅ | §9 commands/queries + API rules |
| Domain events | ✅ | §11.2 event variants on the hash chain |
| State machines | ✅ | §5 candidate state machine (`proposed → active → retired`) |
| Error handling | ✅ | §12 failure scenarios |
| Security | ✅ | §7 (propose-never-enact; no auto-activation; capability ceiling) |
| Performance | ✅ | §8 (O(1) signature lookup; observation off the hot path) |
| Risks | ✅ | §13 dependencies, assumptions, risks |
| Dependencies | ✅ | Appendix C + §13 (M26, M7, M15, M13, M2) |
| Acceptance criteria | ✅ | §17 (AC1–ACn), exit criterion decomposed |
| Implementation plan | ✅ | §14 certification gate + §15 testing strategy + §16 CI requirements frame the build |
| Review checklist | ✅ | §16 CI requirements + §17 AC serve as the definition of done |

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **Both M28 ADRs are `Proposed`, not `Accepted`.** ADR-0074 (a procedure repeated five times is a cited
   candidate Workflow) and ADR-0075 (the procedure signature is a normalized, order-preserving digest) are
   complete and internally consistent (Context → Options → Decision → Consequences, with accepted / gained /
   reversal cost). Per the rule that ADR status does not block future architecture unless the content is
   incomplete, this does not gate M29. Recommended: promote to `Accepted` when the M28 review closes.

2. **M28 delivers architecture only; no implementation is expected at gate time.** The M28 package is the
   architecture and its ADRs — the specification AntiGravity implements. Compilation/implementation status is
   an AntiGravity-owned concern, outside the architect's responsibility, and is recorded here as context only.

3. **M28's own STEP-1 gate (its §14) depends on M26 and M27, both already Documented in this set.** M29
   inherits the same M26 dependency (the measurement substrate) and adds M13 (the departments to assess); both
   are present as sibling packages. No M28 artifact is missing that M29 relies on.

## 3. Gate decision

M28 is architecturally complete. **Proceed to M29 (Firm Self-Review).** No M28 architecture is modified by the
M29 package. M29 reuses, unchanged, the 4.0 propose-never-enact pattern M28 established for Workflows
(assessment → proposal → Principal Decision) and applies it to a different subject — the org chart — under
Principle 14. Its dependencies (M13 departments, M26 outcome records) are the correct direction and are already
Documented in this set.
