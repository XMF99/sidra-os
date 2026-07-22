# Game Studio and Marketplace — Architecture

**Milestone M14 · Release 2.0 "Concourse" · Layer 3 (Departments) + Layer 8 (Marketplace)**

| | |
|---|---|
| Milestone | M14 — Game Studio and Marketplace (`/MILESTONE_REGISTRY.md` §2, 2.0 "Concourse") |
| Release | 2.0 "Concourse" — the Firm becomes a company; **2.0 ships at the end of this milestone** |
| Layers | 3 — Departments (the Pack) and 8 — Marketplace (distribution) (`/docs-v2/02-layer-model.md` §3, §8) |
| New kernel crate | **None.** The Game Studio is a Department Pack (data) installed via M13's Registrar; the Marketplace is thin distribution wiring that reuses the M13 install path (ADR-0045) |
| Depends on | M11 (department substrate), M12 (structure — Divisions/Offices), M13 (departments, Registrar, the twelve install checks), M9 (plugin signing chain, Wasm host for Tier-2 Guards) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | **The nine-item acceptance list, including uninstall-leaves-Firm-working** (`/MILESTONE_REGISTRY.md` M14 row) — §17 |

> **Authoritative precedence.** Where this document disagrees with `/docs-v2/03-department-architecture.md`
> about the Department Pack contract, the twelve install checks, isolation, or the Exchange, that document
> governs. Where it disagrees with `/docs-v2/05-marketplace-and-packs.md` about distribution, trust tiers, or
> the three acts (acquire/install/grant), that document governs. Where it disagrees with
> `/docs-v2/adr/0018-review-intensity.md` or `/docs-v2/adr/0019-compile-ccgs-do-not-embed.md`, those ADRs
> govern. Where v1 and v2 conflict, **v1 governs** (`/MASTER_IMPLEMENTATION_GUIDE.md` §2). This architecture
> *consolidates and operationalises* those sources into a buildable milestone; it never re-decides them.

---

## 1. Why this milestone exists

### 1.1 The problem

Through M13 the Firm can install departments from Packs, three of them, and route one Exchange request between
them (`/MILESTONE_REGISTRY.md` M13 exit criterion). What it has not yet done is prove two claims the whole 2.0
architecture rests on:

1. **The Department Pack contract holds for a real, external, non-trivial body of work.** Three
   hand-authored demonstration departments prove the *mechanism*; they do not prove the *contract*, because
   their authors could quietly shape them to fit. The test the contract has to survive is a department nobody
   designed to fit it — one with seven lifecycle stages, forty-nine roles, three target engines, and its own
   review culture — dropped into the contract to see whether it fits **without special-casing the kernel**
   (`/docs-v2/02-game-studio-department.md` intro). `Claude-Code-Game-Studios` (CCGS, MIT) is exactly that: the
   most complete existing implementation of the problem v2 solves, for one domain
   (`/docs-v2/01-repository-analysis.md` "Position").
2. **A Pack can be distributed, installed, made to work, and uninstalled cleanly.** The Marketplace is the
   layer that delivers capability, and — more importantly — prevents it from arriving with authority it was not
   given (`/docs-v2/05-marketplace-and-packs.md` intro). Distribution has to be proven to *not* be authority,
   and uninstall has to be proven to leave the Firm working — the Layer-3 replaceability test
   (`/docs-v2/02-layer-model.md` §9, row 3).

M14 is the milestone that discharges both. It is the final milestone of 2.0 because 2.0 is not done until the
company can acquire, install, run, and retire a department it did not build.

### 1.2 The stance

Two commitments define the milestone, and each already has an Accepted ADR:

1. **Compile CCGS into a Department Pack; do not embed it.** (ADR-0019) A maintained compiler in
   `infrastructure/scripts/ccgs-compile/` transforms 49 agents → 49 Role Archetypes, 73 skills → 73 Playbooks,
   11 rules → 11 Standards, 12 hooks → 12 Guards, 2 registries → 2 Registries, plus templates, stages, and gate
   IDs into Pack contents. Every compiled artifact carries `derived_from`; the Pack ships `PROVENANCE.md`. The
   Firm never runs Claude Code, never vendors the repository, never gives it ambient shell — the Game Studio is
   a Department Pack like every other, subject to the same isolation, the same capability model, the same audit
   chain (ADR-0019 Decision + Consequences).
2. **The Marketplace distributes; it never confers autonomy.** (`/docs-v2/02-layer-model.md` §8;
   `/MASTER_IMPLEMENTATION_GUIDE.md` §3.8) Acquire, install, and grant are three separate, logged,
   independently-refusable acts (`/docs-v2/05-marketplace-and-packs.md` §2). Installing the Game Studio Pack
   grants nothing; the Principal grants capabilities in a separate explicit act from a plain-language list.

Review Intensity (ADR-0018) governs *how much* review the Game Studio runs, and is treated in §6. It changes
nothing about *whether* the author-≠-reviewer rule holds — that is absolute in every mode.

### 1.3 What the Game Studio IS, mechanically

The Game Studio is a **Department Pack** — a signed, versioned, installable artifact conforming to the fixed
twelve-directory contract in `/docs-v2/03-department-architecture.md` §1. Nine of the twelve directories are
**data**; only `tools/` contains executable code, and it runs in the existing Wasm sandbox with no new
mechanism (§1, same source). The Pack is `dept.game-development`, in the Game Studio Division, headed by Lyra
(`agent.studio`) (`/docs-v2/02-game-studio-department.md` §1). Mechanically it is:

```
Layer 3  dept.game-development/     ← the Pack: manifest + 49 archetypes + 73 playbooks + 11 standards
         (a signed artifact, DATA)    + 12 guards + 2 registries + 38 templates + stage-model.yaml   (M14, THIS DOC)
Layer 1  sidra-departments          ← the Registrar and the twelve install checks that load it        (M13, unchanged)
Layer 8  Marketplace                ← publish / discover / acquire / install wiring                    (M14, THIS DOC)
```

The parallel to how M16 later frames connectors is deliberate: the *framework* (the Registrar, the install
checks) is Layer-1 kernel and belongs to M13; the *artifact* (the Game Studio Pack) is a Layer-3 data object
M14 produces; and M14 introduces **no new trust mechanism** — it reuses the plugin signing chain (ADR-0006),
the department manifest contract (ADR-0013), the twelve install checks (`/docs-v2/03-department-architecture.md`
§8), and the Marketplace trust model (`/docs-v2/05-marketplace-and-packs.md`).

### 1.4 What the milestone must never become

- **Embedded code the kernel special-cases.** The moment there is an `if department == "game-development"`
  anywhere in the kernel, the whole point of ADR-0019 is lost and the "one architecture" gain evaporates. A CI
  grep fails the build on any department-id literal in a kernel crate (`/MASTER_IMPLEMENTATION_GUIDE.md` §3.12).
  The Game Studio must be indistinguishable, to the kernel, from a hand-authored department.
- **A second agent runtime.** Sidra does not ship or sandbox Claude Code, does not give CCGS ambient shell,
  and does not spawn agents via the `Task` tool. Sidra's orchestrator owns agent lifecycle
  (`/docs-v2/01-repository-analysis.md` §10; ADR-0019 Option 1, rejected). The sixteen CCGS agents that
  declared `Bash` get narrow, declared, sandboxed capabilities (`tool:code-analysis`, `tool:build-invoke`) or
  nothing — an agent that needs arbitrary shell is an agent with no capability boundary
  (`/docs-v2/03-integration-plan.md` §2).
- **An install that grants authority.** Acquiring or installing the Pack from the Marketplace confers no
  capability. A marketplace artifact never arrives with autonomy (`/MASTER_IMPLEMENTATION_GUIDE.md` §12
  "product"; `/docs-v2/02-layer-model.md` §8). The exit-criterion items 8 and 9 test exactly this.
