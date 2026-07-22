# Kernel Extraction — Architecture

**Milestone M23 · Release 3.0 "Chambers" · the 3.0 topology**

| | |
|---|---|
| Milestone | M23 — Kernel Extraction (`/MILESTONE_REGISTRY.md` §4, 3.0 "Chambers") |
| Release | 3.0 "Chambers" — the Firm admits colleagues |
| Kind | **Topology / packaging** — a hosted deployment of the existing kernel, not a source reorganisation |
| New crate | `sidra-kernel-server` at `apps/kernel-server/` (a binary) + a transport codec/adapter |
| Depends on | M11 (kernel-as-library / department substrate), M21 (Seats — multi-client identity) |
| Anchored to | ADR-0011 (the seven-directory monorepo, designed for exactly this), ADR-0001 (a Rust core reusable verbatim as a server) |
| New decisions | ADR-0062 (kernel extracted behind a new `apps/` binary; the transport is the only change), ADR-0063 (a typed RPC preserving the command/query surface and the Broker choke point) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | **The kernel runs headless; the desktop app becomes one client; no file moved, no import rewritten** — proven by a diff/CI assertion, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `/docs/01-technical-architecture.md` about
> the trusted-core / untrusted-renderer boundary (§1, §4), that document governs and this one is a defect to
> report. Where it disagrees with `/docs/03-folder-structure.md` about the seven directories or the dependency
> direction (§1.7), that document governs. Where it disagrees with ADR-0011 or ADR-0001 about the intent of
> the extraction, those ADRs govern. Where it disagrees with ADR-0021 about what a Seat is, ADR-0021 governs.
> This architecture *extends* those boundaries into a hosted topology; it never re-decides them. In
> particular, M23 introduces **no new trust mechanism, no new choke point, and no new authority** — it changes
> the medium of an existing boundary and nothing else.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M22 the Firm is one OS process: a trusted Rust kernel and an untrusted webview inside a single Tauri
application (`/docs/01-technical-architecture.md` §1, §3). That was correct for 1.0 and 2.0 — one Principal,
one machine, one window. 3.0 "Chambers" changes the premise: *the Firm admits colleagues*
(`/MILESTONE_REGISTRY.md` §3). More than one human, from more than one surface, needs to reach the same
kernel — the desktop today, the Companion (M18) tomorrow, additional Seats (M21) after that. A kernel that
only one in-process renderer can reach cannot serve a colleague sitting at a second machine.

The requirement is not "add a network API." A kernel that speaks a new, hand-written network surface is a
second command vocabulary that will drift from the first, a place for business logic to leak out of
`services/*`, and a new attack surface with its own authorization to get wrong. The requirement is narrower
and sharper: **run the *existing* kernel headless, behind a *new* binary, so that the desktop becomes one
client among several — carrying the *same* typed command/query/event surface over a network boundary, through
the *same* Permission Broker choke point, with no file in the kernel moved and no import rewritten.**

This is not a new capability the Firm gained. It is the collection of a debt two decisions took on before M1.
ADR-0011 chose a domain-oriented monorepo — `apps/` for launchable products, `services/` for the kernel's
capabilities one crate each, `packages/domain ← services/* ← apps/*` for the dependency direction — and stated
the payoff in one sentence: *"Extracting the kernel to a server is selecting a subset of `services/` and
adding a binary under `apps/`, with no file moved and no import rewritten."* ADR-0001 chose Rust for the core
so that *"the same crate becomes the 3.0 server binary."* M23 is the milestone those sentences were written
for. Its headline deliverable is therefore unusual: **the deliverable is that nothing in the source tree had
to change.** Making that provable — a diff a reviewer reads in one sitting — is the work.

### 1.2 The stance

Two commitments define the extraction, and each has an ADR:

1. **The kernel is extracted as a hosted process behind a new `apps/` binary; the transport is the only
   change.** (ADR-0062) A new crate `apps/kernel-server` is *added*. It constructs the same `Kernel` the
   desktop constructs today, opens the Vault, and serves the command/query/event surface headless. `services/*`
   and `packages/*` are *unchanged* — not one file moved, not one import rewritten — because those crates
   already have "no dependency on Tauri and no knowledge of which process they run in"
   (`/docs/03-folder-structure.md` §1.2). `apps/desktop` stays; only its command dispatch changes, from
   in-process to a client of the transport.
2. **The client↔kernel transport is a typed RPC preserving the existing command/query surface and the Broker
   choke point.** (ADR-0063) The transport is a thin envelope over the *same* types `packages/bindings`
   already generates from Rust. It authenticates the client as a Seat, then hands each command to the same
   `Kernel::dispatch` entry point, which runs the identical **validate → authorize → persist → emit** pipeline
   (`/docs/02-system-design.md` §1). The transport performs no authorization of its own and grants no ambient
   authority. The surface *shape* is byte-for-byte the same generated bindings.

### 1.3 What the extraction is, mechanically

M23 is a **topology and packaging change**. It adds exactly three things and moves nothing:

```
apps/kernel-server   ← ADDED — a headless binary that hosts the existing Kernel (ADR-0062)   (M23, THIS DOC)
a transport codec     ← ADDED — a typed RPC envelope over the existing surface (ADR-0063)
the desktop's client  ← CHANGED — sidra-app dispatches over the transport instead of in-process
```

Everything else is the kernel that already exists. The kernel that runs headless and the kernel that runs
inside the desktop are the **same crate graph**: one `sidra-kernel`, one set of `services/*`, one
`packages/domain`. Whether the kernel runs in one process with a webview or headless behind a socket is now a
*deployment* choice, not a source-tree fact. This is the exact parallel to how M16 introduced no new trust
mechanism by reusing the plugin chain, the department grant model, and the M3 security kernel — M23 introduces
no new kernel by reusing the one that has existed since M1.

### 1.4 What the extraction must never become

- **A source reorganisation.** No `server/` root, no `client/` root, no `shared/` crate carved out of
  `packages/domain`, no split of the command registry into "local" and "remote" halves. Every such move is a
  lie about what ADR-0011 already accomplished, rewrites imports that were correct, and destroys the one claim
  the milestone exists to prove. The CI "no source move" assertion (§20) fails the build on any such change.
- **A second Broker.** The transport authenticates a client and then hands the command to the *existing* choke
  point. It does not decide `Allow` / `Deny` / `NeedsApproval` — the Permission Broker does, unchanged
  (`/docs/07-security-model.md` §4). M23 adds a network hop *in front of* the one choke point; it never adds a
  second one and never moves the existing one.
- **A transport that leaks authority.** The transport grants no ambient authority. A client that connects and
  authenticates as a Seat can do exactly what that Seat's Fences allow, narrowed per Work Order, through the
  Broker — no more. The client is still untrusted (renderer boundary, `/docs/01-technical-architecture.md` §4
  rule 5): no secrets, no filesystem, no network except the kernel connection. A malicious client receives the
  same denials the in-process renderer already receives, because it hits the same Broker.
- **A second command surface.** No REST resources, no GraphQL schema, no hand-written network vocabulary. The
  RPC carries the *same* command/query/event types the renderer already calls, generated from the *same*
  registry, so the two cannot drift because they are one surface (ADR-0063). A command added later appears on
  every client automatically because there is only one surface.
- **A second history.** Nothing forks. The event log (ADR-0002), the audit chain, and the Vault remain single
  and canonical whether the kernel runs headless or in the desktop — the same "do not split the Firm's
  history" argument ADR-0021 made for Seats.

### 1.5 Relationship to existing concepts

