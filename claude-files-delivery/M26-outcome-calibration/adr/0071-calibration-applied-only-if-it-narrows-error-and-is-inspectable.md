# ADR-0071 — A calibration is applied only if it measurably narrows error, and every adjustment is inspectable

**Status:** Proposed · **Date:** M26 architecture phase (4.0 "Continuum")

## Context

M26's exit criterion is that *estimate error narrows measurably over 50 concluded Missions; the calibration is
inspectable and revertible.* Two words in that sentence carry weight and need mechanism behind them.
**Measurably** demands a defined metric and a defined bar — otherwise "the estimates got better" is a claim
nobody can check and a poisoned record could fake. **Inspectable** demands that every applied number trace to
the exact outcome records that justify it — otherwise calibration is a black box whose effect a Principal
cannot audit, which is the failure 4.0 is gated against.

Two failure modes make this sharp. A calibration that can see a Mission's actual before scoring that Mission
would "narrow" error trivially and prove nothing (lookahead). And a single wild Mission — F15 in the Mission
Engine's own failure table, *"actual ≫ p90"* — or a single poisoned outcome record could move a naive
mean-based metric far enough to justify a bad adjustment. The metric and the apply-gate must be robust to both.

This ADR settles: **how is estimate error defined and measured, what bar must a candidate clear to be applied,
and what makes every applied adjustment auditable back to its evidence?**

## Options

1. **Apply every computed candidate; measure improvement after the fact on the training data.** Compute the
   medians, write them, then report the in-sample error reduction. Rejected: in-sample error always looks
   better (the parameters were fit to it), lookahead makes "narrows" meaningless, and a candidate that worsens
   real error still gets applied. This is the metric-gaming failure (CR-4).
2. **Mean absolute error, applied if the mean improves.** A defined metric and a bar, but the mean is dominated
   by one wild Mission (F15) and moved far by one poisoned record (TC-3). Rejected: the metric the exit
   criterion turns on must not be hostage to a single outlier, for the same reason §11.3 aggregates safety with
   `max` and ADR-0033 rejects a mean-based "permissiveness score."
3. **A robust, walk-forward metric with a held-out apply-gate and total provenance.** `EE` is the *median*
   absolute relative error of frozen plan estimates against actuals, with per-estimand floors, computed
   walk-forward (no lookahead — each Mission is scored using only parameters derived from earlier-concluded
   Missions). A candidate is applied **only if** its held-out error narrows by a declared margin
   `δ`; otherwise it is recorded and rejected, and the active version does not change. Every applied adjustment
   names the exact `EstimateErrorSample` ids it aggregated and the statistic it computed, and re-aggregating
   those samples reproduces the statistic exactly.**
4. **A learned/model-based scorer.** A richer error model, possibly with a confidence estimate. Rejected: it
   introduces inference, non-determinism, and a model call into a subsystem that must be a pure, reproducible,
   rebuildable function of the records it read (ADR-0069, architecture §5.3.3). Determinism here is what makes
   the projection auditable and the exit-criterion test stable.

## Decision

Option 3, in three parts.

**The metric (`EE`).** For each concluded Mission `m` and estimand `k ∈ {cost, duration, effort}` at each Task,
the per-sample signed relative error is `r = (actual − ê_p50) / max(ê_p50, ε_k)`, where `ê_p50` is the
**frozen** p50 from the authorised, immutable plan version (`MISSION_ENGINE_ARCHITECTURE.md` ADR-0023 — the
sample cites the plan version it evaluated), `actual` comes from the outcome record, and `ε_k` is a small
declared per-estimand floor (`cost` = $0.01, `duration` = 1 s, `effort` = 1 unit) that bounds relative error
near zero. Over a sample set `S`:

```
EE(S)            = median over S of |r|          # the estimate-error metric — robust, not a mean
bias(S)          = median over S of r            # signed: what the correction factor c corrects
band_coverage(S) = fraction of S with actual ≤ ê_p90   # a good spread lands near 0.90; what s corrects
```

