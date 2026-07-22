# M21 Seats and Identity — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `SEATS_AND_IDENTITY_ARCHITECTURE.md` (why it exists, design goals, lifecycle,
      domain model, the actor field & no-rewrite property, components, security, per-Seat Fence, per-Seat
      budget, per-Seat working memory, persistence, APIs, sequence diagrams, failure scenarios, performance,
      dependencies, risks, acceptance criteria, testing strategy, CI requirements, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M20 audit (STEP 1 gate) — `00-M20-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0057 — A Seat is a first-class human identity, keyed on the existing actor field (the founding Seat
      binds to `'principal'`; no historical event rewritten)
- [x] ADR-0058 — Per-Seat Fence and budget nest under the firm ceilings, enforced by the one Broker
- [x] ADR-0059 — Per-Seat working memory is an isolated namespace, default-deny at the human layer

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering is 0057–0059, `Status: Proposed`, and does not exceed 0059.

- [ ] **Integration action (AntiGravity):** confirm 0057–0059 are still free against the ADR index (M17–M20 may
      consume numbers when documented), copy the three ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M2 (event log & hash chain, `events.actor`) — the column ADR-0021 placed in 2.0; present in
      `/docs/04-database-design.md` §4; `audit.verify` in security §11
- [x] ADR-0021 (Seats defined in 2.0, one shipped) — Accepted; the decision M21 realizes
- [x] M3 (Permission Broker, capability model, default-deny) — the single choke point M21 reuses
- [x] M5 (budget ceilings, ADR-0020) — the nesting model the per-Seat ceiling extends
- [x] M6 (memory namespaces, private lanes) — the isolation mechanism the per-Seat namespace reuses
- [x] Dependency direction preserved: `packages/domain ← services/seats ← apps/*`; **no** edge to
      `services/orchestrator` or `services/mission` (CI-enforced, AC10)

## 4. Consistency with authoritative sources

- [x] Consistent with **ADR-0021**: the actor field was placed in the chain at 2.0 precisely so admitting a
      second Seat rewrites nothing; M21 binds the founding Seat to `'principal'` and appends only
- [x] Consistent with the **security model** §4: default-deny; the single Permission Broker is preserved; the
      per-Seat Fence is an intersection term, not a second authorization path (ADR-0058); no history rewrite
      touches the hash chain (T6 threat honored, security §3)
- [x] Consistent with **ADR-0020**: the per-Seat budget nests under the firm month; "cost follows the
      requester" becomes "cost follows the originating Seat"; admitting a Seat never raises spend
- [x] Consistent with the **memory architecture** (§7): per-Seat isolation reuses the namespace mechanism,
      default-deny, like a department boundary at the human layer
- [x] Consistent with **database design**: additive migrations 0042–0046; `events.actor` unchanged;
      `budget_ledger` and `preferences` gain scope strings, not columns; no column repurposed (db-design §10)
- [x] Milestone numbering per `/MILESTONE_REGISTRY.md` (M21, first milestone of 3.0 "Chambers")
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC10 defined in the architecture §17 and each mapped to a task in E6
- [x] The exit criterion — "a second Seat is created; every event distinguishes the two; no historical event is
      rewritten" — decomposes into AC1 (second Seat created), AC2 (events distinguished by actor value), and
      AC3 (no history rewritten, proven by a hash-chain integrity assertion over the pre-existing prefix)
- [x] AC3 is owned by task T6.1 (the chain-integrity proof), the **last** test to go green
- [x] Per-Seat Fence (AC4), budget (AC5), and memory isolation (AC6) each testable and named; none relies on
      configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **Delegation, separation of duties, and self-approval prohibition are OUT OF SCOPE** — they are M22; a
      Seat in M21 acts only as itself, and no cross-Seat act exists (architecture §1.4, §16.2)
- [x] **No history rewrite** anywhere: no API, migration, or code path issues an `UPDATE`/`DELETE` against
      `events`; admitting a Seat is append-only (architecture §3.3.1, §12.3.1; CI statement-scan §19)
- [x] No second Broker; the Seat Fence is an intersection term over the single choke point (ADR-0058)
- [x] A Seat is not an agent; disjoint identifier spaces (ADR-0057)

## 7. Testing and CI

- [x] Testing strategy (architecture §18) covers unit, lifecycle, Broker integration, budget, memory
      isolation, chain integrity, migration, and equivalence layers; fixtures include a mixed-actor
      pre-existing prefix and a two-Seat fixture
- [x] CI requirements (architecture §19) include the **chain-integrity test** (no historical hash changes when
      a Seat is added), a no-history-rewrite statement scan, dependency-direction, single-choke-point,
      disjoint-identity, and migration forward-only checks

## 8. Open items carried forward (non-blocking)

- [ ] M17–M20 remain **Defined**, not Documented; when picked up, confirm none introduces a coupling to Seats
      (none expected — see `00-M20-AUDIT.md` §3.1)
- [ ] Confirm ADR numbers 0057–0059 are still free before promotion `Proposed → Accepted` (see §2)
- [ ] On integration, update `/MILESTONE_REGISTRY.md` M21 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, then E3/E4/E5 in parallel. E6 (the
      chain-integrity proof, T6.1) is the last thing to go green.

**STOP.** Per the workflow, do not begin M22 (Delegation and Separation of Duties) until AntiGravity completes
M21 implementation and integration, and the second-Seat / no-history-rewritten exit criterion is demonstrated.
