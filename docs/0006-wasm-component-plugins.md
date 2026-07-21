# ADR-0006 — WASM Component Model for plugins

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Plugins extend Sidra OS with tools, ingestors, panels, and playbooks. They run inside an application whose
core promise is that nothing exceeds its Fence. A plugin is, by definition, code the Principal did not write
and we did not review, executing next to their encrypted life's work.

## Options

1. **Native dynamic libraries.** Fast and unrestricted; a plugin has the full authority of the host process,
   which makes every capability guarantee in this documentation false the moment one is installed.
2. **An embedded scripting runtime** (JS/Lua). Familiar and sandboxable in principle; sandbox escapes in
   embedded JS engines are a recurring genre, and the host boundary is defined by what we remember to remove.
3. **Subprocess with IPC.** Real OS-level isolation; heavy per-call, awkward to distribute across three
   platforms, and the sandbox is per-platform work we would own.
4. **Wasmtime with the WASM Component Model.** Deny-by-default isolation, capabilities passed explicitly as
   typed imports, fuel-metered execution, memory limits, and language-agnostic authoring via WIT interfaces.

## Decision

Wasmtime with the Component Model. Plugins declare capabilities in a manifest; the host grants them
explicitly and individually; the Permission Broker mediates every granted call exactly as it does for
first-party tools. Fuel metering bounds CPU, memory limits bound allocation, and there is no ambient
filesystem, clock, randomness, or network — each is a capability or it does not exist.

## Consequences

**Accepted:** authoring friction. Plugin authors compile to Wasm and work through WIT interfaces rather than
writing a quick script. We reduce this with a template repository, two reference plugins, and a developer-mode
path — but it remains higher friction than a scripting API, and that is the trade.

**Accepted:** the Component Model tooling is still maturing, and we will occasionally be early adopters of a
fix.

**Accepted:** a per-call overhead of roughly a hundred microseconds. Irrelevant against a model call.

**Gained:** the capability documentation is enforced by the runtime rather than by convention. A plugin
granted `vault:read` cannot open a socket, and this is a property of the sandbox rather than a promise in a
review checklist.

**Gained:** language independence — Rust, Go, and increasingly others — without a per-language host.

**Gained:** the same isolation mechanism serves 2.0's sandboxed agent-authored scripts, so we build it once.
