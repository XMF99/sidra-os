# M12 — Structure · Implementation Plan

**For AntiGravity.** Epics E1–E6. Conventions §0.4. Every task: Purpose · Files · APIs · Events · DB · Tests ·
AC · Review · Deps · Completion. Build order: E1 → E2 → E3 → E4 → E5 → E6.

---

## E1 — Division & Office domain + org graph

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T1.1** `Division`, `Office`, `Veto`, `OfficeReviewerInstance` value objects | M | M11 | `packages/domain/src/structure.rs` | Construction invariants (a Division has an executive; an Office has a head + veto scope) | property tests |
| **T1.2** Org-graph extension: Division/Office node kinds, `contains`/`reviews` edges | M | T1.1 | `services/departments/src/graph.rs` | Eight Divisions + four Offices representable and cycle-free | AC1, AC2 |
| **T1.3** `firm.toml` declares 8 Divisions + 4 Offices; loader validates against `01-org-chart-v2.md` | M | T1.2 | `agents/firm.toml`, `services/departments/src/firm.rs` | Loaded graph matches the org chart exactly | AC1, AC2 |
| **T1.4** Office and new-executive charters (Corvus, Lyra, four Office heads) | S | T1.3 | `agents/offices/`, `agents/charters/` | Charters present; IDs stable | charter load test |

---

## E2 — Division routing & fast lane

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T2.1** Kai routing extended to Divisions (deterministic table where possible) | M | E1 | `services/orchestrator/src/route.rs` | A Directive routes to a Division; known department/path routes by table | routing test |
| **T2.2** Fast-lane bypass: one department, one Turn, class ≤1 skips the Division hop | M | T2.1 | orchestrator | Fast-lane path skips Division | AC6 |
| **T2.3** Fast-lane share metric measured against the 65% target | S | T2.2 | orchestrator/metrics | Metric emitted; test asserts target tracked | AC6 |

---

## E3 — Offices & firm-wide vetoes

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T3.1** Veto application: an Office veto blocks firm-wide; work does not proceed | M | E1 | `services/orchestrator/src/veto.rs` | A veto blocks; `office.vetoed` emitted | AC4 |
| **T3.2** Dissent path: the vetoed department files a dissent recorded in the Brief | S | T3.1 | orchestrator/decision | Dissent surfaced to Principal; work still blocked | AC4 |
| **T3.3** Office reviewer instances; `reviewer_division != author_division` (I-16) | M | E1 | orchestrator | Own-Division artifact reviewed by an Office reviewer instance, not the executive | AC5 |
| **T3.4** Must-review rules per Office (thresholds from `01-org-chart-v2.md` §3) | M | T3.1 | orchestrator | Each Office reviews exactly what its rule specifies | must-review test |
| **T3.5** Conflict precedence Security>Quality>Architecture>Cost; 2-round deadlock → Approval Request | M | T3.1 | orchestrator | Precedence applied; deadlock escalates | AC9 |

---

## E4 — Budget sub-ceiling surfaced

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T4.1** Division allocation splits across departments per manifest `budget.share` | M | E1, M11/T2.7 | `services/models/src/budget.rs` | Shares sum ≤1.0 per Division; enforced | AC8 |
| **T4.2** Surface the sub-ceiling in the gateway + CostMeter data | S | T4.1 | models/shell | Sub-ceiling visible; overrun pauses department | AC8 |

---

## E5 — v1→v2 manifest generator

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T5.1** Generate the minimal v2 manifest (`01-migration-strategy.md` §3): 4 Divisions, 3 departments, 2 Offices from the v1 Firm | M | E1 | `services/departments/src/generator.rs` | Output matches §3 exactly; every v1 agent keeps ID/memory/history | AC7 |
| **T5.2** Present as a Decision (criteria, reversibility class, review date); apply on acceptance | M | T5.1, decision engine | orchestrator | Not a silent migration; the previous manifest remains a record | AC7 |
| **T5.3** Rollback: re-apply the previous manifest as a normal operation | S | T5.2 | departments | Rollback restores prior structure with no data op | rollback test |

---

## E6 — Shell (Rail, keymap, palette, components)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T6.1** Rail shows Divisions; ⌘1–⌘9 rebind | M | E1 | `apps/desktop/src` | Rail renders Divisions; keymap rebound | AC3 |
| **T6.2** `DivisionBoard` component (Night Atrium tokens only) | M | T6.1 | shell/ui | Renders a Division's departments; token-contract clean | AC3 |
| **T6.3** `DepartmentCard` component; department room reached inside its Division | M | T6.2 | shell/ui | Department room not on the Rail; reached via Division | AC3 |
| **T6.4** Palette scope updates (⌘K searches Divisions/departments) | S | T6.1 | shell | Palette scoped correctly | palette test |
| **T6.5** Brief announces the Rail change + widened veto scope on first occurrence | S | E3, T6.1 | orchestrator/shell | Announcement present (`01-migration-strategy.md` §7) | announcement test |

---

## Deliverables summary

| Epic | Deliverable |
|---|---|
| E1 | Division/Office domain + org graph populated |
| E2 | Division routing + fast lane (65% target) |
| E3 | Offices + firm-wide vetoes + I-16 |
| E4 | budget sub-ceiling surfaced |
| E5 | v1→v2 manifest generator (as a Decision) |
| E6 | Rail/keymap/palette + DivisionBoard/DepartmentCard |

**Exit:** AC1–AC9 green, AC10 replay green. Rail shows Divisions; vetoes firm-wide.
