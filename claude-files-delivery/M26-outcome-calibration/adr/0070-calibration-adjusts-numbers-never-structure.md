# ADR-0070 — Calibration adjusts numeric parameters only, never a capability, a Standard, or the org chart

**Status:** Proposed · **Date:** M26 architecture phase (4.0 "Continuum")

## Context

M26 is the first milestone of 4.0 "Continuum", the release governed by one rule: *nothing self-promotes; the
Firm proposes, the Principal confirms* (`/MILESTONE_REGISTRY.md` §4). The later 4.0 milestones change what the
Firm *is*: M27 evolves the charter (gated by evaluation sets), M29 reviews structure ("may propose, never
enact"). Both *propose* structural change and require a Principal Decision to enact it
(`/docs/03-decision-engine.md`).

M26 sits underneath them as the measurement substrate, and it has the same raw material — the Firm's own
outcome records — that a self-modifying system would use to change itself. The danger is **accretion**: a loop
that starts by correcting a cost estimate is one careless field away from lowering a risk floor, relaxing a
Standard, granting itself a capability, or restructuring a department "because the data supports it." An
organisation that adjusts its own parameters on the basis of its own history, with no boundary, becomes the
meta-layer Principle 14 (`/docs-v2/02-v2-principles.md`) forbids — and does so silently, without the criteria,
recorded dissent, reversibility class, and review date that a Decision requires.

The question this ADR settles is the boundary itself: **exactly which numbers may calibration touch, and how is
"only these numbers" enforced rather than merely promised?** The line matters most precisely because the
adjacent milestones (M27/M29) *do* cross it — so M26 must not, and must not be *able* to.

## Options

1. **Let calibration adjust anything its metric predicts, subject to a Principal approval prompt.** If the data
   shows a capability would help, propose granting it; if a Standard slows Missions, propose relaxing it. This
   is M27/M29's job, not M26's, and folding it in here erases the boundary the whole release is built on.
   Rejected: it makes the narrowest 4.0 capability the widest, and turns a numeric loop into the meta-layer.
2. **Restrict to numbers by policy — a documented rule the crate promises to honour, checked in review.** A
   prose boundary ("calibration only writes numbers") with the enforcement being code review. Rejected for the
   same reason ADR-0067 rejects a prose partition: a boundary that lives only in a document is one an
   implementer forgets under deadline, and the first structural write nobody reviewed is a silent capability
   change.
3. **Numeric-only, enforced structurally: the parameter schema has fields for estimate corrections, a novelty
   mapping, and risk weights — and *no field for anything else*. There is no `capability`, no `forbidden`, no
   `standard`, no `guard`, no `department`, no `effect_ceiling`, no `budget`. The crate has no dependency edge
   to any capability/Standard/department write API. A calibration run therefore *cannot express* a structural
   change — not because a check forbids it, but because the type it writes has nowhere to put it. CI enforces
   both the schema shape and the absent dependency edges.**
4. **A generic "parameter store" that can hold any keyed value, with a denylist of forbidden keys.** Flexible,
   and wrong for the same reason a redaction denylist is wrong (ADR-0067): a denylist is a list of structural
   writes someone remembered, and the first key nobody listed is the first silent breach. The safe default and
   the default must be the same default; a generic store inverts that.

## Decision

Option 3. Calibration adjusts exactly three families of numbers, and the schema makes any other change
inexpressible.

**Calibration may adjust** (numeric, bounded, revertible, auto-applied only if it narrows held-out error —
ADR-0071):

- the estimate **correction factor `c`** and **spread ratio `s`** per Task signature (multiplicative, clamped
  to `[1/K, K]` and `s ≥ 1`; architecture §3.1, §7.2);
- the **interior novelty breakpoints** for `n ∈ 1..4`, within fixed endpoints (`n = 0 → 3` always) and fixed
  monotonicity (architecture §3.2);
- the four `mean`-dimension **risk weights** (`w_spec`, `w_nov`, `w_frag`, `w_cost`; `Σw = 1`, each
  `≥ w_floor = 0.10`; architecture §3.3).

**Calibration may never touch** — these have **no field in the schema and no write path in the crate**:

- any capability grant or `integration:*` scope, or a `[capabilities].forbidden` set;
- any Standard, Guard, or review-intensity setting;
- the `max(reversibility, blast_radius)` safety term, the `⊕` combinator, or any risk band boundary;
- the org chart (adding, removing, or restructuring a department);
- any Charter field, effect ceiling, or budget ceiling.

Everything in the first list is a number the Firm uses to *estimate its own work*. Everything in the second
changes what the Firm may *do*, *see*, or *be shaped like* — a Decision under Principle 14, which lives in M27
(charter evolution) and M29 (structure review), never here. The enforcement is threefold and structural: (a)
the parameter schema (architecture §6.4) exposes no non-numeric field; (b) `sidra-calibration` has no
dependency edge to any capability/Standard/department write API, CI-checked; (c) a test asserts no such write
path exists. The safety structure of risk aggregation (§11.3 — reversibility and blast radius enter through
`max`, never a mean; "risk never decreases without evidence"; "unknown is not Low") is an **input** to
calibration, never an output of it.

Where this decision and the Mission Engine's risk model (§11.3, §11.5) could be read to disagree about the
shape of risk aggregation, **the Mission Engine governs.**

## Consequences

**Accepted: some genuinely useful adjustments are out of reach here and must wait for a Decision.** If the
outcome records strongly suggest the Firm should hold a capability it lacks, M26 cannot grant it — that is
M27's job, gated by evaluation sets, with recorded dissent and a review date. The boundary favours "propose,
don't enact" at the margin, on purpose; the cost is that the fast, automatic loop is confined to numbers.

**Accepted: the numeric-only boundary is a compatibility surface the later milestones inherit.** M27, M28, and
M29 build on a substrate whose adjustments are numeric, traceable, and revertible. Widening M26's schema to
carry a structural field later would not be a numeric change — it would be a new Decision-class capability and
would require its own ADR and Principal approval, not a quiet migration.

**Gained: "numeric only" is a property of the type, not a rule in a document.** A calibration run cannot smuggle
a capability, Standard, Guard, or org-chart change because the type it writes has nowhere to put one, and the
crate cannot even link the APIs that would perform such a write. The guarantee survives an implementer who
never read this ADR (AC6, TC-2).

**Gained: the safety floors are structurally uncalibratable.** Because the `max` safety term, the fixed novelty
endpoint, and the `w_floor` on every weight are not fields the schema exposes, no calibration — however the data
pulls — can zero a risk dimension, average safety away, or score an unknown as Low. Safety dominates through
`max` and is never a casualty of learning (AC7, TC-5).

**Gained: the boundary between M26 and M27/M29 is mechanical, not editorial.** "Did this change a number or a
structure?" is answerable by which table was written, so the release's propose-not-enact rule is enforced at
the schema, not adjudicated case by case.

**Reversal cost: moderate, and deliberately so.** Narrowing the numeric surface is cheap. Widening it to touch
anything structural is expensive by design: it is not a schema tweak but the creation of a self-modification
path, which is precisely the Decision Principle 14 reserves for M27/M29 with Principal confirmation. Making that
reversal costly is the whole value of drawing the line here.
