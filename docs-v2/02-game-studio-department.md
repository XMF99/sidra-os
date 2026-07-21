# The Game Studio Department

`dept.game-development` · Game Studio Division · head: **Lyra** (`agent.studio`)

The Game Studio is the largest and most specified department in the catalogue, because it inherits a complete
implementation rather than a specification. It is also the proof that the Department Pack contract is real:
if a department this idiosyncratic — seven lifecycle stages, forty-nine roles, three target engines, its own
review culture — fits inside the contract without special-casing the kernel, the contract holds.

## 1. Mission and boundary

**Owns:** the design, production, and release of game titles. Concept through post-launch.

**Does not own:** general software engineering (Engineering Division), cloud and infrastructure (Platform),
security review (Security), store-account administration (Mobile department for store mechanics; Corporate
for the business relationship), or marketing (Commercial).

The boundary is drawn where the *discipline* changes, not where the technology changes. Game code is code,
but game design is not product design, and a level designer's craft has no analogue in the Backend
department. Where the discipline is shared — a build pipeline, a security review, a store submission — the
Game Studio requests a contract through the Exchange rather than duplicating the capability.

| Provides | Requires |
|---|---|
| `capability.game-design` | `capability.code-review` (Software Engineering) |
| `capability.game-implementation` | `capability.security-review` (Cybersecurity) |
| `capability.playtest` | `capability.store-release` (Mobile) |
| `capability.narrative-design` | `capability.deploy` (Infrastructure) |
| `capability.technical-art` | `capability.cost-analysis` (Cloud, for live titles) |

## 2. Structure

Four tiers inside the department, mapped from CCGS's three plus the engine set.

```
                         Lyra — Studio Head (Division executive)
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
  creative-director            technical-director                  producer          ← Directors (3)
  vision, pillars, tone        architecture, engine, perf          schedule, risk       reasoner
        │                               │                               │
        └───────────────┬───────────────┴───────────────┬───────────────┘
                        │                               │
  ┌─────────┬───────────┼───────────┬─────────┬─────────┼─────────┐
  game-     lead-       art-        audio-    narrative- qa-      release-  localization-  ← Leads (8)
  designer  programmer  director    director  director   lead     manager   lead              worker
       │         │           │          │         │        │
       ▼         ▼           ▼          ▼         ▼        ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ 24 specialists — systems / level / economy design,           │  ← Specialists
  │ gameplay / engine / AI / network / tools / UI programming,   │    worker + fast
  │ technical art, sound, writing, world-building, QA, perf,     │
  │ devops, analytics, UX, prototyping, security, accessibility, │
  │ live-ops, community                                          │
  ├──────────────────────────────────────────────────────────────┤
  │ 14 engine specialists — Godot (5) · Unity (5) · Unreal (4)   │  ← Engine set
  │ only the set matching the title's engine is instantiated     │    worker
  └──────────────────────────────────────────────────────────────┘
```

**Instantiation is where this stays affordable.** Forty-nine archetypes; typically four to eight live
instances. The three directors are `eager`. Leads are `on_demand`. Specialists are `on_demand` with an idle
retirement. The engine set is filtered at install by the title's declared engine — choosing Godot means the
nine Unity and Unreal archetypes are never instantiated and never enter a context frame. ADR-0014 is what
turns a forty-nine-agent studio into a memory footprint that respects the v1 PRD.

## 3. Model class assignment

CCGS's tiering maps onto v1 Model Classes (ADR-0005) with no adjustment:

| Tier | CCGS model | Sidra Model Class | Rationale |
|---|---|---|---|
| Directors | Opus | `reasoner` | Multi-document synthesis, gate verdicts, cross-system review |
| Leads | Sonnet | `worker` | Authoring, implementation, single-domain analysis |
| Specialists | Sonnet | `worker` | Same |
| QA tester, DevOps, accessibility, community | Haiku | `fast` | Read-and-format, checklists, status |
| Engine specialists | Sonnet | `worker` | |

Routing is unchanged: the department declares the class, the gateway picks the vendor, and the Principal can
rebind any class to any provider or to a local model without touching the department.

## 4. Stage model

Seven stages, adopted from CCGS. Declared in `stage-model.yaml`.

