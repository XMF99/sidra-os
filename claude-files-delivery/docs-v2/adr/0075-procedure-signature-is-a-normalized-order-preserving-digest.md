# ADR-0075 — "The same procedure" is a normalized, order-preserving signature over Work Order types

**Status:** Proposed · **Date:** 4.0 "Continuum" design phase · **Supersedes:** —

## Context

M28's exit criterion — *"A procedure repeated five times is proposed as a Workflow"* — is only decidable if
"the same procedure" is a mechanical fact. If it is a similarity judgement, then "repeated five times" has no
crisp meaning, the threshold is a tuning parameter, and the recurrence count is an opinion. Worse, a
similarity judgement made by a model breaks the determinism the rest of the intelligence layer is built on: the
Mission scheduler is deterministic on purpose (`/docs-v2/03-Intelligence/MISSION_ENGINE_ARCHITECTURE.md` G5,
Principle 8), and a learning loop whose core comparison is a model call is a loop nobody can replay or audit.

The raw material is the Mission outcome record, whose shape section carries *"objectives, task count,
departments, contracts, risk profile"* (§23.3 there) and whose `mission_dispatches ↔ work_orders` projections
carry the ordered sequence of Work Orders each Mission dispatched, with task kind, resolved department-role,
effect class, and contract (§27.3). That sequence is the procedure. But two runs of the *same* procedure never
look byte-identical: different repository, different issue, different reviewer, different costs, different
timestamps, a fan-out over three documents one time and five the next. A naive equality over the raw sequence
would find that no procedure ever repeats.

The open question: **what is the canonical form over which "the same procedure" is equality, such that five
runs of one procedure are detectably equal and two different procedures are detectably different?**

## Options

1. **Raw Work Order sequence equality.** Compare the dispatched Work Orders verbatim. Deterministic, but never
   equal across runs — parameters, ids, and fan-out width differ every time. Finds zero recurrence. Useless.
2. **Embedding similarity with a threshold.** Embed each Mission's procedure and cluster by cosine distance.
   Finds "roughly similar" procedures, but is a model judgement: non-deterministic, non-replayable,
   threshold-tuned, and unauditable. Breaks G5's discipline and would need its own threat model.
3. **A normalized, order-preserving signature over Work Order *types*.** Project each Work Order to a
   normalized step tuple `(task_kind, role_archetype, effect_class, contract_shape)`; abstract away every id,
   parameter, cost, and timestamp; collapse a fan-out to a single step carrying its child template; preserve
   order and dependency structure; serialize canonically and hash. "The same procedure" is byte-equality of
   the hash. Deterministic, model-free, replayable.
4. **Signature over department participation and task count only.** A coarse fingerprint — same departments,
   same number of tasks. Cheap, but conflates procedures that share a headcount and a task count while doing
   entirely different things in a different order. Over-proposes.

## Decision

**Option 3.** A **procedure signature** is computed by:

1. **Projection.** Each dispatched Work Order becomes a `NormalizedStep`:

   ```
   NormalizedStep = ( task_kind, role_archetype_id, effect_class, contract_shape_id )
   ```

   `task_kind` is the Workflow step kind (`work_order | meeting | gate | fanout | join | …`,
   `/docs/01-workflow-engine.md` §1). `role_archetype_id` is the **resolved role**, never the agent instance —
   a role, not a person (M13, ADR-0014). `effect_class` is the declared class (security model §5).
   `contract_shape_id` is the typed Exchange/Work Order contract *shape*, never its arguments.

2. **Abstraction.** These never enter the signature: Work Order / agent / engagement / mission ids, parameter
   values, free text, artifact paths, costs, durations, timestamps, retry and attempt counts. Two runs that
   differ only in these are the same procedure.

3. **Structure preservation.** The signature is the *ordered* vector of `NormalizedStep`s plus the dependency
   edges projected to positions. **A fan-out of N is collapsed to a single `fanout` step carrying its child
   template**, not expanded to N steps — otherwise the same procedure over three documents and over five
   documents would have different signatures, which it must not (the collection size is data, not procedure).

4. **Canonicalization and hashing.** The normalized vector is serialized in a fixed deterministic encoding and
   hashed to a `SignatureHash`. Two concluded Missions have the same procedure **iff** their `SignatureHash`
   values are equal.

The signature is **conservative**: it preserves order, effect class, role, and contract shape, so two
procedures differing in *any* of those differ in signature. The normalized `steps`/`edges` are retained
alongside the hash so a candidate is inspectable — a Principal reviewing a proposal reads the shape, not an
opaque digest.

## Consequences

**Accepted: order and effect class make the signature strict.** Two procedures that do the same work in a
different order, or that differ only in one step's effect class, are *different* procedures and will not
combine toward a threshold. This under-counts some intuitively-similar procedures. That is the safe direction:
the failure mode is *no proposal* (silence), never a wrong proposal, and a Principal can always author a
Playbook by hand for a case the signature splits.

**Accepted: normalization choices are load-bearing and could be wrong.** If `contract_shape` is too coarse, two
different procedures collide; if too fine, one procedure splits across runs. The rule errs fine (splitting,
i.e. under-proposing) because under-proposing is safe and over-proposing puts a wrong candidate in front of the
Principal. Refining the normalization later produces a *new* signature and a fresh candidate, superseding the
old (architecture §12 F7) — history is preserved.

**Accepted: fan-out collapsing loses the collection size.** A procedure that fans out over documents looks the
same at three and at five. This is intended — the collection is the procedure's *input*, not its shape — but it
means the compiled candidate's fan-out bound is derived from the child template, not from any single run's
width.

**Gained: recurrence is a hash lookup, not a search.** Matching a signature is O(1) indexed equality
(architecture §8), so observation stays off the hot path and matching cost does not grow with the number of
stored procedures. The determinism also makes the whole loop replayable and auditable: given the same concluded
Missions, the same signatures and the same recurrence are computed forever (G10).

**Gained: no model in the core comparison.** "The same procedure" is a pure function of the outcome record —
the same discipline the deterministic scheduler holds. A learning loop whose central decision is model-free is
a learning loop that can be debugged, replayed, and trusted.

**Reversal cost: low.** The signature function is pure and internal; changing it changes which future
recurrences are detected but rewrites no history — existing observations keep their computed hashes, and a
re-normalization simply produces new signatures going forward. No Mission and no stored candidate is
invalidated. Reverting to a coarser or finer rule is a code change plus a fresh ADR, with no data migration.
