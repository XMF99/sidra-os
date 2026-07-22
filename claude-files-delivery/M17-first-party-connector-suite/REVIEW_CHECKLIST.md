# M17 First-Party Connector Suite — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `CONNECTOR_SUITE_ARCHITECTURE.md` (why-it-exists/stance, design goals, domain
      model, the five connector specifications, component/repository placement, public APIs, events,
      persistence, security requirements, performance, sequence diagrams, failure scenarios, risks,
      dependencies, acceptance criteria, testing strategy, CI requirements, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M16 audit (STEP 1 gate) — `00-M16-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0046 — The concrete five-connector set and their effect-class maps
- [x] ADR-0047 — The per-connector offline-degradation contract: no buffered writes
- [x] ADR-0048 — Object-storage addressing, chunking, and size limits

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the sequence: 0046–0048, after M16's 0037 and the parallel M10–M14 batch's
0038–0045. Status `Proposed`; become `Accepted` on Principal approval.

- [ ] **Integration action (AntiGravity):** copy the three ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] **M16 (Connector Framework)** — the substrate M17 is content on; every surface M17 consumes (manifest +
      install checks, per-department grant, custody, kernel OAuth, egress, invocation pipeline, conformance
      suite) is specified (see `00-M16-AUDIT.md` §1.1)
- [x] M13 (departments + Registrar) — the grant targets (Software Engineering, Sales, Customer Success, Data
      Engineering) exist as installable Packs; the Registrar resolves the calling agent's department
- [x] M9 (plugin signing chain + Wasm host) — the five manifests sign on the plugin trust chain; the optional
      `git`/`object-storage` transforms run in the plugin sandbox
- [x] M3 (Broker, `EgressFilter`, `KeychainManager`, redaction) — inherited through M16
- [x] Dependency direction preserved: M17 adds **no crate and no edge**; the M16 CI check (`sidra-connectors`
      has no edge to `sidra-orchestrator`/`sidra-mission`) remains green untouched

## 4. Consistency with authoritative sources

- [x] Effect-class semantics match `/docs/07-security-model.md` §5 and M16 §10 (reads 1, writes 2, irreversible
      3; class-3 always asks); no class-0 network operation; every operation of all five mapped in ADR-0046
- [x] Egress rules extend ADR-0036 without a new outbound path; object storage's single declared host
      (ADR-0048) satisfies M16 install check #6 with no wildcard
- [x] `integration:<id>:<action>` namespace used for every operation; matches the grammar in `department.toml`
      `[capabilities]`; honors `[capabilities].forbidden` (ADR-0013)
- [x] Each connector anchored to a department in `/docs-v2/04-department-catalog.md`, respecting that
      department's effect ceiling (e.g. `mail`→Customer Success ceiling 2; `calendar`→Sales ceiling 3)
- [x] Layer model respected: the framework is Layer-1 kernel (M16, unchanged); the five connectors are Layer-6
      artifacts (`02-layer-model.md` §6); the Layer-6 replaceability test (disconnect → local work continues,
      §9) is the offline acceptance clause (AC-O1)
- [x] Registry definition honored: the five categories, the M16 dependency, and the exit criterion match
      `/MILESTONE_REGISTRY.md` §4 verbatim
- [x] No existing architecture modified; no ADR decision reversed; **no framework mechanism added** (the
      defining stance, architecture §1.4)

## 5. Acceptance criteria complete

- [x] The exit criterion decomposed in architecture §15 into three clauses: five pass the same conformance
      suite (AC-C1..C5), each grantable per department/isolated (AC-I1..I3), each degrades offline without data
      loss (AC-O1..O3), rolled up as AC-X1
- [x] "The same conformance suite" is literal: M16's AC1–AC10, one harness, five connectors, the same ten
      claims each
- [x] Every AC is testable and named; none relies on configuration or manual verification; each maps to a task
      in E7 (and per-connector tasks in E2–E6)
- [x] AC-X1 (the exit criterion in one run) is E7's final task, T7.5 — the last thing to go green

## 6. Scope discipline

- [x] No production kernel code in this package (architecture and plan only; the deliverables are manifests,
      optional Wasm transforms, one migration, and test fixtures)
- [x] **No framework mechanism added** — no `services/*` crate, no framework-table migration, no install check,
      no grant type, no event variant; if a connector appeared to need one, that is flagged as an M16 gap to
      raise, not an M17 feature (architecture §1.4, plan §0.1)
- [x] Exactly five connectors, per the registry — not four, not a broader suite (ADR-0046)
- [x] M18 (Companion) and beyond are **out of scope**; non-HTTP transports remain out of scope (inherited from
      M16 §16.2)

## 7. Testing and CI

- [x] Testing strategy (§16): the M16 conformance harness pointed at real artifacts, plus the three
      exit-criterion clauses; hermetic network stubs, no live service reached
- [x] CI requirements (§17): the conformance suite runs for all five; the M16 kernel-neutrality grep still
      passes (no connector id in the framework crate); no new framework migration; manifest lint; redaction scan
- [x] The five-connector conformance + offline + isolation proof is the last epic's final task and the last
      thing to go green (E7 T7.5)

## 8. Open items carried forward (non-blocking)

- [ ] Reconcile the M16 package README's "mark ADRs Accepted" integration action against `docs-v2/adr/README.md`,
      which already shows 0034–0037 `Accepted` (metadata lead/lag; see `00-M16-AUDIT.md` §2.2) — note only
- [ ] On integration, update `MILESTONE_REGISTRY.md` M17 status `Defined → Documented` (renumbering becomes
      forbidden at that point, registry rule 4)
- [ ] `0031_` migration slot is reserved by the pinned band but unused; free for a future second projection if
      one is warranted during implementation — do not spend speculatively

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 (harness + stubs + migration), then E2–E6 (the five
      connectors, parallelizable), then E7 (the exit criterion) as the last thing green.

**STOP.** Per the workflow, do not continue to M18 until AntiGravity completes M17 implementation and
integration and all five connectors pass the conformance suite. M17 *implementation* must not begin until M16
is implemented and its exit-criterion test is green (`00-M16-AUDIT.md` §3).
