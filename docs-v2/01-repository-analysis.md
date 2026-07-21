# Repository Analysis — Claude-Code-Game-Studios

Source: `github.com/Donchitos/Claude-Code-Game-Studios` (MIT). Analysed at the commit available on the
current default branch. 417 files, 6.0 MB.

**Position.** This repository is not the foundation of Sidra OS. It is the foundation of *one department*.
It is, however, the most complete existing implementation of the problem v2 is solving — an AI organisation
with roles, hierarchy, standards, gates, and lifecycle — and six of the ten gaps identified in
`00-overview/01-v1-review.md` §3 are answered by patterns first seen here.

## 1. Inventory

| Asset | Count | Location |
|---|---|---|
| Agents | 49 | `.claude/agents/*.md` |
| Skills (slash commands) | 73 | `.claude/skills/*/SKILL.md` |
| Hooks | 12 | `.claude/hooks/*.sh` |
| Rules (path-scoped) | 11 | `.claude/rules/*.md` |
| Templates | 38 | `.claude/docs/templates/` |
| Registries | 2 | `design/registry/entities.yaml`, `docs/registry/architecture.yaml` |
| Coordination docs | 18 | `.claude/docs/` |
| Engine reference | 3 engines | `docs/engine-reference/{godot,unity,unreal}/` |
| Testing framework | separate tree | `CCGS Skill Testing Framework/` |

Configuration entry point is `CLAUDE.md` at the root, which uses `@`-imports to pull in directory structure,
technical preferences, coordination rules, coding standards, and context management.

## 2. The agent hierarchy

Three declared tiers, plus an engine-specialist set selected by which engine the project uses.

| Tier | Count | Model | Members |
|---|---|---|---|
| **Tier 1 — Leadership** | 3 | Opus | `creative-director`, `technical-director`, `producer` |
| **Tier 2 — Department leads** | 8 | Sonnet | `game-designer`, `lead-programmer`, `art-director`, `audio-director`, `narrative-director`, `qa-lead`, `release-manager`, `localization-lead` |
| **Tier 3 — Specialists** | 24 | Sonnet / Haiku | systems/level/economy designers; gameplay, engine, AI, network, tools, UI programmers; technical artist; sound designer; writer; world-builder; QA tester; performance analyst; DevOps; analytics; UX; prototyper; security; accessibility; live-ops; community |
| **Engine specialists** | 14 | Sonnet | Godot (5), Unity (5), Unreal (4) — leads plus sub-specialists for shaders, C#, GDExtension, DOTS, Addressables, Blueprints, GAS, replication, UMG |

**Assessment.** This is the same three-tier shape Sidra OS v1 arrived at independently (executive / head /
specialist) and the same model-tier split as v1's Model Classes (ADR-0005): a reasoning tier for
synthesis and gate verdicts, a working tier for authoring and implementation, a fast tier for status checks
and formatting. Two systems designed separately converging on the same partition is meaningful corroboration
that the partition is real.

**Agent file format.** YAML front-matter plus a Markdown body:

```yaml
---
name: lead-programmer
description: "..."                      # includes when-to-use triggers
tools: Read, Glob, Grep, Write, Edit, Bash
model: sonnet
maxTurns: 20
skills: [code-review, architecture-decision, tech-debt]
memory: project
---
```

The body carries: a collaboration protocol, key responsibilities, delegation rules, and escalation paths.
This maps almost field-for-field onto a Sidra Role Archetype — `tools` → capabilities, `model` → Model Class,
`maxTurns` → turn ceiling, `skills` → playbooks, `memory` → memory scope. The mapping is in
`03-integration-plan.md` §2.

## 3. Skills

73 skills, each a directory containing `SKILL.md` with front-matter:

```yaml
---
name: gate-check
description: "..."                      # with natural-language triggers
argument-hint: "[target-phase] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Task, AskUserQuestion
model: opus
---
```

Categories: authoring (`design-system`, `create-architecture`, `ux-design`), planning (`create-epics`,
`create-stories`, `sprint-plan`, `estimate`), implementation (`dev-story`, `prototype`, `vertical-slice`),
review (`code-review`, `design-review`, `review-all-gdds`, `architecture-review`), quality (`qa-plan`,
`regression-suite`, `soak-test`, `test-evidence-review`, `test-flakiness`), release (`release-checklist`,
`launch-checklist`, `day-one-patch`, `hotfix`, `patch-notes`), operations (`sprint-status`, `scope-check`,
`retrospective`, `milestone-review`), team orchestration (nine `team-*` skills that spawn multiple agents),
and meta (`skill-improve`, `skill-test`, `adopt`, `onboard`, `help`).

