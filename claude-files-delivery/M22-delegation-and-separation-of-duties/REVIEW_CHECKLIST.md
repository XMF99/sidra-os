# M22 Delegation and Separation of Duties — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `DELEGATION_AND_SEPARATION_ARCHITECTURE.md` (why it exists, design goals,
      delegation lifecycle, domain model, Seats/Fences/scoped authority, approver-eligibility state machine,
      persistence, security, authorization path, effect classes, component structure, public APIs, sequence
      diagrams, failure scenarios, performance, why structural not advisory, acceptance criteria, dependencies,
      risks, testing strategy, CI requirements, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M21 audit (STEP 1 gate) — `00-M21-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0060 — A Seat cannot approve its own Approval Request, and the refusal is structural (a Broker guard +
      a database CHECK, mirroring `reviews.reviewer_id <> author`)
- [x] ADR-0061 — A delegation cannot exceed the delegator's Fence, and is time-boxed and logged

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Both are Status `Proposed`. Numbering is 0060–0061 per the pinned band; the gap after 0037 is reserved
for the not-yet-documented milestones M17–M21 and is consistent with single-global numbering (ADR-0032; see
`00-M21-AUDIT.md` §3.3).

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M21 (Seats and Identity) — the Seat as delegator/delegatee/requester/approver; the per-Seat Fence; the
      authenticated session Seat. Defined in `/MILESTONE_REGISTRY.md` §4 and ADR-0021 (`00-M21-AUDIT.md`).
- [x] M3 (Permission Broker, Fences, default deny) — the choke point the approver-eligibility guard sits ahead
      of; the Fence a delegation cannot exceed; intersection-never-union (`/docs/07-security-model.md` §4)
- [x] M2 (event log / hash chain, ADR-0002) — delegation and resolution events carry the Seat actor; no chain
      rewrite (the actor field ADR-0021 placed at 2.0 is what makes this possible)
- [x] decision engine (`/docs/03-decision-engine.md`) — a delegation grant and every resolution are logged
      Decisions (`authority = delegated`)
- [x] Dependency direction preserved: `packages/domain ← services/delegation ← apps/*`; **no** edge to
      `services/orchestrator` or `services/mission` (CI-enforced, AC12)

## 4. Consistency with authoritative sources

- [x] Consistent with **ADR-0008** (author ≠ reviewer): M22 is the same invariant one layer up, redeeming
      ADR-0008's stated promise that it "scales to 3.0's human separation of duties without redesign — the same
      rule at a different layer." The agent-layer rule is not re-decided.
- [x] Consistent with the **`reviews` CHECK** (`/docs/04-database-design.md`): the `approval_resolutions` CHECK
      `approver_seat_id <> requester_seat_id` is the identical shape (a DB CHECK with a subquery) as
      `reviews.reviewer_id <> author`, applied to Seats
- [x] Fence / effective-capability semantics match `/docs/07-security-model.md` §4 (intersection never union;
      default deny); a delegation narrows, never widens
- [x] Effect-class semantics unchanged (`/docs/07-security-model.md` §5); the guard sits *ahead* of effect-class
      logic and adds no new class
- [x] `approval_requests`, `decisions`, `dissents` extended additively only; no existing column's meaning
      changes; `requester_seat_id` is nullable-then-backfilled
- [x] Milestone numbering per `/MILESTONE_REGISTRY.md` §4 (M22; depends on M21; exit criterion quoted verbatim)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E6
- [x] The exit criterion ("a Seat's own Approval Request cannot be self-approved; the refusal is structural,
      not advisory") is AC2, owned by task T6.9, and requires **both** a guard-rejection assertion **and** a
      raw-INSERT constraint-rejection assertion — the asymmetry that proves *structural* over *advisory*
- [x] Every AC is testable and named; none relies on configuration or manual verification
- [x] CI-1 (no disabling config) and CI-5 (raw-INSERT assertion present) turn "structural, not advisory" into a
      build gate

## 6. Scope discipline

- [x] Separation of duties is enforced **structurally, not advisorially** — two enforcement points (Broker guard
      + DB CHECK), neither relaxable by any mode, setting, or override (GUIDE §3 item 9)
- [x] A delegation **cannot widen authority** — `scope ⊆ delegator Fence` at grant and `scope ∩ current Fence`
      at use; intersection never union; default deny (ADR-0061)
- [x] Delegation transfers **capability, never identity** — no delegation chain can launder a self-approval
      (the CHECK/guard key on the requester Seat, AC4)
- [x] No production code in this package (architecture and plan only)
- [x] Out of scope, flagged: multi-party / N-of-M quorum approval (would need its own ADR); the `UNIQUE`
      resolution constraint encodes the single-resolver assumption for this release

## 7. Open items carried forward (non-blocking)

- [ ] Confirm at implementation time whether M21 already added a Seat dimension to `approval_requests`; if so,
      E5/T5.2 uses it rather than adding a duplicate `requester_seat_id` (architecture §18.2; `00-M21-AUDIT.md`
      §3.2)
- [ ] Confirm the M21 per-Seat Fence API surface before implementing E3 (the scope-check depends on it;
      architecture §18.2)
- [ ] On integration, update `/MILESTONE_REGISTRY.md` M22 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 (the guard) jointly with E5/T5.2 (the CHECK), then E2
      → E3 → E4. E6 (the exit-criterion proof) is the last thing to go green, and its raw-INSERT half is what
      proves the refusal is structural, not advisory.

**STOP.** Per the workflow, do not continue to M23 until AntiGravity completes M22 implementation, integration,
and the structural self-approval-refusal exit criterion is demonstrated.
