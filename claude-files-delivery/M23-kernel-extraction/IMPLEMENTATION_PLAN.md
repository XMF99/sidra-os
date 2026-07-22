# Kernel Extraction — Implementation Plan

**Milestone M23 · crate `sidra-kernel-server` + `packages/transport` · for AntiGravity**

| | |
|---|---|
| Architecture | `KERNEL_EXTRACTION_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0062 (kernel extracted behind a new `apps/` binary; the transport is the only change) · 0063 (typed RPC preserving the command/query surface and the Broker choke point) |
| New crates | `apps/kernel-server` (binary `sidra-kernel-server`) · `packages/transport` (the RPC codec/envelope) |
| Changed | `apps/desktop/src-tauri/src/ipc.rs` — dispatch over the transport instead of in-process |
| Depends on | M11 (kernel-as-library), M21 (Seats), and the existing `sidra-kernel`, `sidra-security`, `sidra-store`, `sidra-domain` |
| Must not | move any file in `services/*` or `packages/{domain,bindings}`, rewrite any import across the dependency direction, or add a second command surface (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. In particular, **no task moves a file in `services/*` or `packages/{domain,bindings}` or
rewrites an import across the dependency direction** — a task that seems to require it is mis-scoped; stop and
report it.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4 / the M16 plan §0.2, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build. The desktop must keep
  building and running in-process until E4 flips it to the transport behind a flag.
- **No production code in this package.** This plan is the specification AntiGravity implements.
- **Additive only in the kernel.** Every task's diff to `services/*` and `packages/{domain,bindings}` must be
  zero. The "no source move" check (E6) is not a final gate — it should be green from E1.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | The `apps/kernel-server` headless binary | the host process: construct the existing Kernel, open the Vault, lifecycle (§3) |
| E2 | The typed RPC transport | ADR-0063: `packages/transport` — the envelope/codec over the existing surface |
| E3 | Per-client (Seat) authentication & session | ADR-0063/§9: the session state machine, Seat auth, enrollment (migration 0049) |
| E4 | The desktop as one client | swap `ipc.rs` in-process dispatch for the transport client, no surface change |
| E5 | The event stream over the transport | subscribe/`since_seq` delivery; session audit events on the chain |
| E6 | The headless / no-file-moved acceptance | the CI assertions and the equivalence/second-client proofs — the exit criterion |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──┐
                   ├──► E4 ──► E5 ──► E6
              E2 ──┘
```

E1 first (a headless host to serve anything). E2 next (the transport nothing works without). E3 needs E2 (a
session runs over the transport). E4 assembles E1+E2+E3 into the desktop-as-client swap. E5 layers the event
stream onto the live sessions. **E6 is the exit criterion and must be the last thing green** — its final task,
the "no file moved, no import rewritten" proof, is the last thing to go green in the milestone.

---

## E1 — The `apps/kernel-server` headless binary

### Purpose
The host process: a new `apps/` binary that constructs the *same* `Kernel` the desktop constructs, opens the
Vault once, and runs the server lifecycle — with no window and no client required.

### Scope
In: the `apps/kernel-server` crate, its lifecycle state machine (§3), Vault open + integrity + replay reuse,
config. Out: the transport (E2), sessions and auth (E3). This epic can serve *nothing* yet; it proves a
headless kernel boots.

### Dependencies
`sidra-kernel` (the existing `Kernel`), `sidra-store` (Vault), `sidra-security` (keychain, integrity). **No
change to any of them.**

### Public APIs
`serve(config)`; `drain()`; the `ServerState` machine (§3.2).

### Acceptance criteria
The binary boots headless, runs integrity+replay, reaches `Serving` with zero sessions and a working
scheduler; nothing in `services/*` changed.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `apps/kernel-server` crate + CI wiring; depends only downward (`services/*`, `packages/domain`) | S | — | `apps/kernel-server/Cargo.toml`, `src/main.rs`, `infrastructure/ci/` | Crate builds; CI fails on any `apps → apps` edge or any new edge into `services/*`; zero diff to `services/*` |
| **T1.2** | Construct the existing `Kernel`: open Vault, run `integrity_check` + replay via the existing code paths | M | T1.1 | `apps/kernel-server/src/serve.rs` | Uses `Kernel`/`Store` unchanged; a `kill -9` at boot recovers per `/docs/02-system-design.md` §6 |
| **T1.3** | Server lifecycle state machine: Starting → Ready → Serving → Draining → Stopped (§3.2) with guards | M | T1.2 | `apps/kernel-server/src/lifecycle.rs` | Illegal transitions rejected; `Stopped` zeroizes keys + closes DB; integrity fail → refuse to open |
| **T1.4** | Config (Vault path, endpoint) + headless boot with no client, scheduler running | S | T1.3 | `apps/kernel-server/src/config.rs` | Boots to `Serving` with zero sessions; a Mission progresses and the Night Shift fires with no client (AC-K2) |

---

## E2 — The typed RPC transport (ADR-0063)

### Purpose
`packages/transport`: the envelope and codec that carry the *existing* command/query/event surface over the
wire — a medium, not a new surface.

### Scope
In: the `TransportEnvelope` (§4.4), the `serde`-JSON codec, the dispatch adapter that bridges an inbound
`Request` to `Kernel::dispatch`, local-socket + TLS listeners. Out: authentication (E3), event delivery (E5).

### Dependencies
E1; `packages/domain` (the command/query/event types — used, not changed); `sidra-kernel` (`Kernel::dispatch`).

### Public APIs
`encode/decode(TransportEnvelope)`; `DispatchAdapter::handle(Request, as: Seat) -> Response`; listener bind.

### Acceptance criteria
An inbound `Request` reaches the same `Kernel::dispatch` and returns the typed result or `DenyReason`; the
codec rejects unknown commands before dispatch; the surface types are the existing generated ones, unchanged.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `TransportEnvelope` type: Request/Response/EventPush/Control framing over the existing surface types | M | E1 | `packages/transport/src/envelope.rs` | `payload`/`result` are the existing `packages/domain` types; no new business field; correlation ids in the envelope only |
| **T2.2** | `serde`-JSON codec (encode/decode), shared by server and client; reject unknown command names | M | T2.1 | `packages/transport/src/codec.rs` | Malformed/unknown-command envelope rejected before dispatch with a typed decode error (F9) |
| **T2.3** | Dispatch adapter: decode → (as Seat) → `Kernel::dispatch` → frame Response; no business logic | M | T2.2 | `packages/transport/src/dispatch.rs` | A command reaches the *unchanged* `Kernel::dispatch`; Broker `DenyReason` framed as a Response; adapter holds no authorization |
| **T2.4** | Local-socket listener (OS-local) + TLS listener for remote clients | M | T2.3 | `packages/transport/src/listen.rs` | Local socket not reachable off-machine; remote path uses TLS; endpoint from config (E1) |
| **T2.5** | Transport-equivalence harness (in-process vs RPC), diffing results + events | M | T2.3 | `infrastructure/testing/kernel-extraction/equivalence.rs` | A command corpus produces identical results and emitted events both ways (AC-K4, AC-K8) |

---

## E3 — Per-client (Seat) authentication & session (ADR-0063 §9)

### Purpose
Establish *who a client is* — a Seat — before the transport carries any command, and bind every command in the
session to that Seat. The durable client-enrollment record and its migration.

### Scope
In: the session state machine (§5), the auth challenge/response, Seat binding, enrollment CRUD, migration
`0049_client_enrollments.sql`, the Vault Markdown mirror for enrollments. Out: event delivery (E5).

### Dependencies
E2; **M21 / ADR-0021** (Seat identity); `sidra-security` (keychain, redaction); `sidra-store` (the migration).

### Public APIs
`authenticate(credential) -> SessionId`; `enroll_client(client, seat)`; `revoke_enrollment(client)`;
`ClientSession` state machine.

### Acceptance criteria
No command is carried before `Authenticated`; every command runs as the session's Seat; an unauthenticated or
un-enrolled client is refused; the enrollment holds a reference, never a secret; null enrollment = pre-M23.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `0049_client_enrollments.sql` — `client_id`, `seat_id`, `credential_ref`, timestamps; **no secret column** | S | — | `services/store/migrations/0049_client_enrollments.sql` | Forward-only, idempotent, independently deployable; no column can hold a secret; a Firm with zero rows is valid (AC-K11) |
| **T3.2** | `ClientSession` state machine (§5.2): Connected → Authenticated → Subscribed → Active → Disconnected | M | E2 | `apps/kernel-server/src/session.rs` | Ephemeral (nothing persisted); no `Request` carried before `Authenticated` (invariant §5.3.1) |
| **T3.3** | Seat authentication: validate credential against enrollment; local peer-cred path → single Seat; bind session to Seat | M | T3.1, T3.2, `sidra-security` | `apps/kernel-server/src/auth.rs` | Local client authenticates via OS peer creds as the single existing Seat; remote validates against enrollment; `auth_fail` → `Unauthenticated`, logged (§15.3) |
| **T3.4** | Dispatch as Seat: every command in the session sets `actor` = session Seat; unauthenticated → refused | S | T3.3, E2 | `apps/kernel-server/src/session.rs` | Emitted events carry the session's Seat as `actor` (M21, ADR-0021); unauthenticated session carries no command (AC-K6) |
| **T3.5** | Enrollment CRUD as Decisions: `enroll_client`/`revoke_enrollment`; provision credential to client keychain, return a reference only | M | T3.1 | `apps/kernel-server/src/enroll.rs` | Enrollment is a logged Decision; no API returns a secret; revoke drops live sessions for the client (F8) |
| **T3.6** | Vault Markdown mirror `clients/enrollments.md` on enroll/revoke; no credential appears | S | T3.5 | `apps/kernel-server/src/mirror.rs` | Written on transitions, not continuously; no secret in the mirror (§12.3) |

---

## E4 — The desktop as one client

### Purpose
Swap the desktop's in-process command dispatch for the transport client — with **no change to the surface the
desktop presents its renderer**. The single `CHANGED` file of the milestone.

### Scope
In: `apps/desktop/src-tauri/src/ipc.rs` dispatching over the transport as a client; the desktop supervising a
local kernel-server for the default single-user deployment; a feature flag to fall back to in-process during
rollout. Out: nothing new — this epic wires E1+E2+E3 into the desktop.

### Dependencies
E1, E2, E3; `apps/desktop` (`sidra-app`); `packages/transport`; `packages/bindings` (unchanged).

### Public APIs
None new — the desktop keeps calling the same command/query surface; only the dispatch beneath it changes.

### Acceptance criteria
The renderer calls the same `commands.ts`; the desktop connects, authenticates as the single Seat, and
dispatches over the transport; `packages/bindings` is byte-identical before and after.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Desktop connects to a local kernel-server over the OS-local socket, authenticates as the single Seat | M | E1, E3 | `apps/desktop/src-tauri/src/ipc.rs` | Local socket; peer-cred auth as the existing Seat; renderer unaware of the network hop |
| **T4.2** | Swap in-process dispatch for the transport client in `ipc.rs`, behind a feature flag (in-process fallback) | L | T4.1, E2 | `apps/desktop/src-tauri/src/ipc.rs` | Same command/query types used; flag defaults to transport once green; in-process path still builds (main stays green) |
| **T4.3** | Desktop supervises a local kernel-server for the default single-user deployment (launch/drain) | M | T4.2, E1 | `apps/desktop/src-tauri/src/{main,updater}.rs` | Out-of-the-box the desktop launches + supervises a local kernel; single-user path does not regress (assumption 2) |
| **T4.4** | Assert `packages/bindings` unchanged: schema-diff test in CI | S | T4.2 | `infrastructure/ci/schema-diff.rs` | Generated bindings byte-identical before/after M23 (AC-K7) |

---

## E5 — The event stream over the transport

### Purpose
Deliver the existing event stream to a subscribed client over the transport, with `since_seq` resume; add the
session/server audit events to the chain.

### Scope
In: `subscribe(since_seq)`, `EventPush` delivery from the existing bus, reconnect-and-resume, backpressure
reuse, the `system.*` session audit events. Out: the bus itself (unchanged, `sidra-kernel`).

### Dependencies
E3; `sidra-kernel` (the event bus — used, not changed); M2/ADR-0002 (the hash chain).

### Public APIs
`subscribe(since_seq)`; `EventPush` frames; the new `system.*` session event variants.

### Acceptance criteria
A subscribed client receives events from `seq`; a reconnecting client resumes with no loss; session/server
events land on the hash chain with the Seat as `actor` and no credential.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `subscribe(since_seq)`: attach the existing bus to the session; push `EventPush` from `seq` | M | E3 | `apps/kernel-server/src/stream.rs` | Events delivered in `seq` order; a client may command without subscribing (§5) |
| **T5.2** | Reconnect-and-resume: a dropped client resubscribes from its last `since_seq` with no lost event | M | T5.1 | `apps/kernel-server/src/stream.rs` | Webview-reload guarantee over the network (`/docs/02-system-design.md` §2); no gap, no dupe |
| **T5.3** | Backpressure reuse: bounded channel → drop-and-resync a slow client; never block the writer | S | T5.1 | `apps/kernel-server/src/stream.rs` | Slow/hostile client dropped and told to resync; writer never blocks (F5) |
| **T5.4** | `system.*` session audit events (`KernelServerStarted/Stopped`, `ClientSessionOpened/Closed`, `ClientAuthenticated/Failed`) on the hash chain | M | T5.1, M2 | `apps/kernel-server/src/audit.rs` | Every session/server transition emits an event with `actor`=Seat (once authed), `client_id`, `session_id`; no credential; `audit.verify` passes (§11) |

---

## E6 — The headless / no-file-moved acceptance (the exit criterion)

### Purpose
The exit criterion, made a set of tests and CI gates. **The last thing to go green.** Its final task — the
"no file moved, no import rewritten" proof — is the last thing green in the milestone.

### Scope
In: the "no source move" CI assertion, the transport-equivalence proof, the Broker-only-choke-point red-team
test, the second-client / two-Seats proof, the reversal build, and AC coverage. Out: any new client surface
(Companion is M18).

### Dependencies
All prior epics.

### Acceptance criteria
AC-K1–AC-K12 each covered by a named test; the "no file moved, no import rewritten" assertion (AC-K1) is the
last to go green.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Headless-boot test: `kernel-server` serves with zero sessions; scheduler + Missions run with no client | S | E1 | `infrastructure/testing/kernel-extraction/headless.rs` | AC-K2 — a working kernel with no client attached |
| **T6.2** | Transport-equivalence test over a command corpus (results + events + latency budget) | M | E2, E4 | `.../equivalence.rs` | AC-K4, AC-K8 — identical results/events; within the local-socket latency budget |
| **T6.3** | Broker-is-only-choke-point red-team test: no transport path reaches state without the Broker; fenced-over-RPC = fenced in-process; no ambient authority | M | E2, E4 | `.../broker_choke_point.rs` | AC-K5 — a malicious client gains nothing new (§7.4) |
| **T6.4** | Second-client / two-Seats test: two authenticated clients, distinct `actor` per event, no rewritten history | M | E3, E5 | `.../second_client.rs` | AC-K9 — the M21 exit criterion over the transport; M22 self-approval refusal still holds |
| **T6.5** | Failure-scenario tests: client disconnect mid-command, kernel restart, transport auth failure | M | E4, E5 | `.../failures.rs` | AC-K12 — no committed state lost, no corruption (F1, F2, F3) |
| **T6.6** | Null-enrollment + reversal build test: single-user default with zero enrollment rows; both topologies build from the unchanged kernel crates | S | E4 | `.../reversal.rs` | AC-K10, AC-K11 — additive and reversible; pre-M23 behaviour preserved |
| **T6.7** | **The "no file moved, no import rewritten" assertion (the exit criterion):** CI fails if M23 touched `services/*` or `packages/{domain,bindings}` beyond additive, or rewrote an import across the dependency direction | M | all | `infrastructure/ci/no-source-move.rs` | **AC-K1 — the last thing to go green; the diff is the proof** |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | `apps/kernel-server` — the headless host of the existing Kernel (ADR-0062) |
| E2 | `packages/transport` — the typed RPC over the existing surface (ADR-0063) |
| E3 | per-client Seat authentication + session + enrollment (migration 0049) |
| E4 | the desktop as one client — the single `ipc.rs` dispatch swap, no surface change |
| E5 | the event stream over the transport + session audit events on the chain |
| E6 | the headless / no-file-moved acceptance — the exit criterion (T6.7 last green) |