**Assessment.** A CCGS skill is a Sidra **Playbook**: a named, parameterised procedure with declared tool
access, a model class, and a defined output. The `team-*` skills are Sidra **Workflows** — multi-agent DAGs
with parallel phases. The distinction CCGS draws between "spawn in parallel when inputs are independent" and
sequential phases is exactly v1's workflow DAG semantics.

## 4. Hooks

Twelve shell scripts wired to Claude Code lifecycle events in `.claude/settings.json`:

| Hook | Event | Purpose |
|---|---|---|
| `session-start.sh` | SessionStart | Load project state |
| `detect-gaps.sh` | SessionStart | Report missing required artifacts |
| `validate-commit.sh` | PreToolUse(Bash) | Block commits whose design docs lack required sections |
| `validate-push.sh` | PreToolUse(Bash) | Pre-push validation |
| `validate-assets.sh` | PostToolUse | Asset naming and budget checks |
| `validate-skill-change.sh` | PostToolUse | Skill authoring conformance |
| `log-agent.sh` / `log-agent-stop.sh` | SubagentStart/Stop | Audit trail |
| `pre-compact.sh` / `post-compact.sh` | Compaction | Preserve state across context compaction |
| `session-stop.sh` | SessionEnd | Persist state |
| `notify.sh` | Notification | Surface events |

**Assessment — and the important finding.** These are the missing primitive from v1: *deterministic
validation at defined lifecycle points*. Sidra v1 has Fences (may I?) and effect classes (how dangerous?) but
nothing that runs a check at "before this Deliverable is accepted" or "at the start of a session". That gap
is real and general, and it is why v2 introduces **Guards** (ADR-0016).

They cannot, however, be adopted as written. They are `bash` scripts reading JSON from stdin, using `jq` and
`git`, with ambient filesystem access. Sidra's plugin model (ADR-0006) is deny-by-default Wasm with no
ambient authority, and v1's security model exists precisely to prevent this shape of extension. The
resolution — declarative Guard specifications plus portable Wasm validators — is in `03-integration-plan.md`
§5, along with an honest account of what is lost.

## 5. Rules

Eleven path-scoped Markdown files with a front-matter path glob:

```yaml
---
paths:
  - "src/gameplay/**"
---
```

Covering: gameplay code, engine code, AI code, UI code, network code, shader code, prototype code, data
files, design docs, narrative, and test standards. Content is specific and enforceable — the gameplay rule
mandates that all gameplay values come from external config, that all time-dependent calculations use delta
time, that no gameplay code references UI directly, and it shows correct/incorrect code side by side.

**Assessment.** This is the second missing primitive: **Standards** — rules scoped by artifact path rather
than by agent, automatically injected into the frame of whoever touches a matching file. v1 had one implicit
standard for one codebase. Twenty-one departments need scoped, inheritable, enforceable standards. The
inheritance model (firm > application > department, tighten but never relax) is a v2 addition; the
path-scoping mechanism is adopted directly.

The pairing of a rule with a *Guard that enforces it* is the pattern worth stealing wholesale: a standard
nobody checks is a comment.

## 6. Registries

Two YAML files, and the most quietly sophisticated thing in the repository.

`design/registry/entities.yaml` — every named game-world fact appearing in more than one document.
`docs/registry/architecture.yaml` — every architectural stance that constrains how other systems must be
built.

The rules, from the file headers:

- Register only facts that cross a boundary; internal-only facts stay internal.
- **Never delete an entry — mark it deprecated or superseded.**
- Each entry has a `source`: the authoritative document that owns this fact. Others list themselves in
  `referenced_by`.
- When a value changes: update, set `revised`, record the old value and what changed it.
- Each file documents which skills write it and which read it, and at which phase.
- Each documents grep patterns for retrieval.

**Assessment.** This is Sidra's Canon with three properties Canon did not have: a named owner per fact, an
explicit reverse-reference list, and append-only-with-deprecation semantics. All three are strictly better
for a multi-department Firm, where "who owns this fact" is the question that decides every cross-department
consistency dispute. Adopted as **Registries** in ADR-0017 — as a structured, department-owned projection
that feeds Canon, not as a replacement for it.

## 7. Stage model and gates

Seven production stages: Concept → Systems Design → Technical Setup → Pre-Production → Production → Polish →
Release. Current stage is a single line in `production/stage.txt`. `workflow-catalog.yaml` declares, per
stage, the ordered steps, which are required vs. optional, and — critically — an **artifact check** per step:
a file glob plus an optional content pattern that determines completion automatically.

`.claude/docs/director-gates.md` defines shared gate prompts by ID (`CD-PILLARS`, `TD-PHASE-GATE`, …) so
skills reference a gate rather than embedding a prompt, which the document says explicitly is to prevent
drift.

`/gate-check` produces PASS / CONCERNS / FAIL. Notably, the catalogue states that gate verdicts are
**advisory** — they inform but never hard-block; the user always decides whether to proceed.

