# ADR-0055 — Executable artifacts reuse the M9 Wasm host; there is no new sandbox

**Status:** Accepted · **Date:** M20 architecture phase · **Supersedes:** — · **Milestone:** M20 (Executable Artifacts, 2.5 "Field")

## Context

M20 runs agent-authored code. Running untrusted code safely is the hardest security problem in the product, and
it is already solved: M9 shipped a Wasm Component Model host (Wasmtime) with deny-by-default isolation,
capabilities passed explicitly as typed WIT imports, fuel-metered execution, memory limits, an epoch deadline,
and no ambient filesystem, clock, network, or randomness (ADR-0006, `/docs/08-plugin-system.md`).

ADR-0006's final consequence anticipated M20 by name: *"the same isolation mechanism serves 2.0's sandboxed
agent-authored scripts, so we build it once."* The question for M20 is not *how do we sandbox agent-authored
code* — that answer exists — but *do we reuse the M9 host, or build a second one tuned for agent output?*

The temptation to build a second host is real: agent-authored code has a different provenance (a Work Order,
not an install), a different grant source (ADR-0054), and might seem to want a different runtime shape. But a
runtime is exactly the wrong place to express those differences. They are *authority* concerns, not *execution*
concerns.

## Options

1. **A second, purpose-built sandbox for executable artifacts.** Rejected: two sandboxes means two attack
   surfaces to audit, two places ambient authority can creep in, two fuel-metering implementations to keep
   honest, and two answers to "can this code open a socket?" A second sandbox is a second copy of the hardest
   security guarantee in the product, and copies drift.
2. **A relaxed sandbox because "the Firm authored it, so it's more trusted."** Rejected, emphatically. Model-
   authored code is untrusted by the same logic that makes model output untrusted (security model §2: "assume
   compromised … any model output"). Trusting agent-authored code *more* than plugin code inverts the threat
   model. The provenance being internal does not make the code safe; the sandbox makes it safe.
3. **Reuse the M9 host verbatim; add only a thin authority-and-provenance layer above it.** The artifact is a
   Wasm component the M9 host instantiates and runs, with the same fuel/memory/epoch caps and the same
   no-ambient-authority WIT world. M20's new crate supplies the *grant* (ADR-0054) and the *run record*, and
   calls `sidra-plugins` to actually run the code.

## Decision

Option 3.

An executable artifact runs in the existing M9 host (`services/plugins`), reused verbatim. Fuel metering, the
memory cap, the epoch deadline, the per-call instance lifecycle, and the absence of ambient filesystem, clock,
network, socket, and randomness (ADR-0006) all apply unchanged. The M20 crate `sidra-artifacts-exec` is a thin
Layer-1 layer *over* the M9 host: it validates the artifact, derives and freezes its grant, instantiates it
through `sidra-plugins`, routes every effect through the Broker via the M9 broker-mediated host-function set,
and records the run. It adds **no** host function that is not an existing Broker-routed shim, and it introduces
**no** new WIT interface into the guest world.

The only thing that is new is *where the grant comes from* — a Work Order (ADR-0054), not an install-time
consent screen. That is an authority difference, expressed in the authority layer, not the runtime.

A CI check asserts the artifact host-function set is a subset of the M9 set, and a no-ambient-authority test
asserts the guest world contains no filesystem/clock/network/socket/randomness interface.

## Consequences

**Accepted: executable artifacts inherit every M9 constraint, including the friction ones.** No threads, no
arbitrary native libraries, a marshalling boundary, coarse time only, seeded randomness only. An agent that
wants a wall clock or a random nonce works within the seeded/coarse primitives, exactly as a plugin author
does. This is the ADR-0006 trade, accepted again unchanged.

**Accepted: the M20 authority layer depends on `services/plugins`.** If the M9 host changes shape, the M20 layer
tracks it. This is the correct coupling direction (authority over runtime) and is cheaper than owning a second
runtime, but it is a real dependency and is stated in the dependency graph.

**Gained: one sandbox, audited once.** Every guarantee ADR-0006 makes — no socket, no filesystem, fuel-bounded,
memory-bounded — is true for executable artifacts for free, because they run in the same host. There is no
second place a sandbox escape can live, and no second fuel implementation to keep honest.

**Gained: the threat model stays coherent.** Agent-authored code is untrusted, sandboxed exactly as plugin code
is. "Assume compromised: any model output" (security model §2) extends to agent-authored executables without a
special case. The Broker remains the one choke point for every effect, plugin or artifact.

**Gained: M20 is small.** Because the runtime is reused, M20 is an authority-and-provenance layer plus three
migrations — not a runtime project. The exit criterion is reachable because the hard part was done in M9.

**Reversal cost: low to build a second sandbox later, high to justify it.** Nothing structurally prevents a
future milestone from introducing a separate runtime, but it would have to argue why two sandboxes are worth
two audits, and ADR-0006's "build it once" plus this ADR are the standing answer that it is not.
