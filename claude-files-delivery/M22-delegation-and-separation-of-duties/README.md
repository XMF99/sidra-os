# M22 — Delegation and Separation of Duties · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M22 (Delegation and Separation of Duties),
release 3.0 "Chambers". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

Principle 5 (separation of powers; author ≠ reviewer, ADR-0008) applied to human **Seats**. It adds the kernel
machinery (`sidra-delegation`) that makes two things structural:

1. **A Seat cannot approve its own Approval Request.** The refusal is enforced the way the shipped `reviews`
   table already enforces reviewer ≠ author — a database **CHECK** plus a **Permission Broker guard** — so no
   mode, setting, or override can relax it (GUIDE §3 item 9).
2. **Delegation between Seats, bounded and logged.** A Seat may lend a *subset* of its own Fence to another
   Seat, time-boxed and revocable. A delegation can never widen authority (`scope ⊆ delegator Fence`,
   intersection never union, default deny), and every delegation and every approval is a logged Decision on the
   hash chain.

**Exit criterion:** a Seat's own Approval Request cannot be self-approved; the refusal is **structural, not
advisory** — proven by a constraint/guard rejection test, not a togglable policy.

## Contents

| File | What it is |
|---|---|
| `00-M21-AUDIT.md` | STEP 1 gate: confirms the M21 Seat substrate M22 anchors to is defined and stable; notes non-blocking items |
| `DELEGATION_AND_SEPARATION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0060-self-approval-refused-structurally.md` | Self-approval refused structurally: a Broker guard + a DB CHECK, mirroring `reviews.reviewer_id <> author` |
| `adr/0061-delegation-bounded-by-delegator-fence.md` | A delegation cannot exceed the delegator's Fence; it is time-boxed and logged |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Self-approval refused structurally (0060):** a Seat's own Approval Request cannot be resolved by that Seat;
   enforced by a Permission Broker guard *and* an `approval_resolutions` CHECK, the same shape as the `reviews`
   CHECK — no mode or setting relaxes it.
2. **Delegation bounded by the delegator's Fence (0061):** a Seat lends only a subset of what it holds
   (`scope ⊆ Fence` at grant, `scope ∩ current Fence` at use), always time-boxed, always a logged Decision,
   always revocable — capability transfers, identity never does, so no delegation can launder a self-approval.

## Reading order

1. `00-M21-AUDIT.md` — why it was safe to architect M22
2. `DELEGATION_AND_SEPARATION_ARCHITECTURE.md` — §1–§4 for the stance and model, then §16 (why structural), then
   the ADRs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations are `0047_delegations.sql` and `0048_approval_resolutions.sql` (the pinned band; forward-only,
  additive). `0048` adds `requester_seat_id` to `approval_requests` additively and backfills it to the single
  M21 Seat — confirm first whether M21 already added a Seat dimension there (see `00-M21-AUDIT.md` §3.2).
- The self-approval CHECK must mirror the shipped `reviews.reviewer_id <> author` CHECK exactly in shape; do not
  substitute an application-only guard for it — both the guard *and* the CHECK ship (ADR-0060).
- On completion, update `/MILESTONE_REGISTRY.md` M22 status `Defined → Documented`; the number is permanent from
  that point (registry rule 4).
- Dependency direction is CI-enforced: `sidra-delegation` must not import `sidra-orchestrator` or
  `sidra-mission`.
- CI-1 (no config disables the guard) and CI-5 (the exit-criterion raw-INSERT assertion is present) are what
  turn "structural, not advisory" into a build gate — do not skip them.

**STOP — do not begin M23 until M22 is implemented, integrated, and the structural self-approval-refusal exit
criterion is demonstrated.**
