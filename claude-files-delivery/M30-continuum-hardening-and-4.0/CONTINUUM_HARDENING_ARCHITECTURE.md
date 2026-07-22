# Continuum Hardening and 4.0 — Architecture

**Milestone M30 · Release 4.0 "Continuum" · the release-hardening milestone · the FINAL planned milestone**

| | |
|---|---|
| Milestone | M30 — Continuum Hardening and 4.0 (`/MILESTONE_REGISTRY.md` §4, 4.0 "Continuum") |
| Release | 4.0 "Continuum" — the self-improving Firm exists, and now its improvement is proven bounded and safe |
| New crate | **none** — M30 hardens the M26–M29 subsystems and adds only to `infrastructure/ci/` and `infrastructure/testing/` |
| New migrations | **none** — M30 adds no authoritative table (§11); release bookkeeping is a projection over existing events (ADR-0079, mirroring ADR-0039) |
| Depends on | **M26–M29** (outcome calibration, charter evolution, procedural compilation, firm self-review) — the four evolution paths M30 bounds |
| Status | Documented (this package) · implementation Open |
| Exit criterion | **No evolution path can widen a capability, relax a Standard, or alter the org chart without a Principal Decision. Ninety days dogfooding** (registry §4) — and 4.0 ships at the end of it |

> **Authoritative precedence.** This document consolidates and operationalizes a hardening milestone that
> extends the M26–M29 evolution paths without re-deciding them. Where it appears to disagree with
> `/docs/02-testing-and-quality.md` it is wrong and that document governs — testing-and-quality is the
> authoritative source for CI gates and the second security review. Where it touches the security surface,
> `/docs/07-security-model.md` governs; the no-meta-layer rule, `/docs-v2/02-v2-principles.md` (Principle 14)
> governs; the permanent nos, `/MASTER_IMPLEMENTATION_GUIDE.md` §12 governs; each evolution path's behaviour,
> its own M26–M29 architecture governs. M30 *proves* these boundaries as permanent gates; it never re-decides
> them. The two things M30 genuinely decides — that the 4.0 gate is a proof obligation and not a date
> (ADR-0078), and that every evolution path is a permanent CI gate proving no escalation without a Decision
> (ADR-0079) — are recorded as ADRs. M30 is the 4.0 analogue of M10 (1.0 hardening); it reuses M10's shape by
> design.

---

## 1. Why this milestone exists

### 1.1 The problem

At the end of M29 the Firm is **feature-complete for 4.0**. It measures its own Mission outcomes and calibrates
its estimates (M26), improves its Role Archetypes against evaluation sets (M27), notices repeated procedures
and proposes them as Workflows (M28), and runs the quarterly Structure Review on itself, assessing which
departments earned their overhead (M29). All four self-improvement loops exist and pass their own milestone
exit criteria (registry §4). Nothing new needs to be built for 4.0 to be whole.

And yet 4.0 cannot ship, because the one promise that separates a **self-improving** Firm from a Firm that
quietly rewrites its own authority is not yet *proven under adversarial conditions*:

- **Nothing self-promotes.** The 4.0 cross-cutting constraint is that **the Firm proposes, the Principal
  confirms** (registry §4; Principle 14). Every prior milestone in 4.0 asserted that its loop only proposes;
  none demonstrated that *every one of the four loops*, across the whole evolution surface, is provably unable
  to widen a capability, relax a Standard, or alter the org chart without a Principal Decision — that the set
  of escalation paths is closed and the gate that forbids them cannot be routed around.
