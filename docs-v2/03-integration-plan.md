# Repository Integration Plan

How `Claude-Code-Game-Studios` becomes `dept.game-development`. Mechanical, reviewable, and reversible.

**Governing rule: compile, do not embed.** Sidra does not vendor the repository and does not run Claude Code.
It compiles CCGS assets into Sidra structures once, records the provenance of every compiled artifact, and
from then on maintains the Pack. Upstream changes are re-imported through the same compiler with a diff
review. ADR-0019.

## 1. Phases

| Phase | Work | Output | Gate |
|---|---|---|---|
| **P0 — Provenance** | Record source commit, license (MIT), attribution obligations | `PROVENANCE.md` in the Pack | Legal department review |
| **P1 — Compile agents** | 49 `.md` agents → 49 Role Archetypes | `roles/*.toml` | Every archetype passes the ten-section spec |
| **P2 — Compile skills** | 73 `SKILL.md` → 73 Playbooks | `playbooks/*.yaml` | Every playbook compiles as a valid DAG |
| **P3 — Compile rules** | 11 rules → 11 Standards | `standards/*.md` | Path globs resolve into the Artifact tree |
| **P4 — Port hooks** | 12 shell hooks → 12 Guards | `guards/*.toml` (+ Wasm validators) | §5 — the honest one |
| **P5 — Adopt registries** | 2 YAML registries → 2 Registries | `registries/*.yaml` | Schema validated; owner field present |
| **P6 — Templates + stages** | 38 templates, 7 stages, gate IDs | `templates/`, `stage-model.yaml` | Artifact checks resolve |
| **P7 — Authoring** | Dashboard, evals, manifest, defaults | `department.toml`, `dashboards/`, `evals/` | The twelve install checks |
| **P8 — Validation** | Install into a test Firm; run a title from Concept to Vertical Slice | Signed Pack v1.0.0 | Quality + Security Office review |

P1 through P6 are mechanical transformation with human review of the diff. P7 is original design work — the
manifest, the evaluation sets, and the dashboard have no CCGS counterpart. P8 is the only phase that can fail
in an interesting way.

## 2. Agent → Role Archetype

Field-by-field. This mapping is the reason the import is cheap.

| CCGS front-matter | Sidra archetype field | Transformation |
|---|---|---|
| `name` | `id` | `lead-programmer` → `lead-programmer` |
| `description` | `role` + routing triggers | Split: the first sentence becomes Role; the when-to-use clauses become routing hints |
| `tools: Read, Glob, Grep, Write, Edit, Bash` | `capabilities` | Mapped to Sidra capabilities. **`Bash` does not map.** Agents that declared it get `tool:code-analysis` and `tool:build-invoke` — narrow, declared, sandboxed. An agent that needs arbitrary shell is an agent that has no capability boundary. |
| `model: sonnet` | `model_class: worker` | Per the table in `02-game-studio-department.md` §3 |
| `maxTurns: 20` | `turn_ceiling: 20` | Direct |
| `skills: [...]` | `playbooks: [...]` | Direct, after P2 |
| `memory: project` | `memory.scope` | `dept.game-development.<archetype>` |
| Body — collaboration protocol | Fence profile + communication rules | The Question→Options→Decision→Draft→Approval protocol becomes the department's default Fence profile, not per-agent prose |
| Body — responsibilities | Responsibilities section | Direct |
| Body — escalation | Decision boundaries (CAN / ESCALATE / NEVER) | Restructured into v1's three-part form; escalation targets rewritten to the Sidra hierarchy |

**What the review must catch.** The mechanical part is easy; the judgement calls are:

- Sixteen CCGS agents declare `Bash`. Each needs an individual decision about what capability it actually
  needed. The default is to grant nothing and let the first Work Order that fails tell us.
- Escalation paths reference `creative-director` / `technical-director` by name. Inside the department this
  still works. Escalations that leave the department must be rewritten to Lyra or to an Exchange contract —
  and a handful of CCGS escalations ("escalate to the user") become "escalate to the Principal", which
  changes meaning subtly, because the Principal is not sitting in the session.