**Assessment.** Three things worth taking:

1. **Per-domain lifecycles.** v1 has one generic Engagement lifecycle. Games need seven stages; a marketing
   campaign does not. Stage Models become a per-department declaration.
2. **Completion by artifact evidence, not by assertion.** Progress is measured by whether the artifact exists
   and contains what it should. This is the same instinct as v1's "nothing important is ephemeral" and it is
   more rigorous than v1 currently is about phase transitions.
3. **Gate prompts referenced by ID, not embedded.** Correct, and generalises immediately: v2 Standards and
   Guards are referenced by ID from playbooks for exactly the reason CCGS gives.

The advisory-verdict choice is right for a solo developer with Claude Code and wrong for Sidra, where the
Quality and Security Offices hold real vetoes. v2 keeps the mechanism and changes the default: department
stage gates are advisory; Office vetoes are binding. Both exist, they are different things, and CCGS
conflated them because it had no Offices.

## 8. Review Intensity

`production/review-mode.txt` holds one word: `full`, `lean`, or `solo`. Any gate-using skill accepts
`--review` to override for one run.

| Mode | Behaviour |
|---|---|
| `full` | Every gate runs at every step |
| `lean` | Phase gates only — the default |
| `solo` | No director gates |

**Assessment.** This is the answer to a problem v1 named but did not price. ADR-0008 requires that the author
never reviews their own work, which is correct and non-negotiable. But it says nothing about *how many
optional reviews* run, and at twenty-one departments the difference between full and lean review is a
substantial fraction of the Firm's cost and latency.

Adopted as **Review Intensity** (ADR-0018), with one change: Sidra's `lean` cannot disable the ADR-0008
reviewer, and there is no `solo`. The three modes become `full` / `standard` / `lean`, where `lean` still
guarantees one independent reviewer per Deliverable. CCGS could offer `solo` because a human is in the loop
on every action; Sidra runs autonomously within Fences, and the two situations do not carry the same risk.

## 9. Collaboration protocol

`CLAUDE.md` mandates **Question → Options → Decision → Draft → Approval** for every task: agents must ask
before writing files, show drafts before requesting approval, and never commit without instruction.

**Assessment.** Philosophically identical to Sidra's approval model, mechanically much more conservative —
every file write asks, where Sidra asks based on effect class. The difference is legitimate: CCGS has no
Fences, no capability broker, and no budget ceilings, so per-action approval is the only control available.
Sidra has all three, so it can be more autonomous with less risk.

In the Game Studio Department, this protocol becomes the department's **default Fence profile** — Principal-
adjustable, defaulting toward the CCGS posture because game development involves large irreversible creative
commitments where an early wrong turn is expensive. Sensible default, not a hard-coded rule.

## 10. What is deliberately not adopted

| Not adopted | Why |
|---|---|
| Claude Code as the runtime | Sidra has its own kernel, orchestrator, and Turn lifecycle. CCGS assets are *compiled into* Sidra structures; the runtime is not imported. |
| `Task`-tool subagent spawning | Sidra's orchestrator owns agent lifecycle. Same concept, different implementation. |
| Bash hooks as executables | Deny-by-default sandbox (ADR-0006). Ported to Guards. §4. |
| Slash-command UX | Sidra has the command palette. `/gate-check` becomes a palette verb; the underlying playbook is unchanged. |
| Advisory-only gates | Kept for stage gates; Office vetoes are binding. §7. |
| `solo` review mode | Would disable ADR-0008. §8. |
| Agent-teams experiment | Sidra's parallelism is workflow DAGs with durable state, which is strictly better than parallel sessions coordinated by a shared file. |
| Engine reference trees | Adopted as department knowledge sources (ingested), not as repository structure. |

## 11. Summary

| CCGS asset | Becomes in Sidra | Where |
|---|---|---|
| 49 agents | 49 Role Archetypes in the Game Studio Pack | ADR-0014 |
| 73 skills | 73 Playbooks | v1 workflow engine, unchanged |
| 11 rules | 11 department Standards + the Standards primitive | ADR-0016 |
| 12 hooks | 12 Guards + the Guard primitive | ADR-0016 |
| 2 registries | 2 department Registries + the Registry primitive | ADR-0017 |
| 38 templates | Department templates | Pack contract |
| 7 stages + catalogue | Department Stage Model | Pack contract |
| Director gates by ID | Referenced Standards and gate IDs | Pack contract |
| Review modes | Review Intensity, firm-wide | ADR-0018 |
| 3 model tiers | v1 Model Classes | ADR-0005, unchanged |
| 3-tier hierarchy | Division / department / specialist | ADR-0012 |

Six general-purpose primitives extracted from one domain-specific repository, and one department founded.
That ratio is the reason this analysis was worth doing at this depth.
