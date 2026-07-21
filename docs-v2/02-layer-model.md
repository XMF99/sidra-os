# The Layer Model

Eight layers. Each has a strict rule: **a layer may depend only on layers above it, and may be replaced
without changing any layer above it.** This is the dependency-direction rule from ADR-0011 applied to the
organisation rather than to the repository.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 1  CORE PLATFORM        the kernel — knows nothing about departments     │
├──────────────────────────────────────────────────────────────────────────┤
│ 2  EXECUTIVE LAYER      Kai, 8 Division executives, 4 Offices            │
├──────────────────────────────────────────────────────────────────────────┤
│ 3  DEPARTMENTS          21 isolated Packs                               │
├──────────────────────────────────────────────────────────────────────────┤
│ 4  SPECIALISTS          Agent Instances from Role Archetypes             │
├──────────────────────────────────────────────────────────────────────────┤
│ 5  APPLICATIONS         what the Firm builds and operates for Sidra      │
├──────────────────────────────────────────────────────────────────────────┤
│ 6  INTEGRATIONS         connectors to the outside world                  │
├──────────────────────────────────────────────────────────────────────────┤
│ 7  PLUGINS              Wasm extensions (ADR-0006)                       │
├──────────────────────────────────────────────────────────────────────────┤
│ 8  MARKETPLACE          discovery, distribution, trust                   │
└──────────────────────────────────────────────────────────────────────────┘
```

## 1. Core Platform

Everything in `/docs/02-architecture`, plus the four services in `01-enterprise-architecture.md` §3.

**The defining constraint: the kernel contains no department-specific logic.** No `if department ==
"game-studio"`. No hardcoded list of twenty-one names. The kernel knows what a Department *is* (a manifest
conforming to the Pack contract) and nothing about which ones exist. Verified by a CI check that greps the
kernel crates for any department identifier and fails the build on a hit.

This is the property that makes layers 3–8 replaceable, and it is inherited directly from v1's decision to
keep the kernel a library rather than app logic.

**Owns:** event log, store, memory, model gateway, permission broker, orchestrator, workflow/meeting/decision/
automation/knowledge/notification engines, plugin host, registrar, exchange, standards engine, guard runner.

**Changes when:** an invariant changes. Roughly never after 1.0.

## 2. Executive Layer

Kai plus eight Division executives plus four Offices. Specified in `02-organization/03-executive-cabinet.md`.

**Owns:** interpretation of Directives, routing, cross-division arbitration, budget allocation to Divisions,
synthesis into the single Brief, and the four vetoes.

**Constraint:** the Executive Layer performs no domain work. ADR-0004's five-tool rule extends to every
Division executive: retrieve, delegate, convene, decide, report. A Division executive that writes code, edits
a design, or calls an external API has become a specialist and the Division has lost its purpose.

**Changes when:** the Firm's shape changes — a new Division, a new Office. Rare, and always a Decision under
Principle 14.

## 3. Departments

Twenty-one specified in `04-department-catalog.md`; a given Firm installs a subset (Principle 13).

**Owns:** a domain. Its agents, memory namespace, playbooks, standards, guards, registries, tools,
dashboards, KPIs, stage model, and defaults.

**Constraint:** a Department may not reference another Department's internals. Cross-department work goes
through the Exchange as a typed `department.request`. A Pack whose manifest names another department as a
hard dependency is rejected at install; soft capability requirements are declared instead ("requires a
department providing `capability.code-review`"), which the Registrar resolves.

**Changes when:** the domain changes, or the Firm specialises. Frequently — this is the layer designed to
absorb change.

## 4. Specialists

Agent Instances. Everything in `/docs/03-agents/01-agent-architecture.md` applies unchanged.

**Owns:** doing the work. A Turn, its tool calls, its Deliverable.

**Constraint:** an Agent Instance exists only inside exactly one Department and inherits that Department's
capability grant as its ceiling. It cannot be promoted, borrowed, or shared. If two departments need the same
skill, the archetype is installed in both and the instances are separate, with separate memory — because a
shared instance would be a hole in the isolation boundary and its memory would leak context across it.

**Changes when:** load changes. Continuously — instances are created and retired by the Registrar without
ceremony.

## 5. Applications

The layer that makes this a *company's* operating system rather than a company simulation: the actual
software Sidra Systems builds, ships, and runs. A desktop product, a web platform, a mobile app, an ERP
deployment, an infrastructure estate, a game title.

An Application is a first-class record: identity, owning department(s), stage, repositories, environments,
standards profile, registries, dashboards, budget, and its own Engagement history. Multiple departments work
on one Application; one department works on many.

**Why this is a layer and not a folder.** Without it, "Backend" and "Frontend" and "QA" have no shared object
to coordinate around, and the Firm's memory fragments by department instead of consolidating by product —
which is the failure mode where the Backend department knows things about a product that the Frontend
department cannot retrieve. The Application is the join key. It is also the natural scope for a Registry
(ADR-0017): entity names, architectural stances, and interface contracts belong to an Application, not to a
department.

**Owns:** cross-department context. **Constraint:** an Application never contains logic; it is a record and a
scope. **Changes when:** the company's portfolio changes.

## 6. Integrations

Connectors: source control, issue trackers, cloud providers, CI, calendars, mail, payment processors, app
stores, engines' asset services.

**Constraint:** every Integration is capability-gated and egress-inspected exactly as v1 specifies. Reads
are class-1; writes are class-2 and require approval by default; anything irreversible is class-3 and always
asks (v1 security model, unchanged). An Integration is granted to specific Departments, never to the Firm —
Marketing does not hold the production cloud credential because Marketing is not the department that has any
use for it.

**Changes when:** the company adopts or drops a tool. Often.

## 7. Plugins

The Wasm layer from ADR-0006, unchanged. Four extension points: tools, ingestors, panels, playbooks.

v2 adds a fifth: **Guards**. A Guard is a declarative rule plus optional Wasm validator, running at a
lifecycle point. This is where CCGS's twelve shell hooks land — as declarative Guards with a portable
validator, rather than as `bash` scripts, which cannot run inside the sandbox and would be an ambient-
authority hole if they could. Discussed honestly in `03-game-studio/03-integration-plan.md` §5.

**Constraint:** unchanged from v1 — deny-by-default, explicit capability grants, fuel metering, no ambient
filesystem/clock/network/randomness.

## 8. Marketplace

Discovery and distribution for Packs, Plugins, and Integrations. Specified in `05-marketplace-and-packs.md`.

**Constraint that defines the layer:** the Marketplace can deliver an artifact and can prove who signed it.
It can never confer autonomy. Installing a Department Pack grants nothing; the Principal grants capabilities
in a separate, explicit, logged act, and the Pack's requested capability list is shown in plain language
before that act. This is v1's plugin trust model, extended to a larger artifact and stated as a layer rule so
it cannot erode.

## 9. The rule, restated as a test

For each layer, ask: *could I replace this layer entirely and leave every layer above it untouched?*

| Layer | Replaceable? | Test |
|---|---|---|
| 1 Core Platform | No — it is the bottom | — |
| 2 Executive | Yes | Swap all eight Division charters; departments unaffected |
| 3 Departments | Yes | Uninstall all twenty-one; kernel and executive still run, Firm does nothing |
| 4 Specialists | Yes | Retire every instance; archetypes remain; Firm re-instantiates on demand |
| 5 Applications | Yes | Delete every Application record; departments still function, context is poorer |
| 6 Integrations | Yes | Disconnect everything; local work continues (v1 offline behaviour) |
| 7 Plugins | Yes | Uninstall all; first-party capability unaffected |
| 8 Marketplace | Yes | Go fully offline; installed Packs keep working, nothing new arrives |

Every row must stay a "yes". A change that turns one into a "no" is an architectural regression and needs an
ADR arguing why the coupling is worth it.
