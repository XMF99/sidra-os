# ADR-0019 — Compile Claude-Code-Game-Studios; do not embed it

**Status:** Accepted · **Date:** v2 design phase

## Context

`Claude-Code-Game-Studios` (MIT) contains 49 agents, 73 skills, 12 hooks, 11 rules, 38 templates, 2
registries, a seven-stage production model, and a director-gate system. It is the most complete existing
implementation of the problem Sidra OS v2 solves, for one domain.

It is also built for a different runtime. CCGS agents are Markdown files with YAML front-matter, spawned by
Claude Code's `Task` tool; skills are slash commands; hooks are `bash` scripts wired to Claude Code lifecycle
events; state lives in files like `production/stage.txt`.

Sidra OS has its own kernel, orchestrator, Turn lifecycle, event log, and permission broker.

## Options

1. **Embed: vendor the repository and run Claude Code as a subprocess for game work.** Fastest to a working
   Game Studio; requires shipping and sandboxing a second agent runtime, gives it ambient shell access,
   breaks the audit chain for everything it does, bypasses the Permission Broker, and produces a department
   that is architecturally unlike every other department.
2. **Reimplement: read CCGS for inspiration, write the Game Studio from scratch.** Clean, and it discards the
   most valuable asset — 49 tested role definitions and 73 tested procedures — in favour of a worse version
   of the same thing.
3. **Compile: transform CCGS assets into Sidra structures through a maintained importer, recording
   provenance for every artifact.**
4. **Bridge: keep CCGS assets in their native format and add a Sidra adapter that interprets them at
   runtime.** Preserves upstream fidelity; means the kernel understands two agent formats forever, and the
   second one has no capability model.

## Decision

Option 3. A maintained compiler in `infrastructure/scripts/ccgs-compile/` transforms:

- 49 agents → 49 Role Archetypes
- 73 skills → 73 Playbooks
- 11 rules → 11 Standards
- 12 hooks → 12 Guards (three tiers — ADR-0016)
- 2 registries → 2 Registries (ADR-0017)
- 38 templates, 7 stages, gate IDs → Pack contents

Every compiled artifact carries `derived_from`. The Pack ships `PROVENANCE.md` with the source commit, the
MIT license, attribution, and — critically — **every deliberate divergence with its reason**.

The compiler is maintained, not run once. Upstream changes are re-imported through it with a reviewable diff.

## Consequences

**Accepted: compilation is work, and some of it is judgement rather than transformation.** Sixteen agents
declare the `Bash` tool with no Sidra equivalent; each needs an individual capability decision. Escalation
paths referencing "the user" must become "the Principal", which changes meaning because the Principal is not
sitting in the session. `AskUserQuestion` must be classified per occurrence as an Approval Request or a
Clarification, and getting that wrong produces an annoying Firm.

**Accepted: fork drift.** R-06. The Pack diverges from upstream over time. Mitigated by the maintained
compiler, `derived_from` fields, and a divergence log with reasons — which makes drift comprehensible rather
than preventing it. That is the honest ceiling.

**Accepted: some CCGS capability does not survive.** Bash hooks lose their five-minute authoring loop
(ADR-0016). Slash-command UX becomes palette verbs. The agent-teams experiment is dropped for workflow DAGs.

**Gained: one architecture.** The Game Studio is a Department Pack like every other, subject to the same
isolation, the same capability model, the same audit chain, the same budget ceilings. No second runtime, no
ambient shell, no special case in the kernel — which is also the test that the Pack contract is real.

**Gained: 49 tested roles and 73 tested procedures**, at the cost of transformation rather than authorship.

**Gained: six general-purpose primitives.** Standards, Guards, Registries, Stage Models, Review Intensity, and
the evidence-based-advancement pattern were all extracted from this analysis and now serve all twenty-one
departments. That extraction is worth more than the department, and it is only visible because the assets
were read closely enough to compile rather than skimmed for inspiration.

**Gained: license compliance is straightforward.** MIT, attributed, with provenance recorded per artifact.

**Reversal cost: low for the mechanism, high for the effort.** The Pack is data; discarding it breaks nothing.
Recreating the compilation work would be expensive.
