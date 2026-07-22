# M30 Continuum Hardening and 4.0 — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `CONTINUUM_HARDENING_ARCHITECTURE.md` (why the milestone exists, design goals,
      the release-gate state machine, the evolution-path gate catalogue, the second security review, the
      feedback-loop bounding model, performance under sustained self-improvement, the no-escalation proof, the
      ninety-day dogfood protocol, persistence/events, public surface touched, sequence diagrams, failure
      scenarios, dependencies/risks, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M29 audit (STEP 1 gate) — `00-M29-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0078 — The 4.0 release gate is a proof obligation, not a date
- [x] ADR-0079 — Every evolution path is a permanent CI gate proving no escalation without a Principal Decision;
      hardening adds no authoritative table

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the global sequence after the ADRs consumed by M26–M29 (0069–0077); this package
holds ADR-0078 and ADR-0079. Status: `Proposed`.

- [x] **Only genuinely-new decisions recorded.** M30 decides exactly two things — the shape of the 4.0 release
      gate (0078) and that every evolution path is a permanent CI gate with no new table (0079). The
      no-meta-layer rule (Principle 14), the permanent nos (GUIDE §12), the CI gate discipline (GUIDE §7), the
      locality ban (ADR-0009), and each loop's behaviour (M26–M29) are already recorded and are *enforced*, not
      re-decided. The 0078 gate-shape is the 4.0 analogue of ADR-0038; the 0079 no-table stance is the 4.0
      analogue of ADR-0039, folded into 0079 rather than given its own ADR because 0078 already fixes the
      release-gate shape.
- [ ] **Integration action (AntiGravity):** copy ADR-0078 and ADR-0079 into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] **M26 (Outcome Calibration)** — the calibration loop bounded and wired as EVO-1 (§4.1, §6)
- [x] **M27 (Charter Evolution)** — the eval-gated, Principal-confirmed loop wired as EVO-2, with the
      no-Standard-relaxation assertion added (§4.2, §5)
- [x] **M28 (Procedural Compilation)** — the propose-only, capability-neutral loop wired as EVO-3 (§4.3, §5)
- [x] **M29 (Firm Self-Review)** — the no-enact loop wired as EVO-4; the org-chart target of Principle 14 (§4.4,
      §5, §8) — architecturally complete per `00-M29-AUDIT.md`
- [x] M13 (departments + Standards/Guards) — the Standards and org chart the review assesses and must not enact
      upon (SR-2, SR-3)
- [x] M3 (Broker, effect classes, egress, keychain) — the choke point, effect-class invariant, and locality
      egress gate re-exercised over the loops
- [x] M2 (event log, hash chain, `audit.verify`) — the revertibility proofs and the escalation-authorship
      invariant on the chain
- [x] M10 (the 1.0 hardening pattern) — the CI-gate-as-object framing, the reset-on-incident dogfood state
      machine, the second-security-review shape this package mirrors
- [x] Dependency direction preserved and re-proven by the existing Dependency-direction gate: `packages/domain ←
      services/* ← apps/*` (ADR-0011)

## 4. Consistency with authoritative sources

- [x] Exit criterion matches the registry §4 verbatim: no evolution path can widen a capability, relax a
      Standard, or alter the org chart without a Principal Decision; ninety days dogfooding
- [x] **Principle 14 (no meta-layer)** honored: the org chart is data in the event log; no loop changes the
      Firm's shape without a Decision; M30 adds no new rule, it makes the existing rule a build-failing gate
      (§4.4, §8; EVO-4)
- [x] **GUIDE §12 (permanent nos)** honored: no telemetry ever (locality egress gate, E11); class-3 always asks
      with no standing grant; no loop self-promotes — the Firm proposes, the Principal confirms
- [x] **GUIDE §7 (CI gates)** honored: the four evolution-path gates + four bound gates join — never replace —
      the twelve prior catalogue gates, which are confirmed green on the frozen 4.0 surface, not re-implemented
- [x] The four M26–M29 evolution paths are extended, never re-decided: each loop's own architecture governs its
      behaviour; M30 proves its boundary as a permanent gate (§1.5; 00-M29-AUDIT §3)
- [x] The second security review matches testing §5 (the "denied and surfaced" rule applied to escalation, the
      supply-chain gates, the injection/provenance controls) and security §7/§10
- [x] Effect-class policy unchanged: class-3 always asks, no standing grant; no loop lowers an effect class
      (security §5; EVO-1)
- [x] The ninety-day dogfood protocol mirrors M10's thirty-day protocol, extended to ninety and scoped to
      escalation/run-away incidents in place of data-loss/unlogged-effect incidents (§10; ADR-0078)
- [x] No existing architecture modified; no ADR decision reversed; no v1 `/docs` or v2 `/docs-v2` claim
      contradicted; the M26–M29 packages are untouched

## 5. Acceptance criteria complete

- [x] AC1–AC16 defined in the architecture §16 and each mapped to a task in the plan
- [x] The exit criterion (ninety consecutive clean dogfood days with the loops active, zero
      escalation-without-a-Decision, zero run-away, the recorded and demonstrated release-gate Decision) is AC16,
      owned by task T7.4 — **the last thing to go green**
- [x] The no-escalation exit is proven across all four paths: no widen (AC1), no relax a Standard (AC2), no alter
      the org chart (AC3), the escalation set closed by enumeration (AC5), the Decision-authorship invariant
      (AC15)
- [x] Every AC is objectively testable and named; none relies on manual verification except where the source
      mandates a human demonstration (the release-gate Decision "to someone who does not trust the author",
      GUIDE §6)
- [x] "Escalation-without-a-Decision" and "run-away" are given mechanical definitions (architecture §10.2–§10.3)

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No new evolution feature** — 4.0 scope frozen at feature-complete (M29); no fifth loop, no auto-enact
      path (architecture §1.4; ADR-0078); enforced by the scope-freeze guard (T1.1)
- [x] **No self-enact** — every loop proposes only; every enactment is a Principal Decision a loop actor cannot
      author; convenience is not an argument against a Decision (§8.2; SR-4; EVO-4)
- [x] **No new crate** — only `infrastructure/ci/` and `infrastructure/testing/` change, plus test additions
      inside the M26–M29 subsystems (Appendix B; ADR-0079)
- [x] **No new migration** — hardening bookkeeping is a projection over existing `system.*`/`decision.*`/
      `evolution.*` events (architecture §11; ADR-0079, the ADR-0039 precedent)
- [x] **No bound relaxed** — a run-away or an over-wide loop is fixed by tightening the loop; relaxing a bound
      needs its own ADR arguing the Principal is better off, and "too restrictive to be useful" is not that
      argument (§1.4, §6; ADR-0078)

## 7. Testing & CI

- [x] Every hardening claim is a permanent CI gate or a recorded Decision — nothing rests on manual verification
      (G10; §4, §17)
- [x] The eight new permanent gates (EVO-1…EVO-4, rate-bound, revert, evidence, circuit-breaker) each ship a
      fixture, an oracle, and a demonstrated failing case; a gate that cannot fail is not a gate (plan §0.2)
- [x] The four bound gates are proven under sustained *simultaneous* load with all four loops active (the
      four-loop harness, T5.3; §6.3)
- [x] The escalation-refusal red-team corpus (E1–E12) refuses **and** surfaces every case; a silent refusal
      fails (T6.3; §5.2)
- [x] Supply-chain (T6.4) and locality egress (T6.5) gates re-run over the M26–M29 subsystems with all loops
      active

## 8. Open items carried forward (non-blocking)

- [ ] Flip M26–M29 `Defined → Documented` in the same integration pass that lands their packages (metadata lag,
      not an architectural gap; see `00-M29-AUDIT.md` §2 item 1)
- [ ] ADR-0078/0079 promotion `Proposed → Accepted` on Principal approval during integration
- [ ] On integration, update `MILESTONE_REGISTRY.md` M30 to reflect implementation status (the number is
      permanent, registry rule 4)

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 (the eight gates as objects + scope freeze), then
      E2–E5 in parallel (the four per-loop bounding proofs, each wiring its loop into the four-loop harness),
      then E6 (the second security review, needs all four loops bounded and the M29 surface), then E7. T7.4 (the
      ninety-day dogfood + release-gate Decision) is the last thing to go green.

**STOP — the Sidra OS architecture programme is complete through M30.** Per the workflow, do not begin any
implementation of a successor: there is no M31. 4.0 "Continuum" ships at the end of M30 as a demonstrated
Principal Decision, and that Decision also closes the programme (registry §3; ADR-0078). Await the final
architecture completeness audit and Principal approval; a future capability is a future programme with its own
registry entry and its own second security review (registry §4, §6).
