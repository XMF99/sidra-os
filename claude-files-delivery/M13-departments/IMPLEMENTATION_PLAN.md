<<<<<<< HEAD
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
=======
# Departments — Implementation Plan

**Milestone M13 · crates `sidra-departments` + `sidra-registry` (Exchange in `sidra-orchestrator`, Guard Runner in `sidra-security`) · for AntiGravity**

| | |
|---|---|
| Architecture | `DEPARTMENTS_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0013 (Pack as unit of modularity) · 0014 (archetypes & lazy instantiation) · 0016 (Standards & Guards) · 0017 (Registries as Canon projections) · **0043** (Exchange contract resolution) · **0044** (the three-department conformance set) |
| New crates | `sidra-departments` (Registrar), `sidra-registry` (Standards Engine + Registry Engine) |
| Extends | `sidra-orchestrator` (Exchange), `sidra-security` (Guard Runner) |
| Depends on | `sidra-domain`, `sidra-store`, `sidra-security`, `sidra-plugins` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced, AC12) |
| Migration band | `0011`–`0015` (additive, forward-only) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. Nothing here is production code — this plan is the specification AntiGravity implements.

### 0.2 Task conventions (inherited from the M16 / Mission Engine plans, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **Every effectful path has a test asserting its log entry** (GUIDE §3 item 4).

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Department Pack domain model & manifest types | the vocabulary: ids, `department.toml`, archetype, contract, standard, guard, registry |
| E2 | The twelve install checks + Registrar install | ADR-0013: mechanical validation, signature, acquire/install as two logged acts |
| E3 | The Registrar: agent→department resolution & org graph | the resolution M16 grants against; lazy instantiation hooks |
| E4 | The Exchange | ADR-0013: contract-named requests, routing, cost-follows-requester, depth/cycle refusal |
| E5 | Standards Engine | ADR-0016: Firm>Application>Department resolution into the Turn frame |
| E6 | Guard Runner + the Guard-corpus CI gate | ADR-0016: lifecycle validators; every Standard ships a Guard |
| E7 | Registries as Canon projections | ADR-0017: append-only, owner-per-fact, consistency Guard, promotion |
| E8 | Role Archetypes & lazy instantiation | ADR-0014: template→instance, charter freeze, autoscale under budget |
| E9 | Persistence, events & Vault mirror | migrations 0011–0015, event variants, Markdown mirror |
| E10 | Three-department install + one-Exchange-request conformance | the exit criterion — the last thing green |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──┐
        │          ├──► E4 ──────────────┐
        │          │                     ├──► E10
        ├──► E8 ───┘                     │
        │                                │
        ├──► E5 ──► E6 ───────────────────┤
        └──► E7 ──────────────────────────┘
                    E9 runs alongside E2–E8 (schema before each service writes to it)
```

E1 first (everything types against it). E2 next (nothing installs without validation). E3 needs E2 (an
installed Pack to resolve against) and unlocks E4 (the Exchange resolves contracts through the Registrar). E8
(archetypes) rides on E3's instantiation hooks. E5→E6 is the Standards/Guards pair; E6 depends on E5 for the
resolved Standard set. E7 (registries) is independent after E1 but its `registry-consistency` Guard needs E6.
E9 lands each migration just ahead of the service that writes to it. **E10 is the exit criterion and must be
the last thing to go green.**

---

## E1 — Department Pack domain model & manifest types

### Purpose
The vocabulary every other epic types against: ids, the manifest, archetypes, contracts, standards, guards,
registries.

