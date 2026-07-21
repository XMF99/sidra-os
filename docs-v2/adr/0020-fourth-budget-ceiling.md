# ADR-0020 — A fourth budget ceiling at the department

**Status:** Accepted · **Date:** v2 design phase · **Supersedes:** the three nested ceilings in
`/docs/02-architecture/06-ai-routing-strategy.md` §6

## Context

v1 has three nested budget ceilings: turn, engagement, month ($150 default). Each is checked before a model
call; exhaustion pauses the work and raises an Approval Request rather than degrading silently.

At twenty-one departments this is insufficient in a specific way. A runaway Game Studio Engagement can
consume the monthly ceiling, and the first symptom is that Cybersecurity cannot run a threat model. The
ceilings are correct and there is no way to attribute, contain, or reason about spend per capability.

There is also a governance gap: the Cost Office can veto an overrun but has no per-department signal to veto
*against*, and "the Firm spent a lot this month" is not an actionable finding.

## Options

1. **Keep three ceilings; attribute cost after the fact.** No new mechanism. Attribution without enforcement
   means one department can still starve another, and the report arrives after the money is gone.
2. **Per-department monthly budgets replacing the firm ceiling.** Clean attribution; loses the single number
   the Principal actually cares about, and produces twenty-one settings where one existed.
3. **A fourth nested ceiling between engagement and month**, expressed as a share of the Division's
   allocation with a hard cap.
4. **Per-Division ceilings only.** Coarser, fewer settings, and it does not contain a runaway department
   within its Division — which is the actual failure mode.

## Decision

Option 3. Four nested ceilings: **turn → engagement → department → month.**

A department's ceiling is declared in its manifest as a `share` of the Division's allocation plus a
`ceiling_hard` absolute cap. Division allocations are set by Kai within the monthly ceiling.

The three v1 ceilings keep their semantics and their defaults exactly. The department ceiling is inserted,
not substituted.

Exhaustion **pauses the department** and raises one Approval Request. It does not stop the Firm, and it does
not silently downgrade the Model Class — v1's rule, unchanged.

**Autoscaling never raises spend.** More instances means the same money spent with more parallelism. Without
this, "add capacity" becomes a way to route around the Cost Office.

## Consequences

**Accepted: more budget configuration.** Twenty-one shares plus eight Division allocations. Mitigated by
shipping every Pack with a default share and validating at install that a Division's shares sum to ≤ 1.0.

**Accepted: a department can be paused while the Firm has budget remaining.** Correct behaviour, and it will
occasionally feel wrong to a Principal who sees an unspent monthly total. The Approval Request states both
numbers so the choice is informed.

**Accepted: cross-department requests complicate attribution.** Resolved by the rule that cost follows the
requester — Backend asking Cybersecurity for a review spends Backend's budget. Without it, a useful
department is punished for being useful and the budget signal inverts.

**Gained: containment.** A runaway Engagement cannot starve the rest of the Firm.

**Gained: attribution before the fact, not after.** Per-department cost is a dashboard panel and a live
ceiling, not a monthly post-mortem.

**Gained: the Cost Office gets a signal it can act on.** "Game Studio is at 90% of its share on the eighth"
is actionable; "the Firm spent a lot" is not.

**Gained: department health becomes measurable in the currency Principle 13 needs.** Cost per Deliverable per
department is exactly the number the quarterly Structure Review requires.

**Reversal cost: low.** Setting every share to 1.0 with no hard cap restores v1 behaviour.
