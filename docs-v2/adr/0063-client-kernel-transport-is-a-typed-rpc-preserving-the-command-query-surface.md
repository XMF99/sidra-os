# ADR-0063 — The client↔kernel transport is a typed RPC that preserves the existing command/query surface and the Broker choke point

**Status:** Accepted · **Date:** 3.0 "Chambers" design phase (M23) · **Supersedes:** —

## Context

ADR-0062 extracts the kernel as a hosted process behind `apps/kernel-server` and requires that nothing in
`services/*` or `packages/*` change. That leaves one thing to design: the boundary the desktop (and, later,
other clients) uses to reach the headless kernel. Today that boundary is Tauri IPC — a typed, capability-ACL'd
command surface between the untrusted renderer and the trusted Rust core (`/docs/01-technical-architecture.md`
§1, §4). The renderer "may call only commands in the generated `commands.ts` binding, which is derived from
the Rust command registry — the two cannot drift," and "all command payloads and responses are typed via
`ts-rs` generation from Rust types" (§4, rules 2–3). Events flow the other way as a typed push stream (§1).

The security model already treats that boundary as adversarial: the renderer is "treated as compromised in the
threat model. Nothing it can call can violate a fence" (§4, rule 5), and the Permission Broker is "the single
choke point. Every tool call passes through it" (`/docs/07-security-model.md` §4). The kernel is the only
component permitted to mutate state, and it does so through the fixed pipeline **validate → authorize →
persist → emit** (`/docs/02-system-design.md` §1).

M23 turns that in-process boundary into a network boundary. The question is whether the network boundary gets
to invent a new surface — a REST API, a GraphQL schema, a second command vocabulary — or whether it must carry
the *same* surface the in-process boundary already carries. Every guarantee the in-process boundary provides
(typed commands, no drift from the Rust registry, no ambient authority, one choke point) is a guarantee M23
must preserve, because the exit criterion is that the desktop becomes *one client* running the *same* flows,
not a rewrite.

## Options

1. **A new REST/HTTP+JSON API designed for the network.** Idiomatic for a hosted service; huge ecosystem. But
   it is a *second* surface: it does not derive from the command registry, so it can drift from it; it invites
   resource-shaped endpoints that do not map one-to-one onto commands, which means logic starts living in the
   API layer; and it makes the renderer's generated bindings and the network API two things to keep in sync.
   It reintroduces exactly the drift the Tauri rule (§4 rule 2) was written to prevent.
