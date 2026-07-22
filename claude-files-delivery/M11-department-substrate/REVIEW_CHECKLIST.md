<<<<<<< HEAD
# M11 — Review Checklist

Every item ✓ VERIFIED or ✗ FAILED. Build/test items are ✗ until a toolchain runs them.

## Documents & ADRs
- [x] README, Architecture, Implementation Plan, Review Checklist present
- [x] Governing ADRs mapped (0013, 0014, 0016, 0017); no new ADR required

## Epics complete
- [ ] E1 domain + migrations 0012–0018 + events
- [ ] E2 `sidra-departments` (registrar/org-graph/autoscale/budget/implicit dept)
- [ ] E3 `sidra-registry` (standards/registries/Canon path)
- [ ] E4 Guard Runner (declarative + Wasm)
- [ ] E5 Exchange (routing/resolution/cost/depth/cycle)
- [ ] E6 isolation + invariants I-12…I-17
- [ ] E7 replay equivalence gate

## Acceptance criteria
- [ ] AC1 replay Briefs byte-identical
- [ ] AC2 twelve manifest checks, each naming its rule, no override
- [ ] AC3 implicit department loads; v1 agents resolve with stable IDs
- [ ] AC4 budget sub-ceiling pauses one department (I-14)
- [ ] AC5 Exchange refuses cycles and depth>2 (I-15)
- [ ] AC6 fs (I-12) + memory (I-13) isolation
- [ ] AC7 Standards resolution + violation recording
- [ ] AC8 Guard Runner declarative + Wasm (fuel, no ambient)
- [ ] AC9 migrations forward-only/idempotent; null=v1
- [ ] AC10 nothing Principal-visible (Rail unchanged)

## Exit criteria
- [ ] AC1 green with AC2–AC10 supporting → substrate ready for M12

## Architecture compliance
- [x] Additive only; no event kind/column removed or redefined
- [x] Dependency direction: `sidra-departments`/`sidra-registry` have no edge to orchestrator
- [ ] Build/test/clippy/fmt executed — **✗ NOT VERIFIED (no toolchain)**

**STOP after M14.**
=======
# M11 Department Substrate — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `DEPARTMENT_SUBSTRATE_ARCHITECTURE.md` (why it exists, design goals, the boundary
      model and the five faces, domain model, the four nested ceilings, kernel neutrality, memory/fs scoping,
      the Exchange contract, the replay strategy, persistence, events, APIs, sequence diagrams, failure
      scenarios, performance/offline, dependencies/assumptions/risks, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E8, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M10 audit (STEP 1 gate) — `00-M10-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0040 — The implicit default department as the migration bridge
- [x] ADR-0041 — Replay equivalence as the substrate's exit gate

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the global sequence after ADR-0037; this package holds 0040–0041, immediately after
M10's 0038–0039. No ADR was created for a decision already recorded: kernel neutrality (ADR none — it is an
existing invariant, `/docs-v2/02-layer-model.md` §1 + `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 12), the fourth
budget ceiling (ADR-0020, consumed not re-decided), the Pack-as-boundary and contracts-not-departments rules
(ADR-0013, consumed), and Standards/Guards as kernel primitives (ADR-0016, consumed) are all reused, not
re-opened.

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M2 (event log, hash chain) — present; Brief-as-projection is what makes byte-identity meaningful (ADR-0002)
- [x] M3 (Permission Broker, capability model) — present; enforces F-cap and F-fs
- [x] M4 (Model Gateway, three ceilings) — present; the fourth ceiling inserts here (ADR-0020)
- [x] M5 (Memory Service, namespaces) — present; enforces F-mem
- [x] M6 (orchestrator, typed Work Orders, ADR-0010) — present; gains two optional fields
- [x] Dependency direction preserved: `packages/domain ← services/departments ← apps/*`; **no** kernel crate
      names a department (CI kernel-neutrality grep, AC3)

## 4. Consistency with authoritative sources

