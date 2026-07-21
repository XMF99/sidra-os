# Review of Version 1.0

Every one of the 55 v1 documents, assessed against the enterprise mission. Three verdicts:

- **KEEP** — correct as written at any scale. Not touched by v2.
- **EXTEND** — correct, but v2 adds a layer on top. The v1 document stays authoritative for what it covers.
- **SUPERSEDE** — v2 changes a specific claim. Requires an ADR. There are ten of these and they are listed
  in §4 with their ADRs.

The ratio matters: 38 KEEP, 17 EXTEND, 10 superseded claims across those 17. Nothing is discarded. That is
the intended result of v1 having been designed around invariants rather than around a user count.

## 1. Full assessment

### 00-vision

| Document | Verdict | Note |
|---|---|---|
| 01-vision.md | EXTEND | The vision text is about a Principal delegating to a Firm. That is still exactly true; the Firm is now larger. v2 adds the enterprise framing as a second section, not a rewrite. |
| 02-principles.md | KEEP | All ten principles survive unexamined at enterprise scale. Principle 1 (attention is scarcest) becomes *more* binding with twenty-one departments, not less. Four v2 principles are added below them, numbered 11–14, and they lose every conflict against 1–10 by construction. |
| 03-glossary.md | EXTEND | Additive only. New terms: Division, Office, Department, Department Pack, Role Archetype, Agent Instance, Standard, Guard, Registry, Exchange, Review Intensity, Seat. No existing term changes meaning. |

### 01-product

| Document | Verdict | Note |
|---|---|---|
| 01-prd.md | EXTEND | Every requirement ID (EX/ST/MEM/WF/MT/DE/AU/NO/LG/FM/UI/SE/PL) remains valid. v2 adds a `DP` (department) and `MK` (marketplace) family. Quality attributes hold, with one revision: idle memory ≤400 MB was specified for eleven agents; see §4.1. |
| 02-personas-and-jobs.md | EXTEND | The Principal persona is unchanged. v2 adds the *Operator* persona (a colleague with a Seat) as prepared-but-not-shipped, and the *Pack Author* persona. |
| 03-user-journeys.md | EXTEND | All existing journeys hold. Three new ones: installing a Department, cross-department Engagement, and shipping a game milestone. |

### 02-architecture

| Document | Verdict | Note |
|---|---|---|
| 01-technical-architecture.md | EXTEND | The crate boundaries are correct. Two new service crates: `sidra-departments` and `sidra-registry`. No existing crate changes responsibility. |
| 02-system-design.md | EXTEND | The Turn/Engagement flow is unchanged. v2 inserts a routing step (Directive → Division → Department) before staffing. |
| 03-folder-structure.md | EXTEND | The seven-directory layout (ADR-0011) absorbs v2 cleanly: departments are directories under `agents/departments/`. Vault structure unchanged. |
| 04-database-design.md | EXTEND | Additive columns and three new tables. No table is dropped, no column changes meaning, no event kind is removed. Detail in `04-migration/02-implementation-changes.md` §3. |
| 05-api-design.md | EXTEND | Existing commands unchanged. New command families: `department.*`, `pack.*`, `standard.*`, `registry.*`. |
| 06-ai-routing-strategy.md | EXTEND | Model Classes are unchanged and vindicated — CCGS independently arrived at the same three-tier split. v2 adds per-department budget sub-ceilings under the existing three. |
| 07-security-model.md | EXTEND | The capability model carries v2 without modification. v2 adds department-scoped capability namespaces and the Pack trust model. Effect classes unchanged. |
| 08-plugin-system.md | EXTEND | Department Packs are plugins with a richer manifest. The Wasmtime host (ADR-0006) needs no change. |
| 09-scalability.md | EXTEND | This document anticipated exactly this. Its "kernel is a library, not app logic" property is what makes v2 cheap. |

### 03-agents

