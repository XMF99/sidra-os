# ADR-0079 — Every evolution path is a permanent CI gate proving no escalation without a Principal Decision

**Status:** Proposed · **Date:** M30 design phase · **Supersedes:** — · **Source:** `/MILESTONE_REGISTRY.md`
§4, `/docs/02-testing-and-quality.md` §5, `/docs-v2/02-v2-principles.md` (Principle 14),
`/MASTER_IMPLEMENTATION_GUIDE.md` §7/§8/§12, ADR-0002 (event log is the source of truth), ADR-0031
(`infrastructure/ci/` placement), ADR-0009 (local-only), ADR-0039 (the M10 analogue)

## Context

At the end of M29 the four self-improvement feedback loops exist — outcome calibration (M26), charter evolution
(M27), procedural compilation (M28), firm self-review (M29) — and each passed its own exit criterion by
*asserting* it only proposes: calibration is "inspectable and revertible" (M26), a regressing charter revision
"is refused" (M27), a procedure "is proposed" (M28), the Firm "may propose, never enact" (M29). Each was
demonstrated once, individually. Nothing in the codebase yet forces those assertions to remain true on every
commit for the life of the product, and nothing proves the *set* of ways a loop could escalate is closed.

The 4.0 cross-cutting constraint is that the Firm proposes and the Principal confirms — nothing self-promotes
(registry §4; Principle 14). "Escalation" has exactly three targets: a loop widening a **capability**, relaxing
a **Standard**, or altering the **org chart**. There are exactly four loops that could reach them. If each of
those twelve (loop × target) reachabilities is not a build-failing property, then "no escalation without a
Decision" is a review outcome — something a human confirmed once — rather than a mechanical invariant. Under
end-of-programme pressure, and with no M31 to catch a regression, a review outcome is exactly what erodes: a
calibration widened just far enough to change an effect class, a "confirmed-by-default" activation added for
convenience, an admin side-door that edits the org chart outside the event log. M10 faced the identical problem
for the effectful set and closed it with an effect-coverage gate; the evolution surface needs the same
treatment, applied to the twelve escalation reachabilities.

M30 must therefore decide *what kind of object* each evolution path becomes. Separately — and this is a
schema/boundary decision, which per GUIDE §8 needs a record — it must decide **where the hardening bookkeeping
lives**: the dogfood ledger, the release-gate record, and the escalation-corpus results all want to be stored,
and the obvious instinct is a table per artifact. That instinct violates the substrate rule (the event log is
the source of truth; tables are projections rebuildable from the log — ADR-0002) and would force a migration
M30 is chartered not to add (architecture §11.1). Both questions are decided here, because both are about the
same thing: turning the evolution paths into permanent, self-checking gates without adding a byte of
authoritative schema.

## Options

1. **Leave the evolution paths as per-milestone assertions; keep the boundedness proofs as one-time tests.**
   Cheapest. But a one-time test proves a property held at one commit, not that it holds forever; a later change
   that opens a (loop × target) reachability merges without anyone noticing, because no gate enumerates the set.
   This is the failure mode 4.0 exists to forbid, left un-mechanized.
2. **Make each evolution path a first-class permanent CI gate, but store the release bookkeeping in new
   authoritative tables.** Fixes the enforcement gap but reintroduces the schema problem: a `dogfood_days`,
   `release_gate`, `escalation_results` table is state not derived from an event (violates ADR-0002 and GUIDE §3
   non-negotiable 1), forces a migration M30 is chartered not to add, and creates rows a full rebuild-from-events
   would not reproduce — which the projection rebuild-and-diff gate (testing §1) would flag as drift.
3. **Make each evolution path a permanent CI gate object, close the escalation set by enumeration, and record
   all hardening bookkeeping as events on the existing hash chain, surfaced as projections.** Each loop becomes
   a gate with an assertion, a failure condition, and an oracle (EVO-1…EVO-4); the (loop × target) matrix is a
   closed enumeration gate; the window markers are additive `system.*` variants, the release-gate sign-off and
   defect acceptances are `decision.*` events, and the ledger/record/results are projections. No new table, no
   migration; the gates live under `infrastructure/ci/` (ADR-0031).
4. **Enumerate the escalation set once in a design document and rely on code review to keep it closed.** A
   document is not a gate; "keep it closed" is a request, not an invariant. The set drifts open the first time a
   loop is extended without the reviewer noticing the new reachability.

## Decision

Option 3. **Every evolution path is a permanent CI gate proving no capability/Standard/org-chart change without
a Principal Decision, and the hardening bookkeeping that records the proofs adds no authoritative table.**

