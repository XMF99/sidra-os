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
| [0049](0049-no-desktop-present-sync-and-idempotent-reconciliation.md) | No-desktop-present sync and idempotent reconciliation | Accepted | — |
| [0050](0050-companion-is-a-paired-untrusted-client.md) | The Companion is a paired, untrusted client | Accepted | — |
| [0051](0051-brief-travels-as-a-canonical-render-payload.md) | The Brief travels as a canonical render payload; the Companion displays, never re-renders or authors | Accepted | — |
| [0052](0052-speech-to-text-is-local-audio-never-leaves-the-device.md) | Speech-to-text is local-only; audio never leaves the device; voice produces a normal Directive | Accepted | — |
| [0053](0053-transcript-is-confirmed-before-submit.md) | The transcript is confirmed before submit; equivalence is defined against the confirmed text | Accepted | — |
| [0054](0054-executable-artifact-grant-subset-of-work-order.md) | An executable artifact's capability grant is a strict subset of its producing Work Order's grant | Accepted | — |
| [0055](0055-executable-artifacts-reuse-the-m9-wasm-host.md) | Executable artifacts reuse the M9 Wasm host; there is no new sandbox | Accepted | — |
| [0056](0056-executable-artifact-provenance-is-recorded-and-is-the-grant-source.md) | An executable artifact's provenance is recorded and is the source of its grant | Accepted | — |
| [0057](0057-seat-is-a-first-class-human-identity.md) | A Seat is a first-class human identity, keyed on the existing actor field | Accepted | — |
| [0058](0058-per-seat-fence-and-budget-nest-under-firm-ceilings.md) | Per-Seat Fence and budget nest under the firm ceilings, enforced by the one Broker | Accepted | — |
| [0059](0059-per-seat-working-memory-namespace.md) | Per-Seat working memory is an isolated namespace, default-deny at the human layer | Accepted | — |
| [0060](0060-self-approval-refused-structurally.md) | A Seat cannot approve its own Approval Request, and the refusal is structural | Accepted | — |
| [0061](0061-delegation-bounded-by-delegator-fence.md) | A delegation cannot exceed the delegator's Fence, and is time-boxed and logged | Accepted | — |
| [0062](0062-kernel-extracted-as-a-hosted-process-behind-a-new-apps-binary.md) | The kernel is extracted as a hosted process behind a new `apps/` binary, with the transport as the only change | Accepted | — |
| [0063](0063-client-kernel-transport-is-a-typed-rpc-preserving-the-command-query-surface.md) | The client↔kernel transport is a typed RPC that preserves the existing command/query surface and the Broker choke point | Accepted | — |
| [0064](0064-convergence-merges-append-only-event-streams.md) | Convergence merges append-only event streams under a deterministic total order | Accepted | — |
| [0065](0065-projection-conflict-surfaces-as-a-decision.md) | A projection conflict surfaces as a Decision, never auto-resolved | Accepted | — |
| [0066](0066-hash-chain-across-branches-reconciliation.md) | The hash chain is preserved across branches by per-device provenance; a merge rewrites no event | Accepted | — |
| [0067](0067-firm-template-carries-structure-never-data.md) | A Firm Template carries structure, never data — the boundary is defined and enforced | Accepted | — |
| [0068](0068-firm-templates-distribute-through-marketplace-install-grants-nothing.md) | Firm Templates distribute through the existing Marketplace trust chain, and installation grants nothing | Accepted | — |
| [0076](0076-self-review-proposes-never-enacts.md) | The self-review proposes and never enacts; structural change remains a Principal Decision | Accepted | — |
| [0077](0077-absorbability-test-is-computed-over-m26-metrics.md) | The absorbability test is Principle 13's test computed over M26 measured metrics, never an opinion | Accepted | — |
| [0078](0078-the-4.0-release-gate-is-a-proof-obligation-not-a-date.md) | The 4.0 release gate is a proof obligation, not a date | Accepted | — |
| [0079](0079-every-evolution-path-is-a-permanent-ci-gate.md) | Every evolution path is a permanent CI gate proving no escalation without a Principal Decision | Accepted | — |

## Format

Context → Options → Decision → Consequences. Consequences are split into what is accepted, what is gained,
and the reversal cost, because a decision record that lists only benefits is a marketing document.
