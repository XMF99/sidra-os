# ADR-0061 — A delegation cannot exceed the delegator's Fence, and is time-boxed and logged

**Status:** Accepted · **Date:** 3.0 "Chambers" design phase · **Supersedes:** —

## Context

M22 adds delegation between Seats: a way for one Seat to lend authority to another so the Firm does not stall
when the Seat that holds a decision is absent. The danger is obvious — delegation is a mechanism for *moving*
authority, and any mechanism that moves authority can, if unbounded, *create* it. A delegation that grants more
than the delegator holds is privilege escalation wearing a helpful face; a delegation with no expiry is a
standing grant nobody re-examines; a delegation off the record is authority the audit chain cannot explain.

The security model already fixes the shape of the answer. Effective capability is
`charter ∩ work_order_grant ∩ firm_policy ∩ session_grants` — *"Intersection, never union — a Work Order can
only narrow, never widen. Widening requires an Approval Request from the Principal and is recorded as a
Decision"* (`/docs/07-security-model.md` §4). Default deny is GUIDE §3 item 6. A delegation must obey the same
arithmetic: it can only narrow authority as it passes from delegator to delegatee, never widen it.

The decision engine already fixes how a consequential act is recorded: as a Decision with an `authority` of
`delegated | escalated | principal` (`/docs/03-decision-engine.md`). Delegation is precisely the `delegated`
case, made explicit for Seats.

## Options

1. **Delegate by copying the delegator's whole Fence.** Simple. Grants far more than the task needs, violates
   least privilege, and turns every delegation into a broad standing grant. Rejected against default deny.
2. **Delegate an arbitrary scope the delegator names, unchecked.** Maximally flexible, and a privilege-escalation
   primitive: a Seat could delegate authority it does not hold, and the delegatee would wield it. Rejected
   outright.
3. **Delegate a scope bounded by the delegator's Fence at grant time only.** Better — the grant is least
   privilege and cannot exceed what the delegator holds. But a snapshot: if the delegator's Fence later shrinks
   (a capability revoked, a role change), the delegatee keeps authority the delegator has lost. Stale authority
   is the residual hole.
4. **Delegate a scope bounded by the delegator's Fence at grant time *and* re-bounded at use time, always
   time-boxed, always a logged Decision, always revocable.** The delegation confers, at every use, only
   `scope ∩ delegator's current Fence`; it carries a mandatory expiry; it is a Decision on the hash chain; and
   it can be revoked. Authority tracks the delegator's live Fence and never outlives its window.

## Decision

Option 4.

- **Bounded at grant:** `delegate_authority` refuses any `scope` not ⊆ the delegator's current Fence,
  default-deny, naming the offending capability. You cannot delegate what you do not hold.
- **Re-bounded at use:** a delegation confers, at each use, only `scope ∩ delegator's current Fence`. If the
  delegator's Fence shrinks, every delegation it granted narrows at the next use with no edit to any delegation
  row (the "Suspended" use-time verdict); `DelegationUseSuspended` is emitted for the uncovered part.
- **Time-boxed:** `expires_at` is NOT NULL and strictly after `granted_at` (a database CHECK enforces it).
  There is no perpetual delegation; a standing arrangement is re-granted, which is a fresh Decision.
- **Logged and revocable:** every grant and revocation is a Decision (`authority = delegated`) on the hash
  chain, with the acting Seat as actor. A delegator or the Principal may revoke; revocation is effective
  immediately.
- **Never a self-delegation:** `CHECK (delegatee_id <> delegator_id)` plus a grant guard — a Seat cannot
  construct a second authority path to itself, and even if it could, intersection means it would confer nothing
  new and it would not defeat the self-approval refusal (ADR-0060), which keys on the requester Seat.

## Consequences

**Accepted:** a delegation is not a durable convenience. It expires, and it shrinks when the delegator's Fence
shrinks, so a Seat relying on borrowed authority may find it gone mid-task and must re-request. This is the
cost of keeping authority honest, and it is deliberate — a delegation that outlived its bound would be exactly
the standing grant nobody re-examines that the decision engine's review dates exist to prevent.

**Accepted:** a use-time Fence intersection on every delegated approval. The cost is a bounded scan of the
requesting Seat's active delegations (indexed), small by construction in a Firm of colleagues, and off the
Mission scheduler's hot path.

**Accepted:** more Decisions on the chain. Every grant and revoke is a logged Decision, which adds volume. This
is the point — a delegation the audit chain cannot explain is authority the Firm cannot account for.

**Gained:** delegation cannot escalate privilege. Conferred authority is always ⊆ the union of the relevant
current Fences — a property the acceptance suite proves with a generator, never a strict superset.

**Gained:** authority tracks reality. Revoke a delegator's capability and every delegation it lent narrows at
once, without hunting down delegatee rows — the same immediacy the Broker's intersection rule gives agents.

**Gained:** the milestone composes cleanly with ADR-0060. Because delegation transfers capability but never
identity, no delegation can launder a self-approval; the two ADRs together close the loophole that either alone
would leave.

**Reversal cost: low-to-moderate.** Removing the use-time re-check (reverting to Option 3) is a code change, but
it silently reintroduces stale authority and would fail the Fence-shrink acceptance test — so the test guards
the decision. Removing the time-box would require dropping a database CHECK and would fail the expiry test.
