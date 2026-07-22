# M13 — Departments · Implementation Plan

**For AntiGravity.** Epics E1–E7. Conventions §0.4. Every task: Purpose · Files · APIs · Events · DB · Tests ·
AC · Review · Deps · Completion. Build order: E1 → E2 → E3 (author the 3 exit-criterion Packs first) → E4 →
E5 → E6 → E7.

---

## E1 — Pack format freeze, install pipeline & resolver

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T1.1** Freeze the `Pack` type + `department.toml` schema (all twelve directories) | M | M11 | `packages/domain/src/pack.rs` | Schema is versioned + frozen; a change is a compatibility event | schema snapshot committed |
| **T1.2** Three-act install: Acquire (verify signature) → Install (twelve checks, contracts resolve, caps requested) → Grant (plain-language, individual) | L | T1.1 | `services/departments/src/install.rs` | Each act logged + independently refusable; nothing runs before Grant | AC1 |
| **T1.3** Reuse the v1 plugin trust chain for Pack signing/verification; dev-mode expiry 7 days | M | T1.2, `sidra-plugins` | departments/infra | Unsigned refused unless dev mode; tampered Pack fails | AC1 |
| **T1.4** **Agent→department resolver** — stable API `resolve_department(agent_id) -> DepartmentId` | M | T1.2 | `services/departments/src/resolve.rs` | Every agent resolves to exactly one department; API stable for M16 | AC8 |
| **T1.5** Department lifecycle state machine (Proposed→…→Retired); retirement preserves namespace read-only | M | T1.2 | departments/lifecycle.rs | Illegal transitions rejected; retire never deletes | lifecycle test |
| **T1.6** Forbidden-scope enforcement at grant (ADR-0013 self-denial) | S | T1.2 | departments | A `forbidden` scope cannot be granted, ever | AC10 |

---

## E2 — Standards inheritance & Registry API

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T2.1** Standards inheritance resolution firm > application > department | M | E1, M11/E3 | `services/registry/src/inherit.rs` | Precedence correct; a department may tighten, never relax | AC5 |
| **T2.2** Conflict surfacing **at install**, not runtime | M | T2.1 | registry/install-hook | A conflicting standard blocks install with the conflict named | AC5 |
| **T2.3** Registry query API (append-only reads/writes; owner per fact) | M | E1 | `services/registry/src/query.rs` | Append-only enforced; query by namespace/key | AC6 |
| **T2.4** Canon promotion: registry fact → Canon candidate → Kai proposes → Principal confirms | M | T2.3 | registry/canon.rs | Never automatic; cross-Application reference required | AC6 |

---

## E3 — Author the seven CORE Packs

