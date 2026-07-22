# ADR-0041 — Replay equivalence as the substrate's exit gate

**Status:** Accepted · **Date:** M11 design phase · **Milestone:** M11 — Department substrate

## Context

M11 delivers an invisible substrate whose claim is that v2 is an *extension* of v1, not a rewrite
(`/docs-v2/01-enterprise-architecture.md` §7). A claim of invisibility that is checked by a feature checklist
is usually lying somewhere (`/docs-v2/01-migration-strategy.md` §7). The migration strategy already specifies
the instrument: replay a complete recorded v1 Engagement against the v2 kernel with model calls stubbed, and
require the Brief to be byte-identical (`/docs-v2/01-migration-strategy.md` §6). The master guide already lists
"Replay equivalence — A recorded v1 Engagement produces a different Brief *(from M11)*" as a CI gate
(`/MASTER_IMPLEMENTATION_GUIDE.md` §7).

What is *not* yet decided as a record is (a) that this equivalence — rather than a set of feature acceptance
criteria — **is** M11's definition of done and its exit criterion; (b) precisely **what** "byte-identical Brief"
compares; and (c) that the gate is **permanent** across M11–M14, gating every step of the migration sequence.
These are boundary/invariant decisions (`/MASTER_IMPLEMENTATION_GUIDE.md` §8) and belong in an ADR.

## Options

1. **Feature-checklist exit criterion.** M11 is done when the five faces are implemented and their unit tests
   pass. Verifiable per-face, but it never proves the *composition* changed nothing — a face can be individually
   correct and still perturb a Brief by one byte through an interaction no unit test covers. This is the failure
   the byte-equality test exists to catch (`/docs-v2/01-risk-analysis.md` R-01 residual).
2. **Replay equivalence as the exit gate, comparing the Brief projection byte-for-byte, model calls stubbed,
   over a corpus, on every commit to M11–M14.** One test decides whether the substrate did what it claims.
3. **Replay comparing the full event stream, not just the Brief.** Stronger, but over-specified: it would fail
   on benign, invisible internal event additions (e.g. a seed event) that the Principal never sees, coupling the
   gate to internals rather than to the observable outcome. The Brief is the Principal-facing artifact; the
   event stream of the *replayed Engagement* being unchanged follows from Brief byte-identity because the Brief
   is a projection of that stream (ADR-0002).
4. **Replay with live model calls.** Impossible as an equivalence test: v2 changes routing depth and therefore
   the frames agents see, and models do not produce identical text twice (`/docs-v2/01-migration-strategy.md`
   §6). Live-model behaviour is the evaluation sets' job, not this gate's.

## Decision

Option 2. **Replay equivalence is M11's exit criterion and definition of done**, and a permanent CI gate on
M11–M14.

- **Unit of comparison:** the `briefs` projection row for the replayed Engagement (`/docs/04-database-design.md`
  §2), canonically serialised — `situation`, `actions`, `findings`, `recommendation`, `the_ask`, `confidence` —
  compared octet-for-octet against the recorded v1 Brief.
- **Model calls are stubbed by recorded responses.** The gate tests whether the *machinery* is equivalent, not
  whether models reproduce text (`/docs-v2/01-migration-strategy.md` §6). Anything requiring a live model call is
  out of scope and is covered by the evaluation sets.
- **The gate runs over a corpus of recorded Engagements, on every commit to M11–M14**
  (`/docs-v2/02-implementation-changes.md` §5), and is the gate on every step of the migration sequence
  (`/docs-v2/01-migration-strategy.md` §4). A RED result names the byte-level diff, which localises the offending
  face.
- **New department lifecycle events fire only at substrate seed time**, outside any replayed Engagement, so
  Brief byte-identity is achievable while the substrate still adds event kinds (ADR-0040; architecture §9.2).

## Consequences

**Accepted: a recorded corpus is a prerequisite.** The gate is only as good as the Engagements it replays; a
thin corpus proves little. Capturing a representative corpus of v1 Engagements is a precondition for M11's exit,
not an afterthought (architecture §Assumptions 2).

**Accepted: the gate constrains every later milestone in the release.** M12–M14 each commit must keep the
replayed Briefs byte-identical, which forbids any change that perturbs the v1 baseline without a setting. This is
deliberate — it is the mechanism that holds R-01 (`/docs-v2/01-risk-analysis.md`) — but it is a real, permanent
constraint on how those milestones may be built.

**Accepted: byte-equality is brittle by design.** A one-byte difference fails the build. That brittleness is the
point: it is a proof, not a heuristic (`/docs-v2/01-migration-strategy.md` §6). Teams will occasionally chase a
diff caused by a benign serialisation change; the canonical serialiser must be pinned so the gate fails only on
semantic change.

**Gained: the composition is proven, not assumed.** The gate catches face interactions that no per-face unit
test can, which is exactly the class of defect that turns an extension into a rewrite unnoticed.

**Gained: a single, unambiguous definition of done for the substrate.** "Substantially done" is not a state
(`/MASTER_IMPLEMENTATION_GUIDE.md` §6); "the corpus replays byte-identically" is.

**Gained: the release's central risk becomes measurable.** R-01 "cannot be designed away, only measured"
(`/docs-v2/01-risk-analysis.md`); this gate is the measurement, extended from the Brief's byte-equality to every
commit that follows.

**Reversal cost: low.** The gate is a test harness; removing it removes a safety property but touches no
production code path. There is no reason to remove it — an unused byte-equality gate that stays green is free.