- **The four evolution-path gates are first-class, permanent objects** under `infrastructure/ci/gates/`
  (ADR-0031): EVO-1 calibration-bounded, EVO-2 charter-eval-gated, EVO-3 compilation-propose-only, EVO-4
  self-review-no-enact (architecture §4). Each carries an assertion, a failure condition, and an oracle, and
  fails the build on a seeded escalation. They join — never replace — the twelve prior catalogue gates (GUIDE
  §7) as permanent 4.0 gates.
- **The four bound gates are likewise permanent objects** — rate-bound, revert, evidence, circuit-breaker
  (architecture §6.2) — proving every loop is rate-limited, revertible, evidence-gated, and run-away-proof under
  sustained simultaneous load.
- **The escalation set is closed by enumeration.** The (loop × target) matrix (architecture §8.1) is a gate: a
  new reachability introduced by a future code change cannot merge without its refusal assertion. This is what
  makes "no escalation without a Decision" a mechanical property, exactly as M10's effect-coverage gate closed
  the effectful set (GUIDE §3.4).
- **The Decision-authorship invariant is enforced at the decision engine:** no `decision.*` event that widens a
  capability, relaxes a Standard, or alters the org chart may have a loop actor (architecture §8.2). `audit.verify`
  verifies it over the dogfood window.
- **Hardening bookkeeping is events, surfaced as projections — no new table, no migration.** The dogfood window
  markers (window-open, day-recorded, incident/reset) are **additive `system.*` variants** on the closed
  event-kind namespace; the release-gate sign-off and every defect acceptance are **`decision.*` events** — they
  are Principal Decisions (GUIDE §6), not a new mechanism; the loops' own actions are the `evolution.*`/`decision.*`
  events M26–M29 already define. The dogfood ledger, the release-gate record, and the escalation-corpus results
  are **projections** rebuilt from these events (ADR-0002), subject to the rebuild-and-diff gate (testing §1).
- **The only additive artifacts M30 ships to the repository are under `infrastructure/ci/` and
  `infrastructure/testing/`, plus test additions inside the M26–M29 subsystems** (architecture Appendix B) —
  none of which is schema.

This adds no product feature and relaxes no bound: a loop found able to escalate, or a loop that runs away, is
fixed by tightening the loop (a defect fix within the existing M26–M29 architecture), never by relaxing a gate
or moving a bound (ADR-0078).

## Consequences

**Accepted: eight new gates run on every commit forever.** The four evolution-path gates plus the four bound
gates outlive the milestone and run for the life of the product (GUIDE §7; there is no M31, so "forever" is
literal). This is a standing CI cost. It is the correct cost: the single most valuable property of 4.0 — that
the Firm proposes and the Principal confirms — is only real if it is enforced on every commit, not asserted
once.

**Accepted: closing the escalation set by enumeration means a new (loop × target) reachability fails the build
until its refusal assertion exists.** A future change that legitimately touches a new part of the surface must
add its refusal proof to merge. This is friction by design — it is exactly the friction that keeps the set from
drifting open (HR-7), the same discipline as the M10 effect-coverage gate.

**Accepted: querying the dogfood ledger, release-gate record, and escalation results means projecting from
events, not reading a table.** Slightly more work to read, and the projections must stay genuine projections
(rebuildable), not caches that drift. Mitigated by the fact that every other read model in the system already
works this way (system-design §2); the ledger is not special, and the rebuild-and-diff gate makes it
self-checking.

**Accepted: adding `system.*` variants touches the closed event enum.** This is a schema-adjacent change,
recorded here precisely because GUIDE §8 requires it. It is additive — no existing variant changes meaning — so
a Firm at the end of M30 replays every pre-M30 event exactly as before, and behaves identically on every product
path (architecture §11.1).

**Gained: "no escalation without a Decision" is a mechanical invariant, not a review outcome.** The audit chain
either shows a Principal `decision.*` antecedent for every capability/Standard/org-chart change or it does not;
the classification is not a judgement call (§8.2). This is Principle 14 made a build-failing gate.

**Gained: no migration, exactly as chartered.** M30 leaves the schema untouched (the ADR-0039 precedent applied
to 4.0); the bookkeeping is on the tamper-evident chain, and the single most consequential Decision in the
programme — that 4.0 may ship — is a `decision.*` event `audit.verify` covers, demonstrable after the fact and
impossible to rewrite silently.

**Reversal cost: low, and one-directional.** Reverting means demoting the eight gates from blocking to advisory,
or moving the bookkeeping into tables. Neither removes any test; both re-open the erosion this decision exists to
close, at the one point in the programme with no later milestone to close it again. If a future release genuinely
needs an authoritative hardening table, it adds a forward-only migration in its own band with its own ADR (GUIDE
§3.3, §8); nothing here forecloses that — this decision only declines to pay that cost at M30, where the events
already carry the facts.
