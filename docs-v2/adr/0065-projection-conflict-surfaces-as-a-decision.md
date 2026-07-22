# ADR-0065 — A projection conflict surfaces as a Decision, never auto-resolved

**Status:** Accepted · **Date:** 3.0 "Chambers" design phase · **Milestone:** M24 · **Supersedes:** —

## Context

Under ADR-0064 the event streams always merge cleanly — a union has no conflicts. But two devices can, while
offline, both change the **same single-valued projection cell** to **different values** (an engagement's
title, a canon statement, a decision's chosen option). Both writes survive in the log (nothing is lost). The
question is what the projection should show, and — more importantly — what the Firm should do about the fact
that its two copies disagree about a value the Principal cares about.

The tempting answer is last-writer-wins: pick the later timestamp and move on. `/docs/09-scalability.md` §4
even names it for UI state. But applied to an audit-bearing cell, last-writer-wins is a **silent overwrite of
a Principal-meaningful value** — it discards one device's recorded intent without telling anyone, which
violates the product's central claim that nothing important is ephemeral and no effect is silent
(`/docs/02-principles.md`, ADR-0002). The registry's exit criterion says so directly: "conflicts surface as
Decisions" (`/MILESTONE_REGISTRY.md` §4).

The Firm already has the right machinery. The Decision Engine records exactly this kind of event — a choice
that overrides a prior value and that the Principal should remember (`/docs/03-decision-engine.md` §1). Canon
already routes two contradictory statements into a Reconciliation the Principal resolves
(`/docs/04-database-design.md` §6). The decision needed is to generalize that pattern, not to invent a
resolver.

## Options

1. **Last-writer-wins for everything.** One line of code, and it silently destroys recorded intent on every
   concurrent edit. Fails the exit criterion.
2. **Auto-merge with a per-type resolver.** Cleverer, and it hides the disagreement inside a heuristic the
   Principal never sees. A resolver that is right 95% of the time is a silent overwrite 5% of the time, and the
   5% are precisely the cases that mattered enough to edit on two devices.
3. **Every fork on a single-valued audit-bearing cell becomes a Decision.** The projection shows a
   deterministic provisional value (marked *contested*) so no surface is blank, and a `sync_conflicts` row
   linked to a `decisions` row surfaces the disagreement for the Principal. Reuses the Decision Engine and the
   Canon-reconciliation precedent. Costs a Decision on every genuine concurrent divergence.
4. **Block convergence until the human resolves.** Safe and unusable: a device offline for a week returns to a
   frozen Firm. Confuses "the log has converged" (a set property) with "every disagreement is settled" (a
   human act).

## Decision

**Option 3.** A **fork** — two concurrent events superseding the same single-valued cell value with different
values (detected structurally via `supersedes_event`, ADR-0064/§11) — on an **audit-bearing** cell:

1. Applies the deterministic-order winner as a **provisional** value and marks the cell **contested** (the
   `canon.status = 'contested'` pattern), so the projection is total.
2. Writes a `sync_conflicts` row and a `decisions` row whose options are the two values (with their authoring
   device and Seat), whose evidence is the two events, and whose authority is `principal` pending resolution.
3. Emits `ConflictDetected`. Detecting a fork and raising a Decision are the same, inseparable act.

Convergence does **not** wait for the Decision (a Decision is data, not an unmerged state). Resolution appends
a superseding event, which converges like any other. The only cells exempt are non-audit, ephemeral ones
(`ui_state`, `preferences`) on a **declared** last-writer-wins allowlist (`/docs/09-scalability.md` §4) — never
the default, never an audit-bearing cell.

## Consequences

**Accepted: genuine concurrent divergence produces Decisions the Principal must answer.** Editing the same
field on two offline devices now costs a Decision. This is work that was previously invisible (one device
would have silently clobbered the other), surfaced honestly — uncomfortable and correct, the same trade
ADR-0017 accepted for registry ownership.

**Accepted: the classification of every single-valued cell as audit-bearing or ephemeral must be declared.**
A static per-cell property, not a runtime guess (mirroring M16's manifest effect classes). The safe default is
audit-bearing; the ephemeral allowlist is small and explicit.

**Accepted: a conflict storm after a long divergence can queue many Decisions.** Mitigated by per-subject
batching (mirroring Approval batching, `/docs/07-security-model.md` §6); convergence never blocks on them.

**Gained: no silent overwrite is structurally impossible for an audit-bearing cell.** A fork *always* raises a
Decision; the only silent path is the declared ephemeral allowlist. This is the exit criterion, and it is a
test, not a promise (M24 AC4/AC5).

**Gained: conflicts inherit the whole Decision surface.** A sync conflict appears in the Boardroom, the
Archive, the Inspector, and the Morning Brief with no new UI (`/docs/03-decision-engine.md` §9); it carries
evidence, confidence, and a permanent record; resolving it is auditable and reversible by supersession.

**Gained: the Firm's copies can disagree without lying about it.** Two devices that diverged are allowed to
disagree; the disagreement is a first-class, visible object, not a race one of them quietly lost.

**Reversal cost: low.** The classification is data and the resolver is one code path. Collapsing conflicts back
into last-writer-wins is a one-line change that reintroduces exactly the silent-overwrite failure this ADR
exists to forbid — so it is cheap to reverse mechanically and expensive to reverse in principle, which is the
correct shape for a decision this load-bearing.
