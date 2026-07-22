# ADR-0047 — Per-connector offline degradation contract

**Status:** Accepted · **Date:** 2.5 "Field" — M17

## Context

M17's exit criterion requires *"each degrades to offline without data loss."* The M16 framework specifies what
the kernel does when egress fails (M16 §8): return `Unreachable`, mark the connector state `Unreachable`, emit an
audit event, and let the caller decide.

What is unstated is what **a first-party connector manifest or transform must or must not do** when it degrades.
Specifically: **May a connector buffer a failed write locally?** E.g. when an issue edit or a mail send fails
offline, may the connector write the pending payload to disk and retry on reconnect?

This is a load-bearing security question. If a connector buffers a class-3 effect (e.g. `send_message`), that
effect fires automatically when connectivity returns — bypassing the moment the Principal confirmed it and
potentially firing long after the context that justified it has expired. If it buffers a class-2 effect without
event-log awareness, two devices offline create conflicting buffered states that silent-overwrite on reconnect
(violating Principle 10).

## Options

1. **Let each connector decide its offline stance.** `mail` buffers drafts; `git` buffers nothing; `issues`
   queues mutations. Complex, per-connector behaviour to document; risks silent auto-dispatch of class-3 effects
   when a connection returns. Rejected.
2. **Require all connectors to buffer offline mutations in local state.** Simulates offline capability. But
   violates Principle 10 (no unlogged state), risks duplicate/stale class-3 effects, and duplicates what the
   Vault event log already does. Rejected.
3. **No connector buffers a write. The Vault-held Work Order is the single record of intent; a connector fails
   cleanly, returns `Unreachable`, and leaves state to the kernel.** When offline, an invocation fails with
   `Unreachable`. The undispatched effect stays an unfulfilled Work Order intent in the Vault (M15). When
   connectivity returns, the Mission Engine or Orchestrator re-dispatches the Work Order — drawing a fresh
   egress check, fresh Broker grant check, and (if class 3) fresh confirmation. Zero connector-local queuing.

## Decision

Option 3.

**The offline degradation contract for all five first-party connectors is:**

1. **Clean refusal:** On network unreachability, host resolution failure, or timeout, the connector fails
   immediately with `Unreachable`. It never hangs, retries endlessly, or returns synthetic success.
2. **Zero connector-side buffering:** No connector manifest, transform, or helper may write a pending egress
   payload to disk, memory, or local storage for later dispatch.
3. **Intent stays in the Vault:** Undispatched work remains a Work Order state in the Vault event log. The
   Mission Engine's recovery loop (M15 E10) or Orchestrator's retry policy handles re-dispatch upon
   reconnect.
4. **Re-dispatch is full-path:** Re-dispatching a previously-failed effect runs the complete M16 egress path
   again — fresh Broker capability check, fresh egress host inspection, and for class-3 effects, fresh
   approval if the prior approval's window expired.

## Consequences

**Accepted: an offline action is not completed in the background on reconnect without kernel involvement.** A
mail send requested offline will not silently fire hours later when Wi-Fi returns.

**Gained: Principle 10 holds strictly across egress.** There is no hidden "pending egress queue" outside the
event log.

**Gained: simple, uniform implementation across all five connectors.** Every manifest's error handling is
identical: map host failure to `Unreachable`.

**Reversal cost: medium.** If a future connector genuinely requires local queuing (e.g. a high-throughput logging
sink), it must be designed with explicit Vault event integration, not ad-hoc connector-local buffering.
