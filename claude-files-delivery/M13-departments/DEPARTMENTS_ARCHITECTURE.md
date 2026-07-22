# Departments — Architecture

**Milestone M13 · Release 2.0 "Concourse" · Layer 3 (Departments)**

| | |
|---|---|
| Milestone | M13 — Departments (`/MILESTONE_REGISTRY.md` §4, 2.0 "Concourse") |
| Release | 2.0 "Concourse" — the Firm becomes a company; here departments become installable and operational |
| Layer | 3 — Departments (`/docs-v2/02-layer-model.md` §3), served by kernel machinery at Layer 1 |
| New crates | `sidra-departments` (the Registrar) and `sidra-registry` (Standards Engine + Registry Engine); the Exchange extends `sidra-orchestrator`, the Guard Runner extends `sidra-security` (§ Appendix B, justified) |
| Depends on | M11 (department substrate, replay equivalence, the implicit single department), M12 (Divisions, Offices, firm-wide vetoes) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | **Three departments installed from Packs, and one Exchange request end to end** — proven by test, not by configuration (`/MILESTONE_REGISTRY.md` §4) |

> **Authoritative precedence.** Where this document disagrees with `/docs-v2/01-enterprise/03-department-architecture.md`
> about what a Department *is* mechanically (the manifest, the twelve install checks, the Exchange contract),
> that document governs. Where it disagrees with `/docs/07-security-model.md` about the capability grammar,
> effect classes, or the Permission Broker as sole choke point, the security model governs. Where any v2
> document appears to contradict a v1 document, v1 wins and the v2 document is a defect to report
> (`/MASTER_IMPLEMENTATION_GUIDE.md` §2). This architecture *consolidates and operationalizes* decisions
> already taken in ADR-0013, ADR-0014, ADR-0016, and ADR-0017; it re-decides none of them.

---

## 1. Why this subsystem exists

### 1.1 The problem

M11 gave the Firm an invisible substrate: the kernel learned what a Department *is* (a manifest conforming to
the Pack contract) and the Firm ran "as one implicit department with byte-identical behaviour"
(`/MILESTONE_REGISTRY.md` §4, M11). M12 gave the Firm a visible skeleton: eight Divisions, four Offices, the
Rail showing Divisions, vetoes firm-wide (`/docs-v2/01-org-chart-v2.md` §1). Between the two, the Firm now has
a substrate that can hold departments and a structure that can supervise them — and **not one real department
doing delivery work.** Every "department" named in the catalog is, at the end of M12, a heading with nothing
installed behind it, exactly as every `integration:git:read` capability was a name with nothing behind it
before M16 (the parallel is deliberate; see §Appendix C).

The requirement is not "add twenty-one departments." A Firm that arrives with twenty-one departments the
Principal did not ask for "has spent their attention before doing any work" (`/docs-v2/04-department-catalog.md`
§Summary; Principle 1, Principle 13). The requirement is: **let a specific Department Pack be acquired,
installed, and granted as three separate logged acts; let its agents be lazily instantiated from Role
Archetypes under a hard budget sub-ceiling; let its Standards be enforced by Guards that actually block; let
its Registries own the cross-boundary facts; and let one department request work from another by naming a
contract — never a department — routed by an authoritative Registrar.** That is M13.

### 1.2 The stance

Four decisions, already taken, govern this milestone. M13 gives each a running mechanism:

1. **A department is a Pack — the unit of modularity.** (ADR-0013) `department.toml` plus twelve directories,
   nine of which are pure data. Installation is validated by twelve mechanical checks with no override. It is
   distributable, forkable, versioned, and signed on the plugin trust chain (ADR-0006). *(§3, §4)*
2. **Roles are Archetypes; agents are lazily instantiated Instances.** (ADR-0014) The archetype is data in the
   Pack; the Registrar creates an instance with its own id, memory, and KPI history on demand, and retires it
   when idle — which is how the ≤400 MB idle budget survives twenty-one departments. *(§9)*
3. **Standards and Guards are kernel primitives.** (ADR-0016) A Standard is a path-scoped rule; a Guard is a
   declarative validator at a lifecycle point that can warn or **block**. **Every Standard must ship a Guard or
   it does not ship** — enforced as a CI gate (the Guard corpus gate, `/MASTER_IMPLEMENTATION_GUIDE.md` §7,
   failure mode 7). *(§7)*
4. **Registries are Canon projections.** (ADR-0017) Department-owned, append-only, one owner per fact,
   `referenced_by` everywhere else; a Guard blocks a Deliverable that contradicts a registry entry; promotion
   to Canon is a Principal Decision, never automatic. *(§8)*

Above these sit the invariants M13 cannot bend: **installation never grants authority** — acquire, install,
grant are three separate logged acts (`/docs-v2/05-marketplace-and-packs.md` §2; GUIDE §3 item 8);
**cross-department requests name contracts, never departments** (ADR-0013; GUIDE §3 item 11); **the kernel
contains no department-specific logic** — verified by CI grep (`/docs-v2/02-layer-model.md` §1; GUIDE §3 item
12); **a department is a boundary** — separate memory namespace, capability ceiling, budget sub-ceiling,
filesystem scope, Exchange-only communication (`/docs-v2/01-enterprise-architecture.md` §5; GUIDE §3 item 10).

### 1.3 What a Department is, mechanically

A **Department** is an installed Pack that the kernel loads, isolates, budgets, and audits through four kernel
services — the **Registrar**, the **Exchange**, the **Standards Engine**, and the **Guard Runner**
(`/docs-v2/01-enterprise-architecture.md` §3). The Pack is the Layer-3 artifact; the four services are the
Layer-1 machinery that manages it, exactly as the plugin host (kernel) manages Layer-7 Wasm plugins and — one
release later — the connector framework (kernel) manages Layer-6 connectors (`/docs-v2/02-layer-model.md`).
This parallel is load-bearing: M13 introduces **no new trust mechanism**. It reuses the plugin signing chain
(ADR-0006), the Permission Broker (M3), the event log (M2, ADR-0002), and the Wasm sandbox (M9) already
shipped.

```
Layer 1  sidra-departments  ← the Registrar: Pack load, archetype resolution, instance lifecycle, org graph  (M13, THIS DOC)
Layer 1  sidra-registry     ← Standards Engine + Registry Engine                                               (M13, THIS DOC)
Layer 1  sidra-orchestrator ← extended with the Exchange (department.request = Work Order + 2 fields)          (M13, THIS DOC)
Layer 1  sidra-security     ← extended with the Guard Runner (Guards block effects → the Broker's neighbourhood)(M13, THIS DOC)
Layer 3  a Department Pack  ← department.toml + roles/playbooks/standards/guards/registries/…, a signed artifact (the catalog ships 21)
```

### 1.4 What a Department must never become

- **A department the kernel special-cases.** No `if department == "game-studio"`, no hardcoded list of
  twenty-one names. The kernel knows what a Department *is* and nothing about which ones exist
  (`/docs-v2/02-layer-model.md` §1). The moment a kernel crate names a department, layers 3–8 stop being
  replaceable. A CI grep fails the build on a hit (§ acceptance AC10).
