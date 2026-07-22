# M13 — Departments · Delivery Package

**Release 2.0 "Concourse" · the milestone M16 depends on · for AntiGravity**

Architecture and specification only — no production code. M13 makes departments real: the Pack format is
frozen, the seven CORE departments are authored as Packs, department rooms exist, Standards inherit, the
Registry query API and Canon promotion path work, and Applications (Layer 5) become a first-class record.
The Exchange carries real cross-department traffic for the first time.

## Exit criterion (authoritative, `docs-v2/02-implementation-changes.md` §M13)

> **Three departments installed from Packs, one Exchange request completing end to end.**

## What this milestone delivers

- Pack format frozen; local publisher; signing/verification reusing the v1 plugin trust chain.
- The seven CORE departments authored as Packs (`04-department-catalog.md`): Software Engineering, Backend,
  Frontend, AI Engineering, Cybersecurity, Product Design, UI/UX.
- Department rooms and the fixed panel set.
- Standards inheritance (firm > application > department) with conflict surfacing at install.
- Registry query API and Canon promotion path.
- Application records (Layer 5) as a first-class object.

## Why M16 needs this

M16's connector isolation (ADR-0035, AC2) requires the **Registrar to resolve an agent → its department**.
That resolver is delivered here. The verification audit found M16's connector code accepts the department as
a caller-supplied argument precisely because M13 did not exist. M13 closes that gap.

## Contents

| File | What |
|---|---|
| `ARCHITECTURE.md` | Departments architecture, 22-point, from `03-department-architecture.md` + `04-department-catalog.md` + `05-marketplace-and-packs.md` |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E7, tasks, subtasks, AC, completion |
| `REVIEW_CHECKLIST.md` | The gate |
| `adr/ADR-REQUIREMENTS.md` | Governing ADRs (0013, 0014, 0016, 0017, 0020) — none re-decided |

## Governing ADRs (existing)

ADR-0013 (Pack), ADR-0014 (archetypes + lazy instantiation), ADR-0016 (Standards & Guards), ADR-0017
(Registries as Canon projections), ADR-0020 (fourth budget ceiling at the department).

**STOP after M14.**
