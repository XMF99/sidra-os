# ADR-0058 — Per-Seat Fence and budget nest under the firm ceilings, enforced by the one Broker

**Status:** Proposed · **Date:** M21 architecture (3.0 "Chambers") · **Extends:** ADR-0020, security model §4

## Context

A second Seat needs a capability ceiling and a spending ceiling, or admitting a colleague hands them the whole
Firm's authority and the whole Firm's budget. ADR-0021 said 3.0 would add "per-Seat Fences and budgets". The
question here is *how* they attach to the machinery that already exists — the single Permission Broker
(`/docs/07-security-model.md` §4) and the four nested budget ceilings (ADR-0020, turn → engagement →
department → month) — without growing a second authorization path or a parallel money model.

The temptation is a dedicated "Seat authorization service" that decides what each Seat may do and a separate
per-Seat wallet. Both would fracture the single choke point and the single firm ceiling that the security and
cost models depend on. The security model is explicit: the Permission Broker is *the* choke point, and every
tool call passes through it. ADR-0020 is explicit: autoscaling — adding capacity — never raises spend; the
firm month is the hard cap.

## Options

1. **A separate Seat authorization service and a separate per-Seat wallet.** Clear ownership, but two
   authorization paths and two money models — the Broker is no longer the single gate, and Σ per-Seat wallets
   can drift above the firm ceiling.
2. **A per-Seat Fence as an intersection term in the Broker's existing effective-capability computation, and a
   per-Seat budget ceiling nesting under the firm month as an attribution dimension orthogonal to the
   department ceiling.** One choke point, one firm cap.
3. **Per-Seat budgets replace the firm ceiling.** Clean per-Seat attribution, but loses the single firm number
   the Principal actually watches and lets the sum float — the failure mode ADR-0020 already rejected for
   departments.
4. **No per-Seat budget; only a per-Seat Fence.** Simpler, but a second Seat could exhaust the whole firm month
   with no containment — the exact "one runaway starves everyone" failure ADR-0020 exists to prevent, lifted to
   the human layer.

## Decision

Option 2.

**The per-Seat Fence is one more intersection term** in the effective-capability computation the Broker already
performs:

```
effective = charter ∩ work_order_grant ∩ firm_policy ∩ session_grants ∩ seat_fence(originating_seat)
```

Intersection, never union — the Seat Fence can only narrow. Default-deny: an empty Fence permits nothing. A
Seat cannot widen its own Fence; `set_seat_fence` requires the acting Seat to already hold every capability it
grants, so widening is always an act by a higher authority, recorded as a Decision. There is **no** second
authorization path; `authorize_action` remains the sole gate.

**The per-Seat budget is a ceiling nesting under the firm monthly ceiling**, stored per Seat and mirrored into
`budget_ledger` under the additive scope `seat:<SeatId>` (the ledger's `scope` column already admits arbitrary
scope strings). The invariant is `Σ over Seats(ceiling) ≤ firm_month_ceiling`; `set_seat_budget` refuses a
ceiling that would breach it. The Seat ceiling is **orthogonal** to the department ceiling: the department
ceiling contains spend within a department across Seats; the Seat ceiling contains spend by a Seat across
departments; both sit under the firm month. "Cost follows the requester" (ADR-0020) becomes "cost follows the
originating Seat". Exhaustion pauses that Seat's originated work and raises one Approval Request stating both
the Seat total and the firm remaining — it does not stop the Firm and does not downgrade the Model Class
(ADR-0020's rule, unchanged). The founding Seat's ceiling defaults to the full firm ceiling, so a single-Seat
Firm is behaviourally pre-M21.

## Consequences

**Accepted: the Broker's inputs grow by one term.** Every Seat-originated act carries a resolved originating
Seat and its Fence. One indexed lookup and one set intersection per act — negligible, and it keeps the choke
point single.

**Accepted: admitting a Seat carves the firm ceiling, it does not add money.** A second Seat's budget reduces
the founding Seat's headroom rather than inventing new spend. Occasionally a Principal will want "more budget
for the new colleague" and must raise the firm month to get it — the same honest constraint ADR-0020 imposed
on departments.

**Accepted: attribution complexity at the human layer.** A cross-department Engagement originated by one Seat
spends that Seat's ceiling wherever it runs. Resolved by the same rule ADR-0020 used for departments — cost
follows the requester — so a shared department is not punished for being useful.

**Gained: one choke point survives multi-Seat.** The Permission Broker remains the single authorization gate;
there is no Seat-specific side door to audit or bypass.

**Gained: containment at the human layer.** A runaway Seat cannot exhaust the whole firm month; the failure is
bounded to that Seat, exactly as ADR-0020 bounded it to a department.

**Gained: one firm number is preserved.** The Principal still watches a single monthly ceiling; per-Seat
ceilings are a partition beneath it, not a replacement for it.

**Reversal cost: low.** Setting every Seat's ceiling to the firm ceiling and every Seat's Fence to the firm
policy restores single-Seat behaviour; the intersection term with a firm-wide Fence is a no-op, and the
`seat:<id>` ledger scope is additive.