**Median, not mean** — so one wild Mission (F15) cannot dominate the metric and a single poisoned record cannot
move it far (TC-3).

**Walk-forward, and the apply-gate.** Error is measured with **no lookahead**: the 50 Missions are processed in
conclusion order, and the error attributed to Mission `m` uses the parameters *as of just before `m`
concluded*. A candidate parameter set is **backtested** on a held-out, walk-forward slice before it is applied,
and is activated **only if**

```
EE(after) ≤ (1 − δ) × EE(before)        δ = declared margin, default 0.10
```

Otherwise the run's outcome is `Rejected{would_not_narrow}`: the candidate is recorded in full for inspection
but **the active version does not change**. There is no `apply` command — application is internal to a run and
gated only by this test, so a Principal cannot force an unproven candidate active. The exit criterion is the
same comparison over two disjoint trailing windows of size `W` (default 25): `NARROWED ⟺ EE(last W) ≤ (1−δ)·
EE(first W)`, with calibration on, and no such narrowing with calibration off. `δ` and `W` are declared
parameters recorded in the run, not magic numbers.

**Inspectability.** Every `Adjustment` records `old_value`, `new_value`, the `statistic` it computed, its
`sample_count`, and the exact `sample_ids` of the `EstimateErrorSample`s that produced it. `inspect_calibration`
is total: re-aggregating an adjustment's `sample_ids` reproduces its `statistic` exactly; an adjustment with no
traceable samples is a defect the projection-rebuild test catches (AC3, AC12).

Where this decision and the Mission Engine's estimate model (§5.2, §11) or outcome-record shape (§23.3) could be
read to disagree, **the Mission Engine governs.**

## Consequences

**Accepted: a candidate that does not clear the bar is thrown away, even if it might help in the long run.** The
held-out gate is strict: a calibration that does not narrow held-out error by `δ` is rejected outright, not
applied provisionally. Some genuinely-good adjustments below the margin are refused. This is the correct
trade — it guarantees calibration cannot make the Firm worse even in principle (G7, F2), and a rejected
candidate is still recorded, so the evidence is not lost and a later run over more Missions can revisit it.

**Accepted: the metric and gate add a backtest pass to every run.** A run is no longer just "compute medians and
write" — it must partition walk-forward, apply the candidate to the held-out slice, and compare. This is bounded
arithmetic (`O(N)` samples, one ordered pass; architecture §14) and off the hot path, but it is real work paid
on every calibration to make "measurably" true rather than asserted.

**Gained: "narrows measurably" is a test, not a judgement.** `EE(last W) ≤ (1−δ)·EE(first W)` walk-forward, with
the calibration-off fixture showing no narrowing, is a mechanical assertion (AC1) — the last thing to go green.
The effect is attributable to calibration and not to the fixture, because the same records with calibration
disabled do not narrow (CR-4).

**Gained: the metric is robust to poison and outliers by construction.** Median (not mean) plus the clamps
(`[1/K, K]`, `s ≥ 1`), the `M_min = 5` sample floor, and the held-out gate together bound any single record's
influence, and any applied change remains revertible (ADR-0069). One bad Mission cannot swing the Firm's
estimates (TC-3, F4).

**Gained: every applied number is auditable to its evidence.** `Adjustment.sample_ids` is the whole content of
inspectability: a Principal can see which Missions moved which number and re-derive the statistic themselves,
and rebuild-and-diff asserts the whole projection against the run log (AC3, AC12). "Inspectable" in the exit
criterion is a provenance test, not a promise.

**Reversal cost: low.** `δ`, `W`, `M_min`, `K`, and the `ε_k` floors are declared constants recorded in each
run; tuning them is a parameter change, not a schema change, and every past run remains reproducible from its
recorded constants. The one reversal that would be costly — dropping the walk-forward held-out gate — is not one
this milestone may make: it is the mechanism that makes "measurably" and "cannot make the Firm worse" true, and
removing it re-opens the exact failure 4.0's propose-not-enact constraint exists to prevent.
