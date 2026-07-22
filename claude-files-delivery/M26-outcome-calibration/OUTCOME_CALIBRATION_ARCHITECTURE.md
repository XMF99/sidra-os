# Outcome Calibration — Architecture

**Milestone M26 · Release 4.0 "Continuum" · Layer 3 (Intelligence)**

| | |
|---|---|
| Milestone | M26 — Outcome Calibration (`/MILESTONE_REGISTRY.md` §4, 4.0 "Continuum") |
| Release | 4.0 "Continuum" — the Firm improves itself · **M26 is the first milestone of 4.0** |
| Layer | 3 — Intelligence (`/docs-v2/02-layer-model.md`); calibration is deterministic infrastructure, not an agent |
| New crate | `sidra-calibration` at `services/calibration/` |
| Depends on | **M15** (Mission Engine — the outcome records to calibrate from), M2 (event log), M3 (Broker/redaction for command authorisation) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | Estimate error narrows measurably over 50 concluded Missions; the calibration is **inspectable** and **revertible** — proven by test, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `/docs/0009-no-telemetry.md` (ADR-0009)
> about what may leave the machine, ADR-0009 governs — absolutely and without exception. Where it disagrees
> with `/docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` about the shape of an outcome record, the
> estimate model (§5.2, §11), the risk aggregation (§11.3), or the novelty dimension (§11.2), the Mission
> Engine governs. Where it disagrees with `/docs-v2/02-v2-principles.md` Principle 14 (no meta-layer) or
> `/MASTER_IMPLEMENTATION_GUIDE.md` §12 (the permanent nos), those govern. This architecture *extends* the
> substrate M15 already assumes; it never re-decides an M1–M25 boundary, and it opens no new one that a later
> milestone must walk back.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M25 the Firm plans, executes, verifies, and concludes Missions, and at every conclusion it writes an
**outcome record** — plan versus reality: estimated cost and duration against actual, which risks
materialised, which were over-estimated, how novelty scored versus how the work actually went
(`MISSION_ENGINE_ARCHITECTURE.md` §23.3). The Mission Engine already *reads* this history at planning time:
§23.2 lists "Estimate calibration — historical actual cost and duration for comparable Tasks — **replaces
heuristic estimates with measured ones**," and novelty scoring (§11.2 dimension 3) is defined as a memory
query over comparable Task signatures. §23.3 states the loop's purpose in one sentence: *"Over time it
calibrates estimates, novelty scores, and risk weights."*

But nothing does. Through M25 that calibration is a promise the data structures make and no component keeps.
The outcome records accumulate; the estimates that seed the next Mission are still the same heuristics, still
citing `heuristic` as their source (§23.5 rule 3), still wrong in the same direction. F15 in the Mission
Engine's own failure table — *"Estimate wildly wrong: actual ≫ p90"* — says the variance "enters the outcome
record and recalibrates future estimates," and ADR-0026 names the payoff plainly: *"Gained: calibration data,
because estimate error is measurable against something real."* M26 is the component that closes that loop.

The requirement is **not** "let the Firm learn about itself and get better." An organisation that adjusts its
own parameters on the basis of its own history, with no floor and no audit, is one poisoned record away from
optimising itself into an accident — and one silent step away from becoming the meta-layer Principle 14
forbids. The requirement is precise: **read the local outcome records that concluded Missions already produce,
compute a bounded numeric correction to estimates, novelty scores, and risk weights, apply it only if it
demonstrably narrows error on held-out Missions, record exactly which outcomes drove exactly which adjustment,
keep the prior parameters so any calibration can be undone to the byte — and never let a single number, sample,
or record leave the machine.**

### 1.2 The stance

Three commitments define the subsystem, and each has an ADR:

1. **Calibration is a revertible projection over local outcome records — never a telemetry channel.**
   (ADR-0069) The calibrated parameters are a projection derived from the append-only outcome records and an
   append-only log of calibration runs, exactly as every entity table is a projection of the event log
   (ADR-0002). The projection is versioned; a revert activates a retained prior version; the parameters are
   rebuildable from the records that produced them. Reading is local; writing is local; **nothing is
   uploaded** (ADR-0009).
2. **Calibration adjusts numeric parameters only — never a capability, a Standard, or the org chart.**
   (ADR-0070) It writes multiplicative estimate corrections, a novelty mapping, and risk-dimension weights,
   all numbers in a fixed schema. It has no write path to a capability grant, a Standard, a Guard, or a
   department. The safety structure of risk aggregation (§11.3: reversibility and blast radius enter through
   `max`, never a mean) is invariant under calibration. This is the boundary that separates M26 from M27
   (charter evolution) and M29 (self-review), which *propose* structural change and require a Principal
   Decision to enact it.
3. **A calibration is applied only if it measurably narrows error, and every adjustment is inspectable.**
   (ADR-0071) The estimate-error metric is defined precisely and computed walk-forward (no lookahead). A
   candidate parameter set that does not narrow held-out error by the declared margin is recorded and
   **rejected — not activated**. Every adjustment that is applied names the exact outcome-record samples that
   drove it and the statistic it computed from them.

### 1.3 What calibration is, mechanically

Calibration is **deterministic Layer-3 infrastructure**, not an agent. Like the Mission Engine itself
(`MISSION_ENGINE_ARCHITECTURE.md` §24.1) it has no charter, no personality, no memory of its own, no Turn, and
no model. It runs no inference. It is a single pass of arithmetic over rows that already exist in the local
database, producing a versioned row of numbers that the Mission Engine reads at plan time. This parallel is
deliberate and load-bearing: it means M26 introduces no new judgement, no new authority, and no new network
edge. It reuses the event log (ADR-0002), the projection discipline (`/docs/04-database-design.md` §1.2), and
the no-telemetry guarantee already shipped and verified in ADR-0009.

```
Mission concludes ──► outcome record written (M15 §23.3, existing)
                              │  read locally, never uploaded
                              ▼
                    sidra-calibration (Layer 3, THIS DOC)
                      gather → compute candidate → backtest → apply | reject → version
                              │  writes local, versioned, revertible parameters
                              ▼
Mission planning ──► reads active calibration parameters (M15 §23.2 seam, now real)
```

### 1.4 What calibration must never become

- **A telemetry channel.** No calibration path makes a network connection. Outcome records, error samples, and
  parameters never enter a diagnostics bundle except by the Principal's explicit, previewed, redacted export
  (ADR-0009). The `sidra-calibration` crate has no network dependency anywhere in its dependency closure, and
  a runtime guard fails the process if a socket is opened during a calibration run. "There is no telemetry
  setting because there is no telemetry" (ADR-0009) is a claim M26 must not weaken.
- **A silent capability, Standard, or org-chart change.** Calibration writes numbers. It has no write path to a
  capability grant, a `[capabilities].forbidden` set, a Standard, a Guard, or a department manifest. Widening
  what the Firm may *do* — as opposed to correcting a *number it estimates* — is a Decision under Principle 14
  and belongs to M27/M29, never here. A parameter that changed behaviour by relaxing a rule would be a
  meta-layer, and there is no meta-layer.
- **An un-revertible black box.** Every applied adjustment traces to the exact outcome records that drove it,
  and the prior parameter version is retained verbatim so a revert restores it exactly. A calibration whose
  effect a Principal cannot inspect, and whose effect a Principal cannot undo, is precisely the failure 4.0 is
  gated against.
- **A self-promotion path.** Calibration narrows the numbers the Firm uses to estimate its own work. It does
  not lower a risk floor, it does not reduce a novelty score below its evidence-bound floor, and it does not
  make the Firm bolder. "Risk never decreases without evidence" (§11.5 rule 2) and "Unknown is not Low"
  (§11.5 rule 4) survive calibration unchanged — they become *inputs* to it, never casualties of it.

### 1.5 Relationship to existing concepts