- **An uninstall that breaks the Firm.** Uninstalling the Pack must leave the Firm functional and the
  Artifacts and memory intact and readable (`/docs-v2/03-integration-plan.md` §9.6). This is the headline
  acceptance item and the Layer-3 replaceability proof — the item most likely to fail on the first attempt
  (same source, closing line).

### 1.5 Relationship to existing concepts

| Existing concept | How M14 relates |
|---|---|
| Department Pack contract (M13, `/docs-v2/03-department-architecture.md` §1–§2) | The Game Studio *is* one. M14 fills the twelve-directory layout with compiled CCGS content and one hand-authored manifest; it adds nothing to the contract. |
| The twelve install checks (M13 §8) | The Game Studio must pass all twelve unchanged (acceptance item 1). The Marketplace runs the same twelve locally before publishing (`/docs-v2/05-marketplace-and-packs.md` §6.1). |
| The Registrar (M13 §3, §5, §7) | Loads the Pack, instantiates archetypes lazily (ADR-0014), resolves the Exchange requests, and drives the eight-phase lifecycle including **Retired** (the uninstall path). M14 writes no new loader. |
| Standards / Guards / Registries primitives (ADRs 0016, 0017) | Kernel primitives shipped in M11. M14 supplies the Game Studio's *instances* of them (11 Standards, 12 Guards, 2 Registries) as Pack data. |
| Review Intensity (ADR-0018) | A firm-wide setting shipped as a kernel primitive; the Game Studio Pack ships `standard` as its default (`/docs-v2/02-game-studio-department.md` §10). §6. |
| The Exchange (M13 §5) | The Game Studio *requires* `capability.code-review`, `capability.security-review`, `capability.store-release`, `capability.deploy`, `capability.cost-analysis` by contract, never by department name (`/docs-v2/02-game-studio-department.md` §1). Acceptance item 5 exercises one. |
| The Marketplace (Layer 8, `/docs-v2/05-marketplace-and-packs.md`) | M14 delivers the *working local publisher* and the three acts against a real Pack; the public catalogue ships empty (§7 of that source). |
| Plugin signing chain (ADR-0006, M9) | Verifies the Pack signature at acquire and install; verifies Tier-2 Guard Wasm validators. No new trust mechanism. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | The Game Studio is a Department Pack the kernel does not special-case | ADR-0019; CI grep for department ids in kernel crates (§14 F2); the Pack is data (`/docs-v2/03-department-architecture.md` §1) |
| G2 | CCGS assets are compiled, with provenance, never embedded | ADR-0019; the maintained compiler §3; `derived_from` per artifact; `PROVENANCE.md` (§7) |
| G3 | The Pack passes all twelve M13 install checks with no thirteenth added to the contract | §5; acceptance item 1; the attribution requirement enforced as Pack content, not a new check (§7) |
| G4 | A Pack is published, discovered, acquired, and installed through the Marketplace | §5; the three acts (`/docs-v2/05-marketplace-and-packs.md` §2); ADR-0045 |
| G5 | Installation grants no authority — distribution ≠ authority | ADR-0045; `/docs-v2/02-layer-model.md` §8; acceptance items 8, 9 |
| G6 | Review Intensity changes how much review, never whether; author ≠ reviewer is absolute | §6; ADR-0018; ADR-0008; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.9 |
| G7 | CCGS's MIT obligations are met mechanically, not by courtesy | §7; a Pack missing `PROVENANCE.md`/license/origin-line does not ship (AC-L1) |
| G8 | Uninstalling the Pack leaves the Firm working, Artifacts and memory intact | §8; the Retired lifecycle phase (M13 §7); acceptance item 6 (headline) |
| G9 | Everything is additive | §11 migrations `0016`–`0018` forward-only; a Firm with the Pack uninstalled behaves exactly as a Firm that never installed it |

---

## 3. The CCGS repository analysis and the compile-not-embed decision (ADR-0019)

### 3.1 What CCGS is

`github.com/Donchitos/Claude-Code-Game-Studios` (MIT), 417 files, 6.0 MB, analysed at the current default
branch (`/docs-v2/01-repository-analysis.md` intro). Its inventory:

| Asset | Count | Becomes in Sidra | Where |
|---|---|---|---|
| Agents (`.claude/agents/*.md`) | 49 | 49 Role Archetypes | ADR-0014; §4.2 |
| Skills (`.claude/skills/*/SKILL.md`) | 73 | 73 Playbooks (v1 Workflow DAGs) | v1 workflow engine, unchanged; §4.3 |
| Rules (path-scoped `.md`) | 11 | 11 department Standards | ADR-0016; §4.4 |
| Hooks (`.claude/hooks/*.sh`) | 12 | 12 Guards (three port tiers) | ADR-0016; §4.5 |
| Registries (YAML) | 2 | 2 department Registries | ADR-0017; §4.6 |
| Templates | 38 | Department templates | Pack contract |
| Stages + `workflow-catalog.yaml` | 7 | Department Stage Model | Pack contract; §4.7 |
| Director gates by ID | — | Referenced Standards and gate IDs | Pack contract |
| Review modes (`review-mode.txt`) | 3→3 | Review Intensity, firm-wide | ADR-0018; §6 |

