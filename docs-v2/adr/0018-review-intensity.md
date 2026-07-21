# ADR-0018 — Review Intensity as a firm-wide setting

**Status:** Accepted · **Date:** v2 design phase · **Source:** `production/review-mode.txt` in
Claude-Code-Game-Studios

## Context

ADR-0008 mandates that the author never reviews their own work. Correct, non-negotiable, and silent on a
question that matters at scale: *how many optional reviews should run?*

At eleven agents the answer was implicit — few enough that it did not matter. At twenty-one departments with
four Offices and per-department gates, the difference between reviewing at every step and reviewing at
milestones is a substantial fraction of the Firm's cost and latency. A Principal prototyping wants speed; a
Principal shipping to a regulated client wants every gate. Both are legitimate and the system currently has
no way to express the difference.

CCGS had shipped the answer: one word in `production/review-mode.txt` — `full`, `lean`, or `solo` — with a
`--review` per-run override, and `lean` as the default.

## Options

1. **Fixed review depth.** No setting. Either too slow for prototyping or too loose for shipping; the
   Principal routes around it by disabling things individually, which is worse.
2. **Per-department configuration only.** Flexible, and it produces twenty-one settings to keep consistent,
   and a Firm whose review posture is different in every room for no reason anyone remembers.
3. **A firm-wide setting with per-Engagement override**, adopting CCGS's model.
4. **Adaptive review** — the Firm learns how much review each work type needs. Attractive, and it is 4.0
   "Continuum" material: it needs a corpus of outcomes that does not exist at 2.0, and shipping it early
   would mean guessing.

## Decision

Option 3, with one change from the source.

Three modes: **`full`** (every optional gate runs), **`standard`** (Office reviews plus stage gates —
default), **`lean`** (stage gates only; Office reviews only where a manifest marks them required).

Set firm-wide; overridable per Engagement and per department at install.

**There is no `solo` mode.** CCGS's `solo` disables all director gates, which is safe there because a human
approves every file write. Sidra runs autonomously within Fences, and no mode may disable ADR-0008: **every
Deliverable has one independent reviewer in every mode**, including `lean`.

Security Office reviews are not subject to Review Intensity at all. A class-3 effect is reviewed in every
mode.

## Consequences

**Accepted: a setting that can be set wrong.** A Principal on `lean` for months accumulates less review than
they think they have. Mitigated by showing the current mode in the Ledger Line and naming it in the Brief
whenever a Deliverable shipped with reduced review.

**Accepted: three modes is a coarse instrument.** Real needs vary by work type, not by Firm. The per-department
and per-Engagement overrides soften this; adaptive review in 4.0 is the actual answer.

**Accepted: divergence from the source.** CCGS users expect `solo`. Its absence needs explaining to anyone
arriving from that repository, and the explanation is in the analysis document rather than buried here.

**Gained: review cost becomes a dial rather than a fixed tax.** Directly mitigates R-03, and gives the
Principal a legitimate answer to "why is this slow" that is not "disable a safety feature".

**Gained: ADR-0008 stays absolute.** The distinction between *how much* review and *whether* review is drawn
explicitly, so no future performance work can quietly cross it — which is exactly what a mode called `solo`
would have permitted after one bad week.

**Gained: prototyping and shipping are both first-class.** A Firm that only supports one posture will be
routed around when the other is needed.

**Reversal cost: low.** Removing the setting means pinning to `standard`, which is one line.
