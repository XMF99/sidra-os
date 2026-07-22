# M25 Architecture Audit — gate before M26

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M26 (Outcome Calibration), the milestone that
**opens release 4.0 "Continuum"**.

| | |
|---|---|
| Milestone audited | M25 — Firm Templates and Portability |
| Registry status | Documented (this delivery set) · Open (implementation incomplete) |
| Audit verdict | **Architecturally complete. No gap blocks M26.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4–§5; the M25 delivery package (`M25-firm-templates-and-portability/`); `MISSION_ENGINE_ARCHITECTURE.md` (M15, M26's sole hard dependency) |

---

## 1. What M26 actually depends on

M26's hard dependency is **M15 (Mission Engine)**, not M25. The registry and the M26 architecture are explicit:

> **M26 — Outcome Calibration.** Depends on **M15** — calibration needs the outcome records, the
> plan-versus-reality data that only Missions produce (`/MILESTONE_REGISTRY.md` §5, dependency 1;
> `OUTCOME_CALIBRATION_ARCHITECTURE.md` Appendix C).

M25 and M26 are **release-adjacent siblings, not a chain**: M25 closes 3.0 "Chambers", M26 opens 4.0
"Continuum". M26 consumes nothing M25 produces — it reads the Mission Engine's outcome records (M15 §23.3), the
estimate model (M15 §5.2, §11), the novelty dimension (M15 §11.2), the risk aggregation (M15 §11.3), and the
event log (M2) and security kernel (M3). Portability (Template export/install) is not on M26's critical path.
This audit nonetheless confirms M25 is architecturally complete, because the workflow gates each milestone on
its predecessor being sound before the next is architected.

| Required dependency (for M26) | Present / defined | Location | Used by M26 for |
|---|---|---|---|
| **M15 — Mission Engine** *(the sole hard dependency)* | ✅ Documented | `MISSION_ENGINE_ARCHITECTURE.md` §5.2, §11, §11.2, §11.3, §23.2–§23.5 | outcome records (the sole input); the estimate model; the novelty dimension; risk aggregation; the `active_parameters()` read seam at plan time |
| M2 — event log | ✅ Documented | ADR-0002 | `CalibrationRun`/`CalibrationApplied`/`CalibrationRejected`/`CalibrationReverted` on the existing hash chain |
| M3 — Permission Broker, redaction | ✅ Documented | `/docs/07-security-model.md` | authorising `run`/`revert` as Decisions; redaction defence-in-depth on the write path |
| ADR-0009 — no telemetry | ✅ Documented | `/docs/0009-no-telemetry.md` | the governing constraint the whole subsystem is shaped around |
| ADR-0002 — projection discipline | ✅ Documented | `/docs/04-database-design.md` §1.2 | rebuildable parameters; exact revert |

All present. **M26 is safe to architect.**

---

## 2. M25 checklist result

Every artifact the workflow requires for a Documented milestone is present in the M25 delivery package
(`M25-firm-templates-and-portability/`), which documents M25:

| Required artifact | Present | Location |
|---|---|---|
| Architecture document | ✅ | `FIRM_TEMPLATES_AND_PORTABILITY_ARCHITECTURE.md` (why it exists, lifecycle, domain model, the structure/data boundary §5, security §7, "reproduces the structure" §8, Marketplace distribution, APIs, persistence, sequence diagrams, failure scenarios, performance, dependencies, risks, acceptance criteria, testing + CI, appendices) |
| ADRs | ✅ | `adr/0067-firm-template-carries-structure-never-data.md`; `adr/0068-firm-templates-distribute-through-marketplace-install-grants-nothing.md` (repo format, Status `Proposed`) |
| Specifications | ✅ | Template manifest / org-chart / PackRef / structural-Canon / attestation types (§5–§6) |
| Domain model | ✅ | the structure/data partition and Template types (§5–§6) |
| Component diagram | ✅ | components §6; `services/portability` placement |
| Sequence diagrams | ✅ | export → install → structure-without-data flows |
| Repository structure | ✅ | appendix (crate `sidra-portability` at `services/portability/`) |
| Public APIs | ✅ | export/install commands + queries + API rules |
| Domain events | ✅ | `TemplateExported`/`TemplateInstalled` on the hash chain |
| State machines | ✅ | export and install lifecycle |
| Error handling | ✅ | failure scenarios (empty-Vault guard, boundary refusal, Pack-resolution failure) |
| Security | ✅ | §7 boundary check, redaction/secret scan, install-grants-nothing |
| Performance | ✅ | export/install bounded; offline-replaceability posture |
| Risks | ✅ | risk register (structure/data leak, accretion, phone-home) |
| Dependencies | ✅ | M14 Marketplace, M21 Seats, M13/M2/M3 substrate |
| Acceptance criteria | ✅ | AC1–AC12; exit criterion AC4–AC9 (zero source data), owned by T7.9 |
| Implementation plan | ✅ | `IMPLEMENTATION_PLAN.md`, E1–E7 |
| Review checklist | ✅ | `REVIEW_CHECKLIST.md` |
| STEP-1 audit (its own predecessor) | ✅ | `00-M24-AUDIT.md` |

---

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to the work, note it and continue":

1. **ADR numbering band.** The last ADRs recorded in `/docs-v2/adr/README.md` are 0034–0037 (M16); M17–M24 will
   have added their own, and M25's ADRs are **0067–0068** per its pinned band. M26's ADRs continue the sequence
   at **0069–0071**. If M17–M24 consumed numbers past 0068, AntiGravity should confirm 0069–0071 are free at
   integration and renumber only on a real collision (numbering is permanent once documented — registry rule
   4). Note only; does not gate M26.
2. **Migration band.** M16 migrations end at `0029`; M25 uses `0054`–`0056`; M26 uses **`0057`–`0060`** per the
   architecture's persistence section (§12.1). If M17–M24 consumed a different range, AntiGravity should confirm
   `0057`–`0060` are free at integration. Additive and forward-only regardless. Note only.
3. **M25 ADR status is `Proposed`, not `Accepted`.** As in every prior package, an ADR's `Proposed` status does
   not gate the next milestone unless its *content* is incomplete; the M25 ADRs' content is complete and
   internally consistent. M26 does not depend on the structure/data boundary or Marketplace distribution.
   Recommended: promote 0067–0068 to `Accepted` on Principal approval during integration. Note only.
4. **Implementation-verification / compilation.** As with prior milestones, whether the M25 crate compiles is an
   implementation concern owned by AntiGravity, outside the architect's responsibility. Recorded as historical
   context only; not an architectural gap.

---

## 4. Gate decision

M25 is architecturally complete, and M26's sole hard dependency (M15 Mission Engine) plus its substrate (M2
event log, M3 security kernel, ADR-0009, ADR-0002) are architecturally present. No M25 or M15 architecture is
modified by the M26 package; M26 extends the substrate M15 already assumes — the outcome records, the estimate
model, the novelty dimension, the risk aggregation, and the `active_parameters()` read seam — which is the
correct dependency direction, and it opens no new M1–M25 boundary a later milestone must walk back.

**Proceed to M26 (Outcome Calibration). This opens release 4.0 "Continuum".**
