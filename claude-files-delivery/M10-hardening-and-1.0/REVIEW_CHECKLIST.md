# M10 Hardening and 1.0 — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `HARDENING_AND_RELEASE_ARCHITECTURE.md` (why the milestone exists, design goals,
      the release-gate state machine, the CI gate catalogue, the second security review, chaos & recovery,
      performance-budget enforcement, audit-coverage proof, backup/restore & degradation ladder, the 30-day
      dogfood protocol, persistence/events, public surface touched, sequence diagrams, failure scenarios,
      dependencies/risks, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M9 audit (STEP 1 gate) — `00-M9-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0038 — The 1.0 release gate is a proof obligation, not a date
- [x] ADR-0039 — Hardening adds no authoritative tables; release bookkeeping is a projection

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the global sequence after ADR-0037 (M16); this package holds ADR-0038 and ADR-0039. Status: `Proposed`.

- [x] **Only genuinely-new decisions recorded.** The performance-budget stance ("do less work, never raise the
      number") is already recorded (GUIDE §3 non-negotiable 16; testing §6) and is reaffirmed inside ADR-0038,
      not duplicated as its own ADR. Audit-coverage and chaos are already CI gates (GUIDE §7). Only the
      release-gate shape (0038) and additive bookkeeping (0039) are undecided by ADRs 0001–0037.
- [ ] **Integration action (AntiGravity):** copy ADR-0038 and ADR-0039 into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M1 (CI, signed installers) — the Build gate
- [x] M2 (Vault, event log, hash chain, projections) — the durability and audit-coverage proofs
- [x] M3 (security kernel, Broker, egress, keychain, effect classes) — the re-exercised controls
- [x] M4 (gateway, budget ceilings) — the budget-capped degradation stage
- [x] M5 (memory) — the retrieval evaluation set
- [x] M6/M7 (orchestrator, full Firm) — the delegation/Brief/honesty evals; the daily-use instrument
- [x] M8 (the building) — the three performance budgets
- [x] **M9 (plugins)** — the plugin capability surface the second security review must cover (impl-plan §3)
- [x] Dependency direction preserved and re-proven by GATE-2: `packages/domain ← services/* ← apps/*`

## 4. Consistency with authoritative sources

- [x] Exit criterion matches the registry §4 and impl-plan §M10 verbatim: thirty days dogfooding, zero data
      loss, zero unlogged effects
- [x] The durability contract matches system-design §6 ("`kill -9` loses at most one in-flight model call")
      and testing §3 (the crash harness, corruption matrix, migration rehearsal)
- [x] Performance budgets match testing §6 exactly (cold start ≤1.2 s p50/20, 60 fps no frame >32 ms, idle
      ≤400 MB, reference + lowest-spec, gate = lower); the enforcement rule matches GUIDE §3.16
- [x] The audit-coverage gate matches testing §1 (every effectful path has a paired log assertion or CI fails)
      and the projection rebuild-and-diff invariant
- [x] The second security review matches testing §5 (red-team vectors, injection corpus ≥60, denied-and-logged
      rule, supply-chain gates) and security §7/§11
- [x] The degradation ladder matches technical-architecture §9 (full → no-network → budget-capped → read-only)
- [x] Backup/restore matches system-design §6 (snapshot cadence, retention, `integrity_check` verification) and
      impl-plan §M10 (export/re-import round-trip)
- [x] Effect-class policy unchanged: class-3 always asks, no standing grant in 1.0 (security §5; GUIDE §12)
- [x] The eight 1.0 gates are the in-scope subset of GUIDE §7; the four later gates (Kernel-neutrality,
      Replay-equivalence, Pack-validation, Guard-corpus) are named as out of scope for 1.0
- [x] No existing architecture modified; no ADR decision reversed; no v1 `/docs` claim contradicted

## 5. Acceptance criteria complete

- [x] AC1–AC15 defined in the architecture §16 and each mapped to a task in the plan
- [x] The exit criterion (thirty consecutive clean dogfood days, zero data loss, zero unlogged effects, the
      recorded release-gate Decision) is AC15, owned by task T7.4 — **the last thing to go green**
- [x] Every AC is objectively testable and named; none relies on manual verification except where the source
      mandates a human demonstration (the release-gate Decision "to someone who does not trust you", GUIDE §6)
- [x] "Zero data loss" and "zero unlogged effects" are given mechanical definitions (architecture §10.2–§10.3)

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No new product feature** — 1.0 scope frozen at feature-complete; the roadmap "not in 1.0" list stands
      (architecture §1.4; ADR-0038); enforced by the scope-freeze guard (T1.1)
- [x] **No new crate** — only `infrastructure/ci/` and `infrastructure/testing/` change, plus test additions
      inside existing crates (Appendix B; ADR-0039)
- [x] **No new migration** — hardening bookkeeping is a projection over existing events (architecture §11;
      ADR-0039)
- [x] **No budget relaxed** — a breach is fixed by doing less work; raising a budget needs its own ADR (§7;
      testing §6)
- [x] The four later-release CI gates are flagged out of scope, preventing premature M11+ work under the
      hardening banner

## 7. Open items carried forward (non-blocking)

- [ ] If the M9 developer-experience demonstration (external developer ships a plugin in under a day) has not
      been performed, complete it before E5 (the security review) begins (see `00-M9-AUDIT.md` §2.1)
- [ ] ADR-0038/0039 promotion `Proposed → Accepted` on Principal approval during integration
- [ ] On integration, update `MILESTONE_REGISTRY.md` M10 to reflect implementation status (the number is
      already permanent, registry rule 4)

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 (the eight gates as objects), then E2/E3/E4 in
      parallel, then E5 (the second security review, needs the M9 plugin surface), then E6, then E7. T7.4 (the
      thirty-day dogfood + release-gate Decision) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M11 until AntiGravity completes M10 implementation and
integration and the exit criterion is demonstrated. 1.0 ships at the end of M10; M11 (Department substrate)
begins only after 1.0 is in daily use (GUIDE §5).
