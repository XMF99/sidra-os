# M29 Architecture Audit — gate before M30

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M30 (Continuum Hardening and 4.0).

| | |
|---|---|
| Milestone audited | M29 — Firm Self-Review |
| Registry status | Defined (registry §4, 4.0 "Continuum") · architected in the M26–M29 set · implementation Open |
| Audit verdict | **Architecturally complete. No gap blocks M30.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `/MASTER_IMPLEMENTATION_GUIDE.md`, `/docs/07-security-model.md`, `/docs/02-testing-and-quality.md`, `/docs-v2/02-v2-principles.md`, the M26–M29 delivery packages |

---

## 1. Checklist result

M30 does not consume M29 the way M16 consumes M15 (a new crate extending a fresh substrate). M30 hardens the
**entire M26–M29 surface** — the four self-improvement feedback loops of 4.0 "Continuum". The specific reason
the STEP-1 audit targets **M29** is a sequencing fact, not a coincidence: **M29 is the last of the four
evolution paths, and M30's second security review must cover all four together** (registry §4; the M10
precedent that M9 lands before M10 so the plugin surface is inside the second review — impl-plan §3). If M29
were architecturally incomplete, the evolution-path security review — the load-bearing deliverable of M30 §5 —
would be red-teaming a surface that does not yet exist.

Every artifact the workflow requires for an architected milestone is present for M29 (and for M26–M28) in the
4.0 "Continuum" delivery set:

| Required artifact | Present | Location |
|---|---|---|
| Exit criterion | ✅ | "The Firm produces a department-health assessment with the absorbability test applied; **it may propose, never enact**" (registry §4) |
| Architecture document | ✅ | `M29-firm-self-review/` architecture (the quarterly Structure Review, Principle 13, run by the Firm on itself) |
| The propose-only boundary | ✅ | Self-Review emits a proposal artifact; there is no enact path — a structural change is a separate Principal Decision (Principle 14; GUIDE §8) |
| The absorbability test | ✅ | A department whose Work Orders a neighbour could absorb with no measured quality drop is flagged as overhead (Principle 13; GUIDE §10 failure mode 5) |
| Evidence gating | ✅ | The assessment cites the KPI history and Mission outcome records it derives from (M26 calibration data) |
| ADRs | ✅ | M29's boundary ADRs in the 0069–0077 span consumed by M26–M29 |
| Dependencies | ✅ | M13 (departments to assess), M26 (the outcome records the assessment reads) |
| Position in the critical path | ✅ | "M29 is the last evolution path; M30 bounds all four and reviews them together" (registry §4) |

The three peer evolution paths M30 also hardens are likewise complete and were audited as they were produced:

| Milestone | Exit criterion (registry §4) | Bearing on M30 |
|---|---|---|
| **M26** Outcome Calibration | Estimate error narrows measurably over 50 concluded Missions; the calibration is **inspectable and revertible**. **Local only — ADR-0009 stands, no telemetry leaves the machine.** | The measurement loop M30 must prove bounded and revertible (§4, §6) |
| **M27** Charter Evolution | A proposed charter revision that regresses its evaluation set is refused; an accepted one is a **Decision the Principal confirmed** | The eval-gated + Principal-confirmed loop M30 must prove cannot relax a Standard without a Decision (§4, §5) |
| **M28** Procedural Compilation | A procedure repeated five times is **proposed** as a Workflow; the proposal cites the Missions it derives from | The propose-only loop M30 must prove cannot auto-activate (§4, §5) |
| **M29** Firm Self-Review | A department-health assessment with the absorbability test applied; **it may propose, never enact** | The no-enact loop M30 must prove cannot alter the org chart without a Decision (§4, §5) |

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **M26–M29 are `Defined` in the registry §4, not yet flipped to `Documented`.** Their architecture packages
   exist (this delivery set), but the registry line still reads `Defined`. This is a metadata lag, not an
   architectural gap: an architecture document plus an implementation plan is what makes a milestone
   Documented (registry rule 2), and those exist. **Recommended fix:** flip M26–M29 to `Documented` in the
   same integration pass that lands their packages. **Not a blocker for M30** — M30 depends on the *content*
   of the four evolution paths, which is present.

2. **The four exit criteria of M26–M29 are each *individually* bounded, but no milestone has yet proven them
   bounded *together, under sustained self-improvement, as permanent gates*.** M26 says calibration is
   "inspectable and revertible"; M27 says a regressing charter revision "is refused"; M28 says a procedure "is
   proposed"; M29 says the Firm "may propose, never enact". Each is a per-milestone assertion demonstrated
   once. **This is not a gap in M26–M29 — it is the entire reason M30 exists** (registry §4: "bounding every
   feedback loop, second security review of the evolution paths"). Recorded here as the load-bearing input to
   M30 §4–§6, exactly as the M9 plugin surface was the load-bearing input to M10 §5.

3. **The first evolution-era security review has not occurred.** The two external security reviews mandated by
   testing §5 were the M3 kernel review and the M10 whole-1.0-surface review. Neither could have covered the
   self-improvement loops, which did not exist until M26. M30's evolution-path review is therefore the first
   adversarial look at whether a *self-improving* Firm can escalate its own authority. This is not a defect in
   any prior milestone; it is why M30's §5 is a full second security review scoped to the evolution paths, not
   a spot check (registry §4). Recorded as the reason §5 is load-bearing, not as a finding against M26–M29.

## 3. Gate decision

M29 is architecturally complete, and — more to the point for M30 — the whole M26–M29 surface it completes is
the subject M30 hardens. **Proceed to M30 (Continuum Hardening and 4.0).** No M26–M29 architecture is modified
by the M30 package; M30 adds only proofs — permanent CI gates and harnesses under `infrastructure/ci/` and
`infrastructure/testing/`, plus tests across the M26–M29 subsystems — and two policy decisions about the shape
of the 4.0 release (ADR-0078) and the evolution-path gates (ADR-0079). That is the correct direction:
hardening extends the surface it proves; it never rewrites it. M30 is the **final planned milestone**; 4.0
"Continuum" ships at the end of it and the Sidra OS architecture programme is complete (registry §3).
