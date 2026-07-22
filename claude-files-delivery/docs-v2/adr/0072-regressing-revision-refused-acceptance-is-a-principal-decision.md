# ADR-0072 — A charter revision that regresses is refused at the gate, and acceptance is a Principal Decision

**Status:** Proposed · **Date:** M27 architecture phase (4.0 "Continuum")

## Context

M27 gives the Firm the power to *propose* an improved charter for a Role Archetype, motivated by the outcome
records M26 produces (`CHARTER_EVOLUTION_ARCHITECTURE.md` §1.1). The moment that power exists, one question
decides whether the subsystem is safe or a self-authorising authority wearing a helpful face: **when does a
proposed revision become a real charter version?**

Two failure modes bracket the answer, and 4.0 forbids both:

- **A regression merges.** A revision that scores worse on the archetype's evaluation set, or that quietly
  widens authority (removes a Fence, raises an effect ceiling), reaches a version. GUIDE §3 item 15 is explicit
  that *a charter change that regresses its evaluation set does not merge*, and Principle 14
  (`/docs-v2/02-v2-principles.md` §14) forbids a meta-layer that edits the Firm outside the audit chain.
- **The Firm promotes itself.** A revision merges on the strength of an eval pass alone, with no Principal act
  on the record. The registry's release constraint is absolute: *"Nothing in this release may self-promote"*
  (`/MILESTONE_REGISTRY.md` §4). A charter is a capability ceiling; a Firm that can grant itself a charter has
  granted itself power without a Decision.

The exit criterion pins both halves at once: *a proposed charter revision that regresses its evaluation set is
refused; an accepted one is a Decision the Principal confirmed — proven by test, not by configuration*
(architecture §17 AC1/AC2). This ADR decides the mechanism that makes both true, and makes them true
structurally rather than by policy a reviewer must remember to apply.

"Regress" here is not a new notion. It is failing at *either* of two sites (architecture §10): a numeric drop
on the evaluation set, *or* a widening of authority under ADR-0033's partial order
(`/docs-v2/adr/0033-charter-comparison-is-a-partial-order.md`), where `Wider` and `Incomparable` both count as
widening. Both are computed against the *base* charter version, before any Principal is involved.

## Options

1. **A prose rule: "don't merge a regressing revision, and get the Principal's sign-off."** A document says the
   gate must run and the Principal must confirm. No mechanism. Correct until the first implementer under
   deadline wires a merge path that skips the run or emits an acceptance event the Firm sends to itself — the
   exact silent failure Principle 14 exists to prevent. Rejected: a boundary that lives only in prose is a
   boundary that is forgotten.
2. **The gate refuses regressions, and an eval pass auto-merges the revision.** Keeps the numeric guarantee but
   throws away the second half: an auto-merge on a pass *is* self-promotion. A charter — authority itself —
   would change with no Principal Decision on the record. Rejected on `/MILESTONE_REGISTRY.md` §4 and
   Principle 14.
3. **A Principal confirms every revision, and the gate is advisory.** The Principal is always on the record, so
   self-promotion is avoided — but an advisory gate is a gate a busy Principal waves through, and a regression
   that "looked fine" merges. This puts the numeric guarantee at the mercy of attention. Rejected: the gate
   must be mechanical and *precede* the Principal, so a regression never reaches a human to be waved through.
4. **A mechanical gate that refuses a regressing or widening revision *before* any Principal involvement, and a
   separate, mandatory Principal Decision that is the *only* writer of a charter version.** Two gates, both
   required, neither sufficient alone: (a) the revision passes its evaluation set and does not widen, and (b)
   the Principal confirms it as a Decision on the record. The engine holds no path to write a version; the only
   version-writer is `confirm_revision`, and it requires a Principal Seat actor and a Decision id.

## Decision

Option 4.

**A charter revision that regresses is refused at the gate, structurally, before any Principal involvement; and
acceptance is a Principal Decision that is the sole writer of a charter version.**

