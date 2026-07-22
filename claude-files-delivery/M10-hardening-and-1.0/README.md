# M10 — Hardening and 1.0 · Delivery Package

<<<<<<< HEAD
**Release 1.0 "Atrium" · closes the M1–M10 substrate · for AntiGravity**

Architecture and specification only — no production code. This package makes 1.0 shippable: it does not add
features, it proves the M1–M9 substrate survives crashes, corruption, migration, export/import, a second
security review, and thirty days of real use.

## Exit criterion (authoritative, from `docs/01-implementation-plan.md` §M10)

> Thirty days of dogfooding with **zero data-loss incidents, zero unlogged effects,** and every open defect
> either fixed or explicitly accepted in writing.

## What this milestone delivers

Crash-recovery matrix · corruption recovery · migration rehearsal from every prior schema version · full
export and re-import round-trip · a second security review including the prompt-injection corpus ·
performance regression suite in CI · signed installer and update channel · Principal-facing documentation.
=======
**For AntiGravity.** The complete architecture package for milestone M10 (Hardening and 1.0), the final
milestone of release 1.0 "Atrium". Architecture and specification only — **no production code**, per the
workflow.

## What this milestone delivers

Not a feature. M10 converts the durability, security, and boundedness *assertions* of M1–M9 into **permanent,
build-failing CI gates**, and then demonstrates the whole product surviving thirty days of real use. It adds
**no new crate** and **no new migration** — it hardens existing crates and adds only to `infrastructure/ci/`
and `infrastructure/testing/`. 1.0 ships at the end of M10 and is a complete product (GUIDE §5; registry §3).

**Exit criterion:** thirty days dogfooding, zero data loss, zero unlogged effects (`/docs/01-implementation-plan.md`
§M10; registry §4).
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7

## Contents

| File | What it is |
|---|---|
<<<<<<< HEAD
| `ARCHITECTURE.md` | The hardening architecture — recovery matrices, verification harnesses, release pipeline, the 22-point structure |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E8, every task and subtask, AC, review steps, completion definitions |
| `REVIEW_CHECKLIST.md` | The gate: every item ✓/✗ |
| `adr/` | ADR requirements (no new ADR required — M10 is v1 hardening; governing ADRs listed) |

## Governing ADRs (existing — none re-decided)

ADR-0002 (event log source of truth), ADR-0003 (single-file encrypted Vault), ADR-0009 (no telemetry),
ADR-0010 (typed durable Work Orders), plus the whole `docs/07-security-model.md`. M10 introduces no new
architectural decision; it proves the existing ones under stress.

## Dependency

M10 depends on M1–M9 being present. **Per the verification audit (`../M16-VERIFICATION-AUDIT.md`), M1–M9 are
only partially implemented and unbuilt (no toolchain).** M10 cannot be *completed* until M1–M9 are real and
compile; this package specifies M10 so it is ready the moment that baseline exists.

**STOP after M14.** Do not prepare M15/M16/M17.
=======
| `00-M9-AUDIT.md` | STEP 1 gate: confirms M9 (and the whole M1–M9 surface) is architecturally complete; notes non-blocking items |
| `HARDENING_AND_RELEASE_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0038-release-gate-is-a-proof-obligation-not-a-date.md` | The 1.0 gate is a demonstrated proof, not a calendar date |
| `adr/0039-hardening-adds-no-authoritative-tables.md` | Hardening bookkeeping is a projection over existing events; no new table |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The key decisions, in one line each

1. **Release gate (0038):** 1.0 ships when the eight permanent gates are green, the second security review has
   no release-blocker, and thirty consecutive dogfood days are clean — a proof obligation, not a date; hardening
   adds no feature and relaxes no budget.
2. **Additive bookkeeping (0039):** the dogfood ledger, release-gate record, and snapshot manifest are
   projections over existing `system.*`/`decision.*` events on the hash chain; M10 adds no authoritative table
   and no migration.
3. **The eight 1.0 gates (architecture §4):** Build, Dependency-direction, Generated-bindings, Domain-purity,
   Performance, Audit-coverage, Evaluation-sets, Chaos — made permanent and non-negotiable for 1.0.
4. **Zero data loss / zero unlogged effects, operationalized (architecture §10):** exact, mechanical
   definitions of each, so the exit criterion is a gate rather than a hope.

> **On ADR count.** M10 records exactly two new ADRs. The budget stance often expected here —
> "performance budgets are permanent gates; a breach is fixed by doing less work, not by raising the number" —
> is **already recorded** (GUIDE §3 non-negotiable 16; testing §6) and is *reaffirmed* inside ADR-0038 rather
> than duplicated as its own ADR. Audit-coverage and chaos are likewise already CI gates (GUIDE §7); M10 makes
> them permanent, which needs no new decision. Only the release-gate shape (0038) and the additive-bookkeeping
> choice (0039) are genuinely undecided by ADRs 0001–0037.

## Reading order

1. `00-M9-AUDIT.md` — why it was safe to start M10
2. `HARDENING_AND_RELEASE_ARCHITECTURE.md` — §1–§4 for the stance, the release-gate state machine, and the gate
   catalogue, then §5–§10 for the individual proofs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/` (0038, 0039), add rows to `docs-v2/adr/README.md`, mark `Accepted` on
  Principal approval. Numbering continues after ADR-0037 (M16); this package holds ADR-0038 and ADR-0039.
- **No migration.** M10 adds no table; the migration bands `0001`–`0029` are untouched (architecture §11.1).
- **No new crate.** M10 changes only `infrastructure/ci/` and `infrastructure/testing/`, plus test additions
  inside existing crates (Appendix B).
- The eight permanent gates run on every commit and are never removed; they outlive the milestone (GUIDE §7).
- On completion, update `MILESTONE_REGISTRY.md` M10 status to reflect implementation; the number is permanent
  (registry rule 4).

**STOP — do not begin M11 until M10 is implemented, integrated, and its exit criterion demonstrated.** Thirty
consecutive clean dogfood days and the recorded, demonstrated release-gate Decision are the last things to go
green (ADR-0038; architecture AC15). M11 (Department substrate) begins only after 1.0 is in daily use (GUIDE §5).
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7
