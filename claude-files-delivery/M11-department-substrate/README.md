# M11 — Department Substrate · Delivery Package

<<<<<<< HEAD
**Release 2.0 "Concourse" · the milestone that gates all of v2 · for AntiGravity**

Architecture and specification only — no production code. M11 installs the four new kernel services **with no
Principal-visible change**: the Firm runs as one implicit department containing the v1 agents, behaving
byte-for-byte as it did at 1.0.

## Exit criterion (authoritative, `docs-v2/02-implementation-changes.md` §M11)

> The Firm runs as one implicit department containing the v1 agents, with **byte-identical behaviour**. The
> replay acceptance test from `docs-v2/01-migration-strategy.md` §6 runs **green in CI**. Nothing is visible
> to the Principal at the end of M11 — that is the exit criterion, not a shortcoming.

## What this milestone delivers

Four kernel services, all additive:
- `sidra-departments` — manifest parsing, the twelve validation checks, the org graph, archetype resolution,
  instance lifecycle, autoscale.
- `sidra-registry` — Standards resolution by path/type, registry storage and query, violation recording.
- Guard Runner in `sidra-security` — lifecycle points, declarative guard evaluation, Wasm validator interface.
- Exchange in `sidra-orchestrator` — `department.request` routing, contract resolution, cost attribution,
  depth/cycle enforcement.

Plus the schema additions (migrations `0012`–`0018`), the four new event kinds, and the **replay equivalence
suite** that proves nothing changed.

## Contents

| File | What |
|---|---|
| `ARCHITECTURE.md` | The substrate architecture, 22-point structure, compiled from the v2 sources |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E7, tasks, subtasks, AC, completion definitions |
| `REVIEW_CHECKLIST.md` | The gate |
| `adr/ADR-REQUIREMENTS.md` | Governing ADRs (0013, 0014, 0016, 0017) — none re-decided |

## Governing ADRs (existing)

ADR-0013 (Department Pack as unit of modularity), ADR-0014 (Role Archetypes + lazy instantiation), ADR-0016
(Standards & Guards as kernel primitives), ADR-0017 (Registries as Canon projections). M11 implements these;
it does not re-decide them.

## Why M11 gates everything

`docs-v2/02-implementation-changes.md` §2: *"M11 gates everything. Building M12's visible structure before
M11's invisible substrate would mean shipping an interface change before the equivalence test exists to prove
it changed nothing else."* M16's connector isolation, M13's departments, M15's mission planning — all assume
this substrate.

**STOP after M14.**
=======
**For AntiGravity.** The complete architecture package for milestone M11 (Department substrate), the first
milestone of release 2.0 "Concourse". Architecture and specification only — **no production code**, per the
workflow.

## What this milestone delivers

The Layer-1 boundary primitive: the kernel machinery (`sidra-departments`) that makes "a department is a
boundary, not a label" mechanical — the **five faces** of the boundary (memory namespace, capability ceiling,
budget sub-ceiling, filesystem scope, and Exchange-only communication), plus the **implicit default
department** in which the entire running v1 Firm executes with byte-identical behaviour. It ships **no visible
structure**: the Rail does not change, no ⌘-binding rebinds, the Brief gains no field. Divisions (M12),
installable Department Packs and the Exchange carrying real traffic (M13), and the Game Studio/Marketplace
(M14) are all built on top of this substrate — and M11 gates them absolutely (`/MASTER_IMPLEMENTATION_GUIDE.md`
§5 critical path).

**Exit criterion:** the **replay-equivalence test is green** — a recorded v1 Engagement produces a
byte-identical Brief after the substrate lands, with model calls stubbed. Nothing visible to the Principal
changes. That is the exit criterion, not a shortcoming (`/docs-v2/02-implementation-changes.md` §1 M11).

## Contents

| File | What it is |
|---|---|
| `00-M10-AUDIT.md` | STEP 1 gate: confirms M10 (Hardening & 1.0) is architecturally complete; notes non-blocking band/scope discrepancies |
| `DEPARTMENT_SUBSTRATE_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0040-implicit-default-department-as-migration-bridge.md` | The implicit default department: how a v1 record participates in the boundary while behaving as v1 |
| `adr/0041-replay-equivalence-as-the-substrate-exit-gate.md` | Byte-identical replay is M11's definition of done and a permanent CI gate |
| `IMPLEMENTATION_PLAN.md` | E1–E8, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Implicit default department (0040):** the substrate seeds one invisible department (`__default__`) with
   every face set to its v1-equivalent null; a v1 record with a null scoping resolves to it, nothing is
   rewritten, and behaviour is byte-identical.
2. **Replay equivalence as the exit gate (0041):** the substrate is done when a corpus of recorded v1
   Engagements replays byte-identically (Brief projection, model calls stubbed), and that gate is permanent
   across M11–M14.

Everything else M11 needs is already decided and is *consumed*, not re-opened: the Pack-as-boundary and
contracts-not-departments rules (ADR-0013), Standards/Guards as kernel primitives shipping empty at M11
(ADR-0016), the fourth budget ceiling (ADR-0020), and kernel neutrality (an existing Layer-1 invariant,
`/docs-v2/02-layer-model.md` §1).

## Reading order

1. `00-M10-AUDIT.md` — why it was safe to start M11
2. `DEPARTMENT_SUBSTRATE_ARCHITECTURE.md` — §1–§4 for the stance, the five faces, and the domain model; then
   §6 (kernel neutrality) and §9 (the replay strategy)
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- **Migrations begin at `0002_` and end at `0006_`.** `0001` is the v1 base; `0019+` are taken by M15/M16 —
  do not use them. The older `0012`–`0018` numbering in `/docs-v2/02-implementation-changes.md` §3 is a stale
  documentation discrepancy to reconcile on integration (see `00-M10-AUDIT.md` §2).
- **The kernel-neutrality CI grep is introduced by this milestone** (`/MASTER_IMPLEMENTATION_GUIDE.md` §7). It
  fails the build on any department identifier in a kernel crate, with exactly one allowlisted `__default__`
  construction site.
- **The replay-equivalence CI gate is introduced by this milestone** and runs the recorded-Engagement corpus
  on every commit to M11–M14.
- Dependency direction is enforced: `sidra-departments` must not depend on `apps/*`, and no kernel crate may
  name a department.
- Scope the empty Standards/Guard/Exchange machinery to no-op seams; their behaviour is M12–M13.

**Then STOP.** Do not begin M12 until M11 is implemented, integrated, and the replay-equivalence test is green.
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7
