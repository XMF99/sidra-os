# M11 — Department Substrate · Implementation Plan

**For AntiGravity.** Epics E1–E7. Conventions §0.4 (one task = one commit; S/M/L by reviewer load; tests per
task; `main` green; feature-flagged while inert). Every task: Purpose · Files · APIs · Events · DB/Migration ·
Tests · AC · Review steps · Deps · Completion.

Build order: E1 → E2 → E3 → E4 (parallel with E3) → E5 → E6 → E7 (replay, continuous).

---

## E1 — Domain model & schema

**Purpose.** The vocabulary and additive schema the four services type against.

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T1.1** Value objects: `DepartmentId`, `ArchetypeId`, `InstanceNumber`, `DepartmentManifest`, `RoleArchetype`, `Standard`, `RegistryEntry`, `Guard`, `ExchangeRequest`, `OrgGraph` | L | — | `packages/domain/src/departments.rs` | Each rejects invalid construction; `capabilities` subset invariants hold | property tests green |
| **T1.2** Migration `0012_departments.sql` (+ `role_archetypes`) | S | T1.1 | `services/store/migrations/` | Forward-only, idempotent | applies + re-applies no-op |
| **T1.3** Migration `0013_standards.sql` | S | T1.2 | migrations | same | same |
| **T1.4** Migration `0014_registry_entries.sql` | S | T1.2 | migrations | same | same |
| **T1.5** Migration `0015_guards.sql` (+ `guard_violations`) | S | T1.2 | migrations | same | same |
| **T1.6** Migration `0016_exchange_requests.sql` | S | T1.2 | migrations | same | same |
| **T1.7** Migration `0017_additive_columns.sql` (agents/work_orders/engagements/deliverables/budgets/memory_chunks) | M | T1.2 | migrations | all nullable, v1-default | null = v1 behaviour (replay) |
| **T1.8** Migration `0018_applications.sql` | S | T1.2 | migrations | same | same |
| **T1.9** Event kinds `department.installed/retired`, `agent.instantiated/retired`; message kinds `department.request`, `standard.violation` | M | T1.1 | `packages/domain/src/events.rs` | Additive; no kind removed/redefined | serde round-trip + chain test |

**Subtasks T1.7:** one nullable column per table, each with an asserted v1-equivalent default in the replay corpus.

---

## E2 — `sidra-departments` (Registrar & org graph)