- [x] The five faces match `/docs-v2/03-department-architecture.md` §4 and `/docs-v2/01-enterprise-architecture.md`
      §5 (memory namespace, capability ceiling, budget sub-ceiling, filesystem scope, Exchange-only comms) and
      the invariant card `/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 10
- [x] The fourth budget ceiling matches ADR-0020 exactly (inserted between engagement and month; three v1
      ceilings unchanged; share 1.0 = v1; exhaustion pauses the department, not the Firm)
- [x] Contracts-not-departments and the Pack-as-boundary rule match ADR-0013 (`requires.contracts` may not name
      a department; hard install refusal)
- [x] Standards/Guards handled per ADR-0016 and `/docs-v2/01-migration-strategy.md` §4 (empty set at M11 = no
      change; not enforced by the substrate; seams reserved for M13)
- [x] Layer model respected: the substrate is Layer-1 kernel; a Department Pack is a Layer-3 artifact loaded at
      M13; kernel neutrality is the Layer-1 defining constraint (`/docs-v2/02-layer-model.md` §1)
- [x] Replay-equivalence definition matches `/docs-v2/01-migration-strategy.md` §6 (byte-identical Brief, model
      calls stubbed, corpus, CI gate on every step)
- [x] Migration policy matches `/docs/04-database-design.md` §10 (forward-only, numbered, one transaction, test
      against a prior-release fixture Vault); additive-nullable per `/docs-v2/01-migration-strategy.md` §2
- [x] Milestone meaning per `/MILESTONE_REGISTRY.md` §4 (M11 = Department substrate; exit = replay equivalence;
      invisible; gates M12–M14) — authoritative over `/MASTER_IMPLEMENTATION_GUIDE.md` §5 where they differ
- [x] No existing architecture modified; no v1 document contradicted (precedence rule, `/MASTER_IMPLEMENTATION_GUIDE.md`
      §2); no ADR decision reversed

## 5. Acceptance criteria complete

- [x] AC1–AC9 defined in the architecture §Acceptance and each mapped to a task in the plan
- [x] The exit criterion (replay equivalence green; byte-identical Brief) is AC1, owned by task T8.4, and is the
      last thing to go green
- [x] The five faces each have an enforced-&-tested criterion (AC4 F-bud, AC5 F-comm, AC6 F-cap, AC7 F-mem+F-fs)
      backed by property tests I-12–I-15
- [x] Zero-visible-change is AC2; kernel-neutrality grep is AC3; additivity is AC8; seed-events-off-the-replay is
      AC9. Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] The substrate is **invisible**: no Rail, keymap, Brief, or notification change (AC2). The visible
      re-expression (step 5) is M12, not M11 (`/docs-v2/01-migration-strategy.md` §4)
- [x] **No new features.** The Registrar's instantiation UI, the Exchange carrying real traffic, the Standards
      Engine resolving real standards, and installable Packs are M12–M13 and are explicitly out of scope
- [x] One new crate only (`sidra-departments`); the empty Standards/Guard/Exchange machinery is a no-op seam,
      not a new crate added here — "do not add an unnecessary crate" honoured (see `00-M10-AUDIT.md` §2)
- [x] Migration band `0002`–`0006`; `0019+` (M15/M16) untouched

## 7. Open items carried forward (non-blocking)

- [ ] Reconcile the migration-band numbering in `/docs-v2/02-implementation-changes.md` §3 (`0012`–`0018`) with
      the governing band `0002`–`0006` during integration (see `00-M10-AUDIT.md` §2 item 1)
- [ ] Confirm a representative corpus of recorded v1 Engagements exists before the replay harness runs — the
      gate is only as strong as its corpus (architecture §Assumptions 2; ADR-0041)
- [ ] State the substrate/visible-machinery split explicitly so M12/M13 own the Registrar UI, the Exchange
      routing engine, and the Standards Engine (see `00-M10-AUDIT.md` §2 item 2)
- [ ] On integration, update `/MILESTONE_REGISTRY.md` M11 status (renumbering becomes forbidden at Documented,
      registry rule 4 — M11 is already Documented, so the number is permanent)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E7 (schema + seed), then E2/E3/E4/E5 (the four
      faces) in parallel, then E6 (kernel-neutrality refactor + grep). **E8 (the replay-equivalence harness) is
      the exit criterion and the last thing to go green.**

**STOP.** Per the workflow, do not continue to M12 until AntiGravity completes M11 implementation and
integration and the replay-equivalence test is green.
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7
