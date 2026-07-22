# Continuum Hardening and 4.0 — Implementation Plan

**Milestone M30 · no new crate · for AntiGravity**

| | |
|---|---|
| Architecture | `CONTINUUM_HARDENING_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0078 (the 4.0 release gate is a proof obligation, not a date) · 0079 (every evolution path is a permanent CI gate; hardening adds no authoritative table) |
| New crate | **none** — extends `infrastructure/ci/` and `infrastructure/testing/`; adds tests inside the M26–M29 subsystems |
| New migrations | **none** — no table added (architecture §11.1; ADR-0079) |
| Depends on | **M26–M29** (the four evolution paths) plus M13, M3, M2, and the M10 hardening pattern (see `00-M29-AUDIT.md`) |
| Must not | add an evolution feature, add a fifth loop or an auto-enact path, relax a bound, or waive a gate to hit a date (ADR-0078) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR, adds an evolution feature, or relaxes a bound. M30 hardens the *finished* M26–M29
surface; it never rewrites it (00-M29-AUDIT §3).

### 0.2 Task conventions (inherited from the M10 / M16 plans §0.2, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** A hardening task whose deliverable *is* a gate still ships the fixture,
  the oracle, and a demonstrated failing case (a gate that cannot fail is not a gate).
- **Every task leaves `main` green.** A new gate lands green (or feature-flagged behind its own enablement) and
  is made blocking only once it passes on the frozen 4.0 surface; it never breaks the build on arrival.
- **No production code in this package.** This plan is the specification AntiGravity implements. M30 adds no
  evolution feature and no migration (architecture §1.4, §11.1). Additions are confined to `infrastructure/ci/`,
  `infrastructure/testing/`, and tests inside the M26–M29 subsystems (Appendix B).

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Evolution-path gate catalogue & CI wiring | the eight permanent 4.0 gates as first-class objects + the scope-freeze guard (architecture §4, §6.2) |
| E2 | Bounding the M26 calibration loop | EVO-1: scope/rate/revert/effect-class-invariance; the calibration bounding harness (§4.1, §6) |
| E3 | Bounding & gating the M27 charter-evolution loop | EVO-2: eval-gate, Principal-confirm, no-Standard-relaxation; the charter bounding harness (§4.2, §5) |
| E4 | Bounding the M28 procedural-compilation loop | EVO-3: evidence-gate, propose-only, capability-neutral; the compilation bounding harness (§4.3, §5) |
| E5 | Bounding the M29 self-review loop (no enact) | EVO-4: assessment-only, no-enact, audit-chain org chart; the self-review bounding harness (§4.4, §5, §8) |
| E6 | Second security review & escalation-refusal red-team corpus | the closed escalation enumeration, the Decision-authorship invariant, the E1–E12 corpus, supply-chain, locality (§5, §8, §9) |
| E7 | Ninety-day dogfood acceptance & 4.0 release checklist | the performance re-run, the dogfood ledger, the reset-on-incident protocol, the release-gate Decision (§7, §10) |

### 0.4 Recommended implementation order

```
E1 (8 gates as objects + scope freeze) ──┬──► E2 (calibration / EVO-1)  ──┐
                                         ├──► E3 (charter / EVO-2)       ──┤
                                         ├──► E4 (compilation / EVO-3)   ──┼──► E6 ──► E7
                                         └──► E5 (self-review / EVO-4)   ──┘  (security  (dogfood +
                                                                                review)   release)
        (E2–E5 run in parallel once E1 lands; each wires its loop into the shared four-loop
         sustained-load harness, which E5/T5.3 assembles and runs with all four loops active)