### Scope
In: value objects and the aggregate structs in `packages/domain` (or `services/departments/domain` per the
crate's dependency rules). Out: parsing, validation, persistence — those are E2/E9.

### Dependencies
`sidra-domain` (`Capability`, `EffectClass`, `DepartmentId` if already exported by M11; introduce here only if
absent — confirm before duplicating).

### Public APIs
Constructors that reject invalid construction; no mutating methods on the manifest.

### Acceptance criteria
`Contract` parses only `capability.<name>` and can never hold a department id; `AgentInstance` cannot be
constructed without exactly one `DepartmentId`; `Standard` cannot be constructed without a `GuardId`; property
tests over each.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-departments` and `sidra-registry` crates; manifests; CI wiring; dependency-direction check | S | — | `services/departments/Cargo.toml`, `services/registry/Cargo.toml`, `infrastructure/ci/` | Both crates build; CI fails on any edge `→ sidra-orchestrator` or `→ sidra-mission` (AC12) |
| **T1.2** | Value objects: `DepartmentId`, `PackVersion`, `ArchetypeId`, `InstanceId`, `Contract`, `RegistryKey`, `StandardId`, `GuardPoint` | S | T1.1 | `departments/domain/values.rs` | `Contract` parses only `capability.<name>`; carries no department id; `GuardPoint` constrained to the five known points; property tests |
| **T1.3** | `DepartmentPack` aggregate: identity, capabilities (required/optional/forbidden), provides/requires, memory, budget, roles, review, fs, signature | M | T1.2 | `departments/domain/manifest.rs` | Immutable; exposes no mutator; `requires` holds only `Contract`, never a department id (ADR-0013) |
| **T1.4** | `RoleArchetype` (template) and `AgentInstance` (live): the four v2 fields + frozen `archetype_version` | M | T1.2 | `departments/domain/roles.rs` | `AgentInstance` requires exactly one `DepartmentId`; archetype `capabilities` typed as ⊆ candidates (ADR-0014) |
| **T1.5** | `Standard` + `Guard`: standard carries a **required** `GuardId`; guard carries point, action, tier | S | T1.2 | `registry/domain/standards.rs` | `Standard` cannot be constructed without a `GuardId` (ADR-0016); `action ∈ {warn, block}` |
| **T1.6** | `Registry` + entry: key, value, **required** `owner`, `referenced_by`, status, `revised` | S | T1.2 | `registry/domain/registries.rs` | Entry requires a non-empty `owner`; no delete method exists on the type (ADR-0017) |

---

## E2 — The twelve install checks + Registrar install

### Purpose
Turn a `department.toml` + signature into an installed Pack — or a named refusal — as two of the three logged
acts (acquire, install). Grant is E3.

### Scope
In: TOML parsing, the twelve mechanical checks (§3.3), signature verification via the plugin trust chain, the
acquire/install commands, the installed-Pack registry. Out: capability grant (E3), instantiation (E8).

### Dependencies
E1; `sidra-plugins` (signature verification, ADR-0006); `sidra-store` (Pack persistence — schema from E9).

### Public APIs
`acquire_pack(artifact) -> Result<PackId, AcquireError>`; `install_pack(manifest, signature) -> Result<DepartmentId, InstallError>`;
`list_packs()`; `department_status(id)`.

### Acceptance criteria
Every one of the twelve checks enforced; each failure names its rule; **no override path exists**; the install
command writes no capability grant.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `department.toml` parser → `DepartmentPack` | M | E1 | `departments/manifest/parse.rs` | Malformed TOML rejected with position; round-trips the Backend fixture (`03-department-architecture.md` §2) |
| **T2.2** | Install checks 1–4 (schema/`sidra_api`, signature, `requires` names no department, role caps ⊆ department) | M | T2.1, `sidra-plugins` | `departments/manifest/validate.rs` | Each check has a failing fixture asserting the named rule; check 3 rejects a `requires` naming a department |
| **T2.3** | Install checks 5–8 (standard paths resolve, playbook DAGs, guard parse+point, registry owner+append-only) | M | T2.2 | `departments/manifest/validate.rs` | Check 5 rejects a role citing an unshipped standard; check 8 rejects a registry with no `owner` |
| **T2.4** | Install checks 9–12 (dashboards token-contract, `evals/` non-empty, division budget-share ≤1.0, file-size + Wasm fuel) | M | T2.3 | `departments/manifest/validate.rs` | Check 10 rejects an empty `evals/`; check 11 rejects a Division summing past 1.0 |
| **T2.5** | `acquire_pack`: download + signature verify; **nothing loaded**; `PackAcquired` event | S | T2.2 | `departments/registry/acquire.rs` | Signature-only; no manifest loaded; unsigned refused outside dev mode (`marketplace` §3) |
| **T2.6** | `install_pack`: run all twelve checks; persist to `department_packs`; **write no grant**; `PackInstalled` event | M | T2.4, E9/T9.1 | `departments/registry/install.rs` | Install idempotent on identical `manifest_hash`; zero grant rows after install (AC2); status = Installed |

---

## E3 — The Registrar: agent→department resolution & org graph

### Purpose
The authoritative resolver M16 grants against, the third logged act (grant), and the org graph the Exchange
routes over.

### Scope
In: `grant_department` (a Decision), the forbidden-capability refusal, the three-nested-subset hand-off to the
Broker, `resolve_department`, `resolve_contract`, the org graph. Out: the Exchange itself (E4), instance
lifecycle detail (E8).

### Dependencies
E1, E2; `sidra-security` (Permission Broker); `sidra-store` (grants — schema from E9).

### Public APIs
`grant_department(department, capabilities)`; `resolve_department(instance_id) -> DepartmentId`;
`resolve_contract(contract) -> Vec<DepartmentId>`.

### Acceptance criteria
`resolve_department` is total and single-valued; a forbidden capability cannot be granted; the install→grant
boundary is where the only grant write happens.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `grant_department`: a Principal Decision; plain-language capability list; persist grant; `PackGranted` event | M | E2, E9/T9.1 | `departments/registry/grant.rs` | The **only** grant writer in the crate; grant is logged as a Decision (`marketplace` §2) |
| **T3.2** | Forbidden-capability refusal (ADR-0013 self-denial), surviving a later approval | S | T3.1 | `departments/registry/grant.rs` | A capability in `forbidden` is refused; re-approval still refuses (AC3) |
| **T3.3** | Three-nested-subset check handed to the Broker: agent ⊆ department ⊆ Principal-approved | M | T3.1, `sidra-security` | `departments/registry/ceiling.rs` | Over-ceiling grant refused with the offending capability named (`03-department-architecture.md` §4.2) |
| **T3.4** | `resolve_department(instance_id)`: total, single-valued; the org-graph mapping | M | T3.1 | `departments/registry/orggraph.rs` | Every live instance resolves to exactly one department; the M16 dependency (AC5) |
| **T3.5** | `resolve_contract(contract)`: the provides projection; input to the Exchange | S | T3.1 | `departments/registry/orggraph.rs` | Returns the departments providing a contract; empty ⇒ downstream `contract_unavailable` |

---

## E4 — The Exchange (extends `sidra-orchestrator`)

### Purpose
Contract-named cross-department requests: the mechanism the exit criterion's one request runs on.

### Scope
In: the `department.request` type (Work Order + two fields), routing through `resolve_contract`, cost-follows-
requester attribution, depth limit, cycle refusal, per-request read-scope grant and expiry, the four refusal
reasons. Out: the Registrar resolution (E3, called into).

### Dependencies
E3 (`resolve_contract`); `sidra-orchestrator` (Work Order, scheduler); `sidra-store` (schema from E9).

### Public APIs
`exchange_request(from_department, to_contract, objective, inputs, acceptance, budget, effect_ceiling) -> ExchangeOutcome`.

### Acceptance criteria
A request never names a department; cost debits the requester; a cycle or depth>2 is refused; an unprovided
contract returns `contract_unavailable`; ambiguity resolves per ADR-0043 or refuses.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `department.request` as a Work Order + `to_contract` + `resolved_to`; routing via `resolve_contract` | M | E3, `sidra-orchestrator` | `orchestrator/exchange/request.rs` | `to_contract` typed as `Contract`; no department-named path exists (AC9, F2) |
| **T4.2** | Cost-follows-requester: budget debits the `from_department` sub-ceiling | S | T4.1 | `orchestrator/exchange/cost.rs` | Cybersecurity's review spends Backend's budget (`03-department-architecture.md` §5) |
| **T4.3** | Depth limit of 2 and compile-time cycle refusal over the per-Engagement request graph | M | T4.1 | `orchestrator/exchange/graph.rs` | Depth-3 escalates to Division; a cycle is refused immediately (F7-adjacent) |
| **T4.4** | Per-request read-scope grant for named inputs only, expiring on close | S | T4.1 | `orchestrator/exchange/scope.rs` | Read scope covers only the named inputs and expires when the request closes |
| **T4.5** | Contract resolution & disambiguation per ADR-0043; refusal reasons `contract_unavailable` / `contract_ambiguous` | M | T4.1, E3/T3.5 | `orchestrator/exchange/resolve.rs` | Division-local provider first, then Principal binding; still-ambiguous ⇒ `contract_ambiguous`, never a guess (ADR-0043, AC9) |

---

## E5 — Standards Engine (`sidra-registry`)

### Purpose
Resolve which Standards apply to an artifact path or type and supply them into the Turn frame, Firm >
Application > Department.

### Scope
In: standard registration from Packs, path/type scoping, inheritance resolution with tighten-never-relax,
supply into the frame under the 40% retrieval cap, conflict surfacing at install. Out: Guard execution (E6).

### Dependencies
E1, E2; `sidra-memory` (the Turn frame; standards supplied as context items).

### Public APIs
`register_standards(pack)`; `standards_for(path_or_type) -> Vec<Standard>`.

### Acceptance criteria
Inheritance order is Firm > Application > Department; a department may tighten but never relax; conflicts
surface at install, not runtime.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Standard registration + path/artifact-type scoping | M | E1, E2 | `registry/standards/register.rs` | A standard resolves for a matching path; a non-matching path gets none |
| **T5.2** | Inheritance resolution: Firm > Application > Department; tighten-never-relax; conflict surfaced at install | M | T5.1 | `registry/standards/inherit.rs` | A department relaxing an inherited standard fails install; a tightening is admitted (ADR-0016) |
| **T5.3** | Supply resolved standards into the Turn frame under the 40% retrieval cap | S | T5.2, `sidra-memory` | `registry/standards/frame.rs` | Standards count against the cap; a department whose standards never rank is flagged (over-many) |

---

## E6 — Guard Runner + the Guard-corpus CI gate (extends `sidra-security`)

### Purpose
Execute declarative Guards at lifecycle points and block or warn; enforce that every Standard ships a Guard.

### Scope
In: the five lifecycle points, the three Guard tiers (declarative TOML / Wasm / kernel-native), warn-vs-block,
`StandardViolation` and `GuardBlocked` events, and the Guard-corpus CI gate. Out: standard resolution (E5,
supplied via the frame).

### Dependencies
E5 (the resolved Standard set arrives via the frame — the Guard Runner does **not** import `sidra-registry`);
`sidra-security`; `sidra-plugins` (Wasm-tier Guards).

### Public APIs
`evaluate_guards(point, context) -> GuardOutcome`; the CI gate `guard_corpus_report()`.

### Acceptance criteria
A `block` Guard stops the effect; every Standard has a Guard; a Guard with no blocking input fails CI.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Guard Runner: evaluate at `session_start`/`pre_effect`/`pre_deliverable`/`pre_commit`/`post_turn`; warn vs block | M | E1, `sidra-security` | `security/guards/run.rs` | A `block` stops the effect before it commits; a `warn` records and proceeds (ADR-0016) |
| **T6.2** | Declarative-TOML tier + Wasm tier (fuel-metered, no ambient authority) + kernel-native tier | M | T6.1, `sidra-plugins` | `security/guards/tiers.rs` | A Wasm Guard runs sandboxed and fuel-metered; a shell-shaped guard is rejected (ADR-0016) |
| **T6.3** | `StandardViolation` + `GuardBlocked`/`GuardWarned` events; violations as dashboard data | S | T6.1, E9/T9.2 | `security/guards/audit.rs` | Every block/warn emits an event on the chain; `audit.verify` passes over a fixture (GUIDE §3 item 4) |
| **T6.4** | **The Guard-corpus CI gate:** a Standard with no Guard fails; a Guard with no blocking input fails | M | T6.1, E5 | `infrastructure/ci/guard_corpus.rs` | Build fails when any Standard lacks a Guard or any Guard blocks nothing (GUIDE §7; AC7) |

---

## E7 — Registries as Canon projections (`sidra-registry`)

### Purpose
Department-owned, append-only fact namespaces with one owner per fact, contradiction detection, and a
Principal-confirmed promotion path to Canon.

### Scope
In: registry registration from Packs, `write_registry_entry` (append-only), the `registry-consistency` Guard,
deprecate/supersede, the Canon-promotion candidate flow. Out: Canon itself (v1 mechanism, unchanged).

### Dependencies
E1, E2; E6 (the `registry-consistency` Guard runs on the Guard Runner).

### Public APIs
`write_registry_entry(namespace, key, value, owner)`; `registry_get(namespace, key)`;
`propose_canon_candidate(entry)`.

### Acceptance criteria
No hard delete; one owner per fact; a contradicting Deliverable is blocked at authoring; promotion is a
Decision.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Registry registration + `write_registry_entry` (append-only; owner required; `revised` on change) | M | E1, E2, E9/T9.2 | `registry/registries/write.rs` | No delete path; a change records prior value + cause; owner NOT NULL (ADR-0017) |
| **T7.2** | The `registry-consistency` Guard: block a Deliverable contradicting an entry | M | T7.1, E6 | `registry/registries/consistency.rs` | A contradicting Deliverable is blocked at `pre_deliverable`; `RegistryConflictBlocked` logged (AC8) |
| **T7.3** | Deprecate / supersede (never delete); status transitions | S | T7.1 | `registry/registries/status.rs` | An entry moves active→deprecated/superseded_by; the prior value remains retrievable |
| **T7.4** | Canon-promotion candidate: a cross-Application referenced fact becomes a candidate; Kai proposes, Principal confirms | S | T7.1 | `registry/registries/promote.rs` | Promotion is a Decision, never automatic (ADR-0017) |

---

## E8 — Role Archetypes & lazy instantiation (`sidra-departments`)

### Purpose
Template → instance with charter freeze and autoscale bounded by the department's budget sub-ceiling.

### Scope
In: archetype loading, lazy instantiation per policy (eager/on_demand/scheduled), charter-version freeze at
instantiation, idle retirement, autoscale within manifest bounds. Out: the org-graph resolution (E3).

### Dependencies
E1, E3 (grant must exist before an instance is capability-issued).

### Public APIs
`instantiate_agent(department, archetype) -> InstanceId`; `retire_agent(instance)`.

### Acceptance criteria
An `on_demand` archetype instantiates lazily and retires when idle; an uninstantiated archetype costs a
manifest entry; a running instance keeps its frozen charter version; autoscale never exceeds the budget
sub-ceiling.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T8.1** | Archetype loading; `instantiate_agent` freezing `archetype_version` onto the instance | M | E1, E3 | `departments/archetypes/instantiate.rs` | The instance carries the frozen version; a later archetype edit does not alter it (ADR-0014; AC6) |
| **T8.2** | Instantiation policy: `eager` (heads), `on_demand` (specialists), `scheduled` | S | T8.1 | `departments/archetypes/policy.rs` | Head instantiates on grant; a specialist instantiates on first Work Order |
| **T8.3** | Idle detection + retirement; archetype and history preserved | S | T8.1, E9/T9.2 | `departments/archetypes/retire.rs` | An idle instance retires; the archetype remains; `AgentRetired` logged; history intact (event log) |
| **T8.4** | Autoscale bounded by manifest `{min,max,queue_target}` and the department budget sub-ceiling | M | T8.2 | `departments/archetypes/autoscale.rs` | Autoscale never exceeds `max` or the budget sub-ceiling (ADR-0014, ADR-0020) |

---

## E9 — Persistence, events & Vault mirror

### Purpose
Additive, forward-only schema (band 0011–0015); the event variants; the human-readable Markdown mirror.

### Scope
In: migrations `0011_*`–`0015_*`, the `DepartmentEvent` variants, the Vault mirror writer. Out: business logic.

### Dependencies
`sidra-store`; the band is 0011–0015 (M11/M12 own 0001–0010; later milestones own 0019+).

### Acceptance criteria
Forward-only, idempotent, independently deployable; zero-Pack Firm = M11 implicit single department; mirror
holds no credential.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T9.1** | `0011_department_packs.sql` + `0012_registrar.sql` (packs, role_archetypes, agent_instances) | M | — | `services/store/migrations/` | Forward-only; idempotent; `agent_instances.department_id` NOT NULL; independently deployable |
| **T9.2** | `0013_exchange.sql` + `0014_standards_guards.sql` + `0015_registries.sql` | M | T9.1 | `migrations/` | `standards.guard_id` NOT NULL (ADR-0016); `registry_entries.owner` NOT NULL, no delete (ADR-0017); `exchange_requests.to_contract` is a contract |
| **T9.3** | `DepartmentEvent` enum — all §12 variants with actor + department_id (+ instance_id/contract/standard_id) | M | E1 | `departments/domain/events.rs` | Every kind in §12 present; serde round-trip; schema snapshot committed |
| **T9.4** | Vault Markdown mirror writer (on state transitions, not continuously) | M | T9.3 | `departments/mirror/write.rs` | `department.md`/`grants.md`/`registries/*` written; no credential; append-only registry mirror |

---

## E10 — Three-department install + one-Exchange-request conformance

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the three CORE Pack fixtures, the install-grants-nothing proof, the one-Exchange-request proof, and the
acceptance-criteria coverage (AC1–AC12). Out: any additional department (the other eighteen are later work).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the exit criterion (AC1 + AC4) is the final task and the last to pass.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T10.1** | The three CORE Pack fixtures: Backend, Cybersecurity, Software Engineering (ADR-0044) | M | E2 | `agents/departments/{backend,cybersecurity,software-engineering}/` | Each passes all twelve checks; sourced from the catalog (`04-department-catalog.md`) |
| **T10.2** | **Install-grants-nothing proof:** after installing all three, zero capability grants; a grant appears only after `grant_department` | S | E2, E3 | `.../install_grants_nothing.rs` | AC2 — zero grant rows post-install; one post-grant (F1) |
| **T10.3** | Forbidden-capability refusal test, surviving re-approval | S | E3 | `.../forbidden_capability.rs` | AC3 |
| **T10.4** | Kernel-neutrality grep + dependency-direction checks | S | E1 | `infrastructure/ci/` | AC10, AC12 — build fails on a department id in a kernel crate or an edge to orchestrator/mission |
| **T10.5** | The Guard-corpus gate over the three Packs' Standards | S | E5, E6 | `.../guard_corpus.rs` | AC7 — every Standard has a Guard; a no-block Guard fails CI |
| **T10.6** | Registry-consistency block test; append-only assertion | S | E7 | `.../registry_consistency.rs` | AC8 |
| **T10.7** | Lazy-instantiation + charter-freeze + idle-retire test | M | E8 | `.../instantiation.rs` | AC6 |
| **T10.8** | Contract-refusal tests: department-named request, `contract_unavailable`, `contract_ambiguous` | S | E4 | `.../contract_refusal.rs` | AC9 (F2, F4, F7) |
| **T10.9** | **The exit criterion:** three departments installed from Packs + one Exchange request end to end — Backend → `capability.security-review` → Cybersecurity, resolved by the Registrar, cost charged to Backend, audited triple on the chain | M | T10.1–T10.8 | `services/departments/conformance/exit_criterion.rs` | **AC1 + AC4** — the last test to go green; the request never names a department; the budget debits the requester |
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7

---

## Deliverables summary

<<<<<<< HEAD
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
=======
| Epic | Primary deliverable |
|---|---|
| E1 | department domain types |
| E2 | the twelve install checks + acquire/install (grants nothing) |
| E3 | the Registrar: grant + agent→department resolution (ADR-0013/0014) |
| E4 | the Exchange: contract-named requests (ADR-0013, ADR-0043) |
| E5 | Standards Engine (ADR-0016) |
| E6 | Guard Runner + Guard-corpus CI gate (ADR-0016) |
| E7 | Registries as Canon projections (ADR-0017) |
| E8 | Role Archetypes + lazy instantiation (ADR-0014) |
| E9 | migrations 0011–0015, events, Vault mirror |
| E10 | three-department install + one-Exchange-request conformance (exit criterion, ADR-0044) |
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7
