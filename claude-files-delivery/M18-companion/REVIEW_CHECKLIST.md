# M18 Companion — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `COMPANION_ARCHITECTURE.md` (why it exists, design goals, state machines, domain
      model, pairing, components, security, render payload, reconciliation, effect classes, persistence, APIs,
      sequence diagrams, failure scenarios, performance, dependencies, risks, acceptance criteria, testing, CI,
      appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M17 audit (STEP 1 gate) — `00-M17-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0049 — No-desktop-present sync and idempotent reconciliation (the load-bearing decision)
- [x] ADR-0050 — The Companion is a paired, untrusted client
- [x] ADR-0051 — The Brief travels as a canonical render payload; the Companion displays, never re-renders or
      authors

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering is consecutive from ADR-0049 and does not exceed ADR-0051. Status `Proposed`.

- [ ] **Integration action (AntiGravity):** copy the three ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M10 (Brief format + sanitizing render pipeline) — the six `briefs` fields and the node allowlist the
      render payload reuses (ADR-0051); Documented
- [x] M15 (Approval Requests) — the `approval_requests` mirrored and the `decisions` reconciliation appends;
      Documented
- [x] M3 (security kernel — keychain, redaction, Ed25519, the untrusted-client boundary) — present in
      `services/security/`
- [x] M2 (event log & hash chain, ADR-0002) — pairing/capture/reconciliation events land on the existing chain
- [x] **M18 does not depend on M17.** The connector suite is orthogonal to Briefs and approvals; M18's registry
      dependencies are M10 and M15 (see `00-M17-AUDIT.md`)
- [x] Dependency direction preserved: `packages/domain ← services/companion ← apps/companion`; **no** edge to
      `services/orchestrator`, `services/mission`, or `services/departments` (CI-enforced, AC12)

## 4. Consistency with authoritative sources

- [x] The phone is an untrusted client in the class `/docs/01-technical-architecture.md` §4 defines — no
      secret, no Vault, no model network; "assume compromised" applies
- [x] The kernel remains the single source of truth (`/docs/01-technical-architecture.md` §1); the phone's
      snapshot is a cache and its outbox is signed intent, never a second ledger
- [x] A phone approval is a logged Decision on the append-only hash chain (ADR-0002), applied exactly once,
      keyed to `approval_request.id` — a pure append, never a rewrite
- [x] The Brief renders identically — a `content_hash` equality (ADR-0051), not a judgement — reusing the M10
      sanitizing pipeline and allowlist; no second renderer
- [x] Effect-class semantics unchanged (`/docs/07-security-model.md` §5–§6): class 3 never offers `Always`;
      options mirror the desktop
- [x] Telemetry stays off (ADR-0009): sync is device-to-device on the Principal's own infrastructure; the
      relay is dumb, optional, and holds no authority; nothing reaches Anthropic or any Sidra server
- [x] "No desktop present" is satisfied without M23 (no headless hosted kernel) and without a cloud service —
      recorded as the load-bearing ADR-0049
- [x] No authoring path: no Directive creation, no composition engine, no author command — enforced by the
      absence of the machinery, not a disabled button (ADR-0051)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M18 depends on M10 + M15; ADR-0032)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E6 (with cross-epic coverage)
- [x] The exit criterion ("clears a day's approvals from a phone with no desktop present; the Brief renders
      identically") decomposes into AC1 (no desktop present), AC2 (renders identically), AC3 (every approval a
      hash-chain Decision), plus AC4–AC12
- [x] The no-desktop-present exit proof is E6/T6.6 — the last thing to go green
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] **No authoring.** No Directive creation, no Mission drafting, no Brief composition/editing, no reply. The
      client has a painter, not a composition engine (ADR-0051); the API surface has no author command (§12)
- [x] **No second source of truth.** The phone caches and couriers; the kernel decides; the hash chain records.
      No phone-side event log, no merge substrate (that is M24)
- [x] **No headless kernel / no cloud service.** "No desktop present" is a local-first cache + idempotent
      reconciliation (ADR-0049); M23 is not presupposed
- [x] **No telemetry.** ADR-0009 stands; the relay is dumb, optional, and on the Principal's own infrastructure
- [x] No production code in this package (architecture and plan only)
- [x] Voice authoring is out of scope (M19); non-approval interactions are out of scope

## 7. Open items carried forward (non-blocking)

- [ ] M17 is `Defined`, not `Documented`. M18 does not depend on M17, so this does not gate M18 (see
      `00-M17-AUDIT.md`). Architecting M18 before M17 is a deliberate, dependency-driven choice, not an
      oversight; note it on the register during integration.
- [ ] On integration, update `MILESTONE_REGISTRY.md` M18 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4).
- [ ] Confirm the M17 migration band before finalizing M18's `0033` start; M16 ends at `0029`, and `0030`–`0032`
      are reserved for M17. If M17 is documented with a different band, re-check for a collision at integration.

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, with E3 alongside E2. E6 (the
      no-desktop-present exit proof) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M19 until AntiGravity completes M18 implementation and
integration, and the phone-clears-approvals-with-no-desktop exit criterion is demonstrated.