**Purpose.** Load manifests, validate, hold the org graph, resolve archetypes, manage instance lifecycle,
enforce budget sub-ceiling.

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T2.1** Crate scaffold + dependency-direction CI check (no edge to orchestrator) | S | E1 | `services/departments/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Builds; reverse edge fails CI | CI green |
| **T2.2** Manifest parser (`department.toml` → `DepartmentManifest`) | M | T2.1 | `src/manifest/parse.rs` | Malformed TOML rejected with position | fixture round-trip |
| **T2.3** The twelve validation checks (`03-department-architecture.md` §8) | L | T2.2 | `src/manifest/validate.rs` | Each check has a failing fixture naming its rule; no override | AC2 |
| **T2.4** Org graph: nodes (department/division/office), edges (contains/provides/requires); cycle-free | M | T2.2 | `src/graph.rs` | Graph builds; a naming cycle in `requires` rejected | AC5 (partial) |
| **T2.5** Archetype resolution + instance lifecycle (create/retire, stable IDs) | M | T2.4 | `src/instances.rs` | `agent.<dept>.<arch>.NN` IDs; retire preserves history | AC3 |
| **T2.6** Autoscale (min/max/queue_target from manifest) | M | T2.5 | `src/autoscale.rs` | Instantiates within bounds; idle retirement | bounded-scale test |
| **T2.7** Per-department budget sub-ceiling (fourth nested ceiling) in the gateway path | M | T2.5, `sidra-models` | `src/budget.rs` | Exhaustion pauses one department; Firm continues (I-14) | AC4 |
| **T2.8** The implicit department: load at startup, contain all v1 agents | M | T2.5 | `src/implicit.rs` | Every v1 agent resolves inside `dept._implicit` with stable ID | AC3, AC10 |

**Subtasks T2.3 (the twelve checks):** schema+sidra_api; signature/dev-mode; no `requires` names a
department; role caps ⊆ dept caps; standards paths resolve; playbooks compile as DAGs; guards parse to a known
lifecycle point; registries declare owner+append-only; dashboards use known panels+tokens; evals non-empty;
budget shares sum ≤1.0 per division; no file exceeds size budget + tools declare fuel.

---

## E3 — `sidra-registry` (Standards Engine & Registries)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T3.1** Crate scaffold + direction check | S | E1 | `services/registry/Cargo.toml`, `src/lib.rs` | Builds | CI green |
| **T3.2** Standards resolution by path glob and artifact type | M | T3.1 | `src/resolve.rs` | Empty set → "no constraint"; precedence firm>app>dept | AC7 |
| **T3.3** Violation recording to `guard_violations`/`standards`; `standard.violated` event | M | T3.2 | `src/violations.rs` | A violation is recorded with agent+work order | AC7 |
| **T3.4** Registry store + append-only query API; `registry.entry_added/deprecated` events | M | T3.1 | `src/registry.rs` | Append-only enforced; deprecation marks, never deletes (ADR-0017) | registry test |
| **T3.5** Canon promotion path (propose→confirm; never automatic) | M | T3.4 | `src/canon.rs` | A registry fact becomes a Canon *candidate*, promoted by Kai+Principal | promotion test |

---

## E4 — Guard Runner (in `sidra-security`)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T4.1** Lifecycle points: engagement-start, pre-effect, pre-deliverable, post-turn, session-start, pre-compaction, on-gate | M | E1 | `services/security/src/guards/points.rs` | Each point invokes the runner | point test |
| **T4.2** Declarative guard evaluation (Tier 1: pattern/section/naming checks) | M | T4.1 | `src/guards/declarative.rs` | A declarative guard blocks/warns per its spec | AC8 (Tier 1) |
| **T4.3** Wasm validator interface `validate(context)->verdict` under the plugin host (fuel, no ambient) | L | T4.1, `sidra-plugins` | `src/guards/wasm.rs` | A Wasm validator runs sandboxed; fuel-exhaustion terminates | AC8 (Tier 2) |
| **T4.4** `guard.blocked` event; block/warn wired to the Broker's choke point | S | T4.2 | security | A block is audited | chain test |

---

## E5 — Exchange (in `sidra-orchestrator`)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T5.1** `department.request` type + routing by contract (never by department name) | M | E1, E2 | `services/orchestrator/src/exchange/route.rs` | A request names a contract; Registrar resolves it | routing test |
| **T5.2** Contract resolution via Registrar; clean `contract_unavailable` failure | M | T5.1, E2 | `src/exchange/resolve.rs` | No installed provider → clean fail, surfaced to Kai; no silent fallback | resolution test |
| **T5.3** Cost attribution: charge the requester's department budget | M | T5.1, T2.7 | `src/exchange/cost.rs` | Cost follows the requester (`03-department-architecture.md` §5) | attribution test |
| **T5.4** Depth ≤2 and cycle refusal at graph-build time | M | T5.1 | `src/exchange/graph.rs` | Depth-3 request escalates to Division; a cycle is refused (I-15) | AC5 |
| **T5.5** Read-scope grant per request, expiring on close | S | T5.1 | orchestrator/security | Scope granted for named inputs only; expires | scope test |
| **T5.6** `exchange.requested/completed` events | S | T5.1 | orchestrator | Both audited | chain test |

---

## E6 — Isolation enforcement & invariants

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T6.1** Memory namespace isolation `dept.<id>.*`; cross-namespace read needs a granted scope (I-13) | M | E2, `sidra-memory` | memory service | Random cross-read denied without grant | AC6 |
| **T6.2** Filesystem scope `Artifacts/<dept>/**` via the Broker (I-12) | M | E2, `sidra-security` | broker | No cross-scope write | AC6 |
| **T6.3** Quarantine: crash/budget/guard-failure suspends one department, resumable Work Orders, one notification | M | E2, E4 | orchestrator | Neighbours unaffected; Work Order resumes (I-17) | isolation-chaos green |

---

## E7 — Replay equivalence (continuous gate)

| Task | Cx | Deps | Files | AC | Completion |
|---|---|---|---|---|---|
| **T7.1** Recorded v1 Engagement corpus (Directive→Mandate→Work Orders→Deliverables→Brief) with stubbed model responses | M | E1 | `infrastructure/testing/replay/corpus/` | A representative corpus exists | corpus present |
| **T7.2** Equivalence harness: replay against the v2 kernel with the implicit-department manifest | L | T7.1, E2–E6 | `replay/run.rs` | Brief is byte-identical | AC1 |
| **T7.3** Wire replay + I-12…I-17 + pack-validation + guard-corpus into CI as blocking | S | T7.2 | `infrastructure/ci/` | All blocking | CI green |

**Exit:** AC1 green (T7.2) with AC2–AC10 supporting. The replay suite runs on every commit for M11–M14.

## Deliverables summary

| Epic | Deliverable |
|---|---|
| E1 | domain + migrations 0012–0018 + events |
| E2 | `sidra-departments` (registrar, org graph, autoscale, budget, implicit dept) |
| E3 | `sidra-registry` (standards resolution, registries, Canon path) |
| E4 | Guard Runner (declarative + Wasm) |
| E5 | Exchange (routing, resolution, cost, depth/cycle) |
| E6 | isolation enforcement + I-12…I-17 |
| E7 | replay equivalence gate |
