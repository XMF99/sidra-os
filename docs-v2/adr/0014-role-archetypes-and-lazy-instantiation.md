# ADR-0014 — Role Archetypes and lazy instantiation

**Status:** Accepted · **Date:** v2 design phase · **Supersedes:** "The Firm is eleven agents"
(`/docs/03-agents/01-agent-architecture.md` §1); defends the ≤400 MB idle budget in
`/docs/01-product/01-prd.md`

## Context

v1: eleven agents, eleven hand-written charters, all resident. Tractable, and the residency was what made the
idle memory budget of 400 MB meaningful.

v2: twenty-one departments at roughly five roles each is about a hundred charters, and the Game Studio alone
contributes forty-nine. Writing and maintaining a hundred individual charters is a maintenance problem;
instantiating them all is a memory problem; putting them all in a routing frame is a context problem.

## Options

1. **Write every charter individually, all resident.** v1's approach multiplied. Breaks the memory budget,
   the maintenance budget, and the context budget simultaneously.
2. **One generic agent, specialised by prompt at call time.** Cheap, and it destroys everything v1 built:
   no per-agent memory, no KPIs, no pruning, no personality, no accountability. Principle 10 dies.
3. **Archetypes (templates, data) with lazily instantiated Instances (live agents).** Roles declared in the
   Pack; the Registrar creates instances on demand and retires them when idle.
4. **Archetypes with eager instantiation.** Keeps the template benefit, loses the memory benefit.

## Decision

Option 3. A Role Archetype is a charter template — data in a Department Pack, using v1's ten-section
employee-specification format plus four fields (`model_class`, `capabilities`, `standards`,
`instantiation`). An Agent Instance is a live agent created by the Department Registrar with its own ID,
memory, and KPI history.

Instantiation policy per archetype: `eager` (heads), `on_demand` (most specialists), `scheduled`.
Autoscale bounded in the manifest, never exceeding the department's budget sub-ceiling.

**An instance's charter is frozen at instantiation.** Archetype changes do not retroactively alter existing
instances.

## Consequences

**Accepted: two concepts where v1 had one.** Every discussion of "an agent" now needs to specify which. The
distinction is real but it is a teaching cost on every future document and every future engineer.

**Accepted: instance lifecycle is machinery to build.** Creation, retirement, idle detection, autoscale,
identity allocation. It lives in the Registrar and it is genuinely new code.

**Accepted: first-use latency.** An `on_demand` archetype's first Work Order pays instantiation cost. Small,
but real, and it will occasionally be the difference between a Directive feeling instant and feeling slow.

**Accepted: a frozen charter can be stale.** An instance running under an old archetype version continues
until a natural boundary. Correct for reproducibility, occasionally confusing when an archetype was fixed and
a running instance still has the bug.

**Gained: the 400 MB idle budget survives.** An uninstantiated archetype costs a manifest entry. Forty-nine
game archetypes with four live instances is the same footprint as v1.

**Gained: reproducibility.** An Engagement from last month replays exactly, because the instance's charter
did not change underneath it. The event log records archetype version and instance ID on every Turn — without
freezing, the audit chain would describe agents that never existed.

**Gained: charters become reusable.** `code-reviewer` is written once and installed in four departments, with
separate instances and separate memory in each.

**Gained: v1's KPI pruning extends naturally.** Retire an instance, keep the archetype. Retire an archetype
when its evaluation sets show it is not earning its place.

**Reversal cost: low-moderate.** Making all archetypes `eager` restores v1 behaviour with one manifest field
and no schema change. The distinction itself is harder to unwind, but there is no reason to.