2. **A message queue / broker between client and kernel.** Decouples client and kernel; buys nothing here and
   contradicts `/docs/02-system-design.md` §9 ("No message broker. The in-process bus with a durable tail is
   sufficient... its semantics are stronger — total order — than most brokers give"). A broker also blurs the
   choke point: the Broker is a synchronous decision on the path of every call, not a thing you queue past.
3. **A typed RPC that carries the existing command/query/event surface verbatim over a network transport.**
   The transport is an *envelope*: it frames a command name, a typed payload, and a correlation id; ships them
   over a connection; and returns the typed response or the typed denial (`Allow` / `fenced` / `needs_approval`
   from `/docs/07-security-model.md` §4). The command and query *shapes* are the same types
   `packages/bindings` already generates from Rust via `ts-rs`; the RPC schema is generated from the *same*
   registry, so the network surface and the renderer surface cannot drift because they are the same surface.
   Events are the existing typed push stream, now delivered over the transport with a `since_seq` cursor
   exactly as the renderer already reconnects today (`/docs/02-system-design.md` §2).

## Decision

Option 3. **The transport is a thin, typed RPC over the existing command/query/event surface. It changes the
boundary's medium, not its shape.**

- **The surface shape is byte-for-byte the same generated bindings.** The RPC's request/response types are the
  command and query types already defined in `packages/domain` and projected into `packages/bindings`. M23
  adds a transport *codec* and a *dispatch adapter*; it does not add or rename a single command, query, event,
  or field. A schema-diff test (§20 of the architecture) asserts the generated surface is identical before and
  after M23.
- **The Broker remains the only choke point.** A command arriving over the transport enters the kernel at the
  same `Kernel::dispatch` entry point an in-process command enters today and runs the identical **validate →
  authorize → persist → emit** pipeline (`/docs/02-system-design.md` §1). The transport authenticates the
  *client* (per-client Seat identity, below) and then hands the command to the kernel; it performs **no**
  authorization of its own and **grants no ambient authority**. There is no path from the transport to state
  that bypasses the Broker. M23 adds a network hop *in front of* the choke point; it does not add a second
  choke point and it does not move the existing one.
- **The client authenticates once per connection, as a Seat.** The transport establishes *who the client is*
  before it will carry any command — a Seat identity (M21, ADR-0021: "every event carries a Seat ID"). Every
  command the client sends is dispatched under that Seat, so the `actor` field the chain already carries is
  populated by the authenticated transport identity rather than by an implicit single Principal. Authentication
  is per-client; there is no anonymous or ambient client.
- **The transport preserves the trust boundary the renderer boundary already had.** The client is still
  untrusted (renderer boundary, §4 rule 5): it holds no secrets, reaches no filesystem, and reaches no network
  except the kernel connection. A local client uses a loopback/OS-local socket; a remote client uses TLS. In
  both cases the connection is authenticated and the client cannot violate a fence — the property the
  in-process boundary guaranteed is the property the network boundary must guarantee.
- **Events stream over the same connection.** The kernel's durable event bus (`/docs/02-system-design.md` §2)
  pushes typed events to a subscribed client with a `since_seq` cursor; a client that drops and reconnects
  resumes from `seq` and "loses nothing," exactly as a webview reload does today. Backpressure is the existing
  bounded-channel-then-resync rule, unchanged.

## Consequences

**Accepted: a network hop on every command.** An in-process call becomes a serialise → send → dispatch →
respond round trip. For a local client this is a loopback socket, sub-millisecond; for a remote client it is
real network latency. Bounded by the performance budget (architecture §14): the transport must not regress the
cold-start or 60 fps client budgets (`/docs/01-technical-architecture.md` §8), and queries stay cacheable
client-side via the existing TanStack Query layer so reads do not become chatty.

**Accepted: a serialisation boundary where there was none.** In-process, a command payload was a Rust value;
over the transport it is serialised and deserialised. This is the same `serde`-JSON path Tauri IPC already uses
(§1: "serde-JSON over Tauri IPC"), so the codec is not new machinery — but it is now on the critical path for
every client, and a serialisation bug is a new failure mode. Bounded by the transport-equivalence test that
asserts identical results in-process and over RPC.

**Accepted: authentication becomes a first-class step.** In 1.0 the renderer's identity was implicit — there
was one Principal and one process. From M23 a client must prove a Seat identity before the transport carries
anything. This is new surface (session establishment, credentials) but it is the surface M21 exists to
provide; M23 consumes it rather than inventing it.

**Gained: no drift, by construction.** Because the RPC surface and the renderer's generated bindings are
projections of the same command registry, they cannot diverge — the property `/docs/01-technical-architecture.md`
§4 rule 2 established for the renderer now holds for every client, network or not. A command added in a future
milestone appears on both surfaces automatically because there is only one surface.

**Gained: the security model transfers intact.** Every mitigation in `/docs/07-security-model.md` — the choke
point, effect classes, fences, the untrusted-client assumption, redaction on every write path — applies
unchanged, because the transport did not move any of them. The threat model gains one row (a malicious client
over the transport) and its mitigation is "the same denials the in-process renderer already receives, because
it hits the same Broker."

**Gained: one surface serves every future client.** Companion (M18), additional Seats (M21), and any later
surface all speak the same typed RPC. The kernel does not learn about clients; clients learn the one surface.

**Reversal cost: low.** The transport is an adapter in front of the unchanged `Kernel::dispatch`. Reverting to
in-process is pointing the desktop's dispatch back at the in-process kernel and dropping the transport crate;
nothing in `services/*` or `packages/*` participated in the transport, so nothing there has to be undone.
