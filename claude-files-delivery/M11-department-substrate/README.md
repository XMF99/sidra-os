# M11 — Department Substrate · Delivery Package

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
