# ADR-0002 — Hash-chained event log as the source of truth

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

The product's central claim is that the Firm's work is auditable: every Deliverable traceable to the Turns
that produced it, every effect attributable, every Decision reviewable months later with the context that
produced it. Principle 3 says nothing important is ephemeral and Principle 4 says legibility is a feature. A
conventional mutable-row schema cannot support either claim — it answers "what is true now" and destroys "how
we got here," which is exactly the question an audit asks.

## Options

1. **Mutable tables only.** Simplest, fastest to build, and structurally incapable of supporting the product's
   central claim.
2. **Mutable tables plus an audit table.** The common compromise. The audit table drifts from reality the
   first time a code path forgets to write to it, and nothing detects the drift.
3. **Event log as source of truth, tables as projections.** Every state change is an append-only event;
   queryable tables are derived and rebuildable. Hash-chaining each event over its predecessor makes tampering
   detectable.
4. **Full CQRS with separate stores.** Overkill for a single-user desktop application; the operational
   complexity buys nothing here.

## Decision

Option 3. The `events` table is append-only and hash-chained with SHA-256 over `(prev_hash, seq, kind,
payload, timestamp)`. All other tables are projections rebuildable from the log.

## Consequences

**Accepted:** every write path is more work to build. Adding a feature means designing its event before its
table.

**Accepted:** storage grows monotonically. Measured at realistic usage this is tens of megabytes per year of
events, which is not a constraint on a desktop machine; cold-tiering is available if it ever becomes one.

**Accepted:** projections can drift from a bug in projection logic. This is why "rebuild and diff" is an
assertion in every integration test rather than a maintenance tool.

**Gained:** the audit trail cannot be forgotten by a code path, because there is no state that exists outside
it. Time-travel debugging, the Console's trace view, crash recovery, and 3.0's compliance evidence all come
from the same mechanism rather than from four separate ones.

**Constraint imposed on the future:** event payload schemas are versioned and forward-compatible. An event
written in 1.0 must be readable in 4.0. Removing an event kind is not permitted; deprecating one is.
