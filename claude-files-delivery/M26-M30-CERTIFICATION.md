# Sidra OS — M26–M30 Architecture Package · Certification Report

**Authority:** Architecture Authority (audit + correction pass)
**Date:** 2026-07-22
**Scope:** `claude-files-delivery/` — M26 (Outcome Calibration), M27 (Charter Evolution), M28 (Procedural
Compilation), M29 (Firm Self-Review), M30 (Continuum Hardening & 4.0). Architecture and specification only; no
production code.
**Method:** Full read of all five packages (README · STEP-1 audit · architecture spec · implementation plan ·
review checklist · ADRs) against the accepted M25 reference package and the `MILESTONE_REGISTRY.md` /
`MASTER_IMPLEMENTATION_GUIDE.md` standards, with per-milestone deep-audit and independent verification of every
load-bearing finding before any correction was applied.

---

## 1. Completeness Status — PASS

Every milestone contains every required deliverable. In this program's format the required documents map to a
dedicated file (README, STEP-1 audit, architecture spec, implementation plan, review checklist, ADRs) plus
named sections **within the architecture spec** (Domain Model, Public APIs, Events, State Machines, Security,
Performance, Risks, Dependencies, Acceptance Criteria, Exit Criteria, Testing Strategy, CI Requirements,
Repository placement).

| Deliverable | M26 | M27 | M28 | M29 | M30 |
|---|---|---|---|---|---|
| README · STEP-1 Audit · Impl Plan · Review Checklist · ADRs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Domain Model | ✅ §6 | ✅ §4 | ✅ §4 | ✅ §4 | N/A — hardening, "no new tables" (§11, ADR-0079) |
| Public APIs · Events · State Machines | ✅ | ✅ | ✅ | ✅ | ✅ |
| Security · Performance · Risks · Dependencies | ✅ | ✅ | ✅ | ✅ | ✅ |
| Acceptance · Exit Criteria | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Testing Strategy · CI Requirements** | ✅ §20/§21 | ✅ §18 | ✅ §15/§16 | ✅ **§18 (added)** | ✅ **§17 (added)** |
| Repository placement | ✅ App B | ✅ App B | ✅ App B | ✅ App B | ✅ App B |

**Corrected gap:** M29 and M30 originally lacked the dedicated *Testing Strategy* and *CI Requirements*
sections that every sibling and the M25 reference carry. The content existed but was dispersed across the
security, risk, acceptance and plan sections. A consolidated section was authored for each — M29 §18 and
M30 §17 — from that existing material (no new decisions introduced), and the two dangling `§18` template
pointers in M30 were repointed to the new §17.

## 2. Architecture Quality — PASS

The packages hold to every established Sidra OS principle and match the M25 reference in depth and rigour.

