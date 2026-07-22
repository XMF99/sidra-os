# M26 Outcome Calibration — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `OUTCOME_CALIBRATION_ARCHITECTURE.md` (why it exists, the stance, what
      calibration calibrates and the boundary §3, the estimate-error metric §4, the run lifecycle §5, domain
      model §6, the computation §7, versioning/revert/projection §8, components §9, APIs §10, events §11,
      persistence §12, security §13, performance §14, sequence diagrams §15, failure scenarios §16, risks §17,
      dependencies §18, acceptance criteria §19, testing §20, CI §21, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M25 audit (STEP 1 gate) — `00-M25-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0069 — Calibration is a revertible projection over local outcome records, never a telemetry channel
- [x] ADR-0070 — Calibration adjusts numeric parameters only, never a capability, a Standard, or the org chart
- [x] ADR-0071 — A calibration is applied only if it measurably narrows error, and every adjustment is
      inspectable

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost; `/docs-v2/adr/README.md` §Format). Numbering is **0069–0071**, continuing the global sequence after
M25's 0067–0068. Status `Proposed`.

- [ ] **Integration action (AntiGravity):** confirm 0069–0071 are free after M17–M24; copy the three ADRs into
      `docs-v2/adr/`, add their rows to `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] **M15 (Mission Engine)** — the sole hard dependency: the outcome records (§23.3), the estimate model
      (§5.2, §11), the novelty dimension (§11.2), the risk aggregation (§11.3), and the `active_parameters()`
      read seam at plan time (§23.2). Present and Documented (`00-M25-AUDIT.md` §1)
- [x] M2 (event log) — `CalibrationRun`/`CalibrationApplied`/`CalibrationRejected`/`CalibrationReverted` and the
      sample events land on the existing hash chain (ADR-0002)
- [x] M3 (Permission Broker, redaction) — authorises `run`/`revert` as Decisions; redaction defence-in-depth on
      the write path (though calibration handles no secret)
- [x] ADR-0009 (no telemetry) — the governing constraint the whole subsystem is shaped around
- [x] ADR-0002 (projection discipline) — makes parameters rebuildable and revert exact
- [x] Dependency direction preserved: `packages/domain ← services/calibration ← apps/*`;
      `services/calibration` depends on `services/store`, `services/security`, `packages/domain`; **no** edge to
      `services/orchestrator`, `services/connectors`, `services/mission` (runtime), or any network crate
      (CI-enforced, AC13). The parameter store is the only seam to planning

## 4. Consistency with authoritative sources

- [x] Outcome record, estimate model, novelty dimension, and risk aggregation match
      `MISSION_ENGINE_ARCHITECTURE.md` (§23.3, §5.2/§11, §11.2, §11.3); where this package could be read to
      disagree, the Mission Engine governs (architecture precedence note)
- [x] **No telemetry (ADR-0009)** — nothing on the calibration path opens a network connection; two redundant
      proofs (compile-time closure check + runtime socket guard, §13.1); samples/parameters excluded from
      auto-export; where this package could be read to disagree, ADR-0009 governs absolutely
- [x] **The 4.0 propose-not-enact constraint** — calibration changes *numbers*, never structure; widening a
      capability/Standard/org chart is a Principal Decision under Principle 14, owned by M27/M29, with no code
      path here (ADR-0070, §3.4, §13.3)
- [x] Safety structure invariant: reversibility and blast radius stay in `max`; `n=0 → 3` fixed; no risk weight
      reaches 0 (`w_floor`); "risk never decreases without evidence" and "unknown is not Low" (§11.5) are
      inputs, not casualties (§7.3, §3.3)
- [x] Projection discipline (ADR-0002): parameters are a versioned projection; recovery replays, revert
      re-activates a retained version; rebuild-and-diff is a test (§8)
- [x] Milestone numbering per `MILESTONE_REGISTRY.md` (M26 opens 4.0 "Continuum"; ADR-0032 single global
      numbering); migrations `0057`–`0060` additive and forward-only (§12.1)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated; no new M1–M25
      boundary re-decided

## 5. Acceptance criteria complete

- [x] AC1–AC13 defined in the architecture §19 and each mapped to a task in the plan (E1–E7; CI checks in E6)
- [x] The exit criterion ("estimate error narrows measurably over 50 concluded Missions; inspectable and
      revertible") is AC1 + AC3 + AC4, owned by **T7.10 (the last thing green)**
- [x] "Narrows measurably" is a defined metric (§4): median absolute relative error, per-estimand floors,
      walk-forward, `EE(last W) ≤ (1−δ)·EE(first W)`, with the calibration-off fixture showing no narrowing —
      a mechanical assertion, not a review
- [x] Every AC is testable and named; none relies on configuration or manual inspection

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **Local only** — nothing leaves the machine; no network client in the crate closure; runtime socket
      guard; samples/parameters excluded from auto-export (ADR-0009, §13.1)
- [x] **Numeric only** — calibration writes estimate corrections, a novelty mapping, and risk weights; the
      schema has no field for a capability, Standard, Guard, department, or ceiling, and the crate has no
      dependency on those write APIs (ADR-0070, §13.3)
- [x] **Revertible & inspectable** — every applied adjustment traces to its sample ids; a revert restores prior
      parameters byte-for-byte (§6.5, §8.3)
- [x] Structural change (charter evolution, procedural compilation, self-review) is **out of scope** — it is
      M27/M28/M29, requires a Principal Decision, and is not exercised here (§20.3)

## 7. Open items carried forward (non-blocking)

- [ ] Confirm ADRs `0069`–`0071` and migrations `0057`–`0060` are free after M17–M24 land; renumber only on a
      real collision (numbering is permanent once documented — registry rule 4) — see `00-M25-AUDIT.md` §3
- [ ] On integration, update `MILESTONE_REGISTRY.md` M26 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)
- [ ] M30 (release hardening) re-audits every 4.0 feedback loop, including this one (registry §4) — a standing
      obligation, not an M26 blocker

## 8. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, with E4 landing before E3's apply step and E6's
      CI gates running alongside from E1 onward; then E3 → E5, and **E7 (the acceptance) is the last thing to
      go green — its final task T7.10 (error narrows · inspectable · revertible over 50 Missions) last of
      all.**

**STOP — this opens release 4.0 "Continuum".** Do not begin M27 until AntiGravity completes M26 implementation,
integration, and the exit criterion is demonstrated.