- **An install that grants authority.** Installing a Pack grants nothing. Capabilities are *requested*,
  *displayed in plain language*, and *not granted* until a separate explicit Principal act
  (`/docs-v2/05-marketplace-and-packs.md` §2). A marketplace artifact that arrives with autonomy is a permanent
  no (`/MASTER_IMPLEMENTATION_GUIDE.md` §12).
- **A department that names another department.** `requires.contracts` may name only a capability contract,
  never a department (`/docs-v2/01-enterprise/03-department-architecture.md` §2). A Pack whose manifest hard-
  depends on a named department is refused at install (check #3). This is what keeps the layer replaceable:
  swap the department that provides `capability.code-review` and nothing breaks.
- **A boundary a warning can cross.** There is no "install anyway." A trust boundary you can override on a
  warning is decoration (`/docs-v2/01-enterprise/03-department-architecture.md` §8).

### 1.5 Relationship to existing concepts

| Existing concept | How M13 relates |
|---|---|
| Permission Broker (M3) | Every agent's capability grant is a subset of its department's, which is a subset of what the Principal approved — three nested subsets checked at issue time by the Broker (`03-department-architecture.md` §4). M13 adds the department ceiling; it does not replace the choke point. |
| Plugin host & trust chain (M9, ADR-0006) | A Pack is signed and verified on the plugin trust chain; its `tools/` run in the existing Wasm sandbox with no new mechanism (ADR-0013). |
| Event log (M2, ADR-0002) | Install, grant, instantiation, Exchange, Guard-block, and registry writes are audited events on the hash chain. History is append-only; a retired instance's history is never rewritten (ADR-0014). |
| Divisions & Offices (M12) | The Division executive selects departments; the Offices hold the vetoes a Pack's `[review]` block invokes (`01-org-chart-v2.md` §3). M13 makes those `[review]` requirements resolvable. |
| Budget ceilings (M11, ADR-0020) | The department budget sub-ceiling is the fourth nested ceiling; the Registrar enforces it. Exhaustion pauses the department, not the Firm (`01-enterprise-architecture.md` §5). |
| Connector Framework (M16) | **M16 grants a connector to a department and resolves the calling agent's department through the Registrar this milestone ships** (M16 §9 step 1, §1.5). M13 is therefore the substrate M16 is certified against; M16 cannot be certifiable before M13 lands (`/MILESTONE_REGISTRY.md` §5, dependency 2). |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A department is a boundary the kernel enforces, not a label | ADR-0013; isolation checklist compiled from the manifest (§4, §5.3); Broker + Registrar + Exchange + Standards Engine each own one dimension |
| G2 | Installation grants nothing | `/docs-v2/05-marketplace-and-packs.md` §2; acquire/install/grant are three logged acts (§5.2); the install path has no code that writes a capability grant |
| G3 | Cross-department work names a contract, never a department | ADR-0013; the Exchange refuses a department-named request (§6, F2); `requires.contracts` check at install (#3) |
| G4 | The kernel contains no department-specific logic | `/docs-v2/02-layer-model.md` §1; CI grep over `sidra-departments`, `sidra-registry` and every kernel crate (AC10) |
| G5 | Every Standard is enforced by a Guard | ADR-0016; the Guard-corpus CI gate refuses a Standard with no blocking input (§7.4, AC7) |
| G6 | Idle memory survives twenty-one departments | ADR-0014; lazy instantiation; an uninstantiated archetype costs a manifest entry (§9, AC6) |
| G7 | A registry has one owner per fact and detects contradiction mechanically | ADR-0017; the `registry-consistency` Guard blocks a contradicting Deliverable at authoring time (§8, AC8) |
| G8 | A department that fails is quarantined; neighbours are unaffected | `03-department-architecture.md` §4.7; durable, resumable suspension (ADR-0010); one notification (§ lifecycle, F5) |
| G9 | Everything is additive and forward-only | §Persistence; migrations 0011–0015 additive; a Firm with zero installed Packs behaves exactly as the M11 implicit single department (AC11) |
| G10 | The Registrar resolves agent→department authoritatively | §5; one agent lives in exactly one department (`02-layer-model.md` §4); this is precisely what M16 §9 depends on (AC5) |

---

## 3. The Department Pack (ADR-0013)

### 3.1 Shape

A Department is a signed, versioned, installable artifact — a **Pack** — conforming to a fixed contract, the
same trust model as a v1 plugin with a larger manifest (`03-department-architecture.md` §1):

```
departments/backend/
├── department.toml     # the manifest — the whole contract in one file
├── roles/              # Role Archetypes (charters), one file each        ── DATA
├── playbooks/          # department workflows (v1 Workflow DAGs)          ── DATA
├── standards/          # path- and artifact-scoped rules                  ── DATA
├── guards/             # declarative lifecycle validators                 ── DATA
├── registries/         # append-only fact namespaces owned by this dept   ── DATA
├── templates/          # document templates the department authors into   ── DATA
├── dashboards/         # panel definitions for the department room        ── DATA
├── stage-model.yaml    # lifecycle phases and gates                       ── DATA
├── evals/              # evaluation sets gating charter changes           ── DATA
└── tools/              # optional Wasm components (ADR-0006)               ── CODE (sandboxed, no new mechanism)
```

Nine of the twelve directories are data. Only `tools/` carries executable code, and it runs in the existing
Wasm sandbox. This is deliberate: **a department should be reviewable by reading it**
(`03-department-architecture.md` §1). `agents/departments/backend/` is the complete answer to "what can
Backend do" (ADR-0013).

### 3.2 The manifest, and the three acts that surround it

`department.toml` is the contract. Everything the kernel needs to load, isolate, budget, and audit a
department is here, and nothing else is trusted (`03-department-architecture.md` §2). The load-bearing blocks:

| Block | What the kernel does with it |
|---|---|
| `[department]` id, division, version, `sidra_api` | identity; kernel-compatibility range check |
| `[capabilities]` `required` / `optional` / `forbidden` | the department's ceiling; `forbidden` is a **permanent self-denial** that survives every future grant |
| `[provides].contracts` | the capability contracts other departments may request through the Exchange |
| `[requires].contracts` | soft requirements the Registrar resolves — **never a named department** |
| `[memory]` namespace, `canon_access`, retention | the isolated memory namespace `dept.<id>.*`; Canon read-only |
| `[budget]` share, `ceiling_hard` | the fourth nested budget sub-ceiling (ADR-0020) |
| `[roles]` head, archetypes, autoscale | the Registrar's instantiation targets and bounds |
| `[review]` office_quality / office_security / office_architecture | which Offices (M12) this department must invoke, and when |
| `[fs]` `write_scope` / `read_scope` | the filesystem boundary |
| `[signature]` publisher | the plugin trust chain (ADR-0006) |

**Acquire → Install → Grant are three separate, independently refusable, logged acts**
(`/docs-v2/05-marketplace-and-packs.md` §2; GUIDE §3 item 8):

1. **Acquire.** The Pack is downloaded and its signature verified. *Nothing is loaded.*
2. **Install.** The manifest is validated against the twelve checks (§3.3). Contracts resolve. *Nothing runs.
   Capabilities are requested, displayed, and not granted.*
3. **Grant.** The Principal grants capabilities from a plain-language list, individually. *Only now can the
   department act.* A Pack requesting `integration:cloud:write` shows *"This department will be able to make
   changes to your cloud infrastructure, including changes that cost money and cannot be undone."* — not the
   capability string (`/docs-v2/05-marketplace-and-packs.md` §2).

This is the load-bearing property of the whole marketplace layer, and M13's install path is where it is made
structural: there is no code that writes a capability grant on the install path — the only place a grant is
written is the separate `grant_department` command (§ public commands), which is a Principal Decision.

### 3.3 The twelve mechanical install checks (hard refusal, no override)

Verbatim from `03-department-architecture.md` §8. Each failure is a hard refusal naming the failing rule; there
is no "install anyway." These are the twelve the connector manifest's ten checks mirror (M16 §5.4).

| # | Check | Refuses |
|---|---|---|
| 1 | Manifest schema valid; `sidra_api` range satisfied by the running kernel | a Pack built for a kernel that cannot honour it |
| 2 | Signature verified against a trusted publisher, or developer mode explicitly enabled (v1 rules) | an unsigned Pack outside dev mode |
| 3 | **No `requires.contracts` entry names a department** | a Pack that hard-depends on a named department (breaks replaceability) |
| 4 | Every role's `capabilities` ⊆ `capabilities.required ∪ optional` | a role that exceeds its own department's ceiling |
| 5 | Every role's `standards` paths resolve inside the Pack | a role citing a Standard that is not shipped |
| 6 | Every playbook compiles as a valid DAG (v1 workflow validation, reused) | a playbook with a cycle or a dangling node |
| 7 | Every Guard parses and declares a lifecycle point from the known set | a malformed or mis-scoped Guard |
| 8 | Every registry declares an `owner` field and append-only semantics | a registry without a named owner (ADR-0017) |
| 9 | Dashboards reference only known panel types and only token-contract styles | a panel that would fracture the Night Atrium contract |
| 10 | `evals/` is non-empty | a Pack whose charters cannot be gated against regression |
| 11 | Budget `share`, summed across the Division's installed departments, ≤ 1.0 | a Division over-subscribed past its allocation |
| 12 | No file exceeds the declared size budget; `tools/` components declare their fuel limits | an unbounded Pack or an unmetered Wasm tool |

A thirteenth property is enforced *after* install, at grant time, and is not one of the twelve because it is
not a manifest fact: **a scope in the department's `capabilities.forbidden` set can never be granted, even
after a later approval** (ADR-0013; §5.3, AC3). A Pack update that removes an entry from `forbidden` is treated
as a **new Pack requiring fresh approval**, because otherwise the field is worthless
(`03-department-architecture.md` §2).

---

## 4. Domain model

### 4.1 Core types

```
DepartmentId(String)          // stable id from the manifest, e.g. "backend"
PackVersion(SemVer)           // versioned against the contract surface (provides/registry schemas/standard ids)
ArchetypeId(String)           // e.g. "api-engineer" — an id within a department
InstanceId(String)            // e.g. "agent.backend.api-engineer.01" — a live agent
Contract(String)              // a capability contract, e.g. "capability.security-review" — NEVER a department name
Capability(String)            // domain "." action [":" scope]  (security model §4)
StandardId(String)            // path/artifact-scoped rule id
GuardPoint                    // enum: session_start | pre_effect | pre_deliverable | pre_commit | post_turn
RegistryKey(String)           // a fact key within a department-owned namespace
```

### 4.2 The five aggregates and the org graph

```
DepartmentPack {
    id, name, division, version, sidra_api,
    capabilities:  { required: [Capability], optional: [Capability], forbidden: [Capability] },
    provides:      [Contract],              // what the Exchange may route TO this department
    requires:      [Contract],              // resolved by the Registrar — never a department name
    memory:        { namespace, canon_access: read, retention },
    budget:        { share, ceiling_hard },
    roles:         { head: ArchetypeId, archetypes: [ArchetypeId], autoscale: {min,max,queue_target} },
    review:        { office_quality, office_security, office_architecture },
    fs:            { write_scope, read_scope },
    signature:     { publisher },
    status:        Proposed | Installed | Granted | Staffed | Operating | Quarantined | Retired
}

RoleArchetype {                              // DATA in the Pack (ADR-0014)
    id, department_id, model_class, capabilities: [Capability],  // ⊆ department grant
    standards: [StandardId], instantiation: eager | on_demand | scheduled,
    charter:   { the ten v1 employee-spec sections }             // frozen at instantiation onto an instance
}

AgentInstance {                              // a LIVE agent created by the Registrar (ADR-0014)
    id: InstanceId, archetype_id, archetype_version,  // version frozen at instantiation
    department_id,                            // exactly one — the boundary
    memory_scope: dept.<id>.*, kpi_history, created_at, retired_at: Option
}

ExchangeContract {                           // a projection of provides/requires across installed Packs
    contract: Contract, provided_by: [DepartmentId], required_by: [DepartmentId]
}

Standard {                                   // ADR-0016
    id, scope: PathGlob | ArtifactType, rule_text, inherits_from: Firm|Application|Department,
    guard: GuardId                           // REQUIRED — a Standard with no Guard does not ship
}

Guard {                                      // ADR-0016
    id, point: GuardPoint, action: warn | block,
    tier: declarative_toml | wasm | kernel_native, standard_id: Option
}

Registry {                                   // ADR-0017
    namespace, owner_field_required: true, append_only: true,
    entries: [ { key, value, owner, referenced_by: [ref], status: active|deprecated|superseded_by, revised } ]
}
```

### 4.3 Relationships (ASCII)

```
  DepartmentPack 1 ──── * RoleArchetype          (roles declared in the Pack)
  RoleArchetype  1 ──── * AgentInstance          (lazily instantiated; charter frozen per instance)
  AgentInstance  * ──── 1 DepartmentId           (exactly one department — the boundary; layer-model §4)
  DepartmentPack 1 ──── * Standard               (path/artifact-scoped rules the department ships)
  Standard       1 ──── 1 Guard                  (EVERY Standard ships a Guard — ADR-0016)
  DepartmentPack 1 ──── * Registry               (append-only fact namespaces the department owns)
  Registry.entry 1 ──── 1 owner                  (one owner per fact — ADR-0017)
  Registry.entry 1 ──── * referenced_by          (everyone else references)

                          THE ORG GRAPH (held by the Registrar)
        DepartmentPack.provides ──▶ ExchangeContract ◀── DepartmentPack.requires
                                          │
                            resolve(Contract) ──▶ DepartmentId          (never the reverse)
                                          │
  department.request(from_dept, to_CONTRACT) ──▶ Registrar resolves ──▶ to_department, routes a Work Order
```

The critical asymmetry: a Pack declares `provides` and `requires` in terms of **contracts**; the Registrar is
the only component that maps a contract to a department, and it does so at routing time. No department, agent,
or manifest ever names the department on the other side of a request (ADR-0013; GUIDE §3 item 11).

---

## 5. The Registrar (`sidra-departments`)

The Registrar is the kernel service that "decides what the Firm *is*" — it loads Pack manifests, resolves
archetypes, instantiates and retires agents, enforces per-department budget sub-ceilings, and holds the org
graph (`/docs-v2/01-enterprise-architecture.md` §3). It is kernel and not a plugin for the reason stated there:
*a plugin cannot be trusted to define the trust boundaries it lives inside.*

### 5.1 What the Registrar owns

1. **Pack lifecycle.** Runs the twelve install checks; records install/grant/retire as events; holds each
   Pack's status (§ lifecycle table).
2. **Archetype → instance resolution.** Instantiates lazily per the archetype's `instantiation` policy —
   `eager` (heads), `on_demand` (most specialists), `scheduled` (ADR-0014). Freezes the archetype's charter
   version onto the instance at instantiation; archetype changes never retroactively alter existing instances.
3. **Instance lifecycle.** Creation, retirement, idle detection, autoscale bounded by the manifest and never
   exceeding the department's budget sub-ceiling.
4. **The org graph.** The authoritative mapping from every live `InstanceId` to exactly one `DepartmentId`,
   and from every `Contract` to the set of departments that provide it.
5. **Budget sub-ceiling enforcement.** The fourth nested ceiling. Exhaustion pauses the department and raises
   one Approval Request; it does not stop the Firm and it does not silently degrade the model class
   (`03-department-architecture.md` §4.3).

### 5.2 The resolution M16 depends on: agent → department

`resolve_department(instance_id) -> DepartmentId` is authoritative and total: **an Agent Instance exists in
exactly one Department and inherits that Department's capability grant as its ceiling. It cannot be promoted,
borrowed, or shared** (`/docs-v2/02-layer-model.md` §4). If two departments need the same skill, the archetype
is installed in both and the instances are separate, with separate memory — a shared instance would be a hole
in the isolation boundary.

This is precisely the resolution M16 §9 step 1 calls before every connector grant check: *"Resolve the agent's
department via the Registrar. An agent exists in exactly one department."* The connector framework's entire
per-department isolation rests on this function returning one, and only one, department. That is why **M13
gates M16**: before the Registrar exists there is no narrower place than the whole Firm to put a connector
grant, and a firm-wide permission that already works is the change nobody makes later
(`/MILESTONE_REGISTRY.md` §5, dependency 2; ADR-0035).

### 5.3 The nested-subset check the Registrar hands to the Broker

At grant time and again at instance-capability-issue time, the Broker (M3) enforces three nested subsets, with
the Registrar supplying the department ceiling (`03-department-architecture.md` §4.2):

```
   agent grant  ⊆  department grant  ⊆  what the Principal approved
        │                 │                        │
   (role.capabilities)  (capabilities.required ∪ optional, minus forbidden)  (the grant Decision)
```

A scope in `capabilities.forbidden` is subtracted before the subset is even computed, and stays subtracted
through every future approval (ADR-0013). The check is intersection, never union — a grant can only narrow
(`/docs/07-security-model.md` §4).

---

## 6. The Exchange (extends `sidra-orchestrator`)

Cross-department work is a first-class, typed, budgeted, logged request — a Work Order with two extra fields,
not a new mechanism, which is why v1's ADR-0010 does most of the work (`03-department-architecture.md` §5). It
lives in `sidra-orchestrator` because the Work Order machinery lives there (§Appendix B justifies the
placement) and because *isolation enforced by a participant is not isolation* — the Exchange, like the
Permission Broker, is the non-participant that enforces the boundary (`01-enterprise-architecture.md` §3).

### 6.1 The request, and the rule that defines it

```
department.request
  from_department    backend
  to_contract        capability.security-review     # a CONTRACT, never a department name
  resolved_to        cybersecurity                  # filled by the Registrar at routing time
  objective          "Review the token refresh flow for replay exposure."
  inputs             [artifact refs, read-scoped]
  acceptance         [criteria the requester will check against]
  budget             $2.00                          # charged to the REQUESTER's department
  effect_ceiling     1
  deadline           …
```

The rules, verbatim (`03-department-architecture.md` §5):

- **Requests name contracts, not departments.** The Registrar resolves. If no installed department provides
  the contract, the request fails cleanly with `contract_unavailable` and Kai surfaces it — it does **not**
  silently fall back to a general-purpose agent, because a silent fallback is how quality claims become false.
- **Cost follows the requester.** Backend asking Cybersecurity spends Backend's budget. Without this, a popular
  department is punished for being useful and the budget signal inverts.
- **Depth limit of 2.** A department may answer a request by making one further request; beyond that it
  escalates to its Division. Prevents an unbounded chain no single agent can see the shape of.
- **Cycles are refused at compile time.** The Exchange builds the request graph per Engagement; a cycle is a
  routing error surfaced immediately, mirroring the workflow engine's DAG validation.
- **Read scope is granted per request**, for the named inputs only, and expires when the request closes.

Disambiguation — *which* department answers when more than one provides the contract — is not settled in the
source and is decided in **ADR-0043** (deterministic resolution: Division-local provider first, then explicit
Principal binding, then refuse with `contract_ambiguous` rather than guess).

### 6.2 The one end-to-end request that is the exit criterion

The exit criterion's single Exchange request is **Backend → `capability.security-review` → (resolved by the
Registrar to) Cybersecurity** — the exact example the source uses (`03-department-architecture.md` §5,
"Review the token refresh flow for replay exposure."). It exercises, in one pass: contract-not-department
naming, Registrar resolution, cost-follows-requester attribution, per-request read-scope grant and expiry, and
an audited `ExchangeRequested → ExchangeResolved → ExchangeCompleted` triple on the hash chain. It is the last
thing to go green (§ IMPLEMENTATION_PLAN E10).

---

## 7. Standards and Guards as kernel primitives (ADR-0016)

The Standards Engine (`sidra-registry`) resolves which Standards apply to an artifact path or type and supplies
them into the Turn frame; the Guard Runner (`sidra-security`) executes declarative Guards at lifecycle points
and warns or blocks (`01-enterprise-architecture.md` §3). Standards constrain agents, so an agent-adjacent
component cannot be the one applying them; Guards can block effects, which is the Permission Broker's
neighbourhood by definition — hence these placements.

### 7.1 A Standard

A path- or artifact-scoped rule, resolved by the Standards Engine, supplied into the context frame, counted
against the existing 40% retrieval cap. **Inheritance: Firm > Application > Department; a department may
tighten, never relax** (ADR-0016; `03-department-architecture.md` §4.6). Conflicts resolve by that order and
are surfaced at install, not at runtime.

### 7.2 A Guard

A declarative validator at a lifecycle point — `session_start`, `pre_effect`, `pre_deliverable`, `pre_commit`,
`post_turn` — with an action of **warn** or **block** (ADR-0016). Three implementation tiers:

| Tier | When | Mechanism |
|---|---|---|
| Declarative TOML | the majority | parsed and evaluated by the Guard Runner; no code |
| Wasm validator | where real logic is needed | runs under the existing plugin host, fuel-metered (ADR-0006) |
| Kernel-native | where the kernel already does the job better | audit logging, compaction preservation |

Guards **cannot be shell scripts.** CCGS's hooks were `bash` with ambient filesystem/`git`/`jq`; ADR-0006's
sandbox forbids that shape, and importing it would put a hole in the security model to gain a validation
feature (ADR-0016). This is an accepted reduction in extensibility, not a mitigated one.

### 7.3 The pairing rule

**Every Standard must have a Guard, or it does not ship** (ADR-0016). A standard nobody checks is a comment —
which is exactly the observation that makes the rule/hook pairing work. `standard.violation` is one of the two
message kinds ADR-0016 adds (twelve → fourteen), and a violation is **data**: a `StandardViolation` event
reveals that a specific archetype repeatedly violates a specific standard — a charter defect visible in a
dashboard, not a mystery discovered in review.

### 7.4 The Guard-corpus CI gate

`/MASTER_IMPLEMENTATION_GUIDE.md` §7 lists, live from M13: *"Guard corpus — fails when a Guard has no input it
must block."* This is the mechanical enforcement of the pairing rule and of failure mode 7 ("Standards as
decoration"). The gate runs a corpus of inputs against each Guard and asserts that at least one input is
blocked; a Guard that blocks nothing is either mis-scoped or decorative, and either way the build fails. A
Standard shipped with no Guard fails check #5-adjacent validation at install *and* the Guard-corpus gate in CI
— two independent refusals for one defect (AC7).

---

## 8. Registries as Canon projections (ADR-0017)

The Registry Engine (`sidra-registry`) manages department-owned, append-only, structured fact namespaces —
the category of fact that crosses document boundaries within a domain but is not a firm-wide truth: an API
contract three departments build against, an architectural stance constraining six systems (ADR-0017).

The rules, adopted directly from CCGS (ADR-0017):

- **Register only facts that cross a boundary.** Internal-only facts stay internal.
- **Never delete. Deprecate or supersede.** Append-only, like the event log, because a registry you can prune
  is a registry whose history you cannot trust.
- **One owner per fact; everything else references** via `referenced_by`.
- **A change updates the value, sets `revised`, and records the prior value and cause.**
- **Registries are read before authoring and written after approval.**
- **A Guard blocks a Deliverable that contradicts a registry entry** — the `registry-consistency` Guard, which
  makes cross-document consistency mechanical at authoring time rather than a bug discovered three months later.

Registry facts feed Canon by **promotion, not automatically**: a fact that survives review and is referenced
across Applications becomes a Canon candidate, promoted by v1's existing mechanism — Kai proposes, the
Principal confirms (ADR-0017). This keeps Canon small and meaningful — a department-owned fact becoming a
firm-wide truth is exactly the kind of change that should require the Principal, and now it does. The registry
is a *projection*, not a sixth memory layer: owned, append-only, structured, with its own semantics but no new
retrieval path.

---

## 9. Role Archetypes and lazy instantiation (ADR-0014)

At roughly a hundred charters across twenty-one departments (the Game Studio alone is 49), writing every
charter individually breaks the maintenance budget, instantiating them all breaks the ≤400 MB idle memory
budget, and routing them all breaks the context budget (ADR-0014). The resolution:

- **An archetype is a template — data in the Pack.** The ten v1 employee-spec sections plus four v2 fields:
  `model_class`, `capabilities` (a subset of the department's grant), `standards`, `instantiation`
  (`03-department-architecture.md` §3).
- **An instance is a live agent created by the Registrar** with its own id, memory, and KPI history.
- **Instantiation policy per archetype:** `eager` (heads), `on_demand` (most specialists), `scheduled`.
  Autoscale is bounded in the manifest and never exceeds the department's budget sub-ceiling.
- **An instance's charter is frozen at instantiation.** Archetype changes do not retroactively alter existing
  instances — correct for reproducibility (an Engagement from last month replays exactly), occasionally
  confusing when an archetype was fixed and a running instance still has the bug. The event log records
  archetype version and instance id on every Turn; without freezing, the audit chain would describe agents
  that never existed (ADR-0014).

The payoff: an uninstantiated archetype costs a manifest entry. Forty-nine game archetypes with four live
instances is the same footprint as v1's eleven resident agents (ADR-0014, defending the ≤400 MB budget).
First-use latency on an `on_demand` archetype's first Work Order is the accepted cost.

---

## 10. The three departments for the exit criterion

The exit criterion is **three departments installed from Packs, and one Exchange request end to end**. Which
three is not fixed in the source; it is decided in **ADR-0044** and justified here.

| Department | Role in the test | Sourced from |
|---|---|---|
| **Backend** (`dept.backend`) | the **requester**; its manifest literally declares `requires.contracts = ["capability.code-review", "capability.security-review"]` | `03-department-architecture.md` §2 (the manifest example); catalog #2, CORE |
| **Cybersecurity** (`dept.cybersecurity`) | provides `capability.security-review` — the contract the one Exchange request names | `04-department-catalog.md` #11, CORE; provides `capability.security-review` |
| **Software Engineering** (`dept.software-engineering`) | provides `capability.code-review` — the second contract Backend requires, proving the Registrar resolves **two** contracts to **two** departments | `04-department-catalog.md` #1, CORE; provides `capability.code-review` |

Why these three and not any three:

1. **All three are CORE** — the recommended first-run set (`04-department-catalog.md` §Summary), so the test
   fixture is the Firm's real default, not a contrivance.
2. **The request already exists in the source.** Backend → `capability.security-review` → Cybersecurity is the
   worked example in `03-department-architecture.md` §5. Using it means the exit criterion tests a documented
   flow, not an invented one.
3. **Three departments make "three" meaningful.** Software Engineering provides the *other* contract Backend
   requires. Installing it proves the Registrar resolves distinct contracts to distinct departments and that
   `requires.contracts` resolution is not a one-off. The single Exchange request that is the exit criterion is
   Backend→security-review→Cybersecurity; Software Engineering's `capability.code-review` is present and
   resolvable but is not the demonstrated request (the exit criterion is *one* Exchange request).

Persistence, events, commands, sequences, and failure modes below are written against this trio.

---

## 11. Persistence — migrations 0011–0015 (additive, forward-only)

M13 owns migration band **`0011`–`0015`** (`/MILESTONE_REGISTRY.md`; task band). All tables are projections of
the event log (ADR-0002): a Firm with zero installed Packs behaves exactly as the M11 implicit single
department, and every table below is rebuildable from the log. ULID primary keys, epoch-ms timestamps, foreign
keys ON — the v1 database rules (`/docs/04-database-design.md` §1), unchanged.

| Migration | Table(s) | Purpose |
|---|---|---|
| `0011_department_packs.sql` | `department_packs` | installed Packs: id, name, division, version, publisher, manifest_hash, status, installed_at, granted_at — status drives the lifecycle (§ lifecycle) |
| `0012_registrar.sql` | `role_archetypes`, `agent_instances` | archetypes (data) and lazily instantiated instances; `agent_instances.department_id` NOT NULL and `archetype_version` frozen at instantiation (ADR-0014); extends the existing `departments`/`agents` tables additively |
| `0013_exchange.sql` | `exchange_contracts`, `exchange_requests` | the contract→department projection and the typed request: from_department, to_contract, resolved_to, objective, budget_cents (charged to requester), effect_ceiling, status, depth |
| `0014_standards_guards.sql` | `standards`, `guards`, `standard_violations`, `guard_runs` | Standards with a NOT NULL `guard_id` (ADR-0016 — no Standard without a Guard at the schema level); Guard runs and violations as audit projections |
| `0015_registries.sql` | `registries`, `registry_entries` | append-only fact namespaces: key, value, `owner` (NOT NULL), `referenced_by`, status (active/deprecated/superseded_by), `revised` — no hard delete representable (ADR-0017) |

Additive columns only elsewhere; no existing column's meaning changes. `department_packs.status` with no
`Granted` row is a fully supported state (a Pack installed but not granted grants nothing), not a migration
artifact. Each migration is forward-only, idempotent, in one transaction, and ships with a test that runs it
against a fixture Vault from the previous release (`/docs/04-database-design.md` §10). **The band does not
touch 0001–0010 (base/M11/M12) or 0019+ (later milestones).**

---

## 12. Domain events

Every event carries `actor`, the relevant `department_id`, and (where applicable) `instance_id` /
`contract` / `standard_id`, and lands on the hash chain (ADR-0002). Install/grant/exchange/guard-block/registry
events are the audited spine of the milestone:

**Pack lifecycle:** `PackAcquired` · `PackInstalled` · `PackGranted` · `PackDisabled` · `PackRetired`
`DepartmentQuarantined` · `DepartmentRecovered`

**Instances (ADR-0014):** `ArchetypeRegistered` · `AgentInstantiated` · `AgentRetired`

**Exchange (ADR-0013):** `ExchangeRequested` · `ExchangeResolved` · `ExchangeCompleted` ·
`ExchangeRefused{reason: contract_unavailable | contract_ambiguous | cycle | depth_exceeded}`

**Standards & Guards (ADR-0016):** `StandardViolation` · `GuardEvaluated` · `GuardWarned` · `GuardBlocked`

**Registries (ADR-0017):** `RegistryEntryWritten` · `RegistryEntryDeprecated` · `RegistryEntrySuperseded` ·
`RegistryConflictBlocked` · `RegistryFactPromotedToCanonCandidate`

`department.request` and `standard.violation` are the two new **message kinds** ADR-0016 adds (twelve → four­teen);
the events above are their audit records. The Vault Markdown mirror (v1 rule — the archive outlives the
software) writes `departments/<id>/department.md`, `grants.md`, `registries/*.md`, and per-day
`exchange/` and `guard-violations/` logs on state transitions, never continuously, and never a credential.

---

## 13. Public commands and queries

### 13.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `acquire_pack(artifact)` | Acquired | signature verified; **nothing loaded** (`marketplace` §2 act 1) |
| `install_pack(manifest, signature)` | Installed | runs the twelve checks (§3.3); hard refusal names the failing rule; **grants nothing** |
| `grant_department(department, capabilities)` | Granted | a Principal **Decision**; plain-language list shown; refused if any capability ∈ `forbidden` |
| `instantiate_agent(department, archetype)` | Staffed/Operating | usually the Registrar acting lazily; freezes charter version onto the instance |
| `retire_agent(instance)` | — | retires the instance; archetype and history preserved (ADR-0014) |
| `exchange_request(from_department, to_contract, objective, inputs, acceptance, budget, effect_ceiling)` | — | the §6 path; `to_contract` must be a contract; returns `resolved`/`contract_unavailable`/`contract_ambiguous`/`cycle`/`depth_exceeded` |
| `write_registry_entry(namespace, key, value, owner)` | RegistryEntryWritten | append-only; `registry-consistency` Guard blocks a contradiction (§8) |
| `disable_pack(department)` / `retire_department(department)` | Disabled/Retired | namespace preserved read-only; history intact (`03-department-architecture.md` §7) |

**No command on the install path writes a capability grant.** The only writer of a grant is
`grant_department`, and it is a Decision. This is how "installation never grants authority" is made structural
rather than promised.

### 13.2 Queries

| Query | Returns |
|---|---|
| `list_packs()` | installed Packs + status |
| `department_status(id)` | lifecycle state (§ lifecycle table) |
| `resolve_department(instance_id)` | the one department an agent lives in — **the M16 dependency (§5.2)** |
| `resolve_contract(contract)` | the department(s) providing a contract; the Exchange's routing input |
| `list_archetypes(department)` / `list_instances(department)` | template roster and live roster |
| `standards_for(path_or_type)` | the resolved Standard set for the Turn frame (Firm > Application > Department) |
| `registry_get(namespace, key)` | a fact, its owner, and its `referenced_by` |
| `guard_corpus_report()` | per-Guard blocked-input coverage — the CI gate's query (§7.4) |

---

## 14. Sequence diagrams

### 14.1 Acquire → Install → Grant (three separate logged acts)

```
Principal        Registrar(sidra-departments)     Broker        EventLog
   │  acquire_pack(artifact,sig) │                   │             │
   ├────────────────────────────►│ verify signature  │             │
   │                             │ (NOTHING loaded)  │             │
   │◄──── Acquired ──────────────┤ ── PackAcquired ──┼────────────►│
   │  install_pack(manifest,sig) │                   │             │
   ├────────────────────────────►│ twelve checks §3.3│             │
   │                             │ resolve contracts │             │
   │                             │ (caps REQUESTED,  │             │
   │                             │  displayed, NOT   │             │
   │                             │  granted)         │             │
   │◄──── Installed ─────────────┤ ── PackInstalled ─┼────────────►│
   │  grant_department(dept,caps)│  ◀── a Principal DECISION        │
   ├────────────────────────────►│ refuse if ∈ forbidden           │
   │                             ├── write grant ───►│ (Broker)    │
   │◄──── Granted ───────────────┤ ── PackGranted ───┼────────────►│
   │                             │ Registrar instantiates head (eager)
   │◄──── Staffed ───────────────┤ ── AgentInstantiated ──────────►│
```

### 14.2 One Exchange request end to end, naming a contract (the exit criterion)

```
Agent(backend)   Exchange(orchestrator)   Registrar   Cybersecurity   Broker/Budget   EventLog
  │ department.request                │        │            │              │            │
  │  to_contract=capability.security-review    │            │              │            │
  ├──────────────────────────────────►│ resolve_contract ──►│              │            │
  │                                   │◄── cybersecurity ───┤              │            │
  │                                   │ (never named by backend)           │            │
  │                                   │ grant read-scope for named inputs only          │
  │                                   │ ── ExchangeRequested/Resolved ─────┼───────────►│
  │                                   │ charge budget to BACKEND ──────────►│           │
  │                                   ├── route Work Order ───►│ Turn: security review   │
  │                                   │◄──────── Deliverable ──┤              │           │
  │◄──── result ──────────────────────┤ read-scope expires; ── ExchangeCompleted ──────►│
```

### 14.3 A Guard blocking a Standard violation

```
Agent            GuardRunner(sidra-security)   StandardsEngine(sidra-registry)   EventLog
  │ pre_deliverable: emit Deliverable │                    │                       │
  ├──────────────────────────────────►│ standards_for(path)│                       │
  │                                   ├───────────────────►│ Firm>App>Dept resolved│
  │                                   │◄── [Standard+Guard]┤                       │
  │                                   │ evaluate Guard(action=block)                │
  │◄──── BLOCKED{standard_id} ────────┤ ── GuardBlocked + StandardViolation ──────►│
  │  (Deliverable does not proceed; violation is DATA in a dashboard — ADR-0016)   │
```

---

## 15. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | An install path grants authority by mistake | **Structurally impossible** — no install-path command writes a grant; the only grant writer is `grant_department`, a separate Principal Decision (§3.2, §13.1). The install-grants-nothing test (AC2) asserts zero grant rows after install |
| F2 | A cross-department request names a department, not a contract | Refused at the type boundary — `exchange_request.to_contract` is a `Contract`, and check #3 refuses any manifest `requires` naming a department. The Exchange has no department-named request path to misuse (ADR-0013) |
| F3 | A Standard ships with no Guard | Fails the Guard-corpus CI gate (a Guard with no blocking input) **and** schema NOT NULL on `standards.guard_id`; the Pack does not ship (ADR-0016; §7.4) |
| F4 | A contract no installed department provides | `exchange_request` returns `contract_unavailable`; Kai surfaces it; **no silent fallback** to a general-purpose agent (`03-department-architecture.md` §5) |
| F5 | A department fails Guards repeatedly / breaches budget / crashes | Quarantined: in-flight Work Orders suspended (durable, resumable — ADR-0010), queue stops, one notification; neighbours unaffected (`03-department-architecture.md` §4.7) |
| F6 | A Deliverable contradicts a registry entry | `registry-consistency` Guard blocks at authoring time; `RegistryConflictBlocked` logged (ADR-0017; §8) |
| F7 | Two departments provide the same contract | Resolved deterministically per ADR-0043 (Division-local first, then Principal binding); if still ambiguous, `contract_ambiguous` — the Exchange refuses rather than guesses |
| F8 | A kernel crate names a department | CI grep fails the build (`02-layer-model.md` §1; AC10) — the neutrality property is a compile gate, not a review note |
| F9 | An archetype is edited while an instance runs | The running instance keeps its frozen charter version to a natural boundary; the log records the version so the audit chain never describes an agent that never existed (ADR-0014) |

---

## 16. Performance and offline

- **Lazy instantiation is the performance strategy.** An uninstantiated archetype costs a manifest entry, not
  memory; the ≤400 MB idle budget (a CI gate from M1, GUIDE §3 item 16) survives twenty-one departments
  because only `eager` heads and demanded specialists are resident (ADR-0014). First-use latency on an
  `on_demand` first Work Order is the accepted, bounded cost.
- **Quarantine is bounded blast radius.** A failing department suspends durably and raises one notification;
  the Firm keeps working (`03-department-architecture.md` §4.7). This is the Layer-3 replaceability test:
  uninstall all twenty-one and the kernel and executive still run (`02-layer-model.md` §9).
- **Routing is deterministic where it can be.** A Directive naming a known department, artifact path, or
  project routes by table without a model call; only ambiguous Directives cost a `fast`-class classification
  (`01-enterprise-architecture.md` §4). M13 adds no model call to the hot path that was not already there.
- **The Exchange adds two fields, not a new engine.** A `department.request` is a Work Order; the scheduler's
  determinism is unaffected (`03-department-architecture.md` §5).

---

## 17. Dependencies, assumptions, risks

### 17.1 Dependencies

| On | For |
|---|---|
| M11 — department substrate, replay equivalence, the implicit single department | the kernel already knows what a Department *is*; M13 makes Packs installable on that substrate |
| M12 — Divisions, Offices, firm-wide vetoes | the Division executive that selects departments; the Offices a Pack's `[review]` block invokes |
| M9 — plugin trust chain & Wasm host (ADR-0006) | Pack signatures; `tools/` and Wasm Guards run in the existing sandbox |
| M3 — Permission Broker, capability grammar, redaction | the three nested subsets; default-deny; the sole choke point |
| M2 — event log (ADR-0002) | install/grant/exchange/guard/registry events on the hash chain; projections rebuildable |

### 17.2 Assumptions

1. M11 shipped the implicit single department and the replay-equivalence gate is green; M13 installs *named*
   Packs onto that substrate without changing the substrate (`/MILESTONE_REGISTRY.md` M11).
2. The Offices of M12 exist and can be invoked; a Pack's `[review]` requirements resolve to real Office
   reviewers (`01-org-chart-v2.md` §3).
3. Pack `tools/` are Wasm components under ADR-0006; no non-Wasm executable is admitted (check #12).

### 17.3 Risks (from `/MASTER_IMPLEMENTATION_GUIDE.md` §10)

| # | Failure mode (GUIDE §10) | Signal | Mitigation |
|---|---|---|---|
| FM2 | The convenient exception — a department reads another's memory "just for context"; an executive calls a tool directly because the Exchange is slow | a PR whose description says "just" or "for now" next to a boundary | isolation is property-tested (I-12–I-17), not reviewed; the Exchange is the only inter-department path (`02-layer-model.md` §3) |
| FM3 | Ceremonial review — Offices approve everything; Guards warn instead of block | Office approval rate above 95%; a Guard whose action is `warn` where it should `block` | veto rate has a floor (ADR-0015); the Guard-corpus gate proves Guards block (§7.4) |
| FM5 | Structure without evidence — all twenty-one departments installed for a two-product Firm | a department whose Work Orders a neighbour could absorb | Principle 13; the exit criterion installs **three**, not twenty-one; CORE-only first run (`04-department-catalog.md`) |
| FM6 | Charter sprawl — hand-written charters that drift | copy-pasted archetype text across departments | archetypes are the mechanism (ADR-0014); `code-reviewer` written once, installed in four departments |
| FM7 | Standards as decoration — rules nobody checks | a Standard shipped with no Guard | every Standard ships a Guard (ADR-0016); the Guard-corpus CI gate refuses the build (§7.4) |

---

## 18. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | **Three departments (Backend, Cybersecurity, Software Engineering) install from Packs**, each passing all twelve mechanical checks; any failure is a hard refusal naming the rule, with no override | install-check test over the three CORE Packs plus a corpus of malformed Packs asserting the named refusal |
| AC2 | **Installation grants nothing** — after install, zero capability grants exist; a grant appears only after the separate `grant_department` Decision | install-grants-nothing test asserting zero grant rows post-install and a grant row only post-grant (§ F1) |
| AC3 | A capability in a department's `capabilities.forbidden` set cannot be granted, even after a later approval | grant-refusal test against a forbidden capability; the refusal survives a re-approval |
| AC4 | **One Exchange request completes end to end naming a contract** — Backend → `capability.security-review` → Cybersecurity, resolved by the Registrar, cost charged to Backend, `ExchangeRequested→Resolved→Completed` on the chain | the exit-criterion Exchange test (§14.2); asserts the request never names a department and the budget debits the requester |
| AC5 | The Registrar resolves an agent to exactly one department | `resolve_department` property test — total, single-valued; the function M16 §9 depends on (§5.2) |
| AC6 | An `on_demand` archetype instantiates lazily and retires when idle; an uninstantiated archetype costs only a manifest entry; a running instance keeps its frozen charter version | instance-lifecycle test; idle-budget assertion; charter-freeze replay test (ADR-0014) |
| AC7 | **Every Standard ships a Guard**; a Standard with no Guard fails CI; a Guard with no blocking input fails CI | the Guard-corpus CI gate over the three Packs' Standards (§7.4); schema NOT NULL on `standards.guard_id` |
| AC8 | A Deliverable that contradicts a registry entry is blocked at authoring time; registries never hard-delete | `registry-consistency` Guard test; append-only assertion (no delete path) (ADR-0017) |
| AC9 | A cross-department request that names a department, or a contract no department provides, is refused cleanly — `contract_unavailable` / `contract_ambiguous`, never a silent fallback | Exchange refusal tests (§ F2, F4, F7) |
| AC10 | **Kernel neutrality** — no kernel crate contains a department identifier | CI grep over `sidra-departments`, `sidra-registry`, and every kernel crate; build fails on a hit (`02-layer-model.md` §1) |
| AC11 | Everything is additive — a Firm with zero installed Packs behaves as the M11 implicit single department; migrations 0011–0015 are forward-only and independently deployable | replay-equivalence against a zero-Pack Firm; per-migration fixture test |
| AC12 | `sidra-departments` and `sidra-registry` have no dependency edge to `sidra-orchestrator` or `sidra-mission` | dependency-direction check in CI (ADR-0011; §Appendix B) |

The exit criterion is AC1 + AC4 together: three departments installed from Packs, and one Exchange request end
to end. AC2, AC5, AC7, AC10 are the invariants that make the exit meaningful rather than a demo.

---

## Appendix A — Glossary additions

- **Department Pack** — a signed, versioned, installable Layer-3 artifact conforming to the fixed
  `department.toml` contract: manifest plus twelve directories (nine data, one code). The unit of modularity
  (ADR-0013).
- **Registrar** — the Layer-1 kernel service (`sidra-departments`) that loads Packs, resolves archetypes,
  instantiates and retires agents, enforces per-department budget sub-ceilings, and holds the org graph — the
  authoritative agent→department resolver M16 grants against.
- **Exchange** — the typed, budgeted, logged inter-department request mechanism (a Work Order + two fields),
  extending `sidra-orchestrator`. Requests name contracts, never departments.
- **Contract** — a capability contract (`capability.security-review`) a department `provides` or `requires`.
  The Registrar resolves a contract to a department at routing time; nothing else does.
- **Standard / Guard** — a path-scoped quality rule, and the declarative lifecycle validator that enforces it.
  Every Standard ships a Guard or it does not ship (ADR-0016).
- **Registry** — a department-owned, append-only, structured fact namespace with one owner per fact; a
  projection that feeds Canon by Principal-confirmed promotion (ADR-0017).
- **Archetype / Instance** — a charter template (data in the Pack) and a live agent the Registrar instantiates
  from it, with its own id, memory, and frozen charter version (ADR-0014).

## Appendix B — Repository placement and the crate decision

```
services/
├── departments/            NEW — crate sidra-departments (the Registrar)
│   ├── manifest            # parse & validate department.toml; the twelve install checks
│   ├── registry            # installed Packs; org graph; resolve_department / resolve_contract
│   ├── archetypes          # archetype loading; lazy instantiation; charter freeze; autoscale
│   ├── budget              # the fourth nested ceiling (ADR-0020) enforcement
│   └── conformance         # the three-department install + one-Exchange-request harness (exit criterion)
├── registry/               NEW — crate sidra-registry (Standards Engine + Registry Engine)
│   ├── standards           # resolve Firm>Application>Department; supply into the Turn frame
│   └── registries          # append-only fact namespaces; owner/referenced_by; promotion candidates
├── orchestrator/           EXTENDED — the Exchange module (department.request = Work Order + 2 fields)
└── security/               EXTENDED — the Guard Runner module (declarative/Wasm/kernel-native tiers)

services/store/migrations/  EXTENDED — 0011_department_packs.sql … 0015_registries.sql (forward-only)

agents/
└── departments/            NEW — the three CORE Packs (backend, cybersecurity, software-engineering) as fixtures

infrastructure/testing/
└── departments/            NEW — install-grants-nothing, contract-not-department, guard-corpus, isolation, quarantine
```

**The crate decision, justified.** `/docs-v2/01-enterprise-architecture.md` §3 names four new kernel services
and maps them: Registrar → `sidra-departments`, Exchange → `sidra-orchestrator` (extension), Standards Engine
→ `sidra-registry`, Guard Runner → `sidra-security` (extension), noting *"None of these replaces an existing
service. Each extends the boundary of one that already exists."* M13 follows that mapping and makes two of the
four **new crates** (`sidra-departments`, `sidra-registry`) and two **extensions** of existing crates. The
deciding constraint is the dependency rule (ADR-0011; GUIDE §3, task): a `department.request` **is** a Work
Order (`03-department-architecture.md` §5), and Work Order types live in `sidra-orchestrator`. If the Exchange
lived in `sidra-departments`, that crate would have to import `sidra-orchestrator`, inverting the direction
`orchestrator → services` and violating ADR-0011. So the Exchange lives where the Work Order lives, and it
calls *into* the Registrar to resolve contracts — `sidra-orchestrator → sidra-departments`, the correct
direction. Likewise the Guard Runner extends `sidra-security` because Guards block effects (the Broker's
neighbourhood), and it receives the resolved Standard set *through the Turn frame* rather than importing
`sidra-registry`, so `sidra-security` gains no new service edge.

**Dependency direction (ADR-0011), CI-enforced.** `packages/domain ← services/departments, services/registry ←
apps/*`. `sidra-departments` depends on `sidra-domain`, `sidra-store`, `sidra-security`, `sidra-plugins`;
`sidra-registry` depends on `sidra-domain`, `sidra-store`. Neither depends on `sidra-orchestrator` or
`sidra-mission`; the absence of that edge is a compile-time property checked in CI (AC12), exactly as the
Mission Engine and Connector Framework do it.

## Appendix C — Implementation position: why M13 gates M16

M13 is the third milestone of 2.0 "Concourse", after M11 (substrate) and M12 (structure), and before M14 (Game
Studio & Marketplace) and M15 (Mission Engine) (`/MILESTONE_REGISTRY.md` §4). It is also the milestone the
entire 2.5 "Field" release is built on top of: **M16 (Connector Framework) grants a connector to a department
and resolves the calling agent's department through the Registrar M13 ships** (M16 §9 step 1, §16.1). Building
M16 before M13 is the mistake ADR-0035 exists to prevent — *"a connector granted before departments exist
establishes a firm-wide permission, and a permission that already works is the change nobody makes later"*
(`/MILESTONE_REGISTRY.md` §5, dependency 2). Concretely: M16's exit-criterion isolation test (an agent in
department B cannot reach a connector granted to department A) is unprovable until `resolve_department` returns
a real department for a real installed Pack — which is AC5 of this milestone. **M13 must land, integrate, and
demonstrate its exit criterion before M16 is certifiable.**

**Exit criterion.** Three departments installed from Packs, and one Exchange request end to end — proven by
test, not by configuration (AC1 + AC4).
