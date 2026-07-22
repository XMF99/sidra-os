# ADR-0073 — The evaluation set is the archetype's versioned merge gate, and the proposer is never the reviewer

**Status:** Proposed · **Date:** M27 architecture phase (4.0 "Continuum")

## Context

ADR-0072 decides *that* a charter revision must pass a gate and *that* acceptance is a Principal Decision. It
leaves open two questions this ADR answers: **what is the gate made of, and who is allowed to build, run, and
confirm it?** Get these wrong and the mechanism of ADR-0072 is hollow — a gate whose corpus the archetype under
revision can weaken, or a confirmation the proposer can also perform, refuses nothing.

Two things fix the gate's substance:

- **What gates a revision.** GUIDE §3 item 15 names the instrument precisely: *charters are data, versioned,
  with an evaluation set attached; a charter change that regresses its evaluation set does not merge.* ADR-0014
  had already promised evaluation sets as the way an archetype is judged (*"retire an archetype when its
  evaluation sets show it is not earning its place"*), but nothing through M25 made an eval set a real object,
  attached it to an archetype, versioned it, or ran it. M27 must.
- **Who may act on it.** GUIDE §3 item 9 is a non-negotiable: *the author never reviews their own work.* At the
  charter layer this means the archetype whose charter is under revision must have no path to author the eval
  set that gates it, to run the evaluation, or to confirm the result. The evolution engine proposes; the
  mechanical gate and the Principal review.

The temptations are the familiar ones. Let an eval set be an unversioned bag of cases, and a candidate can be
scored against a *different* corpus than its baseline — regression hidden by a moved goalpost (threat T-E4,
architecture §7). Let the archetype (or an agent acting for it) register or edit its own eval set, and the gate
is a lock whose key sits next to it. Let the proposer also confirm, and "author ≠ reviewer" is a slogan, not a
control.

This ADR is deliberately narrow: it adds **no new comparison and no new authority**. The comparison is
ADR-0033's, unchanged; the reviewer control is the Broker + Seat check M3/M21 already enforce for every effect;
the versioning is the `agent_versions` mechanism ADR-0014 already established for charters. M27 makes these
load-bearing at a new site (charter evolution), it does not re-decide them.

## Options

1. **An unversioned eval set, registered by whoever proposes the revision.** Simplest, and it defeats itself
   twice: a candidate can be scored against a weakened corpus (no version to pin the baseline to), and the
   proposer can shape the very gate that judges it. Rejected on T-E4 and GUIDE §3 item 9.
2. **A versioned eval set, but any actor may register and confirm.** Fixes the moved-goalpost (baseline and
   candidate re-run on the *same* `eval_set_version`) but leaves author = reviewer: the archetype under revision
   could still author its gate or an agent could confirm. Rejected: half the control.
3. **No eval set — trust the Principal to eyeball each revision.** Removes the corpus entirely and puts the
   whole judgement on Principal attention. This is exactly what GUIDE §3 item 15 refuses: the gate is machinery,
   not a review heuristic, precisely so a regression cannot be waved through. Rejected.
4. **The evaluation set is a first-class object attached one-to-one to an archetype at a version, is the *sole*
   merge gate (a missing set fails closed), and the proposer is structurally a different subject from the
   reviewer: the engine proposes, the gate runs baseline-and-candidate on the same eval-set version, and only a
   Principal Seat confirms — with the archetype under revision barred from authoring its gate, running its
   evaluation, or confirming its revision.**

## Decision

Option 4.

**The evaluation set is the archetype's versioned merge gate, and the proposer is never the reviewer.**

- **Attached, one-to-one, at a version.** An `EvaluationSet` is bound to exactly one archetype
  (`archetype_id`), carries a `cases` corpus and a `scoring_spec`, and is itself versioned (`eval_set_version`).
  A revision for archetype B can never be gated by archetype A's set — the binding is checked, and a mismatch
  is `Refused{WrongArchetype}` (architecture §4.4, §8.5; threat T-E6).
- **The sole merge gate, and it fails closed.** No charter revision reaches `AwaitingPrincipal` without a
  passing `EvaluationRun` on the archetype's *current* eval-set version. A missing eval set is not "merge
  freely" — it is `Refused{NoEvaluationSet}`, because absence means non-regression cannot be proven
  (architecture §8.4; GUIDE §3 item 15). There is no flag that disables the gate and no path that skips the run
  (ADR-0072; architecture §12.3 rule 2).
- **Baseline and candidate share the version.** The gate runs a `Baseline` (the `base_version` charter) and a
  `Candidate` (the `proposed_charter`) over the *same* `eval_set_version`, with the same seed where the grader
  is deterministic, and compares aggregate scores. An `EvaluationRun` is the only producer of a `Score`, and
  every run is pinned to its eval-set version so the two are never compared across corpora (architecture §4.5,
  §8.2). Baselines are cached per `(eval_set_version, base_version)`.
- **The proposer is a different subject from the reviewer.** `propose_charter_revision` is refused if
  `proposed_by` is an archetype instance — only the evolution engine may propose (architecture §5.3 check 3).
  `register_evaluation_set` is a logged act subject to author ≠ reviewer, so an archetype cannot author the set
  that gates it (architecture §12.1, §14 F10). `confirm_revision` requires a Principal Seat actor and is
  refused for an agent actor, through the Broker, before anything is written (architecture §9 step 2; GUIDE §3
  item 9; ADR-0008).
- **Registration is logged and inspectable.** Eval sets, their cases and scoring spec, and every run's per-case
  results are local data, written to the store and mirrored to the Vault (`evaluation-set.md`), with no secrets
  and no code (architecture §11.3). A weakening of the corpus is therefore a visible, attributable act the
  Principal can inspect.
- **Everything is local.** Evaluation runs execute against local models over a local corpus; scores,
  provenance, and revisions never leave the machine (ADR-0009). This is a permanent no, enforced by a CI
  no-network assertion over a full run (architecture §18; AC10).

## Consequences

**Accepted: an archetype with no eval set cannot be evolved.** Registering a quality corpus is a prerequisite,
not an afterthought — until one exists, every revision of that archetype fails closed. This is real up-front
work, paid deliberately, because the alternative (merge without a gate) is the failure the milestone exists to
prevent (architecture §16.2 assumption 2).

**Accepted: the gate guarantees non-regression against the *declared* set, not omniscience.** A corpus too weak
to catch a real defect will pass a truly-worse charter as "no regression" (risk ER-1). The mitigation is corpus
quality, and it is the Principal's to inspect — eval sets are versioned, registration is logged under author ≠
reviewer, and a self-serving weakening authored by the archetype under revision is refused (architecture §7
T-E4). The gate promises exactly what it can prove.

**Accepted: eval sets are a versioned surface that must be maintained.** Every archetype worth evolving carries
a corpus that grows and is re-versioned over time, and a run must always pin its version. This is bookkeeping
the subsystem cannot shed — it is the very thing that stops a moved goalpost.

**Gained: a moved goalpost is structurally impossible.** Because baseline and candidate re-run on the *same*
`eval_set_version`, swapping in a weaker corpus does not retroactively re-score a passed candidate, and it is a
logged, attributable act besides. The regression a weakened set would hide is caught by the pinning
(architecture §8.2; T-E4).

**Gained: author ≠ reviewer holds at the charter layer with no new mechanism.** The proposer/reviewer split
reuses the Broker + Seat check already in place for every effect (M3/M21); M27 adds the site, not the control.
An agent that tries to author its gate or confirm its revision is refused the same way an agent is refused any
other authority it does not hold (architecture §7 T-E5; F7, F10).

**Gained: the archive outlives the software.** Because eval sets, runs, and revisions are local, inspectable
data mirrored to the Vault, a Principal who abandons Sidra OS keeps a readable record of what gated each
charter, the score that gated it, and who authored the corpus — the whole "how did this charter come to be
shaped this way" question with a traceable answer (architecture §11.3; Principle 14).

**Reversal cost: moderate-to-high.** Once evaluation sets are attached, versioned, and cited by confirmed
revisions, removing the versioning (allowing cross-corpus comparison) or relaxing the author ≠ reviewer split
would silently re-admit the moved-goalpost and self-review failures, and would invalidate the provenance every
confirmed charter carries. Narrowing (a stricter corpus, a tighter actor rule) is cheap; widening the trust
model is a decision with an audience — which is why it is fixed now, in design.