| Existing concept | How M26 relates |
|---|---|
| Outcome record (M15 §23.3) | The sole input. Calibration reads the plan-versus-reality record that only a concluded Mission produces. It never writes one and never changes one. |
| Estimate model (M15 §5.2 `[task.estimate]`, §11 cost variance) | Calibration produces a multiplicative correction and a spread ratio applied to the *raw* estimate at plan time. The raw estimate and its source (`department`/`historical`/`heuristic`, §23.5 rule 3) are unchanged; the correction is a new, cited, revertible layer on top. |
| Novelty dimension (M15 §11.2 dim 3) | Calibration adjusts the *interior* of the comparable-count → novelty mapping, within fixed endpoints (n=0 → 3 always; §11.5 rule 4) and fixed monotonicity (§11.5 rule 2). |
| Risk aggregation (M15 §11.3) | Calibration adjusts only the four `mean`-dimension weights (`specification`, `novelty`, `fragility`, `cost_variance`). Reversibility and blast radius stay in `max`, untouched. The bands (§11.3) and the `⊕` combinator are invariant. |
| Event log (ADR-0002) | Every calibration run and revert is an append-only, hash-chained event. Parameters are a projection; recovery replays, it never restores. |
| ADR-0009 (no telemetry) | The governing constraint. Calibration reads local, writes local, uploads nothing. M26 is the first 4.0 milestone and the one that most tempts a "just send us the aggregate error" shortcut; the temptation is refused structurally. |
| Night Shift consolidation (M15 §23.4) | Calibration is the natural Night-Shift job: off the hot path, over concluded Missions, producing a candidate the Principal can inspect. Outcome records "promote to firm-wide procedural memory only through Night Shift consolidation … Nothing self-promotes" — M26 keeps that property. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | Estimate error narrows measurably over 50 concluded Missions | ADR-0071; the walk-forward estimate-error metric (§4); the exit-criterion test (§19 AC1) |
| G2 | Every adjustment is inspectable — it traces to the outcome records that drove it | §6, §8; `calibration_runs` provenance; `inspect_calibration` (§10); AC3 |
| G3 | Any calibration is revertible — a revert restores prior parameters exactly | ADR-0069; versioned projection (§8); `revert_calibration`; AC4 |
| G4 | Nothing leaves the machine — no egress on the calibration path | ADR-0009; §13; no network dependency in the crate closure + runtime socket guard; AC5 |
| G5 | Calibration adjusts numeric parameters only — never a capability, Standard, or org chart | ADR-0070; §13.3; fixed numeric schema, no write path; AC6 |
| G6 | The safety structure of risk is invariant | §3.4, §7.3; reversibility & blast radius stay in `max`; floors never lowered; AC7 |
| G7 | A calibration that would not narrow held-out error is not applied | ADR-0071; §7.4 held-out guard; AC8 |
| G8 | Too few outcomes ⇒ no adjustment; absent history never lowers a score | §7.5; `M_min` sample floor; §11.5 rule 4 preserved; AC9 |
| G9 | Everything is additive — a null calibration is exactly pre-M26 behaviour | §8.5; identity parameters; AC10; mirrors M15 §20.3's null-`mission_id` |
| G10 | Calibration is off the hot path and bounded over 50+ Missions | §14; runs at conclusion / Night Shift; single-pass arithmetic; AC covered in §20 |

---

## 3. What calibration calibrates — the three targets and the boundary

Calibration touches exactly three families of numbers, named in the registry definition and in
`MISSION_ENGINE_ARCHITECTURE.md` §23.3. Each is a number the Mission Engine already computes from history;
M26 makes the history authoritative and the correction inspectable and revertible. Nothing else is in scope.

### 3.1 Estimates (duration, cost, effort)

The Mission Engine's `[task.estimate]` (§5.2) carries `cost_p50`, `cost_p90`, `duration_p50`, `duration_p90`,
and an effort figure, each citing a `source` (§23.5 rule 3). Calibration learns, per **Task signature**, a
multiplicative **correction factor** `c` and a **spread ratio** `s`:

```
calibrated_p50 = raw_p50 × c_sig            c_sig = median over matched outcomes of (actual / raw_p50)
calibrated_p90 = calibrated_p50 × s_sig     s_sig = calibrated from the observed p90/p50 dispersion
```

`c` corrects systematic **bias** (the heuristic under-estimates cost by a consistent factor); `s` corrects
**spread** (the p90/p50 ratio the schedule relies on — §10.2 uses p90 for critical-path back-propagation, so
a wrong spread produces a schedule "met roughly half the time," §10.3). Both are bounded (§7.2). A Task
signature with too few matched outcomes keeps `c = 1, s = raw` — the identity, i.e. exactly the pre-M26 raw
estimate (§7.5).

### 3.2 Novelty scores

Risk dimension 3 (§11.2) scores novelty 0–3 from the count `n` of successful comparable Task signatures in
procedural memory: `n ≥ 5 → 0`, `n = 0 → 3`. The interior (`n ∈ 1..4`) is where the mapping is soft.
Calibration adjusts the interior breakpoints from the observed relationship between comparable-count and
actual outcome variance — subject to invariants that are *not* calibrated:

- `n = 0 → 3` **always** (Unknown is not Low, §11.5 rule 4). The endpoint is fixed.
- The mapping is **monotonic non-increasing** in `n` (more successful precedent never raises novelty).
- A novelty score **never decreases without evidence** (§11.5 rule 2): a breakpoint moves down only when the
  matched outcomes support it, and never below the fixed endpoints.

### 3.3 Risk weights

Task risk (§11.3) is:

```
task_risk = max(reversibility, blast_radius)  ⊕  mean(specification, novelty, fragility, cost_variance)
```

