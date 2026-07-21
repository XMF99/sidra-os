# Scalability: From One Principal to an Enterprise Tenant

1.0 is deliberately single-user. This document specifies the decisions taken *now* so that the enterprise
product is an extension rather than a rewrite — and the ones deliberately deferred so 1.0 does not pay for
a future it may not need.

## 1. The four axes of growth

| Axis | 1.0 | 2.0 | 3.0 | 4.0 |
|---|---|---|---|---|
| Humans | 1 Principal | 1 + guests (read-only shares) | Teams with roles | Organizations |
| Machines | 1 | 2–3 with sync | Server + clients | Distributed |
| Firms | 1 | Multiple local Firms (work / personal) | Workspaces per tenant | Federated |
| Data | ~1 GB | ~10 GB | ~1 TB per tenant | Sharded |

## 2. Decisions already taken for the future

| Decision | Made in 1.0 | Why it matters later |
|---|---|---|
| Kernel is a library, not app logic | `sidra-kernel` has no Tauri dependency | The same crate becomes the 3.0 server binary unchanged |
| Command/query separation | All mutations go through named commands | Commands become HTTP endpoints 1:1; queries become read replicas |
| Event log as source of truth | Hash-chained, totally ordered `events` | Becomes the replication stream and the CRDT-free sync basis |
| ULIDs everywhere | Client-generatable, sortable, collision-safe | No central ID authority needed when writers multiply |
| `workspace_id` reserved | Nullable column defaulting to the local Firm, present in every top-level table | Multi-tenancy becomes a filter, not a migration |
| Principal identity is a parameter | The Permission Broker takes an identity; today it is always the local Principal | Becomes a seat with a role, no signature change |
| Capabilities are strings with scopes | `fs.write:vault/Artifacts/**` | Becomes role-based policy without redefining the model |
| Agent charters are versioned data | `agent_versions` | Per-tenant org charts are new rows, not new code |
| No renderer-authoritative state | UI is a projection of queries + events | A web client is another projection |
| Idempotent commands | `request_id` on every call | Safe retries over an unreliable network |

## 3. What is deliberately deferred

| Deferred | Cost of doing it in 1.0 | Trigger to do it |
|---|---|---|
| Postgres | Operational complexity, loss of single-file portability, no benefit at one user | >100 GB or >2 concurrent writers |
| Real-time collaborative editing (CRDTs) | Very large complexity for a single user | Two humans editing the same artifact |
| A message broker | The in-process bus is stronger (total order) at this scale | Multiple kernel processes |
| Vector database service | `sqlite-vec` is adequate to ~1 M vectors | >1 M vectors or cross-tenant search |
| RBAC UI | There is one role: Principal | Second human |
| Horizontal agent execution | The turn-pool saturates a laptop's useful concurrency | Server deployment |
| SSO / SCIM / audit export | No organizations exist | Enterprise sales |

## 4. The 2.0 step: multiple machines

Sync is the first real distributed problem. The design:

- **Replicate the event log, not the tables.** Each device has a device id; events carry `(device, seq)`.
  Projections are rebuilt locally from events. This makes sync a well-understood append-and-merge problem
  instead of row-level conflict resolution.
- **Conflicts** are only possible on concurrent edits to the same projection row. Resolution: last-writer-
  wins for UI state, explicit merge for artifacts (versions branch and the Principal picks), and Canon
  conflicts route into the existing Reconciliation flow — a mechanism that already exists for a different
  reason.
- **Transport** is a plugin: a folder-based syncer (iCloud/Dropbox), or a self-hosted relay. No first-party
  cloud in 2.0.
- **Encryption** stays end-to-end; a relay sees ciphertext only.

## 5. The 3.0 step: workspaces and teams

```
Organization
└── Workspace (a Firm)          ← the 1.0 Vault, promoted
    ├── Seats (humans, with roles)
    ├── Staff (agents, org chart now editable)
    ├── Records (partitioned by workspace_id)
    └── Policies (capability grants by role)
```

Changes required, and why each is small given the 1.0 design:

| Change | Effort | Because |
|---|---|---|
| Multi-tenant filtering | Small | `workspace_id` already exists on every table |
| Auth (OIDC) | Medium | The broker already takes an identity parameter |
| Role → capability policy | Medium | Capabilities are already strings with scopes |
| Server deployment | Medium | The kernel has no desktop dependency |
| Storage swap to Postgres | Medium | Repository trait boundary already isolates SQL |
| Web client | Medium | Commands/queries/events map to HTTP + SSE |
| Editable org chart | Small | Charters are versioned data files already |
| Concurrent human edits | Large | Genuinely new; needs CRDTs or explicit locking |

## 6. Load characteristics, measured not assumed

| Dimension | 1.0 reality | Where it breaks | Mitigation at that point |
|---|---|---|---|
| Concurrent Turns | 4 | Provider rate limits before local CPU | Queue + multi-provider routing |
| Events/day | ~500 | 10 M rows (~years) before index pressure | Compaction into daily digests, already specified |
| Vector count | ~300 k | ~1 M for brute-force scan at 200 ms | IVF index in `sqlite-vec`, or dedicated store |
| Vault size | ~1 GB | Filesystem-bound, not app-bound | External storage tier |
| Agents | 11 | ~50 before charter context and org coordination degrade | Hierarchical delegation (heads coordinate, Executive sees only heads) — already the topology |

## 7. The principle that keeps this honest

Do not build the enterprise product now. Build the single-Principal product *so well that it is worth
scaling*, and make only the cheap structural decisions — identifiers, boundaries, command shapes, event
sourcing — that keep the door open. Every entry in §2 cost hours. Every entry in §3 would have cost months.
