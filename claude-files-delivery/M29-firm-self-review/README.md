# M29 — Firm Self-Review · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M29 (Firm Self-Review), release 4.0
"Continuum". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The Layer-1 kernel machinery (`sidra-self-review`) that runs Principle 13's quarterly Structure Review **on
the Firm itself**: it enumerates the installed departments, computes each department's overhead against its
measured Deliverable quality, applies the **absorbability test** to each against its Division neighbours using
M26 outcome records, and — where a neighbour is measurably at least as good — raises an inert Merge or Retire
**proposal** that cites its evidence. It ships the assessment machine and its acceptance harness. It does
**not** ship any path to change the org chart: structural change is and remains a Principal Decision through
the decision engine (Principle 14). M29 proposes; it never enacts.

**Exit criterion:** the Firm produces a department-health assessment with the absorbability test applied; **it
may propose, never enact** — proven by the absence of any structural-write path (AC8) and a test that a
proposal, left alone, changes nothing (AC7).

## Contents

| File | What it is |
|---|---|
| `00-M28-AUDIT.md` | STEP 1 gate: confirms M28 (Procedural Compilation) is architecturally complete before M29; non-blocking notes |
| `FIRM_SELF_REVIEW_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0076-self-review-proposes-never-enacts.md` | The self-review proposes and never enacts; no structural-write path exists |
| `adr/0077-absorbability-test-is-computed-over-m26-metrics.md` | The absorbability test is Principle 13's test computed over M26 measured metrics, never an opinion |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Propose-never-enact (0076):** M29 assesses and proposes, and holds *no* structural-write path — no
   `enact`/`apply`/`merge`/`retire` verb, no write to `departments`/`agents`/Packs, no dependency edge to a
   structural-mutation path; the org chart changes only by a Principal Decision that may *cite* a proposal.
2. **Absorbability over M26 metrics (0077):** the absorbability test is Principle 13's own test computed —
   `quality_drop ≤ 0` measured on comparable Work Orders — with M26 evidence mandatory on every emitted line
   and thin evidence flagged `insufficient_evidence` rather than guessed.

## Reading order

1. `00-M28-AUDIT.md` — why it was safe to start M29
2. `FIRM_SELF_REVIEW_ARCHITECTURE.md` — §1 for the stance, §3–§5 for the lifecycle and the absorbability test,
   §7 for the propose-never-enact guarantee, then the ADRs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order (E7 is the exit criterion, last to go green)
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations occupy the band `0067_`–`0069_` (the M28 compilation migrations end at `0066_`): `0067_structure_reviews.sql`,
  `0068_department_health.sql`, `0069_structure_proposals.sql` — forward-only, additive.
- **Propose-never-enact + local-only are CI-enforced.** `sidra-self-review` has no write path to
  `departments`/`agents`/Packs and no dependency edge to any structural-mutation path (the "no structural-write
  path in M29" assertion, AC8); the crate has no egress path — all analysis is local (ADR-0009, AC11).
- **Principle 14 — there is no meta-layer.** M29 introduces no new mechanism for changing the org chart; that
  mechanism already exists (a Decision through the decision engine) and M29 does not touch it. M29 emits
  `StructureProposalRaised`, never `StructureChanged`.
- On completion, update `MILESTONE_REGISTRY.md` M29 status `Defined → Documented`; the number is permanent from
  that point (registry rule 4).

**Then STOP.** Do not begin M30 until M29 is implemented, integrated, and the exit criterion is demonstrated —
the department-health assessment with the absorbability test applied, and a proposal that alone changes nothing.