Calibration replaces the equal-weight `mean` with a **weighted mean** whose four weights are learned from
which dimensions actually predicted materialised risk in the outcome records (§23.3: *"which [risks]
materialised, which were over-estimated"*):

```
weighted = (w_spec·specification + w_nov·novelty + w_frag·fragility + w_cost·cost_variance)
           where  Σw = 1  and  each w ≥ w_floor (default 0.10)
```

The `max(reversibility, blast_radius)` term, the `⊕` combinator, and the bands (0–3 Low … 10–12 Severe) are
**invariant under calibration**. Safety dominates through `max` and is never averaged away — the exact
property §11.3 and ADR-0033's reasoning both insist on. `w_floor` guarantees no dimension is ever zeroed out,
so a calibrated weight can never make a real risk dimension disappear.

### 3.4 The boundary, stated as a table

This is the line that separates M26 from every other 4.0 milestone. It is the content of ADR-0070.

| Calibration **may** adjust (numeric, revertible, auto-applied if it narrows) | Calibration **may never** touch (structural — a Principal Decision, M27/M29) |
|---|---|
| Estimate correction factor `c` and spread ratio `s` per signature | A capability grant or an `integration:*` scope |
| Interior novelty breakpoints (within fixed endpoints) | A `[capabilities].forbidden` set (a permanent self-denial) |
| The four `mean`-dimension risk weights (bounded, sum to 1) | A Standard, a Guard, or a review-intensity setting |
| — | The `max(reversibility, blast_radius)` safety term, or any risk band |
| — | The org chart: adding, removing, or restructuring a department |
| — | Any Charter field, effect ceiling, or budget ceiling |

Everything in the left column is a number the Firm uses to *estimate its own work*. Everything in the right
column changes what the Firm may *do*, *see*, or *be shaped like* — and that is a Decision under Principle 14,
with criteria, a reversibility class, recorded dissent, and a review date (`/docs/03-decision-engine.md`). The
right column has no code path in `sidra-calibration` at all; the separation is structural, not a policy the
crate promises to honour (§13.3, AC6).

---

## 4. The estimate-error metric (ADR-0071)

The exit criterion says error "narrows measurably." *Measurably* requires a defined metric. This section is
that definition; ADR-0071 records the decision behind it.

### 4.1 The per-sample error

For each concluded Mission `m` and each estimand `k ∈ {cost, duration, effort}`, at each Task, an
**estimate-error sample** is the signed relative error of the frozen plan estimate against the actual:

```
r(m,k) = (actual(m,k) − ê_p50(m,k)) / max(ê_p50(m,k), ε_k)
abs(m,k) = |r(m,k)|
```

- `ê_p50` is the **frozen** p50 estimate from the authorised plan version — never the mutated one. Plans are
  immutable versioned artifacts (`MISSION_ENGINE_ARCHITECTURE.md` ADR-0023); the sample cites the plan version
  it evaluated, exactly as verification evidence cites the artifact hash (§12.3 rule 4).
- `ε_k` is a small per-estimand floor (`cost` = $0.01, `duration` = 1 s, `effort` = 1 unit) that bounds
  relative error when the estimate is near zero. It is a declared constant, not a tuned one.
- `actual` comes from the outcome record (`cost_actual`, duration actual, effort actual — §22.3, §23.3).

### 4.2 The aggregate metric

Over a set `S` of samples:

```
EE(S)            = median over S of abs           # the estimate-error metric — robust, not a mean
bias(S)          = median over S of r             # signed: detects systematic over/under-estimation
band_coverage(S) = fraction of S with actual ≤ ê_p90   # a well-calibrated spread lands near 0.90
```

**Median, not mean** — for the same reason §11.3 uses `max` for safety and ADR-0033 rejects a "permissiveness
score": one wild Mission (F15) must not dominate the metric, and a single poisoned record must not move it far
(§13, TC-3). `bias` is the quantity `c` corrects; `EE` is the quantity that must narrow; `band_coverage` is
what `s` corrects.

### 4.3 Walk-forward, and the exit criterion made precise

Error is measured **walk-forward** — no lookahead. Process the 50 concluded Missions in conclusion order.
For each Mission `m`, the estimate error attributed to it uses the calibration parameters **as of the moment
just before `m` concluded**, i.e. computed only from Missions that concluded earlier. A calibration that could
see `m`'s actual before scoring `m` would trivially "narrow" error and prove nothing.

The exit criterion is then a comparison of two disjoint windows of size `W` (default `W = 25`, so the
first and last halves of 50):

```
NARROWED  ⟺  EE(last W)  ≤  (1 − δ) × EE(first W)          δ = declared margin, default 0.10
```

The calibration **narrows measurably** when the walk-forward estimate error over the most recent `W` Missions
is at least `δ` (10%) below the error over the first `W`, with calibration active — and the same fixture with
calibration *disabled* shows no such narrowing. `δ` and `W` are declared parameters recorded in the run, not
magic numbers; the acceptance fixture (§20.1) injects a known systematic bias so the true reduction is large
and the test is unambiguous. This is AC1, and it is the last thing to go green (§21, E7).

---

## 5. Calibration run lifecycle

### 5.1 States

A calibration run is a short-lived, deterministic pipeline. The *parameters* it produces are long-lived and
versioned (§8); the *run* moves through these states and terminates.

```
        run_calibration(window)          ← Night Shift, or a Principal-triggered Decision
  ─────────────────────────────────►  GATHERING
                                          │  read concluded-Mission outcome records → error samples
                              ┌───────────┴────────────┐
                  ≥ 1 estimand reaches M_min      too few outcomes (no estimand ≥ M_min)
                              ▼                          ▼
                          COMPUTING                  INSUFFICIENT
                              │                     (terminal; nothing computed,
                              │                      identity retained — §7.5, F1)
                              │  candidate parameter set: corrections, novelty map, risk weights
                              │  (clamped; signatures with < M_min samples held at prior)
                              ▼
                          BACKTESTING
                              │  walk-forward EE(before) vs EE(after) on held-out Missions
                              ▼
                  ┌───────────┴────────────┐
        narrows by ≥ δ                not narrowed / worse
                  ▼                          ▼
              APPLIED                    REJECTED
       (new active version)      (candidate recorded, NOT activated;
                  │                prior version stays active)
                  ▼                          │
            INSPECTABLE ◄───────────────────┘   (both outcomes are inspectable)

  Later, a separate Principal Decision may revert an APPLIED version:
              APPLIED ──── revert_calibration(prior) ───► REVERTED   (prior version re-activated, exactly)
```

### 5.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `run_calibration` | Gathering | ≥ 1 concluded Mission with an outcome record exists |
| Gathering | samples materialised | Computing | at least one estimand reaches `M_min` samples |
| Gathering | too few outcomes | Insufficient | no estimand reaches `M_min`; terminal, nothing computed, the identity is retained (§7.5, F1) — records `Insufficient{needed, had}` |
| Computing | candidate built | Backtesting | candidate is well-formed; clamps applied; `M_min` respected |
| Backtesting | `EE(after) ≤ (1−δ)·EE(before)` | Applied | held-out error narrows by the declared margin |
| Backtesting | otherwise | Rejected | candidate does **not** narrow held-out error — not activated |
| Applied \| Rejected \| Insufficient | (record provenance) | Inspectable | run + adjustments + metrics written to the log |
| Applied | `revert_calibration(v)` | Reverted | a prior version `v` exists; a separate Principal Decision |

### 5.3 Invariants

1. **No parameter version becomes active except through `Applied`.** A `Rejected` candidate is recorded in
   full (so a Principal can see what was proposed and why it was refused) but never activates. There is no
   state in which unproven parameters govern planning.
2. **The prior version is never destroyed.** `Applied` supersedes; it does not overwrite. `Reverted`
   re-activates a retained version. History of parameters is append-only, exactly as the event log is
   (ADR-0002). Revert is exact by construction because the prior version is still there, byte for byte.
3. **A run is a pure function of the outcome records it read plus the declared constants.** Two runs over the
   same records and constants produce the same candidate. This is what makes the projection rebuildable
   (§8.4, AC12) and the metric reproducible.

---

## 6. Domain model

### 6.1 Core types

```
MissionId(String)              // from the Mission substrate (M15)
TaskSignature(String)          // a stable shape key for "this kind of Task" (M15 §11.2 comparable signatures)
Estimand(enum)                 // Cost | Duration | Effort
EstimateSource(enum)           // Department | Historical | Heuristic  (M15 §23.5 rule 3)
ParameterVersion(u64)          // monotonic; version 0 is the identity (pre-M26 behaviour)
CalibrationRunId(String)       // ULID
```

### 6.2 `OutcomeRecord` (read model — owned by M15, never written here)

The plan-versus-reality record from `MISSION_ENGINE_ARCHITECTURE.md` §23.3, read through the `mission_outcomes`
projection (§20.2). Calibration consumes it and never mutates it.

| Field | Meaning |
|---|---|
| `mission_id`, `concluded_at`, `plan_version` | identity of the concluded Mission and the frozen plan |
| `mission_shape` | objectives, task count, departments, contracts, risk profile |
| `plan_vs_reality` | estimated vs actual cost and duration, **per Task and Mission** |
| `risks` | which materialised, which were over-estimated |
| `task_signatures` | the comparable-signature keys the Tasks matched |
| `novelty_at_plan` | the novelty score each Task carried at APPRAISING |

### 6.3 `EstimateErrorSample` (materialised per concluded Mission × estimand × Task signature)

```
EstimateErrorSample {
    mission_id:      MissionId,
    plan_version:    u32,            // the frozen plan the estimate came from (immutable — ADR-0023)
    estimand:        Estimand,
    task_signature:  TaskSignature,
    source:          EstimateSource,
    estimate_p50:    f64,            // ê_p50, frozen
    estimate_p90:    f64,            // ê_p90, frozen
    actual:          f64,            // from the outcome record
    signed_rel_err:  f64,            // r(m,k)  (§4.1)
    abs_rel_err:     f64,            // |r|
    within_band:     bool,           // actual ≤ estimate_p90
    concluded_at:    Timestamp,      // for walk-forward ordering
}
```

One `EstimateErrorSample` is the atom of both the metric (§4) and the provenance (§8): every adjustment cites
the sample ids it aggregated. A sample's **id is its natural composite key** —
`(mission_id, plan_version, estimand, task_signature)` — which is deterministic and stable under rebuild
(AC12), so "the sample ids an adjustment aggregated" is reproducible without a synthetic identifier. A Mission
that ran the same task signature more than once contributes one sample per (estimand, task_signature) pair.

### 6.4 `CalibrationParameterSet` — versioned, the thing planning reads

```
CalibrationParameterSet {
    version:        ParameterVersion,        // 0 = identity (pre-M26)
    supersedes:     Option<ParameterVersion>,
    created_at:     Timestamp,
    created_by:     Actor,                   // system:calibration | the Principal (on a triggered run)
    run_id:         CalibrationRunId,
    active:         bool,                     // exactly one version is active at a time

    estimate_corrections: Map<TaskSignature, { c: f64, s: f64, sample_count: u32 }>,
    novelty_mapping:      [f64; 4],          // interior breakpoints for n∈1..4; endpoints fixed (§3.2)
    risk_weights:         { w_spec, w_nov, w_frag, w_cost: f64 },   // Σ=1, each ≥ w_floor (§3.3)
}
```

Version 0 is the **identity**: every `c = 1`, every `s` = the raw p90/p50, the novelty mapping equal to M15's
defaults, the risk weights equal (`0.25` each). A Firm that never runs a calibration reads version 0 forever
and behaves exactly as it did pre-M26 (§8.5, G9).

### 6.5 `CalibrationRun` — inspectable provenance

```
CalibrationRun {
    run_id:         CalibrationRunId,
    at:             Timestamp,
    actor:          Actor,
    trigger:        Trigger,                 // NightShift | PrincipalRequested
    window:         { from: Timestamp, to: Timestamp, mission_count: u32 },
    from_version:   ParameterVersion,
    to_version:     Option<ParameterVersion>,   // Some if Applied; None if Rejected
    outcome:        RunOutcome,                  // Applied | Rejected{reason} | Insufficient{needed, had}
    metric_before:  CalibrationMetric,
    metric_after:   CalibrationMetric,           // measured on held-out, walk-forward (§4.3)
    adjustments:    Vec<Adjustment>,
}

Adjustment {
    parameter_key:  String,          // e.g. "estimate.c[sig=deploy-service]" or "risk.w_cost"
    old_value:      f64,
    new_value:      f64,
    statistic:      f64,             // the median (or weight) computed
    sample_count:   u32,
    sample_ids:     Vec<SampleId>,   // the exact EstimateErrorSamples that produced `statistic`
    clamped:        bool,            // true if the raw statistic hit a bound (§7.2)
}

CalibrationMetric { ee: f64, bias: f64, band_coverage: f64, per_estimand: Map<Estimand, f64>, window_w: u32 }
```

`Adjustment.sample_ids` is the whole content of inspectability (G2): every applied number points back at the
records that justify it, and re-aggregating those samples reproduces `statistic` exactly (AC3).

### 6.6 Relationships

```
Mission (M15) 1 ──── 0..1 OutcomeRecord            (only a concluded Mission has one)
OutcomeRecord 1 ──── 1..n EstimateErrorSample      (one per estimand × Task)
CalibrationRun 1 ──── 1..n Adjustment
Adjustment     * ──── 1..n EstimateErrorSample     (the samples that drove it)
CalibrationRun 1 ──── 0..1 CalibrationParameterSet (a new version, iff Applied)
CalibrationParameterSet  n ──── 1 active           (exactly one active version)
CalibrationParameterSet.version = 0  ⟺  identity   (pre-M26 behaviour)
```

---

## 7. The calibration computation

### 7.1 One pass, no inference

A calibration run is arithmetic, not learning-with-a-capital-L. It reads the samples once, groups them by
signature and estimand, and computes medians. There is no model call, no gradient, no randomness — which is
why the run is a pure function (§5.3.3) and the result is reproducible and rebuildable. Determinism here is
not a nicety; it is what makes the projection auditable and the exit-criterion test stable.

### 7.2 Bounds — a single record cannot move a number far

Every computed statistic is clamped before it becomes a parameter:

| Parameter | Clamp | Reason |
|---|---|---|
| estimate correction `c` | `[1/K, K]`, `K = 4` | One 10× outlier Mission cannot 10× the estimate; the median already resists it, the clamp is the belt to that suspenders (§13 TC-3) |
| spread ratio `s` | `s ≥ 1.0` | p90 is never below p50; a degenerate sample cannot invert the spread |
| novelty breakpoints | within fixed endpoints, monotonic | §3.2 invariants |
| risk weight `w` | `w ≥ w_floor = 0.10`, `Σw = 1` | No dimension is ever zeroed out (§3.3) |

An adjustment that hit a clamp records `clamped = true` (§6.5), so a Principal inspecting the run sees exactly
where the data was pulling harder than the bounds allow.

### 7.3 Safety structure is an input, never an output

Calibration reads the safety structure of risk aggregation (§11.3) and never writes it. Concretely, the
computation:

- **never** moves `reversibility` or `blast_radius` out of the `max` term,
- **never** lowers the fixed novelty endpoint (`n = 0 → 3`),
- **never** produces a risk weight of 0,
- **never** changes a risk band boundary or the `⊕` combinator.

These are not runtime checks the code politely performs; they are the shape of the parameter schema (§6.4 has
no field for any of them), so the computation *cannot express* such a change (AC6, AC7).

### 7.4 The held-out narrowing guard

After computing a candidate parameter set, the run **backtests** it before applying it (§5, BACKTESTING). It
partitions the samples walk-forward (§4.3), applies the candidate to the held-out slice, and computes
`EE(after)`. The candidate is applied **only if** `EE(after) ≤ (1 − δ) × EE(before)`. Otherwise the run is
`Rejected`: the candidate is recorded in full for inspection, but the active version does not change. This is
the mechanism that makes "a calibration that would worsen error is not applied" a structural property (G7,
AC8, F2), and it is why calibration cannot make the Firm worse even in principle.

### 7.5 Too few outcomes ⇒ the identity

A signature or parameter with fewer than `M_min = 5` matched samples keeps its **prior** value (for a
never-calibrated signature, that is the identity: `c = 1`, `s = raw`). `M_min = 5` is not arbitrary — it is
the same threshold M15 uses for novelty ("done ≥ 5 times successfully" scores novelty 0, §11.2). This encodes
§11.5 rule 4 directly: **absent history raises risk, never lowers it.** A calibration run over a Firm with too
few concluded Missions is a well-formed no-op that records `Insufficient{needed, had}` and changes nothing —
which is exactly the pre-M26 state (F1).

---

## 8. Versioning, revert, and the projection (ADR-0069)

### 8.1 Parameters are a projection, not mutable state

The active `CalibrationParameterSet` is a **projection** derived from two append-only sources: the outcome
records (owned by M15) and the `CalibrationRun` log (owned here). It is state in the same sense the `missions`
table is state — "a convenience for querying; the truth is the events" (ADR-0002). Nothing mutates a parameter in
place; a calibration appends a new version and moves the `active` pointer, and a revert moves the pointer back.
(The "truth is the events" discipline is the append-only event log of ADR-0002.)

### 8.2 Applying a version

`Applied` writes a new `CalibrationParameterSet` with `version = prior + 1`, `supersedes = prior`, `active =
true`, and clears `active` on the prior. Both rows persist. The move is a single event (`CalibrationApplied`,
§11) on the hash chain, so "which parameters governed planning on date D" is answerable by reading the log.

### 8.3 Reverting a version — exact by construction

`revert_calibration(v)` re-activates a retained prior version `v`. Because no version is ever destroyed
(§5.3.2), revert restores the prior parameters **exactly** — there is no reconstruction, no re-computation, no
drift. It is a pointer move plus a `CalibrationReverted` event (§11). Revert is a Principal Decision
(`/docs/03-decision-engine.md`): it is logged, attributed, and permanent, and the reverted-from version stays
in history so the chain "calibrated → reverted → why" is one view (AC4).

### 8.4 Rebuildable

The active parameters are rebuildable from the outcome records plus the `CalibrationRun` log by replaying the
runs in order and applying the same clamps and guards (§7). "Rebuild and diff" is an assertion in the
integration tests, not a maintenance tool (ADR-0002 consequences; AC12). A projection bug is caught by the
diff, not discovered in production.

### 8.5 Additive — a null calibration is pre-M26 behaviour

Version 0 (the identity) exists from the first migration and is active until the first `Applied` run. A Firm
that never calibrates reads version 0 forever and plans with exactly the raw estimates, the M15 novelty
mapping, and the equal risk weights it used before M26. **A null calibration is a fully supported state, not a
migration artifact** — the same stance M15 takes for a null `mission_id` (§20.3) and M16 for a null grant.
This is what makes M26 purely additive (G9).

---

## 9. Component structure

```
                         ┌────────────────────────────────────────────────┐
  Night Shift  ─────────►│            sidra-calibration (Layer 3)          │
  or Principal           │                                                │
  run_calibration        │  Runner                                        │
                         │    │  1. gather outcome records → samples        │
                         │    ▼                                            │
                         │  Ingest ──► EstimateErrorSample (per Mission)   │
                         │    │                                            │
                         │    ▼  2. compute candidate (medians, clamps)     │
                         │  Compute (estimates · novelty · risk weights)    │
                         │    │                                            │
                         │    ▼  3. backtest walk-forward (held-out EE)      │
                         │  Metric ──► EE / bias / band_coverage            │
                         │    │                                            │
                         │    ▼  4. apply iff narrows, else reject           │
                         │  Store (versioned parameters · revert)          │
                         │    │                                            │
                         │    ▼  5. provenance + events                     │
                         │  Provenance (Adjustment ← sample_ids) · Audit    │
                         └────┼───────────────────────┬───────────────────┘
                              ▼                        ▼
                       sidra-store               sidra-security
                    (outcome records READ,     (command authorisation for
                     parameters/runs WRITE)     run/revert as Decisions; redaction)
                              │
                              ▼
                    ┌───────────────────────┐        NO network dependency anywhere in the
                    │  active parameters     │        crate's dependency closure (§13.1, AC5).
                    │  (a projection)        │        The read seam to planning:
                    └───────────┬───────────┘
                                ▼
                        sidra-mission (planning READS active_parameters — §23.2 seam)
```

Internal modules of `sidra-calibration`:

| Module | Responsibility |
|---|---|
| `ingest` | read `mission_outcomes`; materialise `EstimateErrorSample` per concluded Mission and estimand |
| `metric` | the estimate-error metric: `EE`, `bias`, `band_coverage`; walk-forward partitioning (§4) |
| `compute` | candidate parameters: estimate corrections, novelty mapping, risk weights; clamps and `M_min` (§7) |
| `store` | versioned `calibration_parameters`; apply/revert; projection rebuild (§8) |
| `provenance` | `CalibrationRun` + `Adjustment` with sample ids; `inspect_calibration` (§10) |
| `guard` | the held-out narrowing guard (§7.4); the no-egress runtime assertion (§13.1) |
| `runner` | the run pipeline (§5); serialisation of concurrent runs |

**Dependency direction (ADR-0011).** `packages/domain ← services/calibration ← apps/*`.
`services/calibration` depends on `services/store`, `services/security`, and `packages/domain`. It reads the
`mission_outcomes` projection through the store; it does **not** take a code dependency on `services/mission`'s
runtime, and `services/mission` reads the parameter projection through the store — so there is **no crate
cycle**, and the parameter store is the seam between them. Critically, `services/calibration` has **no**
dependency edge to `services/orchestrator`, `services/connectors`, or **any crate carrying a network client**
(`reqwest`/`hyper`/socket libraries). The absence of that edge is the compile-time half of the no-egress proof
(§13.1, AC5, AC13), enforced in CI exactly as the Mission Engine and Connector Framework enforce their own
forbidden edges.

---

## 10. Public APIs

### 10.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `run_calibration(window?) -> CalibrationRun` | a new version **iff** it narrows; else a recorded rejection | Night-Shift job or a Principal Decision; walk-forward; never uploads |
| `revert_calibration(to_version) -> CalibrationParameterSet` | Reverted | re-activates a retained prior version; exact; a Principal Decision |

There is no `apply` command. Application is internal to a run and gated by the held-out guard (§7.4) — a
Principal cannot force an unproven candidate active, because "narrows measurably" is the only path to active.

### 10.2 Queries

| Query | Returns |
|---|---|
| `active_parameters() -> CalibrationParameterSet` | the version planning reads (identity if never calibrated) |
| `inspect_calibration(version?) -> CalibrationRun + Adjustments` | every adjustment with old/new/statistic and its `sample_ids` |
| `estimate_error_report(window) -> CalibrationMetric×2` | `EE`/`bias`/`band_coverage` before vs after, per estimand (§4) |
| `list_calibration_runs() -> [CalibrationRun]` | full history, applied and rejected, with metrics |
| `list_parameter_versions() -> [ParameterVersion]` | the version chain, marking the active one |

### 10.3 API rules

1. **No API performs egress.** No command or query opens a network connection; the crate cannot, structurally
   (§13.1). Every method reads and writes the local database only. This is the ADR-0009 line, made an API
   invariant.
2. **No API changes a non-numeric thing.** Every write path targets `calibration_parameters`,
   `calibration_runs`, or `estimate_error_samples`. There is no method that writes a capability, a Standard, a
   Guard, or a department — the surface does not contain one (§13.3, AC6).
3. **`run` and `revert` are Decisions** — logged, attributed, and permanent (`/docs/03-decision-engine.md`). A
   run is a class-1 decision (a bounded, revertible parameter change); a revert is likewise. Neither can be
   silently issued and neither can be silently undone.
4. **A rejected candidate never governs planning.** `run_calibration` returning `Rejected` leaves
   `active_parameters()` unchanged. Inspection can see the rejected candidate; planning never reads it.
5. **`inspect_calibration` is total.** Every applied adjustment resolves to sample ids that reproduce its
   statistic; an adjustment with no traceable samples is a defect the projection-rebuild test catches (AC3,
   AC12).

---

## 11. Events

Every event carries `actor`, `run_id`, `from_version`/`to_version` where applicable, and lands on the existing
hash chain (ADR-0002). No new log; no event kind is ever removed or redefined (ADR-0002; the Mission Engine's projection-discipline rule).

| Event | Payload highlights |
|---|---|
| `EstimateErrorSampled` | mission_id, plan_version, estimand, task_signature, estimate p50/p90, actual, signed/abs error, within_band |
| `CalibrationRun` | run_id, trigger, window, from_version, outcome (`Applied`/`Rejected`/`Insufficient`), metric_before, metric_after, adjustment summary |
| `CalibrationApplied` | run_id, to_version, superseded version — the pointer move to a proven version |
| `CalibrationRejected` | run_id, reason (`would_not_narrow`), metric_before, metric_after — the candidate that did not earn activation |
| `CalibrationReverted` | run_id (of the revert), to_version, reverted_from version, actor (the Principal) |

`CalibrationRun` and `CalibrationReverted` are the two the exit criterion turns on: the first records that a
calibration happened, what it adjusted, and by how much error moved; the second records that it was undone,
exactly, to a named prior version. Both are hash-chained and both appear in `audit.verify` over a
calibration-lifecycle fixture (AC11).

---

## 12. Persistence

### 12.1 New tables — all projections (forward-only migrations, band `0057`–`0060`)

Mission migrations end at `0024`; the intervening milestones M16–M25 consume the band up to `0056`. M26's
additive migrations occupy **`0057`–`0060`**.

| Migration | Table | Purpose |
|---|---|---|
| `0057_calibration_parameters.sql` | `calibration_parameters` | versioned parameter sets: version, supersedes, active, created_by, run_id, estimate corrections (JSON `Map<TaskSignature,{c,s,count}>`), the inline `novelty_mapping` (`[f64;4]`) and `risk_weights` (four floats). **The authoritative, revertible projection** — the store of record for a parameter version (§6.4). |
| `0058_estimate_error_samples.sql` | `estimate_error_samples` | one row per concluded Mission × estimand × Task signature: plan_version, estimand, task signature, source, p50/p90, actual, signed/abs error, within_band, concluded_at. Natural key `(mission_id, plan_version, estimand, task_signature)`. Rebuildable from `mission_outcomes`. |
| `0059_calibration_runs.sql` | `calibration_runs` + `calibration_adjustments` | inspectable provenance: run, window, from/to version, outcome, metric before/after; per-adjustment old/new/statistic/sample_count and the sample ids that drove it. |
| `0060_calibration_weights.sql` | `calibration_weights` | a **denormalized read-projection** over the active parameter set — one row per `(version, risk dimension)` and per novelty breakpoint — for per-dimension inspection and version-to-version diffing. Derived from `0057`; `calibration_parameters` (§6.4) remains the single source of truth, never a second authoritative copy. |

All projections. All additive. No existing column changes meaning, no event kind is removed. Version 0 (the
identity) is seeded by `0057` so `active_parameters()` is well-defined from the first boot — a Firm with no
calibration run reads the identity and behaves exactly as pre-M26 (§8.5).

### 12.2 Retention

Calibration records are never deleted (Principle 3). `estimate_error_samples` and `calibration_runs` are the
evidence behind every parameter version; discarding them would make a version un-inspectable and un-rebuildable
(G2, G3). Under compaction (§20.6 of M15) the samples collapse into their run's summary statistic, but the
`sample_ids` and the outcome records they point at remain queryable indefinitely.

### 12.3 Vault Markdown mirror (the archive outlives the software)

```
~/Sidra/
└── calibration/
    ├── parameters.md        active version, its predecessors, the numbers — human-readable
    ├── runs/
    │   └── run_01J….md      what this run adjusted, from which Missions, error before/after
    └── error-report.md      EE / bias / band-coverage over the last window, per estimand
```

Written on state transitions (a run, an apply, a revert), not continuously. A Principal who abandons Sidra OS
keeps a readable record of every calibration, exactly which Missions moved which number, and how much the
Firm's estimate error changed — and, because the parameters are just numbers, nothing in the mirror is a
secret and nothing in it is a capability.

---

## 13. Security

Calibration is not effectful toward the outside world — it opens no socket, moves no money, writes no external
service. Its threat surface is different in kind: it is the surface where **local learning could leak** and
where **numeric drift could silently change behaviour**. Every mitigation below is either an application of
ADR-0009 or a structural property of the numeric-only schema.

### 13.1 Local only — the no-egress assertion

Two independent, redundant proofs, because ADR-0009 is the claim M26 is most likely to be accused of
weakening:

1. **Compile-time.** `sidra-calibration` has no network client anywhere in its dependency closure. A CI check
   walks the crate's transitive dependencies and fails the build on any HTTP/socket crate — the same shape of
   check that enforces the forbidden dependency edge (§9). A calibration that cannot link a network client
   cannot make a network call.
2. **Runtime.** The `guard` module installs a no-egress assertion around every calibration run: any attempt to
   open a socket during `run_calibration`, `revert_calibration`, or ingestion aborts the run and raises an
   audited failure. A Principal can verify the claim with a packet capture (ADR-0009's own standard: *"the
   verifiability is the point"*).

Outcome records, error samples, and parameters are excluded from any automatic export. They enter a
diagnostics bundle only through the Principal's explicit, redacted, previewed, Principal-transmitted export
(ADR-0009) — never by the app, never automatically.

### 13.2 Threat table

| Threat | How M26 addresses it |
|---|---|
| **TC-1 — telemetry via calibration** (outcome/error data leaves the machine) | No network dependency in the crate closure (compile-time); runtime socket guard aborts a run that tries; samples/parameters excluded from auto-export; ADR-0009 governs (§13.1). |
| **TC-2 — calibration smuggles a capability / Standard / org-chart change** | The parameter schema is numeric-only (§6.4); no write path exists to any capability, Standard, Guard, or department table; the crate has no dependency on those write APIs; CI dependency check (§13.3, AC6). |
| **TC-3 — a poisoned or outlier outcome record skews a parameter** | `EE`/adjustments use the **median**, not the mean (§4.2); corrections are clamped to `[1/K, K]` (§7.2); `M_min = 5` samples required before any adjustment (§7.5); the held-out narrowing guard rejects a candidate that does not improve (§7.4); and any applied change is revertible (§8.3). |
| **TC-4 — an un-revertible black box** | Parameters are a versioned projection; no version is destroyed; revert re-activates a retained version exactly (§8.3); every adjustment traces to its sample ids (§6.5); rebuild-and-diff asserts the projection (AC12). |
| **TC-5 — calibration lowers a safety floor** (novelty endpoint, risk `max`, a zeroed weight) | The safety structure is not in the schema (§7.3); the novelty endpoint `n=0 → 3` is fixed; reversibility and blast radius never leave `max`; `w ≥ w_floor` so no dimension is zeroed; the Security Office's unilateral risk raise (§11.5 rule 3) is unaffected because calibration adjusts weights, not the Office's authority (AC7). |
| **TC-6 — self-promotion** (calibration makes the Firm bolder over time) | Calibration narrows *estimate error*; it does not widen a capability or relax a rule (TC-2); "risk never decreases without evidence" and "unknown is not Low" are inputs, not casualties (§7.5); the propose-not-enact constraint of 4.0 is honoured because calibration changes numbers, and structural change is a Principal Decision (M27/M29). |

### 13.3 Calibration cannot widen a capability or relax a Standard

This is worth stating as its own assertion because it is the 4.0 constraint applied to M26. The parameter
schema (§6.4) has fields for estimate corrections, a novelty mapping, and risk weights — and **no field for
anything else**. There is no `capability`, no `forbidden`, no `standard`, no `guard`, no `department`, no
`effect_ceiling`, no `budget`. A calibration run therefore *cannot express* a change to any of them: not
because a check forbids it, but because the type it writes has nowhere to put it. Widening what the Firm may do
is a Decision under Principle 14, and it lives in M27 (charter evolution, gated by evaluation sets) and M29
(structure review, "may propose, never enact") — never here (ADR-0070, AC6).

---

## 14. Performance and the hot path

- **Off the hot path.** A calibration run is a Night-Shift job (M15 §23.4) or an explicit Principal-triggered
  Decision. It never runs inside the Mission scheduler loop, so the scheduler's determinism (§17.1) is
  untouched. A run's cost is not charged against any Mission budget; it is infrastructure, like projection
  rebuild.
- **Bounded over 50+ Missions.** Ingestion is a single pass over the concluded-Mission outcome records
  (`O(N)` samples); the metric is a median (`O(N)` with selection, `O(N log N)` naive); the walk-forward
  backtest is one ordered pass. At the exit-criterion scale (50 Missions, a few estimands and signatures each)
  a run is milliseconds of arithmetic over a few thousand rows. There is no super-linear term and no model
  call.
- **Planning reads are constant-time.** The Mission Engine reads `active_parameters()` — a single indexed
  lookup of the active version — once per plan. Calibration adds **no** per-plan model call and no per-Task
  network round-trip; it replaces a heuristic constant with a looked-up constant (§23.2's "replaces heuristic
  estimates with measured ones", now literally true).
- **Concurrent runs are serialised.** The `active` pointer moves under a single writer; a run reads a
  consistent snapshot of samples. Two runs cannot race the active version (F6).

---

## 15. Sequence diagrams

### 15.1 The exit-criterion path — 50 Missions, measured, inspected, reverted

```
Fixture(50 concluded Missions)   Calibration        Store            Principal
        │  (outcome records exist, local)  │            │                │
        │                          │  ingest → samples  │                │
        │                          ├───────────────────►│                │
        │                          │  EE(first W) = baseline (walk-forward, calibration OFF)
        │                          │                    │                │
        │   run_calibration(window)│                    │                │
        │─────────────────────────►│  compute candidate │                │
        │                          │  (medians, clamps, M_min)           │
        │                          │  backtest held-out: EE(after) ≤ (1−δ)·EE(before)?
        │                          │           YES → Applied (version n+1)│
        │                          ├── write version n+1, active ────────►│
        │                          │  emit CalibrationRun + CalibrationApplied (hash chain)
        │                          │                    │                │
        │   EE(last W) measured    │  EE(last W) ≤ (1−δ)·EE(first W)  →  NARROWED ✔  (AC1)
        │                          │                    │                │
        │      inspect_calibration(n+1)                 │                │
        │─────────────────────────►│  Adjustment{old,new,statistic,sample_ids}
        │◄─────────────────────────┤  every number traces to its Missions (AC3)
        │                          │                    │                │
        │      revert_calibration(n)│  re-activate version n (retained, exact)
        │─────────────────────────►├── move active → n ─────────────────►│
        │                          │  emit CalibrationReverted (hash chain)
        │◄──── parameters == pre-run snapshot, byte for byte (AC4) ──────┤
```

### 15.2 A run that would worsen error — rejected, not applied

```
Calibration        Store
   │  ingest → samples (one poisoned outlier included)
   │  compute candidate (median + clamp bound its influence)
   │  backtest held-out:  EE(after) > (1−δ)·EE(before)   →  does NOT narrow
   │  outcome = Rejected{would_not_narrow}
   ├── record CalibrationRun (Rejected) + candidate, do NOT move active ──►│
   │  emit CalibrationRejected (hash chain)
   │  active_parameters() unchanged — planning never reads the candidate (AC8, F2)
```

### 15.3 Planning reads the calibrated parameters (the seam)

```
Mission Engine (planning)     Store (active parameters)
   │  APPRAISING a new Mission          │
   │  read active_parameters() ────────►│  version n (or 0 = identity if never calibrated)
   │◄── c/s per signature, novelty map, risk weights ──┤
   │  calibrated_p50 = raw_p50 × c_sig ;  novelty via map ;  risk mean via weights
   │  estimate source annotated `historical` where a correction applied (§23.5 rule 3)
   │  (a null calibration → version 0 → identical to pre-M26 planning — G9)
```

---

## 16. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | **Too few outcomes** — fewer than `M_min` samples for a signature, or fewer than 50 concluded Missions total | The run is a well-formed no-op: signatures below `M_min` keep the identity (§7.5); the run records `Insufficient{needed, had}`; parameters unchanged; exactly pre-M26 behaviour (G8, AC9). |
| F2 | **A calibration that would worsen error** | The held-out narrowing guard (§7.4) computes `EE(after) > (1−δ)·EE(before)`; the candidate is `Rejected`, recorded for inspection, and **not activated**; the active version is unchanged and remains revertible (G7, AC8). |
| F3 | **Attempted egress on the calibration path** | Structurally impossible — no network client in the crate closure (compile-time); the runtime socket guard aborts the run and raises an audited failure if anything tries (§13.1, AC5). |
| F4 | **A poisoned or outlier outcome record** | Median (not mean) + clamp `[1/K,K]` + `M_min` + the held-out guard bound its influence; any applied change is revertible (§13 TC-3, AC8). |
| F5 | **Calibration attempts a non-numeric change** (capability/Standard/org) | No such write path exists; the parameter schema has no field for it; the crate has no dependency on those write APIs; CI dependency check fails a hypothetical edge (§13.3, AC6). |
| F6 | **Concurrent calibration runs** | Serialised; the `active` pointer moves under one writer; each run reads a consistent sample snapshot; no interleaving can activate two versions. |
| F7 | **Projection drift** — the parameter table disagrees with the run log | Rebuild-and-diff replays the runs and asserts the active parameters match; a mismatch fails the integration test (ADR-0002 discipline, AC12). |
| F8 | **A revert to a version that produced worse estimates** | Allowed and recorded — revert is a Principal Decision (§8.3); the Principal may revert to any retained version; the chain "calibrated → reverted" is inspectable, and re-running calibration is always available. |

---

## 17. Risks

| # | Risk | Mitigation |
|---|---|---|
| CR-1 | Calibration becomes a de-facto telemetry channel through a careless export | Samples/parameters excluded from auto-export; explicit, redacted, previewed, Principal-transmitted export only; no-egress runtime guard; CI closure check (§13.1) |
| CR-2 | Numeric drift silently changes behaviour a Principal did not intend | Every applied change is inspectable to its samples (G2) and revertible exactly (G3); the held-out guard blocks any change that does not measurably help (G7); planning annotates a corrected estimate's source as `historical` (§15.3) |
| CR-3 | A safety floor erodes over many small calibrations | Safety structure is not in the schema (§7.3); floors are fixed endpoints; `w_floor` prevents a zeroed dimension; the invariants are tested before/after calibration (AC7) |
| CR-4 | The metric is gamed — "narrows" on the training window but not in reality | Walk-forward, no lookahead (§4.3); held-out backtest (§7.4); the exit-criterion test also asserts the calibration-OFF fixture does *not* narrow, so the effect is attributable to calibration (AC1) |
| CR-5 | Calibration accretes into structural change over the 4.0 milestones | ADR-0070 draws the numeric-only boundary explicitly; M27/M29 own structural change and require a Principal Decision; M30 hardening re-audits every feedback loop (registry §4) |
| CR-6 | Migration breaks a pre-M26 Firm | Forward-only, additive; version 0 seeded at `0057`; null calibration = pre-M26 behaviour; each migration independently deployable (G9) |

---

## 18. Dependencies, assumptions

### 18.1 Dependencies

| On | For |
|---|---|
| **M15 — Mission Engine** | the outcome records (§23.3), the estimate model (§5.2, §11), the novelty dimension (§11.2), the risk aggregation (§11.3), and the `active_parameters()` read seam at planning (§23.2). **The sole hard dependency** (registry §5, dependency 1). |
| M2 — event log | `CalibrationRun`/`CalibrationReverted` and the sample events on the existing hash chain |
| M3 — Permission Broker, redaction | authorising `run`/`revert` as Decisions; redaction on any write path (defence in depth, though calibration handles no secret) |
| ADR-0009 | the governing no-telemetry constraint the whole subsystem is shaped around |
| ADR-0002 | the projection discipline that makes parameters rebuildable and revert exact |

### 18.2 Assumptions

1. **The exit criterion is proven against a fixture of 50 concluded Missions**, not against a live Firm's
   history — the fixture (§20.1) is deterministic and injects a known bias so narrowing is unambiguous. A live
   Firm reaches the same property once it concludes 50 Missions of comparable signature.
2. **Outcome records are well-formed** — M15 guarantees a concluded Mission produces one (§23.3). Calibration
   reads them; it does not repair them.
3. **The Mission Engine reads `active_parameters()` at plan time** — this is an additive read against the
   projection store (the §23.2 seam), not a change to the Mission Engine's authority or state machine. Before
   M26, that read returns version 0 (the identity), which is pre-M26 behaviour.
4. **Comparable Task signatures are stable enough to aggregate** — M15 §11.2 already relies on this for
   novelty scoring; M26 inherits the assumption, and a signature with too few matches simply keeps the
   identity (§7.5).

---

## 19. Acceptance criteria

The exit criterion — *"Estimate error narrows measurably over 50 concluded Missions; the calibration is
inspectable and revertible"* — decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | **Estimate error narrows measurably over 50 concluded Missions**: `EE(last W) ≤ (1−δ)·EE(first W)` walk-forward with calibration on, and no such narrowing with calibration off | the exit-criterion test over the 50-Mission fixture (§20.1) — the last thing green |
| AC2 | The estimate-error metric is defined and stable: `EE` = median absolute relative error with per-estimand floors, computed walk-forward (§4) | property test over synthetic samples; ADR-0071 |
| AC3 | **Inspectable**: every applied adjustment resolves to the exact outcome-record sample ids that produced its statistic, and re-aggregating those samples reproduces the statistic | provenance test asserting `statistic == recompute(sample_ids)` for every adjustment |
| AC4 | **Revertible**: `revert_calibration(prior)` restores the prior `CalibrationParameterSet` byte-for-byte | snapshot-equality test comparing post-revert parameters to the pre-run snapshot |
| AC5 | **Nothing leaves the machine**: no network client in the crate closure (CI) and a run aborts on any socket open (runtime) | dependency-closure CI check + runtime no-egress harness |
| AC6 | **Numeric only**: calibration cannot write a capability, Standard, Guard, or department field | schema + dependency-direction check; a test asserting no such write path exists |
| AC7 | **Safety structure invariant**: reversibility and blast radius remain in `max`; `n=0 → 3` fixed; no risk weight reaches 0 | risk-aggregation test comparing structure before and after a calibration |
| AC8 | **Worsening guard**: a candidate whose held-out `EE` does not narrow is `Rejected` and the active version is unchanged | poisoned-fixture test asserting `CalibrationRejected` and unchanged `active_parameters()` |
| AC9 | **Too few outcomes ⇒ identity**: a signature/parameter with `< M_min` samples keeps its prior value; a run over too few Missions records `Insufficient` and changes nothing | insufficient-sample test |
| AC10 | **Additive / null calibration**: a Firm with no calibration run plans with identical estimates, novelty scores, and risk weights to pre-M26 | identity-parameter test against a pre-M26 planning fixture |
| AC11 | Every run/apply/reject/revert is an audited event on the hash chain | `audit.verify` over a calibration-lifecycle fixture |
| AC12 | The active parameters are rebuildable from the outcome records + the run log (rebuild-and-diff) | projection-rebuild test asserting equality with the live projection |
| AC13 | `services/calibration` has no dependency edge to `services/orchestrator`, `services/connectors`, or any network crate | dependency-direction CI check; build fails on a hit |

---

## 20. Testing strategy

### 20.1 The 50-Mission fixture

A deterministic fixture of **50 concluded Missions** with synthetic outcome records, seeded so that the
heuristic estimator carries a **known systematic bias** (e.g. cost under-estimated by a consistent factor and
a too-narrow spread). The fixture is fully local, contains no secret, and is the substrate for AC1, AC2, and
AC12. Because the injected bias is known, the true narrowing is large and the `EE(last W) ≤ (1−δ)·EE(first W)`
assertion is unambiguous — and the same fixture with calibration disabled shows no narrowing, so the effect is
attributable to calibration and not to the fixture (CR-4).

### 20.2 The properties

| Property | Test |
|---|---|
| **Error-narrowing** | walk-forward `EE` over the last `W` Missions is `≤ (1−δ)` of the first `W`, calibration on; flat, calibration off (AC1) |
| **Metric stability** | `EE`/`bias`/`band_coverage` match hand-computed values on a tiny sample set; per-estimand floors bound near-zero estimates (AC2) |
| **Inspection totality** | for every applied adjustment, `recompute(sample_ids) == statistic` (AC3) |
| **Revert exactness** | pre-run snapshot `==` post-revert parameters, byte for byte (AC4) |
| **Worsening guard** | a poisoned fixture yields `Rejected` and an unchanged active version (AC8) |
| **Insufficient samples** | `< M_min` ⇒ identity retained; `< 50` Missions ⇒ `Insufficient`, no change (AC9) |
| **Additivity** | version-0 planning == pre-M26 planning on a shared fixture (AC10) |
| **Safety invariance** | risk `max` term, novelty endpoint, and non-zero weights hold before and after (AC7) |
| **Rebuild-and-diff** | replay runs → active parameters == live projection (AC12) |
| **No egress** | runtime socket guard aborts a run that opens a socket (AC5) |

### 20.3 What is out of scope for M26 tests

- M27 charter evolution, M28 procedural compilation, M29 self-review — these *consume* the calibration
  substrate; they are not exercised here.
- A live-history proof — the exit criterion is a fixture property (§18.2 assumption 1); a live Firm reaches it
  by concluding Missions.

---

## 21. CI requirements

| Check | Gate |
|---|---|
| **No-egress (compile-time)** | `sidra-calibration`'s transitive dependency closure contains no HTTP/socket crate; build fails on a hit (AC5) |
| **No-egress (runtime)** | the no-egress harness runs a calibration under a socket guard; a socket open fails the test (AC5) |
| **Revert-exactness** | the snapshot-equality test runs on every build; a byte-level mismatch fails (AC4) |
| **Dependency direction** | no edge `sidra-calibration → sidra-orchestrator`, `→ sidra-connectors`, or `→ sidra-mission` runtime; the parameter store is the only seam (AC13) |
| **Numeric-only** | a check that the crate has no dependency on capability/Standard/department write APIs; the parameter schema exposes no non-numeric field (AC6) |
| **Rebuild-and-diff** | the projection-rebuild test asserts active parameters equal the replay (AC12) |
| **Migrations forward-only** | `0057`–`0060` are additive, idempotent, independently deployable; version 0 seeded (G9) |

---

## Appendix A — Glossary additions

- **Outcome record** — the post-conclusion comparison of plan against reality, written to procedural memory at
  `mission.concluded` (M15 §23.3). The sole input to calibration. Read locally, never uploaded.
- **Calibration** — the deterministic, local, off-the-hot-path pass that reads outcome records and produces a
  versioned, revertible set of numeric corrections to estimates, novelty scores, and risk weights.
- **Estimate-error metric (`EE`)** — the median absolute relative error of frozen plan estimates against
  actuals, per estimand, computed walk-forward (§4). The quantity the exit criterion requires to narrow.
- **Estimate-error sample** — one signed relative error of an estimand for one concluded Mission; the atom of
  both the metric and the provenance.
- **Calibration parameter set** — a versioned row of numbers (estimate corrections, novelty mapping, risk
  weights) that planning reads. Version 0 is the identity (pre-M26 behaviour).
- **Calibration run** — one pipeline execution: gather → compute → backtest → apply|reject → inspectable →
  revertible. Applied only if it narrows held-out error.
- **Held-out narrowing guard** — the walk-forward backtest that refuses to activate a candidate that does not
  measurably reduce error (§7.4).
- **Identity parameters** — version 0: every correction is a no-op, so planning behaves exactly as it did
  before M26. A null calibration.

## Appendix B — Repository placement

```
services/
└── calibration/                 NEW — crate sidra-calibration
    ├── ingest
    ├── metric
    ├── compute
    ├── store
    ├── provenance
    ├── guard
    └── runner

packages/domain/                 EXTENDED — Estimand, EstimateSource, ParameterVersion, calibration value objects

services/store/migrations/       EXTENDED — 0057_calibration_parameters.sql … 0060_calibration_weights.sql (forward-only)

infrastructure/testing/
└── calibration/                 NEW — 50-Mission fixture, error-narrowing, revert-exactness, no-egress, rebuild-and-diff

infrastructure/ci/               EXTENDED — no-egress closure check, dependency-direction check, numeric-only check
```

Dependency direction (ADR-0011): `packages/domain ← services/calibration ← apps/*`. `services/calibration`
depends on `services/store`, `services/security`, `packages/domain`; it does **not** depend on
`services/orchestrator`, `services/connectors`, `services/mission` (runtime), or any network crate. The
parameter projection is the only seam between calibration and planning.

## Appendix C — Implementation position

M26 is the **first milestone of 4.0 "Continuum"** — the release in which the Firm improves itself, gated by
evaluation sets, under one rule: *nothing self-promotes; the Firm proposes, the Principal confirms* (registry
§4). M26 is the **measurement substrate** of that release: the loop that M27 (charter evolution), M28
(procedural compilation), and M29 (self-review) all build on. It depends on **M15** alone (registry §5,
dependency 1): *"M26 cannot precede M15 — calibration needs outcome records, the plan-versus-reality data that
only Missions produce. Without them, 'the Firm learns' means the Firm adjusts numbers on the basis of
nothing."*

M26 is deliberately the *narrowest* 4.0 capability: it changes **numbers**, not structure. It is revertible
and inspectable precisely so the milestones that follow — which change charters and structure and therefore
require a Principal Decision — inherit a substrate whose every adjustment is already traceable and already
undoable. Building the structural milestones on an un-inspectable or un-revertible measurement loop would be
the mistake 4.0's propose-not-enact constraint exists to prevent.

**Exit criterion.** Estimate error narrows measurably over 50 concluded Missions — a defined metric (§4)
proven by test (AC1) — and the calibration is inspectable (every adjustment traces to its outcomes, AC3) and
revertible (a revert restores prior parameters exactly, AC4). Local only: nothing leaves the machine (AC5).
