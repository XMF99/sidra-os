# M30 — Continuum Hardening and 4.0 · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M30 (Continuum Hardening and 4.0), the
final milestone of release 4.0 "Continuum" and the **final planned milestone of the Sidra OS programme**.
Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

Not a feature. M30 converts the boundedness and no-escalation *assertions* of the four self-improvement loops —
outcome calibration (M26), charter evolution (M27), procedural compilation (M28), firm self-review (M29) — into
**permanent, build-failing CI gates**; runs the **second security review of the evolution paths**, red-teaming
the four loops together for the specific ways a self-improving Firm could escalate its own authority; and then
demonstrates the whole self-improving product surviving **ninety days of real use** with all four loops active.
It adds **no new crate** and **no new migration** — it hardens the M26–M29 subsystems and adds only to
`infrastructure/ci/` and `infrastructure/testing/`. This is release hardening for the self-improving Firm:
bounding every feedback loop so it cannot run away, and proving the whole evolution surface cannot promote
itself.

**Exit criterion:** no evolution path can widen a capability, relax a Standard, or alter the org chart without a
Principal Decision — proven per path by a permanent gate — and ninety consecutive dogfood days with the loops
active, the release itself a demonstrated Principal Decision (registry §4; ADR-0078). 4.0 "Continuum" ships at
the end of it.

## Contents

| File | What it is |
|---|---|
| `00-M29-AUDIT.md` | STEP 1 gate: confirms M29 (and the whole M26–M29 evolution surface) is architecturally complete; notes non-blocking metadata staleness |
| `CONTINUUM_HARDENING_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0078-the-4.0-release-gate-is-a-proof-obligation-not-a-date.md` | The 4.0 gate is a demonstrated proof, not a calendar date |
| `adr/0079-every-evolution-path-is-a-permanent-ci-gate.md` | Each of the four loops is a permanent CI gate proving no escalation without a Decision; hardening adds no authoritative table |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Release gate (0078):** 4.0 ships when the eight permanent gates (four evolution-path + four bound) are
   green, the second security review of the evolution paths has no unresolved release-blocker, and ninety
   consecutive dogfood days with the loops active are clean — a proof obligation, not a date; hardening adds no
   evolution feature and relaxes no bound. The 4.0 analogue of ADR-0038.
2. **Evolution-path gates (0079):** each of the four loops is a first-class permanent CI gate proving no
   capability/Standard/org-chart change without a Principal Decision; the escalation set is closed by
   enumeration, and the dogfood ledger, release-gate record, and escalation-corpus results are projections over
   existing `system.*`/`decision.*`/`evolution.*` events — no new table, no migration. The 4.0 analogue of the
   M10 gate catalogue and of ADR-0039.

## Reading order

1. `00-M29-AUDIT.md` — why it was safe to start M30 (and why M29 is sequenced immediately before it)
2. `CONTINUUM_HARDENING_ARCHITECTURE.md` — §1–§4 for the stance, the release-gate state machine, and the
   evolution-path gate catalogue, then §5–§10 for the individual proofs (security review, bounding, no-escalation,
   dogfood)
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/` (0078, 0079), add rows to `docs-v2/adr/README.md`, mark `Accepted` on
  Principal approval. Numbering continues after the ADRs consumed by M26–M29 (0069–0077); this package holds
  ADR-0078 and ADR-0079.
- **No migration.** M30 adds no table; the migration bands are untouched — release bookkeeping is a projection
  over existing events (architecture §11.1; ADR-0079, mirroring the ADR-0039 precedent).
- **No new crate.** M30 changes only `infrastructure/ci/` and `infrastructure/testing/`, plus test additions
  inside the M26–M29 subsystems (Appendix B).
- The eight permanent gates (four evolution-path EVO-1…EVO-4, four bound) run on every commit and are never
  removed; they outlive the milestone (GUIDE §7). Because there is no M31, "forever" is literal.
- Dependency direction is unchanged and re-proven by the existing Dependency-direction gate: `packages/domain ←
  services/* ← apps/*` (ADR-0011).
- On completion, update `MILESTONE_REGISTRY.md` M30 status to reflect implementation; the number is permanent
  (registry rule 4). Flip M26–M29 `Defined → Documented` in the same pass (see `00-M29-AUDIT.md` §2).

## This is the final planned milestone

4.0 "Continuum" ships at the end of M30 and, with it, the **Sidra OS architecture programme is complete through
M30**. A future capability is a future programme with its own registry entry and its own second security review,
never an M30 extension (registry §4, §6). There is no M31.

**STOP — this completes M1–M30; await the final architecture completeness audit and Principal approval. There is
no M31.** Ninety consecutive clean dogfood days with all four loops active and the recorded, demonstrated
release-gate Decision are the last things to go green (ADR-0078; architecture AC16). That Decision ships 4.0 and
closes the programme.
