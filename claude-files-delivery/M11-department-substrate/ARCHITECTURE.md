# M11 — Department Substrate · Architecture

**Release 2.0 "Concourse"**

| | |
|---|---|
| Milestone | M11 — Department substrate |
| Authoritative sources | `docs-v2/01-enterprise-architecture.md` §3–§5, `docs-v2/02-implementation-changes.md` §1–§5, `docs-v2/01-migration-strategy.md`, `docs-v2/03-department-architecture.md`, ADR-0013/0014/0016/0017 |
| Exit criterion | One implicit department, byte-identical behaviour, replay test green in CI |
| Principal-visible change | **None** — by design |

> This document compiles decisions already made in the sources above into one implementable specification. It
> re-decides nothing. Where it appears to introduce a behaviour not in those sources, that is a defect.

## 1. Overview

M11 inserts the machinery of an organisational layer *without turning it on*. The four new kernel services
ship, the schema gains its department columns and tables, and the whole apparatus runs with exactly one
implicit department that contains all eleven v1 agents. The measure of success is a negative: the Principal
sees nothing, and a recorded v1 Engagement replays to a byte-identical Brief.

This ordering is the load-bearing idea of the entire v2 migration (`01-migration-strategy.md` §1): because
the event log is the source of truth (ADR-0002), adding a department adds event kinds and rebuilds
projections — it does not migrate state, because there is no state to migrate.

## 2. Architecture — the four new kernel services

Per `01-enterprise-architecture.md` §3. Each **extends** an existing boundary; none replaces a service.

| Service | Crate | Responsibility | Why kernel |
|---|---|---|---|
| Department Registrar | `sidra-departments` (NEW) | Loads Pack manifests, runs the twelve checks, holds the org graph, resolves archetypes, instantiates/retires agents, enforces per-department budget sub-ceiling | It decides what the Firm *is*; a plugin cannot define the boundaries it lives inside |
| Standards Engine | `sidra-registry` (NEW) | Resolves which Standards apply to an artifact path/type, supplies them to the Turn frame, records violations; stores and queries Registries | Standards constrain agents; an agent-adjacent component cannot apply them |
| Guard Runner | `sidra-security` (extension) | Executes declarative Guards at lifecycle points; blocks or warns; Wasm validator interface | Guards block effects — the Permission Broker's neighbourhood |
| Exchange | `sidra-orchestrator` (extension) | Routes `department.request`, resolves contracts, attributes cost, enforces depth ≤2 and no cycles | Isolation enforced by a participant is not isolation — same argument as the Broker |

At M11 the org graph has exactly one node: the implicit department. The Exchange has no traffic. The
Standards set is empty. The Guard set is empty. All four services are live but inert — which is precisely why
behaviour is unchanged.

## 3. Domain model

New value objects in `packages/domain` (additive; ADR-0011 direction preserved):

```
DepartmentId(String)          ArchetypeId(String)         InstanceNumber(u32)
DepartmentManifest { id, division?, version, sidra_api, capabilities{required,optional,forbidden},
                     provides.contracts, requires.contracts, memory{namespace,canon_access,retention},
                     budget{share,ceiling_hard}, roles{head,archetypes,autoscale}, review, fs{write,read}, signature }
RoleArchetype { id, role, responsibilities, model_class, capabilities⊆dept, standards, instantiation, decision_boundaries }
OrgGraph { nodes: Department|Division|Office, edges: contains|provides|requires }
Standard { id, scope_glob, department, inheritance_source, version }
RegistryEntry { namespace, key, value, owner, status, revised, referenced_by }
Guard { id, lifecycle_point, action, department }
ExchangeRequest { from_department, to_contract, resolved_to?, objective, inputs, acceptance, budget, effect_ceiling, deadline, state }
```

The implicit department has a reserved id (e.g. `dept._implicit`) whose null-equivalent semantics match
"unscoped" everywhere a nullable `department_id` column appears.

## 4. Services / crates