- **The regress gate is mechanical and comes first.** On `run_evaluation`, the gate runs a Candidate and a
  Baseline evaluation over the *same* evaluation-set version and computes `relation_to(candidate, base)`
  (ADR-0033). `candidate.aggregate_score < baseline.aggregate_score` → `Refused{EvalRegression}` (terminal).
  `relation ∈ {Wider, Incomparable}` → `Refused{Widening}` (terminal in the automatic path). No evaluation set
  → `Refused{NoEvaluationSet}` (fail closed). Each refusal is terminal and lands a `CharterRevisionRefused`
  event on the hash chain. No Principal is asked; no version is written (architecture §8, §13.1).
- **A surviving revision is *eligible*, not accepted.** An eval pass with `relation ∈ {Same, Narrower}` and
  provenance present moves the revision to `AwaitingPrincipal`. The gate never accepts (architecture §8.6).
- **Acceptance is `confirm_revision`, and it is the only version-writer.** It requires the revision to be in
  `AwaitingPrincipal`, a Principal Seat actor (not an agent), and the base version still current. It creates a
  Decision (`authority: principal`, criteria = the eval report, reversibility ≥ 2, a review date), writes one
  `agent_versions` row (`version = base_version + 1`, `charter = proposed_charter`), and stamps the Decision id
  onto a `CharterRevisionConfirmed` event — atomically (architecture §9, §4.6). The version *cites* the
  Decision that authorised it; there is no version without a Decision.
- **The engine holds no other write path to a version.** This is a compile/CI property, not a convention: CI
  asserts no `agent_versions` write exists outside `confirm`, and that `confirm` is unreachable without a
  passing run (architecture §18; AC7, AC12).

A widening (`Wider`/`Incomparable`) is refused, not routed to the Principal as an improvement: the Firm may not
*propose more authority for itself*. A widening may still enter a charter, but only as a separately-authored
Principal widening Decision that names the widened field — a Charter Amendment, initiated by the Principal,
outside M27's automatic scope, never riding on an eval pass (architecture §10.3).

## Consequences

**Accepted: two mandatory gates, neither sufficient alone.** Every merge pays for both a passing evaluation run
and a Principal confirmation. A non-improving-but-non-regressing revision (a tie on the eval set) still needs
the Principal, and a passing run alone produces no version. This is more ceremony than "let a good score
merge", and it is the ceremony the permanent-no requires: authority never changes without a Decision.

**Accepted: a genuine improvement can be refused at the gate for widening.** A revision that improves a KPI
*and* removes a Fence is refused as a widening even though it "works better", because ADR-0033 folds the mixed
change to `Incomparable`. The better KPI does not travel with the removed Fence; the Principal must author the
widening separately if it is wanted. The line favours refusing authority increases at the margin, on purpose
(architecture §10.3; risk ER-2).

**Accepted: a missing evaluation set means no merge, ever, for that archetype.** An archetype with no
registered eval set cannot be evolved — its revisions fail closed (`Refused{NoEvaluationSet}`). This is correct
behaviour, not a gap: absence means "cannot prove non-regression", and the safe reading of that is refusal
(architecture §8.4; GUIDE §3 item 15).

**Gained: "does not self-promote" is a property of the build, not a promise in a document.** The absent
version-write edge outside `confirm`, and the unreachability of `confirm` without a passing run, are CI
assertions. The guarantee survives implementers who never read this ADR — the same discipline ADR-0067 applied
to the structure/data boundary.

**Gained: the exit criterion becomes a mechanical assertion.** "A regressing revision is refused" is a
regressing-fixture test asserting `Refused{EvalRegression}` with zero versions written; "an accepted one is a
Principal Decision" is the presence of a Decision record and a `version → decision_id` link on the hash chain
(architecture §17 AC1/AC2). Neither relies on configuration or review.

**Gained: the Firm gains the power to ask, never the power to grant itself.** M27 adds the gate *ahead* of the
Principal and the Decision *at* acceptance; it removes nothing. The choke point that already governs every
effect (the Broker, the Decision engine) now governs charter change too (architecture §7).

**Reversal cost: high.** Once charter versions cite the Decisions that authorised them, and old Turns replay
against the version they ran under (ADR-0014, ADR-0002; `turns.agent_version`), loosening the rule — letting an
eval pass auto-merge, or letting the engine write a version — would break the audit chain every confirmed
charter depends on and re-open the self-promotion failure mode the release is built against. This is a decision
to make now, in design, before any version exists — which is why it is an ADR.