| Document | Verdict | Note |
|---|---|---|
| 01-agent-architecture.md | EXTEND | The agent struct, the eight-phase Turn lifecycle, forbidden actions, and KPI pruning all hold. v2 adds the archetype/instance distinction above the struct. See §4.2. |
| 02-org-chart.md | SUPERSEDE (partial) | Four departments become eight divisions containing twenty-one departments. The eleven named agents survive as the Executive Cabinet and the Core department heads. See §4.3. |
| 03-employee-specs.md | KEEP | All eleven specifications remain valid and become the reference format for every Role Archetype. This document is the template v2 scales. |
| 04-ceo-protocol.md | EXTEND | The six phases are unchanged. Kai now routes to a Division head rather than directly to a specialist in most cases; the fast lane is unchanged and becomes *more* important. See §4.4. |
| 05-memory-architecture.md | EXTEND | The five layers are unchanged. v2 partitions Episodic/Semantic/Procedural by department namespace; Canon stays global and becomes the mechanism for cross-department truth. |
| 06-communication-protocol.md | EXTEND | The envelope and twelve message kinds are unchanged. Two additions require an ADR by the document's own rule: `department.request` and `standard.violation`. See ADR-0016. |

### 04-engines

| Document | Verdict | Note |
|---|---|---|
| 01-workflow-engine.md | KEEP | DAG compilation, durability, retry, compensation, and gates all work identically for a department workflow. |
| 02-meeting-engine.md | EXTEND | The seven meeting kinds hold. v2 adds cross-division meeting scoping and inherits CCGS's Review Intensity as a firm-wide setting. See ADR-0018. |
| 03-decision-engine.md | KEEP | Reversibility classes, criteria-first, dissent, and supersession are scale-independent. |
| 04-automation-engine.md | KEEP | Triggers, fences, dry-run-first, and self-retirement are unchanged. |
| 05-knowledge-base.md | EXTEND | The eight-stage pipeline is unchanged. v2 adds department-scoped ingestion routing and the Registry concept absorbed from CCGS. See ADR-0017. |
| 06-notification-system.md | KEEP | The urgency ladder holds. With twenty-one departments the "five things may interrupt" budget becomes the single most valuable constraint in the system, and it does not move. |
| 07-logging-observability.md | EXTEND | The audit chain is unchanged. v2 adds per-department cost attribution and dashboards. |
| 08-file-management.md | EXTEND | Vault principles unchanged. Artifacts gain a department segment in their path. |

### 05-experience

| Document | Verdict | Note |
|---|---|---|
| 01-ux-guidelines.md | KEEP | The ten laws hold. They are what stop twenty-one departments from becoming twenty-one dashboards nobody reads. |
| 02-design-system.md | EXTEND | Night Atrium is unchanged. Agent hues become Division hues. See §4.5. |
| 03-component-library.md | EXTEND | All 48 components hold. Four additions: DepartmentCard, DivisionBoard, PackInstaller, StandardsPanel. |
| 04-desktop-navigation.md | SUPERSEDE (partial) | The Rail cannot hold twenty-one rooms with ⌘1–⌘9. See §4.6. |
| 05-command-palette-and-search.md | EXTEND | Verb-first structure unchanged. Department becomes a scope filter in both. |
| 06-keyboard-shortcuts.md | EXTEND | The keymap holds. ⌘1–⌘9 rebind to Divisions rather than rooms. |
| 07-settings-and-preferences.md | EXTEND | All sections hold. New sections: Departments, Packs, Standards. |

### 06-implementation

| Document | Verdict | Note |
|---|---|---|
| 01-implementation-plan.md | EXTEND | M1–M10 are unchanged and still describe the path to 1.0. v2 adds M11–M14 after 1.0 ships. The sequencing principle (substrate before intelligence) is what makes this possible. |
| 02-testing-and-quality.md | EXTEND | The invariant list gains three department-scoped entries. Evaluation sets multiply per department. |
| 03-roadmap.md | SUPERSEDE (partial) | 2.0 "Field" becomes 2.0 "Concourse". Connectors move; multi-seat moves. See §4.7. |
| adr/0001–0011 | KEEP | All eleven stand. Two are load-bearing for v2 in ways they did not anticipate: ADR-0005 (Model Classes) and ADR-0010 (typed Work Orders). ADR-0004 (executive holds five tools) becomes *more* important, not less. |

## 2. What v1 got right that v2 depends on

Worth naming explicitly, because these are the reasons v2 is an extension rather than a rewrite:

1. **The event log as source of truth (ADR-0002).** Adding a department adds event kinds. It does not
   migrate state, because there is no state that is not derived.
2. **Typed Work Orders (ADR-0010).** Cross-department delegation needs a routable, budgeted, fenced,
   inspectable envelope. It already exists. v2 adds two fields.
3. **Model Classes over vendors (ADR-0005).** Twenty-one departments with different cost profiles all route
   through one table. CCGS independently converged on the same abstraction, which is corroboration.
4. **Capability-based default-deny.** Department isolation is expressible as capability namespacing rather
   than as a new mechanism.