**Purpose.** Author each Pack verbatim to `04-department-catalog.md`. Author the three exit-criterion Packs
(Backend, Cybersecurity, UI/UX) first.

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T3.1** `dept.backend` Pack (5 archetypes, 5 playbooks, 5 standards, 3 registries, provides/requires, ceiling 2) | M | E1 | `agents/departments/backend/` | Passes twelve checks; matches catalogue §2 | AC2, AC3 |
| **T3.2** `dept.cybersecurity` Pack (6 archetypes, 6 playbooks, 5 standards, 4 registries, provides `security-review`, ceiling 2+veto) | M | E1 | `agents/departments/cybersecurity/` | Passes; matches §11; `requires` empty (deliberate) | AC2, AC3 |
| **T3.3** `dept.ui-ux` Pack (Mira head, 5 archetypes, standards incl. night-atrium-token-contract, ceiling 1) | M | E1 | `agents/departments/ui-ux/` | Passes; matches §13 | AC2, AC3 |
| **T3.4** `dept.software-engineering` Pack (Vega head) | M | E1 | `agents/departments/software-engineering/` | Passes; matches §1 | AC2 |
| **T3.5** `dept.frontend` Pack | M | E1 | `agents/departments/frontend/` | Passes; matches §3 | AC2 |
| **T3.6** `dept.ai-engineering` Pack (Orin's dept; eval-before-charter-change standard) | M | E1 | `agents/departments/ai-engineering/` | Passes; matches §8 | AC2 |
| **T3.7** `dept.product-design` Pack (Iris's dept, ceiling 1) | M | E1 | `agents/departments/product-design/` | Passes; matches §12 | AC2 |

**Subtasks per Pack:** manifest · roles/*.toml (each ten-section spec) · playbooks/*.yaml (each a valid DAG) ·
standards/*.md (path globs resolve) · registries/*.yaml (owner + append-only) · dashboards/*.toml (fixed
panels, tokens) · evals/ (non-empty) · signature.

---

## E4 — The Exchange under real load

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T4.1** End-to-end `department.request`: Backend → `capability.security-review` → Cybersecurity | L | E3/T3.1,T3.2, M11/E5 | `services/orchestrator/src/exchange/` | Request routes by contract, resolves to Cybersecurity, returns a finding | AC4 |
| **T4.2** Cost attribution charged to Backend's budget | S | T4.1 | orchestrator | Cost follows requester | AC4 |
| **T4.3** Read-scope grant for named inputs, expiring on close | S | T4.1 | orchestrator/security | Scope expires on request close | scope test |
| **T4.4** `contract_unavailable` clean failure surfaced to Kai (no silent fallback) | S | T4.1 | orchestrator | Missing provider → clean fail | resolution test |

---

## E5 — Applications (Layer 5)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T5.1** `Application` record: id, owning departments, stage, standards profile, registries, budget | M | E1 | `services/departments/src/application.rs` | Record holds scope, never logic | AC7 |
| **T5.2** Application as the join key: departments retrieve consolidated context by Application | M | T5.1, `sidra-memory` | departments/memory | Backend + Frontend share Application context | join test |
| **T5.3** Application-scoped standards profile feeds T2.1 inheritance | S | T5.1, E2 | registry | App standards sit between firm and department | inheritance test |

---

## E6 — Department rooms (shell)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T6.1** Department room (Sidebar/Stage/Inspector) reached inside its Division | M | M12/E6 | `apps/desktop/src` | Room renders; not on the Rail | AC11 |
| **T6.2** The fixed panel set (`03-department-architecture.md` §6): QueueDepth, ActiveEngagements, DeliverableFeed, KPIStrip, CostMeter, StandardsCompliance, RegistryHealth, StageProgress, GuardViolations, RosterStrip | L | T6.1 | shell/ui | Only fixed panels; Night Atrium tokens only; a non-conforming panel fails install validation | panel test |
| **T6.3** A room appears only on explicit install (nothing uninvited) | S | T6.1 | shell/departments | No room without a Grant | AC11 |

---

## E7 — Install/uninstall isolation proof

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T7.1** Full install→operate→uninstall cycle; Firm functional after; artifacts + memory readable (I-17) | L | E3, E4 | `infrastructure/testing/` | Uninstall leaves the Firm working; namespace read-only | AC9 |
| **T7.2** Isolation chaos across three real departments | M | E3 | testing/chaos | Kill one department mid-request; neighbours unaffected; request resumes | isolation-chaos green |
| **T7.3** Wire pack-validation (7 Packs) + Exchange-e2e + I-17 into CI as blocking; replay continues | S | all | `infrastructure/ci/` | All blocking | CI green |

---

## Deliverables summary

| Epic | Deliverable |
|---|---|
| E1 | Pack freeze + three-act install + agent→department resolver (for M16) |
| E2 | standards inheritance + registry API + Canon promotion |
| E3 | seven CORE Packs authored |
| E4 | Exchange end-to-end (exit criterion) |
| E5 | Application records (Layer 5) |
| E6 | department rooms + fixed panels |
| E7 | install/uninstall isolation proof (I-17) |

**Exit:** three departments installed (AC3) + one Exchange request end to end (AC4).