```
Concept ──▶ Systems Design ──▶ Technical Setup ──▶ Pre-Production ──▶ Production ──▶ Polish ──▶ Release
   │              │                   │                  │                │            │          │
 pillars       GDDs per          engine pinned,      vertical slice   epics/stories  perf +    cert +
 concept doc   system, entity    ADRs, arch          validated,       shipping,      playtest  launch
               registry seeded   registry seeded     prototypes       registries     bug burn   checklist
                                                                      maintained     down
```

**Stage advancement is evidence-based.** Adopted directly from CCGS's `workflow-catalog.yaml`: each step
declares an artifact check — a path glob plus an optional content pattern. A stage advances when its required
artifacts exist and satisfy their patterns, not when someone says it is done. This is v1's Principle 3
("nothing important is ephemeral") applied to progress itself, and it is more rigorous than v1's generic
Engagement lifecycle.

**Gate verdicts:** PASS / CONCERNS / FAIL, produced by the relevant directors. Department stage gates are
**advisory** — Lyra and the Principal may proceed past a CONCERNS with the concern recorded as a Decision.
Office vetoes are **binding** and are a different mechanism entirely. Keeping both, and keeping them clearly
distinct, is the change described in the analysis §7.

## 5. Standards

Eleven, adopted from CCGS's path-scoped rules, with paths rewritten to the Sidra Artifact tree:

| Standard | Scope | Representative rule |
|---|---|---|
| `gameplay-code` | `**/gameplay/**` | All gameplay values from external config; delta time for all time-dependent maths; no direct UI references |
| `engine-code` | `**/engine/**` | Engine-idiomatic patterns; no gameplay logic in engine layer |
| `ai-code` | `**/ai/**` | Explicit state machines with documented transition tables |
| `ui-code` | `**/ui/**` | Data binding over direct mutation; accessibility floor |
| `network-code` | `**/net/**` | Authority model declared; no trust in client input |
| `shader-code` | `**/shaders/**` | Platform-tier budgets declared |
| `prototype-code` | `**/prototypes/**` | Explicitly exempt from production standards, and explicitly non-shippable |
| `data-files` | `**/data/**` | Schema-validated; no magic numbers |
| `design-docs` | `Artifacts/game/design/**` | Required sections: Overview, Player Fantasy, Detailed Design, Formulas, Edge Cases, Dependencies, Tuning Knobs, Acceptance Criteria |
| `narrative` | `Artifacts/game/narrative/**` | Canon consistency; registry check before naming anything |
| `test-standards` | `**/tests/**` | Logic separated from presentation; coverage floor per system |

The `prototype-code` exemption is worth noting as a design lesson: a standards system without an explicit
escape hatch gets one anyway, informally and invisibly. CCGS made the exemption a named, path-scoped,
non-shippable category. v2 adopts that pattern generally.

**Inheritance:** Firm Standards > Application Standards > Department Standards. The Game Studio may tighten
any inherited Standard and may never relax one. `prototype-code` is not a relaxation of a Firm Standard; it
is a department Standard covering a path that Firm Standards scope out.

## 6. Guards

Twelve, mapped from CCGS hooks. Declarative specifications; portable validators where logic is needed.
Mechanism and honest limitations in `03-integration-plan.md` §5.

| Guard | Lifecycle point | Action |
|---|---|---|
| `engagement-context` | engagement start | Load stage, review mode, active title |
| `gap-detect` | engagement start | Report missing required artifacts for the current stage — warn |
| `design-doc-sections` | pre-deliverable | Block a GDD missing a required section |
| `registry-consistency` | pre-deliverable | Block a named entity contradicting the entity registry |
| `asset-naming` | pre-effect | Block asset writes violating naming conventions |
| `asset-budget` | pre-effect | Warn when an asset exceeds its platform budget |
| `data-values-external` | pre-deliverable | Block gameplay code with hardcoded values |
| `test-presence` | pre-deliverable | Warn when a gameplay system arrives without tests |
| `stage-artifact-check` | on gate | Evaluate stage advancement evidence |
| `turn-audit` | post-turn | Record agent, playbook, cost, artifacts (v1 audit chain — kept as a Guard for parity, though the chain records it regardless) |
| `frame-preserve` | pre-compaction | Preserve stage, registry deltas, and open decisions across context compaction |
| `deliverable-provenance` | pre-deliverable | Block a Deliverable that does not name the design document it implements |

