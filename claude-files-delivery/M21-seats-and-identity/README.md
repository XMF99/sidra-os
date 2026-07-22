# M21 — Seats and Identity · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M21 (Seats and Identity), the **first
milestone of release 3.0 "Chambers"** — the release in which the Firm admits colleagues. Architecture and
specification only — **no production code**, per the workflow.

## What this milestone delivers

The human layer becomes plural. `sidra-seats` is the Layer-1 machinery that admits a second **Seat** — a human
identity distinct from an agent — with its own capability **Fence** (default-deny), its own **budget** ceiling
(nesting under the firm month), and its own isolated **working-memory** namespace. It realizes ADR-0021, which
put the `actor` field on every event back in 2.0 precisely so that admitting a second Seat now requires **no
historical event to be rewritten**. It does **not** ship delegation or separation of duties — those are M22.

**Exit criterion:** a second Seat is created; every event distinguishes the two; **no historical event is
rewritten** — proven by a hash-chain integrity assertion over the pre-existing events, not by configuration.

## Contents

| File | What it is |
|---|---|
| `00-M20-AUDIT.md` | STEP 1 gate: confirms M21's real dependencies (M2 chain, ADR-0021) are complete and that M21 does not depend on the still-Defined M17–M20 |
| `SEATS_AND_IDENTITY_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0057-seat-is-a-first-class-human-identity.md` | A Seat is a first-class human identity, keyed on the existing actor field; the founding Seat binds to `'principal'` |
| `adr/0058-per-seat-fence-and-budget-nest-under-firm-ceilings.md` | Per-Seat Fence and budget nest under the firm ceilings, enforced by the one Broker |
| `adr/0059-per-seat-working-memory-namespace.md` | Per-Seat working memory is an isolated namespace, default-deny at the human layer |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The three decisions, in one line each

1. **Seat identity (0057):** a Seat is a first-class human identity, disjoint from an agent; the founding Seat
   binds to the pre-existing `'principal'` actor value, so attribution is a read-time join and the chain is
   never rewritten.
2. **Fence & budget (0058):** each Seat's capability Fence is an intersection term over the single Broker, and
   its budget nests under the firm month — no second Broker, no new money.
3. **Working memory (0059):** each Seat's working memory is an isolated `seat/<id>` namespace, default-deny, so
   the capability to read another Seat's memory cannot even be expressed.

## Reading order

1. `00-M20-AUDIT.md` — why it was safe to start M21
2. `SEATS_AND_IDENTITY_ARCHITECTURE.md` — §1 for the stance, §4–§5 for the model and the no-rewrite property,
   then the ADRs
3. The three ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Confirm ADR numbers 0057–0059 are still free, then copy the three ADRs to `docs-v2/adr/`, add rows to
  `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations are the band `0042_`–`0046_` (additive): `seats`, `seat_fences`, `seat_budgets`,
  `seat_working_memory`, and a covering index on `events(actor)`. **`events.actor` already exists and is not
  modified.**
- No code path may `UPDATE` or `DELETE` `events` — admitting a Seat is append-only. The chain-integrity test is
  the exit criterion.
- On completion, update `/MILESTONE_REGISTRY.md` M21 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4).
- Dependency direction is CI-enforced: `sidra-seats` must not import `sidra-orchestrator` or `sidra-mission`.

**Then STOP.** This package **opens release 3.0 "Chambers".** Do not begin M22 (Delegation and Separation of
Duties) until M21 is implemented, integrated, and its second-Seat / no-history-rewritten exit criterion is
demonstrated.
