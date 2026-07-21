# M16 Connector Framework — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `CONNECTOR_FRAMEWORK_ARCHITECTURE.md` (philosophy, lifecycle, domain model,
      manifest, components, security, custody, authorization, effect classes, persistence, APIs, sequence
      diagrams, failure scenarios, performance, dependencies, risks, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E10, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M15 audit (STEP 1 gate) — `00-M15-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0034 — Connector credentials held by the kernel, never by the connector
- [x] ADR-0035 — A connector is granted to a department, never to the Firm
- [x] ADR-0036 — Egress declared in the manifest, enforced by the kernel
- [x] ADR-0037 — OAuth authorization is a kernel capability

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the sequence after ADR-0033.

- [ ] **Integration action (AntiGravity):** copy the four ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M3 (Permission Broker, `EgressFilter`, `KeychainManager`, redaction) — present in `services/security/`
- [x] M9 (plugin trust chain + Wasm host) — present in `services/plugins/`
- [x] M13 (departments + Registrar) — the substrate M16 grants against; `integration:*` already in
      `department.toml`
- [x] M2 (event log) — connector events land on the existing hash chain
- [x] Dependency direction preserved: `packages/domain ← services/connectors ← apps/*`; **no** edge to
      `services/orchestrator` or `services/mission` (CI-enforced, AC12)

## 4. Consistency with authoritative sources

- [x] Effect-class semantics match `/docs/07-security-model.md` §5 (reads 1, writes 2, irreversible 3); no
      class-0 network operation
- [x] Egress rules extend §7.5 / §11 without adding a new outbound path
- [x] `integration:<id>:<action>` namespace matches the grammar already used in `department.toml`
      `[capabilities]`, and honors `[capabilities].forbidden` (ADR-0013)
- [x] Layer model respected: framework is Layer-1 kernel; connectors are Layer-6 artifacts; the Layer-6
      replaceability test (disconnect → local work continues) is an acceptance criterion (AC7)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M16, first undocumented milestone; ADR-0032)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E10
- [x] The exit criterion ("granted to exactly one department, no other department can reach it, proven by
      test") is AC2, owned by task T10.1
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] First-party connectors are **out of scope** (they are M17); M16 delivers only the framework and the
      conformance suite they will run against
- [x] Non-HTTP transports flagged out of scope (would need their own ADR)

## 7. Open items carried forward (non-blocking)

- [ ] Registry metadata refresh: `MILESTONE_REGISTRY.md` §2 task-count line is stale vs git (T1.2, T1.3
      committed) — note only, fix during integration (see `00-M15-AUDIT.md` §2)
- [ ] ADR-0033 promotion `Proposed → Accepted` when T1.3 review closes — does not gate M16
- [ ] On integration, update `MILESTONE_REGISTRY.md` M16 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, then E3/E4 in parallel. E10 (the isolation
      proof) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M17 until AntiGravity completes M16 implementation and
integration.
