# M20 Executable Artifacts — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `EXECUTABLE_ARTIFACTS_ARCHITECTURE.md` (why it exists, design goals, state
      machines, domain model, manifest & validation, component structure, security, effects/host functions, the
      run path, effect classes, persistence, APIs, sequence diagrams, CI requirements, performance, failure
      scenarios, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M19 audit (STEP 1 gate) — `00-M19-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0054 — An executable artifact's capability grant is a strict subset of its producing Work Order's grant
- [x] ADR-0055 — Executable artifacts reuse the M9 Wasm host; there is no new sandbox
- [x] ADR-0056 — An executable artifact's provenance is recorded and is the source of its grant

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Status `Proposed`. Numbering `0054`–`0056` continues the programme's global ADR sequence after M16's
`0034`–`0037` and does not exceed `0056`.

- [ ] **Integration action (AntiGravity):** copy the three ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M9 (Wasm plugin host + trust chain, ADR-0006) — present in `services/plugins/`; **reused verbatim, not
      forked** (ADR-0055)
- [x] M16 (connector/capability machinery: per-department grant, custody, egress) — present in the M16 package
      and `services/connectors/`; the external-effect path reuses it
- [x] M3 (Permission Broker, effect classes, redaction) — the choke point every effect passes; present in
      `services/security/`
- [x] M15 Work Order `capability_grant` — present in `/docs/04-database-design.md` §2; the grant source for
      ADR-0054
- [x] M2 (event log) — executable-artifact events land on the existing hash chain
- [x] Dependency direction preserved: `packages/domain ← services/artifacts-exec ← apps/*`; **no** edge to
      `services/orchestrator` or `services/mission` (CI-enforced, AC13)

## 4. Consistency with authoritative sources

- [x] **No new sandbox.** Execution reuses the M9 host; fuel/memory/epoch caps and no-ambient-authority
      (ADR-0006) apply unchanged (ADR-0055, architecture §6, §8)
- [x] **No autonomy on install.** A Marketplace-distributed artifact arrives grant-less; authority comes only
      from a Work Order and never exceeds it — reconciles GUIDE §12 explicitly (architecture §7.4, ADR-0056)
- [x] **⊆-grant is structural, not policed.** A requested capability beyond the Work Order grant is refused at
      derivation, before the artifact is runnable (ADR-0054, architecture §3.3, §13.2)
- [x] Effect-class semantics match `/docs/07-security-model.md` §5 (local write class-2 versioned, external read
      class-1, irreversible class-3 always-ask); an artifact cannot lower an operation's class
- [x] The capability grammar is the security-model grammar verbatim; no new namespace (architecture §5.2)
- [x] Every effect passes the Permission Broker; the host-function set is a subset of the M9 set, no new effect
      surface (architecture §8, ADR-0055)
- [x] Layer model respected: the artifact is a Layer-7 Wasm artifact; the runtime is a Layer-1 authority layer
      over the M9 host; the replaceability test (disconnect → local work continues) holds (architecture §15)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M20, last of 2.5; documented in dependency order — see
      `00-M19-AUDIT.md`)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC13 defined in the architecture §17 and each mapped to a task in E6
- [x] The exit criterion ("executes, is capability-bounded, cannot exceed the producing Work Order's grant,
      proven by a denial test") is AC3, owned by task T6.1 — the last task to go green
- [x] Every AC is testable and named; none relies on configuration or manual verification
- [x] The two CI gates are named: the grant-subset property test (AC6) and the no-ambient-authority test (AC5)

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No new sandbox mechanism** — the M9 host is reused verbatim (ADR-0055)
- [x] **No autonomy on install** — installation grants nothing; authority is Work-Order-derived and bounded
      (ADR-0056, §7.4)
- [x] **No new effect surface** — the host-function set is a subset of the M9 broker-mediated set
- [x] First-party executable artifacts are **out of scope** — M20 delivers the runtime and the conformance/
      acceptance suite, not a library of executables
- [x] Non-Wasm execution targets are out of scope (would need their own ADR and their own sandbox argument)

## 7. Open items carried forward (non-blocking)

- [ ] **M20 documented ahead of M17–M19.** Dependency-correct (M20 depends on M9 + M16, both Documented) and not
      a reordering (M20 keeps its number). Recorded in `00-M19-AUDIT.md` §4; surface to the Principal so a
      Documented last milestone alongside three Defined earlier siblings is a visible, deliberate state.
- [ ] Architect M17, M18, M19 before *implementing* 2.5 end to end — M20's architecture does not depend on them,
      but the release does.
- [ ] On integration, update `MILESTONE_REGISTRY.md` M20 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4).
- [ ] Confirm the `docs-v2/adr/` sequence accommodates 0054–0056 alongside the M16 ADRs (0034–0037) when both
      are copied in during integration.

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2 (the grant is the milestone's heart), E5 schema
      alongside, then E3 (reuse the M9 host) → E4 (Broker/effects) → E6. **T6.1 (the bounding-refusal proof) is
      the last thing to go green.**

**STOP.** **M20 closes release 2.5 "Field."** Per the workflow, do not continue to M21 (3.0 "Chambers") until
AntiGravity completes M20 implementation and integration, and the capability-bounded-execution exit criterion is
demonstrated. With M20 done, **release 2.5 "Field" is complete**.
