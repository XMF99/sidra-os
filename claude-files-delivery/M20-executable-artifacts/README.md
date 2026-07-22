# M20 — Executable Artifacts · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M20 (Executable Artifacts), release 2.5
"Field". Architecture and specification only — **no production code**, per the workflow.

**M20 closes release 2.5 "Field."** It is the fifth and last milestone of the release.

## What this milestone delivers

The runtime for **agent-authored executable artifacts**: an agent, working inside a Work Order, authors an
artifact that is not a document but *code* — a signed Wasm component that runs in the **existing M9 sandbox**,
under a capability grant that is a **strict subset of the producing Work Order's grant**. It ships the authority-
and-provenance layer (`sidra-artifacts-exec`) over the M9 host, plus the bounding-refusal proof that is the
exit criterion.

It adds **no new sandbox** (ADR-0055 reuses M9) and **no new effect surface** (every effect passes the M3
Permission Broker). It reuses M16's custody and egress when an artifact reaches outward, and only through a
connector granted to the Work Order's department.

**Exit criterion:** an agent-authored artifact executes, is capability-bounded, and **cannot exceed the grant of
the Work Order that produced it** — proven by a denial test, not by configuration.

## Contents

| File | What it is |
|---|---|
| `00-M19-AUDIT.md` | STEP 1 gate: confirms M20's dependencies (M9, M16) are Documented; records that the intervening M17–M19 are not M20 dependencies |
| `EXECUTABLE_ARTIFACTS_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0054-executable-artifact-grant-subset-of-work-order.md` | The grant is ⊆ the producing Work Order's grant, frozen and enforced |
| `adr/0055-executable-artifacts-reuse-the-m9-wasm-host.md` | Reuse the M9 Wasm sandbox; no new runtime, no new ambient authority |
| `adr/0056-executable-artifact-provenance-is-recorded-and-is-the-grant-source.md` | Recorded provenance is the grant source and the anchor for "installation grants nothing" |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The three decisions, in one line each

1. **Bounded grant (0054):** an executable artifact's grant is `requested ∩ producing_work_order.capability_grant`,
   frozen at authoring; a requested capability the Work Order did not hold is a hard refusal — it can never
   exceed the Work Order that produced it.
2. **Reuse the M9 sandbox (0055):** the artifact runs in the existing Wasm host — same fuel/memory/epoch caps,
   same no-ambient-authority world (ADR-0006); the only new thing is where the grant comes from.
3. **Recorded provenance (0056):** the producing Work Order is recorded on the artifact, `NOT NULL`; it is the
   grant source and the anchor that keeps installation from conferring any authority.

## Reading order

1. `00-M19-AUDIT.md` — why it was safe to start M20 (its dependencies M9/M16 are Documented)
2. `EXECUTABLE_ARTIFACTS_ARCHITECTURE.md` — §1–§4 for the stance, model, and state machines, then §7 (security)
   and §9 (the run path)
3. The three ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the three ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations occupy band **`0039`–`0041`** (M16 ended at `0029`; M17–M19 reserve intervening bands).
- ADRs use **`0054`–`0056`**, continuing the programme's global ADR sequence after M16's `0034`–`0037`.
- Dependency direction is CI-enforced: `sidra-artifacts-exec` must not import `sidra-orchestrator` or
  `sidra-mission`, and its host-function set must be a subset of the M9 set.
- On completion, update `MILESTONE_REGISTRY.md` M20 status `Defined → Documented`; the number is permanent from
  that point (registry rule 4).
- Note in the registry that M20 was documented in dependency order ahead of M17–M19 (see `00-M19-AUDIT.md` §4).

**Then STOP.** **M20 closes release 2.5 "Field."** Do not begin M21 (3.0 "Chambers") until M20 is implemented,
integrated, and the capability-bounded-execution exit criterion is demonstrated.