5. **The kernel is a library (09-scalability).** Departments are loaded by the kernel, not by the app.
6. **Charters are data, not code (ADR-0011).** Twenty-one departments' worth of charters is a data problem.
7. **The executive holds five tools (ADR-0004).** At eleven agents this was prudent. At two hundred it is
   the only thing preventing the Executive from being the bottleneck and the blast radius simultaneously.

## 3. What was missing from v1

Genuinely absent, not merely unscaled:

| Gap | Why v1 did not need it | v2 answer |
|---|---|---|
| A unit of modularity above the agent | Eleven agents fit in one roster document | Department Pack (ADR-0013) |
| Span-of-control management | Kai supervised four heads | Divisions (ADR-0012) |
| Role reuse | Eleven hand-written charters was tractable | Role Archetypes (ADR-0014) |
| Path-scoped standards enforcement | One codebase, one implicit standard | Standards (ADR-0016) |
| Deterministic pre-effect validation | Effect classes gate *whether*, not *how well* | Guards (ADR-0016) |
| Cross-document fact registries | Canon covered it at eleven-agent scale | Registry namespaces (ADR-0017) |
| Adjustable review cost | ADR-0008 mandated review; it did not price it | Review Intensity (ADR-0018) |
| A distribution model | Nothing to distribute | Marketplace |
| Domain lifecycles | One generic Engagement lifecycle | Per-department Stage Models |
| Multi-human access | Single Principal, by design | Seats — prepared in v2, shipped in 3.0 |

Six of the ten answers are adapted directly from Claude-Code-Game-Studios, which had solved them for one
domain. That analysis is in `03-game-studio/01-repository-analysis.md`.

## 4. The ten superseded claims

Each one is a specific sentence in a v1 document, not a whole document.

**4.1 — Idle memory ≤400 MB** (`01-product/01-prd.md`). Specified against eleven resident agents. v2 keeps
the number by making instantiation lazy: an uninstantiated Role Archetype costs a manifest entry, not a
resident agent. The budget stands; ADR-0014 is what makes it stand.

**4.2 — "The Firm is eleven agents"** (`03-agents/01-agent-architecture.md` §1). The Firm is now a set of
Departments, each declaring Role Archetypes. Eleven becomes the size of the Executive Cabinet plus Core —
the part the Principal actually converses with. ADR-0014.

**4.3 — Four departments** (`03-agents/02-org-chart.md`). Becomes eight Divisions over twenty-one
Departments. The four original names (Technology, Product, Commercial, Operations) survive as Division names
with expanded membership. ADR-0012.

**4.4 — Autonomous delegation depth of 2** (`03-agents/04-ceo-protocol.md`, and the Autonomy setting in
`05-experience/07`). Becomes depth 3: Kai → Division head → Department head → specialist. The fast lane's
target rises from 50% to 65% to compensate for the added hop. ADR-0012.

**4.5 — Eleven agent hues** (`05-experience/02-design-system.md`). Becomes eight Division hues, with
departments distinguished by tint within their Division's hue. Twenty-one distinguishable hues at WCAG AA
against the Night Atrium surfaces do not exist; eight do.

**4.6 — Rail rooms bound to ⌘1–⌘9** (`05-experience/04-desktop-navigation.md`). The Rail now holds Divisions.
Departments are reached inside a Division room, via the palette, or as a pinned favourite. Nine bindings for
eight Divisions plus the Lobby is exactly right.

**4.7 — Roadmap 2.0 "Field"** (`06-implementation/03-roadmap.md`). Enterprise structure becomes 2.0
"Concourse"; connectors split across 2.0 and 2.5. Rationale in `04-migration/03-roadmap-changes.md`.

**4.8 — Twelve message kinds** (`03-agents/06-communication-protocol.md`). Fourteen. `department.request`
and `standard.violation` added under that document's own ADR rule. ADR-0016.

**4.9 — "Every setting has a default correct for a first-run Principal"** (`05-experience/07`, rule 1). Still
true, but a Department Pack ships its own defaults, so "correct default" becomes a per-Pack obligation that
the Pack contract enforces. Extended rather than weakened.

**4.10 — Three nested budget ceilings** (`02-architecture/06-ai-routing-strategy.md` §6). Four: turn,
engagement, **department**, month. The department ceiling is inserted, not substituted; the other three keep
their semantics and defaults exactly.

Everything else in the 55 documents stands as written.