- **Dependency direction** (`packages/domain ← services/* ← apps/*`, ADR-0011) holds in all five; no new crate
  imports `services/orchestrator`/`services/mission`; each absence is stated as a compile-time/CI property.
  Two path errors that muddied this (M27 naming the Charter type's home `services/domain` instead of
  `packages/domain`; M28 leaving the M7 Workflow-validator's home crate unnamed while forbidding a runner edge)
  were corrected.
- **Determinism** is preserved and, where it was only asserted, now pinned. M28's procedure signature — the
  "computed forever" identity the whole milestone rests on — did not name its hash or canonical encoding; it
  now specifies SHA-256 over a length-prefixed canonical encoding with sorted edges and an encoding version
  (matching M25's precedent), in both the architecture and ADR-0075. M26's sample grain and revert/insufficient
  states were made internally consistent.
- **The "propose, never enact" stance** (M27/M28/M29) and the numeric-only/local-only boundary (M26) are
  specified structurally (missing verbs, read-only handles, CI assertions), not as runtime policy — the
  strongest and most consistent property across the set.
- **No architectural contradictions remain.** The state-machine contradictions found (M28 supersede source
  state; M26 revert source state and missing `Insufficient` terminal) were reconciled against their transition
  tables and sequence diagrams.

## 3. ADR Validation — PASS

- **Numbering is contiguous and collision-free:** 0069–0071 (M26), 0072–0073 (M27), 0074–0075 (M28),
  0076–0077 (M29), 0078–0079 (M30) — continuing cleanly after M25's 0068. No duplicates, no gaps.
- **All ADR files resolve** to the references in their READMEs, audits, architectures and checklists; filenames
  match cited numbers.
- **Migration bands are contiguous and non-colliding** (separate sequence from ADR numbers): M25 `0054–0056` →
  M26 `0057–0060` → M27 `0061–0063` → M28 `0064–0066` → M29 `0067–0069` → M30 none. A factual error stating
  "M25 migrations end at 0060" (it is M26 that ends at 0060) was corrected in M27's README and plan.
- ADR format (Context → Options → Decision → Consequences with accepted/gained/reversal cost) is uniform, and
  each package's ADRs are `Proposed`, pending Principal approval per the delivery workflow.

## 4. Cross-reference Validation — PASS

All internal section, ADR, milestone, and repository-path references now resolve. Dangling references
corrected: M26 `§19.1`/`§19.3` (self-references into its own AC table) → ADR-0002; M28 `§6.4` (target section
did not exist) → new deterministic sub-procedure section §3.4; M29 `F13.3` → `§13.3`; M30 `§18` → `§17`. The
M27 "four archetype fields" enumeration (listed as three in one place, double-counted `capabilities` in
another) was made consistent across §4.2/§5.1.

## 5. Repository Validation — PASS

Package structure matches the implementation layout: each milestone's `Appendix B` placement tree agrees with
the file/module columns in its implementation plan; crate names (`sidra-calibration`, `sidra-evolution`,
`sidra-compilation`, `sidra-self-review`) and paths (`services/*`, `services/store/migrations/`,
`infrastructure/testing/*`, `infrastructure/ci/`) are internally consistent after the `services/domain →
packages/domain` correction and the Workflow-validator home-crate clarification.

## 6. Findings reviewed and deliberately NOT changed (with rationale)

- **M29 "attribute metrics to M15 instead of M26."** Rejected. `MILESTONE_REGISTRY.md` pins M29's dependencies
  as **M13 + M26** and frames M26 as "the measurement loop." M29's attribution of measured quality metrics to
  M26, and ADR-0077's title, are consistent with the registry and the ADR decision. Adding M15 as a hard
  dependency and rewriting ADR-0077 would contradict the registry — outside an audit's mandate to "follow all
  ADR decisions." The underlying data lineage (outcome records originate in M15's read model, which M26 reads)
  is already stated in M26 §6.2 and is not in dispute.
- **M28 ADR-0009 cited at `/docs/0009-no-telemetry.md`.** Kept. This matches M26's citation convention for the
  same v1 ADR; it is the established path, not an outlier.

## 7. Remaining Issues

No blocking or substantive issues remain. Two purely cosmetic, non-blocking items are left as-is because they
carry no implementation ambiguity and touch external-authority numbering:

- State-name casing differs between an ASCII diagram and its transition table in M29 §3 and M30 §3
  (`SCREAMING_CASE` vs `Title-case`); each doc is internally consistent and the states are unambiguously the
  same.
- M30 references two gates by `GATE-5`/`GATE-7` labels whose numbering derives from the external
  `MASTER_IMPLEMENTATION_GUIDE.md §7` catalogue (not part of this package); the gates are also named, so they
  resolve unambiguously.

Neither requires architectural work before implementation.

## 8. Files Modified (12 edits across 11 files, written back in place)

1. `M26-outcome-calibration/OUTCOME_CALIBRATION_ARCHITECTURE.md` — state machine (`Insufficient` terminal;
   revert source aligned to table); sample grain → `Mission × estimand × Task signature`; sample natural-key
   note; `0057`/`0060` schema ownership disambiguated; `§19.x` → ADR-0002; "trailing windows" wording.
2. `M27-charter-evolution/README.md` — "M25 migrations end at 0060" → "M26".
3. `M27-charter-evolution/IMPLEMENTATION_PLAN.md` — same migration-attribution fix.
4. `M27-charter-evolution/CHARTER_EVOLUTION_ARCHITECTURE.md` — "four archetype fields" made consistent;
   `services/domain` → `packages/domain` (×2); `register_evaluation_set` positive authorization + author≠reviewer
   mechanism specified.
5. `M27-charter-evolution/REVIEW_CHECKLIST.md` — `services/domain` → `packages/domain`.
6. `M28-procedural-compilation/PROCEDURAL_COMPILATION_ARCHITECTURE.md` — SHA-256 + canonical encoding pinned;
   new deterministic §3.4 (sub-procedure delimitation); supersede transition source `Proposed → Activated`;
   M3 added to dependencies; Workflow-validator home crate named; root-engagement citation-unit clarified.
7. `M28-procedural-compilation/IMPLEMENTATION_PLAN.md` — `§6.4` → `§3.4`.
8. `M28-procedural-compilation/adr/0075-…digest.md` — SHA-256/canonical encoding grammar; `child_template` in
   the `NormalizedStep` tuple.
9. `M29-firm-self-review/FIRM_SELF_REVIEW_ARCHITECTURE.md` — new §18 (Testing strategy + CI requirements table);
   `F13.3` → `§13.3`.
10. `M30-continuum-hardening-and-4.0/CONTINUUM_HARDENING_ARCHITECTURE.md` — new §17 (Testing strategy + CI gate
    table); `§18` → `§17`; permanent-gate count clarified.
11. `M30-continuum-hardening-and-4.0/REVIEW_CHECKLIST.md` — `§18` → `§17`.

## 9. Final Readiness Score — 98 / 100 (A · Implementation-Ready)

Deductions are the two cosmetic residuals in §7 only; every substantive, correctness, determinism,
completeness, ADR, cross-reference, and repository item is resolved.

---

## Certification

**The M26–M30 architecture package is complete, internally consistent, fully compliant with the Sidra OS
architecture program, and ready for implementation without requiring further architectural work.**
