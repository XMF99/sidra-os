# ADR index rows to append to docs-v2/adr/README.md
# The live index currently ends at 0044. Append these rows (in order) to the table,
# and copy the sibling 00xx-*.md files in this folder into docs-v2/adr/.

| # | Decision | Status | Supersedes |
|---|---|---|---|
| [0045](0045-marketplace-is-distribution-only.md) | The Marketplace is distribution-only; it reuses the M13 install path and adds no install or trust mechanism | Proposed | — |
| [0046](0046-the-concrete-five-connector-set.md) | The concrete five-connector set and their effect-class maps | Proposed | — |
| [0047](0047-per-connector-offline-degradation-contract.md) | The per-connector offline-degradation contract: no buffered writes | Proposed | — |
| [0048](0048-object-storage-addressing-and-chunking.md) | Object-storage addressing, chunking, and size limits | Proposed | — |
| [0049](0049-no-desktop-present-sync-and-idempotent-reconciliation.md) | No-desktop-present sync and idempotent reconciliation | Proposed | — |
| [0050](0050-companion-is-a-paired-untrusted-client.md) | The Companion is a paired, untrusted client | Proposed | — |
| [0051](0051-brief-travels-as-a-canonical-render-payload.md) | The Brief travels as a canonical render payload; the Companion displays, never re-renders or authors | Proposed | — |
| [0052](0052-speech-to-text-is-local-audio-never-leaves-the-device.md) | Speech-to-text is local-only; audio never leaves the device; voice produces a normal Directive | Proposed | — |
| [0053](0053-transcript-is-confirmed-before-submit.md) | The transcript is confirmed before submit; equivalence is defined against the confirmed text | Proposed | — |
| [0054](0054-executable-artifact-grant-subset-of-work-order.md) | An executable artifact's capability grant is a strict subset of its producing Work Order's grant | Proposed | — |
| [0055](0055-executable-artifacts-reuse-the-m9-wasm-host.md) | Executable artifacts reuse the M9 Wasm host; there is no new sandbox | Proposed | — |
| [0056](0056-executable-artifact-provenance-is-recorded-and-is-the-grant-source.md) | An executable artifact's provenance is recorded and is the source of its grant | Proposed | — |
| [0057](0057-seat-is-a-first-class-human-identity.md) | A Seat is a first-class human identity, keyed on the existing actor field | Proposed | — |
| [0058](0058-per-seat-fence-and-budget-nest-under-firm-ceilings.md) | Per-Seat Fence and budget nest under the firm ceilings, enforced by the one Broker | Proposed | — |
| [0059](0059-per-seat-working-memory-namespace.md) | Per-Seat working memory is an isolated namespace, default-deny at the human layer | Proposed | — |
| [0060](0060-self-approval-refused-structurally.md) | A Seat cannot approve its own Approval Request, and the refusal is structural | Proposed | — |
| [0061](0061-delegation-bounded-by-delegator-fence.md) | A delegation cannot exceed the delegator's Fence, and is time-boxed and logged | Proposed | — |
| [0062](0062-kernel-extracted-as-a-hosted-process-behind-a-new-apps-binary.md) | The kernel is extracted as a hosted process behind a new `apps/` binary, with the transport as the only change | Proposed | — |
| [0063](0063-client-kernel-transport-is-a-typed-rpc-preserving-the-command-query-surface.md) | The client↔kernel transport is a typed RPC that preserves the existing command/query surface and the Broker choke point | Proposed | — |
| [0064](0064-convergence-merges-append-only-event-streams.md) | Convergence merges append-only event streams under a deterministic total order | Proposed | — |
| [0065](0065-projection-conflict-surfaces-as-a-decision.md) | A projection conflict surfaces as a Decision, never auto-resolved | Proposed | — |
| [0066](0066-hash-chain-across-branches-reconciliation.md) | The hash chain is preserved across branches by per-device provenance; a merge rewrites no event | Proposed | — |
| [0067](0067-firm-template-carries-structure-never-data.md) | A Firm Template carries structure, never data — the boundary is defined and enforced | Proposed | — |
| [0068](0068-firm-templates-distribute-through-marketplace-install-grants-nothing.md) | Firm Templates distribute through the existing Marketplace trust chain, and installation grants nothing | Proposed | — |
| [0069](0069-calibration-is-a-revertible-projection-never-telemetry.md) | Calibration is a revertible projection over local outcome records, never a telemetry channel | Proposed | — |
| [0070](0070-calibration-adjusts-numbers-never-structure.md) | Calibration adjusts numeric parameters only, never a capability, a Standard, or the org chart | Proposed | — |
| [0071](0071-calibration-applied-only-if-it-narrows-error-and-is-inspectable.md) | A calibration is applied only if it measurably narrows error, and every adjustment is inspectable | Proposed | — |
| [0072](0072-regressing-revision-refused-acceptance-is-a-principal-decision.md) | A charter revision that regresses is refused at the gate, and acceptance is a Principal Decision | Proposed | — |
| [0073](0073-evaluation-set-is-the-versioned-merge-gate-proposer-is-never-reviewer.md) | The evaluation set is the archetype's versioned merge gate, and the proposer is never the reviewer | Proposed | — |
| [0074](0074-procedure-repeated-five-times-is-a-cited-candidate-workflow.md) | A procedure repeated five times is proposed as a cited candidate Workflow; activation is a Principal Decision | Proposed | — |
| [0075](0075-procedure-signature-is-a-normalized-order-preserving-digest.md) | "The same procedure" is a normalized, order-preserving signature over Work Order types | Proposed | — |
| [0076](0076-self-review-proposes-never-enacts.md) | The self-review proposes and never enacts; structural change remains a Principal Decision | Proposed | — |
| [0077](0077-absorbability-test-is-computed-over-m26-metrics.md) | The absorbability test is Principle 13's test computed over M26 measured metrics, never an opinion | Proposed | — |
| [0078](0078-the-4.0-release-gate-is-a-proof-obligation-not-a-date.md) | The 4.0 release gate is a proof obligation, not a date | Proposed | — |
| [0079](0079-every-evolution-path-is-a-permanent-ci-gate.md) | Every evolution path is a permanent CI gate proving no escalation without a Principal Decision | Proposed | — |