Six general-purpose primitives — Standards, Guards, Registries, Stage Models, Review Intensity, and
evidence-based advancement — were extracted from this one domain-specific repository and now serve all
twenty-one departments (`/docs-v2/01-repository-analysis.md` §11; ADR-0019 "Gained: six general-purpose
primitives"). That extraction shipped in M11–M13. **M14's job is the one department those primitives were
extracted from.**

### 3.2 What "compile into a Pack" means, mechanically, vs embedding

The decision is ADR-0019, and it turned on four options (ADR-0019 Options):

- **Embed** (vendor the repo, run Claude Code as a subprocess) — rejected: ships a second agent runtime, gives
  it ambient shell, breaks the audit chain, bypasses the Permission Broker, produces a department
  architecturally unlike every other. **This is the thing M14 must never become** (§1.4).
- **Reimplement** (read for inspiration, write from scratch) — rejected: discards 49 tested role definitions
  and 73 tested procedures for a worse version of the same thing.
- **Compile** (transform assets into Sidra structures through a maintained importer, recording provenance) —
  **chosen** (ADR-0019 Decision, Option 3).
- **Bridge** (keep CCGS native, interpret at runtime) — rejected: the kernel would understand two agent
  formats forever, and the second has no capability model.

**Compiling** means: a maintained tool in `infrastructure/scripts/ccgs-compile/` reads a CCGS asset and emits
the corresponding Sidra Pack artifact, field by field, once, recording `derived_from` on the output. The
runtime is *not* imported — only the assets are, and only in Sidra's own structures
(`/docs-v2/01-repository-analysis.md` §10, "Claude Code as the runtime — not adopted";
`/docs-v2/03-integration-plan.md` intro). The compiler is **maintained, not run once**: upstream changes are
re-imported through the same compiler with a reviewable diff (`/docs-v2/03-integration-plan.md` §8; ADR-0019
"The compiler is maintained, not run once").

**Embedding** would mean the opposite on every axis: the runtime imported, the assets left native, the audit
chain broken, the kernel special-cased. The one-line test that separates them: *after M14, is there any code
path in a kernel crate that names the Game Studio, runs a `bash` hook, or spawns a Claude Code session?* If
yes, the milestone embedded and failed; if no, it compiled (§14 F2; G1).

### 3.3 The honest cost of compilation (from ADR-0019 Consequences, made into work)

Compilation is work, and some of it is judgement rather than transformation. The M14 implementation plan (E1)
budgets for the judgement calls the analysis already named:

- **Sixteen agents declare `Bash` with no Sidra equivalent.** Each needs an individual capability decision;
  the default is to grant nothing and let the first Work Order that fails say what was actually needed
  (`/docs-v2/03-integration-plan.md` §2).
- **Escalations referencing "the user" must become "the Principal"**, which changes meaning because the
  Principal is not sitting in the session (ADR-0019; `/docs-v2/03-integration-plan.md` §2).
- **`AskUserQuestion` must be classified per occurrence** as an Approval Request or a Clarification —
  different mechanisms in Sidra, and getting it wrong produces an annoying Firm
  (`/docs-v2/03-integration-plan.md` §3.2).
- **Some CCGS capability does not survive:** `bash` hooks lose their five-minute authoring loop; slash-command
  UX becomes palette verbs; the agent-teams experiment is dropped for workflow DAGs (ADR-0019; §3.4).

These are accepted consequences, recorded in ADR-0019, not defects. The Pack's `PROVENANCE.md` records **every
deliberate divergence with its reason** (ADR-0019 Decision; `/docs-v2/03-integration-plan.md` §8, last row).

---

## 4. Domain model

### 4.1 The two families of artifact

M14 has two families of domain object: the **Game Studio Pack** (a Department Pack — the thing installed) and
the **Marketplace distribution artifacts** (a listing and its acquisition/install records — how it travels).
They meet at exactly one point: the install path, which is M13's, not M14's (ADR-0045).

```
        THE GAME STUDIO PACK (Layer 3 — data)                         THE MARKETPLACE (Layer 8 — distribution)

  dept.game-development (department.toml)                       Listing
     │  id=game-development, division=game-development,            │  pack_id, name, publisher, version
     │  head=Lyra, sidra_api=^2.0                                  │  trust_tier (first-party|verified|community|unsigned)
     │                                                             │  origin_line  (CCGS/MIT — FIRST line of description)
     ├─ 1 ── * RoleArchetype  (49; ADR-0014)                       │  requested_capabilities  (plain-language list)
     │          model_class, capabilities⊆dept, standards,         │  evals_summary  (count + coverage + failures)
     │          instantiation ∈ {eager,on_demand,scheduled}        │  signature_ref  (ADR-0006 chain)
     │          derived_from  ← CCGS agent file                    │  provenance_ref → PROVENANCE.md
     ├─ 1 ── * Playbook       (73; v1 Workflow DAG)                │
     │          derived_from  ← CCGS skill                         └─ 1 ── * Acquisition
     ├─ 1 ── * Standard       (11; ADR-0016)                                  pack_id, signature_verified, at
     │          applies_to path glob, inheritance: firm>app>dept              (download + verify; NOTHING loaded)
     ├─ 1 ── * Guard          (12; ADR-0016; three tiers §4.5)                     │
     │          lifecycle_point, action ∈ {block,warn}                             ▼
     ├─ 1 ── * Registry       (2; ADR-0017; append-only)                    PackInstall  (M13 lifecycle §7)
     │          owner-per-fact, referenced_by, status, revised               pack_id, department_id,
     ├─ 1 ── 1  StageModel    (7 stages; evidence-based advance)             version, manifest_hash,
     ├─ 1 ── * Template       (38)                                           status ∈ {Proposed,Installed,Granted,
     ├─ 1 ── 1  Defaults      (review=standard, fence=conservative,                    Staffed,Operating,Retired},
     │          engine=unselected, autoscale, budget=0.20)                   provenance_ref
     └─ 1 ── 1  PROVENANCE.md (source repo, author, MIT text,
                source commit, import date, divergence log)         Grant  (a separate Principal Decision — §5.4)
                                                                     department_id, capabilities[], granted_by, at
```

### 4.2 Role Archetype (the compiled agent)

An archetype is a v1 employee specification turned into a template — the ten sections of
`/docs/03-agents/03-employee-specs.md`, unchanged, plus four v2 fields (`model_class`, `capabilities`,
`standards`, `instantiation`) (`/docs-v2/03-department-architecture.md` §3). The compile mapping is field-by-
field (`/docs-v2/03-integration-plan.md` §2):

| CCGS front-matter | Sidra archetype field | Transformation |
|---|---|---|
| `name` | `id` | direct (`lead-programmer` → `lead-programmer`) |
| `description` | Role + routing triggers | first sentence → Role; when-to-use clauses → routing hints |
| `tools` | `capabilities` | mapped to Sidra capabilities; **`Bash` does not map** — `tool:code-analysis` + `tool:build-invoke`, narrow and sandboxed |
| `model` | `model_class` | per `/docs-v2/02-game-studio-department.md` §3 (Opus→reasoner, Sonnet→worker, Haiku→fast) |
| `maxTurns` | `turn_ceiling` | direct |
| `skills` | `playbooks` | direct, after the skill compile |
| `memory` | `memory.scope` | `dept.game-development.<archetype>` |
| body — collaboration protocol | department default Fence profile | Question→Options→Decision→Draft→Approval → conservative Fence default |
| body — escalation | Decision boundaries (CAN / ESCALATE / NEVER) | escalation targets rewritten to the Sidra hierarchy (Lyra, or an Exchange contract) |

**Archetype ≠ Agent** (ADR-0014): the archetype is data in the Pack; the Agent Instance is created by the
Registrar with its own id, memory, and KPI history. Forty-nine archetypes; typically four to eight live
instances (three `eager` directors, `on_demand` leads and specialists, engine set filtered at install by the
title's engine) (`/docs-v2/02-game-studio-department.md` §2). This is what keeps a 49-agent studio inside the
v1 memory footprint (ADR-0014).

### 4.3 Playbook (the compiled skill)

73 Playbooks, mapped one-to-one from CCGS skills; the front-matter (`name`, `description`, `argument-hint`,
`allowed-tools`, `model`, `user-invocable`) maps onto the Playbook header; the Markdown body becomes step
definitions (`/docs-v2/03-integration-plan.md` §3). Three transformations are not mechanical: `Task` spawns
become workflow DAG nodes; `AskUserQuestion` becomes an Approval Request or a Clarification per occurrence;
gate-ID references resolve to Sidra gate-table entries (same source). The nine `team-*` playbooks compile to
v1 Workflow DAGs with parallel phases — the workflow engine's existing semantics, no extension required
(`/docs-v2/02-game-studio-department.md` §8).

### 4.4 Standard (the compiled rule)

Eleven path-scoped Standards, adopted from CCGS's rules with paths rewritten to the Sidra Artifact tree
(`/docs-v2/02-game-studio-department.md` §5). Inheritance is **Firm > Application > Department**: the Game
Studio may *tighten* any inherited Standard and may **never relax** one (same source; M13 §4.6). The
`prototype-code` Standard is a named, path-scoped, explicitly non-shippable exemption — not a relaxation of a
Firm Standard, but a department Standard covering a path Firm Standards scope out (§5, same source). A Standard
nobody checks is a comment; each is paired with a Guard that enforces it
(`/docs-v2/01-repository-analysis.md` §5).

### 4.5 Guard (the ported hook — three tiers)

Twelve Guards, mapped from CCGS hooks. Because ADR-0006 gives plugins a deny-by-default Wasm sandbox with no
ambient authority, `bash` hooks cannot be adopted as written; the port is in three tiers
(`/docs-v2/03-integration-plan.md` §5):

| Tier | Count | Form | Guards |
|---|---|---|---|
| Tier 1 — declarative | 7 | TOML data: `lifecycle`, `applies_to` glob, `action`, `require_sections`/pattern | `validate-commit`, `validate-assets`, `detect-gaps`, `data-values-external`, `test-presence`, `deliverable-provenance`, `asset-naming` |
| Tier 2 — Wasm validators | 3 | a `validate(context) -> verdict` Wasm component under the plugin host, fuel-metered, no ambient authority | registry-consistency, stage-artifact-check, asset-budget |
| Tier 3 — kernel-native (deleted, not ported) | 2 | already done by the kernel | `log-agent` (audit chain records every Turn), `pre/post-compact` (orchestrator frame preservation) |

**What is genuinely lost:** a CCGS user writes a new hook in five minutes with a text editor; a Sidra Tier-2
Guard requires compiling a Wasm component. That is a real reduction in extensibility, mitigated but not
eliminated by Tier 1 covering the majority of cases. The trade is deliberate — a validation system that can
execute arbitrary host commands is an exfiltration channel waiting for the next Pack author
(`/docs-v2/03-integration-plan.md` §5; recorded as an accepted consequence in ADR-0016).

### 4.6 Registry (the adopted registry)

Two Registries, adopted with semantics intact (ADR-0017): `entities` (every named game-world fact appearing in
more than one document — entities, items, factions, locations, formulas, currencies) and `architecture` (every
architectural stance constraining other systems). Rules unchanged from CCGS: register only what crosses a
boundary; **never delete — deprecate**; one owner per fact (`source`→`owner`); an update sets `revised` and
records the prior value (`/docs-v2/02-game-studio-department.md` §7; `/docs-v2/03-integration-plan.md` §6).
Registry entries feed Canon promotion by the v1 mechanism (Kai proposes, Principal confirms); they do not
become Canon automatically, because a department-owned fact and a firm-wide truth are different things
(`/docs-v2/03-integration-plan.md` §6).

### 4.7 Stage Model

Seven stages: Concept → Systems Design → Technical Setup → Pre-Production → Production → Polish → Release,
declared in `stage-model.yaml` (`/docs-v2/02-game-studio-department.md` §4). **Advancement is evidence-based**:
each step declares an artifact check (a path glob + optional content pattern); a stage advances when its
required artifacts exist and satisfy their patterns, not when someone says it is done (same source; adopted
from CCGS `workflow-catalog.yaml`, `/docs-v2/01-repository-analysis.md` §7). Gate verdicts are PASS / CONCERNS
/ FAIL. **Department stage gates are advisory** (Lyra and the Principal may proceed past a CONCERNS with the
concern recorded as a Decision); **Office vetoes are binding** and are a different mechanism entirely
(`/docs-v2/02-game-studio-department.md` §4). Keeping both, and keeping them distinct, is the correction over
CCGS, which conflated them because it had no Offices (`/docs-v2/01-repository-analysis.md` §7).

### 4.8 The Game Studio's boundary and Exchange contracts

The boundary is drawn where the *discipline* changes, not where the technology changes
(`/docs-v2/02-game-studio-department.md` §1):

| Provides (contracts) | Requires (contracts, resolved by the Registrar — never a department name) |
|---|---|
| `capability.game-design` | `capability.code-review` (Software Engineering) |
| `capability.game-implementation` | `capability.security-review` (Cybersecurity) |
| `capability.playtest` | `capability.store-release` (Mobile) |
| `capability.narrative-design` | `capability.deploy` (Infrastructure) |
| `capability.technical-art` | `capability.cost-analysis` (Cloud, for live titles) |

`requires.contracts` names contracts, never departments (M13 §2 manifest rule; §5). Acceptance item 5
exercises the `capability.security-review` → Cybersecurity request end to end, charged to the Game Studio's
budget.

---

## 5. The Marketplace: publish → discover → acquire → install

### 5.1 What the layer is

Layer 8: discovery and distribution for Packs, Plugins, and Integrations
(`/docs-v2/02-layer-model.md` §8). The constraint that *defines* the layer: **the Marketplace can deliver an
artifact and can prove who signed it — it can never confer autonomy** (same source). M14 delivers the *working
local publisher* against a real Pack (the Game Studio); the public catalogue ships **empty**, because the
distribution mechanism is needed on day one even though the market is not
(`/docs-v2/05-marketplace-and-packs.md` §7).

### 5.2 What is distributable, and the trust weight

The Game Studio is a **Department Pack** — the highest trust weight, because it defines a trust boundary
(`/docs-v2/05-marketplace-and-packs.md` §1). Review depth and default trust are a function of the artifact
*type*, not its popularity or author (same source). Trust tiers
(`/docs-v2/05-marketplace-and-packs.md` §3): first-party (Sidra Systems — the Game Studio's tier), verified
publisher, community, and unsigned (blocked outside a 7-day developer mode).

### 5.3 The three acts — the rule that defines the layer

**Installation never grants authority** (`/docs-v2/02-layer-model.md` §8; `/MASTER_IMPLEMENTATION_GUIDE.md`
§3.8). Three separate acts, each logged, each independently refusable
(`/docs-v2/05-marketplace-and-packs.md` §2):

1. **Acquire** — the artifact is downloaded and its signature verified (ADR-0006 chain). **Nothing is loaded.**
2. **Install** — the manifest is validated against **the twelve checks in
   `/docs-v2/03-department-architecture.md` §8**. Contracts resolve. **Nothing runs.** Capabilities are
   *requested*, displayed, and **not granted**.
3. **Grant** — the Principal grants capabilities from a plain-language list, individually. **Only now can the
   department act.**

A Pack requesting `integration:cloud:write` shows *"This department will be able to make changes to your cloud
infrastructure, including changes that cost money and cannot be undone"* — the consequence, not the mechanism
(`/docs-v2/05-marketplace-and-packs.md` §2). **The install act reuses M13's twelve checks; the Marketplace adds
no thirteenth and no second install path** (ADR-0045). This is why installing via the Marketplace is
mechanically identical to a local install: the Marketplace only added acquire (download + verify) in front of
it.

### 5.4 Publishing (the working local publisher)

For Sidra Systems publishing the Game Studio Pack internally
(`/docs-v2/05-marketplace-and-packs.md` §6):

1. The Pack passes the twelve install checks **locally**.
2. Evaluation sets run; results are published *with* the Pack, **including failures** — the eval count and
   coverage are shown in the listing (a Pack green because its evals are trivial is worse than one with honest
   gaps).
3. The capability request list is reviewed by the Security Office against a least-privilege rubric.
4. Signed and published with a changelog naming, specifically, any change to capabilities, contracts,
   registries, or standards — the only four changes that can affect an installed Firm's trust posture.

**No auto-update, at any tier** (`/docs-v2/05-marketplace-and-packs.md` §3): an update requesting any new
capability, or removing an entry from `capabilities.forbidden`, is always a fresh approval.

### 5.5 What the Marketplace may never do

From `/docs-v2/05-marketplace-and-packs.md` §5, enforced as invariants in M14: confer autonomy (§5.3); bundle
capability grants with content; rank by payment (no promoted placement); phone home (installed Packs never
contact the Marketplace; browsing is an explicit navigation with a named egress host); or execute during
discovery (nothing in a listing renders as anything but text and static images — no preview runs code).

### 5.6 Distribution ≠ authority, stated as the milestone's spine

The Game Studio being *acquired and installed from the Marketplace* must confer exactly nothing until the
Principal grants. This is not a Game-Studio property; it is the Layer-8 rule the Game Studio is the first
first-party artifact to exercise. Acceptance items 8 and 9 test it directly, and ADR-0045 is the record that
keeps it from eroding into "the Marketplace has its own quick install".

---

## 6. Review Intensity as a firm-wide setting (ADR-0018)

### 6.1 The setting

Review Intensity is a **firm-wide setting** shipped as a kernel primitive in M11 and adopted from CCGS's
`production/review-mode.txt` (ADR-0018; `/docs-v2/01-repository-analysis.md` §8). Three modes
(ADR-0018 Decision):

| Mode | Behaviour |
|---|---|
| `full` | every optional gate runs at every step |
| `standard` | Office reviews plus stage gates — **the default** |
| `lean` | stage gates only; Office reviews only where a manifest marks them required |

Set firm-wide; overridable per Engagement and per department at install (ADR-0018 Decision). The Game Studio
Pack ships **`standard`** as its default — CCGS defaults to `lean`, and `standard` is the nearest equivalent
that preserves ADR-0008 (`/docs-v2/02-game-studio-department.md` §10).

### 6.2 Why it never relaxes author ≠ reviewer

This is the load-bearing constraint of the whole setting, and M14 must not blur it:

- **There is no `solo` mode.** CCGS's `solo` disables all director gates, which is safe *there* because a human
  approves every file write. Sidra runs autonomously within Fences, so **no mode may disable ADR-0008: every
  Deliverable has one independent reviewer in every mode, including `lean`** (ADR-0018 Decision;
  `/docs-v2/01-repository-analysis.md` §8).
- **Security Office reviews are not subject to Review Intensity at all. A class-3 effect is reviewed in every
  mode** (ADR-0018 Decision).
- The distinction is drawn explicitly — *how much* review versus *whether* review — so that no future
  performance work can quietly cross it, which is exactly what a mode called `solo` would have permitted after
  one bad week (ADR-0018 "Gained: ADR-0008 stays absolute"; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.9).

M14 ships the Game Studio's *default* (`standard`) and the per-Engagement/per-department override plumbing for
this department; the setting itself is not M14's to build (it is a shipped primitive). The acceptance harness
asserts that a Deliverable produced under `lean` still has exactly one independent reviewer (AC-R1, §17).

---

## 7. Licence and attribution as a mechanical requirement (CCGS MIT)

CCGS is MIT. The obligations are **mechanical**, enforced by the compiler and the P0 gate, not left to
courtesy (`/docs-v2/03-integration-plan.md` §7; ADR-0019 "license compliance is straightforward"):

1. The Pack ships **`PROVENANCE.md`** naming the repository, author, license, source commit, and the date of
   import.
2. The **MIT license text is retained** in the Pack.
3. The Pack listing **states its origin — not a footnote, the first line of the description**
   (`/docs-v2/03-integration-plan.md` §7).
4. Each compiled derivative (archetype, playbook, standard, guard) carries a **`derived_from`** field pointing
   at the source file — for maintenance as much as attribution: when upstream changes, the compiler needs to
   know what maps to what.
5. `PROVENANCE.md` records **every deliberate divergence with its reason** (ADR-0019 Decision;
   `/docs-v2/03-integration-plan.md` §8).

Reviewed by the **Legal department at P0, before any compilation work begins**
(`/docs-v2/03-integration-plan.md` §1 P0, §7). M14 makes this a **gate**: a Pack whose `PROVENANCE.md`, MIT
text, listing origin-line, or per-artifact `derived_from` is missing does not pass the compiler's output check
and cannot be published (AC-L1, §17). Because the twelve M13 install checks are the department contract and
M14 adds no thirteenth (G3, ADR-0045), attribution is enforced at **two points that are not the department
install check**: the compiler's output validation (E6) and the Marketplace publish gate (§5.4 step 4's
changelog + Legal's P0 review). This keeps the department contract untouched while still making attribution
non-optional.

---

## 8. The uninstall path — uninstall leaves the Firm working (the headline)

### 8.1 Why this is the acceptance item that matters

Item 6 of the integration acceptance list — *"Uninstalling the Pack leaves the Firm functional and the
Artifacts and memory intact and readable"* — is the one that proves the **isolation** claim rather than the
**capability** claim, and it is the one most likely to fail on the first attempt
(`/docs-v2/03-integration-plan.md` §9, closing line). It is the Layer-3 replaceability test:
*"Uninstall all twenty-one; kernel and executive still run, Firm does nothing"*
(`/docs-v2/02-layer-model.md` §9, row 3).

### 8.2 The mechanism (M13's Retired phase, exercised)

Uninstall drives the department to the **Retired** lifecycle phase (M13 §7): *"Instances retired, Pack
disabled, memory namespace preserved read-only, history intact."* Concretely:

1. **In-flight Work Orders are suspended** — durable and resumable (v1 ADR-0010; M13 §4.7 quarantine parity).
2. **Live Agent Instances are retired.** Retiring an instance does not delete its history (it is in the event
   log — ADR-0002, ADR-0014) and does not remove the archetype (which is Pack data).
3. **The Pack is disabled**; the manifest is removed from the active set. The Registrar stops resolving the
   Game Studio's provided contracts, and an Exchange request for `capability.game-design` thereafter fails
   cleanly with `contract_unavailable` — it does not silently fall back (M13 §5).
4. **The memory namespace `dept.game-development.*` is preserved read-only**, retrievable, intact (M13 §7;
   Principle 3, "nothing important is ephemeral"). Artifacts under `Artifacts/game/**` are untouched and remain
   readable.
5. **No historical event is rewritten** — the uninstall is itself a `PackUninstalled` event on the hash chain
   (ADR-0002).

**What must NOT happen:** the Firm losing a capability another department depended on *without a contract*
(impossible — cross-department work names contracts, never departments, M13 §5, so nothing is hard-wired to
the Game Studio); the kernel breaking because a Game-Studio-specific code path is now dangling (impossible —
G1, there is no such path); or Artifacts/memory being deleted (forbidden — Principle 3). This is why a Firm
with the Game Studio uninstalled behaves exactly as a Firm that never installed it (G9), except that it
retains a read-only record of everything the department did.

---

## 9. Persistence — migrations 0016–0018 (additive, forward-only)

All three migrations are additive projections, forward-only and idempotent, each independently deployable
(`/MASTER_IMPLEMENTATION_GUIDE.md` §3.3; ADR-0002; Principle 3). The event log is the source of truth; these
tables are rebuildable from it (`/MASTER_IMPLEMENTATION_GUIDE.md` §3.1). M14 owns band `0016`–`0018` — after
the department-substrate migrations (M11–M13) and before the Mission Engine's (M15).

| Migration | Table | Purpose |
|---|---|---|
| `0016_marketplace_listings.sql` | `marketplace_listings` | the catalogue projection: `pack_id`, `name`, `publisher`, `version`, `trust_tier`, `origin_line`, `requested_capabilities`, `evals_summary`, `signature_ref`, `provenance_ref` — the org-facing "what is available and what it asks for" |
| `0017_pack_installs.sql` | `pack_installs` | the department-Pack install record: `pack_id`, `department_id`, `version`, `manifest_hash`, `status` (Proposed/Installed/Granted/Staffed/Operating/Retired), `installed_at`, `granted_at`, `retired_at`, `provenance_ref` — drives the lifecycle §8 |
| `0018_marketplace_events.sql` | `marketplace_events` | audit projection for the three acts + uninstall: `event_kind`, `pack_id`, `actor`, `at`, `outcome` — **no secret, no credential** (distribution never carries authority) |

Additive columns only elsewhere; no existing column's meaning changes. A Firm with no Pack acquired behaves
exactly as it did before M14 — an empty catalogue and zero installs is a fully supported state, not a migration
artifact (G9).

---

## 10. Domain events (on the hash chain)

Every event carries `actor`, `pack_id`, and (where applicable) `department_id`, and lands on the hash chain
(ADR-0002; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.1–§3.2):

`PackPublished` · `PackAcquired` · `PackSignatureVerified` · `PackInstalled` · `PackCapabilitiesRequested` ·
`PackGranted` · `PackStaffed` · `PackUninstalled` · `CompilationRecorded` (provenance: source commit + import
date + divergence log) · `ReviewIntensityChanged` · `ExchangeRequestOpened` · `ExchangeRequestCompleted`.

The three acts are three distinct events (`PackAcquired`, `PackInstalled`, `PackGranted`) precisely because
they are three separately-refusable decisions (`/docs-v2/05-marketplace-and-packs.md` §2). `PackUninstalled` is
an appended event, never a deletion (§8.2 step 5). The Game Studio's *operating* events (Turns, Deliverables,
Guard firings, Exchange traffic) are ordinary department events already on the chain from M11–M13; M14 adds no
new operating-event kind, only the distribution/lifecycle kinds above.

---

## 11. Public commands and queries

### 11.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `publish_pack(pack, signature)` | Listed | runs the twelve checks locally, attaches evals, Security-Office capability review, signs (§5.4); refused if `PROVENANCE.md`/MIT-text/origin-line/`derived_from` missing (AC-L1) |
| `acquire_pack(listing) -> AcquiredArtifact` | Acquired | downloads + verifies signature (ADR-0006); **loads nothing** (§5.3 act 1) |
| `install_pack(artifact) -> DepartmentId` | Installed | **delegates to the M13 Registrar's twelve checks**; contracts resolve; capabilities *requested*, not granted (§5.3 act 2; ADR-0045) |
| `grant_pack_capabilities(department, capabilities)` | Granted | a Principal **Decision**; plain-language list shown; only now can the department act (§5.3 act 3) |
| `set_review_intensity(scope, mode)` | — | firm / per-Engagement / per-department; `mode ∈ {full, standard, lean}`; **cannot disable the ADR-0008 reviewer** (§6.2) |
| `uninstall_pack(department)` | Retired | drives the Retired lifecycle (§8.2); memory preserved read-only; Artifacts intact; `PackUninstalled` appended |

### 11.2 Queries

| Query | Returns |
|---|---|
| `list_listings()` | the catalogue: pack, publisher, trust tier, origin line, requested capabilities, evals summary |
| `listing_detail(pack)` | full listing incl. changelog and provenance reference (text/static images only — §5.5) |
| `list_installed_packs()` | installed department Packs + lifecycle status |
| `pack_provenance(pack)` | `PROVENANCE.md` contents: source, license, commit, import date, divergence log |
| `review_intensity(scope)` | the effective mode at firm / Engagement / department scope |

### 11.3 API rules

1. **No API grants authority as a side effect of acquire or install.** Only `grant_pack_capabilities` grants,
   and it is a logged Decision with the plain-language list shown first (§5.3; `/docs-v2/02-layer-model.md` §8).
2. **`install_pack` has no code path that bypasses the M13 twelve checks.** There is no "install anyway", and
   no Marketplace-private install (ADR-0045; M13 §8).
3. **`publish`, `acquire`, `install`, `grant`, `uninstall`, `set_review_intensity` are all logged events**
   (§10). The three acts are three events.
4. **`set_review_intensity` cannot express `solo` and cannot disable the independent reviewer** — the mode enum
   has no such variant, making it structurally impossible (§6.2; ADR-0018).

---

## 12. Sequence diagrams

### 12.1 Publish → discover → acquire → install → grant a Pack via the Marketplace

```
Principal        Marketplace        Registrar(M13)      Keychain/Signer      Department
   │  publish_pack(GameStudio, sig)    │                     │                   │
   ├───────────────►│ 12 checks LOCAL  │                     │                   │
   │                │ evals + SecOffice │                     │                   │
   │                │ sign + changelog  │                     │                   │
   │                │ → Listed (origin line = CCGS/MIT, FIRST)│                   │
   │  list_listings │                   │                     │                   │
   │◄── catalogue ──┤ (text + static images only; no code runs during discovery) │
   │  acquire_pack  │                   │                     │                   │
   ├───────────────►│ download ─────────┼── verify signature ►│                   │
   │◄── Acquired ───┤ (NOTHING loaded)  │◄──── ok ────────────┤                   │
   │  install_pack  │                   │                     │                   │
   ├───────────────►│ delegate ────────►│ 12 checks (M13 §8)  │                   │
   │                │                   │ resolve contracts   │                   │
   │◄── Installed, capabilities REQUESTED not granted ────────┤                   │
   │  (plain-language list shown: "This department will be able to …")            │
   │  grant_pack_capabilities(game-development, [...])         │                   │
   ├───────────────────────────────────►│ record grant (Decision)                │
   │                                     │ Registrar staffs head (Lyra eager) ───►│ Staffed
   │◄──────────────── Operating ─────────┤                     │                  │
```

### 12.2 The Exchange acceptance (item 5): Game Studio → Cybersecurity, charged to the Game Studio

```
GameStudio(Lyra)   Registrar(M13)     Cybersecurity
   │ department.request                     │
   │  to_contract capability.security-review│
   ├──────────────────►│ resolve contract ─►│ (never a department name; M13 §5)
   │                   │◄── cybersecurity ──┤
   │                   │ route Work Order; budget charged to REQUESTER (GameStudio)
   │                   ├───────────────────►│ review (own reviewer, ADR-0008)
   │◄──── verdict ─────┤◄───── verdict ─────┤
   │ (ExchangeRequestCompleted; cost on the Game Studio's budget — §4.8)
```

### 12.3 Uninstall leaves the Firm working (the headline — item 6)

```
Principal        Registrar(M13)        Memory/Vault         Rest of Firm
   │ uninstall_pack(game-development)      │                     │
   ├───────────────►│ suspend in-flight WOs (durable, resumable) │
   │                │ retire live instances (history kept, ADR-0002)
   │                │ disable Pack; remove manifest from active set
   │                ├── namespace dept.game-development.* → READ-ONLY ►│
   │                │   Artifacts/game/** untouched, readable          │
   │                │ append PackUninstalled (no event rewritten)      │
   │◄── Retired ────┤                       │                     │
   │                                        │  kernel + executive still run ─────►│ Firm does
   │                                        │  Exchange for capability.game-design│  everything
   │                                        │  → contract_unavailable (clean)     │  else, intact
```

---

## 13. The nine-item acceptance list (the exit criterion), reproduced

The registry names the exit criterion as *"the nine-item acceptance list, including
uninstall-leaves-Firm-working"* (`/MILESTONE_REGISTRY.md` M14 row; `/MASTER_IMPLEMENTATION_GUIDE.md` §5 M14).
Because M14 = Game Studio **and** Marketplace, the nine items are the **six Game-Studio integration acceptance
items reproduced verbatim in intent from `/docs-v2/03-integration-plan.md` §9**, plus the **three Marketplace
distribution items** the milestone's second half must satisfy, drawn from `/docs-v2/05-marketplace-and-packs.md`
§2/§6 and `/docs-v2/02-layer-model.md` §8. Each is made an explicit, objectively testable AC in §17.

**Game Studio integration (from `/docs-v2/03-integration-plan.md` §9):**

1. The Pack installs and passes all twelve validation checks.
2. All forty-nine archetypes instantiate and produce a valid first Turn.
3. A title runs Concept → Systems Design → Technical Setup → Pre-Production, producing a concept document,
   three GDDs, an architecture document with ADRs, a seeded entity registry, and a validated vertical slice —
   with no manual intervention beyond the Principal's Directives and approvals.
4. Every Guard fires at least once against a deliberately-bad input, and blocks.
5. A cross-department Exchange request (`capability.security-review` to Cybersecurity) completes and is charged
   to the Game Studio's budget.
6. **Uninstalling the Pack leaves the Firm functional and the Artifacts and memory intact and readable.**
   *(the headline — the isolation proof, §8)*

**Marketplace distribution (from `/docs-v2/05-marketplace-and-packs.md` §2/§6, `/docs-v2/02-layer-model.md`
§8):**

7. The Pack is **published** to the local Marketplace: it passes the twelve checks locally, its evals run and
   are published with results (including failures), its capability list is Security-Office reviewed, and it is
   signed with a changelog (`/docs-v2/05-marketplace-and-packs.md` §6).
8. The Pack is **discovered and acquired**: acquire downloads and verifies the signature and loads nothing;
   the three acts (acquire / install / grant) are separate and independently refusable
   (`/docs-v2/05-marketplace-and-packs.md` §2; `/docs-v2/02-layer-model.md` §8).
9. **Installation grants no authority**: acquiring and installing the Pack from the Marketplace confers no
   capability until the Principal grants from a plain-language list — a marketplace artifact never arrives with
   autonomy (`/docs-v2/02-layer-model.md` §8; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.8, §12).

> **Note on the count.** `/docs-v2/03-integration-plan.md` §9 currently enumerates six items (Game-Studio
> only). The registry's "nine-item" figure is met by adding the three Marketplace acts that M14's second half
> owns. This is a consolidation, disclosed here, not an invention: every one of the three added items cites a
> source that already decides it. The headline item — uninstall-leaves-Firm-working — is item 6, unchanged.

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | **Uninstall breaks the Firm** (a capability was hard-wired to the Game Studio) | Must not happen: cross-department work names contracts, never departments (M13 §5); after uninstall the contract fails cleanly with `contract_unavailable`, the kernel and executive keep running (§8; AC6) |
| F2 | **The Game Studio is special-cased in the kernel** (an `if department == "game-development"` or a ported `bash` hook) | CI grep for department-id literals and shell-hook execution in kernel crates fails the build (G1; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.12; AC-K1) |
| F3 | **A marketplace artifact arrives with autonomy** (install grants a capability) | Forbidden: install only *requests* capabilities; grant is a separate logged Decision (§5.3; ADR-0045); the acquire/install path has no grant side effect (AC8, AC9) |
| F4 | **A Pack ships without CCGS attribution** (missing `PROVENANCE.md`, MIT text, origin line, or `derived_from`) | The compiler output check and the publish gate refuse it; it cannot be published (§7; AC-L1) |
| F5 | **`lean` review mode drops the independent reviewer** | Structurally impossible: the mode enum has no `solo`; `lean` still guarantees one independent reviewer per Deliverable; Security/class-3 review is exempt from the dial (§6.2; ADR-0018; AC-R1) |
| F6 | **A stage advances on assertion, not evidence** | Blocked: advancement requires the declared artifacts to exist and match their patterns; `stage-artifact-check` (Tier-2 Guard) evaluates the evidence (§4.7; AC4-adjacent) |
| F7 | **A `Bash`-declaring CCGS agent gets ambient shell** | The compile mapping refuses to map `Bash`; the agent gets `tool:code-analysis`/`tool:build-invoke` or nothing (§3.3, §4.2; ADR-0006) |
| F8 | **A registry entry is deleted on a Pack update** | Forbidden: registries are append-only across versions; deprecation is marking, not deletion (§4.6; `/docs-v2/05-marketplace-and-packs.md` §4; ADR-0017) |
| F9 | **A listing runs code during discovery** | Forbidden: a listing renders as text and static images only; no preview runs code (§5.5; `/docs-v2/05-marketplace-and-packs.md` §5) |

---

## 15. Performance and offline

- **Uninstall is the Layer-3 offline/replaceability test.** Disconnect the Marketplace entirely and installed
  Packs keep working; nothing new arrives (`/docs-v2/02-layer-model.md` §9, row 8). Uninstall the Game Studio
  and the kernel and executive still run (row 3). Both are acceptance-tested (§8; AC6).
- **The Marketplace never phones home.** Installed Packs never contact the Marketplace; browsing is an explicit
  navigation with a named egress host; update checks are manual or Principal-scheduled and send only a version
  string (§5.5; `/docs-v2/05-marketplace-and-packs.md` §5). There is no background network cost.
- **Lazy instantiation keeps the 49-agent studio affordable.** Typically four to eight of forty-nine
  archetypes are live; the engine set is filtered at install by the title's engine (ADR-0014;
  `/docs-v2/02-game-studio-department.md` §2). Instantiating the wrong nine engine archetypes is pure waste,
  so the engine set ships **unselected** and is chosen at first Engagement (§10, same source).
- **Compilation is off the Firm's hot path entirely.** The compiler runs in `infrastructure/scripts/` at build
  time, not at runtime (ADR-0019; §3.2). The Firm never pays for it.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| M13 — departments, Registrar, the twelve install checks, the eight-phase lifecycle | loading the Pack, resolving contracts, and the Retired phase (the uninstall path) |
| M12 — Divisions and Offices | the Game Studio Division; binding Office vetoes vs advisory stage gates (§4.7) |
| M11 — department substrate + the six primitives (Standards, Guards, Registries, Stage Models, Review Intensity, evidence-based advancement) | the primitives the Game Studio instantiates (§3.1) |
| M9 — plugin signing chain + Wasm host | verifying the Pack signature (acquire/install); running the three Tier-2 Guard validators (§4.5) |
| M2 — event log | the distribution/lifecycle events on the hash chain (§10) |
| CCGS (MIT), source repository | the assets the compiler transforms (§3); read-only, at a pinned source commit (§7) |

### 16.2 Assumptions

1. The department substrate (M13) is installed and the Registrar can load a Pack and resolve `requires`
   contracts. If a Firm runs "as one implicit department" (M11), the Game Studio installs into it as a distinct
   department; the model is unchanged.
2. The plugin signing chain (M9) is available to verify Pack signatures and Tier-2 Guard Wasm components.
3. The CCGS source is reachable at a pinned commit for the compiler; after import, the Pack is self-contained
   and the Firm never needs CCGS at runtime (§3.2, §15).
4. Non-department distributable types (Role Pack, Playbook Pack, Standards Pack, Integration Pack, Theme —
   `/docs-v2/05-marketplace-and-packs.md` §1) exist in the layer but the *Game Studio* is a Department Pack;
   M14 exercises the Department-Pack path fully and the others only insofar as the shared three-act machinery
   requires.

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| GR-1 | **Fork drift** — the Pack diverges from upstream CCGS over time (R-06) | the maintained compiler, `derived_from` fields, and a divergence log with reasons make drift comprehensible rather than preventing it — the honest ceiling (ADR-0019 "Accepted: fork drift") |
| GR-2 | A `Bash`-declaring agent is granted more than it needed | default to granting nothing and let the first failing Work Order name the need (§3.3; `/docs-v2/03-integration-plan.md` §2) |
| GR-3 | `AskUserQuestion` misclassified → an annoying Firm | per-occurrence judgement at compile, reviewed against the diff (§3.3; `/docs-v2/03-integration-plan.md` §3.2) |
| GR-4 | Uninstall corrupts or drops memory/Artifacts | namespace preserved read-only; Principle 3 forbids deletion; the uninstall test asserts memory readable and Artifacts intact (§8; AC6) |
| GR-5 | The Marketplace grows a private install path bypassing the twelve checks | ADR-0045 forbids it; `install_pack` delegates to M13 with no bypass (§11.3; AC7) |
| GR-6 | A Principal on `lean` for months accumulates less review than they think | show the current mode in the Ledger Line; name it in the Brief whenever a Deliverable shipped with reduced review (ADR-0018 "Accepted: a setting that can be set wrong") |

---

## 17. Acceptance criteria

The nine-item exit list decomposed into testable claims, plus the milestone-invariant checks. **These are the
contract with AntiGravity.** Items 1–9 are the nine-item list (§13); AC-K/AC-R/AC-L are the invariant guards
that must hold across all of them.

| # | Claim | Proven by |
|---|---|---|
| AC1 | The Game Studio Pack installs and passes **all twelve M13 install checks**; any failure is a hard refusal naming the rule, with no override | install-check test over the compiled Pack + a corpus of deliberately-broken variants (item 1; M13 §8) |
| AC2 | All **forty-nine archetypes instantiate** and each produces a valid first Turn | instantiation test over the full roster; each archetype passes the ten-section spec (item 2) |
| AC3 | A title runs **Concept → Pre-Production** producing a concept doc, three GDDs, an architecture doc with ADRs, a seeded entity registry, and a validated vertical slice — no manual intervention beyond Directives and approvals | end-to-end pipeline test asserting each required artifact exists and satisfies its stage pattern (item 3) |
| AC4 | **Every Guard fires at least once** against a deliberately-bad input and blocks | per-Guard adversarial fixture; all twelve (7 declarative + 3 Wasm + the 2 kernel-native parity behaviours) exercised (item 4; §4.5) |
| AC5 | A **cross-department Exchange request** (`capability.security-review` → Cybersecurity) completes and is **charged to the Game Studio's budget** | Exchange test asserting resolution-by-contract, completion, and cost on the requester's budget (item 5; §4.8) |
| AC6 | **Uninstalling the Pack leaves the Firm functional, Artifacts and memory intact and readable** — the isolation proof | uninstall test: kernel+executive still run, `dept.game-development.*` read-only and readable, Artifacts intact, a later `capability.game-design` request fails `contract_unavailable` cleanly (item 6 — headline; §8) |
| AC7 | The Pack is **published** via the working local publisher: twelve checks pass locally, evals published with results, Security-Office capability review, signed with a changelog | publish test asserting each step and that a Pack failing any is not listed (item 7; §5.4) |
| AC8 | The Pack is **acquired**: signature verified, **nothing loaded**; acquire, install, and grant are three separate, independently-refusable, logged acts | three-act test asserting three distinct events and that refusing any leaves the others un-executed (item 8; §5.3) |
| AC9 | **Installation grants no authority**: after acquire+install, the department holds no capability until `grant_pack_capabilities`; a marketplace artifact never arrives with autonomy | authority test asserting zero capability post-install and that grant is a separate Decision with the plain-language list shown (item 9; §5.6) |
| AC-K1 | **The kernel contains no Game-Studio-specific logic** — no department-id literal, no `bash`-hook execution, no second runtime | CI grep over kernel crates fails the build on a hit (G1; F2; `/MASTER_IMPLEMENTATION_GUIDE.md` §3.12) |
| AC-R1 | **Review Intensity never relaxes author ≠ reviewer**: a Deliverable produced under `lean` still has exactly one independent reviewer; there is no `solo`; class-3/Security review is exempt from the dial | property test over the three modes asserting the ADR-0008 reviewer is present in every mode (§6.2; ADR-0018) |
| AC-L1 | **CCGS MIT obligations are met mechanically**: the Pack ships `PROVENANCE.md`, retains the MIT text, states its origin as the first line of the listing, and every compiled artifact carries `derived_from`; a Pack missing any does not publish | attribution check over the compiled Pack; a stripped-provenance fixture is refused (§7; F4) |

---

## Appendix A — Glossary additions

- **Game Studio Pack** — `dept.game-development`, a signed Department Pack compiled from CCGS: 49 Role
  Archetypes, 73 Playbooks, 11 Standards, 12 Guards, 2 Registries, 38 templates, a 7-stage Stage Model, plus
  the manifest, dashboards, evals, and `PROVENANCE.md`. Data, not embedded code.
- **Compile (vs embed)** — transform CCGS assets into Sidra structures once, through a maintained importer,
  recording `derived_from` provenance; the runtime is never imported (ADR-0019).
- **The three acts** — Acquire (download + verify), Install (M13 twelve checks; capabilities *requested*), and
  Grant (a separate Principal Decision). Installation never grants authority
  (`/docs-v2/05-marketplace-and-packs.md` §2).
- **Review Intensity** — a firm-wide setting (`full` / `standard` / `lean`) governing *how much* optional
  review runs; it never relaxes author ≠ reviewer, and there is no `solo` (ADR-0018).
- **Retired (lifecycle phase)** — a department uninstalled: instances retired, Pack disabled, memory namespace
  read-only, history intact. The mechanism behind uninstall-leaves-Firm-working (M13 §7).
- **`derived_from`** — a field on every compiled artifact pointing at its CCGS source file, for attribution and
  for maintenance (`/docs-v2/03-integration-plan.md` §7).

## Appendix B — Repository placement

```
departments/
└── game-development/            NEW — the Game Studio Pack (DATA — twelve-directory M13 contract)
    ├── department.toml          # manifest — hand-authored (P7)
    ├── roles/                   # 49 archetypes         (compiled, derived_from)
    ├── playbooks/               # 73 playbooks          (compiled)
    ├── standards/               # 11 standards          (compiled)
    ├── guards/                  # 12 guards (7 TOML + 3 wasm refs; 2 kernel-native deleted)
    ├── registries/              # entities.yaml, architecture.yaml
    ├── templates/               # 38 templates
    ├── dashboards/              # panel definitions (fixed set, tokens only)
    ├── stage-model.yaml         # 7 stages, evidence-based advancement
    ├── evals/                   # evaluation sets (P7 — original work)
    ├── tools/                   # optional Wasm (the 3 Tier-2 Guard validators)
    └── PROVENANCE.md            # source, MIT text, commit, import date, divergence log

infrastructure/scripts/
└── ccgs-compile/               NEW — the maintained compiler (build-time only; ADR-0019)

services/store/migrations/       EXTENDED — 0016_marketplace_listings.sql, 0017_pack_installs.sql,
                                            0018_marketplace_events.sql  (forward-only, additive)

infrastructure/testing/
└── game-studio/                NEW — the nine-item acceptance harness incl. the uninstall proof
```

**No new kernel crate.** The Marketplace's publish/acquire wiring reuses the M13 install path
(`sidra-departments`) and the plugin signing chain (`sidra-plugins`); it introduces no new trust mechanism and
no department-specific kernel logic (ADR-0045; G1). Dependency direction (ADR-0011) is unchanged: the Pack is
data, the compiler is a build-time script, and the distribution wiring depends on `sidra-departments` and
`sidra-plugins`, never the reverse.

## Appendix C — Implementation position

M14 is the **final** milestone of 2.0 "Concourse", and **2.0 ships at its end** (`/MILESTONE_REGISTRY.md` §2).
It depends on M11 (substrate), M12 (structure), M13 (departments/Registrar/install checks), and M9 (signing
chain/Wasm host). Building it earlier is impossible: the Game Studio is a Department Pack, and before the
department substrate, the Registrar, and the twelve install checks existed there was nothing to install it into
(`/MILESTONE_REGISTRY.md` §2, dependency note; M13 exit criterion).

**Exit criterion.** The nine-item acceptance list, including uninstall-leaves-Firm-working (§13, §17) —
proven by test, not by configuration. Item 6 (AC6) is the headline: uninstalling the Pack leaves the Firm
working, the Layer-3 replaceability proof, and the one most likely to fail on the first attempt.

## Appendix D — CCGS MIT attribution (the obligation, in full)

The Pack's `PROVENANCE.md` MUST contain, at minimum (`/docs-v2/03-integration-plan.md` §7; ADR-0019):

- **Source:** `github.com/Donchitos/Claude-Code-Game-Studios`, the pinned **source commit**, and the **import
  date**.
- **Author / copyright holder:** as stated in the upstream repository's LICENSE.
- **License:** MIT — the **full license text retained verbatim** in the Pack.
- **Origin line:** the Marketplace listing's description **begins** with the CCGS/MIT origin — the first line,
  not a footnote.
- **`derived_from`:** on every compiled archetype, playbook, standard, and guard, pointing at its source file.
- **Divergence log:** every deliberate divergence from upstream, each with its reason.

A Pack missing any of these does not pass the compiler's output check or the Marketplace publish gate (AC-L1).
Legal reviews this at P0, before any compilation begins (`/docs-v2/03-integration-plan.md` §1, §7).
