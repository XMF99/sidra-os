# Architecture Decision Records — Version 2.0

ADRs 0001–0011 live in `/docs/06-implementation/adr/` and **all eleven stand unchanged**. ADRs 0022–0030 are
embedded in `/MISSION_ENGINE_ARCHITECTURE.md` §30. These continue the same numbering sequence, use the same
format, and follow the same rule: a decision that changes a boundary, an invariant, or a Principal-facing
behaviour needs a record.

| # | Decision | Status | Supersedes |
|---|---|---|---|
| [0012](0012-divisions-between-executive-and-departments.md) | Divisions between the Executive and Departments | Accepted | v1 org chart §1 (four departments) |
| [0013](0013-department-pack-as-unit-of-modularity.md) | The Department Pack as the unit of modularity | Accepted | — |
| [0014](0014-role-archetypes-and-lazy-instantiation.md) | Role Archetypes and lazy instantiation | Accepted | "The Firm is eleven agents" |
| [0015](0015-offices-hold-vetoes-departments-hold-delivery.md) | Offices hold vetoes; Departments hold delivery | Accepted | Cross-cutting veto placement in v1 org chart §1 |
| [0016](0016-standards-and-guards-as-kernel-primitives.md) | Standards and Guards as kernel primitives | Accepted | Twelve message kinds |
| [0017](0017-registries-as-canon-projections.md) | Registries as department-owned Canon projections | Accepted | — |
| [0018](0018-review-intensity.md) | Review Intensity as a firm-wide setting | Accepted | — |
| [0019](0019-compile-ccgs-do-not-embed.md) | Compile Claude-Code-Game-Studios; do not embed it | Accepted | — |
| [0020](0020-fourth-budget-ceiling.md) | A fourth budget ceiling at the department | Accepted | Three nested ceilings |
| [0021](0021-seats-defined-in-2-shipped-in-3.md) | Seats defined in 2.0, shipped in 3.0 | Accepted | — |
| [0031](0031-ci-workflows-split-from-ci-scripts.md) | CI workflows in `.github/`, checks in `infrastructure/ci/` | Accepted | Clarifies ADR-0011 |
| [0032](0032-single-global-milestone-numbering.md) | Milestone numbering is single, global, permanent once documented | Accepted | "M10" label in the Mission Engine plan |
| [0033](0033-charter-comparison-is-a-partial-order.md) | Charter comparison is a partial order, and `Incomparable` is treated as widening | Proposed | — |
| [0034](0034-connector-credentials-held-by-the-kernel.md) | Connector credentials held by the kernel, never by the connector | Accepted | — |
| [0035](0035-connectors-granted-to-a-department-not-the-firm.md) | A connector is granted to a department, never to the Firm | Accepted | — |
| [0036](0036-egress-declared-in-manifest-enforced-by-kernel.md) | A connector's egress is declared in its manifest and enforced by the kernel | Accepted | — |
| [0037](0037-oauth-is-a-kernel-capability.md) | OAuth authorization is a kernel capability, not a connector responsibility | Accepted | — |
| [0038](0038-release-gate-is-a-proof-obligation-not-a-date.md) | The 1.0 release gate is a proof obligation, not a date | Accepted | — |
| [0039](0039-hardening-adds-no-authoritative-tables.md) | Hardening adds no authoritative tables; release bookkeeping is a projection | Accepted | — |
| [0040](0040-implicit-default-department-as-migration-bridge.md) | The implicit default department as the migration bridge | Accepted | — |
| [0041](0041-replay-equivalence-as-the-substrate-exit-gate.md) | Replay equivalence as the substrate's exit gate | Accepted | — |
| [0042](0042-firm-wide-veto-enforced-as-a-blocking-guard-at-the-choke-point.md) | A firm-wide veto is enforced as a non-downgradable blocking Guard at the choke point | Accepted | — |
| [0043](0043-exchange-contract-resolution.md) | Exchange contract resolution is deterministic, and ambiguity is refused | Accepted | — |
| [0044](0044-three-department-conformance-set.md) | The exit-criterion conformance set is Backend, Cybersecurity, and Software Engineering | Accepted | — |
| [0045](0045-marketplace-is-distribution-only.md) | The Marketplace is distribution-only; it reuses the M13 install path and adds no install or trust mechanism | Accepted | — |
| [0046](0046-the-concrete-five-connector-set.md) | The concrete five-connector set and their effect-class maps | Accepted | — |
| [0047](0047-per-connector-offline-degradation-contract.md) | Per-connector offline degradation contract | Accepted | — |
| [0048](0048-object-storage-addressing-and-chunking.md) | Object-storage addressing, streaming, and chunking contract | Accepted | — |

## Format

Context → Options → Decision → Consequences. Consequences are split into what is accepted, what is gained,
and the reversal cost, because a decision record that lists only benefits is a marketing document.
