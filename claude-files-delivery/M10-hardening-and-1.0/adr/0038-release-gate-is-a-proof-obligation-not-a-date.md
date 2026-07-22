# ADR-0038 — The 1.0 release gate is a proof obligation, not a date

**Status:** Proposed · **Date:** M10 design phase · **Supersedes:** — · **Source:** `/docs/01-implementation-plan.md`
§M10, `/docs/02-testing-and-quality.md`, `/MILESTONE_REGISTRY.md` §4, `/MASTER_IMPLEMENTATION_GUIDE.md` §3/§6

## Context

M10 is the final milestone of 1.0 "Atrium". At the end of M9 the product is feature-complete: eleven agents,
five memory layers, the six engines, the shell, the plugin host, the encrypted Vault, and a hash-chained event
log all exist and pass their own exit criteria (roadmap, 1.0). Nothing new needs building for the product to be
whole.

The registry fixes M10's exit criterion as **thirty days dogfooding, zero data loss, zero unlogged effects**
(registry §4; impl-plan §M10). But it does not say what *kind* of thing the release gate is. Under schedule
pressure the most likely failure is that "ship 1.0" resolves to a date on a calendar, and the durability,
security, and boundedness work is trimmed to fit it — a budget quietly raised to pass a gate, a red gate
"temporarily" disabled, a feature slipped in during the hardening window, a dogfood window declared complete
after twenty mostly-clean days. Each of these ships a product that has not actually been proven, while
appearing to satisfy the milestone.

The guide already forbids the individual moves in principle: performance budgets are CI gates and "if a budget
is exceeded, do less work — do not raise the number" (GUIDE §3, non-negotiable 16); a budget can be raised only
by an ADR arguing the Principal is better off (testing §6); "substantially done is not a state" (GUIDE §6). What
is *not* recorded anywhere is the shape of the release decision itself: that 1.0 ships on a demonstrated proof,
that the proof bounds what hardening may do, and that no date overrides it. M10 is where that boundary is
decided, and per GUIDE §8 a Principal-facing release boundary needs a record.

## Options

1. **Leave it implicit.** The exit criterion is in the registry; assume the team honours it. No new record.
   In practice an unstated gate is the first thing traded away under pressure, because trading it violates no
   written rule — precisely the gap this ADR closes.
2. **Set a target date and treat the exit criterion as a checklist to complete by then.** Predictable for
   planning; inverts the priority. When the date and the proof conflict, a date-anchored release ships the
   unproven product, which is the failure mode 1.0 exists to avoid.
3. **Make the release gate a proof obligation with no date.** 1.0 ships when the proof is demonstrated and not
   before; hardening is bounded to produce that proof and nothing else; a breach pauses the release rather than
   receiving a calendar exception.
4. **A hybrid: a date with an automatic slip on any red gate.** Better than option 2, but it still centres the
   date and invites negotiation over what counts as "red enough" to slip.

## Decision

Option 3. **The 1.0 release gate is a proof obligation, not a date.**

1.0 ships when — and only when — all of the following hold, and it ships as the Principal Decision that records
them (GUIDE §6):

- the eight permanent 1.0 CI gates are green on `main` (Build, Dependency-direction, Generated-bindings,
  Domain-purity, Performance, Audit-coverage, Evaluation-sets, Chaos; GUIDE §7);
- the **second external security review** (the whole surface, including the M9 plugin capability) has no
  unresolved release-blocker (testing §5);
- **thirty consecutive days** of dogfooding record **zero data-loss incidents and zero unlogged effects**
  (registry §4; the terms are defined operationally in the architecture §10);
- every open defect is **fixed or explicitly accepted in writing** (impl-plan §M10);
- the release-gate Decision is **demonstrated to someone who does not trust the author** (GUIDE §6).

This decision fixes three boundaries on the hardening milestone:

- **Hardening introduces no product feature.** 1.0 scope is frozen at feature-complete; the roadmap's
  "explicitly not in 1.0" list stands. A feature added during hardening was neither reviewed nor dogfooded and
  re-opens the gate.
- **No performance budget is relaxed to ship.** A budget breach is resolved by doing less work (GUIDE §3.16),
  never by editing the gate. Raising a budget remains possible only by a separate ADR arguing the Principal is
  better off (testing §6) — and schedule is not that argument.
- **A red gate or an open incident pauses the release; it does not get a date exception.** The thirty-day
  window is *consecutive*: any data-loss or unlogged-effect incident resets the counter to zero.

## Consequences

**Accepted: the ship date is unknowable in advance.** A proof obligation cannot be committed to a calendar,
which is uncomfortable for anyone planning around 1.0. Mitigated by the fact that all eight gates run from M1
(GUIDE §7), so the distance to green is continuously visible — the release is late only to the extent the
product is actually unproven, and that gap is measured every commit, not discovered at the end.

**Accepted: an incident late in the window is expensive.** A data-loss incident on day 28 resets the counter to
zero, costing nearly a month. This is correct: a product that lost committed data three days before its release
has not demonstrated zero data loss, and shipping it on schedule would be shipping the exact failure the
criterion exists to catch.

**Accepted: pressure to reclassify incidents.** With a hard reset rule, there is an incentive to argue a
data-loss event was "not really" data loss. Bounded by the operational definitions (architecture §10.2–§10.3):
loss of any committed state, any non-byte-identical projection rebuild, or any non-byte-identical restore is an
incident, full stop — the classification is mechanical, not a judgement call.

**Gained: the release cannot ship unproven.** The single most valuable property of 1.0 — that its three
promises are demonstrated, not asserted — is made structurally unskippable.

**Gained: hardening stays hardening.** With features and budget-raises fenced out, the milestone cannot quietly
become a second feature phase or a budget renegotiation, which are the two ways a hardening milestone most
commonly dissolves.

**Gained: a single, demonstrable answer to "is 1.0 done?"** Not "substantially" — the eight gates are green,
the review passed, the window is thirty clean days, and the Decision is on the record, demonstrated to a
skeptic.

**Reversal cost: low, and one-directional.** Nothing in the codebase depends on this decision; it is a policy
about when a release Decision may be taken. Reverting it means allowing a date to override the proof — which
does not remove any gate or test, it only removes the rule that they must all be green before shipping. The
cost is not technical; it is that reverting re-opens exactly the failure mode the decision was written to close.
