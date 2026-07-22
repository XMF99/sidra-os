# M21 Architecture Audit — gate before M22

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M22 (Delegation and Separation of Duties).

| | |
|---|---|
| Milestone audited | M21 — Seats and Identity |
| Registry status | **Defined** (per `/MILESTONE_REGISTRY.md` §4; M17–M30 defined, not yet documented) |
| Audit verdict | **The substrate M22 requires is defined and stands. No gap blocks M22's architecture.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md`, `/docs/07-security-model.md`, `/docs/04-database-design.md` |

---

## 1. What M22 actually needs from M21

M22 is architecture-only and *extends* the Seat substrate; it does not require M21 to be *implemented* to be
*architected*. What it requires is that the M21 definition and its governing ADR are stable and unambiguous
about four things M22 builds directly on:

| M21 element M22 depends on | Defined? | Where |
|---|---|---|
| A **Seat** is a human identity with its own Fence, budget, and working memory | ✅ | ADR-0021 §Decision: *"A Seat is a human identity with its own Fences, budget, and working memory."* |
| **More than one Seat** can exist in 3.0 | ✅ | ADR-0021 §Decision: *"3.0 adds Seat creation, per-Seat Fences and budgets in the UI, cross-Seat delegation, and separation of duties at the human layer."* Registry M21 exit: *"A second Seat is created."* |
| Every event carries a **Seat actor** and no history is rewritten | ✅ | ADR-0021 §Decision: *"Every event carries a Seat ID."* §Consequences: *"the audit chain never needs rewriting."* Registry M21 exit: *"every event distinguishes the two; no historical event is rewritten."* |
| A **per-Seat Fence** (the capability ceiling M22's delegation cannot exceed) | ✅ | ADR-0021: *"Every Fence, budget, and working-memory scope is expressed against a Seat."* Security model §4 (the Fence / effective-capability model) is the mechanism. |

All four are defined and mutually consistent. M22's own architecture explicitly names — as an assumption to
confirm at implementation time (architecture §18.2) — that M21's delivery exports a per-Seat Fence and an
authenticated session Seat. That is the correct dependency direction: M22 builds on M21's substrate and states
where it relies on M21's implementation choices.

## 2. Checklist result

M21 is **Defined**, not yet **Documented** — it has no architecture package of its own yet (the registry marks
M17–M30 as "defined, not yet documented"). The workflow's STEP-1 gate for a *defined-but-not-documented*
dependency is narrower than for a documented one: confirm the registry definition and its governing ADR are
present, stable, and sufficient for the dependent milestone to anchor to.

| Required for M22 to anchor | Present | Location |
|---|---|---|
| Registry definition of M21 (purpose, dependency, exit) | ✅ | `/MILESTONE_REGISTRY.md` §4, M21 row |
| Governing ADR for the Seat concept | ✅ | ADR-0021 (Accepted) |
| The invariant M22 lifts to the human layer | ✅ | ADR-0008 (Accepted) + `reviews` CHECK in `/docs/04-database-design.md` |
| The choke point and Fence model M22 sits ahead of | ✅ | `/docs/07-security-model.md` §4 (Broker, intersection-never-union, default deny) |
| The record types M22 extends additively | ✅ | `approval_requests`, `decisions`, `dissents` in `/docs/04-database-design.md` |

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **M21 is Defined, not Documented.** M22 anchors to the *definition* (registry + ADR-0021), which is
   authoritative and complete for M22's purposes. M22's architecture does not depend on any M21 implementation
   detail beyond the four elements in §1, and it flags the two it must confirm at build time (the per-Seat
   Fence API and whether M21 already added a Seat dimension to `approval_requests` — architecture §18.2). This
   is the correct posture, not a gap.

2. **`approval_requests` shape.** The shipped table (`/docs/04-database-design.md`) carries `requested_by`
   referencing `agents(id)`, not a Seat. M22 adds `requester_seat_id` additively (migration 0048) and backfills
   it to the single M21 Seat. If M21's implementation already introduced a Seat dimension on
   `approval_requests`, M22's E5/T5.2 must use it rather than duplicate — recorded as an assumption to confirm,
   not a blocker.

3. **ADR numbering sequence.** The most recent ADRs in the repo run through 0037 (Connector Framework) with
   0031–0033 interleaved; M22's ADRs are numbered 0060–0061 per the milestone instruction's pinned band. This
   leaves a gap (0038–0059) reserved for the milestones between M16 and M22 (M17–M21) that are not yet
   documented. The gap is intentional and consistent with single-global numbering (ADR-0032); it is noted here
   so an integrator does not read it as a numbering error.

## 4. Gate decision

The Seat substrate M22 requires is defined by the registry and ADR-0021, and the invariant M22 lifts
(author ≠ reviewer) is Accepted and enforced in the schema today. **Proceed to M22 (Delegation and Separation
of Duties).** No M21 or prior architecture is modified by the M22 package; M22 extends the substrate M21 defines
(the Seat, its Fence, the actor-bearing chain) and the controls M3 and the decision engine already ship — which
is the correct dependency direction.
