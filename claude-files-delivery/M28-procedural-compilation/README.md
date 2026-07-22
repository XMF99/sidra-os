# M28 — Procedural Compilation · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M28 (Procedural Compilation), release 4.0
"Continuum". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The kernel machinery (`sidra-compilation`, Layer 1) that reads Layer-6 Mission outcome records and writes
Layer-3 candidate procedures. It observes repeated procedures across concluded Missions by a normalized,
model-free signature (ADR-0075); when one procedure recurs across five **distinct** Missions it compiles a
candidate Workflow — a `proposed` `playbooks` row whose `derived_from` cites the exact Missions it derives from
(ADR-0074) — and then stops. A candidate is a proposal, never an activation. It does **not** run anything: an
activated candidate is instantiated by the existing M7 Workflow engine, and activation is a Principal Decision.
M28 reuses the `playbooks` model already in the store; it introduces no new promotion mechanism and no new
execution path.

**Exit criterion:** a procedure repeated five times is proposed as a Workflow; the proposal cites the Missions
it derives from — proven by test, not by configuration. The candidate is never auto-activated; activation is a
Principal Decision.

## Contents

| File | What it is |
|---|---|
| `00-M27-AUDIT.md` | STEP 1 gate: confirms M27 (Charter Evolution) is architecturally complete before M28; records the M26 hard-dependency constraint; non-blocking notes |
| `PROCEDURAL_COMPILATION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0074-procedure-repeated-five-times-is-a-cited-candidate-workflow.md` | Five recurrences → a cited `proposed` candidate; activation is a Principal Decision; no self-widening |
| `adr/0075-procedure-signature-is-a-normalized-order-preserving-digest.md` | "The same procedure" is byte-equality of a normalized, order-preserving, model-free signature |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Cited candidate (0074):** a procedure recurring across five distinct Missions is compiled into a
   `WorkflowCandidate` in status `proposed`; `derived_from` naming the ≥5 Missions is a construction invariant;
   activation is a Principal Decision; a candidate can never widen capability beyond its source procedures held.
2. **Normalized signature (0075):** "the same procedure" is byte-equality of a canonical, order-preserving
   digest over the sequence of Work Order *types* (`task_kind × role_archetype × effect_class × contract_shape`),
   with ids, parameters, content, costs, and timestamps abstracted away — deterministic, model-free, replayable.

## Reading order

1. `00-M27-AUDIT.md` — why it was safe to start M28
2. `PROCEDURAL_COMPILATION_ARCHITECTURE.md` — §1–§5 for the stance, model, and state machine, then the ADRs
3. The two ADRs — the load-bearing decisions (0074 what a candidate is; 0075 what "the same procedure" means)
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations occupy the band `0064`–`0066` (`0064_procedure_observations.sql`, `0065_workflow_candidates.sql`,
  `0066_candidate_activations.sql`); prior milestones' migrations end at `0063` (architecture §11.1). Forward-only,
  additive: a Firm with zero observations behaves exactly as pre-M28.
- Reuse the `playbooks` table (`/docs/04-database-design.md` §6) for the candidate itself — `status='proposed'`,
  `derived_from=[engagement ids]` (the citation), `steps`; leave `uses`/`success_rate` for post-activation runs.
  M28 adds no parallel procedure store.
- The subsystem is **propose-never-enact**: it observes, counts, and compiles a proposal; it never activates.
  The only transition into `Activated` carries a Principal `DecisionId` (Principle 14, `/MASTER_IMPLEMENTATION_GUIDE.md`
  §12). Everything is **local-only** (ADR-0009): no signature, citation, or candidate ever leaves the machine.
- Dependency direction is CI-enforced: `sidra-compilation` must not import `sidra-orchestrator` or
  `sidra-mission` (AC11). It depends on `services/store`, `services/security`, and `services/calibration` (M26).
- On completion, update `MILESTONE_REGISTRY.md` M28 status `Defined → Documented`; the number is permanent from
  that point (registry rule 4).

**STOP — do not begin M29 until M28 is implemented, integrated, and the exit criterion is demonstrated.** Per
the workflow, do not continue to M29 (Firm Self-Review) until AntiGravity completes M28 implementation and its
exit-criterion test — five distinct Missions with an equal signature produce one `Proposed` candidate whose
`derived_from` names exactly those five, and four produce none — is green.
