# ADR-0047 — The per-connector offline-degradation contract: no buffered writes

**Status:** Proposed · **Date:** 2.5 "Field" — M17

## Context

The M17 exit criterion requires that each of the five connectors *"degrades to offline without data loss"*
(`/MILESTONE_REGISTRY.md` §4). M16 established that a connector whose host is unreachable transitions to
`Unreachable` and fails calls cleanly (M16 §3, §15, AC7), and that this satisfies the Layer-6 replaceability
test (`02-layer-model.md` §9): disconnect everything and local work continues.

But "without data loss" for a connector that performs **writes** — `open_pull_request`, `create_issue`,
`send_message`, `put_object` — raises a question M16 did not have to answer, because M16 shipped no connector
that writes. When an agent's Work Order wants to send a mail and the mail host is unreachable, what happens to
the intended send?

The tempting answer is a durable outbound queue: buffer the write, retry on recovery. Every mature integration
library does this. But a buffered external effect is two hazards at once. **It is a place data can be lost** —
the buffer is now a second store of truth that must survive crashes, and if it does not, the send is gone.
**And it is a place an effect can fire twice** — a retry that cannot confirm whether the prior attempt reached
the recipient will either drop the send or duplicate it, and for a class-3 irreversible effect (a mail sent, a
branch merged, an object deleted) duplication is as bad as loss.

The Firm already has a durable store of intent that survives crashes and is replayable: the Vault and the
event log (ADR-0002). A Work Order that wants to send a mail *is already persisted* as a Work Order. The
question is whether the connector should hold a *second* copy of that intent, or defer to the one that already
exists.

## Options

1. **Durable outbound queue per connector.** Buffer writes, retry with backoff on recovery, dedupe with
   idempotency keys. Standard, and wrong for this system: it creates a second source of truth for pending
   effects outside the Vault, it must independently guarantee exactly-once against services that do not all
   support idempotency keys, and it puts an irreversible external effect (class 3) on an *automatic* retry
   path — the exact thing the effect-class policy exists to keep behind a Principal (security model §5).
2. **Best-effort fire-and-forget.** On offline, drop the write and log it. No double-fire, but this *is* data
   loss — the intended send simply vanishes — which the exit criterion forbids.
3. **No connector-side buffer; the Vault-held Work Order is the single record of intent.** On offline, the
   call fails cleanly, the connector marks `Unreachable`, and the *Work Order that wanted the effect stays in
   the Vault as an intent* (for a class-3 op, as an approved-but-undispatched Approval Request). Recovery does
   not trigger a connector replay; the **Firm re-dispatches the Work Order**, exactly once, through the normal
   invocation path. Nothing is lost because nothing was ever moved out of the Vault into a connector buffer;
   nothing fires twice because there is one dispatch path and one record of whether it completed.

## Decision

Option 3, made the uniform contract for all five connectors: **no first-party connector buffers, queues,
batches, or replays a write.**

The mechanism, per operation:

- A read that cannot reach its host fails within the configured timeout; the connector marks `Unreachable`;
  local work continues on the Vault (M16 AC7, unchanged).
- A write (class 2) or external effect (class 3) that cannot dispatch fails cleanly with `Unreachable`. The
  Work Order that requested it is **not** discarded and its intent is **not** copied into a connector queue —
  it remains a Work Order (for class 3, an approved Approval Request awaiting dispatch) in the Vault.
- On `ConnectorRecovered`, the connector does nothing autonomously. The Firm re-dispatches the Work Order
  through `invoke_connector` exactly as it would any pending Work Order — one dispatch, one completion record
  on the hash chain.
- `object-storage` `put_object` interrupted mid-transfer **aborts** its S3 multipart session so no partial
  object is visible; the re-dispatch is a clean fresh upload, not a resume of a half-written object.

"Without data loss" therefore means: the record of what the Firm intended never left the Vault, so an outage
cannot lose it; and there is exactly one dispatch path, so recovery cannot double-fire it.

## Consequences

**Accepted: recovery is not instantaneous or automatic at the connector.** A send that failed offline waits
for the Firm to re-dispatch the Work Order, not for a connector retry timer. This is slower than a background
queue — and correct, because a class-3 effect re-dispatching through the normal path re-crosses the Broker and
(for class 3) is still gated, rather than firing from a buffer that has forgotten it was ever gated.

**Accepted: connectors cannot promise "guaranteed eventual delivery."** They promise "clean failure and a
preserved intent." A caller that needs delivery confirmation reads the Work Order's completion state, not a
connector queue depth.

**Gained: no connector is a second store of truth.** There is one place pending intent lives — the Vault —
and it already has crash-safety, replay, and audit (ADR-0002). The connectors add no durability surface to get
wrong.

**Gained: no double-fire of an irreversible effect.** A merged PR, a sent mail, a deleted object cannot happen
twice, because recovery re-runs the *Work Order*, whose completion is recorded once on the hash chain, not a
buffered call whose completion is ambiguous.

**Gained: the offline exit-criterion clause is testable without exactly-once machinery.** The test interrupts
a write, recovers, and asserts the effect fired exactly once and the intent was never lost — provable because
the intent is a Vault record, not a connector-internal buffer state.

**Reversal cost: moderate.** Introducing a durable per-connector queue later would mean adding a second
intent store, an idempotency strategy per service, and an automatic retry path for class-3 effects — the last
of which would itself need an ADR arguing why an irreversible external effect may fire without re-crossing the
Broker. That argument is exactly why the buffer is refused now, in design, before any connector exists to grow
one.
