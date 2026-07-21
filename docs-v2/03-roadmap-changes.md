# Roadmap Changes

Extends `/docs/06-implementation/03-roadmap.md`. That document's framing rule is retained without amendment:
**a release is defined by what the Principal can stop doing themselves, not by a feature list.**

Its closing rule is also retained: version boundaries move, the ordering does not, and anything proposed out
of order needs an ADR arguing why the dependency is not real. This document moves boundaries and argues one
ordering change.

## 1. Summary of changes

| v1 roadmap | v2 roadmap | Change |
|---|---|---|
| 1.0 "Atrium" | 1.0 "Atrium" | **Unchanged.** |
| 2.0 "Field" — connectors, Companion, voice | **2.0 "Concourse" — the Firm becomes a company** | Renamed and re-scoped |
| — | **2.5 "Field" — connectors and Companion** | v1's 2.0, moved and mostly intact |
| 3.0 "Chambers" — multi-Principal, hosted | 3.0 "Chambers" | Unchanged in content; arrives on a firmer base |
| 4.0 "Continuum" — self-improvement | 4.0 "Continuum" | Unchanged |

One release is inserted. Nothing is cut.

## 2. 2.0 — "Concourse" · the Firm becomes a company

**The promise:** you delegate work in any discipline your company practises, and it reaches people — agents —
who are actually specialists in it, inside boundaries you can inspect.

- **Divisions, Departments, Offices.** The organisational structure: eight Divisions, up to twenty-one
  Departments, four cross-cutting Offices with real vetoes.
- **Department Packs.** Isolated, versioned, installable capability. Own agents, memory namespace, playbooks,
  standards, guards, registries, dashboards, KPIs.
- **Role Archetypes and lazy instantiation.** Roles declared as data; agents created on demand.
- **Standards and Guards.** Path-scoped rules that constrain how work is done, and validators that enforce
  them at defined lifecycle points.
- **Registries.** Department-owned, append-only fact namespaces with a named owner per fact, feeding Canon.
- **The Exchange.** Typed, budgeted, logged cross-department requests.
- **Applications.** The join key between departments working on the same product.
- **Game Studio Department.** Founded on Claude-Code-Game-Studios: 49 archetypes, 73 playbooks, 11 standards,
  12 guards, 2 registries, a seven-stage lifecycle.
- **Marketplace mechanism** with a local publisher and an empty public catalogue.
- **Review Intensity** as a firm-wide setting.

**Explicitly not in 2.0:** connectors, Companion, voice, multi-Principal, hosted kernel, public catalogue.

**Success looks like:** the Principal delegates work in a discipline no v1 agent could have handled, and the
resulting Brief is indistinguishable in shape from a v1 Brief. Seven departments installed, not twenty-one.
The department-count-to-Brief-length ratio stays flat, which is the measurable form of Principle 1.

## 3. Why "Concourse" comes before "Field"

This is the one ordering change, and the v1 roadmap requires it to be argued rather than asserted.

**The v1 dependency claim** was: connectors before multi-user, because shared context is worthless without
external data. That claim is untouched — connectors still precede 3.0.

**The v2 claim** is that enterprise structure precedes connectors, for three reasons:

1. **A connector is granted to a department, not to a Firm.** Without departments, every connector's grant is
   firm-wide, which means the Marketing agent holds the production cloud credential because there is nowhere
   narrower to put it. Shipping connectors first would establish a permissions model that departments would
   then have to unwind — and unwinding a permission that already works is the change nobody makes.
2. **Connector volume is what makes isolation load-bearing.** One Firm reading five sources is manageable
   without boundaries. Twenty-one departments reading fifty sources without boundaries is a Firm where any
   agent can read anything, which is the failure mode the capability model exists to prevent.
3. **The company mission is the actual requirement.** Sidra OS's purpose changed between v1 and v2: it is now
   the internal operating system of a technology company. Connectors make an eleven-agent Firm more useful;
   departments make it able to do the work at all.

**What this costs:** connectors slip by roughly one release. That is a real cost to a real user need, and it
is accepted because the alternative is establishing a permissions model that has to be broken later.

## 4. 2.5 — "Field" · the Firm reaches outside the building

v1's 2.0, moved intact, with department-scoping added:

- **Connectors as first-class plugins** with kernel-handled OAuth. **Granted per department**, never
  firm-wide — the change §3 makes possible.
- **Companion (mobile, read + approve).** Unchanged in intent. The Brief and Approval Request formats are
  unchanged by v2, so the Companion's design is unaffected by everything in this document set.
- **Scheduled and event-driven engagement at scale**, now with department-scoped triggers.
- **Agent-authored artifacts that execute** in the Wasm sandbox.
- **Voice Directive**, local speech-to-text.

Only the connector grant model changes. Everything else is v1's text.

## 5. 3.0 — "Chambers" and the Seat concept

Content unchanged. One preparation moves earlier.

v2 **defines** the Seat — a human identity with its own Fences, budget, and working memory — and ships
exactly one. The concept exists in the schema, the org graph, and the audit chain from 2.0, and multi-Seat
behaviour ships in 3.0.

This is deliberate under-delivery: Sidra Systems is a company and will want colleagues in the system before
3.0. Defining Seats early without shipping them means the eventual multi-Seat release does not require a
schema change to the audit chain, which is the part that would otherwise be genuinely hard, because a hash
chain that has to be rewritten to add an actor field is a hash chain that has lost its point.

**Also strengthened by v2:** 3.0's "Firm templates" — an exportable org chart, charter set, and Canon — is
substantially the Department Pack and Marketplace mechanism from 2.0, generalised to a whole Firm. That
feature gets cheaper because of this release.

## 6. 4.0 — "Continuum"

Unchanged, with three items becoming more meaningful:

- **Charter evolution** now operates on Role Archetypes, so an improvement propagates to every instance in
  every Firm running that Pack. The blast radius is larger, which raises the bar on the evaluation gate
  rather than lowering it.
- **Procedural memory that compiles** now has department-scoped procedural memory to learn from, which is a
  cleaner signal than one undifferentiated pool.
- **Firm review** now includes department health — the quarterly Principle 13 review, run by the Firm on
  itself. Which departments earned their overhead, which should merge, which should retire.

## 7. Unchanged: what we will not build

The v1 list stands in full, and one item deserves explicit re-affirmation because v2 introduces a Marketplace:

> **"An agent marketplace with unvetted autonomy."** Plugins extend capability under explicit grants; they
> never arrive with autonomy the Principal did not deliberately confer.

The v2 Marketplace conforms. Installation grants nothing; capabilities are granted in a separate, explicit,
plain-language act (`01-enterprise/05-marketplace-and-packs.md` §2). If any future proposal would let a Pack
arrive with authority attached, it contradicts this line in the v1 roadmap and needs to argue with it
directly rather than around it.

The other four also stand without qualification: no chatbot mode, no telemetry, no autonomous financial
transactions, no engagement mechanics. Twenty-one departments do not change any of them, and the Finance
department's effect ceiling of 1 is the third one written into a manifest rather than a promise.
