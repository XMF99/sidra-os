# ADR-0017 — Registries as department-owned Canon projections

**Status:** Accepted · **Date:** v2 design phase · **Source:** `design/registry/entities.yaml` and
`docs/registry/architecture.yaml` in Claude-Code-Game-Studios

## Context

v1's Canon is the Firm's constitutional memory: facts the Principal confirmed, promoted deliberately, trusted
absolutely. It works at eleven-agent scale.

At twenty-one departments a category of fact appears that Canon handles badly: facts that cross document
boundaries within a domain but are not firm-wide truths. A game entity's stats referenced by four design
documents. An architectural stance constraining six systems. An API contract three departments build
against. These need a single owner, a change history, and automatic conflict detection — and they are not
Canon, because promoting every one would make the Firm's constitution a database.

CCGS had solved this precisely. Two YAML registries with rules worth quoting in structure: register only
facts that cross a boundary; never delete, deprecate; each entry names a `source` document that owns it;
others list themselves in `referenced_by`; a change updates the value, sets `revised`, and records what
changed it. The files also declare which skills write and read them, at which phase.

## Options

1. **Use Canon for everything.** No new concept; Canon becomes a database of thousands of domain facts, and
   its trust semantics — Principal-confirmed, absolute — become meaningless.
2. **Semantic memory only.** Facts as retrievable chunks. No ownership, no conflict detection, no append-only
   guarantee. Two documents can assert contradictory values and nothing notices until a human does.
3. **Registries: department-owned, append-only, structured fact namespaces with a named owner per fact,
   feeding Canon by promotion.**
4. **A general-purpose knowledge graph.** More powerful, far more machinery, and it answers a question nobody
   asked — the problem is ownership and conflict detection, not expressive querying.

## Decision

Option 3, adopting CCGS's semantics essentially intact.

A Registry is a namespace declared in a Department Pack. Each entry has a key, a value, an **owner** (the
authoritative artifact), a `referenced_by` list, a status (`active` / `deprecated` / `superseded_by`), and a
`revised` date.

Rules, adopted directly:
- Register only facts that cross a boundary. Internal-only facts stay internal.
- **Never delete. Deprecate or supersede.**
- One owner per fact; everything else references.
- A change updates the value, sets `revised`, and records the prior value and cause.
- Registries declare which playbooks write them and which read them.

Registries are **read before authoring** and **written after approval**. A Guard blocks a Deliverable that
contradicts a registry entry.

Registry facts feed Canon by **promotion, not automatically**: a fact that survives review and is referenced
across Applications becomes a Canon candidate, promoted by v1's existing mechanism — Kai proposes, Principal
confirms.

## Consequences

**Accepted: a sixth memory-adjacent concept** beside the five v1 layers. Justified by being a *projection*
with different semantics (owned, append-only, structured) rather than a sixth layer with its own retrieval
path.

**Accepted: append-only means registries grow forever.** Deprecated entries are never removed. This is a
storage cost accepted for the same reason as the event log: the history is the point, and a registry you can
prune is a registry whose history you cannot trust.

**Accepted: registry maintenance is real work.** Someone must own each fact; ownership disputes are real
disputes. This surfaces work that was previously invisible — which is uncomfortable and correct.

**Gained: cross-document consistency becomes mechanical.** The `registry-consistency` Guard blocks a
contradiction at authoring time rather than letting it be discovered three months later by whoever hits the
bug.

**Gained: "who owns this fact" has an answer.** This is *the* question in every cross-department consistency
dispute, and without a registry it is settled by whoever argues most fluently.

**Gained: Canon stays small and meaningful.** Domain facts live in registries; only firm-wide truths get
promoted. Canon's absolute-trust semantics survive contact with scale.

**Gained: a promotion path that is a Decision.** A department-owned fact becoming a firm-wide truth is exactly
the kind of change that should require the Principal, and now it does.

**Reversal cost: low.** Registries are data. Collapsing them into semantic memory loses ownership and
conflict detection but breaks nothing structural.