```

E1 first: the gate scaffolding every other epic plugs its proof into (`infrastructure/ci/gates/`, ADR-0031
placement) and the scope-freeze guard that keeps a fifth loop or an auto-enact path out. E2–E5 are the four
per-loop bounding proofs and can proceed in parallel once E1 lands; each also wires its loop into the shared
four-loop harness (E5/T5.3 assembles and runs it with all four loops active). E6 (the second security review)
needs all four loops bounded and the whole M26–M29 surface present, so it follows E2–E5 — this is exactly why
M29 is sequenced immediately before M30 (00-M29-AUDIT §1). **E7 closes the milestone; its final task (T7.4) is
the exit criterion and must be the last thing to go green** — ninety consecutive clean dogfood days with the
loops active and the recorded, demonstrated release-gate Decision (architecture §3, §10; ADR-0078). **There is
no M31.**

---

## E1 — Evolution-path gate catalogue & CI wiring

### Purpose
Make the four evolution-path gates (EVO-1…EVO-4) and the four bound gates first-class, permanent objects on the
frozen 4.0 surface — the scaffolding every other epic plugs its proof into — and refuse any PR that would slip a
fifth loop or an auto-enact path (architecture §4, §6.2; ADR-0079).

### Scope
In: the eight gate objects under `infrastructure/ci/gates/` (four EVO + four bound), each with an assertion, a
failure condition, and an oracle; the scope-freeze guard; confirmation that the twelve prior catalogue gates
(GUIDE §7) are green on the frozen 4.0 surface. Out: the individual bounding proofs the EVO/bound gates run
(E2–E5); the escalation enumeration and red-team (E6); the dogfood harness (E7).

### Dependencies
M26–M29 (the loops the gates wrap), ADR-0031 (`infrastructure/ci/` placement), ADR-0011 (dependency direction),
GUIDE §7 (the catalogue the eight gates join).

### Public APIs
None. Gate definitions under `infrastructure/ci/gates/`.

### Acceptance criteria
Each of the eight gates exists as a named object that runs on every commit and can be demonstrated failing on a
seeded escalation; the scope-freeze guard refuses a new-loop / auto-enact PR; the twelve prior catalogue gates
are confirmed green on the frozen 4.0 surface.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scope-freeze guard: refuse a PR that adds a fifth evolution loop, an auto-enact path, or any product feature during M30; confirm the twelve prior catalogue gates (GUIDE §7) green on the frozen 4.0 surface; scaffold the four bound-gate objects (rate-bound, revert, evidence, circuit-breaker) as named objects | M | M26–M29 | `infrastructure/ci/gates/scope-freeze.*`, `bound-rate.*`, `bound-revert.*`, `bound-evidence.*`, `bound-circuit-breaker.*` | A new-loop / auto-enact / feature-adding PR is refused with the frozen-scope reason (architecture §1.4, F14); test-only diffs pass; the twelve prior gates confirmed green (AC4) |
| **T1.2** | Wire the four evolution-path gates as first-class objects: EVO-1 calibration-bounded, EVO-2 charter-eval-gated, EVO-3 compilation-propose-only, EVO-4 self-review-no-enact — each with assertion, failure condition, and oracle; each fails the build on a seeded escalation (its bounding proof lands in E2–E5) | M | T1.1 | `infrastructure/ci/gates/evo-1-calibration-bounded.*`, `evo-2-charter-eval-gated.*`, `evo-3-compilation-propose-only.*`, `evo-4-self-review-no-enact.*` | Each EVO gate is a named object running every commit; a seeded escalation on any loop fails the build; no loop can widen a capability without a Decision (AC1, AC4; §4; ADR-0079) |

---

## E2 — Bounding the M26 calibration loop (EVO-1)

### Purpose
Prove the calibration loop is bounded on all four axes and cannot widen a capability or change an effect class,
and wire the proof as EVO-1 (architecture §4.1, §6).

### Scope
In: the write-set enumeration (calibration touches only estimate/novelty/risk weights), the rate-limit property
test, the revertibility proof (apply → revert → rebuild-from-events diff), the effect-class-invariance property
test. Out: the EVO-1 gate object (E1/T1.2); the four-loop simultaneous-load run (E5/T5.3 assembles).

### Dependencies
M26 (calibration), M2 (event log, hash chain — revertibility), M3 (effect-class table), E1/T1.2 (the EVO-1
object to wire into).

### Public APIs
None. Harness under `infrastructure/testing/evolution/calibration-bounding/`.

### Acceptance criteria
Calibration is proven rate-limited per window, revertible to prior weights, evidence-gated at 50 concluded
Missions, and unable to change an effect class or move a class-3 operation to a standing grant; a write outside
the closed weight-set fails the build.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Scope, rate, and revert proofs: enumerate the closed write-set (estimate/novelty/risk weights only); property test that every per-window delta ≤ the declared bound on extreme outcome records; apply N calibrations → revert → assert weights == pre-calibration, then rebuild from events and diff | M | M26, M2 | `infrastructure/testing/evolution/calibration-bounding/scope-rate-revert.*` | A write outside the enumerated weight-set fails; every delta ≤ bound; revert restores prior weights and the rebuild diffs zero (AC6; §4.1, §6.1) |
| **T2.2** | Effect-class-invariance + evidence gate: property test over the operation registry that effect classes are invariant under any calibration and no risk weight moves a class-3 op to a standing grant; below-50-Mission input produces no calibration; wire EVO-1 to fail on a write breaching the closed set | M | T2.1, M3, E1/T1.2 | `infrastructure/testing/evolution/calibration-bounding/effect-class-invariance.*`, `infrastructure/ci/gates/evo-1-calibration-bounded.*` | Effect classes invariant under calibration; class-3 stays always-ask with no standing grant; uncited/below-threshold input → no change; EVO-1 fails on a breaching write (AC6; §4.1, §5 E1/E2) |
| **T2.3** | Wire calibration into the four-loop sustained-load harness: assert its rate-bound, revert, evidence, and circuit-breaker bounds hold with all four loops active; a feedback-injection case (calibration output → its own input) trips the circuit-breaker before the second window and surfaces a `system.*` warning | M | T2.1, T2.2 | `infrastructure/testing/evolution/four-loop/calibration.*` | Calibration's four bound gates hold under simultaneous load; the circuit-breaker trips before a run-away and surfaces the halt (AC10; §6.2, §6.3) |

---

## E3 — Bounding & gating the M27 charter-evolution loop (EVO-2)

### Purpose
Prove a charter revision is eval-gated and Principal-confirmed and cannot relax a Standard without a separate
Decision, and wire the proof as EVO-2 (architecture §4.2, §5).

### Scope
In: the eval-gate over a corpus of regressing/non-regressing proposals (GATE-7), the Principal-confirm state
machine (no edge `eval_passed → live`), the no-Standard-relaxation assertion, revertibility. Out: the EVO-2 gate
object (E1/T1.2); the four-loop run (E5/T5.3).

### Dependencies
M27 (charter evolution), M13 (Standards & Guards — ADR-0016), GUIDE §3.15 (evaluation sets), E1/T1.2.

### Public APIs
None. Harness under `infrastructure/testing/evolution/charter-bounding/`.

### Acceptance criteria
A regressing charter revision does not merge; an eval-passing revision cannot go live without a Principal
Decision; a Standard-touching revision is refused with `standard_change_needs_decision`; every revision is
revertible.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Eval-gate + Principal-confirm + revert: run the archetype's evaluation set over a corpus of regressing and non-regressing proposals (a regression refuses the merge, GATE-7); state-machine test `proposed → eval_passed → awaiting_decision → (Decision) → live` with **no edge** from `eval_passed` to `live`; apply → revert → rebuild-from-events diff | M | M27, GUIDE §3.15 | `infrastructure/testing/evolution/charter-bounding/eval-confirm-revert.*` | A regressing revision does not merge; no path from `eval_passed` to `live` skips the Decision; revert restores prior charter and the rebuild diffs zero (AC7; §4.2, §6) |
| **T3.2** | No-Standard-relaxation assertion: assert a charter revision diff touches no Standard; a Standard-touching revision is refused with `standard_change_needs_decision`; a Standard change is separately Decision-gated and Guard-enforced (ADR-0016; Principle 14); wire EVO-2 | M | T3.1, M13, E1/T1.2 | `infrastructure/testing/evolution/charter-bounding/no-standard-relaxation.*`, `infrastructure/ci/gates/evo-2-charter-eval-gated.*` | A revision that edits/removes/downgrades a Standard is refused; no evolution path relaxes a Standard without a Decision; EVO-2 fails on a Standard-touching revision (AC2, AC7; §4.2, §5 E3/E4; SR-2) |
| **T3.3** | Wire charter evolution into the four-loop sustained-load harness: assert its rate-bound, revert, evidence, and circuit-breaker bounds hold with all four loops active | M | T3.1, T3.2 | `infrastructure/testing/evolution/four-loop/charter.*` | Charter loop's four bound gates hold under simultaneous load; the circuit-breaker trips before a run-away and surfaces the halt (AC10; §6.2, §6.3) |

---

## E4 — Bounding the M28 procedural-compilation loop (EVO-3)

### Purpose
Prove a compiled Workflow candidate is proposed only on cited evidence, never auto-activates, and carries no
standing grant, and wire the proof as EVO-3 (architecture §4.3, §5).

### Scope
In: the evidence gate (≥5 observed repetitions with complete Mission citations), the propose-only state machine
(no edge `proposed → active/scheduled/granted`), the capability-neutral-proposal assertion (activation grant ⊆
observed Mission grants). Out: the EVO-3 gate object (E1/T1.2); the four-loop run (E5/T5.3).

### Dependencies
M28 (procedural compilation), M3 (the Broker checks the activation grant), E1/T1.2.

### Public APIs
None. Harness under `infrastructure/testing/evolution/compilation-bounding/`.

### Acceptance criteria
A procedure below 5 repetitions or without complete Mission citations produces no proposal; a `proposed`
Workflow has no edge to `active`/`scheduled`/`granted` except a Principal Decision; a `proposed` Workflow holds
zero grants and any activation grant is a subset of what its source Missions used.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Evidence gate + propose-only state machine: fewer than 5 repetitions → no proposal; a proposal without complete Mission citations fails; state-machine test `proposed → (Decision) → active` with **no edge** from `proposed` to `active`, `scheduled`, or `granted` | M | M28 | `infrastructure/testing/evolution/compilation-bounding/evidence-propose-only.*` | Below-threshold/uncited input produces no proposal; a `proposed` candidate has no activation edge except a Principal Decision (AC8; §4.3, §5 E5) |
| **T4.2** | Capability-neutral-proposal assertion: a `proposed` Workflow holds zero grants; an activation grant ⊆ observed Mission grants, checked at the Broker; wire EVO-3 | M | T4.1, M3, E1/T1.2 | `infrastructure/testing/evolution/compilation-bounding/capability-neutral.*`, `infrastructure/ci/gates/evo-3-compilation-propose-only.*` | A `proposed` Workflow carries no standing grant; an activation requesting more than its Missions used is refused; EVO-3 fails on an auto-activation or an over-wide grant (AC8; §4.3, §5 E6) |
| **T4.3** | Wire procedural compilation into the four-loop sustained-load harness: assert its rate-bound, revert, evidence, and circuit-breaker bounds hold with all four loops active | M | T4.1, T4.2 | `infrastructure/testing/evolution/four-loop/compilation.*` | Compilation loop's four bound gates hold under simultaneous load; the circuit-breaker trips before a run-away and surfaces the halt (AC10; §6.2, §6.3) |

---

## E5 — Bounding the M29 self-review loop, no enact (EVO-4)

### Purpose
Prove the Structure Review produces an assessment but has no enact path — every merge/retire/restructure is a
separate Principal Decision — and wire the proof as EVO-4, the most load-bearing gate because it touches the org
chart (architecture §4.4, §5, §8; Principle 14; GUIDE §10 fm8). E5/T5.3 also assembles and runs the full
four-loop sustained-load harness.

### Scope
In: the assessment-only-output proof (the review produces zero org-chart events, with the absorbability test
applied), the no-enact enumeration (every org-chart-mutating operation reachable only behind a Principal
`decision.*`), the audit-chain org-chart proof (`audit.verify` traces every structural change to a Principal
Decision), and the assembly/run of the four-loop harness with all loops active. Out: the EVO-4 gate object
(E1/T1.2); the Decision-authorship invariant at the decision engine (E6/T6.2).

### Dependencies
M29 (firm self-review), M13 (departments & org chart), M2 (`audit.verify`, hash chain), Principle 14, E1/T1.2,
and E2–E4 (their per-loop wiring, to run all four together).

### Public APIs
None. Harness under `infrastructure/testing/evolution/self-review-bounding/` and
`infrastructure/testing/evolution/four-loop/`.

### Acceptance criteria
The Structure Review produces an assessment record and zero org-chart events; every org-chart-mutating operation
is reachable only behind a Principal `decision.*`; `audit.verify` traces every structural change to a Principal
Decision; the four-loop harness runs with all loops active and every bound holds.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Assessment-only-output + revert proof: the review produces a department-health assessment with the absorbability test applied (Principle 13) and emits zero org-chart events; the assessment is revertible/inspectable (apply → revert → rebuild-from-events diff) | M | M29 | `infrastructure/testing/evolution/self-review-bounding/assessment-only.*` | The review produces an assessment record and zero org-chart events; the absorbability test is applied; the assessment reverts and the rebuild diffs zero (AC9; §4.4, §6) |
| **T5.2** | No-enact enumeration + audit-chain org chart: enumerate every org-chart-mutating operation and prove each is reachable only behind a Principal `decision.*` (never a loop actor); `audit.verify` over an org-chart-change fixture traces every structural change to a Principal Decision; wire EVO-4 | L | T5.1, M2, E1/T1.2 | `infrastructure/testing/evolution/self-review-bounding/no-enact.*`, `infrastructure/ci/gates/evo-4-self-review-no-enact.*` | No admin/apply/auto-merge path changes the Firm's shape without a Decision; every structural change traces to a Principal `decision.*` with no gap; EVO-4 fails on any org-chart mutation without a Decision (AC3, AC9; §4.4, §8; Principle 14; GUIDE §10 fm8) |
| **T5.3** | Assemble and run the four-loop sustained-load harness: a synthetic quarter of Mission activity with **all four loops active at once**; assert (a) every per-window bound holds, (b) no loop escalates a capability/Standard/org chart, (c) the Firm stays within its performance budgets | L | T5.1, T5.2, E2/T2.3, E3/T3.3, E4/T4.3 | `infrastructure/testing/evolution/four-loop/harness.*` | The four bound gates (rate-bound, revert, evidence, circuit-breaker) hold with all four loops active; no loop escalates under simultaneous load; the loops interacting do not spiral (AC10; §6.2, §6.3) |

---

## E6 — Second security review & escalation-refusal red-team corpus

### Purpose
Red-team the four loops together for the specific ways a self-improving Firm could escalate its authority, close
the escalation set by enumeration, enforce the Decision-authorship invariant, and re-exercise supply-chain and
locality over the M26–M29 subsystems (architecture §5, §8, §9). The second of the two external security reviews
(testing §5), scoped to the evolution paths.

### Scope
In: the closed (loop × target) escalation-coverage enumeration gate; the Decision-authorship invariant at the
decision engine + `audit.verify` over the window; the E1–E12 escalation-refusal red-team corpus (each case
refused **and** surfaced); the supply-chain gate; the locality egress gate. Out: the controls themselves (they
are M26–M29 / M3 and are re-exercised, not rebuilt); the dogfood window (E7).

### Dependencies
E2–E5 (all four loops bounded), **M29 (the last loop must exist so the review covers all four together — the M9-before-M10 precedent, 00-M29-AUDIT §1)**, M3 (Broker, effect classes, egress), M2 (`audit.verify`), ADR-0009
(locality), security §5/§7/§10, testing §5.

### Public APIs
None. Harness under `infrastructure/testing/security/`; the enumeration and locality gates under
`infrastructure/ci/gates/`.

### Acceptance criteria
The (loop × target) escalation set is closed (a new reachability without its refusal assertion fails the build);
no `decision.*` that escalates has a loop actor and `audit.verify` confirms it over the window; every E1–E12
corpus case is refused and surfaced (a silent refusal fails); supply-chain is zero-known-critical; the loops
emit nothing outward.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Escalation-coverage enumeration gate: the closed (loop × target) matrix — for each of the four loops × three targets (capability, Standard, org chart), the code path is enumerated and proven to pass through a Principal Decision the loop cannot author; a new (loop × target) reachability cannot merge without its refusal assertion | M | E2–E5 | `infrastructure/ci/gates/escalation-coverage.*` | The escalation set is closed by enumeration; a seeded new reachability without a refusal assertion fails the build; no loop widens a capability or relaxes a Standard without a Decision (AC1, AC2, AC5; §8.1) |
| **T6.2** | Decision-authorship invariant + `audit.verify` over the window: no `decision.*` event that widens a capability, relaxes a Standard, or alters the org chart may have a loop actor (enforced at the decision engine); `audit.verify` runs nightly + on unclean-shutdown startup + over the full dogfood chain and shows every such change has a Principal Decision antecedent with no gap | M | E5/T5.2, M2 | `infrastructure/testing/security/decision-authorship.*` | No loop actor authors an escalating `decision.*`; `audit.verify` shows every capability/Standard/org-chart change on the chain has a Principal Decision antecedent, no gap (AC3, AC15; §8.2, §8.3; SR-7) |
| **T6.3** | Escalation-refusal red-team corpus (E1–E12): calibration→effect-class change, charter edits-a-Standard / self-activates, compilation auto-activates / over-wide grant, self-review enacts / admin side-door, loop authors its own Decision, loop run-away, loop outbound call, injected outcome taints calibration — each case **refused and surfaced**; a silent refusal fails; a case achieving an escalation without a Decision is a release blocker that resets the counter | L | E2–E5, M3 | `infrastructure/testing/security/escalation-corpus.*` | Every E1–E12 case is refused **and** surfaced to the Principal; a silent refusal fails the test; an escalation-without-a-Decision is a release blocker (AC11; §5.1, §5.2) |
| **T6.4** | Supply-chain gate over the M26–M29 subsystems: `cargo audit` / `cargo deny` / `npm audit` zero-known-critical; lockfiles committed; reproducible build verified | S | E2–E5 | `infrastructure/ci/gates/supply-chain.*` (re-run over M26–M29) | A known-critical advisory in a loop's dependency or a non-reproducible build fails (AC12; §5.3) |
| **T6.5** | Locality egress gate over the loops: the egress-allowlist CI test re-run with all four loops active over the window's events; the allowlist contains nothing but configured provider endpoints; a single outbound byte of learning data is a release blocker | S | E2–E5 | `infrastructure/ci/gates/locality-egress.*` | Zero outbound learning data with all loops active; a single emission is a release blocker (AC13; §9; ADR-0009; security §10; §5 E11) |

---

## E7 — Ninety-day dogfood acceptance & 4.0 release checklist

### Purpose
Operationalize the exit criterion: the loops off the hot path under sustained self-improvement, ninety
consecutive clean days with the loops active, the reset-on-incident protocol, the machine-checkable release
checklist, and the release-gate Decision (architecture §7, §10; ADR-0078). **The last epic; T7.4 is the last
thing to go green. There is no M31.**

### Scope
In: the performance gates re-run with all four loops active + the latency-parity test; the dogfood ledger (a
projection over existing `system.*`/`decision.*`/`evolution.*` events); the escalation-incident /
run-away-incident definitions and the reset-on-incident counter; the 4.0 release checklist; the release-gate
Decision. Out: any new authoritative table (forbidden; ADR-0079).

### Dependencies
All prior epics; the release gate depends on E1–E5 green, the second security review (E6) passing, and the
performance re-run.

### Public APIs
None. Harness under `infrastructure/testing/performance/` and `infrastructure/testing/dogfood/`; the release-gate
Decision is a `decision.*` event.

### Acceptance criteria
The loops stay off the hot path and within budget under sustained self-improvement; the ledger is a projection
(no new table); an escalation or run-away incident resets the counter; ninety consecutive clean days plus a
passed security review plus all defects closed yields a recorded, demonstrated release-gate Decision.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Performance gates re-run with all four loops active + latency-parity: cold start ≤1.2 s, 60 fps (no frame >32 ms), idle resident ≤400 MB, all with loops enabled; Directive-to-Brief latency and Principal-facing token count unchanged loops-on vs loops-off | M | E2–E5 | `infrastructure/testing/performance/loops-active.*` | The four loops stay off the hot path and within budget under sustained self-improvement; a loops-on regression against the loops-off baseline fails and names the number (AC14; §7) |
| **T7.2** | Dogfood ledger as a projection over existing `system.*`/`decision.*`/`evolution.*` events (window-open, day-recorded, incident/reset); no new authoritative table; the ledger rebuilds from the event log | M | E6 | `infrastructure/testing/dogfood/ledger.*` | The ledger rebuilds from the event log and passes rebuild-and-diff; no migration added (ADR-0079; architecture §11) |
| **T7.3** | Escalation-incident / run-away-incident definitions + reset-on-incident counter (ninety *consecutive* clean days; any escalation-without-a-Decision or run-away resets to zero) + the machine-checkable 4.0 release checklist (eight gates green + evolution-path review passed + every open defect fixed or accepted in writing) | M | T7.2 | `infrastructure/testing/dogfood/acceptance.*`, `release-checklist.*` | An incident on day N resets to zero; only ninety consecutive clean days count; the checklist blocks release unless every item is satisfied (§3.2, §3.3, §10.2–§10.3; ADR-0078) |
| **T7.4** | **Exit-criterion acceptance:** run the ninety-day window with all four loops active; record ninety consecutive clean days with zero escalation-without-a-Decision and zero run-away; the release-gate Decision (`decision.*`) is recorded and **demonstrated to someone who does not trust the author** (GUIDE §6) — this Decision ships 4.0 and closes the programme | L | T7.1–T7.3, E6 | `infrastructure/testing/dogfood/exit-criterion.*` | **Ninety consecutive clean dogfood days, loops active, zero escalation-without-a-Decision, zero run-away; every open defect fixed or accepted in writing; the release-gate Decision recorded and demonstrated — the last thing green; there is no M31** (AC16; registry §4; GUIDE §6; ADR-0078) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | the eight permanent 4.0 gates as first-class objects (four EVO + four bound) + the scope-freeze guard |
| E2 | EVO-1: the calibration bounding harness — scope/rate/revert/effect-class-invariance |
| E3 | EVO-2: the charter bounding harness — eval-gate, Principal-confirm, no-Standard-relaxation |
| E4 | EVO-3: the compilation bounding harness — evidence-gate, propose-only, capability-neutral |
| E5 | EVO-4: the self-review bounding harness — assessment-only, no-enact, audit-chain org chart + the four-loop harness |
| E6 | the second security review: closed escalation enumeration + Decision-authorship invariant + E1–E12 corpus + supply-chain + locality |
| E7 | the performance re-run + dogfood acceptance harness + 4.0 release checklist + the exit-criterion Decision (last thing green) |
