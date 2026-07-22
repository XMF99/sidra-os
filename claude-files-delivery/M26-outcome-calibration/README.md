# M26 — Outcome Calibration · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M26 (Outcome Calibration), release 4.0
"Continuum". Architecture and specification only — **no production code**, per the workflow.

**M26 opens release 4.0 "Continuum."** It is the first milestone of the release in which the Firm improves
itself, under one rule: *nothing self-promotes; the Firm proposes, the Principal confirms.*

## What this milestone delivers

The Layer-3 measurement substrate (`sidra-calibration`): the deterministic, local machinery that **reads** the
outcome records concluded Missions already produce (plan versus reality — `MISSION_ENGINE_ARCHITECTURE.md`
§23.3), **computes** a bounded numeric correction to estimates, novelty scores, and risk weights, **applies** it
only if it demonstrably narrows error on held-out Missions, **records** exactly which outcomes drove exactly
which adjustment, and **keeps** the prior parameters so any calibration can be undone to the byte — and never
lets a single number, sample, or record leave the machine.

Calibration is deterministic Layer-3 infrastructure, not an agent: no charter, no model, no inference — a single
pass of arithmetic over rows already in the local database, producing a versioned row of numbers the Mission
Engine reads at plan time (the §23.2 seam, now real). It changes **numbers, not structure**: the narrowest 4.0
capability, deliberately, so the milestones that follow — which change charters and structure and therefore
require a Principal Decision (M27 charter evolution, M28 procedural compilation, M29 self-review) — inherit a
substrate whose every adjustment is already traceable and already undoable.

**Exit criterion:** estimate error narrows measurably over 50 concluded Missions — a defined metric
(`EE` = median absolute relative error, per-estimand floors, walk-forward: `EE(last W) ≤ (1−δ)·EE(first W)`) —
and the calibration is **inspectable** (every adjustment traces to the exact outcome records that drove it) and
**revertible** (a revert restores prior parameters byte-for-byte). Proven by test, not by configuration. Local
only: nothing leaves the machine.

## Contents

| File | What it is |
|---|---|
| `00-M25-AUDIT.md` | STEP 1 gate: confirms M25 is architecturally complete and M26's sole hard dependency (M15) is present before M26 |
| `OUTCOME_CALIBRATION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0069-calibration-is-a-revertible-projection-never-telemetry.md` | The parameter set is a versioned, revertible projection over local records; nothing is uploaded |
| `adr/0070-calibration-adjusts-numbers-never-structure.md` | Calibration writes numbers only — never a capability, Standard, Guard, or org chart |
| `adr/0071-calibration-applied-only-if-it-narrows-error-and-is-inspectable.md` | A candidate is applied only if held-out error narrows; every adjustment traces to its samples |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The three decisions, in one line each

1. **Revertible projection, not telemetry (0069):** the calibrated parameters are a versioned projection over
   the append-only outcome records and run log; apply appends a version, revert re-activates a retained one
   exactly, and nothing is ever uploaded (ADR-0009 governs).
2. **Numbers, not structure (0070):** calibration adjusts estimate corrections, a novelty mapping, and risk
   weights — and the schema has no field, and the crate no write path, for any capability, Standard, Guard, or
   department. Structural change is a Principal Decision (M27/M29).
3. **Applied only if it narrows; inspectable (0071):** the estimate-error metric is the median absolute relative
   error, computed walk-forward; a candidate that does not narrow held-out error is rejected, not activated; and
   every applied number names the exact samples that produced it.

## Reading order

1. `00-M25-AUDIT.md` — why it was safe to start M26
2. `OUTCOME_CALIBRATION_ARCHITECTURE.md` — §1 (the stance) and §3 (what calibration calibrates and the
   boundary) first, then §4 (the metric), §7–§8 (computation, versioning/revert), §13 (security), then the ADRs
3. The three ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the three ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on Principal
  approval. Confirm `0069`–`0071` are free after M17–M24 land; renumber only on a real collision (numbering is
  permanent once documented — registry rule 4). See `00-M25-AUDIT.md` §3.
- Migrations are additive and forward-only, band **`0057`–`0060`** (mission migrations end at `0024`; M16–M25
  consume through `0056`): `0057_calibration_parameters` (seeds version 0, the identity),
  `0058_estimate_error_samples`, `0059_calibration_runs` (+ `calibration_adjustments`),
  `0060_calibration_weights`. Confirm the band is free at integration; none holds a secret or a capability.
- **Local-only / no telemetry (ADR-0009).** `sidra-calibration` reads local, writes local, uploads nothing —
  enforced two ways: no HTTP/socket crate anywhere in the transitive dependency closure (compile-time CI check)
  and a runtime socket guard that aborts any calibration run which opens a socket. Outcome records, error
  samples, and parameters are excluded from any automatic export.
- Dependency direction is CI-enforced: `sidra-calibration` must not import `sidra-orchestrator`,
  `sidra-connectors`, or `sidra-mission` (runtime), and must depend on no network crate. The parameter store is
  the only seam to planning — the Mission Engine reads `active_parameters()`; there is no crate cycle.
- On completion, update `MILESTONE_REGISTRY.md` M26 status `Defined → Documented`; the number is permanent from
  that point (registry rule 4).

**Then STOP — do not begin M27 until M26 is implemented, integrated, and the exit criterion is demonstrated**
(estimate error narrows measurably over 50 concluded Missions; inspectable and revertible — AC1 + AC3 + AC4,
task T7.10, the last thing green).
