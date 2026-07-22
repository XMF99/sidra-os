# M14 — Game Studio and Marketplace · Delivery Package

**Release 2.0 "Concourse" (closes 2.0) · for AntiGravity**

Architecture and specification only — no production code. M14 proves the Department Pack contract holds for
the hardest possible department (the Game Studio: 49 archetypes, 73 playbooks, 12 guards, 7 stages, 3 target
engines) and ships the Marketplace mechanism with an empty catalogue and a working local publisher.

## Exit criterion (authoritative, `docs-v2/02-implementation-changes.md` §M14)

> The acceptance list in `docs-v2/03-integration-plan.md` §9 (the nine-item list, including
> **uninstall-leaves-Firm-working**).

## What this milestone delivers

- The CCGS compiler in `infrastructure/scripts/` (maintained, not one-shot) — ADR-0019 "compile, do not embed".
- Phases P0–P8 of the integration plan: 49 agents → archetypes, 73 skills → playbooks, 11 rules → standards,
  12 hooks → guards (three tiers), 2 registries, 38 templates, 7 stages.
- Marketplace surface: empty public catalogue, trust tiers, the three-act install.
- Review Intensity as a firm-wide setting (ADR-0018).

## Contents

| File | What |
|---|---|
| `ARCHITECTURE.md` | Game Studio + Marketplace architecture, 22-point, from `02-game-studio-department.md` + `03-integration-plan.md` + `05-marketplace-and-packs.md` |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E7, tasks, subtasks, AC, completion |
| `REVIEW_CHECKLIST.md` | The gate |
| `adr/ADR-REQUIREMENTS.md` | Governing ADRs (0019, 0016, 0017, 0018) — none re-decided |

## Governing ADRs (existing)

ADR-0019 (compile CCGS, do not embed), ADR-0016 (Standards & Guards; the hooks→guards trade is an accepted
consequence here), ADR-0017 (Registries adopted with semantics intact), ADR-0018 (Review Intensity).

## Dependency

M14 requires M13 (Pack format frozen, install pipeline, Exchange) and M11–M12. It is the last milestone of
2.0 "Concourse".

**STOP after this package. Do not prepare M15, M16, or M17.**
