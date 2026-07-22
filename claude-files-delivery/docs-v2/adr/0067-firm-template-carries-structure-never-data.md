# ADR-0067 — A Firm Template carries structure, never data — the boundary is defined and enforced

**Status:** Proposed · **Date:** M25 architecture phase (3.0 "Chambers")

## Context

M25 must let a Principal package a Firm into a distributable artifact so a new Firm can start from a known-good
shape (`/MILESTONE_REGISTRY.md` §4). The obvious implementation — serialise the database and Vault — is a
catastrophic data leak: it would ship every engagement, every memory chunk, every budget figure, every Seat's
working memory, and every fact the Firm derived from operations. The exit criterion is explicit that this must
not happen: *a Firm Template installs into an empty Vault and reproduces the source Firm's **structure without
its data**.*

So the milestone turns entirely on one question: **what, precisely, is "structure" and what is "data", and how
is the line enforced rather than merely stated?** A boundary that lives only in prose is a boundary an
implementer forgets under deadline. The `canon` table makes this sharper: it holds *both* durable identity
statements ("the Firm builds developer tools") and facts derived from operations ("the vendor's SLA is 99.9%")
in one table (`/docs/04-database-design.md` §6), so the line is not even table-aligned everywhere — in one
place it is row-level.

## Options

1. **Serialise everything, redact on the way out.** Dump the DB, strip a denylist of fields. Simple, and
   wrong: a denylist is a list of leaks someone remembered, and the first table a future milestone adds is the
   first leak nobody remembered. Redaction is the wrong default — it exports by default and excludes by
   exception.
2. **A prose policy: "export only structure."** A document says which tables are structure. No mechanism.
   Correct until the first implementer, migration, or new table diverges from the prose, at which point the
   leak is silent.
3. **A versioned, explicit, exhaustive partition of every table and Vault path into *structure* and *data*,
   enforced three ways: the export engine has no dependency edge to the data-owning services (it *cannot* read
   them); a boundary check refuses to package any artifact intersecting the data side; and a CI test fails the
   build if any data-side item can reach the export path.** Structure is opt-in, data is default-excluded, and
   an unclassified new table is *data* until an ADR says otherwise.
4. **Export nothing but a manifest the Principal writes by hand.** No leak, because nothing is read from the
   Firm. Also no reproduction — the Principal reconstructs the org chart from memory, which defeats the
   feature.

## Decision

Option 3.

The structure/data boundary is a **versioned partition** (architecture §5) that names, for every table and
Vault path through M24, whether it is *structure* (exportable identity/shape) or *data* (excluded
operations/history). Structure is: the org chart (Divisions, Offices, departments, edges, veto scopes, head
assignments), the charter set (Role Archetype declarations, by reference to Packs), the Pack selection (by
id+version+tier+hash reference), and *structural* Canon. Data is everything else — events, engagements, work
orders, deliverables, governance, execution, memory content, budgets, automations, connector grants,
**Seats**, capability grants, and *data* Canon.

The boundary is enforced by three independent barriers:

- **The dependency graph.** `services/portability` has no edge to `services/orchestrator`, `services/mission`,
  or any operational-data/memory-content service (ADR-0011; CI-enforced). It literally cannot read an
  engagement or a memory chunk.
- **The boundary check.** A hard-refusal guard on the export path that rejects any artifact intersecting the
  data side, and re-runs at the *importer* so the guarantee is symmetric.
- **The CI boundary test.** The build is red if any data-side item can reach the export path or appears in a
  produced Template fixture.

Canon is handled row-level: only `source_type = 'principal'`, firm-scoped, active, unreferenced rows are
*eligible*, and even those are included only by explicit per-statement Principal choice. Any table introduced
after M25 is *data* by default until an ADR classifies it.

## Consequences

**Accepted: a partition that must be maintained for the life of the schema.** Every new table forces a
classification decision, and moving a table to the *structure* side requires an ADR. Real, recurring cost —
paid deliberately, because the alternative is a silent leak.

**Accepted: some legitimately-structural knowledge is excluded because it lives on the data side.** A playbook
the Firm compiled from experience (`playbooks`, derived-from engagements) is arguably part of "how this Firm
works", yet it is data and does not travel. Correct for safety; occasionally a Principal will want it and will
have to re-derive it in the new Firm. The line favours exclusion at the margin, on purpose.

**Accepted: the row-level Canon rule is more complex than a table rule.** Canon export is the one place the
check inspects `source_type`, scope, and references per row. Worth it — Canon is the closest thing to data a
Template may carry, so it earns the extra care.

**Gained: "structure not data" is a property of the build, not a promise in a document.** The absent dependency
edge cannot be forgotten under deadline the way a redaction rule can. This is the entire point: the guarantee
survives implementers who never read this ADR.

**Gained: forgetting to classify a new table leaks nothing.** Default-excluded means the failure mode of
oversight is "a structural thing was left behind", not "a private thing shipped". The safe default and the
correct default are the same default.

**Gained: the exit criterion becomes a mechanical assertion.** "Reproduces structure without data" is
COUNT = 0 on every data-side table plus a graph isomorphism on the org chart — a test, not a review.

**Reversal cost: moderate.** Once Templates are published, the partition is a compatibility surface: widening
*structure* to include a formerly-*data* table is a new ADR and a new Template major version, and any Principal
relying on "Templates never carry X" would be surprised by a later Template that does. Narrowing is cheap;
widening is a decision with an audience, which is why the partition is versioned.
