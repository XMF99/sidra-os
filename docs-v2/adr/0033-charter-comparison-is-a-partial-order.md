# ADR-0033 — Charter comparison is a partial order, and `Incomparable` is treated as widening

**Status:** Proposed · **Date:** M15 / E1 / T1.3 · **Relates to:** ADR-0018, ADR-0020, ADR-0022
**File at:** `docs-v2/adr/0033-charter-comparison-is-a-partial-order.md`

## Context

`/MISSION_ENGINE_ARCHITECTURE.md` §5.1 makes two claims about the Charter that must both hold:

> The Charter is the **outer boundary**. Every Objective, Task, and Dispatch is a subset of it.

> It is set at DRAFTING and **may only be widened by the Principal**.

Together these require the system to answer one question mechanically, on every replan, every amendment and
every delta authorisation: **is this new Charter narrower than, wider than, or the same as the old one?**

The obvious implementation is a boolean — `is_wider(a, b)`. That is wrong, and the reason is the shape of the
data. A Charter has eleven fields. An amendment can lower the budget while raising the effect ceiling. Under a
boolean, that is either "wider" or "not wider", and both answers are false: it is wider in one dimension and
narrower in another, and no total ordering exists that describes it honestly.

Charters form a **partial order**, not a total one. Some pairs are simply not comparable.

## Options

1. **A boolean `is_wider`.** Simplest. Forces a lie whenever an amendment moves two fields in opposite
   directions, and the lie will be resolved in whichever direction the implementer found convenient at the
   time.
2. **A numeric "permissiveness score."** Sum a weight per field, compare totals. Produces a total order and
   therefore always answers — by averaging a raised effect ceiling against a reduced budget. This is the same
   error §11.3 of the architecture already rejects for risk aggregation, where reversibility and blast radius
   enter through `max` precisely so they cannot be averaged away.
3. **A four-valued partial order** — `Same`, `Narrower`, `Wider`, `Incomparable` — with `Incomparable`
   treated as widening for authorisation purposes.
4. **Forbid multi-field amendments.** Each amendment touches one field, so every comparison is total. Clean
   in theory; a replan that reduces scope and shortens the deadline is one intention, and splitting it into
   two approvals spends the Principal's attention twice for one decision (Principle 1).

## Decision

Option 3.

`Charter::relation_to` returns one of four values. The relation is computed per field against a declared
narrowing direction, then folded:

- every field `Same` → **`Same`**
- fields in `{Same, Narrower}` → **`Narrower`**
- fields in `{Same, Wider}` → **`Wider`**
- any field `Incomparable`, or any mix of `Narrower` and `Wider` → **`Incomparable`**

**`Incomparable` is treated as widening at every authorisation site.** It requires the Principal exactly as
`Wider` does.

Narrowing direction per field:

| Field | Narrower | Rationale |
|---|---|---|
| `budget` | smaller | Less spend authority |
| `effect_ceiling` | lower class | Less consequential action permitted |
| `autonomy` | lower depth | Fewer delegation hops (ADR-0012: v2 max is 3) |
| `review_intensity` | `Full` < `Standard` < `Lean` | More review is more constrained (ADR-0018) |
| `deadline` | earlier, and `Some` is narrower than `None` | Less time is less room |
| `fences` | **superset** | More fences is more constrained |
| `departments_allowed` | **subset, with empty meaning universal** | See below |
| `mission_id`, `directive_id`, `statement`, `rationale` | not ordered — unequal is `Incomparable` | Changing what the Mission is for is not a widening, it is a different Mission |

## The `departments_allowed` inversion

`ARCH` §5.1: *empty = any installed department; non-empty = allowlist.*

An empty collection therefore denotes the **universal** set, not the empty one, and naive subset comparison
inverts the answer for exactly the case that matters most — `[] → ["backend"]` is a **narrowing**, and
`["backend"] → []` is the widest possible widening while looking like a deletion.

This is called out here because it is the single most likely defect in any future reimplementation of the
comparison, and because a diff that removes an allowlist entry reads as a restriction to a reviewer skimming
it.

## Consequences

**Accepted:** four cases to handle at every authorisation site rather than two, and callers must not collapse
`Incomparable` into `Wider` at the type level even though both route to the Principal — the distinction is
what makes an approval request able to say *why*.

**Accepted:** an amendment that genuinely trades one dimension for another always reaches the Principal, even
when a human would call it obviously safe. That is the intended cost. The alternative is a rule that decides
on the Principal's behalf which trades are safe, which is the authority the Charter exists to withhold.

**Accepted:** each new Charter field must declare its narrowing direction, or the comparison is incomplete.
The field table above is normative and must be extended in the same change that adds a field.

**Gained:** the "outer boundary" claim becomes mechanically checkable rather than a property someone asserts
in review.

**Gained:** delta authorisation (`ARCH` §14.4) gets a deterministic input. "Scope reduced → notify;
widened → approve" is decidable without judgement.

**Gained:** failing closed. The permissive answer is never the default, and an unanticipated field
combination degrades to *ask the Principal* rather than to *proceed*.

**Reversal cost:** low while E1 is in flight; high once T1.7 (`PlanVersion`) and E10 (replanning) depend on
the relation. Decide now.
