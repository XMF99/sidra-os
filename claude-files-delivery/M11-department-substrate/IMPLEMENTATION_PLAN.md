<<<<<<< HEAD
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
=======
# Department Substrate — Implementation Plan

**Milestone M11 · crate `sidra-departments` · for AntiGravity**

| | |
|---|---|
| Architecture | `DEPARTMENT_SUBSTRATE_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0040 (implicit default department as the migration bridge) · 0041 (replay equivalence as the substrate exit gate) · consumes 0013, 0016, 0020 |
| Crate | `sidra-departments` at `services/departments/` |
| Depends on | `sidra-domain`, `sidra-store`, `sidra-security`, `sidra-memory`, `sidra-models`, `sidra-orchestrator` |
| Must not depend on | `apps/*`; and no kernel crate may name a department (CI-enforced kernel neutrality) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4 and the M16 plan §0.2, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; steps 1–4 of the migration sequence are
  behind a flag by design (`/docs-v2/01-migration-strategy.md` §5). Never break the build.
- **Every effectful path ships a test asserting its log entry** (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 4).
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Department domain model & the implicit default department | the vocabulary: `DepartmentId`, the five-face value types, the `__default__` seed (ADR-0040) |
| E2 | Memory-namespace isolation (F-mem) | namespace-scoped retrieval; `None` = global v1 namespace |
| E3 | Capability ceiling + the fourth budget ceiling (F-cap, F-bud) | the intermediate department ceiling in the Broker; the fourth ceiling in the Gateway (ADR-0020) |
| E4 | Filesystem scoping (F-fs) | write-scope enforcement on the Broker's effect path |
| E5 | Exchange-only communication substrate (F-comm) | the `department.request` contract type + compile-time refusals (ADR-0013) |
| E6 | Kernel-neutrality refactor + CI grep | department-parametric kernel; the neutrality build gate |
| E7 | Migrations `0002`–`0006` + additive schema | the boundary tables/columns; the implicit-department seed; department events |
| E8 | Replay-equivalence harness | **the exit criterion** — byte-identical Brief over the corpus (ADR-0041) |

### 0.4 Recommended implementation order

```
E1 ──► E7 ──┬──► E2 ──┐
            │         │
            ├──► E3 ──┼──► E6 ──► E8
            ├──► E4 ──┤
            └──► E5 ──┘
   E7 lands the schema just after E1 defines the types the seed row is built from.
   E2, E3, E4, E5 are the four enforced faces; each can proceed in parallel once E1+E7 land.
   E6 refactors the kernel to be department-parametric and adds the neutrality grep; it needs the faces present.
   E8 is the exit criterion and must be the LAST thing to go green.
```

E1 first (everything types against it). E7 lands the schema and the `__default__` seed right after, because
every later face reads a `Department` row. The four faces (E2 memory, E3 capability+budget, E4 filesystem, E5
communication) then proceed in parallel. E6 completes the department-parametric refactor and installs the
kernel-neutrality gate. **E8 is the replay-equivalence harness — the exit criterion — and its final task is the
last thing to go green** (`/docs-v2/01-migration-strategy.md` §6; `/MASTER_IMPLEMENTATION_GUIDE.md` §7).

---

## E1 — Department domain model & the implicit default department

### Purpose
The vocabulary every other epic types against, and the migration bridge: `DepartmentId`, the five-face value
types, and the `__default__` department whose every face is its v1-equivalent null (ADR-0040).

### Scope
In: value objects and the `Department` aggregate in `packages/domain`; the implicit-default constructor. Out:
persistence (E7), enforcement of any face (E2–E5).

### Dependencies
`sidra-domain` (`Capability`, `EffectClass`). Introduce `DepartmentId` here if no earlier crate exports it —
confirm before duplicating (the architecture states this crate is where it is first exported).

### Public APIs
Constructors that reject invalid construction; `Department::implicit_default(principal_approval, monthly_ceiling)`;
no mutating methods on the aggregate.

### Acceptance criteria
Every type rejects invalid construction; the implicit default carries every face at its null value; `__default__`
is a reserved id no Pack can register.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-departments` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/departments/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-departments → apps/*`; dependency direction holds (`/docs/01-technical-architecture.md` §6) |
| **T1.2** | Value objects: `DepartmentId`, `MemoryNamespace`, `CapabilityCeiling`, `BudgetSubCeiling`, `FsScope`, `ContractName`, `ApplicationId` | S | T1.1 | `domain/values.rs` | Each rejects invalid construction; `MemoryNamespace`/`ApplicationId` are `Option`; `BudgetSubCeiling{share,ceiling_hard}` rejects share ∉ [0,1]; property tests |
| **T1.3** | `Department` aggregate: id, division, the five faces, provides/requires contracts, pack ref, state | M | T1.2 | `domain/department.rs` | Immutable; exposes no mutator; sub-invariants hold at construction (arch §4.2) |
| **T1.4** | `Department::implicit_default`: reserved id `__default__`, all faces null (namespace None, ceiling = Principal approval, share 1.0 = monthly ceiling, empty fs scope, no contracts, no pack) | S | T1.3 | `domain/default.rs` | Every face is its v1-equivalent null (arch §4.2); constructing with any non-null face is rejected — the default is exactly the null department |
| **T1.5** | Reserved-id guard: `__default__` is not a registrable Pack id | S | T1.4 | `domain/reserved.rs` | A Pack id equal to `__default__` is refused (arch §Failure F5); unit test |

---

## E2 — Memory-namespace isolation (F-mem)

### Purpose
Namespace department writes and scope retrieval to the caller's namespace; a `None` namespace is the global v1
namespace, so every v1 chunk stays retrievable identically.

### Scope
In: `namespace` scoping in the Memory Service retrieval path; granted, scoped, expiring cross-namespace reads.
Out: the store column (E7); real cross-department scenarios (M13).

### Dependencies
E1; `sidra-memory` (retrieval, ADR-0007).

### Public APIs
`scoped_retrieve(namespace, query, grants) -> Chunks`; `grant_read_scope(from, to_namespace, ttl)`.

### Acceptance criteria
Writes prefixed by the department namespace; `None` reproduces the global v1 namespace byte-for-byte; no
cross-namespace read without a granted, scoped, expiring read.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Namespace-prefix write path: `dept.<id>.*`; `None` → the global prefix (unchanged bytes) | M | E1, E7/T7.3 | `memory/namespace.rs` | A null-namespace write is byte-identical to a v1 write; a scoped write lands under `dept.<id>` |
| **T2.2** | Namespace-scoped retrieval: results limited to the caller's namespace ∪ granted reads | M | T2.1 | `memory/retrieve.rs` | A null-namespace retrieval returns the exact v1 result set (arch §7.1); scoped retrieval excludes other namespaces |
| **T2.3** | Granted, scoped, expiring cross-namespace read | S | T2.2 | `memory/grant.rs` | A read outside the namespace requires a grant; the grant expires; expiry is enforced (F-mem) |
| **T2.4** | Property test I-13: no cross-namespace read without a granted, scoped, expiring read | M | T2.3 | `infrastructure/testing/departments/i13_memory.rs` | Random reads across synthetic namespaces; assert no ungranted cross-namespace read (`/docs-v2/02-implementation-changes.md` §5) |

---

## E3 — Capability ceiling + the fourth budget ceiling (F-cap, F-bud)

### Purpose
Insert the department as an intermediate capability ceiling in the Broker, and the fourth budget ceiling in the
Gateway (ADR-0020), without either component naming a department.

### Scope
In: the three-nested-subset capability check; the turn⊂engagement⊂**department**⊂month ceiling; department
pause on exhaustion. Out: autoscale (M12–M13); the store columns (E7).

### Dependencies
E1, E7; `sidra-security` (`PermissionBroker`); `sidra-models` (`ModelGateway`, `Budget`).

### Public APIs
`authorize_with_ceiling(grant, department, effect)`; `check_department_budget(department, cost) -> Verdict`.

### Acceptance criteria
Agent grant ⊆ department ceiling ⊆ Principal approval; the three v1 ceilings are unchanged; exhaustion pauses a
department and raises one Approval Request; the implicit default (share 1.0) never triggers the fourth check.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Broker: intermediate department ceiling — grant ⊆ `department.ceiling` ⊆ Principal approval | M | E1, E7/T7.2, `sidra-security` | `security/dept_ceiling.rs` | Three nested subsets checked at issue time (arch §3.1 F-cap); `__default__` ceiling = Principal approval → no narrowing; over-grant refused, offending capability named |
| **T3.2** | Gateway: the fourth ceiling inserted between engagement and month; three v1 ceilings unchanged | M | E1, E7/T7.4, `sidra-models` | `models/fourth_ceiling.rs` | Order turn⊂eng⊂dept⊂month (ADR-0020); share 1.0 collapses onto month; v1 ceiling defaults/semantics unchanged |
| **T3.3** | Department pause on sub-ceiling exhaustion; one Approval Request; Model Class not downgraded | M | T3.2 | `models/dept_pause.rs` | Exhaustion pauses the department, raises one Approval Request stating both numbers (ADR-0020); Firm continues; no silent class downgrade |
| **T3.4** | Property test I-14: budget exhaustion pauses one department, Firm continues | M | T3.3 | `infrastructure/testing/departments/i14_budget.rs` | Synthetic multi-department budget; assert one department pauses, neighbours run (`/docs-v2/02-implementation-changes.md` §5) |
| **T3.5** | ADR-0020 reversal check: share 1.0, no hard cap ⇒ byte-identical v1 budgeting | S | T3.2 | `models/tests/reversal.rs` | A single share-1.0 department reproduces v1 three-ceiling behaviour exactly |

---

## E4 — Filesystem scoping (F-fs)

### Purpose
Confine writes to `Artifacts/<dept>/**` via the Broker's effect path; an empty scope is v1 unscoped writes.

### Scope
In: write-scope enforcement; the orchestrator-moves-after-review path for a Deliverable that must land
elsewhere. Out: the store projection column (E7).

### Dependencies
E1, E7; `sidra-security` (`PermissionBroker` effect path); `sidra-orchestrator` (post-review move).

### Public APIs
`authorize_write(department, path) -> Verdict`; `relocate_after_review(deliverable, target)`.

### Acceptance criteria
An agent never writes outside its department scope; an empty scope reproduces v1 unscoped writes; cross-boundary
placement happens by orchestrator move after review, not agent write.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Write-scope check on the Broker effect path: path ∈ `department.fs_write_scope`; empty scope → v1 unscoped | M | E1, E7/T7.3, `sidra-security` | `security/fs_scope.rs` | A write outside scope is denied (arch §7.2); empty scope permits v1 paths byte-identically |
| **T4.2** | Orchestrator move-after-review: a Deliverable destined elsewhere is relocated by the orchestrator, not written across the boundary | M | T4.1, `sidra-orchestrator` | `orchestrator/relocate.rs` | The agent never writes cross-scope; the orchestrator moves post-review (`/docs-v2/03-department-architecture.md` §4.4) |
| **T4.3** | Property test I-12: no agent writes outside its department's filesystem scope | M | T4.1 | `infrastructure/testing/departments/i12_fs.rs` | Random Work Orders across synthetic departments; assert no cross-scope write (`/docs-v2/02-implementation-changes.md` §5) |

---

## E5 — Exchange-only communication substrate (F-comm)

### Purpose
Make the communication face a compile-time boundary: a `department.request` names a contract, never a
department; cycles and depth > 2 are refused (ADR-0013). The routing engine that carries traffic is M13; M11
delivers the contract and the refusals.

### Scope
In: the `department.request` type; the manifest rule (`requires.contracts` may not name a department); the
per-Engagement request-graph validator (cycles, depth). Out: contract resolution / routing (M13); real traffic.

### Dependencies
E1; `sidra-orchestrator` (Work Order envelope, ADR-0010).

### Public APIs
`DepartmentRequest{from, to_contract, budget_attribution, effect_ceiling, …}`; `validate_request_graph(graph)`.

### Acceptance criteria
A manifest naming a department in `requires.contracts` is refused at install; the request graph refuses cycles
and depth > 2; cost is attributed to the requester.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `DepartmentRequest` type: `to_contract` is a `ContractName`, never a `DepartmentId`; carries requester budget attribution and effect ceiling | S | E1 | `exchange/request.rs` | Type cannot hold a `DepartmentId` in `to_contract` (arch §8, ADR-0013); budget attributed to requester |
| **T5.2** | Manifest compile-time rule: `requires.contracts` naming a department is a hard install refusal | S | T5.1 | `exchange/manifest_rule.rs` | A manifest naming a department is refused with the rule named (`/docs-v2/03-department-architecture.md` §8 check 3; arch §Failure F6) |
| **T5.3** | Request-graph validator: refuse cycles; enforce depth limit 2 | M | T5.1 | `exchange/graph.rs` | Cycle refused at compile time; depth > 2 refused (`/docs-v2/03-department-architecture.md` §5) |
| **T5.4** | Property test I-15: the Exchange refuses cycles and depth > 2 | S | T5.3 | `infrastructure/testing/departments/i15_exchange.rs` | Synthetic request graphs; assert cycle and depth refusals (`/docs-v2/02-implementation-changes.md` §5) |

---

## E6 — Kernel-neutrality refactor + CI grep

### Purpose
Complete the department-parametric refactor of the four kernel components and install the build gate that fails
on any department identifier in a kernel crate.

### Scope
In: parameterising Broker/Memory/Gateway/orchestrator by optional `DepartmentId`; the CI grep with its single
allowlisted construction site. Out: new behaviour (owned by E2–E5).

### Dependencies
E2, E3, E4, E5 (the faces must exist to be parameterised).

### Public APIs
No new public API; the refactor is internal. The gate is `infrastructure/ci/kernel-neutrality`.

### Acceptance criteria
No kernel crate contains a department identifier except the one allowlisted `__default__` construction site;
the build fails on any other occurrence.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Audit the four kernel components for any name-based branch; convert each to read a face off a resolved `Department` value | M | E2, E3, E4, E5 | `security/`, `memory/`, `models/`, `orchestrator/` | No `if department == …` anywhere; each reads a field, not a name (arch §6.2) |
| **T6.2** | Kernel-neutrality CI grep: fail the build on any department identifier (Pack ids + `__default__`) in a kernel crate | M | T6.1 | `infrastructure/ci/kernel_neutrality.rs` | Build fails on a planted identifier; passes on the clean tree (`/MASTER_IMPLEMENTATION_GUIDE.md` §7) |
| **T6.3** | Allowlist exactly one `__default__` construction site; any other occurrence fails | S | T6.2 | `infrastructure/ci/kernel_neutrality.rs` | A second `__default__` occurrence in a kernel crate fails the build (arch §6.1, M11-R2) |

---

## E7 — Migrations `0002`–`0006` + additive schema

### Purpose
Additive, forward-only schema for the boundary; the implicit-department seed; the department lifecycle events.

### Scope
In: migrations `0002`–`0006`; the `__default__` seed row; the `department.installed` / `agent.instantiated`
event variants (fired at seed time only). Out: business logic (E1–E6); deferred M12–M14 tables.

### Dependencies
E1; `sidra-store`. Band `0002`–`0006` per the milestone facts; `0001` is the v1 base; `0019+` are taken by
M15/M16.

### Acceptance criteria
Forward-only, idempotent, independently deployable; every new column nullable with a v1-equivalent default; a
null-scoped Firm is byte-for-byte pre-M11; seed events land on the hash chain and never enter a replayed
Engagement.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | `0002_departments.sql`: the boundary record columns; seed the `__default__` row (all faces null) | M | E1 | `services/store/migrations/0002_departments.sql` | Forward-only, idempotent; the seed is the only department; existing agents resolve to it (arch §Persistence) |
| **T7.2** | `0003_agent_department_scoping.sql`: `agents.department_id`, `archetype_id`, `archetype_version`, `instance_number` — all nullable | S | T7.1 | `migrations/0003_*.sql` | `NULL` → the implicit department; no existing column changed (`/docs-v2/02-implementation-changes.md` §3) |
| **T7.3** | `0004_memory_fs_scoping.sql`: `memory_chunks.namespace` nullable; the fs-scope projection | S | T7.1 | `migrations/0004_*.sql` | `NULL namespace` → global v1 namespace; empty fs scope → v1 unscoped |
| **T7.4** | `0005_budget_department_ceiling.sql`: `budgets`/`budget_ledger.department_id` nullable; fourth-ceiling bookkeeping | S | T7.1 | `migrations/0005_*.sql` | `NULL` → the three v1 ceilings apply unchanged (ADR-0020) |
| **T7.5** | `0006_workorder_engagement_scoping.sql`: `work_orders`/`engagements`/`deliverables` scoping; replay-fixture corpus schema | S | T7.1 | `migrations/0006_*.sql` | `NULL` → unscoped, exactly as v1; corpus schema present |
| **T7.6** | `DepartmentEvent` variants `department.installed`, `agent.instantiated`; fire at seed time only | M | E1 | `domain/events.rs` | Both carry actor + department_id; serde round-trip; a test asserts neither enters a replayed Engagement (arch §9.2, AC9) |
| **T7.7** | Migration tests against a prior-release fixture Vault | M | T7.1–T7.5 | `services/store/migrations/tests/` | Each migration runs against a v1 fixture Vault and is idempotent (`/docs/04-database-design.md` §10; AC8) |

---

## E8 — Replay-equivalence harness (the exit criterion)

### Purpose
The exit criterion, made a test: a recorded v1 Engagement produces a byte-identical Brief when replayed against
the substrate with model calls stubbed (ADR-0041). **The last thing to go green.**

### Scope
In: the replay harness, the canonical Brief comparator, the corpus runner, the CI replay gate, and the
zero-visible-change assertion. Out: any live-model behaviour (covered by evaluation sets,
`/docs-v2/01-migration-strategy.md` §6).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC9 each covered by a named test; the replay harness (AC1) asserts a byte-identical Brief over the whole
corpus and is the CI gate on M11–M14.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T8.1** | Replay driver: load a recorded v1 Engagement, replay its events against the substrate with the `__default__` manifest | M | E1–E7 | `services/departments/replay/driver.rs` | Replays a recorded Engagement end to end under the implicit department (arch §9.3) |
| **T8.2** | Model-call stubbing: recorded responses keyed by frame digest | M | T8.1 | `replay/stub.rs` | Stubs by recorded response (`/docs-v2/01-migration-strategy.md` §6); no live model call in the harness |
| **T8.3** | Canonical Brief comparator: canonical serialisation of the `briefs` projection; octet-for-octet equality | M | T8.1 | `replay/compare.rs` | Compares `situation`/`actions`/`findings`/`recommendation`/`the_ask`/`confidence` canonically (arch §9.2); a one-byte diff fails and is localised (F1) |
| **T8.4** | **Replay-equivalence test over the corpus (the exit criterion):** every recorded Engagement produces a byte-identical Brief | L | T8.2, T8.3 | `infrastructure/testing/departments/replay_equivalence.rs` | **AC1** — byte-identical Brief for every Engagement in the corpus; RED names the diff; this is the exit criterion and the last thing to go green |
| **T8.5** | CI replay gate on M11–M14: the corpus runs on every commit | S | T8.4 | `infrastructure/ci/replay_gate.rs` | A recorded v1 Engagement producing a different Brief fails the build (`/MASTER_IMPLEMENTATION_GUIDE.md` §7) |
| **T8.6** | Zero-visible-change assertion + seed/replay audit fixture (AC2, AC9) | M | T8.4, T7.6 | `.../zero_visible.rs`, `.../seed_replay_audit.rs` | AC2: no Rail/keymap/Brief/notification change; AC9: seed events on the chain, none in the replayed stream |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | department domain types + the implicit default department (ADR-0040) |
| E2 | memory-namespace isolation (F-mem) |
| E3 | capability ceiling + the fourth budget ceiling (F-cap, F-bud, ADR-0020) |
| E4 | filesystem scoping (F-fs) |
| E5 | Exchange-only communication substrate (F-comm, ADR-0013) |
| E6 | kernel-neutrality refactor + CI grep |
| E7 | migrations 0002–0006, seed, department events |
| E8 | replay-equivalence harness — the exit criterion (ADR-0041) |
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7