- `services/departments/` — NEW crate `sidra-departments`.
- `services/registry/` — NEW crate `sidra-registry`.
- `services/security/` — extended with the Guard Runner module.
- `services/orchestrator/` — extended with the Exchange module.

Dependency direction: `packages/domain ← {sidra-departments, sidra-registry} ← sidra-orchestrator ← apps/*`.
`sidra-departments` depends on `sidra-store`, `sidra-security`, `sidra-memory`. It must not depend on
`sidra-orchestrator` (the Exchange lives in orchestrator and calls into departments, not the reverse).

## 5. Packages

`packages/domain` gains the value objects in §3. No other package changes.

## 6. Events (four new kinds, per `02-implementation-changes.md` §3)

At M11, the four that the substrate itself emits: `department.installed`, `department.retired`,
`agent.instantiated`, `agent.retired`. (The remaining v2 event kinds — `standard.violated`, `guard.blocked`,
`registry.entry_added`, `registry.entry_deprecated`, `exchange.requested`, `exchange.completed`,
`office.vetoed` — are defined in the schema now but only *fire* once there is real content to fire them: M12
for `office.vetoed`, M13 for the department/exchange/registry ones under real load.) Every event carries
actor + timestamp and lands on the hash chain (ADR-0002). No event kind is removed or redefined
(compatibility contract).

New message kinds: `department.request`, `standard.violation` — twelve become fourteen (ADR-0016).

## 7. Database (all additive, all nullable, v1-equivalent defaults)

New tables (`02-implementation-changes.md` §3): `departments`, `role_archetypes`, `standards`,
`registry_entries`, `guards`, `guard_violations`, `applications`, `exchange_requests`.

Additive columns (nullable): `agents.department_id/archetype_id/archetype_version/instance_number`,
`work_orders.department_id/application_id`, `engagements.division_id/application_id`,
`deliverables.department_id`, `budgets.department_id`, `memory_chunks.namespace`. Null everywhere = the
implicit department = v1 behaviour.

## 8. Migrations

`0012_departments.sql` … `0018_applications.sql`. Forward-only, idempotent, each independently deployable,
none touching an existing column's meaning (`02-implementation-changes.md` §3). Ordering: departments →
role_archetypes → standards → registry_entries → guards → guard_violations → exchange_requests → applications
(map the seven-to-eight files as: 0012 departments+archetypes, 0013 standards, 0014 registry_entries, 0015
guards+guard_violations, 0016 exchange_requests, 0017 additive columns, 0018 applications).

## 9. ADRs

**No new ADR.** Governed by ADR-0013 (Pack), ADR-0014 (archetypes + lazy instantiation), ADR-0016 (Standards
& Guards as kernel primitives), ADR-0017 (Registries as Canon projections). See `adr/ADR-REQUIREMENTS.md`.

## 10. Isolation (the mechanisms this milestone stands up)

Per `01-enterprise-architecture.md` §5, each enforced by the named service:

| Dimension | Mechanism | Enforced by |
|---|---|---|
| Memory | namespace `dept.<id>.*`; cross-namespace read needs a granted scope | Memory service |
| Capability | department grant is the ceiling for every agent in it | Permission Broker |
| Budget | fourth nested sub-ceiling; overrun pauses the department, not the Firm | Model Gateway |
| Filesystem | writes confined to `Artifacts/<dept>/**` | Permission Broker |
| Communication | only `department.request` via the Exchange (typed, budgeted, logged) | Exchange |
| Standards | department standards apply in scope; cannot be relaxed by another | Standards Engine |
| Failure | crash/budget/guard failure → quarantine; neighbours continue | Registrar + Orchestrator |

At M11 there is one department, so these are exercised by the isolation *tests* (§17 invariants I-12…I-17),
not by real multi-department traffic — which arrives at M13.

## 11–13. Epics / Tasks / Subtasks

See `IMPLEMENTATION_PLAN.md` (E1–E7).

## 14. Acceptance criteria