- Three agents (`security-engineer`, `devops-engineer`, `analytics-engineer`) duplicate capability that other
  Sidra departments own. Decision: keep them, scoped to game-specific concerns (anti-cheat, save integrity,
  build pipeline for the title, in-game telemetry), and require an Exchange request for anything firm-wide.
  Documented in the archetype so the boundary is visible rather than assumed.

## 3. Skill → Playbook

CCGS front-matter (`name`, `description`, `argument-hint`, `allowed-tools`, `model`, `user-invocable`) maps
directly onto the Playbook header. The Markdown body — phased instructions, decision points, output format —
becomes the playbook's step definitions.

Three transformations are not mechanical:

1. **`Task` spawns become workflow nodes.** The nine `team-*` skills spawn subagents via the Task tool.
   In Sidra these are workflow DAG nodes with declared inputs, outputs, and parallelism. The CCGS instruction
   "issue all independent Task calls before waiting" is exactly DAG parallelism and translates cleanly.
2. **`AskUserQuestion` becomes an Approval Request or a Clarification.** These are different in Sidra: an
   Approval Request gates an effect; a Clarification asks the Principal a question and blocks the Work Order.
   Each occurrence needs a judgement about which it is, and getting this wrong is the most likely source of
   an annoying Firm.
3. **Gate-ID references resolve to Sidra gates.** `.claude/docs/director-gates.md` gate IDs become entries in
   the department's gate table. The referenced-by-ID pattern is preserved because it is correct.

## 4. Directors → archetypes, not executives

CCGS's Tier 1 is three agents: `creative-director`, `technical-director`, `producer`. Sidra's Game Studio
Division has one executive, Lyra.

They are not the same layer, and collapsing them would have been the easy mistake:

- **Lyra is a Division executive** — routes, arbitrates, holds budget, does no domain work, five tools.
- **The three directors are department archetypes** — they hold the vision, the architecture, and the
  schedule respectively, and they do domain work: they write, review, and produce verdicts.

Keeping all three preserves what CCGS got right: creative and technical authority in genuine tension, with a
producer holding the schedule against both. Collapsing them into Lyra would have produced one agent
arbitrating a conflict it was also having with itself.

Lyra arbitrates *between* the three directors when they deadlock — which is the case CCGS resolves by
escalating to the user, and which Sidra resolves one level lower before it reaches the Principal.

## 5. Hooks → Guards: the honest section

The twelve hooks are the highest-value and lowest-portability assets in the repository.

**What they are:** `bash` scripts receiving JSON on stdin, using `jq`, `git`, `grep`, and the filesystem,
returning exit 0 (allow) or exit 2 (block, with stderr shown to the model).

**Why they cannot be adopted as written:** ADR-0006 gives plugins a deny-by-default Wasm sandbox with no
ambient filesystem, clock, network, or process access. A `bash` hook is the exact opposite: ambient
authority, host-dependent, and unportable across the three platforms Sidra targets. Adopting them would put a
hole in the security model in order to import a validation feature, which is a bad trade at any exchange
rate.

**The port, in three tiers:**

*Tier 1 — declarative (7 of 12).* Most hooks are pattern checks expressible as data:

```toml
[guard.design-doc-sections]
lifecycle = "pre_deliverable"
applies_to = "Artifacts/game/design/**/*.md"
action = "block"
require_sections = ["Overview", "Player Fantasy", "Detailed Design", "Formulas",
                    "Edge Cases", "Dependencies", "Tuning Knobs", "Acceptance Criteria"]
message = "GDD is missing required section: {section}"
```

No code, no sandbox concern, inspectable by reading it. `validate-commit`, `validate-assets`,
`detect-gaps`, `data-values-external`, `test-presence`, `deliverable-provenance`, and `asset-naming` all
land here.

*Tier 2 — Wasm validators (3 of 12).* Where real logic is needed — registry consistency checking, stage
artifact evaluation, asset budget computation — a Wasm component implements a `validate(context) -> verdict`
interface, running under the existing plugin host with fuel metering and no ambient authority. This is a new
extension point (`02-layer-model.md` §7) but not a new mechanism.

