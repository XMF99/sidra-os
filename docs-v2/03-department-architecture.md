# Department Architecture

What a Department *is*, mechanically. Principle 11 says a department is a boundary, not a label; this
document is that boundary written down.

## 1. The Department Pack

A Department is not a folder of prompts. It is a signed, versioned, installable artifact — a **Pack** —
conforming to a fixed contract. Same trust model as a v1 plugin (ADR-0006), larger manifest.

```
departments/backend/
├── department.toml              # the manifest — the whole contract in one file
├── roles/                       # Role Archetypes (charters), one file each
│   ├── head.toml
│   ├── api-engineer.toml
│   ├── data-modeler.toml
│   └── integration-engineer.toml
├── playbooks/                   # department workflows (v1 Workflow DAGs)
│   ├── design-endpoint.yaml
│   ├── schema-change.yaml
│   └── incident-triage.yaml
├── standards/                   # path- and artifact-scoped rules
│   ├── api-design.md
│   ├── data-access.md
│   └── error-handling.md
├── guards/                      # declarative lifecycle validators
│   ├── pre-effect.toml
│   └── pre-deliverable.toml
├── registries/                  # append-only fact namespaces owned by this department
│   ├── endpoints.yaml
│   └── data-contracts.yaml
├── templates/                   # document templates the department authors into
├── dashboards/                  # panel definitions for the department room
├── stage-model.yaml             # lifecycle phases and gates
├── evals/                       # evaluation sets gating charter changes
└── tools/                       # optional Wasm components (ADR-0006)
```

Nine of these twelve directories are **data**. Only `tools/` contains executable code, and it runs in the
existing Wasm sandbox with no new mechanism. This is deliberate: a department should be reviewable by
reading it.

## 2. The manifest

`department.toml` is the contract. Everything the kernel needs to load, isolate, budget, and audit a
department is here, and nothing else is trusted.

```toml
[department]
id            = "backend"
name          = "Backend"
division      = "engineering"
version       = "1.4.0"
sidra_api     = "^2.0"                    # kernel compatibility range
description   = "Server-side systems, APIs, data access, service architecture."

[capabilities]
# what this department may do — the ceiling for every agent inside it
required = ["vault:read", "vault:write:artifacts", "registry:backend:*", "tool:code-analysis"]
optional = ["integration:git:read", "integration:issues:write"]
forbidden = ["integration:cloud:write"]   # explicit self-denial, permanent

[provides]
# capability contracts other departments may request through the Exchange
contracts = ["capability.api-design", "capability.schema-review", "capability.data-contract"]

[requires]
# soft requirements resolved by the Registrar — never a named department
contracts = ["capability.code-review", "capability.security-review"]

[memory]
namespace     = "dept.backend"
canon_access  = "read"                     # departments never write Canon directly
retention     = "18mo"

[budget]
share         = 0.15                       # of the Division's allocation
ceiling_hard  = "$25/mo"

[roles]
head          = "roles/head.toml"
archetypes    = ["roles/api-engineer.toml", "roles/data-modeler.toml", "roles/integration-engineer.toml"]
autoscale     = { min = 0, max = 4, queue_target = 3 }

[review]
office_quality      = "required"
office_security     = "on_effect_class_2+"
office_architecture = "on_contract_change"

[fs]
write_scope   = ["Artifacts/backend/**"]
read_scope    = ["Artifacts/**", "Sources/**"]

[signature]
publisher     = "sidra-systems"
```

**Manifest rules.** `requires.contracts` may never name a department — only a capability contract, resolved
at install by the Registrar. This is what makes a department replaceable: swapping the department that
provides `capability.code-review` breaks nothing. `capabilities.forbidden` is a permanent self-denial that
survives every future grant; a Pack update that removes an entry from it is treated as a new Pack requiring
fresh approval, because otherwise the field is worthless.

## 3. Role Archetypes

An archetype is a v1 employee specification (`/docs/03-agents/03-employee-specs.md`) turned into a template.
The ten sections of that document are the required sections here, unchanged:

| Section | Note at v2 |
|---|---|
| Role | One sentence. |
| Responsibilities | Bounded by the department's contracts. |
| Personality | Register, not theatre. Inherits the Firm register setting. |
| Memory | Scope within the department namespace; what this role reads and writes. |
| Goals | Tied to department KPIs. |
| Daily routine | May be empty; not every role has one. |
| Knowledge | Which registries, standards, and Canon areas this role loads. |
| KPIs | Drives autoscale and pruning. |
| Communication rules | Which message kinds this role may originate. |
| Decision boundaries | CAN / ESCALATE / NEVER, exactly as v1. |

Plus four v2 fields:

```toml
model_class     = "worker"                 # v1 Model Class, ADR-0005
capabilities    = ["vault:read", "tool:code-analysis"]   # subset of the department's grant
standards       = ["standards/api-design.md", "standards/error-handling.md"]
instantiation   = "on_demand"              # eager | on_demand | scheduled
```

**Archetype ≠ Agent.** The archetype is data in the Pack. The Agent Instance is created by the Registrar
with its own ID (`agent.backend.api-engineer.01`), its own memory, and its own KPI history. Retiring an
instance does not remove the archetype; removing the archetype does not delete a retired instance's history,
because history is in the event log (ADR-0002). ADR-0014.

## 4. Isolation, enforced

Restating `01-enterprise-architecture.md` §5 as the checklist an install must satisfy:

1. **Memory namespace.** All writes go to `dept.<id>.*`. Reads outside require an explicit grant recorded in
   the manifest. Canon is readable by all, writable by none — Canon promotion goes through Kai and the
   Principal, as in v1.
