# M12 — Structure · Architecture

**Release 2.0 "Concourse"**

| | |
|---|---|
| Milestone | M12 — Structure |
| Authoritative sources | `docs-v2/01-org-chart-v2.md`, `docs-v2/03-executive-cabinet.md`, `docs-v2/01-migration-strategy.md` §4 steps 5–6, ADR-0012, ADR-0015, ADR-0018 |
| Exit criterion | Eight Divisions and four Offices exist; the Rail shows Divisions; vetoes work firm-wide |
| Principal-visible | **Yes** — the first v2 interface change (Rail) and behaviour change (firm-wide vetoes) |

> Compiles decided architecture into an implementable spec. Re-decides nothing. The org chart, the Offices,
> and the veto scopes are fixed in `01-org-chart-v2.md` and ADR-0012/0015; this document specifies how to
> build them, not what they are.

## 1. Overview

M11 gave the Firm an org graph with one node. M12 populates it: eight Divisions grouping the departments, and
four cross-cutting Offices that sit outside every delivery line. Kai's routing gains a Division hop (often
skipped by the fast lane), Offices gain firm-wide vetoes, and the Rail changes from rooms to Divisions. This
is the migration's step 5–6 — the only two Principal-visible steps in all of v2 — and both are announced and
reversible.

## 2. Architecture — Divisions and Offices