## 7. Registries

Two, adopted directly with their semantics intact (ADR-0017).

**`entities`** — every named game-world fact appearing in more than one document: entities, items, factions,
locations, formulas, currencies. Each has a `source` (the owning design document), `referenced_by`, a
`status`, and a `revised` date.

**`architecture`** — every architectural stance constraining other systems: state ownership, signal
contracts, performance budgets per system, forbidden patterns. Each names the owning ADR.

Rules, unchanged from CCGS: register only what crosses a boundary; never delete, deprecate; one owner per
fact; update sets `revised` and records the prior value.

The registries are read before authoring and written after approval. A design document that names an entity
already owned by another document, with a different value, is blocked by the `registry-consistency` Guard
before it becomes a contradiction someone discovers three months later.

## 8. Playbooks

Seventy-three, mapped one-to-one from CCGS skills. Grouped as they appear in the palette:

| Group | Playbooks |
|---|---|
| Onboarding | `start`, `onboard`, `adopt`, `setup-engine`, `help` |
| Concept | `brainstorm`, `quick-design`, `map-systems`, `prototype` |
| Design | `design-system`, `design-review`, `balance-check`, `propagate-design-change`, `consistency-check`, `review-all-gdds`, `art-bible`, `ux-design`, `ux-review` |
| Architecture | `create-architecture`, `architecture-decision`, `architecture-review`, `create-control-manifest` |
| Planning | `create-epics`, `create-stories`, `story-readiness`, `sprint-plan`, `estimate`, `scope-check` |
| Implementation | `dev-story`, `story-done`, `vertical-slice`, `code-review`, `tech-debt`, `perf-profile` |
| Quality | `qa-plan`, `regression-suite`, `smoke-check`, `soak-test`, `test-setup`, `test-helpers`, `test-evidence-review`, `test-flakiness`, `bug-report`, `bug-triage` |
| Content | `asset-spec`, `asset-audit`, `content-audit`, `localize`, `playtest-report` |
| Release | `release-checklist`, `launch-checklist`, `day-one-patch`, `hotfix`, `patch-notes`, `changelog`, `security-audit` |
| Operations | `sprint-status`, `milestone-review`, `gate-check`, `project-stage-detect`, `retrospective`, `reverse-document` |
| Team orchestration | `team-combat`, `team-ui`, `team-level`, `team-narrative`, `team-audio`, `team-qa`, `team-polish`, `team-release`, `team-live-ops` |
| Meta | `skill-improve`, `skill-test` |

The nine `team-*` playbooks compile to v1 Workflow DAGs with parallel phases — the workflow engine's
existing semantics, no extension required.

## 9. Dashboard

Panels from the fixed set (`01-enterprise/03-department-architecture.md` §6):

`StageProgress` (seven stages, current, artifact evidence) · `KPIStrip` · `QueueDepth` ·
`RegistryHealth` (entity and architecture registries: entries, deprecations, unresolved conflicts) ·
`GuardViolations` · `DeliverableFeed` · `CostMeter` · `RosterStrip` (which of the forty-nine are live)

No custom panels. Night Atrium tokens only.

## 10. Defaults

A Department Pack ships defaults correct for a first-run Principal (v1 settings rule, extended by Principle
4.9 in the review):

| Setting | Default | Why |
|---|---|---|
| Review Intensity | `standard` | CCGS defaults to `lean`; Sidra's `standard` is the nearest equivalent that preserves ADR-0008 |
| Fence profile | Conservative — file writes ask by default | The CCGS collaboration posture. Game development makes large irreversible creative commitments; an early wrong turn is expensive. Principal-adjustable. |
| Engine set | Unselected — chosen at first Engagement | Instantiating the wrong nine archetypes is pure waste |
| Autoscale | min 1, max 6, queue target 3 | The three directors plus what the work demands |
| Budget share | 0.20 of the Division | The Division has one department |
| Stage | `Concept` | |