2. **Capability ceiling.** Every agent's grant is a subset of the department's, which is a subset of what the
   Principal approved. Three nested subsets, checked at issue time by the Permission Broker.
3. **Budget sub-ceiling.** The fourth nested ceiling. Exhaustion pauses the department and raises one
   Approval Request; it does not stop the Firm and it does not silently degrade the model class.
4. **Filesystem scope.** Writes confined to `Artifacts/<dept>/**`. A Deliverable that must land elsewhere is
   moved by the orchestrator after review, not written across the boundary by the agent.
5. **No direct invocation.** A department cannot spawn an agent in another department, read its working
   memory, or call its tools. Only `department.request` through the Exchange.
6. **Standards precedence.** Firm Standards (set by Offices) > Application Standards > Department Standards.
   A department may tighten but never relax an inherited Standard. Conflicts resolve by that order and are
   surfaced at install, not at runtime.
7. **Quarantine.** A department failing Guards repeatedly, exceeding budget, or crashing is quarantined:
   its in-flight Work Orders are suspended (durable, resumable — v1 ADR-0010), its queue stops, and the
   Principal gets one notification. Neighbouring departments are unaffected.

## 5. The Exchange

Cross-department work is a first-class, typed, budgeted, logged request. It is a Work Order with two extra
fields, not a new mechanism — which is why v1's ADR-0010 does most of the work here.

```
department.request
  from_department    backend
  to_contract        capability.security-review     # a contract, never a department name
  resolved_to        cybersecurity                  # filled by the Registrar at routing time
  objective          "Review the token refresh flow for replay exposure."
  inputs             [artifact refs, read-scoped]
  acceptance         [criteria the requester will check against]
  budget             $2.00                          # charged to the REQUESTER's department
  effect_ceiling     1
  deadline           …
  reviewer           (resolved by the answering department's own rules)
```

**Rules.**
- **Cost follows the requester.** Backend asking Cybersecurity for a review spends Backend's budget. Without
  this, a popular department is punished for being useful and the budget signal inverts.
- **Requests name contracts, not departments.** The Registrar resolves. If no installed department provides
  the contract, the request fails cleanly with `contract_unavailable` and Kai surfaces it — it does not
  silently fall back to a general-purpose agent, because a silent fallback is how quality claims become
  false.
- **Depth limit of 2.** A department may answer a request by making one further request. Beyond that it must
  escalate to its Division. Prevents an unbounded chain that no single agent can see the shape of.
- **Cycles are refused at compile time.** The Exchange builds the request graph per Engagement; a cycle is a
  routing error surfaced immediately, mirroring the workflow engine's DAG validation.
- **Read scope is granted per request**, for the named inputs only, and expires when the request closes.

## 6. Dashboards and the department room

Every department owns one room in the shell (reached inside its Division room, not from the Rail — see the
v1 review §4.6). The room follows v1's standard anatomy: Sidebar, Stage, Inspector.

A department dashboard declares panels from a fixed set — the shell will not render arbitrary department
markup, because twenty-one departments authoring their own layouts is how a coherent product becomes
twenty-one products:

`QueueDepth` · `ActiveEngagements` · `DeliverableFeed` · `KPIStrip` · `CostMeter` · `StandardsCompliance` ·
`RegistryHealth` · `StageProgress` · `GuardViolations` · `RosterStrip`

Panels are declarative (`dashboards/*.toml`), use Night Atrium tokens only, and cannot introduce colour,
type, or spacing outside the token contract. A Pack that ships a panel violating the token contract fails
install validation.

## 7. Lifecycle of a department

| Phase | What happens | Who approves |
|---|---|---|
| **Proposed** | A Decision is recorded: what recurring work, what evidence, what it would absorb, reversibility class 2 | Principal |
| **Installed** | Pack signature verified, manifest validated, contracts resolved, capabilities *requested* but not granted | Principal |
| **Granted** | Capabilities granted in a separate explicit act with the plain-language list shown | Principal |
| **Staffed** | Head instantiated; other archetypes instantiate on demand | Registrar |
| **Operating** | KPIs accrue, autoscale within manifest bounds | Registrar |
| **Reviewed** | Quarterly: is this department earning its overhead? (Principle 13) | Division + Principal |
| **Quarantined** | Automatic on repeated Guard failure, budget breach, or crash | Registrar |
| **Retired** | Instances retired, Pack disabled, memory namespace preserved read-only, history intact | Principal |

Retirement never deletes. The namespace becomes read-only and retrievable, because a retired department's
memory is exactly what the Firm needs when the work comes back. Principle 3.

## 8. Validation at install

A Pack must pass before it is installable. These checks are mechanical and run in the kernel:

1. Manifest schema valid; `sidra_api` range satisfied.
2. Signature verified against a trusted publisher, or developer mode explicitly enabled (v1 rules).
3. No `requires.contracts` entry names a department.
4. Every role's `capabilities` is a subset of `capabilities.required ∪ optional`.
5. Every role's `standards` paths resolve inside the Pack.
6. Every playbook compiles as a valid DAG (v1 workflow engine validation, reused unchanged).
7. Every Guard parses and declares a lifecycle point from the known set.
8. Every registry declares an owner field and append-only semantics.
9. Dashboards reference only known panel types and only token-contract styles.
10. `evals/` is non-empty — a Pack with no evaluation set cannot gate its own charter changes, and a charter
    that cannot be gated is a charter that will drift.
11. Budget share, when summed across the Division's installed departments, does not exceed 1.0.
12. No file in the Pack exceeds the declared size budget, and `tools/` components declare their fuel limits.

Failing any check is a hard refusal with the failing rule named. There is no "install anyway" — a department
is a trust boundary, and a trust boundary you can override on a warning is decoration.