**Divisions** (ADR-0012): eight groupings under one executive each; they route, arbitrate, and hold budget,
and perform **no delivery work** (ADR-0004's five-tool rule extends to every Division executive). Per
`01-org-chart-v2.md`: Engineering (Rune), Platform (Atlas), Intelligence (Orin), Security (Corvus), Product
(Iris), Game Studio (Lyra), Commercial (Sable), Corporate (Quill).

**Offices** (ADR-0015): four cross-cutting authorities belonging to no Division, holding scoped vetoes, doing
no delivery work:

| Office | Head | Veto scope | Must review |
|---|---|---|---|
| Quality | Argus | Any Deliverable failing acceptance criteria or Standards | Every Deliverable above the department threshold |
| Cost | Cass | Spend over an approved ceiling; Engagement over its Mandate | Any Work Order > $5; any ceiling change |
| Architecture | Rune | Change to a contract/interface/registered stance | Cross-department contract changes; new `provides.contracts` |
| Security | Corvus | Any class-3 effect; any egress change; any capability widening | Every class-2+ effect; every Integration grant; every Pack install |

**The dual-hat resolution** (`01-org-chart-v2.md` §3): Rune (Engineering + Architecture Office) and Corvus
(Security + Security Office) hold two hats legitimately only because a Division executive does no delivery
work. When the artifact under Office review originates inside that executive's own Division, an **Office
reviewer instance** conducts the review, not the executive — the orchestrator enforces
`reviewer_division != author_division`, extending ADR-0008's `reviewer != author`.

## 3. Domain model (additive to M11's org graph)

```
Division { id, name, executive_agent_id, department_ids, budget_share }
Office   { id, name, head_agent_id, veto_scope, must_review_rule }
OfficeReviewerInstance { id: agent.office.<office>.reviewer.NN, office_id }
Veto     { office_id, target_ref, scope, verdict, dissent? }         // emits office.vetoed
Manifest generator output: the v1→v2 org expressed as a Decision
```

`OrgGraph` (from M11) gains Division and Office node kinds and `contains`/`reviews` edges. Agent records gain
`division_id` where applicable (nullable — already added in M11's migration 0017).

## 4. Services / crates

No new crate. Extensions:
- `sidra-departments` — Division/Office nodes in the org graph; Office reviewer instantiation.
- `sidra-orchestrator` — the Division routing hop; the `reviewer_division != author_division` rule; veto
  application; the manifest generator (presented as a Decision).
- `sidra-models` — the per-department budget sub-ceiling surfaced/enforced at the Division level.
- shell (`apps/desktop`) — Rail, keymap, palette, `DivisionBoard`, `DepartmentCard`.

## 5. Packages

`packages/domain` gains `Division`, `Office`, `Veto`, `OfficeReviewerInstance`. `packages/ui` / `packages/design`
gain the two new components within the Night Atrium token contract.

## 6. Events

`office.vetoed` begins firing at M12 (defined in M11's schema). Manifest application is recorded as a
Decision (existing decision engine, v1). No new event *kind* beyond `office.vetoed`.

## 7. Database

No new table. The Division/Office data lives in the org graph (`departments`/manifest data) and the additive
nullable columns from M11's migration 0017 (`engagements.division_id`, agent division assignment via
manifest). **No M12 migration is required** — the schema for structure shipped at M11.

## 8. Migrations

**None.** (All structure columns were added, nullable, in M11's `0017_additive_columns.sql`.) If
implementation finds a genuinely missing column, it is added as `0019_*` forward-only — but the design intent
is zero new migrations at M12.

## 9. ADRs

**No new ADR.** Governed by ADR-0012, ADR-0015, ADR-0018, ADR-0004. See `adr/ADR-REQUIREMENTS.md`.

## 10. Routing and the fast lane

Kai routes to a Division, which selects departments (`01-enterprise-architecture.md` §4). The **fast lane**
(`03-executive-cabinet.md`, Kai): a Directive resolving to one department, one Turn, class ≤1 skips the
Division hop entirely — and the target *rises* to **65%** because more structure means more work must bypass
it. Routing is deterministic where possible (a Directive naming a known department/path/project routes by
table, no model call); only ambiguous Directives cost a `fast`-class classification.

## 11–13. Epics / Tasks / Subtasks — see `IMPLEMENTATION_PLAN.md` (E1–E6).

## 14. Acceptance criteria

| # | AC | Verification |
|---|---|---|
| AC1 | Eight Divisions exist in the org graph, each with its executive and department set per `01-org-chart-v2.md` | org-graph test |
| AC2 | Four Offices exist, each with its veto scope and must-review rule | org-graph test |
| AC3 | The Rail shows Divisions (⌘1–⌘9 rebind); a department room is reached *inside* its Division, not from the Rail | UI test + snapshot |
| AC4 | An Office veto blocks firm-wide; the vetoed department may file a dissent recorded in the Brief; the work does not proceed | veto integration test |
| AC5 | For an Office review of an artifact from the reviewer's own Division, an Office reviewer instance conducts it (`reviewer_division != author_division`) | orchestrator assertion test (I-16) |
| AC6 | Kai routes to Divisions; the fast lane bypasses the Division hop; fast-lane share is measured against the 65% target | routing metric test |
| AC7 | The v1→v2 manifest generator produces the §3 minimal manifest and presents it as a Decision (not a silent migration) | generator test + Decision record |
| AC8 | Per-department budget sub-ceiling is enforced and surfaced; a Division's allocation splits across its departments | budget test |
| AC9 | Office conflict precedence resolves Security > Quality > Architecture > Cost when Kai cannot; deadlock after two rounds becomes an Approval Request | conflict test |
| AC10 | The replay suite stays green: the structure change did not alter any non-structural behaviour | replay green |

## 15. Review checklist — see `REVIEW_CHECKLIST.md`.

## 16. Exit criteria

Eight Divisions + four Offices in the graph (AC1–AC2), Rail shows Divisions (AC3), vetoes firm-wide (AC4–AC5),
replay still green (AC10). The migration's step-5/6 announcements (Rail change; widened veto scope) must be in
the Brief on first occurrence (`01-migration-strategy.md` §7).

## 17. Testing strategy

New invariant I-16 (`reviewer_division != author_division`) as an orchestrator assertion test. Fast-lane
share metric test against 65%. Veto integration tests (block + dissent). Manifest-generator determinism test.
Replay suite continues on every commit (must stay byte-identical for non-structural Engagements).

## 18. CI changes

Add: I-16 assertion, fast-lane-share metric, veto integration, manifest-generator tests. Replay job continues
blocking.

## 19. Workspace changes

None (no new crate). Shell build gains the two components.

## 20. Repository structure

```
agents/
├── firm.toml                 now declares 8 divisions + 4 offices
├── offices/                  NEW — Quality, Cost, Architecture, Security charters
└── charters/                 + Corvus (agent.ciso), Lyra (agent.studio)
apps/desktop/                 Rail(Divisions), keymap rebind, DivisionBoard, DepartmentCard
services/orchestrator/        division routing, office review rule, veto, manifest generator
```

## 21. Risks

| # | Risk | Mitigation |
|---|---|---|
| SR-1 | Rail change annoys the Principal | announced in the Brief with a one-line explanation + link; reversible (previous manifest is a record) |
| SR-2 | Firm-wide vetoes feel like a regression ("stricter") | the Brief explains widened scope on first occurrence (`01-migration-strategy.md` §7) |
| SR-3 | Dual-hat reviewer conflict slips (Rune reviews own Division) | I-16 assertion is blocking; Office reviewer instance is mandatory |
| SR-4 | Fast-lane share drops below 65% (too much routing) | metric test surfaces it; deterministic routing table keeps model calls off the common path |

## 22. Implementation notes

M12 is where the Principal first sees v2. Treat the two visible steps as Decisions, not updates: the manifest
generator (E5) produces a proposal the Principal accepts, and the widened veto scope (E3) is announced. Ship
behind the same reversibility guarantee as M11 (re-apply the previous manifest to roll back). Keep the replay
suite green throughout — a structural change that alters a non-structural Brief is a defect the equivalence
test will name.