*Tier 3 — kernel-native (2 of 12).* `log-agent` and `pre/post-compact` have no business being plugins.
Sidra's audit chain already records every Turn (v1 logging), and context-frame preservation across
compaction is orchestrator behaviour. These two hooks are deleted, not ported, because the kernel already
does the job better.

**What is genuinely lost:** a CCGS user can write a new hook in five minutes with a text editor. A Sidra
Tier-2 Guard requires compiling a Wasm component. That is a real reduction in extensibility, and it is
mitigated but not eliminated by making Tier 1 cover the majority of cases. The trade is deliberate: the
sandbox is worth more than the convenience, and a validation system that can execute arbitrary host commands
is a validation system that can be turned into an exfiltration channel by whoever writes the next Pack.

This is recorded as an accepted consequence in ADR-0016 rather than hidden in an implementation note.

## 6. Registries → Registries

Adopted with semantics intact. Only the location and the schema header change:

| CCGS | Sidra |
|---|---|
| `design/registry/entities.yaml` | `departments/game-development/registries/entities.yaml` |
| `docs/registry/architecture.yaml` | `departments/game-development/registries/architecture.yaml` |
| `source:` field | `owner:` field — same meaning, matches v2 vocabulary |
| Grep patterns in the header | Registry query API; the header comments are kept for humans |
| Written by named skills | `written_by` / `read_by` become declared fields the Registrar validates |

Registry entries feed Canon promotion: a registry fact that survives review and is referenced across
Applications becomes a Canon candidate, promoted by the v1 mechanism (Kai proposes, Principal confirms).
Registries do not become Canon automatically, because a department-owned fact and a firm-wide truth are
different things and conflating them is how one department's assumption becomes everyone's constraint.

## 7. Attribution and licensing

CCGS is MIT. Obligations:

- The Pack ships `PROVENANCE.md` naming the repository, author, license, source commit, and the date of
  import.
- The MIT license text is retained in the Pack.
- The Pack listing states its origin. Not a footnote — the first line of the description.
- Compiled derivatives (archetypes, playbooks, standards) each carry a `derived_from` field pointing at the
  source file. This is for maintenance as much as for attribution: when upstream changes, the compiler needs
  to know what maps to what.

Reviewed by the Legal department at P0, before any compilation work begins.

## 8. Maintaining the relationship with upstream

The Pack is a fork, not a mirror. Upstream continues to develop.

| Situation | Response |
|---|---|
| Upstream adds an agent | Re-run the P1 compiler on the new file; review the archetype; add to the Pack in a minor version |
| Upstream changes a skill | Diff against the `derived_from` source; re-compile if the Pack's version is unmodified, review manually if it has diverged |
| Upstream changes a rule | Standards are cheap to re-import; review for conflicts with Firm Standards |
| Upstream adds a hook | Classify into the three tiers of §5; most will be Tier 1 |
| Sidra diverges deliberately | Record it in `PROVENANCE.md` with the reason. Divergences accumulate and the record is what keeps the fork comprehensible in two years. |

The compiler is a maintained tool in `infrastructure/scripts/`, not a one-time script, precisely so that
re-import stays a routine operation rather than an archaeology project.

## 9. Acceptance

The integration is complete when, in a test Firm:

1. The Pack installs and passes all twelve validation checks.
2. All forty-nine archetypes instantiate and produce a valid first Turn.
3. A title runs Concept → Systems Design → Technical Setup → Pre-Production, producing a concept document,
   three GDDs, an architecture document with ADRs, a seeded entity registry, and a validated vertical slice
   — with no manual intervention beyond the Principal's Directives and approvals.
4. Every Guard fires at least once against a deliberately-bad input, and blocks.
5. A cross-department Exchange request (`capability.security-review` to Cybersecurity) completes and is
   charged to the Game Studio's budget.
6. Uninstalling the Pack leaves the Firm functional and the Artifacts and memory intact and readable.

Item 6 is the one that proves the isolation claim rather than the capability claim, and it is the one most
likely to fail on the first attempt.
