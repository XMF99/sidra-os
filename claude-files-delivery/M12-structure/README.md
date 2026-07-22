# M12 — Structure · Delivery Package

**Release 2.0 "Concourse" · for AntiGravity**

Architecture and specification only — no production code. M12 turns on the organisational layer that M11
installed silently: eight Divisions, four Offices, the Rail showing Divisions, and firm-wide vetoes. This is
**the first Principal-visible v2 change** (`docs-v2/01-migration-strategy.md` §4 step 5–6).

## Exit criterion (authoritative, `docs-v2/02-implementation-changes.md` §M12)

> Eight Divisions and four Offices exist; the Rail shows Divisions; vetoes work firm-wide.

## What this milestone delivers

- Division and Office concepts in the org graph.
- Kai's routing extended to Divisions; the fast-lane bypass preserved and **measured against the 65% target**.
- Office reviewer instances; the `reviewer_division != author_division` rule for Office reviews.
- Rail, keymap, and palette scope changes; `DivisionBoard` and `DepartmentCard` components.
- The v1 → v2 manifest generator, presented to the Principal **as a Decision**.
- Per-department budget sub-ceiling surfaced in the Model Gateway (wired at M11, exposed here).

## Contents

| File | What |
|---|---|
| `ARCHITECTURE.md` | Structure architecture, 22-point, from `01-org-chart-v2.md` + `03-executive-cabinet.md` |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E6, tasks, subtasks, AC, completion |
| `REVIEW_CHECKLIST.md` | The gate |
| `adr/ADR-REQUIREMENTS.md` | Governing ADRs (0012, 0015, 0018) — none re-decided |

## Governing ADRs (existing)

ADR-0012 (Divisions between Executive and Departments), ADR-0015 (Offices hold vetoes; Departments hold
delivery), ADR-0018 (Review Intensity), ADR-0004 (five-tool executive, unchanged).

## Dependency

M12 requires M11 green (the org graph, budget sub-ceiling, replay suite). It must not ship before M11's
equivalence test exists — that ordering is the whole point (`02-implementation-changes.md` §2).

**STOP after M14.**