| Existing concept | How M23 relates |
|---|---|
| The renderer boundary (`/docs/01-technical-architecture.md` §1, §4) | M23 turns the in-process Tauri IPC boundary into a network/RPC boundary carrying the *same* typed command/query surface. Every renderer-boundary rule (no secrets/fs/net, generated bindings, treated-as-compromised) transfers to every client. |
| The Permission Broker (`/docs/07-security-model.md` §4) | Unchanged and still the single choke point. Every command over the transport reaches `Kernel::dispatch` and runs validate → authorize → persist → emit. The transport authenticates the client; it never authorizes an action. |
| The event bus (`/docs/02-system-design.md` §2) | Unchanged. Events stream to a subscribed client over the transport with a `since_seq` cursor; a reconnecting client resumes from `seq` and loses nothing, exactly as a webview reload does today. |
| The dependency direction (ADR-0011, `/docs/03-folder-structure.md` §1.7) | Preserved and *depended upon*. `packages/domain ← services/* ← apps/*`; `apps/kernel-server` and `apps/desktop` both sit at the `apps/*` layer and depend on `services/*`; `services/*` gains no new edge. A CI check enforces the arrows, as it already does. |
| Seats (M21, ADR-0021) | The transport authenticates each client as a Seat. ADR-0021 already put a Seat ID on every event from 2.0; M23 is the milestone that finally *uses* it for a second client, which is the payoff ADR-0021 named. |
| The department substrate (M11) | M11 made the kernel a library that runs the Firm "as one implicit department with byte-identical behaviour" (`/MILESTONE_REGISTRY.md` §4). That kernel-as-library is exactly what `apps/kernel-server` hosts. M23 depends on M11 for the substrate it serves. |
| The desktop `sidra-app` (`/docs/03-folder-structure.md` §1.1) | Stays. Keeps the Tauri shell, window, tray, updater, and renderer. Only its command dispatch changes — from in-process to a client of the transport — and the bindings it presents to its renderer do not change shape. |
| `apps/cli` (`sidractl`) | Already reuses `services/*` unchanged (`/docs/03-folder-structure.md` §1.1). It is the existing proof that a second, non-desktop consumer of the kernel is normal; `kernel-server` is a third consumer, this time over a socket rather than in-process. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | The kernel runs headless behind a new `apps/` binary | ADR-0062; `apps/kernel-server` hosts the existing `Kernel`; §3 lifecycle |
| G2 | No file in `services/*` or `packages/*` is moved, and no import is rewritten | ADR-0062; §6 BEFORE/AFTER; the CI "no source move" assertion (§20, AC-K1) |
| G3 | The desktop becomes one client among several, with no change to the surface it presents its renderer | ADR-0062/0063; §10; the generated bindings are unchanged (§20, AC-K7) |
| G4 | The transport carries the existing command/query/event surface, byte-for-byte the same bindings | ADR-0063; §10; schema-diff test (§20, AC-K7) |
| G5 | The Permission Broker remains the only choke point; no new authorization and no ambient authority | ADR-0063; §7, §8; the transport authenticates, the Broker authorizes (§9) |
| G6 | Each client authenticates as a Seat; every command is attributed to that Seat on the chain | M21/ADR-0021; §9; audit event per session (§11) |
| G7 | The transport preserves every guarantee the in-process boundary had (untrusted client, no secrets/fs/net) | §7; renderer-boundary rules transferred verbatim (`/docs/01-technical-architecture.md` §4) |
| G8 | An RPC call and an in-process call produce identical results | §8; transport-equivalence test (§20, AC-K8) |
| G9 | The headless kernel does not regress the client cold-start or 60 fps budgets | §14; local-socket latency budget; the equivalence test measures it |
| G10 | The extraction is additive and reversible | ADR-0062; deleting `kernel-server` and repointing the desktop reverts M23; single-client deployment is unchanged behaviour |
| G11 | A second client can connect concurrently, distinguished on the chain | §9, §15.2; the second-client acceptance test (§20, AC-K9) |

---

## 3. Kernel-server lifecycle

### 3.1 States

The `apps/kernel-server` process has a lifecycle of its own, distinct from any client session (§5). It governs
the shared kernel; a client session is a connection *to* a running server.

