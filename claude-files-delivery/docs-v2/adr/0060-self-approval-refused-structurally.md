# ADR-0060 — A Seat cannot approve its own Approval Request, and the refusal is structural

**Status:** Proposed · **Date:** 3.0 "Chambers" design phase · **Supersedes:** —

## Context

M21 gave the Firm more than one Seat. For the first time the question "can the Seat that asked also be the Seat
that approves?" can be posed — and the answer must be no, for the same reason ADR-0008 gave for agents: a party
reviewing its own request is systematically biased toward approving exactly the flaws it was already blind to.
Principle 5 (separation of powers) is the design principle; this ADR records *how* it is enforced at the human
Seat layer, and specifically why it is enforced **structurally** rather than by a prompt, a UI affordance, or a
togglable policy.

The precedent already exists in the schema. The `reviews` table (`/docs/04-database-design.md`) carries
`CHECK (reviewer_id <> (SELECT assigned_to FROM work_orders … ))` — a Deliverable's reviewer cannot be its
author, enforced by the database, not requested in a charter. ADR-0008 §Consequences said this property would
"scale to 3.0's human separation of duties without redesign — it is the same rule at a different layer." M22 is
that layer, and this ADR is the redemption of that sentence.

The exit criterion of M22 (`/MILESTONE_REGISTRY.md` §4) is explicit and demanding: *"A Seat's own Approval
Request cannot be self-approved; the refusal is structural, not advisory."* GUIDE §3 item 9 reinforces it for
the whole system: *"No mode, no setting, no performance optimisation may relax this."*

## Options

1. **Prompt / UI-only.** Hide the Approve button on one's own request; warn in copy. Free, and it stops the
   honest mistake. It does nothing against a direct API call, a scripted client, or a future refactor that
   forgets the rule — the exact "advisory that can be edited out" ADR-0008 rejected for agents.
2. **A single application-code guard.** One `if approver == requester { deny }` in the resolution path. Better —
   it refuses at the choke point. But it is one line a refactor can remove, one path a new entry point can
   bypass, and it lives entirely in code that ships with a mode system. If any config could route around it, it
   is advisory in effect even if it looks structural.
3. **A database CHECK only.** `CHECK (approver_seat_id <> requester_seat_id)` on the resolution row. Un-bypassable
   at the data layer — but it refuses *at the write*, returning a raw constraint error with no typed reason an
   agent or UI can act on, and it runs after the effect logic rather than ahead of it.
4. **Both a Broker guard and a database CHECK.** The guard gives a typed, pre-effect refusal
   (`Deny{self_approval}`) that an agent/UI can act on and that fires *before* the Permission Broker's effect
   logic; the CHECK is the last line that fires even if a future code path skips the guard. Neither is the sole
   enforcement; the CHECK cannot be refactored away without a migration, and no mode reaches either.

## Decision

Option 4, mirroring exactly what the `reviews` table already does one layer down.

- The **Permission Broker approver-eligibility guard** evaluates a self-approval check as its *first* stage,
  ahead of authority evaluation and ahead of the Broker's effect-class logic: it loads the request's
  `requester_seat_id`, and if the approver Seat equals it, returns `Deny{self_approval}`, emits
  `SelfApprovalRefused`, and writes nothing. The approver Seat is the authenticated session Seat, never a
  parameter.
- The **`approval_resolutions` CHECK** — `approver_seat_id <> (SELECT requester_seat_id FROM approval_requests
  WHERE id = request_id)` — refuses the resolution row at write time even if control reaches it, the identical
  shape as `reviews.reviewer_id <> author`.
- The check keys on the **request's requester Seat**, not on the authority source, so no delegation and no
  chain of delegations (ADR-0061) can launder a self-approval by supplying the approver's authority "as"
  another Seat: capability transfers, identity does not.
- No mode, "solo operator" flag, or Review-Intensity level relaxes it. A CI assertion fails the build if any
  configuration key could toggle the guard, and the exit-criterion test asserts *both* the guard rejection and
  a raw-INSERT constraint rejection — the asymmetry a togglable policy could never satisfy.

## Consequences

**Accepted:** a one-Seat Firm can never self-approve, which means a solo operator's own Approval Request always
escalates to the Principal rather than being resolvable in-Seat. This is a real friction and it is deliberate:
separation of duties is not silently waived because there happens to be only one colleague. It is the same
posture ADR-0008 took when it made review cost 30–40% more — the friction *is* the control.

**Accepted:** two enforcement points to keep in sync. The guard and the CHECK must agree, and a change to one
without the other is a defect. The cost is bounded — the CHECK is three lines of SQL that rarely change, and
the exit-criterion test exercises both.

**Accepted:** a raw database error surfaces if a future code path bypasses the guard and hits the CHECK. That
is by design: a surprising error at the data layer is strictly better than a silently accepted self-approval,
and the event log records the attempt.

**Gained:** the exit criterion is provable as *structural*. The raw-INSERT half of the test cannot pass against
an advisory implementation, so "structural, not advisory" stops being a claim and becomes a build gate.

**Gained:** the property is the same rule ADR-0008 already made the Firm depend on, at a new layer, with no new
trust mechanism. An engineer who understands the `reviews` CHECK understands this one immediately.

**Reversal cost: high, by intent.** Relaxing self-approval refusal would mean dropping a database CHECK, removing
a Broker guard, and deleting a CI gate — three deliberate acts against three independent barriers, each of which
would show up in review. That is exactly the difficulty a separation-of-duties invariant should have.
