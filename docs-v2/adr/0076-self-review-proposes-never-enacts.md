# ADR-0076 — The self-review proposes and never enacts; structural change remains a Principal Decision

**Status:** Accepted · **Date:** 4.0 "Continuum" design phase · **Supersedes:** —

## Context

Principle 13 requires a quarterly Structure Review of the Firm's own shape — which departments earned their
overhead, which should merge or retire. M29 makes that review a machine. The obvious next step, once a machine
can *identify* a department that should be retired, is to let it *retire* the department: the assessment is
right there, the evidence is attached, why make the Principal do it by hand?

That step is exactly the failure the Master Guide names as failure mode 8 — *"silent structural change… the
org chart edited outside the event log,"* whose signal is *"any admin path that changes the Firm's shape
without producing a Decision"* (`/MASTER_IMPLEMENTATION_GUIDE.md` §10.8) — and it is what Principle 14 forbids:
*"Adding, removing, or restructuring a department is a Decision… There is no meta-layer where organisational
changes escape the audit chain"* (`/docs-v2/02-v2-principles.md` §14). The 4.0 release constraint states the
same thing positively: *the Firm proposes, the Principal confirms* (`/MILESTONE_REGISTRY.md` §4).

The org chart is the highest-stakes thing a self-improving Firm could change about itself. If a machine can
reshape it, every other guarantee in the system is downstream of an org chart the Principal did not knowingly
authorise. The registry exit criterion is unambiguous: the Firm *"may propose, never enact."*

## Options

1. **Assess and enact.** The review identifies an absorbable department and executes the merge/retire itself,
   recording a Decision as a side effect. Fewest Principal steps; directly violates Principle 14 and failure
   mode 8 — a machine changing the org chart, with the Decision as after-the-fact paperwork.
2. **Assess, enact behind an approval.** The review executes the change but gates it on a one-click Principal
   approval. Softer, but still a structural-write path inside M29, and an approval is not a Decision (no
   criteria-first, no reversibility class, no dissent) — it reduces Principle 14's deliberate act to a button.
3. **Assess and propose; the Principal enacts through the existing Decision path.** M29 produces an assessment
   and inert proposals and holds *no* structural-write path at all. The org chart changes only when a Principal
   Decision, recorded through the decision engine, cites a proposal. M29 later observes that link to mark the
   proposal resolved.
4. **Assess only; no proposals.** The review reports health metrics and stops, leaving the Principal to
   formulate any merge/retire themselves. Safe, but throws away the most useful output — the review has the
   evidence to say "this department is absorbable by that one"; withholding the recommendation makes the
   Principal re-derive it.

## Decision

Option 3. M29 assesses and proposes; it never enacts, and **no structural-write path exists in the crate.**

Concretely: M29 exposes one command (`run_structure_review`) and read-only queries; there is no `enact`,
`apply`, `merge`, `retire`, or `restructure` verb anywhere in its surface. Its store handle is read-only for
`departments`, `agents`, and Pack manifests, and write-capable only for its own three tables
(`structure_reviews`, `department_health`, `structure_proposals`). It has no dependency edge to any
structural-mutation path. A `StructureProposal` is an inert record carrying a recommendation and its evidence
and nothing that could enact anything. The only path that changes the org chart is a Principal Decision through
the decision engine — a subsystem M29 does not write to — and M29 links a proposal to such a Decision only by
*reading* the `decisions` table after the fact.

The absence of the structural-write path is enforced at build time (a CI "no structural-write path in M29"
assertion) and at test time (the exit-criterion test: a raised proposal, left alone, leaves the org chart
byte-identical). It is a property of the build, not a policy in a document.

## Consequences

**Accepted: the Principal must take a deliberate step to enact every structural change.** The review cannot
save them that step, by design. For a Firm with many absorbable departments this is real friction — and it is
the friction Principle 14 exists to impose, because the alternative is a Firm that reshapes itself while the
Principal watches.

**Accepted: a correct proposal may sit un-enacted forever.** A proposal at `resolution = Open` is the normal
resting state; M29 has no way to escalate or auto-act on it. A genuinely overhead department may persist
because the Principal never opened the Decision. This is the cost of refusing a meta-layer, and it is cheaper
than the cost of a machine that overrides the Principal's inaction.

**Accepted: two records now describe one structural change.** The proposal (M29) and the Decision (decision
engine) are distinct rows on the chain. An auditor must read both to see "the Firm proposed, the Principal
decided." This redundancy is the point — it makes the two acts separable in the log.

**Gained: Principle 14 becomes a property of the build.** "There is no meta-layer" stops being a promise and
becomes a compile-time fact: the crate holds no verb, no capability, and no edge to change the org chart. The
milestone most tempted to become an admin shortcut is the one that proves the shortcut cannot be written.

**Gained: the audit chain stays legible.** `StructureProposalRaised` and a `decisions` row are distinguishable
forever. "How did the Firm come to be shaped this way" is answered by the Decisions, each of which may cite the
assessment that informed it — never by a silent machine action.

**Gained: the 4.0 constraint holds at its hardest case.** If propose-never-enact holds for the org chart, the
subject where a silent change is most damaging, it holds for the release. M29 is 4.0's proof, not its exception.

**Reversal cost: high, and deliberately so.** Adding an enact path later means adding a structural-write
capability to a kernel crate, a new dependency edge, and a `StructureChanged` event — each a boundary change
requiring its own ADR, and each a direct contradiction of Principle 14. The reversal is expensive because the
decision it reverses is a load-bearing invariant of the whole enterprise model, which is why it has an ADR
before any code exists.