| # | AC | Verification |
|---|---|---|
| AC1 | The replay equivalence suite produces byte-identical Briefs over the recorded v1 corpus | replay suite green in CI |
| AC2 | `sidra-departments` parses a manifest and runs all twelve validation checks; each failure names its rule; no override | manifest test corpus |
| AC3 | The implicit department loads at startup; every v1 agent resolves inside it with its stable ID | startup + resolution test |
| AC4 | A department's spend never exceeds its sub-ceiling; exhaustion pauses one department, Firm continues (I-14) | budget property test |
| AC5 | The Exchange refuses cycles and depth > 2 (I-15) | request-graph unit test |
| AC6 | An agent cannot write outside its department fs scope (I-12) and cannot read another namespace without a granted, scoped, expiring read (I-13) | property tests |
| AC7 | The Standards Engine resolves the empty standard set to "no constraint"; a violation, when one exists, is recorded | resolution + violation test |
| AC8 | Guard Runner evaluates a declarative guard at each lifecycle point; a Wasm validator runs under the plugin host with fuel + no ambient authority | guard corpus |
| AC9 | Migrations 0012–0018 are forward-only, idempotent, independently deployable; a null `department_id` reproduces v1 behaviour exactly | migration test + replay |
| AC10 | Nothing is Principal-visible at M11 end (Rail unchanged, no new room) | UI snapshot equality |

## 15. Review checklist — see `REVIEW_CHECKLIST.md`.

## 16. Exit criteria

AC1 (replay green) is the milestone gate, supported by AC2–AC10. If the replay Brief differs by one byte, the
substrate changed something it claimed not to — and the diff names exactly what (`01-migration-strategy.md`
§6).

## 17. Testing strategy

New invariants I-12…I-17 (`02-implementation-changes.md` §5) as property tests. New suites: **replay
equivalence** (every commit), **Pack validation** (twelve checks in CI), **Guard corpus** (each guard has a
must-block and a must-pass input), **isolation chaos** (kill a department mid-Work-Order; neighbours
unaffected; Work Order resumes).

## 18. CI changes

Add blocking jobs: replay-equivalence, pack-validation, guard-corpus, isolation-chaos, and the I-12…I-17
property suites. Extend the existing chaos suite to kill at department boundaries.

## 19. Workspace changes

Add `services/departments` and `services/registry` to `[workspace] members`. (Assumes E0 of M10 already
restored the M1–M9 members.)

## 20. Repository structure

```
services/departments/    NEW — sidra-departments (registrar, org graph, manifest, autoscale)
services/registry/       NEW — sidra-registry (standards resolution, registry store/query, violations)
services/security/       + guard runner module
services/orchestrator/   + exchange module
agents/departments/_implicit/   the one implicit department manifest (generated)
services/store/migrations/ 0012_… 0018_…
infrastructure/testing/replay/  the recorded v1 Engagement corpus + equivalence harness
```

## 21. Risks

| # | Risk | Mitigation |
|---|---|---|
| DR-1 | The replay test is not byte-identical because routing depth changed the frame | model calls are stubbed by recorded responses (`01-migration-strategy.md` §6); the test asks whether the *machinery* is equivalent |
| DR-2 | A nullable column accidentally changes a query's default | every additive column has a v1-equivalent default asserted by the replay corpus |
| DR-3 | Guard Runner Wasm interface becomes an ambient-authority hole | reuse the plugin host (ADR-0006): fuel-metered, no ambient fs/clock/net |
| DR-4 | The implicit department leaks non-v1 behaviour | AC10 UI snapshot + AC1 replay together bound this |

## 22. Implementation notes

Build strictly bottom-up: `sidra-departments` + `sidra-registry` first (they carry the org graph and standard
resolution the others need), then the Guard Runner, then the Exchange. Ship each behind a feature flag
(`01-migration-strategy.md` §4 steps 2–4 are all reversible-by-flag). The replay suite must be green before
each service's flag is considered done — it is the continuous proof that the invisible substrate stayed
invisible.