- **No feedback loop runs away.** M26 calibration adjusts numbers; M27 revises charters; M28 compiles
  procedures; M29 assesses structure. Each individually was shown bounded once. No milestone has proven that
  *every* loop, running simultaneously under sustained self-improvement, is rate-limited, revertible,
  evidence-gated, and unable to enter a self-amplifying spiral (GUIDE §10 failure mode 4: "the organisation
  becomes the product"; §10 failure mode 8: "silent structural change").
- **The evolution paths have never been red-teamed together.** M3 reviewed the kernel; M10 reviewed the whole
  1.0 surface including plugins. Neither could have covered the self-improvement loops, which did not exist
  until M26. The whole evolution surface — calibration, charter evolution, procedural compilation, self-review —
  has never been adversarially reviewed for the specific ways a self-improving Firm could escalate (testing §5;
  registry §4).

M30 is the milestone that converts every prior *assertion of boundedness* into a *permanent, build-failing
gate*, red-teams the four loops for escalation, and then demonstrates the whole thing surviving ninety days of
real use with the loops active. It is the difference between "we believe the Firm only proposes" and "the
escalation red-team has tried ten thousand ways to widen a capability, relax a Standard, and alter the org
chart from inside a loop, every attempt was refused without a Principal Decision, and CI will fail the day that
stops being true."

### 1.2 The stance

M30 makes exactly two new architectural decisions, and both are about the shape of the release and its gates:

1. **The 4.0 release gate is a proof obligation, not a date.** (ADR-0078) 4.0 ships when — and only when —
   every feedback loop is provably bounded (rate-limited, revertible, evidence-gated, run-away-proof) as a
   permanent CI gate, the second security review of the evolution paths passes with no unresolved
   release-blocker, and ninety consecutive days of dogfooding with the loops active demonstrate that no
   evolution path escalated without a Principal Decision. Hardening introduces no product feature and relaxes
   no bound. A run-away or an escalation is resolved by tightening the loop, never by moving the gate (GUIDE
   §3.16 analogue; ADR-0078). This is the 4.0 analogue of ADR-0038.

2. **Every evolution path is a permanent CI gate proving no capability/Standard/org-chart change without a
   Principal Decision.** (ADR-0079) Each of the four loops is turned into a first-class gate object with an
   assertion, a failure condition, and an oracle: a calibration that widens a capability fails the build; a
   charter revision that relaxes a Standard without a Decision fails the build; a procedural compilation that
   auto-activates fails the build; a self-review that enacts a structural change fails the build. The set of
   escalation paths is closed by enumeration, exactly as M10's effect-coverage gate closed the effectful set.
   This is the 4.0 analogue of the M10 gate catalogue, and — like ADR-0039 for M10 — it adds no authoritative
   table.

Every other commitment in M30 is the *enforcement of a decision already recorded elsewhere*:

3. **All learning stays local.** (ADR-0009, GUIDE §12) No telemetry leaves the machine — not anonymous, not
   aggregate, not opt-in. M26 calibration is local-only by its own exit criterion; M30 proves the whole
   evolution surface never emits a byte outward as a permanent egress gate (security §10).
4. **The author never reviews their own work — and neither does the Firm approve its own evolution.**
   (Principle 5, Principle 14, ADR-0008) A loop proposing a change to the Firm is the author; the Principal
   confirming it is the reviewer. There is no mode where a loop confirms its own proposal.
5. **Hardening bookkeeping is additive projection, not schema.** (ADR-0079) M30 adds no migration; the dogfood
   ledger, the release-gate record, and the escalation-attempt corpus results are projections over existing
   `system.*` and `decision.*` events on the existing hash chain (ADR-0002).

### 1.3 What hardening is, mechanically

Hardening is **not new code that does new things**. It is:

- **Running the existing boundedness invariants under adversarial input, as permanent gates.** Each M26–M29
  loop already asserts it only proposes; M30 attaches each boundedness/no-escalation invariant to a test that
  runs on every commit and fails the build on violation (GUIDE §7).
- **Closing coverage.** Enumerating every way a loop could touch a capability, a Standard, or the org chart and
  proving each is refused without a Decision (§8); enumerating the escalation vectors and proving each is
  denied *and* surfaced (§5); enumerating the four loops' rate limits and proving each holds under sustained
  load (§6).
- **Demonstrating.** Ninety days of the team using the self-improving product daily with all four loops
  active (GUIDE §11: "the team uses it daily from M6"), with an acceptance protocol that defines precisely what
  counts as an escalation-without-a-Decision and a run-away incident (§10), and a release-gate Decision
  demonstrated "to someone who does not trust you" (GUIDE §6).

Mechanically, M30 touches three kinds of file and no others: **tests** inside the existing M26–M29 subsystems
(the no-escalation assertions, the rate-limit property tests), **harnesses** under `infrastructure/testing/`
(the four bounding harnesses, the escalation red-team, the dogfood acceptance), and **gate definitions** under
`infrastructure/ci/` (the four permanent evolution-path gates, per ADR-0031's placement rule). No product crate
gains a feature; no schema gains a table.

### 1.4 What this milestone must never become

- **A place to slip a new evolution feature.** 4.0's scope is frozen at M29. A "small" fifth loop, or a "minor"
  auto-activation shortcut added during hardening, is a loop that was never security-reviewed and never
  dogfooded at the depth the gate assumes. There is no M31: if it is worth building it belongs to a *future*
  programme with its own registry entry and its own second review, not to M30 (registry §4, §6).
- **A place to let a loop self-enact to "save the Principal a click".** The whole point of 4.0 is that the Firm
  proposes and the Principal confirms. A loop that enacts its own proposal — even a "confirmed-by-default"
  one, even behind a setting — is the exact failure the milestone exists to forbid (Principle 14; GUIDE §12).
  Convenience is not an argument against a Principal Decision.
- **A place to relax a bound instead of tightening a loop.** A calibration that drifts a risk weight far
  enough to change an effect class is fixed by narrowing what calibration may touch, not by widening the
  bound. Relaxing a bound is possible only by an ADR that argues the Principal is better off (testing §6
  analogue) — and "the loop was too restrictive to be useful" is not that argument.
- **A rewrite disguised as hardening.** If a bounding proof reveals that a loop cannot be made
  run-away-proof within its existing design, the fix is a defect fix within the existing M26–M29 architecture,
  recorded and re-proven — not a redesign. A redesign at M30 means the loop was not actually finished at
  M26–M29, which is a finding, not a feature.

### 1.5 Relationship to existing concepts

| Existing concept | How M30 relates |
|---|---|
| Principle 14 — no meta-layer (`02-v2-principles.md`) | M30 is the mechanical enforcement of Principle 14 at release quality: the org chart is data in the event log, and no loop may change the Firm's shape without a Decision. M30 adds no new rule; it makes the existing rule a build-failing gate (§4, §8). |
| M26 Outcome Calibration (local-only, ADR-0009) | M30 proves calibration is rate-limited, revertible, and cannot widen a capability or change an effect class; it proves no calibration datum leaves the machine (§4.1, §5, §6). No new calibration behaviour. |
| M27 Charter Evolution (eval-gated) | M30 proves a charter revision that regresses its evaluation set is refused, and that an accepted revision cannot relax a Standard without a separate Principal Decision (§4.2, §5). The eval gate is M27's; M30 makes it permanent and adds the no-Standard-relaxation gate. |
| M28 Procedural Compilation (propose-only) | M30 proves a compiled Workflow is proposed, never auto-activated, and cites the Missions it derives from (§4.3, §5). No new compilation behaviour; the propose-only boundary becomes a permanent gate. |
| M29 Firm Self-Review (propose, never enact) | M30 proves the Structure Review can produce an assessment but has no enact path — a merge, retire, or restructure is a separate Principal Decision (§4.4, §5). The no-enact boundary becomes a permanent gate. |
| Permission Broker (M3) | Every effect a loop might attempt still passes the single choke point; M30 adds no bypass and proves a loop cannot widen `Effective capability = charter ∩ work_order ∩ policy ∩ session` — intersection never union (security §4). |
| Effect classes (M3, security §5) | M30 proves no loop can lower an effect class or grant a class-3 standing permission; class-3 still always asks with no standing grant (security §5; GUIDE §12 permanent nos). |
| Standards & Guards (M13, ADR-0016) | M30 proves a loop cannot ship a Standard without a Guard, disable a Guard, or downgrade a blocking Guard to a warning — a Standard change is a change Guards enforce (Principle 14). |
| Evaluation sets (GUIDE §3.15) | M30 confirms every charter/archetype change a loop proposes still goes through its evaluation set as a regression gate; a regressing proposal does not merge (testing §4). |
| Decision engine (v1) | Every enactment of a loop's proposal is a Decision: criteria first, reversibility class stated, dissent recorded, review date set (Principle 14). M30 proves there is no path from proposal to effect that skips this. |
| Telemetry ban (ADR-0009, GUIDE §12) | M30's egress gate proves the four loops emit nothing outward; the CI test asserting the egress allowlist contains only configured provider endpoints (security §10) is re-run over the loops' behaviour. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | **No loop can widen a capability without a Principal Decision** — proven, not asserted | §4, §8; the per-path escalation-refusal gates + the closed escalation set; AC1, AC5 |
| G2 | **No loop can relax a Standard without a Principal Decision** — a Standard change is Guard-enforced and Decision-gated | §4.2, §5, §8; the Standard-relaxation gate; AC2 |
| G3 | **No loop can alter the org chart without a Principal Decision** — the no-enact boundary is a build-failing gate | §4.4, §5, §8; the org-chart-enactment gate (Principle 14); AC3 |
| G4 | **Every feedback loop is provably bounded** — rate-limited, revertible, evidence-gated, run-away-proof | §6; the four bounding harnesses; AC6–AC9 |
| G5 | **The whole evolution surface survives an adversarial review** — the four loops red-teamed together for escalation | §5; the second security review + escalation-refusal corpus; AC10–AC12 |
| G6 | **All learning stays local** — no calibration, charter, procedure, or assessment datum leaves the machine | §5, §9; ADR-0009; the egress gate over the loops; AC13 |
| G7 | **The four loops stay off the hot path and within budget under sustained self-improvement** | §7; the performance gates re-run with all loops active; AC14 |
| G8 | **The release gate is a demonstrated proof obligation, not a date; hardening adds no evolution feature** | §3, §10; ADR-0078; AC16 |
| G9 | **M30 is strictly additive** — no new crate, no new authoritative table; only `infrastructure/ci/` + `infrastructure/testing/` | ADR-0079; Appendix B; §11 |
| G10 | **Every hardening claim is a permanent CI gate or a recorded Decision** — nothing rests on manual verification | §4, §18; the four evolution-path gates (GUIDE §7); AC4, AC15 |

---

## 3. The release-gate model — hardening as a state machine

M30 is best understood not as a list of tasks but as a gate the 4.0 release passes through. The gate has states,
transitions, and guards, exactly like the M10 release gate (which it mirrors) and like an Engagement
(system-design §3) — and, like both, a failure at any stage does not silently proceed. This is the 4.0 analogue
of M10's release-gate state machine, with **ninety** consecutive dogfood days in place of thirty and
**escalation/run-away** incidents in place of data-loss/unlogged-effect incidents.

### 3.1 States

```
   M29 exit criterion demonstrated
  ────────────────────────────────►  FEATURE_COMPLETE
                                         │  freeze 4.0 scope (no new evolution loop, no auto-enact path)
                                         ▼
                                     HARDENING ──────────────────────────────┐
                                         │  all four evolution-path gates      │ any gate red
                                         │  + the bound gates green (§4, §6)    │ (fix by tightening the loop,
                                         ▼                                     │  never by relaxing the bound)
                                     GATES_GREEN                               │
                                         │  open the 90-day dogfood window      │
                                         ▼                                     │
                                     DOGFOODING ◄──────────────────────────────┘
                                         │  90 consecutive clean days (§10)
                                         │  AND the evolution-path security review passed (§5)
                                         │  AND every open defect fixed or accepted in writing
                                         ▼
                                     GATE_EVALUATED  ← a Principal Decision, demonstrated
                                         │  to someone who does not trust the author (GUIDE §6)
                                         ▼
                                     RELEASED (4.0 ships — the programme is complete)

   escalation-without-a-Decision │ loop run-away │ gate regresses │ security release-blocker │ telemetry egress
                      ▼
              DOGFOOD_RESET — the 90-day counter returns to zero; the incident is a defect
              to fix and re-prove before the window can complete (ADR-0078)
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `m29_demonstrated` | Feature-complete | M29 exit criterion (propose-only Structure Review) shown live/recording to someone who does not trust the author (GUIDE §6) |
| Feature-complete | `freeze_scope` | Hardening | 4.0 scope frozen; no new evolution loop; no auto-enact path; new-feature PRs refused |
| Hardening | `all_gates_green` | Gates-green | the four evolution-path gates (§4) and the four bound gates (§6) pass on `main` on the same commit |
| Gates-green | `open_window` | Dogfooding | a `system.*` dogfood-window-open marker recorded (ADR-0079) with all four loops active |
| Dogfooding | `clean_day` ×90 | Dogfooding→Gate-evaluated | 90 consecutive days with zero escalation-without-a-Decision and zero run-away incidents (§10) |
| Dogfooding | `incident` | Dogfood-reset | any escalation / run-away / gate-regression / security release-blocker / telemetry egress; counter → 0 |
| Dogfood-reset | `resolved` | Dogfooding | the incident is fixed, re-proven by its gate, and the window reopens (ADR-0078) |
| Dogfooding (90 clean) | `security_review_passed` + `defects_closed` | Gate-evaluated | the evolution-path review has no unresolved release-blocker; every open defect fixed or accepted in writing |
| Gate-evaluated | `principal_decides` | Released | the release-gate Decision is recorded (`decision.*`) and demonstrated to someone who does not trust the author (GUIDE §6) |

### 3.3 Invariants

1. **No release from any state but `Gate-evaluated`.** 4.0 cannot ship with a red gate, an open
   escalation incident, or an unresolved security release-blocker. The gate is a proof, not a date (ADR-0078).
2. **The dogfood window is a *consecutive* ninety days.** An incident resets the counter to zero (§3.2); the
   product does not accumulate "mostly-clean" days toward the exit criterion. Ninety clean days means ninety in
   a row (§10; registry §4).
3. **Scope is frozen at `Feature-complete` and stays frozen.** A new loop or an auto-enact path added after the
   freeze re-opens Hardening from the top, because it was neither reviewed nor dogfooded (§1.4).
4. **A gate, once permanent, is never removed.** The four evolution-path gates and the four bound gates outlive
   the milestone; they run on every commit forever (GUIDE §7). Because there is no M31, "forever" here means
   for the life of the product.

---

## 4. The evolution-path gate catalogue — the four loops as first-class objects

The subject matter of M30 is a set of **gates over the four feedback loops**. Each loop becomes a first-class
gate object with an assertion, a failure condition, and an oracle — exactly the M10 CI-gate-as-object framing
(§4 of the M10 architecture), now applied to the M26–M29 evolution paths. The four evolution-path gates join
the twelve-gate CI catalogue (GUIDE §7) as permanent 4.0 gates.

| # | Gate | Asserts | Fails the build when | M30's job | Source |
|---|---|---|---|---|---|
| EVO-1 | **Calibration-bounded** | Calibration adjusts only estimate/novelty/risk *weights*, within declared per-window bounds, revertibly; it never changes an effect class, a capability grant, or a Fence | A calibration step changes an effect class, widens a capability, or exceeds its per-window rate bound | Bound & prove the M26 loop; make it a permanent gate (§4.1, §6.1) | M26; registry §4 |
| EVO-2 | **Charter-eval-gated** | A proposed charter revision runs its evaluation set; a regression refuses the merge; an accepted revision is a Principal Decision and cannot relax a Standard | A charter revision merges past a regressing eval, or relaxes a Standard without a Decision | Make the M27 eval gate permanent; add the no-Standard-relaxation assertion (§4.2, §5) | M27; testing §4; GUIDE §3.15 |
| EVO-3 | **Compilation-propose-only** | A compiled Workflow candidate is *proposed*, cites its source Missions (≥5 repetitions), and has no activation path that skips a Principal Decision | A compiled Workflow auto-activates, or a proposal lacks its Mission citations | Make the M28 propose-only boundary permanent (§4.3, §5) | M28; registry §4 |
| EVO-4 | **Self-review-no-enact** | The Structure Review produces an assessment with the absorbability test applied; it has **no enact path** — merge/retire/restructure is a separate Principal Decision | A self-review enacts a structural change, or any admin path alters the org chart without a Decision | Make the M29 no-enact boundary permanent (§4.4, §5, §8; Principle 14) | M29; Principle 14; GUIDE §10 fm8 |

**In scope for 4.0 (fixing the boundary).** EVO-1…EVO-4 are the four new permanent gates M30 adds. The twelve
prior catalogue gates (GUIDE §7: Build, Dependency-direction, Generated-bindings, Domain-purity,
Kernel-neutrality, Performance, Audit-coverage, Evaluation-sets, Chaos, Replay-equivalence, Pack-validation,
Guard-corpus) already run from their originating milestones and are **confirmed on the frozen 4.0 surface**,
not re-implemented. Naming them here prevents M30 from re-doing an earlier milestone's gate under the banner of
hardening (GUIDE §7; registry §4).

### 4.1 EVO-1 — Calibration bounded and revertible (M26)

Calibration is the measurement loop: Mission outcome records adjust estimates, novelty scores, and risk weights
(registry §4). M30 proves it is bounded on four axes and wires the proof as EVO-1.

| Property | Assertion | Oracle |
|---|---|---|
| **Scope** | Calibration touches only the three declared numeric weight families (estimate, novelty, risk). It never writes a capability grant, an effect class, a Fence, a budget ceiling, or a Standard. | An enumeration of the fields calibration may write; a write outside the set fails the build |
| **Rate** | Each weight moves at most a declared bound per calibration window; a single concluded Mission cannot swing a weight arbitrarily. | Property test: feed extreme outcome records; assert every delta ≤ the per-window bound |
| **Revertibility** | Every calibration is inspectable and revertible to the prior weights; the prior state is reconstructable from the event log (M26 exit criterion). | Apply N calibrations, revert, assert weights == pre-calibration; rebuild from events and diff |
| **No effect-class change** | No calibration of a risk weight can lower an operation's effect class or move a class-3 operation to a standing grant. | Property test over the operation registry: effect classes are invariant under calibration |

**The escalation EVO-1 forbids:** *could calibration widen a capability?* No — calibration writes numbers in a
closed set that excludes every capability, effect-class, and Fence field, and the write-set is CI-enumerated
(§8). A risk weight can make the Firm *more cautious or less*, but "less cautious" changes a scored preference,
never an authorization; the Broker's `charter ∩ work_order ∩ policy ∩ session` intersection is untouched
(security §4).

### 4.2 EVO-2 — Charter evolution eval-gated and Principal-confirmed (M27)

Charter evolution improves Role Archetypes from observed performance, gated by their evaluation sets (registry
§4). M30 proves two things and wires them as EVO-2.

| Property | Assertion | Oracle |
|---|---|---|
| **Eval-gated** | A proposed charter revision runs the archetype's attached evaluation set; a revision that regresses the set does not merge (GUIDE §3.15; testing §4). | The evaluation-sets gate (GATE-7) over a corpus of regressing and non-regressing proposals |
| **Principal-confirmed** | An accepted charter revision is a Principal Decision — recorded, criteria stated, reversibility class stated (Principle 14). There is no path from "eval passed" to "charter live" that skips the Decision. | State-machine test: `proposed → eval_passed → awaiting_decision → (Decision) → live`; no edge from `eval_passed` to `live` |
| **No Standard relaxation** | A charter revision cannot relax, remove, or downgrade a Standard the archetype is bound by; a Standard change is separately Guard-enforced and Decision-gated (ADR-0016; Principle 14). | Assertion that the revision diff touches no Standard; a Standard-touching revision is refused with `standard_change_needs_decision` |

**The escalation EVO-2 forbids:** *could a charter revision relax a Standard without a Decision?* No — the eval
gate blocks a regression, the Principal-confirm gate blocks silent activation, and the no-Standard-relaxation
assertion blocks a revision from smuggling a Standard change into a charter edit. A Standard is changed only by
its own Decision, which Guards then enforce (Principle 14).

### 4.3 EVO-3 — Procedural compilation propose-only (M28)

Procedural compilation observes repeated procedures in Missions and compiles them into candidate Workflows
(registry §4). M30 proves the propose-only boundary and wires it as EVO-3.

| Property | Assertion | Oracle |
|---|---|---|
| **Evidence-gated** | A procedure is proposed only after ≥5 observed repetitions; the proposal cites the exact Missions it derives from (M28 exit criterion). | Test: fewer than 5 repetitions → no proposal; a proposal without complete Mission citations fails |
| **Propose-only** | A compiled Workflow candidate enters a `proposed` state and has no activation path that does not pass a Principal Decision. It does not run, schedule, or bind capabilities until confirmed. | State-machine test: `proposed → (Decision) → active`; no edge from `proposed` to `active`, `scheduled`, or `granted` |
| **Capability-neutral proposal** | A proposal carries no standing capability grant; the Workflow's capabilities are granted only at activation, as a Decision, and only as a subset of what its Missions already used. | Assertion: a `proposed` Workflow holds zero grants; activation grant ⊆ observed Mission grants |

**The escalation EVO-3 forbids:** *could procedural compilation auto-activate?* No — a candidate is inert in
`proposed`, the only edge out is a Principal Decision, and even at activation the grant is bounded by what the
source Missions already legitimately used. Compilation makes a *suggestion*, never a running Workflow.

### 4.4 EVO-4 — Firm self-review, no enact path (M29)

Firm Self-Review runs the quarterly Structure Review (Principle 13) on the Firm itself: which departments earned
their overhead, which should merge or retire (registry §4). M30 proves it may propose but never enact, and wires
it as EVO-4 — the most load-bearing gate, because it is the one that touches the org chart, the exact target of
Principle 14 and GUIDE §10 failure mode 8.

| Property | Assertion | Oracle |
|---|---|---|
| **Assessment-only output** | The Structure Review's output is a department-health assessment with the absorbability test applied (Principle 13). Its artifact is a proposal, not a mutation. | Test: the review produces an assessment record; it produces zero org-chart events |
| **No enact path** | There is no code path — no admin mode, no "apply recommendations" button, no batched auto-merge — by which the review changes the Firm's shape. A merge, retire, or restructure is a separate Principal Decision (Principle 14; GUIDE §8: "the org chart is itself a Decision"). | Enumeration of every org-chart-mutating operation; each is reachable only behind a `decision.*` event authored by the Principal, never by a loop actor |
| **Audit-chain org chart** | The org chart is data in the event log; "how did the Firm come to be shaped this way" has a traceable answer (Principle 14). No admin path changes the Firm's shape without producing a Decision (GUIDE §10 fm8). | `audit.verify` over an org-chart-change fixture: every structural change traces to a Principal `decision.*` event |

**The escalation EVO-4 forbids:** *could self-review enact a structural change?* No — the review has no
enact path by construction; every org-chart mutation is gated behind a Principal Decision that a loop actor
cannot author. This is Principle 14 made mechanical: there is no meta-layer where organisational changes escape
the audit chain.

---

## 5. The second security review — the evolution-path red-team

Testing §5 mandates **two external security reviews**. The first two performed were M3 (the kernel) and M10
(the whole 1.0 surface including plugins). Neither could cover the self-improvement loops, which did not exist
until M26. M30's review is the **second security review of the evolution paths** — the first adversarial look at
exactly the ways a *self-improving* Firm could escalate its own authority (registry §4). The reason M29 is
sequenced immediately before M30 is precisely so all four loops are inside this review (00-M29-AUDIT §1;
mirroring M9-before-M10).

### 5.1 The escalation threat table

The review asks one question of each loop, in four forms: **can this loop, or a sequence of loops, widen a
capability, relax a Standard, or alter the org chart without a Principal Decision?** Each threat maps to the
control that makes it impossible-without-a-Decision. Nothing below is a new control; each is an existing
boundary proven once more under adversarial pressure.

| # | Escalation threat | Vector | Control that makes it impossible without a Decision |
|---|---|---|---|
| E1 | **Calibration widens a capability** | A crafted or extreme outcome-record sequence drifts a risk weight far enough to change what an agent may do | EVO-1 scope + effect-class-invariance (§4.1): calibration writes only weights in a closed set; effect classes and capability grants are outside it; the write-set is CI-enumerated (§8) |
| E2 | **Calibration lowers a class-3 to a standing grant** | Risk weight nudged to auto-approve an irreversible effect | EVO-1 + security §5: class-3 always asks; no standing grant offered; calibration cannot touch the effect-class table |
| E3 | **Charter revision relaxes a Standard** | A Standard weakened inside a charter edit, bypassing the Standard's own Decision + Guard | EVO-2 no-Standard-relaxation (§4.2): a Standard-touching revision is refused; a Standard change is separately Decision-gated and Guard-enforced (Principle 14; ADR-0016) |
| E4 | **Charter revision self-activates** | An eval-passing revision goes live without the Principal confirming | EVO-2 Principal-confirmed (§4.2): no edge from `eval_passed` to `live`; activation is a `decision.*` event a loop cannot author |
| E5 | **Procedural compilation auto-activates** | A compiled Workflow runs or schedules itself | EVO-3 propose-only (§4.3): `proposed` has no edge to `active`/`scheduled`/`granted` except a Principal Decision |
| E6 | **Compiled Workflow widens its grant** | Activation grants more than the source Missions used | EVO-3 capability-neutral (§4.3): activation grant ⊆ observed Mission grants, checked at the Broker |
| E7 | **Self-review enacts a merge/retire/restructure** | The Structure Review applies its own recommendation | EVO-4 no-enact (§4.4): the review produces zero org-chart events; every mutation is behind a Principal `decision.*` |
| E8 | **A loop edits the org chart via an admin side-door** | A "Firm Admin" path mutates structure outside the event log | EVO-4 audit-chain org chart (§4.4) + Principle 14 + GUIDE §10 fm8: no admin path changes the Firm's shape without a Decision; the org chart is event-log data |
| E9 | **A loop confirms its own proposal** | The Firm plays both author and reviewer of an evolution | Principle 5 + Principle 14 (§1.2): the loop is the author, the Principal is the reviewer; no mode lets a loop actor author the confirming Decision (ADR-0008) |
| E10 | **A loop runs away / self-amplifies** | Loop output feeds its own input, spiralling estimates/charters/proposals | §6 run-away prevention: rate limits, monotonic-improvement bounds, and a circuit-breaker that halts a loop whose output exceeds its per-window bound |
| E11 | **A loop exfiltrates learning** | Calibration/charter/procedure/assessment data sent outward as "telemetry" | §9 + ADR-0009 + GUIDE §12: no telemetry, ever; the egress gate asserts the loops emit nothing beyond configured provider endpoints (security §10) |
| E12 | **A loop escalates via an injected Mission outcome** | A prompt-injected document taints an outcome record that then calibrates a weight | Provenance tagging (security §7.1): outcome records derived from `untrusted` content are quarantined from calibration; a reader Turn holds no effectful tools (security §7.3), so an injected document cannot itself author a calibration |

### 5.2 The escalation-refusal red-team corpus

The red-team suite runs in CI on every commit and mounts, for each loop, a corpus of **escalation attempts**,
each of which must be **refused without a Principal Decision** *and* **surfaced**. At minimum it mounts:

- a calibration sequence engineered to change an effect class (E1/E2)
- a charter revision that edits a Standard (E3) and one that tries to self-activate (E4)
- a compiled Workflow that tries to auto-activate (E5) and one that requests a grant wider than its Missions (E6)
- a self-review run that tries to enact a merge/retire (E7) and an admin path that tries to edit the org chart silently (E8)
- a loop actor attempting to author its own confirming Decision (E9)
- a loop fed its own output to force a run-away (E10)
- a loop attempting any outbound network call (E11)
- an injected outcome record attempting to taint calibration (E12)

**Every case must be refused *and* surfaced.** A silent refusal fails the test, because an undetected escalation
attempt is an intelligence failure even when the escalation fails (testing §5, the M10 "denied and surfaced"
rule applied to evolution). This is the load-bearing rule of the review: "refused" is necessary but not
sufficient — "refused and surfaced to the Principal" is the contract. An attempt the Principal never sees is a
finding.

**A corpus item that achieves an escalation without a Principal Decision is an incident and a release blocker**
(the analogue of M10's "an injection item that defeats all five layers is a release blocker"). It resets the
ninety-day counter (§3.3) and is a defect to fix and re-prove before the window can complete.

### 5.3 Supply chain and locality, re-exercised

The prior security controls are re-run over the M26–M29 subsystems, because the loops are new code even though
they add no new trust mechanism:

- **Supply chain** (T9, security §3): `cargo audit` / `cargo deny` / `npm audit` zero-known-critical; lockfiles
  committed; reproducible build verified. A known-critical advisory in a loop's dependency fails the build.
- **Locality** (ADR-0009, security §10): the egress-allowlist CI test — which already asserts the allowlist
  contains nothing but configured provider endpoints — is re-run with all four loops active over the dogfood
  window's events. A single outbound byte of learning data is a release blocker (E11).

---

## 6. The feedback-loop bounding model

The promise is that **every feedback loop is bounded** — it cannot run away, and its output stays within
declared limits (registry §4). M30 proves it on four axes for all four loops and wires each proof as a bound
gate. This is the 4.0 analogue of M10's chaos-and-recovery model: where M10 proved the substrate survives
adversarial *storage* conditions, M30 proves the loops survive adversarial *feedback* conditions.

### 6.1 The four bounding axes

Each loop is bounded on the same four axes; the specifics differ per loop but the shape is uniform.

| Axis | What it guarantees | How it is proven |
|---|---|---|
| **Rate limit** | A loop can change its target at most a declared amount per window (per calibration window, per charter cycle, per compilation scan, per quarterly review). No single input produces an unbounded change. | Property test: feed extreme/adversarial inputs; assert every per-window delta ≤ the declared bound |
| **Revertibility** | Every change a loop makes is reconstructable and reversible from the event log to its prior state. A bad calibration, charter, proposal, or assessment can be undone without data loss. | Apply → revert → assert equality with pre-change state; rebuild from events and diff (ADR-0002) |
| **Evidence gate** | A loop acts only on sufficient, cited evidence: 50 concluded Missions (M26), an evaluation set (M27), ≥5 repetitions with citations (M28), KPI history + the absorbability test (M29). | Test: below-threshold or uncited input produces no change/proposal |
| **Run-away prevention** | A loop whose output would exceed its per-window bound, or whose output feeds back into its own input, is halted by a circuit-breaker and surfaces a `system.*` warning rather than spiralling. | Feedback-injection test: wire a loop's output to its input; assert the circuit-breaker trips before the second window and the Firm continues |

### 6.2 The bound gates

The four axes are enforced as CI gates, per loop:

| Bound gate | Asserts (across all four loops) | Fails when |
|---|---|---|
| **Rate-bound** | Every loop's per-window change ≤ its declared bound | A loop exceeds its bound on any adversarial input |
| **Revert** | Every loop change reverts to its prior state, byte-identically, from the event log | A change cannot be reverted, or a rebuild-from-events diffs |
| **Evidence** | Every loop acts only on cited, above-threshold evidence | A loop acts on insufficient or uncited evidence |
| **Circuit-breaker** | Every loop halts before a run-away and surfaces the halt | A loop self-amplifies past one window without tripping |

These four bound gates plus the four evolution-path gates (§4) are the eight permanent 4.0 gates M30 adds. They
join — never replace — the twelve prior catalogue gates (GUIDE §7).

### 6.3 Loops under sustained simultaneous load

The bounding proofs run with **all four loops active at once**, because the run-away risk is not only a single
loop spiralling but the loops interacting: a calibration that shifts a risk weight that changes which procedures
repeat that changes what self-review sees. The harness runs a synthetic quarter of Mission activity with every
loop enabled and asserts (a) every per-window bound holds, (b) no loop's output escalates a capability,
Standard, or the org chart, and (c) the Firm stays within its performance budgets (§7). This is the
"sustained self-improvement" condition of G4 and G7.

---

## 7. Performance requirements

The four loops must stay **off the hot path** and **within the existing budgets under sustained
self-improvement**. M30 introduces no new budget; it re-proves the 1.0 budgets (testing §6; GUIDE §3.16) with
all four loops active, and adds a locality requirement specific to the loops.

### 7.1 The loops are off the hot path

| Requirement | Gate |
|---|---|
| No loop runs on the launch path | Cold start ≤1.2 s holds with all loops enabled (Performance gate, GATE-5) |
| No loop runs on the interactive frame path | 60 fps sustained, no frame >32 ms, during active use with loops enabled |
| No loop runs synchronously inside a Mission's critical path | A loop is a Night-Shift/background activity; a Mission's Directive-to-Brief latency is unchanged with loops on vs off (GUIDE §10 failure mode 4) |
| No loop inflates idle memory past budget | Idle resident memory ≤400 MB with all loops enabled |

### 7.2 The loop-budget requirement

The four loops collectively consume a **bounded background budget** and never contend with foreground work: a
loop yields to any active Engagement and runs in the degraded/no-network stages only as far as local data
allows (technical-architecture §9). A loop that would exceed its background budget defers to the next window
rather than raising the number (the M10 enforcement rule: do less work, never raise the budget; ADR-0078).

### 7.3 Locality has no performance escape

A loop may not "batch telemetry for efficiency" because there is no telemetry (ADR-0009). All loop computation
is local; the only outbound traffic remains the configured provider endpoints, unchanged by the loops (security
§10). This is a correctness requirement stated here because "send aggregate learning to improve the model" is
the performance-shaped temptation the locality gate (§9, E11) exists to refuse.

---

## 8. The no-escalation proof

The exit criterion is that **no evolution path can widen a capability, relax a Standard, or alter the org chart
without a Principal Decision** (registry §4). M30 makes this a closed, build-failing property, exactly as M10
made "zero unlogged effects" a closed effect-coverage gate (§8 of the M10 architecture).

### 8.1 The escalation-coverage enumeration

The gate works by enumeration, not sampling. There are exactly three escalation *targets* — a capability, a
Standard, the org chart — and exactly four loops that could touch them. M30 enumerates, for each (loop × target)
pair, the code path by which the loop *could* reach that target, and proves each such path passes through a
Principal Decision it cannot author.

| | Widen a capability | Relax a Standard | Alter the org chart |
|---|---|---|---|
| **M26 Calibration** | Refused: write-set excludes capabilities/effect classes (EVO-1, §4.1) | Refused: write-set excludes Standards (EVO-1) | Refused: write-set excludes org-chart tables (EVO-1) |
| **M27 Charter evolution** | Refused: a charter grant widen is a Decision, not a merge (EVO-2, §4.2) | Refused: no-Standard-relaxation assertion (EVO-2) | Refused: a charter edits a role, never the chart (EVO-2) |
| **M28 Procedural compilation** | Refused: proposal holds zero grants; activation ⊆ Mission grants, a Decision (EVO-3, §4.3) | Refused: a Workflow proposal cannot edit a Standard (EVO-3) | Refused: a Workflow proposal cannot edit the chart (EVO-3) |
| **M29 Self-review** | Refused: assessment-only, zero grant changes (EVO-4, §4.4) | Refused: assessment-only, zero Standard changes (EVO-4) | Refused: no enact path; every mutation is a Decision (EVO-4, Principle 14) |

The set is **closed**: a new (loop × target) reachability introduced by a future code change cannot merge
without its refusal assertion, which is what makes "no escalation without a Decision" a mechanical property
rather than a review outcome (the M10 effect-coverage discipline, GUIDE §3.4).

### 8.2 The Decision-authorship invariant

Every enactment of a loop's proposal is a `decision.*` event whose `actor` is the **Principal**, never a loop.
The invariant M30 proves: **no `decision.*` event that widens a capability, relaxes a Standard, or alters the
org chart has a loop actor.** This is enforced at the point Decisions are recorded (the decision engine) and
verified by `audit.verify` over the dogfood window: every structural/capability/Standard change traces to a
Principal-authored Decision, with no gap (Principle 14; §4.4).

### 8.3 The dogfood-window escalation chain

Over the ninety-day window, `audit.verify` runs nightly and on every unclean-shutdown startup (logging §1). The
acceptance criterion is that across the entire window, **every capability change, every Standard change, and
every org-chart change on the chain has a Principal `decision.*` antecedent**, and **no loop produced an effect
in any of the three targets**. "No escalation without a Decision" for the exit criterion means: (a) the four
evolution-path gates are green for every commit in the window, and (b) the escalation chain over the window
shows zero loop-authored escalations, verifiable end to end.

---

## 9. Security requirements — the review's findings as gates

The evolution-path security review (§5) produces findings; M30's rule is that **every finding becomes a gate or
a fixed defect before the release, never a documented caveat** (the M10 stance: a release-blocker pauses the
release; it does not receive an exception). The standing security requirements the loops must satisfy:

| # | Requirement | Enforced by |
|---|---|---|
| SR-1 | No loop widens a capability, lowers an effect class, or grants a class-3 standing permission | EVO-1, EVO-2, EVO-3; §8; security §5 |
| SR-2 | No loop relaxes, removes, or downgrades a Standard or a Guard; a Standard change is Decision-gated and Guard-enforced | EVO-2; Principle 14; ADR-0016 |
| SR-3 | No loop alters the org chart; every merge/retire/restructure is a Principal Decision on the chain | EVO-4; §8.2; Principle 14; GUIDE §10 fm8 |
| SR-4 | No loop confirms its own proposal; the Firm is author, the Principal is reviewer | Principle 5; ADR-0008; §5 E9 |
| SR-5 | No loop emits learning outward; all calibration/charter/procedure/assessment data stays local | ADR-0009; GUIDE §12; the egress gate; §5 E11 |
| SR-6 | An injected/untrusted outcome record cannot calibrate a weight or drive a proposal | security §7.1/§7.3; §5 E12 |
| SR-7 | Every loop action is an audited event on the hash chain; `audit.verify` covers it | ADR-0002; logging §1; §8.3 |
| SR-8 | The Permission Broker remains the single choke point; no loop introduces a bypass | security §4; §1.5 |

**The single choke point holds.** A loop's proposal, when the Principal confirms it, becomes an ordinary
effect that passes `authorize_action` like any other. M30 adds pre-flight refusals *ahead* of the Broker (the
four evolution-path gates) and one authorship invariant *at* the decision engine (§8.2); it removes no existing
check.

---

## 10. The ninety-day dogfood acceptance protocol

The exit criterion is **ninety days dogfooding** with **no evolution path escalating without a Principal
Decision** (registry §4). This section makes each phrase objectively measurable, because an unmeasurable exit
criterion is not a gate. It is the 4.0 analogue of M10's thirty-day protocol, extended to ninety and scoped to
the four loops.

### 10.1 What is measured

The team uses the self-improving product daily with **all four loops active** (GUIDE §11: "the team uses it
daily from M6"; the dogfood is the same instrument run for a bounded, recorded window). Over ninety consecutive
days:

- every calibration applied, with its per-window delta and its revert-availability (M26)
- every charter revision proposed, its eval result, and the Principal Decision that did or did not accept it (M27)
- every Workflow candidate proposed, its Mission citations, and whether it was activated by Decision (M28)
- every Structure Review assessment and every org-chart change, each traced to a Principal Decision (M29; §8.2)
- every escalation-refusal the red-team corpus and the live loops produced, surfaced to the Principal (§5.2)
- every circuit-breaker trip and every rate-bound hit (§6)
- every open defect, with a disposition: **fixed** or **explicitly accepted in writing**

### 10.2 What counts as an **escalation-without-a-Decision incident**

An escalation incident is any of, across the whole window:

- a capability widened, an effect class lowered, or a class-3 standing grant created, with no Principal
  `decision.*` antecedent (§8.2)
- a Standard or Guard relaxed, removed, or downgraded with no Principal Decision (SR-2)
- an org-chart change — a department merged, retired, or restructured — with no Principal Decision (SR-3)
- a loop actor authoring a `decision.*` event that enacts any of the above (SR-4, E9)
- any outbound emission of learning data (SR-5, E11) — the locality violation is an escalation of the Firm's
  reach beyond the machine

A single violation is an **incident**: it resets the ninety-day counter to zero (§3.3, invariant 2) and is a
defect to fix and re-prove before the window can complete.

### 10.3 What counts as a **run-away incident**

A run-away incident is any of, across the whole window:

- a loop exceeding its declared per-window rate bound without the circuit-breaker tripping (§6.1)
- a loop's output feeding its own input into a self-amplifying spiral (§6.1, E10)
- a Mission's Directive-to-Brief latency or Principal-facing token count regressing against the loops-off
  baseline (GUIDE §10 failure mode 4 — "the organisation becomes the product" — is a run-away of the structure
  itself)

A run-away incident resets the counter exactly as an escalation incident does.

### 10.4 The release-gate Decision

At the end of a clean ninety-day window, with the evolution-path security review passed (§5) and every open
defect fixed or accepted in writing (§10.1), the release is a **Principal Decision**, recorded as a `decision.*`
event and **demonstrated live or in a recording to someone who does not trust the author** (GUIDE §6).
"Substantially done" is not a state (GUIDE §6). 4.0 ships at that Decision, and not before (ADR-0078). Because
there is no M31, this Decision also closes the Sidra OS architecture programme (registry §3).

---

## 11. Persistence and events — no new tables

### 11.1 No new migrations

M30 adds **no tables and no migration**, exactly as M10 added none (ADR-0039). The migration bands are already
allocated through M25 (`0001` v1 base; `0002–0018` M11–M14; `0019–0024` M15; `0025–0029` M16; M17–M25 in their
own bands) and M26–M29 added the evolution-path tables they needed. M30 uses **none** and introduces no new
band. A Firm at the end of M30 behaves exactly as it did at the end of M29 for every product path — hardening
changes proofs, not schema (ADR-0079; the ADR-0039 precedent).

### 11.2 What events hardening emits

M30 emits **no new domain event kind for product state.** The event kinds are namespaced and closed
(system-design §2). The facts M30 produces already have homes:

- **Every loop's actions** (calibration applied, charter proposed, Workflow proposed, assessment produced) →
  the `evolution.*`/`decision.*` events M26–M29 already define.
- **Every escalation-refusal and circuit-breaker trip** → existing `system.*` health facts surfaced to the
  Principal (the "refused and surfaced" contract, §5.2).
- **The release-gate sign-off and each defect acceptance** → `decision.*` events — they are Principal
  Decisions (GUIDE §6), not a new mechanism.

The only additive artifacts are a small set of `system.*` bookkeeping markers for the dogfood window (window
open, day recorded, incident/reset), recorded under **ADR-0079** as additive variants on the existing hash
chain (ADR-0002). The **dogfood ledger, the release-gate record, and the escalation-corpus results are
projections** over these existing `system.*`/`decision.*`/`evolution.*` events — rebuildable from the log,
never an authoritative table (ADR-0002; ADR-0079). If a 4.0 release-gate ledger is wanted, it is this
projection and nothing more; no band is claimed that is not used (§0 numbering; ADR-0079).

### 11.3 The Vault Markdown mirror (v1 rule — the archive outlives the software)

M30 adds no new mirrored artifact; it *verifies* that every loop's proposals and every release-gate Decision
survive in plain Markdown. A Principal who abandons Sidra OS keeps a readable record of every evolution the
Firm proposed, every one the Principal confirmed, and the 4.0 release-gate Decision — but the loops themselves,
being local, leave nothing anywhere else.

---

## 12. Public commands and queries touched

M30 adds **no new Principal-facing product command.** It exercises and hardens existing operational surfaces
and adds only CI/operational entry points (not product features):

| Surface | Kind | M30's use | Source |
|---|---|---|---|
| `audit.verify` | operational query | Nightly + unclean-shutdown startup + over the full dogfood chain for the escalation-authorship invariant (§8.2) | logging §1 |
| loop inspect/revert | operational (existing, M26–M29) | Every calibration/charter/proposal/assessment is inspectable and revertible; M30 exercises the revert paths as bound gates (§6) | M26–M29 |
| the four evolution-path gates | CI | Permanent 4.0 gates (EVO-1…EVO-4, §4) | GUIDE §7; ADR-0079 |
| the four bound gates | CI | Rate-bound, Revert, Evidence, Circuit-breaker (§6.2) | ADR-0079 |
| egress allowlist test | CI | Re-run with all four loops active; asserts locality (§9, E11) | security §10; ADR-0009 |
| the release checklist | operational | Machine-checkable 4.0 release gate (§3.2) | ADR-0078 |

**API rules preserved.** No API returns a credential (security §9); every effectful enactment of a loop's
proposal still passes the Permission Broker (security §4); class-3 still always asks with no standing grant
(security §5; GUIDE §12); no loop actor authors a Decision (§8.2).

---

## 13. Sequence diagrams

### 13.1 The exit-criterion path — a loop tries to escalate and is refused

```
Loop(actor)     EvolutionGate     DecisionEngine     Principal      Broker
  │ propose change (widen cap / relax Standard / alter chart)        │
  ├───────────────►│ classify target ∈ {capability, Standard, org-chart}
  │                │ is this an enact path for a loop actor?  → YES  │
  │◄── Refused ────┤ record system.* refusal (surfaced)             │
  │  (nothing enacted — the loop may only PROPOSE)                   │
  │                │                                                 │
  │ emit proposal artifact (evolution.*, inert)                     │
  ├────────────────┼────────────────────────────────────────────────►│ Principal sees the proposal
  │                │                                     confirm?    │
  │                │                          Principal authors ─────►│ decision.* (actor = Principal)
  │                │◄──────────────── Decision recorded ─────────────┤
  │                │ NOW the change is an ordinary effect ──────────────────────►│ authorize_action
  │                │                                                             │◄─ Allow/NeedsApproval
  │  (the only path from proposal to effect runs through a Principal Decision the loop cannot author — §8.2)
```

### 13.2 A calibration attempts to widen a capability (EVO-1 refusal)

```
Calibration     WriteSet(closed)     EffectClassTable
  │ concluded Mission outcome (extreme)  │
  ├──────────────►│ target field?        │
  │               │ ∈ {estimate, novelty, risk weights} ?
  │               │   YES → apply, ≤ per-window bound, revertible
  │               │   NO (capability / effect class / Fence / Standard) → REFUSE
  │◄── weight nudged, bounded ───────────┤   (effect classes UNCHANGED — §4.1)
  │  a risk weight makes the Firm more/less cautious; it NEVER changes an authorization
```

### 13.3 The ninety-day release gate

```
Hardening      CI(4 EVO + 4 bound gates)   Security Review     Dogfood Window (loops active)   Principal
   │  freeze 4.0 scope │                        │                       │                          │
   ├──────────────────►│ all green?             │                       │                          │
   │                   ├─ yes ──────────────────┼──────────────────────►│ open 90-day window
   │                   │                        │                       │  clean_day ×90           │
   │                   │                        │                       │  (any escalation/run-away → counter=0)
   │                   │◄─ still green every commit ─────────────────────┤                          │
   │                   │                        │ evolution-path review  │                          │
   │                   │                        ├─ no unresolved release-blocker ──────────────────►│
   │                   │                        │                       │ defects fixed/accepted    │
   │                   │                        │                       ├─────────────────────────►│ evaluate gate
   │                   │                        │                       │                          │ Decision (decision.*)
   │                   │                        │                       │                          │ demonstrated to a skeptic
   │                   │                        │                       │                          ▼
   │                   │                        │                       │                   4.0 SHIPS — programme complete
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | A calibration would change an effect class | Refused by EVO-1 (write-set excludes effect classes); the attempt is surfaced; the build fails if the write-set is breached (§4.1; §8) |
| F2 | A charter revision edits a Standard | Refused by EVO-2 no-Standard-relaxation; a Standard change needs its own Decision + Guard (§4.2; SR-2) |
| F3 | An eval-passing charter revision tries to self-activate | Refused: no edge from `eval_passed` to `live`; activation is a Principal Decision (§4.2; E4) |
| F4 | A compiled Workflow tries to auto-activate | Refused by EVO-3 propose-only; `proposed` has no edge to `active` (§4.3; E5) |
| F5 | The Structure Review tries to enact a merge | Refused by EVO-4 no-enact; the review produces zero org-chart events (§4.4; E7; Principle 14) |
| F6 | An admin path edits the org chart silently | Refused: no admin path changes the Firm's shape without a Decision; `audit.verify` would show a chart change with no Principal antecedent (§4.4; §8.2; GUIDE §10 fm8) |
| F7 | A loop attempts to author its own confirming Decision | Refused: the loop is author, the Principal is reviewer; no loop actor may author a `decision.*` (§8.2; SR-4; E9) |
| F8 | A loop is fed its own output and starts to run away | The circuit-breaker trips before the second window; a `system.*` warning is surfaced; the Firm continues (§6.1; E10) |
| F9 | A loop attempts an outbound network call | Blocked by the egress gate; the locality violation is a release blocker (§9; SR-5; E11) |
| F10 | An injected outcome record tries to calibrate a weight | Quarantined: `untrusted`-derived records do not feed calibration; the reader Turn held no effectful tool (§5 E12; security §7) |
| F11 | An escalation attempt is refused but not surfaced | The red-team test fails — a silent refusal is a failure; "refused and surfaced" is the contract (§5.2) |
| F12 | An escalation-without-a-Decision reaches `main` | The relevant EVO gate fails the build; it cannot merge; the escalation set is closed by enumeration (§8.1) |
| F13 | An escalation or run-away incident on day 74 | The ninety-day counter resets to zero; the incident is a defect to fix and re-prove (§3.3; §10.2–§10.3) |
| F14 | A new evolution loop is proposed during hardening | Refused; scope is frozen at Feature-complete; there is no M31 (§1.4) |
| F15 | A bound gate is relaxed to make a loop "more useful" | Refused: a bound is tightened, not relaxed; relaxing needs an ADR arguing the Principal is better off, and "too restrictive" is not that argument (§1.4; §6) |

---

## 15. Dependencies, assumptions, risks

### 15.1 Dependencies

| On | For |
|---|---|
| **M26 — Outcome Calibration** | the calibration loop to bound (EVO-1) and prove local, revertible, rate-limited (§4.1, §6) |
| **M27 — Charter Evolution** | the charter loop to prove eval-gated and Principal-confirmed, with no Standard relaxation (EVO-2, §4.2) |
| **M28 — Procedural Compilation** | the compilation loop to prove propose-only and capability-neutral (EVO-3, §4.3) |
| **M29 — Firm Self-Review** | the self-review loop to prove no-enact; the org-chart target of Principle 14 (EVO-4, §4.4) |
| M13 — departments & Standards/Guards | the Standards and org chart the review assesses and must not enact upon (§4.4, SR-2, SR-3) |
| M3 — security kernel, Broker, effect classes, egress | the choke point, the effect-class invariant, the locality egress gate (security §3/§4/§5/§10) |
| M2 — event log, hash chain | the revertibility proofs and the escalation-authorship invariant on the chain (§6, §8.2; ADR-0002) |
| M10 — the 1.0 hardening pattern | the CI-gate-as-object framing, the reset-on-incident dogfood state machine, the second-security-review shape (this doc mirrors it) |

### 15.2 Assumptions

1. **M26–M29 are architecturally complete** (see `00-M29-AUDIT.md`). M30 hardens a finished evolution surface;
   it does not finish an unfinished one.
2. **The team is using the self-improving product daily** and can run a bounded ninety-day dogfood window with
   all four loops active as the acceptance instrument (GUIDE §11).
3. **Each loop already exposes an inspect/revert surface** (M26 exit criterion for calibration; the analogous
   surfaces for M27–M29), which M30 exercises as bound gates rather than building anew.
4. **There is no M31.** M30 is the final planned milestone; a future capability is a future programme with its
   own registry entry and its own second review, not an M30 extension (registry §4, §6).

### 15.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| HR-1 | Hardening becomes a fifth-loop / auto-enact feature-slip window | Scope frozen at Feature-complete; new-loop and auto-enact PRs refused; ADR-0078 forbids it (§1.4) |
| HR-2 | A bound is relaxed to make a loop more useful | Relaxing a bound requires an ADR arguing the Principal is better off; "too restrictive" is not that argument (§6; §1.4) |
| HR-3 | The dogfood window is padded with "mostly clean" days | The window is ninety *consecutive* clean days; any escalation or run-away resets the counter (§3.3; §10) |
| HR-4 | A bounding proof reveals a loop cannot be made run-away-proof late | Treated as a defect fix within the existing M26–M29 architecture, re-proven by its gate — not a redesign (§1.4, F15) |
| HR-5 | The review finds an escalation path a loop introduced | Exactly why M29 is sequenced before M30; the finding is a release blocker fixed before the gate (§5; 00-M29-AUDIT §2) |
| HR-6 | A gate is disabled "temporarily" to unblock | A permanent gate is never removed; a red gate pauses the release; there is no M31 to defer it to (§3.3 invariant 4; ADR-0078) |
| HR-7 | The escalation set drifts open as the loops are extended | The escalation-coverage gate is by enumeration and closed; a new (loop × target) reachability cannot merge without its refusal assertion (§8.1) |
| HR-8 | A loop confirms its own proposal under a "convenience" setting | Structurally forbidden: no loop actor may author a confirming Decision; Principle 5 and 14 apply to the Firm improving itself (§8.2; SR-4) |
| HR-9 | "Send aggregate learning to improve the model" is proposed as a perf win | Refused: no telemetry, ever; the locality gate is permanent (§7.3; §9; ADR-0009; GUIDE §12) |

---

## 16. Acceptance criteria

The exit criterion decomposed into objectively testable, named claims. **These are the contract with
AntiGravity.** Each maps to a task in the Implementation Plan.

| # | Claim | Proven by | Task |
|---|---|---|---|
| AC1 | **No evolution path can widen a capability without a Principal Decision** — proven per loop; the write-sets/grant-paths exclude capabilities and effect classes; the escalation set is closed by enumeration | the four evolution-path gates + the escalation-coverage enumeration (§4, §8.1) | T1.2, T6.1 |
| AC2 | **No evolution path can relax a Standard without a Principal Decision** — a charter revision cannot edit a Standard; a Standard change is Decision-gated and Guard-enforced | the EVO-2 no-Standard-relaxation gate + the escalation enumeration (§4.2, §8.1; SR-2) | T3.2, T6.1 |
| AC3 | **No evolution path can alter the org chart without a Principal Decision** — the Structure Review has no enact path; every merge/retire/restructure traces to a Principal `decision.*` | the EVO-4 no-enact gate + the Decision-authorship invariant (§4.4, §8.2; Principle 14) | T5.2, T6.2 |
| AC4 | The four evolution-path gates are permanent CI gates: a calibration/charter/compilation/self-review escalation fails the build | EVO-1…EVO-4 wired into `infrastructure/ci/` (§4; GUIDE §7; ADR-0079) | T1.1, T1.2 |
| AC5 | The escalation-coverage set is closed: a new (loop × target) reachability cannot merge without its refusal assertion | the escalation-coverage enumeration gate (§8.1) | T6.1 |
| AC6 | **Calibration is bounded:** rate-limited per window, revertible to prior weights, evidence-gated at 50 Missions, and cannot change an effect class | the EVO-1 gate + the calibration bounding harness (§4.1, §6) | T2.1, T2.2 |
| AC7 | **Charter evolution is bounded:** eval-gated (a regression refuses the merge), Principal-confirmed (no silent activation), revertible | the EVO-2 gate + the charter bounding harness (§4.2, §6) | T3.1, T3.2 |
| AC8 | **Procedural compilation is bounded:** proposed only at ≥5 cited repetitions, propose-only (no auto-activation), capability-neutral until a Decision | the EVO-3 gate + the compilation bounding harness (§4.3, §6) | T4.1, T4.2 |
| AC9 | **Self-review is bounded:** assessment-only with the absorbability test, no enact path, every org-chart change a Decision | the EVO-4 gate + the self-review bounding harness (§4.4, §6) | T5.1, T5.2 |
| AC10 | The four bound gates hold under sustained simultaneous load: rate-bound, revert, evidence, and circuit-breaker each pass with all four loops active | the four-loop bounding harness (§6.2, §6.3) | T2.3, T3.3, T4.3, T5.3 |
| AC11 | The escalation-refusal red-team corpus refuses **and surfaces** every case (E1–E12: calibration/charter/compilation/self-review escalation, self-approval, run-away, egress, injected outcome); a silent refusal fails | the escalation red-team gate over the vector set (§5.1, §5.2) | T6.3 |
| AC12 | Supply-chain gates pass over the M26–M29 subsystems: `cargo audit`/`cargo deny`/`npm audit` zero-known-critical; lockfiles committed; reproducible build verified | the supply-chain gate (§5.3) | T6.4 |
| AC13 | **All learning stays local:** the egress allowlist test, re-run with all four loops active over the window, shows zero outbound learning data; a single emission is a release blocker | the locality egress gate (§9; ADR-0009; security §10) | T6.5 |
| AC14 | The four loops stay off the hot path and within budget under sustained self-improvement: cold start ≤1.2 s, 60 fps, idle ≤400 MB, Directive-to-Brief latency unchanged loops-on vs loops-off | the Performance gates re-run with loops active + the latency-parity test (§7) | T7.1 |
| AC15 | Every loop action is an audited event on the hash chain; `audit.verify` shows every capability/Standard/org-chart change has a Principal Decision antecedent, with no gap over the window | the escalation-authorship invariant + `audit.verify` over the window (§8.2, §8.3; SR-7) | T6.2 |
| AC16 | **Ninety consecutive dogfood days with the loops active, zero escalation-without-a-Decision, zero run-away; every open defect fixed or accepted in writing; the release-gate Decision recorded and demonstrated to someone who does not trust the author** | the dogfood acceptance harness + the release-gate Decision (§10; registry §4; GUIDE §6; ADR-0078) — **the last thing to go green; there is no M31** | T7.4 |

---

## Appendix A — Glossary additions

- **Continuum Hardening** — the M30 activity of converting the boundedness and no-escalation *assertions* of
  M26–M29 into permanent, build-failing CI gates, red-teaming the four loops for escalation, and demonstrating
  the whole self-improving product surviving ninety days of real use. It adds no evolution feature and relaxes
  no bound.
- **Evolution path** — one of the four self-improvement feedback loops of 4.0: M26 outcome calibration, M27
  charter evolution, M28 procedural compilation, M29 firm self-review. Each proposes; only the Principal
  confirms.
- **Escalation** — a loop widening a capability, relaxing a Standard, or altering the org chart. M30's exit
  criterion is that no escalation is possible without a Principal Decision.
- **Escalation-without-a-Decision incident** — any capability widened, Standard relaxed, org-chart change, or
  loop-authored confirming Decision, or any outbound emission of learning data, with no Principal `decision.*`
  antecedent (§10.2). Resets the ninety-day counter.
- **Run-away incident** — a loop exceeding its per-window rate bound without the circuit-breaker tripping, a
  loop self-amplifying, or a regression in Directive-to-Brief latency/token count against the loops-off
  baseline (§10.3). Resets the counter.
- **The 4.0 release gate** — the proof obligation 4.0 must satisfy before it ships: the four evolution-path
  gates and four bound gates green, the evolution-path security review passed, and a clean ninety-day dogfood
  window with all loops active (ADR-0078). Not a date.
- **Bound gate** — a CI gate proving a loop is rate-limited, revertible, evidence-gated, or run-away-proof
  (§6.2). Four of them, permanent for the life of the product.
- **Evolution-path gate** — a CI gate proving a loop cannot escalate without a Decision: EVO-1 calibration,
  EVO-2 charter, EVO-3 compilation, EVO-4 self-review (§4). Four of them, permanent.

## Appendix B — Repository placement

M30 changes **only** `infrastructure/ci/` and `infrastructure/testing/`, plus test additions inside the
existing M26–M29 subsystems. **No new crate. No new migration.**

```
infrastructure/
├── ci/                          EXTENDED — the four evolution-path gates + four bound gates (ADR-0031 placement)
│   └── gates/
│       ├── evo-1-calibration-bounded.*     EVO-1  (§4.1)
│       ├── evo-2-charter-eval-gated.*       EVO-2  (§4.2)
│       ├── evo-3-compilation-propose-only.* EVO-3  (§4.3)
│       ├── evo-4-self-review-no-enact.*      EVO-4  (§4.4)
│       ├── bound-rate.*                      rate-limit bound (§6.2)
│       ├── bound-revert.*                    revertibility bound (§6.2)
│       ├── bound-evidence.*                  evidence gate (§6.2)
│       ├── bound-circuit-breaker.*           run-away prevention (§6.2)
│       ├── escalation-coverage.*             the closed (loop × target) enumeration (§8.1)
│       └── locality-egress.*                 loops emit nothing outward (§9; re-runs security §10 test)
└── testing/                     EXTENDED — the hardening harnesses
    ├── evolution/
    │   ├── calibration-bounding/   rate, revert, evidence, effect-class-invariance (§4.1, §6)
    │   ├── charter-bounding/       eval-gate, Principal-confirm, no-Standard-relaxation (§4.2, §6)
    │   ├── compilation-bounding/   propose-only, citations, capability-neutral (§4.3, §6)
    │   ├── self-review-bounding/   no-enact, absorbability, audit-chain org chart (§4.4, §6)
    │   └── four-loop/              sustained simultaneous-load bounding (§6.3)
    ├── security/                  escalation-refusal red-team corpus (E1–E12) + supply-chain (§5)
    ├── performance/               the 1.0 budgets re-run with loops active + latency parity (§7)
    └── dogfood/                   the ninety-day acceptance harness + 4.0 release checklist (§10)

services/*  (M26–M29 subsystems)   EXTENDED — no-escalation + rate-bound assertions (tests only; no feature)
services/store/migrations/         UNCHANGED — no new migration (§11.1)
```

Dependency direction (ADR-0011) is unchanged and re-proven by the existing Dependency-direction gate:
`packages/domain ← services/* ← apps/*`.

## Appendix C — Implementation position

M30 is the **final milestone of 4.0 "Continuum"** and the **final planned milestone of the Sidra OS programme**
(registry §3/§4). It depends on all of M26–M29 and introduces no new product feature. Building it earlier is
impossible by construction: hardening proves a *finished* evolution surface, and the surface is not finished
until M29 lands the last of the four loops the evolution-path security review must cover (00-M29-AUDIT §1). 4.0
ships at the end of M30 and, with it, the architecture programme is complete. **There is no M31.**

**Exit criterion.** No evolution path can widen a capability, relax a Standard, or alter the org chart without a
Principal Decision — proven per path by a permanent gate — and ninety consecutive dogfood days with the loops
active, the release itself a demonstrated Principal Decision (AC16; ADR-0078; registry §4).