```
        launch (config + Vault path)
  ──────────────────────────────────────────►  STARTING
                                                   │  open Vault, integrity_check, replay (system-design §6)
                                                   ▼
                                                READY ──────────────┐
                                                   │                │ bind transport (local socket / TLS)
                                       transport bound              │
                                                   ▼                │
                                              SERVING ◄─────────────┘
                                                   │  accept client sessions (§5), dispatch commands
                                                   │
                                    drain signal   │        integrity fault / fatal
                                                   ▼        ▼
                                              DRAINING ──► STOPPED (Vault closed, keys zeroized)
                                     (reject new sessions; let in-flight commands finish)
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `launch` | Starting | config valid; Vault path resolvable |
| Starting | `vault_opened` | Ready | `integrity_check` passes; replay of non-terminal Engagements complete (`/docs/02-system-design.md` §6) |
| Starting | `integrity_fail` | Stopped | refuse to open; offer last snapshot (system-design §6.1); no partial serving |
| Ready | `bind_transport` | Serving | transport bound to the configured endpoint (local socket or TLS listener); auth configured |
| Serving | `accept_session` | Serving | client authenticates as a Seat (§5); session admitted |
| Serving | `drain` | Draining | stop signal received; no new sessions accepted |
| Draining | `in_flight_empty` | Stopped | all in-flight commands committed or failed on their own; Vault closed; keys zeroized |
| Serving \| Draining | `fatal` | Stopped | Vault closed; keys zeroized; partials retained (failure philosophy, `/docs/01-technical-architecture.md` §9) |

### 3.3 Invariants

1. **The server serves only from `Serving`.** A client that connects before `Serving` or after `Draining`
   receives a typed `unavailable` and is not admitted. No command is dispatched from any other state.
2. **The Vault is opened exactly once, by the server.** In a hosted deployment the kernel-server owns the
   single writer connection (`/docs/02-system-design.md` §5). Clients never open the Vault; they reach it only
   through dispatched commands. This is the same "the kernel is the only component permitted to mutate state"
   rule (`/docs/02-system-design.md` §1), now with the client on the far side of a socket.
3. **`Stopped` zeroizes keys and closes the DB**, exactly as auto-lock does today (`/docs/07-security-model.md`
   §8: "Locked = keys zeroized, DB closed"). A stopped server holds no secret in memory.
4. **Draining never drops committed work.** In-flight commands complete or fail on their own; the recovery
   contract (`/docs/02-system-design.md` §6) is unchanged — a `kill -9` of the server loses at most one
   in-flight model call, never committed state.

---

## 4. Domain model

M23 adds a small vocabulary at the `apps/` layer — the server, a client session, and the transport envelope.
It adds **nothing** to `packages/domain` or `services/*`: the command, query, and event types are the ones
that already exist. The new types describe *how a client reaches the kernel*, never *what the kernel does*.

### 4.1 Core types

```
ClientId(String)              // stable id for an enrolled client (a device/surface), e.g. "desktop-mac-01J..."
SessionId(Ulid)              // one live connection; ephemeral, not persisted (a connection, not a record)
SeatId(String)               // from M21 / ADR-0021 — the human identity a client authenticates as
TransportEndpoint            // local socket path | TLS host:port
CorrelationId(Ulid)          // ties a request to its response over the wire
SinceSeq(u64)                // the event-cursor a client resumes from (system-design §2)
```

`Command`, `Query`, `Event`, `Capability`, `Broker`, `Decision` are **not** listed here because M23 does not
define them — they live in `packages/domain` and `services/*` already (`/docs/01-technical-architecture.md`
§6) and are carried over the transport unchanged (§10).

### 4.2 `KernelServer` — the hosted process

```
KernelServer {
    kernel:      Kernel,           // the SAME Kernel the desktop constructs (technical-arch §6) — not a new one
    endpoint:    TransportEndpoint,
    auth:        SeatAuthenticator, // authenticates a client as a Seat (M21); performs NO action authorization
    sessions:    Map<SessionId, ClientSession>,   // live connections, in memory only
    state:       ServerState,      // Starting | Ready | Serving | Draining | Stopped (§3)
}
```

The `KernelServer` is a *host*, not a *kernel*. It owns no capability; every capability it exposes already
lives in `services/*`. Its entire job is: open the Vault once, bind the transport, authenticate clients, and
route each command to `kernel.dispatch(...)` — the identical entry point the desktop uses in-process.

### 4.3 `ClientSession` — one live connection

```
ClientSession {
    id:          SessionId,        // ephemeral — a session is a connection, not a persisted record
    client_id:   ClientId,         // which enrolled client (see §12 enrollment)
    seat:        SeatId,           // the authenticated Seat; every command in this session runs as this Seat
    endpoint:    TransportEndpoint,
    subscribed:  Option<SinceSeq>, // present once the client subscribes to the event stream
    opened_at:   Timestamp,
    state:       SessionState,     // §5
}
```

A `ClientSession` is the network analogue of the renderer's in-process connection to the kernel. Crucially it
is **ephemeral** — it lives only while the connection lives, exactly as the renderer's IPC connection is not a
row in the database today. A session is *who is connected right now*; it is not history. History is the event
log, and every command the session dispatches lands there under the session's Seat (§11).

### 4.4 `TransportEnvelope` — the wire shape

The envelope is the *only* new shape M23 puts on the wire. It frames one of the existing surface types; it
does not replace or reshape it.

```
TransportEnvelope =
  | Request  { correlation: CorrelationId, kind: RequestKind, payload: <existing command|query type> }
  | Response { correlation: CorrelationId, result:  <existing response type | DenyReason> }
  | EventPush{ seq: u64, event: <existing Event type> }
  | Control  { AuthChallenge | AuthResponse | Subscribe{since:SinceSeq} | Ping | Bye }

RequestKind = Command | Query        // the two mutating/reading surfaces (system-design §1)
DenyReason  = Fenced{missing:Capability} | NeedsApproval{ask,expires} | Unavailable | Unauthenticated
```

`payload` and `result` are the **existing** generated types (§10). `DenyReason` is the existing Broker outcome
set (`/docs/07-security-model.md` §4: `Allow` / `Deny{missing}` / `NeedsApproval{ask,expires}`) plus two
transport-level outcomes (`Unavailable` when the server is not `Serving`, `Unauthenticated` when the session
has not established a Seat). No business type is new.

### 4.5 The unchanged command/query surface (ASCII)

```
  packages/domain            services/*                 the surface (packages/bindings)
 ┌───────────────┐         ┌──────────────┐            ┌───────────────────────────────┐
 │ Command, Query│  ◄───── │ Kernel        │  ──ts-rs──►│ commands.ts / queries.ts      │
 │ Event, Decision│        │ ::dispatch    │  generate  │ event types (UNCHANGED by M23)│
 └───────────────┘         └──────┬───────┘            └───────────────┬───────────────┘
                                  │                                    │  same shape, two mediums
              in-process (desktop, 1.0/2.0)                network/RPC (M23, any client)
                                  │                                    │
                        Kernel::dispatch  ◄────────── TransportEnvelope carries the SAME types
                                  │
                     validate → authorize(Broker) → persist → emit   (system-design §1, UNCHANGED)
```

The point of the diagram: the transport is a *second medium* for the *same* surface. The generated bindings
that the renderer calls and the types the RPC frames are one thing, so they cannot drift.

### 4.6 Relationships

```
KernelServer 1 ──── 1 Kernel                 (hosts the same kernel; does not own capabilities)
KernelServer 1 ──── * ClientSession          (live connections, in memory only)
ClientSession * ──── 1 SeatId                 (each session runs as exactly one authenticated Seat — M21)
ClientSession * ──── 1 ClientId               (each session belongs to one enrolled client — §12)
TransportEnvelope carries ∈ {Command, Query, Event}   (the existing surface — no new business type)
Kernel::dispatch is reached identically by  in-process desktop  AND  transport session  (one choke point)
```

---

## 5. Client session state machine

A session is the network analogue of the renderer connecting to the in-process kernel. It must establish *who
the client is* (a Seat) before the transport will carry any command — there is no anonymous or ambient client.

### 5.1 States

```
        connect (transport reachable, server Serving)
  ─────────────────────────────────────────────────►  CONNECTED
                                                          │  AuthChallenge / AuthResponse (Seat credential)
                                                          ▼
                                                    AUTHENTICATED ───────────────┐
                                                          │  Subscribe{since_seq}  │ (optional; a client may
                                                          ▼                        │  command without subscribing)
                                                     SUBSCRIBED                    │
                                                          │◄──────────────────────┘
                                                          │  command / query  (each dispatched as this Seat)
                                                          ▼
                                                      ACTIVE ──(idle)──► ACTIVE
                                                          │  Bye | connection lost | server Draining
                                                          ▼
                                                    DISCONNECTED (terminal for this session; ephemeral, nothing persisted)
```

### 5.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `connect` | Connected | server in `Serving` (§3); endpoint reachable; TLS handshake ok for a remote client |
| Connected | `authenticate` | Authenticated | Seat credential validates against the client's enrollment (§12); Seat exists (M21) |
| Connected | `auth_fail` | Disconnected | credential invalid or client not enrolled; `Unauthenticated`; no command ever carried; logged (§11) |
| Authenticated | `subscribe` | Subscribed | `since_seq` valid; event stream attached from `seq` (system-design §2) |
| Authenticated \| Subscribed | `command` \| `query` | Active | dispatched to `Kernel::dispatch` **as the session's Seat**; the Broker decides the outcome (§9) |
| Active | `idle` | Active | — |
| any (post-Connected) | `bye` \| `connection_lost` \| `server_drain` | Disconnected | in-flight command completes or fails on its own; session discarded; nothing persisted (it was ephemeral) |

### 5.3 Invariants

1. **No command is carried before `Authenticated`.** The transport refuses any `Request` from a `Connected`
   (not yet authenticated) session with `Unauthenticated`. Authentication is per-session and never implicit.
2. **Every command in a session runs as the session's Seat.** The `actor` on the resulting event
   (`/docs/02-system-design.md` §2 schema; ADR-0021) is the session's authenticated Seat, not an implicit
   Principal. Two sessions for two Seats produce events the chain distinguishes — the M21 exit criterion,
   reached over the transport.
3. **A session is ephemeral; losing it loses no committed state.** A dropped connection discards the session
   object and nothing else. A reconnecting client re-authenticates and resubscribes from its last `since_seq`,
   resuming the event stream with no loss — the existing webview-reload guarantee (`/docs/02-system-design.md`
   §2), now over the network.
4. **A disconnect mid-command never corrupts state.** The in-flight command is a kernel transaction
   (`/docs/02-system-design.md` §5: "transaction boundary = one kernel command"); it commits fully or not at
   all regardless of whether the client is still connected to hear the response.

---

## 6. Repository structure — the proof that no file moved

This is the section the milestone turns on. BEFORE is the tree through M22; AFTER is the tree at M23. The only
differences are **additions under `apps/`** and a **changed dispatch inside `apps/desktop`**. `services/*` and
`packages/*` are identical, character for character.

### 6.1 BEFORE (through M22) — abbreviated to the relevant subtrees

```
SidraOS/
├── apps/
│   ├── desktop/                    # sidra-app: Tauri shell + renderer
│   │   ├── src-tauri/
│   │   │   ├── Cargo.toml           # crate: sidra-app
│   │   │   ├── capabilities/        # Tauri ACLs — the renderer's permission surface
│   │   │   └── src/{main,ipc,windows,tray,updater}.rs   # ipc.rs dispatches commands IN-PROCESS
│   │   └── src/                     # renderer (React 19)
│   ├── companion/                   # 2.5 mobile surface (M18)
│   └── cli/                         # sidractl — already reuses services/* unchanged
│
├── services/                        # the kernel's capabilities, one crate each — NO Tauri, process-agnostic
│   ├── kernel/          # sidra-kernel        — command/query API, event bus, lifecycle, recovery
│   ├── store/           # sidra-store         — SQLite, migrations/, repositories
│   ├── security/        # sidra-security      — broker, capability, fence, audit chain, crypto, keychain
│   ├── memory/  models/  orchestrator/  agents/  tools/  ingest/  plugins/
│
├── packages/
│   ├── domain/          # sidra-domain — pure types (Command, Query, Event, Decision), zero I/O
│   ├── bindings/        # GENERATED from domain via ts-rs — the surface the renderer calls
│   └── design/ ui/ tool-sdk/ plugin-sdk/ testkit/
│
└── infrastructure/
    ├── ci/                          # dependency-direction check already lives here
    └── testing/                     # integration, chaos, redteam, injection, perf, e2e
```

### 6.2 AFTER (M23) — additions marked `NEW`, the one change marked `CHANGED`

```
SidraOS/
├── apps/
│   ├── desktop/                    # sidra-app — STAYS. Tauri shell + renderer UNCHANGED in shape.
│   │   ├── src-tauri/
│   │   │   └── src/ipc.rs           # CHANGED — dispatches over the transport as a CLIENT, not in-process.
│   │   │                            #           The bindings it presents its renderer do NOT change shape.
│   │   └── src/                     # renderer — UNCHANGED (calls the same commands.ts)
│   ├── kernel-server/               # NEW — crate sidra-kernel-server (a headless binary)
│   │   ├── Cargo.toml               #        depends on services/* and packages/domain, like every apps/* crate
│   │   └── src/{main,serve,session,auth}.rs   # constructs the SAME Kernel; binds the transport; hosts it
│   ├── companion/                   # STAYS
│   └── cli/                         # STAYS
│
├── services/                        # UNCHANGED — not one file moved, not one import rewritten (ADR-0062, G2)
│   ├── kernel/  store/  security/  memory/  models/  orchestrator/  agents/  tools/  ingest/  plugins/
│
├── packages/
│   ├── domain/                      # UNCHANGED — Command/Query/Event types are what the transport carries
│   ├── bindings/                    # UNCHANGED shape — same generated surface, now reachable over two mediums
│   └── transport/                   # NEW — the RPC codec/envelope (ADR-0063); a shared library at packages/*
│   └── design/ ui/ tool-sdk/ plugin-sdk/ testkit/
│
└── infrastructure/
    ├── ci/
    │   └── no-source-move.rs        # NEW — asserts M23 touched only apps/* additively + packages/transport,
    │                                #        and rewrote no import across the dependency direction (AC-K1)
    └── testing/
        └── kernel-extraction/       # NEW — headless-kernel, transport-equivalence, second-client, auth tests
```

**Placement rationale.** `apps/kernel-server` is a top-level deployable, which is what `apps/*` means once the
topology is no longer single-process (ADR-0062 accepts the mild strain on "things a person launches"). The
transport codec is a *shared library* used by both the server and the desktop client, so it belongs in
`packages/*` (`/docs/03-folder-structure.md` §1.4: "shared libraries, consumed by apps and services") — and
placing it there, rather than in `services/*`, keeps the rule that `services/*` gains no new edge (G2). The
dependency direction is preserved exactly: `packages/domain ← services/* ← apps/*`, with `packages/transport`
at the `packages/*` layer depending only on `packages/domain`.

### 6.3 The dependency direction, unchanged

```
packages/domain
      ▲
      │
services/*            (UNCHANGED — no new edge; still no dependency on Tauri, still process-agnostic)
      ▲
      │
apps/desktop  ──┐
apps/kernel-server ─┼──► services/*  +  packages/domain  +  packages/transport
apps/cli  ──────┘
```

Both `apps/desktop` and the new `apps/kernel-server` sit at the `apps/*` layer and depend downward on
`services/*`. There is no `apps → apps` edge (the desktop does not depend on the server crate; it depends on
`packages/transport` and speaks to a server over the wire). The CI dependency-direction check
(`/docs/03-folder-structure.md` §1.7, already present) passes with one added `apps/*` node.

---

## 7. Security

The transport is a new *medium* for an existing boundary. The security requirement is therefore exact: **every
guarantee the in-process renderer boundary provided must hold over the network boundary, and no new authority
may appear.** M23 adds no mitigation because it needs none new — it transfers the ones that already exist and
adds one row to the threat table for the network hop.

### 7.1 The trust boundary transfers verbatim

`/docs/01-technical-architecture.md` §4 governs the renderer boundary. Each rule maps onto the client
boundary:

| Renderer-boundary rule (§4) | How it holds for a transport client |
|---|---|
| No filesystem, no network, no secrets | A client holds no secrets, reaches no filesystem, and reaches no network except the kernel connection. The kernel-server owns the Vault and the keychain; the client never does. |
| May call only commands in the generated binding | A client may send only the generated command/query types (§10). An unknown command name is rejected by the codec before dispatch. |
| Payloads typed via `ts-rs`; a type change breaks the build | The RPC frames the same generated types; a schema-diff test (§20) breaks the build on any drift. |
| The renderer is treated as compromised | The client is treated as compromised. Nothing it sends can violate a fence — it reaches the same Broker (§9). |

### 7.2 The Broker is still the only choke point

A command over the transport reaches `Kernel::dispatch` and runs **validate → authorize → persist → emit**
(`/docs/02-system-design.md` §1). The transport authenticates the *client* (§9) and then hands the command to
the kernel; it decides no `Allow`/`Deny`/`NeedsApproval` of its own and grants no ambient authority (ADR-0063).
There is no path from the transport to state that bypasses the Broker. M23 adds a hop *in front of* the choke
point; it removes none of the choke point's logic and adds no second choke point.

### 7.3 Authentication and transport security

- **Per-client authentication, as a Seat.** A session establishes a Seat identity before the transport carries
  any command (§5). The Seat is the M21/ADR-0021 identity; the client proves it against an enrollment (§12).
  Every dispatched command runs as that Seat, so the `actor` on every event is the authenticated Seat, not an
  implicit Principal.
- **Local clients: an OS-local socket.** The default single-user deployment (desktop + local kernel) uses a
  loopback / OS-local socket. Peer credentials from the OS confirm the connecting process, and the socket is
  not reachable off-machine. No TLS is required for a same-machine connection; the trust boundary is the OS
  process boundary, which is where it already is today.
- **Remote clients: TLS.** A client on another machine (a colleague's Seat, a Companion) connects over TLS.
  The credential is a per-client secret held in the client's OS keychain (never in the client's address space
  as plaintext beyond the handshake) and verified server-side against the client's enrollment; the enrollment
  row holds only a reference/public identifier, never the secret (§12), mirroring the M16 custody rule that
  "the DB holds a `KeychainRef`, never the secret."
- **Redaction is unchanged.** The redaction filter runs on every log and event write (`/docs/07-security-model.md`
  §9). Session establishment, auth challenges, and client credentials are subject to it; no credential appears
  in a log, event, or stored parameter.

### 7.4 Threat table

Every mitigation is an application of an existing control (`/docs/07-security-model.md` §3), transferred to the
network hop.

| Threat | How M23 addresses it |
|---|---|
| A malicious client (the renderer boundary, now over the network) | The client is untrusted and treated as compromised (§7.1). Every command hits the Broker (§7.2); a fence violation returns `fenced` exactly as it does for the in-process renderer. Same denials, same code path — **the malicious client gains nothing the in-process renderer could not already attempt.** |
| An unauthenticated client trying to command | Refused with `Unauthenticated` before any command is carried (§5.3 invariant 1). No command reaches the kernel from an unauthenticated session. |
| A client impersonating another Seat | Authentication binds the session to the Seat proven by the client's enrolled credential (§9, §12). A client cannot assert a Seat it is not enrolled for; the mismatch is an `auth_fail`, logged. Separation of duties (M22) still applies at the human layer — a Seat cannot self-approve regardless of transport. |
| T3 key theft over the transport | Credentials live in the keychain (client side) and in enrollment references (server side); the DB holds a reference, never the secret; redaction strips any credential from logs/events (`/docs/07-security-model.md` §3, §9). The transport carries commands, never the Vault key or provider keys. |
| T6 history tampering via a client | A client cannot write the event log directly — it dispatches commands, which the kernel persists on the hash chain (ADR-0002). `audit.verify` detects any break exactly as today. |
| Man-in-the-middle on a remote connection | TLS for remote clients (§7.3); a local client uses a non-networked OS socket. An off-machine listener is not reachable for the local case. |
| A client flooding the server | The event bus backpressure rule is unchanged (`/docs/02-system-design.md` §2: bounded channel, drop-and-resync). Session admission and per-session command rate are bounded by the server; a slow or hostile client is dropped and told to resync, never blocking the writer. |

**The single choke point holds.** A transport client is, from the kernel's perspective, indistinguishable from
the in-process renderer at the point that matters: `Kernel::dispatch`. M23 adds authentication *ahead* of the
Broker and a medium *around* the surface; it changes nothing at or below the choke point.

---

## 8. The transport mechanism (ADR-0063 in mechanism)

1. **Envelope.** The transport frames a `TransportEnvelope` (§4.4): a `Request` (a command or query with a
   correlation id), a `Response` (the typed result or a `DenyReason`), an `EventPush` (a `seq` + the existing
   `Event`), or a `Control` frame (auth, subscribe, ping, bye). `payload` and `result` are the existing
   generated types; the envelope adds framing, not shape.
2. **Codec.** Payloads are `serde`-JSON, the same encoding Tauri IPC uses in-process (`/docs/01-technical-architecture.md`
   §1: "serde-JSON over Tauri IPC"). The codec lives in `packages/transport` and is shared by the server and
   every client, so both ends encode/decode with one implementation and cannot disagree.
3. **Dispatch adapter.** On the server, an inbound `Request` is decoded, checked against the authenticated
   session's Seat, and handed to `kernel.dispatch(command_or_query, as: seat)`. The kernel runs its normal
   pipeline and returns a typed result or a Broker `DenyReason`, which the adapter frames as a `Response`. The
   adapter contains no business logic — it is a wire ↔ `Kernel::dispatch` bridge.
4. **Client dispatch.** On the desktop, `ipc.rs` no longer calls the kernel in-process; it encodes the command
   as a `Request`, sends it, and awaits the `Response`. The command/query types it uses are the same
   `packages/domain` types projected into `packages/bindings`; the renderer above it is unaware the boundary
   became a network hop (G3).
5. **Equivalence.** Because the same command reaches the same `Kernel::dispatch` whether framed by the
   transport or called in-process, an RPC call and an in-process call produce identical results. This is
   asserted, not assumed: the transport-equivalence test (§20, AC-K8) runs a corpus of commands both ways and
   diffs the results and the emitted events.

---

## 9. Authentication and per-client Seat identity (depends on M21)

On a client connecting and sending its first `Request`:

1. **Establish the session's Seat.** During `Connected → Authenticated` (§5), the client presents a credential;
   the server validates it against the client's enrollment (§12) and binds the session to the Seat that
   enrollment authorizes. A client not enrolled, or presenting an invalid credential, is refused with
   `Unauthenticated` and carries no command. **This is the transport's only authorization act, and it is
   authentication, not action authorization.**
2. **Attribute every command to the Seat.** Each `Request` in the session is dispatched as the session's Seat.
   The kernel populates the `actor` field the chain already carries (`/docs/02-system-design.md` §2 schema;
   ADR-0021) with that Seat, so history distinguishes commands from different Seats — the M21 exit criterion
   ("every event distinguishes the two"), reached over the transport.
3. **The Broker decides the action.** With the Seat established, the command enters `Kernel::dispatch` and the
   Permission Broker applies the Seat's Fences, narrowed per Work Order, exactly as it does in-process
   (`/docs/07-security-model.md` §4). The transport added *identity*; the Broker still decides *authority*.
4. **Separation of duties is unaffected.** M22's rule that a Seat may not approve its own Approval Request is
   a Broker/kernel property, not a transport property; it holds identically for a command that arrived over the
   transport.

Step 1 is the pre-flight the transport adds. Steps 3–4 are the choke point that already existed. The order is
fixed and no step is skippable: **authenticate the client → dispatch as its Seat → Broker authorizes the
action.**

---

## 10. The command/query surface, preserved

### 10.1 The rule

**The surface shape is byte-for-byte the same generated bindings.** The RPC's request/response types are the
command and query types already defined in `packages/domain` and projected into `packages/bindings` via
`ts-rs` (`/docs/01-technical-architecture.md` §4 rule 3). M23 adds a transport codec and a dispatch adapter;
it adds, renames, or reshapes **no** command, query, event, or field.

### 10.2 Why it cannot drift

The renderer's generated bindings and the RPC's framed types are projections of the **same** command registry.
There is one registry, so there is one surface; the network medium and the in-process medium carry the same
thing. A command added in a future milestone appears on every client automatically because there is only one
surface to add it to. This is the exact property `/docs/01-technical-architecture.md` §4 rule 2 established for
the renderer ("the two cannot drift"), now holding for every client.

### 10.3 What M23 does *not* add to the surface

- No REST resources, no GraphQL types, no hand-written network vocabulary.
- No "remote" variant of a command. A command is a command whether it arrives in-process or over the wire.
- No new field on any existing type for transport bookkeeping. Correlation ids and `since_seq` live in the
  envelope (§4.4), not on the business types.

The schema-diff test (§20, AC-K7) asserts the generated `packages/bindings` output is identical before and
after M23. If a byte changed, M23 changed the surface, which it must not.

---

## 11. Events over the transport

Events are unchanged; only their delivery gains a medium.

- **The bus is unchanged.** The in-process broadcast bus with a durable tail (`/docs/02-system-design.md` §2)
  is the same bus. Events are rows in `events` before they are broadcast; ordering is the global monotonic
  `seq` assigned inside the write transaction.
- **Delivery over the transport.** A subscribed client (§5) receives `EventPush` frames carrying the existing
  `Event` type and its `seq`. A client that drops and reconnects resubscribes with `since_seq` and resumes
  from `seq`, "losing nothing" — the exact webview-reload guarantee (`/docs/02-system-design.md` §2), now over
  the network. Backpressure is the existing bounded-channel-then-resync rule.
- **A session audit event on the hash chain.** M23 adds `KernelServerStarted`, `KernelServerStopped`,
  `ClientSessionOpened`, `ClientAuthenticated`, `ClientAuthenticationFailed`, and `ClientSessionClosed` to the
  `system.*` event namespace (`/docs/02-system-design.md` §2, an existing closed enum). Each carries the
  `actor` (the Seat, once authenticated), the `ClientId`, and the `SessionId`, and lands on the hash chain
  (ADR-0002) so that *who connected, as which Seat, when* is auditable — the same auditability the in-process
  boundary has for the Principal. No credential appears in these events (redaction, `/docs/07-security-model.md`
  §9).

---

## 12. Persistence

### 12.1 One additive migration — `0049_client_enrollments.sql`

M23 is a topology change, not a schema change: the extraction moves no table and reshapes no column, and a
*session* is ephemeral in-memory runtime state (§4.3), persisted by nothing — exactly as the renderer's
in-process connection is not a row today. There is therefore **no migration for the extraction itself.**

One durable fact is genuinely needed, and only one: a **client enrollment** — the binding of an enrolled
client (a device/surface) to the Seat it may authenticate as, so that a client that reconnects after a kernel
restart re-authenticates against a persisted record instead of re-pairing on every restart. This is the
network analogue of a fact that did not exist in 1.0/2.0 because there were no network clients. It uses the
next free migration number, `0049_` (mission migrations ended at 0024, M16 used 0025–0029, M17–M22 consume the
range through 0048).

| Table | Purpose |
|---|---|
| `client_enrollments` | `client_id`, `seat_id`, `credential_ref` (a keychain/public-key reference — **never the secret**), `enrolled_at`, `enrolled_by` (the Principal — a Decision), `revoked_at` |

### 12.2 Why this is the *only* durable state, and why it is safe

- **A session is not persisted.** `ClientSession` (§4.3) lives only while the connection lives. Nothing about
  a live connection is written to the Vault; history is the event log, and the session's *effects* land there
  as ordinary events under the session's Seat (§11).
- **The enrollment holds no secret.** `credential_ref` is a reference to a keychain entry or a public
  identifier, never the credential itself — the M16 custody rule ("the DB holds a `KeychainRef`, never the
  secret," ADR-0034) applied to client credentials.
- **Enrollment is a Decision.** Enrolling a client to a Seat is a Principal Decision, logged, with the Seat
  and the client shown in plain language — the same "grant is a logged Principal Decision" stance M16 took for
  connector grants.
- **Null enrollment = pre-M23 behaviour.** A Firm running only the local desktop client against a local kernel
  never writes a `client_enrollments` row: the local client authenticates via the OS-local socket's peer
  credentials as the single existing Seat. A Vault with no enrollment behaves exactly as it did before M23 — a
  null enrollment is a fully supported state, not a migration artifact. This mirrors M16's "a null grant =
  pre-M16 behaviour."
- **Forward-only and additive.** `0049_` is forward-only, idempotent, and independently deployable
  (`/docs/01-technical-architecture.md` §7). It adds a table; it changes no existing column's meaning.

### 12.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── clients/
    └── enrollments.md      which clients may act as which Seat, when enrolled, by whom — plain language, no secret
```

Written on enrollment/revocation, not continuously (the same discipline as the M16 connector mirror). A
Principal who abandons Sidra OS keeps a readable record of which clients could reach the kernel and as which
Seat — but never a credential, which lives only in the keychain and is gone when the keychain is
(`/docs/03-folder-structure.md` §2).

---

## 13. Public APIs

### 13.1 The RPC surface is the existing surface

The transport does **not** define a new command/query API. Its surface is the existing command and query
surface (`/docs/02-system-design.md` §1) carried over the wire (§10). The only new *operations* M23 introduces
are transport-lifecycle and enrollment operations at the `apps/` layer:

| Operation | Effect | Notes |
|---|---|---|
| `serve(config)` | server `Serving` | opens the Vault once, binds the transport, runs replay/integrity first (§3) |
| `drain()` | server `Draining → Stopped` | rejects new sessions; lets in-flight commands finish; zeroizes keys on stop |
| `enroll_client(client, seat)` → `EnrollmentRef` | writes `client_enrollments` | a Principal **Decision**; the credential is provisioned to the client's keychain, never returned over the surface |
| `revoke_enrollment(client)` | closes the enrollment | a client can no longer authenticate; live sessions for it are dropped |
| `authenticate(credential)` → `SessionId` | session `Authenticated` | validates against enrollment; binds the session to a Seat (§9); carries no command until it succeeds |
| `subscribe(since_seq)` | session `Subscribed` | attaches the event stream from `seq` (§11) |

Every `Command` and `Query` in the existing registry is reachable through the transport unchanged — they are
not re-listed here because M23 does not define them.

### 13.2 API rules

1. **No transport operation returns a credential.** `enroll_client` provisions a credential to the client's
   keychain and returns only a reference; the secret never crosses the surface, exactly as no M16 API returns
   a token.
2. **Every command over the transport goes through `Kernel::dispatch`, which goes through the Broker.** There
   is no side-door and no transport-level action authorization (ADR-0063).
3. **`enroll_client` and `revoke_enrollment` are Decisions** — logged, with the Seat and client shown in plain
   language before the act.
4. **Authentication precedes any command** (§5.3 invariant 1). A session that has not authenticated carries no
   command.
5. **The generated command/query/event bindings are unchanged** (§10). Adding a transport operation above does
   not add a business command; these are `apps/`-layer lifecycle operations, not kernel commands.

---

## 14. Performance requirements

- **The headless kernel's resource budget.** `apps/kernel-server` inherits the kernel's existing budgets:
  lazy init and a cold start that does not regress the ≤1.2 s target (`/docs/01-technical-architecture.md` §8),
  and idle memory in the same envelope as the in-process kernel (the server drops the webview's ~150 MB but
  keeps the kernel's footprint). A headless kernel with no connected client sits idle at low memory, as the
  kernel already does (`/docs/01-technical-architecture.md`, ADR-0001's ≤400 MB idle budget applies to the
  kernel portion).
- **Transport latency must not regress the client budgets.** For a local client over the OS-local socket, a
  command round trip is a loopback serialise → dispatch → respond, budgeted sub-millisecond of transport
  overhead so the desktop's cold-start and sustained 60 fps budgets (`/docs/01-technical-architecture.md` §8;
  M8 exit criterion) are met exactly as before. Queries remain cacheable client-side via the existing TanStack
  Query layer, so reads do not become chatty. The transport-equivalence test (§20) measures the added overhead
  and fails if it exceeds the local-socket budget.
- **Events stay at the existing rate.** Token streaming is already coalesced at ≤30 Hz in the kernel
  (`/docs/01-technical-architecture.md` §8); the transport pushes the same coalesced stream, so the client
  never re-renders per token whether in-process or remote.
- **The scheduler is unaffected.** The Mission/Work Order scheduler runs in the kernel-server, unchanged
  (`/docs/02-system-design.md` §4); a client connecting or disconnecting does not touch scheduling
  determinism, because a client is a *subscriber and a command source*, not a scheduler input.
- **Draining is bounded.** A drain lets in-flight commands finish within their existing timeouts; it does not
  wait on idle sessions, which are dropped.

---

## 15. Sequence diagrams

### 15.1 The exit-criterion path — kernel headless, desktop as one client, a command over RPC identical to in-process

```
Principal   apps/kernel-server        apps/desktop(client)     Kernel::dispatch   Broker   Store/EventLog
   │  launch server                        │                        │              │            │
   ├───────────────►│ open Vault, integrity_check, replay          │              │            │
   │                │ bind local socket → SERVING                   │              │            │
   │  start desktop │                        │                     │              │            │
   ├────────────────┼───────────────────────►│ connect (local socket)             │            │
   │                │◄── AuthChallenge ───────┤                     │              │            │
   │                │    peer creds → single Seat                   │              │            │
   │                │── Authenticated ───────►│ (session bound to Seat)            │            │
   │                │                        │ subscribe(since_seq) │              │            │
   │  (Principal issues a Directive in the desktop UI, as they always have)        │            │
   │                │◄── Request{command: engagement.create} ───────┤              │            │
   │                │  decode envelope, dispatch AS seat ──────────►│ validate     │            │
   │                │                        │                     ├─authorize────►│ Allow      │
   │                │                        │                     ├─persist directives+event ──►│
   │                │                        │                     └─emit ─────────┤            │
   │                │── Response{ok} ────────►│ (renderer renders preview)         │            │
   │                │── EventPush{mandate.proposed} ───────────────►│ (event stream, same as in-process)
   │  (the command flowed over RPC to the SAME Kernel::dispatch and produced the SAME result and events)
```

The load-bearing observation: the right half of this diagram — `Kernel::dispatch → Broker → Store/EventLog` —
is byte-for-byte the in-process path (`/docs/01-technical-architecture.md` §5). M23 only changed how the
`Request` arrived at `Kernel::dispatch`: over a socket instead of in-process. Nothing below the choke point
moved.

### 15.2 A second client connects (Companion / a second Seat)

```
apps/kernel-server         Client A (desktop, Seat-1)     Client B (Companion, Seat-2)     EventLog
   │  SERVING                     │                              │                            │
   │◄── A: Authenticated as Seat-1┤                              │                            │
   │◄── B: connect (TLS) ─────────┼──────────────────────────────┤                            │
   │── AuthChallenge ─────────────┼─────────────────────────────►│                            │
   │◄── B: AuthResponse (enrolled for Seat-2) ────────────────────┤                            │
   │── B: Authenticated as Seat-2 ┼─────────────────────────────►│ (bound to Seat-2)          │
   │                              │  A: Request{command} ─as Seat-1─►  dispatch                │
   │                              │                              │   persist event actor=Seat-1─►│
   │                              │  B: Request{approval.resolve} ─as Seat-2─► dispatch         │
   │                              │                              │   persist event actor=Seat-2─►│
   │  (two clients, two Seats; every event distinguishes them — the M21 exit criterion, over the transport)
   │  (M22 still holds: Seat-2 cannot approve an Approval Request Seat-2 itself raised — Broker/kernel property)
```

### 15.3 Transport auth failure

```
apps/kernel-server        Client X (not enrolled)
   │  SERVING                    │
   │◄── connect ─────────────────┤
   │── AuthChallenge ───────────►│
   │◄── AuthResponse (invalid / no enrollment) ─┤
   │── Unauthenticated ─────────►│  (session refused; NO command ever carried)
   │  emit system event: ClientAuthenticationFailed (client_id, no seat) on the hash chain
   │  (nothing dispatched, nothing authorized, nothing persisted beyond the audit of the failed attempt)
```

---

## 16. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | Client disconnects mid-command | The in-flight command is one kernel transaction (`/docs/02-system-design.md` §5); it commits fully or not at all regardless of the client. The session is discarded (ephemeral, §5.3). On reconnect the client resubscribes from `since_seq` and sees the committed event if it landed. No corruption, no double-apply (idempotency keys, `/docs/02-system-design.md` §5). |
| F2 | Kernel-server restarts (crash or planned) | On restart it runs `integrity_check` and replay (`/docs/02-system-design.md` §6): non-terminal Engagements resume, in-flight Turns reset with `attempt+1`, effectful tool calls with a persisted intent become an Approval Request. Clients reconnect, re-authenticate, and resubscribe from their last `since_seq`. At most one in-flight model call is lost, never committed state. |
| F3 | Transport authentication fails | `Unauthenticated`; no command carried; `ClientAuthenticationFailed` on the chain (§15.3). Repeated failures are surfaced to the Principal (the same "notify if repeated" discipline as a repeated fence, `/docs/07-security-model.md` §4). |
| F4 | A client attempts a command it lacks the capability for | Reaches the Broker like any command; returns `fenced` (`/docs/07-security-model.md` §4). Identical to the in-process renderer being fenced — the malicious/over-reaching client gains nothing new (§7.4). |
| F5 | Network drops for a remote client mid-stream | The bounded-channel backpressure rule applies (`/docs/02-system-design.md` §2): the client is dropped and told to resync from `seq`; the writer never blocks. On reconnect it resumes with no lost event. |
| F6 | Two clients issue conflicting edits | Optimistic concurrency on user-editable rows (`/docs/02-system-design.md` §5): the stale write returns `ConflictError` with both versions and surfaces as a merge, never a silent overwrite — unchanged by the transport, now possibly across two Seats. |
| F7 | Server started with no client connected | Fully valid. The headless kernel runs Missions, the scheduler, and the Night Shift with no client attached; a client connecting later subscribes from the current `seq`. Local work never depended on a client. |
| F8 | Enrollment revoked while a session is live | `revoke_enrollment` drops live sessions for that client; in-flight commands complete or fail on their own; the client can no longer authenticate. No token survives revocation (the keychain reference is cleared), mirroring the M16 revoke invariant. |
| F9 | A client sends a malformed or unknown-command envelope | The codec rejects it before dispatch with a typed decode error; nothing reaches `Kernel::dispatch`. An unknown command name cannot be invoked (the generated surface is closed, §10). |

---

## 17. Dependencies, assumptions, risks

### 17.1 Dependencies

| On | For |
|---|---|
| **M11** — kernel-as-library / department substrate | The kernel that `apps/kernel-server` hosts. M11 made the Firm run as a library "as one implicit department with byte-identical behaviour" (`/MILESTONE_REGISTRY.md` §4); that library is exactly what runs headless. Without M11 there is no process-agnostic kernel to host. |
| **M21** — Seats and Identity | Multi-client identity. The transport authenticates each client as a Seat and attributes every command to it (§9); ADR-0021 already put a Seat ID on every event, which M23 finally uses for a second client. |
| ADR-0011 — seven-directory monorepo | The dependency direction and `apps/`/`services/` split that makes the extraction additive rather than a reorganisation (§6). |
| ADR-0001 — Tauri/Rust core | The Rust core "reusable verbatim as a server" that `apps/kernel-server` hosts. |
| M2 / ADR-0002 — event log & audit chain | The single history the headless and in-process kernels share; session audit events land on it (§11). |
| M22 — Separation of Duties | Sits *beside* M23 (both 3.0). Not a dependency of M23, but its human-layer rule (no self-approval) must continue to hold over the transport (§9). |

### 17.2 Assumptions

1. **M11 and M21 are implemented and integrated before M23 is *implemented*.** M23's architecture is written
   ahead of M21/M22 being Documented (see `00-M22-AUDIT.md`), which is safe because M23's load-bearing
   dependency — the Seat *identity contract* — is fixed by Accepted ADR-0021. But the STOP at the end of this
   package is doubly binding: M23 must not be built until M21 (Seats) and M22 (Separation of Duties) are done,
   because the transport authenticates against Seat identities those milestones create.
2. **The default deployment stays single-user, local, and unchanged.** The exit criterion and the
   out-of-the-box experience are the desktop supervising a local kernel over an OS-local socket. The hosted /
   remote-colleague deployment is opt-in; the single-user path does not regress.
3. **`services/*` already has no Tauri dependency and no process assumption** (`/docs/03-folder-structure.md`
   §1.2). If any service acquired a Tauri or single-process dependency in M11–M22, that is a pre-existing
   defect M23 surfaces (the "no source move" assertion would fail), not a cost M23 introduces — and it is
   reported, not worked around.
4. **Remote transport is HTTPS/TLS-class.** A colleague's remote client connects over TLS; non-TLS remote
   transports are out of scope and would need their own ADR. Local clients use an OS-local socket.

### 17.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| KR-1 | The extraction drifts into a source reorganisation under schedule pressure | The "no source move" CI assertion (§20, AC-K1) fails the build on any change to `services/*`/`packages/*` beyond additive; ADR-0062 makes reorganisation an explicitly rejected option. |
| KR-2 | The transport surface drifts from the renderer's generated bindings | The schema-diff test (§20, AC-K7) asserts the generated surface is identical before and after M23; ADR-0063 makes them one surface by construction. |
| KR-3 | A transport bug produces a result an in-process call would not | The transport-equivalence test (§20, AC-K8) runs a command corpus both ways and diffs results and emitted events. |
| KR-4 | The transport becomes a second choke point or grants ambient authority | ADR-0063 forbids it; the transport authenticates and dispatches, never authorizes; §7.2, §9. A red-team test asserts a command over the transport cannot bypass or duplicate the Broker. |
| KR-5 | Local-socket latency regresses the 60 fps / cold-start budget | The performance budget (§14) and the equivalence test measure transport overhead and fail past the local-socket budget. |
| KR-6 | A remote client credential leaks | Credentials in the keychain (client) and references only (server); redaction on every write path; the enrollment row holds no secret (§12). |
| KR-7 | Two Seats' concurrent edits silently overwrite | Existing optimistic concurrency (`/docs/02-system-design.md` §5) surfaces conflicts as a merge Decision, unchanged (F6). |

---

## 18. Acceptance criteria

The exit criterion — **the kernel runs headless; the desktop app becomes one client; no file moved, no import
rewritten** — decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC-K1 | **No file in `services/*` or `packages/*` moved, and no import was rewritten across the dependency direction** — only an `apps/` binary + a `packages/transport` library were added, and the desktop's dispatch was changed | the "no source move" CI assertion over the M23 changeset (§20); the diff is the proof |
| AC-K2 | The kernel runs headless: `apps/kernel-server` opens the Vault, runs integrity+replay, binds the transport, and serves with no window and no connected client | headless-boot test asserting `Serving` with zero sessions and a working scheduler |
| AC-K3 | The desktop is one client: it connects over the transport, authenticates as a Seat, and its renderer calls the same `commands.ts` unchanged | desktop-as-client test; the renderer bindings are asserted unchanged (AC-K7) |
| AC-K4 | A command flows over RPC to the same `Kernel::dispatch` and produces the same result and events as in-process | the transport-equivalence test over a command corpus (§20) |
| AC-K5 | The Permission Broker remains the only choke point; the transport performs no action authorization and grants no ambient authority | red-team test asserting no transport path reaches state without the Broker; a fenced command over the transport returns `fenced` identically to in-process |
| AC-K6 | Each client authenticates as a Seat; every command is attributed to that Seat on the hash chain; an unauthenticated client carries no command | auth test asserting `Unauthenticated` before authentication and correct `actor` on emitted events (M21 identity) |
| AC-K7 | The generated command/query/event bindings (`packages/bindings`) are byte-identical before and after M23 | schema-diff test in CI |
| AC-K8 | RPC and in-process produce identical results for the same input, within the local-socket latency budget | transport-equivalence test (results + events + latency) |
| AC-K9 | A second client connects concurrently, authenticates as a different Seat, and every event distinguishes the two | second-client test (§15.2); asserts distinct `actor` per Seat, no rewritten history |
| AC-K10 | The extraction is additive: deleting `kernel-server` + `packages/transport` and repointing the desktop's dispatch restores the pre-M23 in-process build with `services/*`/`packages/domain` untouched | reversal test building both topologies from the same unchanged kernel crates |
| AC-K11 | A null enrollment (local desktop only) behaves exactly as pre-M23; no `client_enrollments` row is required for the single-user deployment | migration test asserting default single-client behaviour with zero enrollment rows |
| AC-K12 | Client disconnect mid-command, kernel restart, and transport auth failure each fail cleanly with no committed state lost and no corruption | failure-scenario tests (F1, F2, F3) |

---

## 19. Testing strategy

- **Equivalence over duplication.** The central test is not "does the transport work" but "does the transport
  produce *the same thing* the in-process path produces." The transport-equivalence harness runs a corpus of
  commands and queries through both the in-process `Kernel::dispatch` and the RPC transport and diffs results,
  emitted events (by `seq` and payload), and Broker outcomes. A divergence is a transport defect, by
  definition (AC-K4, AC-K8).
- **The diff is a test artifact.** AC-K1 (no source move) is verified mechanically: the CI job computes the
  changeset touching `services/*` and `packages/*` and fails on anything beyond additive, and fails on any
  import rewritten across the dependency direction. The milestone's headline claim is thus a green check, not
  a reviewer's assertion.
- **Headless boot without a client.** AC-K2 boots `kernel-server` with no session and asserts a working
  kernel — scheduler running, a Mission progressing, the Night Shift firing — proving the kernel does not
  depend on a client. This is the network analogue of the Layer-6 replaceability test M16 used (disconnect
  everything, local work continues).
- **Two Seats, one chain.** AC-K9 connects two clients as two Seats and asserts the M21 property over the
  transport: every event distinguishes them and no historical event is rewritten (ADR-0021's exit criterion).
- **Security transferred, not re-invented.** The existing red-team and injection suites
  (`/docs/03-folder-structure.md` §1.5) are run with the client on the far side of the transport; the
  assertion is that the outcomes are identical to the in-process runs — a malicious client gains nothing the
  in-process renderer could not already attempt (§7.4, AC-K5).
- **Failure scenarios are chaos tests.** F1/F2/F3 reuse the existing chaos harness (`kill -9` at every state
  transition) with the addition of dropping the client connection at each transition; the recovery contract
  (`/docs/02-system-design.md` §6) must hold identically.
- **Every task ships its own tests.** Inherited from the Mission Engine plan §0.4 and the M16 plan: no "tests
  follow later"; a task without tests is not done.

---

## 20. CI requirements

| Check | Asserts | AC |
|---|---|---|
| **No source move** | The M23 changeset touches `services/*` and `packages/*` only additively (new `packages/transport`), moves no file, and rewrites no import across the dependency direction | AC-K1 |
| **Dependency direction** (existing, `/docs/03-folder-structure.md` §1.7) | `apps/kernel-server` depends only downward (`services/*`, `packages/domain`, `packages/transport`); no `apps → apps` edge; `services/*` gains no new edge | AC-K1 |
| **Schema diff** | `packages/bindings` output is byte-identical before and after M23 | AC-K7 |
| **Transport equivalence** | A corpus of commands/queries produces identical results, events, and Broker outcomes in-process and over RPC, within the local-socket latency budget | AC-K4, AC-K8 |
| **Broker-is-only-choke-point** | No transport path reaches state without `Kernel::dispatch`; a fenced command over the transport returns `fenced` identically to in-process; no ambient authority | AC-K5 |
| **Second client / two Seats** | Two authenticated clients as two Seats; distinct `actor` per event; no rewritten history | AC-K9 |
| **Reversal build** | Both topologies (in-process desktop; headless server + client) build from the same unchanged kernel crates | AC-K10 |
| **No-Tauri-in-services** (existing, `/docs/03-folder-structure.md` §1.8 rule 3) | No `services/*` crate depends on Tauri or assumes a single process | G2, AC-K10 |

---

## Appendix A — Glossary additions

- **Kernel-server** — the headless process (`apps/kernel-server`, binary `sidra-kernel-server`) that hosts the
  existing `Kernel` behind the transport. A host, not a kernel: it owns no capability; every capability it
  exposes already lives in `services/*`.
- **Client** — any surface that reaches the kernel over the transport: the desktop (one client, from M23), the
  Companion (M18), an additional Seat's surface. Untrusted, as the renderer already is; holds no secret,
  reaches no filesystem or network except the kernel connection.
- **Client session** — one live, authenticated connection from a client to the kernel-server, bound to a
  Seat. Ephemeral: it lives only while the connection lives and is persisted by nothing.
- **Transport** — the typed RPC (`packages/transport`, ADR-0063) that frames the existing command/query/event
  surface over a network/local-socket boundary. A medium, not a surface.
- **Enrollment** — the durable binding (`client_enrollments`, migration `0049_`) of a client to the Seat it
  may authenticate as. Holds a credential *reference*, never the credential.
- **Headless kernel** — the kernel running with no attached client and no window; fully functional (scheduler,
  Missions, Night Shift), because local work never depended on a client.

## Appendix B — Repository structure, BEFORE / AFTER

See §6 for the full trees. In one line: **AFTER = BEFORE + `apps/kernel-server/` (new binary) +
`packages/transport/` (new codec) + `infrastructure/testing/kernel-extraction/` (new tests) + the
`no-source-move` CI check, with `apps/desktop/src-tauri/src/ipc.rs` changed to dispatch over the transport —
and `services/*`, `packages/domain`, and `packages/bindings` character-for-character identical.**

## Appendix C — Implementation position

M23 is the third milestone of 3.0 "Chambers" and depends on **M11** (kernel-as-library) and **M21** (Seats),
per `/MILESTONE_REGISTRY.md` §4. It is the payoff of two decisions taken before M1: ADR-0011 (the
domain-oriented monorepo whose dependency direction was built for exactly this) and ADR-0001 (a Rust core
reusable verbatim as a server). Building it as a source reorganisation is the mistake ADR-0062 exists to
prevent: a reorganised tree moves files that never needed moving, rewrites imports that were correct, and
destroys the one claim the milestone exists to prove — that the extraction, designed in from M1, costs
nothing in the source tree.

**Exit criterion.** The kernel runs headless; the desktop app becomes one client; **no file moved, no import
rewritten** — proven by a diff/CI assertion that `services/*` and `packages/*` are unchanged and only an
`apps/` binary plus a transport were added (AC-K1), that the Broker remains the only choke point (AC-K5), and
that a second client connects distinguished on the chain (AC-K9).
