# First-Party Connector Suite — Implementation Plan

**Milestone M17 · five artifacts under `agents/connectors/` · for AntiGravity**

| | |
|---|---|
| Architecture | `CONNECTOR_SUITE_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0046 (the five-connector set + effect-class maps) · 0047 (offline no-buffer contract) · 0048 (object-storage addressing/chunking) |
| Runs on | `sidra-connectors` (M16) — **unchanged**; M17 writes no kernel code |
| Ships | five `connector.toml` manifests + two optional Wasm transforms + one additive migration + the five-connector conformance run |
| Depends on | M16 implemented and its exit-criterion test green; M13 departments installed; M9 signing; M3 broker/egress/keychain (all via M16) |
| Must not | add a `services/*` crate, add a framework-table migration, add an install check, or put any connector id in `sidra-connectors` |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR, and **no task adds a framework mechanism** — if a connector appears to need one, that is
an M16 gap to raise, not an M17 task (architecture §1.4).

### 0.2 Task conventions (inherited from the M16 plan §0.2, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** A connector manifest task ships its install-check and conformance
  fixtures; there is no "tests follow later."
- **Every task leaves `main` green.** A partially-built connector is feature-flagged out of the conformance
  gate until its manifest is complete; never break the build.
- **No production kernel code in this package.** M17 is manifests, optional Wasm transforms, one migration, and
  test fixtures. If a task finds itself editing `services/connectors`, stop — that is out of scope.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Shared conformance harness & fixtures | the M16 suite wired to run against any `agents/connectors/*`, plus the network-stub fixtures the five reuse |
| E2 | `git` — source-control connector | manifest, optional transform, OAuth config, conformance run |
| E3 | `issues` — issue-tracker connector | manifest (GraphQL, declared-not-inferred class), api-key auth, conformance run |
| E4 | `calendar` — calendar connector | manifest, OAuth config, the class-2/class-3 split, conformance run |
| E5 | `mail` — mail connector | manifest, OAuth config, the draft/send split, conformance run |
| E6 | `object-storage` — object-storage connector | manifest, path-style + chunking + multipart (ADR-0048), api-key/SigV4 custody, conformance run |
| E7 | Five-connector conformance & offline acceptance | the exit criterion: all five pass AC1–AC10 + isolation + offline no-data-loss, recorded in `connector_conformance` |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──┐
       E3   │
       E4   ├──► E7   (E7 needs all five green individually first)
       E5   │
E1 ──► E6 ──┘

E2–E6 are independent of each other once E1 lands (each is a separate artifact + its own conformance run).
They can proceed in parallel. E7 is last and is the exit criterion — the last thing to go green.
```

E1 first: nothing can be proven without the harness and the stubs. E2–E6 are five independent artifacts,
each fully testable in isolation against E1's harness; order among them is by preference (E2 `git` first as the
richest OAuth+transform example is the recommended pathfinder). E7 assembles the five-connector run and the
offline/isolation acceptance and **must be the last thing green** — it is AC-X1, the exit criterion.

The one additive migration (`0030_connector_conformance.sql`) lands in E1, just ahead of E7's writes to it.

---

## E1 — Shared conformance harness & fixtures

### Purpose
Wire the M16 conformance suite (M16 E10) to run against an arbitrary `agents/connectors/*` directory, and
build the deterministic network-stub fixtures the five connectors reuse. This is the foundation every other
epic proves against.

### Scope
In: a harness that loads a `connector.toml`, installs it through the M16 path, and runs AC1–AC10; per-service
network stubs (GitHub REST, Linear GraphQL, Google REST, S3 REST) that respond deterministically; the
`0030_connector_conformance.sql` projection and its writer from the harness. Out: any connector manifest
(E2–E6); the five-connector roll-up (E7).

### Dependencies
M16 implemented (the conformance harness, `install_connector`, `invoke_connector`, custody, egress); M13
(departments to grant against).

### Public APIs
No new kernel API. The harness is test infrastructure: `run_conformance(connector_dir, department) ->
[ConformanceRun]`.

### Acceptance criteria
The harness runs AC1–AC10 against a connector directory and records each result in `connector_conformance`; the
network stubs are deterministic and hermetic (no live service reached).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Harness entry: load a `connector.toml` from a directory, install via the M16 path, expose `run_conformance` | M | M16 | `infrastructure/testing/connectors/suite/harness.rs` | Loads and installs any valid connector dir; a malformed manifest fails install naming the M16 rule |
| **T1.2** | AC1–AC10 runner: instantiate the M16 conformance suite against the installed connector; emit one `ConformanceRun` per claim | M | T1.1 | `.../suite/run.rs` | Each of AC1–AC10 produces a `Pass`/`Fail{reason}`; no claim silently skipped |
| **T1.3** | Network stubs: deterministic GitHub REST, Linear GraphQL, Google REST, S3 REST responders | L | T1.1 | `.../suite/stubs/` | Each stub answers the operations its connector declares; hermetic — no outbound to a real service |
| **T1.4** | `0030_connector_conformance.sql` — additive projection (`connector_id, suite_version, ac_id, verdict, at`) | S | — | `services/store/migrations/0030_connector_conformance.sql` | Forward-only, additive, idempotent, independently deployable; touches no `0025`–`0029` table |
| **T1.5** | Projection writer: the harness records each `ConformanceRun` into `connector_conformance` | S | T1.2, T1.4 | `.../suite/record.rs` | A completed run leaves five-per-connector rows; re-running is idempotent on (connector, suite_version, ac_id) |
| **T1.6** | CI wiring: run the harness in CI over any connector under `agents/connectors/`; assert the M16 kernel-neutrality grep still passes | S | T1.2 | `infrastructure/ci/connectors.sh` | CI runs the suite per connector dir; build fails if a connector id appears in `sidra-connectors` (G7/AC11) |

---

## E2 — `git` — source-control connector

### Purpose
The source-control connector (GitHub), serving Software Engineering. The recommended pathfinder: it exercises
OAuth2 + PKCE, a Wasm response transform, and all three effect classes.

### Scope
In: `agents/connectors/git/connector.toml` (eight operations, effect map per ADR-0046), OAuth config, the
optional response-normaliser transform, and the connector's conformance + isolation + offline fixtures. Out:
the framework (M16); the five-connector roll-up (E7).

### Dependencies
E1; M16 kernel OAuth (ADR-0037) and Wasm transform host.

### Public APIs
None new. Driven through M16 `grant_connector` / `begin_oauth` / `invoke_connector`.

### Acceptance criteria
Passes M16 AC1–AC10 (AC-C1); isolated per department (AC-I1); degrades offline with no buffered write
(AC-O1/O2).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `git` manifest: identity, `[egress].allow = ["api.github.com","github.com"]`, eight operations with effect map (ADR-0046) | M | E1 | `agents/connectors/git/connector.toml` | Passes the ten M16 install checks; class map matches ADR-0046 (reads 1, PR ops 2, merge/delete 3) |
| **T2.2** | OAuth config: `authorize`/`token` on `github.com`, scopes `["repo"]`, `pkce=true`, no client secret | S | T2.1 | `.../git/connector.toml` `[auth]` | Install check #8 passes (OAuth hosts ⊆ egress); check #7 passes (no credential in manifest) |
| **T2.3** | Optional Wasm response transform: normalise PR/commit JSON → Firm `Source` shape, fuel-metered, no ambient authority | M | T2.1 | `agents/connectors/git/transform.wasm` (+ source) | Runs sandboxed; absence is the default; a fuel-exceeding transform is terminated (M16 install check #10) |
| **T2.4** | Sign the manifest as `sidra-systems`; add the sign/verify fixture | S | T2.1 | `.../git/`, `.../suite/git/` | Signature verifies; a tampered manifest fails install (M16 AC1) |
| **T2.5** | `git` conformance + isolation + offline fixtures against E1's GitHub stub | M | T2.1–T2.4, E1 | `infrastructure/testing/connectors/suite/git/` | AC1–AC10 green; agent outside Engineering denied `no_grant` (AC-I1); offline → `Unreachable`, unsent PR not buffered (AC-O2) |

---

## E3 — `issues` — issue-tracker connector

### Purpose
The issue tracker (Linear), serving Software Engineering. The clearest demonstration of declared-not-inferred
effect class: every operation is `POST /graphql`, yet classes span 1–3.

### Scope
In: `agents/connectors/issues/connector.toml` (six GraphQL operations, api-key auth), and its conformance +
isolation + offline fixtures. Out: framework; roll-up.

### Dependencies
E1; M16 api-key custody (ADR-0034).

### Public APIs
None new.

### Acceptance criteria
Passes M16 AC1–AC10 (AC-C2), including AC6 asserting `list_issues` is class 1 though POST; isolated; degrades
offline.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `issues` manifest: `[egress].allow = ["api.linear.app"]`, six operations all `POST /graphql`, effect map (read 1, write 2, delete 3) | M | E1 | `agents/connectors/issues/connector.toml` | Passes the ten install checks; check #4 accepts class-per-action though verb is uniform |
| **T3.2** | api-key auth config: `kind = "api_key"`, no key in the manifest | S | T3.1 | `.../issues/connector.toml` `[auth]` | Install check #7 passes; connector goes `Granted → Operating` with no `Authorizing` step |
| **T3.3** | Sign + sign/verify fixture | S | T3.1 | `.../issues/`, `.../suite/issues/` | Signature verifies; tampered manifest fails install |
| **T3.4** | `issues` conformance + isolation + offline fixtures against E1's Linear GraphQL stub | M | T3.1–T3.3, E1 | `.../suite/issues/` | AC1–AC10 green; **AC6 asserts `list_issues` class 1 / `delete_issue` class 3 though both POST**; isolation + offline hold |

---

## E4 — `calendar` — calendar connector

### Purpose
The calendar (Google Calendar), serving Sales / Customer Success. Exercises the class-2 (`create_event`) vs
class-3 (`send_invitation`) split.

### Scope
In: `agents/connectors/calendar/connector.toml` (six operations, OAuth), and its fixtures. Out: framework;
roll-up.

### Dependencies
E1; M16 kernel OAuth.

### Public APIs
None new.

### Acceptance criteria
Passes M16 AC1–AC10 (AC-C3) including the class-2/3 split; isolated; degrades offline.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | `calendar` manifest: `[egress].allow = ["www.googleapis.com","oauth2.googleapis.com","accounts.google.com"]`, six operations, effect map | M | E1 | `agents/connectors/calendar/connector.toml` | Passes install checks; `send_invitation` class 3, `create_event`/`cancel_event` class 2 |
| **T4.2** | OAuth config: Google authorize/token, scopes `["…/auth/calendar.events"]`, PKCE, no secret | S | T4.1 | `.../calendar/connector.toml` `[auth]` | Install check #8 passes for all three Google hosts; check #7 passes |
| **T4.3** | Sign + sign/verify fixture | S | T4.1 | `.../calendar/`, `.../suite/calendar/` | Signature verifies; tampered manifest fails install |
| **T4.4** | `calendar` conformance + isolation + offline fixtures against E1's Google stub | M | T4.1–T4.3, E1 | `.../suite/calendar/` | AC1–AC10 green; `send_invitation` always asks (AC6); OAuth redirect between Google hosts allowed, off-allowlist blocked (F7); isolation + offline hold |

---

## E5 — `mail` — mail connector

### Purpose
The mail connector (Gmail), serving Customer Success. The most sensitive connector: the `create_draft` (class
2) vs `send_message` (class 3, always asks) split is the core safety property.

### Scope
In: `agents/connectors/mail/connector.toml` (five operations, OAuth), and its fixtures, including the offline
no-buffer proof for a send. Out: framework; roll-up.

### Dependencies
E1; M16 kernel OAuth.

### Public APIs
None new.

### Acceptance criteria
Passes M16 AC1–AC10 (AC-C4) including the draft/send split; isolated; degrades offline; **no send is buffered**
(AC-O2, the load-bearing case for ADR-0047).

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `mail` manifest: `[egress].allow = ["gmail.googleapis.com","oauth2.googleapis.com","accounts.google.com"]`, five operations, effect map | M | E1 | `agents/connectors/mail/connector.toml` | Passes install checks; `send_message` class 3, `create_draft` class 2, reads class 1 |
| **T5.2** | OAuth config: Google authorize/token, scopes `["…/auth/gmail.modify"]`, PKCE, no secret | S | T5.1 | `.../mail/connector.toml` `[auth]` | Install check #8 passes; check #7 passes |
| **T5.3** | Sign + sign/verify fixture | S | T5.1 | `.../mail/`, `.../suite/mail/` | Signature verifies; tampered manifest fails install |
| **T5.4** | `mail` conformance + isolation + **offline no-buffer** fixtures against E1's Gmail stub | M | T5.1–T5.3, E1 | `.../suite/mail/` | AC1–AC10 green; `send_message` always asks; **an approved send interrupted offline is not buffered — it stays a Work Order intent and fires exactly once on recovery (AC-O2)**; isolation holds |

---

## E6 — `object-storage` — object-storage connector

### Purpose
The object-storage connector (S3-compatible), serving Data Engineering. The only connector needing an explicit
request-shape contract: path-style addressing, bounded-chunk streaming, multipart with abort-on-failure, a max
object size, and kernel-side SigV4 signing (ADR-0048).

### Scope
In: `agents/connectors/object-storage/connector.toml` (five operations, api-key/SigV4, single-host path-style),
the streaming/multipart behaviour and its optional listing-normaliser transform, and its fixtures including the
multipart-abort proof. Out: framework; roll-up.

### Dependencies
E1; M16 api-key custody; the M16 egress dispatch path (streaming is within it).

### Public APIs
None new.

### Acceptance criteria
Passes M16 AC1–AC10 (AC-C5) including single declared host (AC4) and the size bound; interrupted `put_object`
aborts multipart leaving no partial object (AC-O3); isolated; degrades offline.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | `object-storage` manifest: `[egress].allow = ["s3.amazonaws.com"]` (path-style, ADR-0048), five operations, effect map, declared max object size | M | E1 | `agents/connectors/object-storage/connector.toml` | One declared host (AC4); `delete_object` class 3, `put_object` class 2; install check #6 passes (no wildcard) |
| **T6.2** | api-key/SigV4 custody config: the AWS key is custody-held; the kernel signs at the boundary; connector never sees the secret | S | T6.1 | `.../object-storage/connector.toml` `[auth]` | Install check #7 passes; redaction scan finds no AWS secret anywhere (AC3) |
| **T6.3** | Streaming + multipart behaviour spec: bounded 8 MiB chunks; multipart above threshold; **abort-on-failure** (ADR-0048/0047) | M | T6.1 | `.../object-storage/` (behaviour spec + optional `transform.wasm`) | Large `get`/`put` stream in bounded chunks; a mid-upload failure aborts multipart, no partial object visible |
| **T6.4** | Sign + sign/verify fixture | S | T6.1 | `.../object-storage/`, `.../suite/object-storage/` | Signature verifies; tampered manifest fails install |
| **T6.5** | `object-storage` conformance + isolation + offline + **multipart-abort** fixtures against E1's S3 stub | M | T6.1–T6.4, E1 | `.../suite/object-storage/` | AC1–AC10 green; oversized `put_object` refused before egress naming the limit; interrupted upload leaves no partial object (AC-O3); isolation + offline hold |

---

## E7 — Five-connector conformance & offline acceptance (the exit criterion)

### Purpose
The exit criterion, made a single test run. **The last thing to go green.** Runs all five connectors through
the same conformance suite, proves each is grantable per department (isolated) and degrades offline without
data loss, and records the result in `connector_conformance`.

### Scope
In: the five-connector roll-up run (AC-X1); the cross-connector isolation matrix; the offline/no-data-loss
acceptance across all five; the multi-grant/revoke-independence proof. Out: any single connector (E2–E6);
the framework (M16).

### Dependencies
All prior epics (E1–E6 each green individually).

### Acceptance criteria
AC-C1..C5, AC-I1..I3, AC-O1..O3 each covered; AC-X1 — all five pass all three clauses in one run, recorded in
the projection — is the final task and the last thing green.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Five-connector conformance run: E1's harness over all five, AC1–AC10 each, recorded in `connector_conformance` | M | E2–E6, E1 | `infrastructure/testing/connectors/suite/all_five.rs` | 5 × AC1–AC10 all `Pass`; rows written per (connector, suite_version, ac_id) (AC-C1..C5) |
| **T7.2** | Isolation matrix: each connector granted to its department; an agent in every *other* department denied `no_grant` with zero egress | M | T7.1 | `.../suite/isolation_matrix.rs` | Per connector, refusal is structural before the Broker (AC-I1); mirrors M16 T10.1 five times |
| **T7.3** | Forbidden-scope + multi-grant/revoke-independence: forbidden scope refused; two departments hold `git`, revoke one, the other's credential survives | S | T7.1 | `.../suite/grants.rs` | AC-I2 (forbidden refused), AC-I3 (revoke isolation, F10) |
| **T7.4** | Offline / no-data-loss acceptance across all five: host-unreachable → clean fail + `Unreachable`; no buffered write; multipart abort | M | T7.1 | `.../suite/offline_all.rs` | AC-O1 (five clean degradations), AC-O2 (no buffer, fire-once on recovery), AC-O3 (multipart abort) |
| **T7.5** | **AC-X1 — the exit criterion in one run:** all five pass AC1–AC10 + isolation + offline no-data-loss, projection populated; this is the last thing to go green | M | T7.1–T7.4 | `.../suite/exit_criterion.rs` | Five connectors, three clauses, one green run; `connector_conformance` shows 5 × AC1–AC10 pass + the isolation/offline claims — proven by test, not configuration |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | shared conformance harness, network stubs, `0030_connector_conformance.sql`, CI wiring |
| E2 | `git` connector (oauth2 + transform, all three effect classes) |
| E3 | `issues` connector (api-key, GraphQL declared-not-inferred class) |
| E4 | `calendar` connector (oauth2, class-2/3 split) |
| E5 | `mail` connector (oauth2, draft/send split, offline no-buffer proof) |
| E6 | `object-storage` connector (api-key/SigV4, path-style + chunking + multipart) |
| E7 | the five-connector conformance + isolation + offline acceptance — **AC-X1, the exit criterion, last green** |
