# ADR-0056 — An executable artifact's provenance is recorded and is the source of its grant

**Status:** Accepted · **Date:** M20 architecture phase · **Supersedes:** — · **Milestone:** M20 (Executable Artifacts, 2.5 "Field")

## Context

ADR-0054 bounds an executable artifact's grant to a subset of its producing Work Order's `capability_grant`.
That decision presupposes a fact the system must actually hold: *which Work Order produced this artifact?* If
that link is missing, ambiguous, or forgeable, the whole bounding argument collapses — there is nothing to be a
subset *of*.

The schema already implies the lineage. An executable artifact is an `artifacts` row (`/docs/04-database-design.md`
§7). An artifact is reached from a Work Order through `deliverables.work_order_id → deliverables.artifact_id`,
and a Work Order carries `engagement_id`, and an Engagement is issued to an agent. So the chain *artifact →
Work Order → Engagement → agent* is derivable today.

But "derivable by a join" is not the same as "load-bearing and enforced." For grant derivation to be a single,
unforgeable lookup — and for provenance to be a precondition of runnability rather than a nice-to-have — the
producing Work Order must be recorded *directly and immutably* on the executable artifact, and its presence
must be a guard on reaching the runnable state.

There is also a distribution question. An executable artifact can be copied to another Vault or distributed
through the Marketplace (Layer 8). GUIDE §12 forbids any artifact that "arrives with autonomy." So a distributed
artifact must arrive with *no* grant, and the only way it can gain one is by being (re-)authored inside a Work
Order — which is exactly the provenance link. Provenance is therefore also the mechanism that keeps installation
from conferring authority.

## Options

1. **Infer provenance by join at derivation time, record nothing extra.** Rejected: the `deliverables` join is
   the *normal* path, but an executable artifact might be authored, superseded, or reworked, and reconstructing
   "the Work Order whose grant should bound this" by walking joins is fragile and ambiguous under rework. Grant
   derivation must not depend on a query that can return two answers.
2. **Record provenance but make it advisory** (a metadata field the runtime may ignore). Rejected: if the
   runtime can derive a grant without a resolved producing Work Order, ADR-0054 has no ceiling and the
   installation-confers-nothing rule has no anchor.
3. **Record `producing_work_order_id` directly on the executable artifact, `NOT NULL`, `ON DELETE RESTRICT`,
   and make its resolution a precondition of the runnable state.** The producing Work Order is the grant source
   and the root of the lineage; without it the artifact cannot have a grant and cannot run.

## Decision

Option 3.

`executable_artifacts.producing_work_order_id` is recorded at authoring, `NOT NULL`, with `ON DELETE RESTRICT`
(design rule §7 — nothing referenced by audit is hard-deleted). Grant derivation (ADR-0054) reads exactly this
Work Order's `capability_grant` as the ceiling — one lookup, one answer, no join ambiguity. An artifact whose
producing Work Order cannot be resolved cannot reach `Runnable`: provenance is a precondition of a grant, and a
grant is a precondition of a run.

The full lineage *artifact → producing Work Order → Engagement → agent* is exposed by the `artifact_lineage`
query and is what audit points at to answer "where did this authority come from?" A distributed or
Marketplace-obtained artifact arrives with no `producing_work_order_id` binding in the installing Vault and no
`ArtifactCapabilityGrant`; it gains both only when an agent authors or adopts it inside a Work Order in that
Vault — so installation confers nothing (GUIDE §12), and any authority it later holds is bounded by that Work
Order (ADR-0054).

Every provenance and grant event lands on the hash chain (ADR-0002): `ArtifactAuthored` carries the producing
Work Order; `ArtifactGrantDerived` and `ArtifactGrantRefused` carry the Work Order the grant was bounded
against.

## Consequences

**Accepted: an executable artifact is permanently tied to one producing Work Order.** It cannot be
"re-parented" to a different Work Order to change its ceiling. Adopting an artifact under a different Work Order
produces a *new* executable-artifact record with its own provenance and its own derived grant — the original is
untouched, and history is not rewritten. This is more records, and it is the correct cost of an immutable
lineage.

**Accepted: the producing Work Order cannot be purged while the artifact exists.** `ON DELETE RESTRICT` means
an executable artifact pins its Work Order in the audit history. This is consistent with the no-hard-delete rule
for anything referenced by audit and is the price of a provenance you can trust.

**Gained: grant derivation is a single unforgeable lookup.** ADR-0054's ceiling is `producing_work_order.capability_grant`,
resolved directly, never inferred by an ambiguous join. The bounding proof rests on a fact the schema enforces.

**Gained: installation genuinely confers nothing.** A distributed artifact has no grant until a Work Order
derives one, and the derivation records the provenance in the same act. There is no path where an artifact runs
with authority it did not earn through a Work Order in the running Vault — which is the GUIDE §12 rule made
mechanical rather than promised.

**Gained: "where did this come from?" is answerable.** For any effect an executable artifact ever had, the
lineage resolves to a Work Order, an Engagement, and an agent — the same accountability every other effect in
the Firm carries, extended to agent-authored code.

**Reversal cost: moderate.** Making provenance advisory again would remove the anchor for both ADR-0054's
ceiling and the installation-confers-nothing rule; every artifact authored under the recorded regime would need
its lineage reconstructed by join, reintroducing the ambiguity this ADR removes. The `NOT NULL` column and the
audit events cannot be withdrawn under the compatibility contract, but an enforced provenance is not a burden to
carry.
