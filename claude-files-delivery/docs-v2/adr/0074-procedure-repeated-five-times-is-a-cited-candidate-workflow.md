# ADR-0074 — A procedure repeated five times is proposed as a cited candidate Workflow; activation is a Principal Decision

**Status:** Proposed · **Date:** 4.0 "Continuum" design phase · **Supersedes:** —

## Context

The `playbooks` table has carried, since 1.0, a `derived_from` column (*"JSON array of engagement ids"*), a
`status` domain of `proposed | active | retired`, a `uses` counter, and a `success_rate`
(`/docs/04-database-design.md` §6). The Workflow engine already states that *"Playbooks are templates learned
from experience … so a new procedure needs no code"* (`/docs/01-workflow-engine.md` §9), and the Mission
Engine already writes, on `mission.concluded`, an outcome record that is *"a procedural memory candidate"*
carrying the Mission's shape (`/docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` §23.3). Every piece of
the loop exists except the one that writes `derived_from` and sets `status='proposed'`. M28 is that piece.

The registry fixes the behaviour precisely (`/MILESTONE_REGISTRY.md` §4, M28): *"Repeated procedures observed
in Missions compile into candidate Workflows … A procedure repeated five times is proposed as a Workflow; the
proposal cites the Missions it derives from."* Two things are non-negotiable in that sentence. First, the
output is a *proposal* — a candidate, not a running Workflow. Second, the proposal *cites* its source Missions
— provenance is part of the definition, not an optional annotation.

This sits inside the 4.0 constraint that governs the whole release: *"Nothing in this release may self-promote:
the Firm proposes, the Principal confirms"* (`/MILESTONE_REGISTRY.md` §4), which is Principle 14
(`/docs-v2/02-v2-principles.md`: *"The Firm's own structure is subject to the Firm's own rules"* — a structural
change is a Decision) and `/MASTER_IMPLEMENTATION_GUIDE.md` §12 (the permanent nos). A subsystem that turns a
compiled candidate into a running procedure on its own has widened the Firm's standing capability without a
Principal Decision, which is exactly the failure mode 4.0 is defined against.

The open question this ADR answers: **what does the five-recurrence event produce, and what does it take to
make that thing run?**

## Options

1. **Auto-activate the compiled Workflow.** On the fifth recurrence, promote the procedure straight to an
   `active` playbook the engine will run. Simplest loop, and precisely the self-promotion the release forbids.
   A procedure that recurred five times *because a model kept choosing it* would become standing capability
   with no human in the loop.
2. **Compile a candidate but make the citation optional.** Propose a `proposed` playbook; record
   `derived_from` when convenient. Cheap, but a proposal whose provenance can be null is a proposal the
   Principal cannot audit — "why is the Firm suggesting this?" has no answer, defeating the point of a cited
   proposal.
3. **Compile a *cited* candidate at the threshold; leave it `proposed`; require a Principal Decision to
   activate; forbid capability widening.** The five-recurrence event produces a `WorkflowCandidate` in status
   `proposed`, with `derived_from` naming the ≥5 distinct Missions (a construction precondition), a capability
   ceiling equal to the union of what the source procedures actually held, and a frozen definition that passes
   the Workflow validator. It runs only after the Principal activates it, and activation is a Decision.
4. **Don't compile at all; only surface a hint.** Show the Principal "you've done this five times" and let them
   author a Playbook by hand. Safe, but throws away the compiled artifact the schema was built to hold, and
   makes the loop the registry describes ("compile into candidate Workflows") a notification instead.

## Decision

**Option 3.**

- A procedure that recurs across **five distinct Missions** is **compiled into a `WorkflowCandidate`** in
  status `proposed` — the exact `playbooks` status already in the schema.
- The candidate's **`derived_from` names the ≥5 distinct Missions** (as engagement ids, the column's existing
  meaning) it was compiled from. **The citation is mandatory:** a `WorkflowCandidate` cannot be constructed
  with fewer than five distinct cited Missions. Provenance is a precondition of existence, not a nullable field.
- The candidate is **never auto-activated.** The only transition into `Activated` carries a Principal
  `DecisionId`; there is no automatic edge. Activation promotes the playbook `proposed → active`, after which
  the M7 Workflow engine may instantiate it. Rejection is the symmetric Decision, promoting to `retired`.
- The candidate's **capability ceiling is the union of the capabilities its source Work Orders actually held.**
  A compiled definition requiring any capability outside that ceiling is **refused at proposal**, not clamped —
  default-deny holds (security model §5). The Firm cannot propose itself a broader capability than it exercised.
- Five is **distinct** Missions: a single Mission replayed or retried counts once (`UNIQUE(signature_hash,
  mission_id)`), so recurrence is genuinely *across* Missions.

This reuses the `playbooks` model rather than adding a store: the candidate *is* a `proposed` playbook, plus a
`workflow_candidates` provenance projection for the signature, ceiling, and normalized shape the base table has
no column for.

## Consequences

**Accepted: a compiled candidate that may sit unactivated forever.** A genuinely useful procedure the Principal
never gets around to activating delivers no automation — the compile cost bought a proposal nobody actioned.
This is the deliberate cost of propose-never-enact: the alternative (auto-activation) is the failure the
release exists to avoid, and an ignored proposal is strictly safer than an unwanted standing capability.

**Accepted: the five threshold is a fixed heuristic.** Five distinct Missions may be too many for a rare-but-
valuable procedure and too few for a noisy one. It is fixed by the registry exit criterion and deliberately not
made configurable, because a configurable threshold is a dial for lowering the bar on self-proposal, and 4.0's
point is not to have one.

**Accepted: mandatory citation blocks a candidate whose provenance cannot be reconstructed.** If a Mission's
outcome record cannot be projected to a citable engagement id, its recurrence cannot contribute to a proposal.
This is correct: an uncitable proposal is unauditable, and an unauditable proposal must not exist.

**Gained: the closed learning loop the schema was built for, without self-promotion.** `derived_from` finally
has a writer; `status='proposed'` finally has a producer; and the loop stays inside Principle 14 — every
procedure the Firm runs traces to a Principal Decision, and "how did the Firm come to have this procedure" has
a logged answer.

**Gained: no new promotion mechanism.** Activation is the existing Decision engine; the candidate is the
existing `playbooks` row; the runner is the existing M7 engine. M28 adds a proposal source and removes no gate.

**Gained: no self-widening.** The ceiling makes it structurally impossible for a learned procedure to grant the
Firm more than it already exercised — the one way a learning loop could quietly escalate capability is closed
at compile time.

**Reversal cost: low.** A candidate is inert until activated; disabling M28 leaves the `playbooks`,
`workflows`, and `workflow_steps` tables exactly as M7 left them, and the additive `procedure_observations` /
`workflow_candidates` / `candidate_activations` projections can be ignored or dropped. No Mission, no Workflow,
and no Decision is retroactively changed. Removing the citation requirement later would be a widening of
behaviour that itself needs an ADR — which is the correct asymmetry.
