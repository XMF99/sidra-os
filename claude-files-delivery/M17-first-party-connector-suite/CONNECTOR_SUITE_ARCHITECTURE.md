# First-Party Connector Suite — Architecture

**Milestone M17 · Release 2.5 "Field" · Layer 6 (Integrations)**

| | |
|---|---|
| Milestone | M17 — First-Party Connector Suite (`/MILESTONE_REGISTRY.md` §4, 2.5 "Field") |
| Release | 2.5 "Field" — the Firm reaches outside the building |
| Layer | 6 — Integrations (`/docs-v2/02-layer-model.md` §6) |
| New crate | **None.** M17 ships Layer-6 artifacts under `agents/connectors/`, not kernel code |
| Runs on | M16 — Connector Framework (`sidra-connectors`), unchanged |
| Depends on | M16 (framework: manifest, grant, custody, egress, OAuth, conformance harness), M13 (departments & Registrar), M9 (plugin signing chain), M3 (Broker, `EgressFilter`, `KeychainManager`) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | Five connectors pass the same conformance suite; each is grantable per department; each degrades to offline without data loss |

> **Authoritative precedence.** Where this document disagrees with `/MILESTONE_REGISTRY.md` §4 about M17's
> purpose, dependency, or exit criterion, the registry governs. Where it disagrees with
> `/docs/07-security-model.md` about effect-class semantics or egress rules (§5, §7.5), the security model
> governs. Where it disagrees with the M16 package
> (`claude-files-delivery/M16-connector-framework/CONNECTOR_FRAMEWORK_ARCHITECTURE.md`) about how a connector
> installs, is granted, is authorized, or is invoked, **M16 governs — M17 adds no framework mechanism.** This
> architecture *populates* the framework M16 built; it never re-decides it.

---

## 1. Why this subsystem exists

### 1.1 The problem

M16 built the machinery to reach outside the building and then, deliberately, reached nowhere. It ships a
framework and a conformance harness and **not one connector** — a door with no rooms behind it. The
`integration:*` capability namespace has meaning, the Permission Broker has a connector pre-flight, custody
holds credentials in the keychain, and `EgressFilter` enforces per-connector host allowlists — but a Firm on
M16 still cannot open a pull request, file an issue, read a calendar, send a mail, or store an artifact,
because no artifact exists that describes any of those services.

M17 is the first content on that framework. The registry names exactly what the Firm needs to do its own work:
*source control, issue tracker, calendar, mail, object storage — the five connectors the Firm needs to do its
own work* (`/MILESTONE_REGISTRY.md` §4). Not a marketplace of every SaaS the world offers — five, chosen
because they are the tools the Firm itself uses to build software, coordinate, communicate, and keep its
outputs.

The requirement is not "write five API clients." An API client is code the kernel would have to trust with a
credential and a base URL — the exact exfiltration primitive M16 exists to prevent (threat T2). The
requirement is: **ship five signed Layer-6 artifacts, each a `connector.toml` manifest plus an optional Wasm
response transform, each declaring its hosts, its operations with their effect classes, and its auth
configuration, such that all five pass the one conformance suite M16 already wrote — proving that the
framework's guarantees hold not for a hypothetical connector but for the five real ones the Firm depends on.**

### 1.2 The stance

Three commitments define the suite, and each has an ADR:

1. **M17 ships artifacts, not mechanism.** (ADR-0046) The five connectors are data-plus-optional-transform
   under `agents/connectors/`. There is no new `services/*` crate, no new migration to the framework's tables,
   no new install check, no new grant type, no bypass of the Permission Broker. Everything a connector needs
   already exists in `sidra-connectors`. The concrete five, and their per-operation effect-class maps, are the
   decision M17 records.
2. **Offline is a first-class, data-lossless state — and a write is never buffered.** (ADR-0047) Each
   connector degrades to offline by failing cleanly and marking itself `Unreachable` (the M16 lifecycle
   state). No connector queues, batches, or replays a write. An undispatched external effect stays what it
   already is — a Work Order intent persisted in the Vault — and is re-dispatched by the Firm on recovery,
   never auto-replayed by the connector. This is what "degrades to offline without data loss" means
   mechanically: nothing is lost because nothing was ever held in the connector to lose.
3. **Object storage addresses one declared host and chunks under a bound.** (ADR-0048) The object-storage
   connector uses path-style addressing so its egress is a single declared host, never a per-bucket wildcard;
   it streams large objects in bounded chunks with multipart upload; and it declares a maximum object size.
   This is the one connector whose payloads are large enough that the framework's default request shape needs
   an explicit contract.

### 1.3 What the suite is, mechanically

Five entries under `agents/connectors/`, each exactly the shape M16 defined:

```
agents/connectors/
├── git/                    source control (GitHub)          auth: oauth2   serves: Software Engineering
│   ├── connector.toml
│   └── transform.wasm      (optional response normaliser)
├── issues/                 issue tracker (Linear)            auth: api_key  serves: Software Engineering
│   └── connector.toml
├── calendar/               calendar (Google Calendar)        auth: oauth2   serves: Sales / Customer Success
│   └── connector.toml
├── mail/                   mail (Gmail)                      auth: oauth2   serves: Customer Success
│   └── connector.toml
└── object-storage/         object storage (S3-compatible)    auth: api_key  serves: Data Engineering
    ├── connector.toml
    └── transform.wasm      (optional listing normaliser)
```

Each is installed through M16's `install_connector` (the ten install checks, §5.4 of the framework), granted
through M16's `grant_connector` (per-department, ADR-0035), authorized through M16's kernel OAuth or api-key
custody (ADR-0034, ADR-0037), and invoked through M16's `invoke_connector` (the fixed §9 pipeline). M17 writes
none of that path. It writes the manifests the path consumes, and the conformance fixtures that prove all five
pass.

```
Layer 1  sidra-connectors   ← the framework (M16, unchanged): manifest, registry, OAuth, custody, egress, host
Layer 6  git · issues · calendar · mail · object-storage   ← the five signed artifacts   (M17, THIS DOC)
```

### 1.4 What the suite must never become

- **A sixth mechanism.** If implementing a connector appears to need a new install check, a new grant shape,
  a new effect class, a new egress rule, or a new custody path, that is a framework gap to raise against M16 —
  not something M17 adds. M17's whole claim is that the framework is already sufficient; a connector that
  needs more is a counterexample to report, not a feature to build.
- **A general HTTP client.** No connector accepts a base URL, a host, or a scheme from an agent. Each declares
  its hosts and its operation path templates in a signed manifest; the kernel builds every URL. An agent names
  a declared operation on a granted connector, never a URL (M16 §7, SSRF containment).
- **A firm-wide capability.** Each of the five is granted to a department, never the Firm (ADR-0035). Granting
  `mail` to Customer Success does not let Marketing send mail; granting `git` to Software Engineering does not
  let Finance open a pull request. The exit criterion tests exactly this per connector.
- **A write buffer.** No connector holds an unsent write. Offline means the call fails cleanly and the
  Firm's intent stays in the Vault (ADR-0047). A connector that queues writes has become a place data can be
  lost and a place an external effect can fire twice.

### 1.5 Relationship to M16

| M16 provides | M17 uses it for |
|---|---|
| `connector.toml` manifest schema + ten install checks (§5) | each of the five manifests validates against it unchanged; no connector needs a schema extension |
| Per-department grant, `ConnectorGrant{department_id}` (ADR-0035) | each connector is grantable per department; the exit criterion's isolation claim is M16's AC2 applied five times |
| Credential custody in the keychain (ADR-0034) | oauth2 tokens (`git`, `calendar`, `mail`) and api-keys (`issues`, `object-storage`) all live in the keychain; no connector holds a secret |
| Kernel OAuth + PKCE (ADR-0037) | `git`, `calendar`, `mail` run the kernel authorize/refresh flow; no connector touches the token |
| `EgressFilter` per-connector allowlist (ADR-0036) | each connector's `[egress].allow` is its complete reachable surface; object storage's single-host addressing (ADR-0048) is why its allowlist stays one entry |
| Effect-class policy (M16 §10, unchanged from security model §5) | each operation declares 1/2/3; class-3 (merge, delete, send) always asks |
| The conformance suite + isolation harness (M16 §14, E10) | the exit criterion: all five pass AC1–AC10 of that suite, unchanged |
| `ConnectorCall*` events on the hash chain (M16 §11.2) | every operation on every connector audits through the existing events; M17 adds no event variant |
| Vault Markdown mirror (M16 §11.3) | each connector's `connector.md`/`grants.md`/`calls/` is written by the existing mirror; M17 adds no writer |

The single most important sentence in this document: **M17 adds no row to this table's left column.** It is
the five artifacts and the proof that the M16 framework already carries them.

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | Five real connectors exist, each doing the Firm's own work | §4 the five specifications; each anchored to a department in the catalog |
| G2 | Every connector passes the M16 conformance suite unchanged | §15 AC-C1..C5; the exit-criterion harness (E7) runs AC1–AC10 against each |
| G3 | Each connector is grantable per department, reachable by no other | ADR-0035 (reused); §15 per-connector isolation AC; no firm-wide grant is representable |
| G4 | Each connector degrades to offline with no data loss and no buffered write | ADR-0047; §4 per-connector offline rows; §11.3 offline sequence |
| G5 | No connector holds a credential; custody holds all five | ADR-0034 (reused); §4 auth rows; oauth2 and api_key both inject at the egress boundary |
| G6 | Effect classes are declared per operation, not inferred from HTTP verb | §4 operation tables; a GraphQL read (`issues`) is POST-but-class-1; install check #4 enforces the map |
| G7 | M17 introduces no framework mechanism | §1.4; CI: no new crate, no new migration to framework tables, no new install check |
| G8 | Object storage's large payloads have an explicit contract | ADR-0048; §4.5 chunking, multipart, single-host addressing, max size |
| G9 | The suite is additive; a Firm that grants none behaves exactly as post-M16 | §8 one additive projection; a null grant on all five = M16 behaviour |

---

## 3. Domain model

### 3.1 What M17 adds to the domain

Almost nothing — which is the point. M17 introduces **no new kernel type**. The five connectors are instances
of M16's `ConnectorManifest`; their grants are M16's `ConnectorGrant`; their calls emit M16's `ConnectorEvent`
variants. The only genuinely new vocabulary is on the *conformance* side: the types that record which
connector passed which acceptance claim, so "five connectors pass the same suite" is a queryable fact and not
a CI-log assertion that evaporates.

```
── reused from M16 (no change) ─────────────────────────────────────────────
ConnectorManifest      one per connector, parsed from connector.toml
ConnectorGrant         connector × department × scopes × KeychainRef        (the isolation primitive)
Operation              name · capability · effect(1..3) · method · path_template
AuthConfig             None | ApiKey | OAuth2{authorize, token, scopes, pkce}
KeychainRef            opaque reference — NEVER the secret
ConnectorEvent         the 16 variants; ConnectorCall* land on the hash chain

── new in M17 (conformance vocabulary only) ────────────────────────────────
ConnectorId            already an M16 type; M17 pins the five values below
SuiteVersion(SemVer)   the conformance-suite version a run was executed against
AcId(String)           an acceptance-claim id, e.g. "AC2"  (from the M16 suite)
ConformanceVerdict     Pass | Fail{reason}
ConformanceRun {                                             ← the one new projection
    connector_id:  ConnectorId,
    suite_version: SuiteVersion,
    ac_id:         AcId,
    verdict:       ConformanceVerdict,
    at:            Timestamp,
}
```

### 3.2 The five connector identities (pinned by ADR-0046)

```
ConnectorId          service              auth       primary department            effect ceiling of dept
──────────────────────────────────────────────────────────────────────────────────────────────────────
"git"                GitHub               oauth2     Software Engineering           2 (repo writes approve)
"issues"             Linear               api_key    Software Engineering           2
"calendar"           Google Calendar      oauth2     Sales                          3 (external commitment)
"mail"               Gmail                oauth2     Customer Success               2 (customer sends approve)
"object-storage"     S3-compatible        api_key    Data Engineering               2
```

These five ids are the only connector-specific strings that exist anywhere in M17, and **none of them appear
in the `sidra-connectors` crate** — they live in manifests and in conformance fixtures. The M16 CI grep (G8 of
the framework: "no `if connector == "github"` anywhere in the kernel") still passes, because M17 changed no
kernel code (§17).

### 3.3 Relationships

```
ConnectorManifest   1 ──── * Operation                     (each of the five declares its callable surface)
ConnectorManifest   1 ──── * ConnectorGrant                (one per department granted; §4 lists primary + grantable)
ConnectorGrant      1 ──── 0..1 KeychainRef                (oauth2 token or api_key, custody-held)
ConformanceRun      * ──── 1 ConnectorId                   (the exit-criterion evidence, §8)
Operation.effect    ∈ {1, 2, 3}                            (declared, not inferred — G6)
Operation.capability ∈ integration:<connector-id>:<action> (namespace bound to the connector, M16 §5.2)
```

The `ConformanceRun` projection is the entire footprint M17 leaves on the store — one small additive table so
the exit criterion is auditable (§8). Everything else is a manifest file and a Wasm blob under
`agents/connectors/`.

---

## 4. The five connector specifications

Each subsection is a complete contract: declared egress hosts, the operations with their capability and effect
class, the auth configuration, and the offline-degradation behaviour. Effect classes follow the security model
(§5) and M16 §10 exactly: **1 = external read · 2 = reversible external write · 3 = irreversible/external
effect (always asks).** No operation is class 0 — a network call is at minimum a read (M16 install check #9).

Across the five, auth varies deliberately (three `oauth2`, two `api_key`, zero `none`) to exercise both M16
custody paths. `none` is supported by the framework but used by no first-party connector, because every
service the Firm needs for its own work authenticates the Firm — an unauthenticated external read is not among
the five (ADR-0046, Consequences).

---

### 4.1 `git` — source control (GitHub)

Serves the **Engineering Division**. Primary grant target: **Software Engineering** (`dept.software-engineering`,
effect ceiling 2 — "repository writes require approval", `04-department-catalog.md` §1). Grantable additionally
to Backend, Frontend, and Mobile — each grant is a separate `ConnectorGrant` with its own credential
(ADR-0035); Backend holding `git` gives Frontend nothing.

**Egress hosts (`[egress].allow`).** `api.github.com`, `github.com`. The OAuth `authorize` and `token`
endpoints are on `github.com`, so they satisfy install check #8 (OAuth hosts ⊆ egress) without a further
entry.

| Operation | Capability | Effect | Method | Path template |
|---|---|---|---|---|
| `list_repositories` | `integration:git:read` | 1 | GET | `/user/repos` |
| `get_file` | `integration:git:read` | 1 | GET | `/repos/{owner}/{repo}/contents/{path}` |
| `list_commits` | `integration:git:read` | 1 | GET | `/repos/{owner}/{repo}/commits` |
| `list_pull_requests` | `integration:git:read` | 1 | GET | `/repos/{owner}/{repo}/pulls` |
| `open_pull_request` | `integration:git:write` | 2 | POST | `/repos/{owner}/{repo}/pulls` |
| `comment_on_pull_request` | `integration:git:write` | 2 | POST | `/repos/{owner}/{repo}/issues/{number}/comments` |
| `merge_pull_request` | `integration:git:admin` | 3 | PUT | `/repos/{owner}/{repo}/pulls/{number}/merge` |
| `delete_branch` | `integration:git:admin` | 3 | DELETE | `/repos/{owner}/{repo}/git/refs/heads/{branch}` |

**Auth.** `oauth2`, authorization-code + PKCE, run by the kernel (ADR-0037). `authorize =
https://github.com/login/oauth/authorize`, `token = https://github.com/login/oauth/access_token`, scopes
`["repo"]`. The connector holds no client secret and no token; custody injects the bearer at the egress
boundary (ADR-0034).

**Optional Wasm transform.** A response normaliser that projects GitHub's PR and commit JSON into the Firm's
`Source` shape, running fuel-metered in the plugin sandbox with no ambient authority (M16 install check #10).
Absence of the transform is the default; the connector is fully functional without it.

**Offline degradation (ADR-0047).** Reads fail within the configured timeout and mark `git` `Unreachable`; the
local code artifacts the Firm holds in the Vault are untouched — a code review, a debt audit, a refactor
continues offline against the Vault copy (Layer-6 replaceability, `02-layer-model.md` §9). An `open_pull_request`
that could not be dispatched is **not queued**: the Work Order that would have opened it stays in the Vault as
an intent and is re-dispatched when `git` recovers. No PR is opened twice; no change is lost.

---

### 4.2 `issues` — issue tracker (Linear)

Serves **Software Engineering** primarily (`dept.software-engineering`; work items, technical debt), grantable
to Product Design (`dept.product-design`; roadmap and specification items). Chosen distinct from `git` so the
issue tracker is a genuinely separate connector with its own egress, its own conformance run, and its own
grant — filing an issue does not require, and does not grant, source-control reach.

**Egress hosts.** `api.linear.app`. One host — Linear is a single GraphQL endpoint.

| Operation | Capability | Effect | Method | Path template |
|---|---|---|---|---|
| `list_issues` | `integration:issues:read` | 1 | POST | `/graphql` |
| `get_issue` | `integration:issues:read` | 1 | POST | `/graphql` |
| `create_issue` | `integration:issues:write` | 2 | POST | `/graphql` |
| `update_issue` | `integration:issues:write` | 2 | POST | `/graphql` |
| `add_comment` | `integration:issues:write` | 2 | POST | `/graphql` |
| `delete_issue` | `integration:issues:admin` | 3 | POST | `/graphql` |

**Note on effect class vs. HTTP verb (G6).** Every Linear operation is `POST /graphql`, because GraphQL tunnels
reads and writes through one verb. The effect class is therefore **declared per operation, not inferred from
the method** — `list_issues` is class 1 though it is a POST, `delete_issue` is class 3 though it is the same
POST. M16 install check #4 validates the declared class against the action (`read`→1, `write`→2, `admin`→3),
so the class is a manifest fact the kernel enforces, and the fact that the verb is uniform is irrelevant to
the effect-class policy. This connector is the clearest demonstration that M16's design (class from the
manifest, not from the request) was correct.

**Auth.** `api_key`. A Linear personal API key, provisioned directly at grant (no OAuth flow — the connector
goes `Granted → Operating` without an `Authorizing` step, M16 §3.1). Custody stores the key in the keychain
under `(issues, department_id)` and injects the `Authorization` header at the egress boundary; the connector
never receives it (ADR-0034).

**Offline degradation.** Reads fail cleanly → `Unreachable`; an in-flight `create_issue` that cannot reach
`api.linear.app` fails and the originating Work Order re-dispatches on recovery. No issue is created twice; no
comment is buffered.

---

### 4.3 `calendar` — calendar (Google Calendar)

Serves the **Commercial Division**. Primary grant target: **Sales** (`dept.sales`; the `call-prep` playbook
needs the calendar; effect ceiling 3 — "any external commitment always asks"). Grantable to Customer Success
(`dept.customer-success`; `health-review` scheduling).

**Egress hosts.** `www.googleapis.com` (Calendar API), `oauth2.googleapis.com` (token), `accounts.google.com`
(authorize). All three are declared so the OAuth endpoints satisfy install check #8.

| Operation | Capability | Effect | Method | Path template |
|---|---|---|---|---|
| `list_events` | `integration:calendar:read` | 1 | GET | `/calendar/v3/calendars/{cal}/events` |
| `get_event` | `integration:calendar:read` | 1 | GET | `/calendar/v3/calendars/{cal}/events/{id}` |
| `create_event` | `integration:calendar:write` | 2 | POST | `/calendar/v3/calendars/{cal}/events` |
| `update_event` | `integration:calendar:write` | 2 | PATCH | `/calendar/v3/calendars/{cal}/events/{id}` |
| `cancel_event` | `integration:calendar:write` | 2 | PATCH | `/calendar/v3/calendars/{cal}/events/{id}` |
| `send_invitation` | `integration:calendar:admin` | 3 | POST | `/calendar/v3/calendars/{cal}/events/{id}/invite` |

**Why `send_invitation` is class 3 and `create_event` is class 2.** Creating or cancelling an event on the
Firm's own calendar is a reversible write (class 2 — an event can be recreated, a cancellation reversed).
Sending an invitation dispatches mail to third parties — an external, irreversible effect (class 3), which
**always** raises an Approval Request (M16 §10) regardless of any standing grant. The distinction is exactly
the security model's line between "write, reversible" and "external effect, irreversible" (§5), applied to the
calendar surface.

**Auth.** `oauth2` + PKCE, kernel-run (ADR-0037), scopes
`["https://www.googleapis.com/auth/calendar.events"]`. No client secret in the manifest; custody holds the
token.

**Offline degradation.** Reads fail → `Unreachable`; the Firm's local view of scheduling (as held in Vault
records) is unaffected. An unsent `create_event` or `send_invitation` is not queued — it re-dispatches from
the Work Order on recovery, so no duplicate event and no duplicate invitation.

---

### 4.4 `mail` — mail (Gmail)

Serves **Customer Success** primarily (`dept.customer-success`; `draft-response`; effect ceiling 2 —
"customer-facing sends require approval"). Grantable to Sales (proposals) and Marketing (with the standing
caveat that Marketing's `send` is class 3 and always asks, consistent with its ceiling 3). This is the most
sensitive connector: a mail send is irreversible and public-facing.

**Egress hosts.** `gmail.googleapis.com` (Gmail API), `oauth2.googleapis.com` (token), `accounts.google.com`
(authorize).

| Operation | Capability | Effect | Method | Path template |
|---|---|---|---|---|
| `list_messages` | `integration:mail:read` | 1 | GET | `/gmail/v1/users/{user}/messages` |
| `get_message` | `integration:mail:read` | 1 | GET | `/gmail/v1/users/{user}/messages/{id}` |
| `search_messages` | `integration:mail:read` | 1 | GET | `/gmail/v1/users/{user}/messages` |
| `create_draft` | `integration:mail:write` | 2 | POST | `/gmail/v1/users/{user}/drafts` |
| `send_message` | `integration:mail:admin` | 3 | POST | `/gmail/v1/users/{user}/messages/send` |

**The `create_draft` / `send_message` split is load-bearing.** Drafting is a reversible write (class 2 — a
draft sits in the mailbox, editable and deletable, having reached no recipient). Sending is class 3 —
irreversible, external, always an Approval Request. The Firm's normal path is *draft, then a Principal
approves the send* — never an autonomous send. This mirrors the security model's stance that "send to a third
party" is the canonical class-3 example (§5), and Customer Success's ceiling-2 rule that customer-facing sends
require approval (`04-department-catalog.md` §18).

**Auth.** `oauth2` + PKCE, kernel-run, scopes `["https://www.googleapis.com/auth/gmail.modify"]` (read +
draft + send under one grant, with per-operation effect classes governing what actually happens). Custody
holds the token; the connector never sees it.

**Offline degradation.** Reads fail → `Unreachable`; drafts already written live in the Vault and in the
remote mailbox once created, and are untouched by going offline. Critically, **no send is ever buffered**
(ADR-0047): a `send_message` that could not be dispatched does not sit in a connector queue waiting to fire —
it remains a Work Order awaiting the Principal's approval, and re-dispatches only when both the connector
recovers *and* the approval stands. No mail is sent twice; no mail is sent unapproved after an outage.

---

### 4.5 `object-storage` — object storage (S3-compatible)

Serves the **Platform / Intelligence** boundary. Primary grant target: **Data Engineering**
(`dept.data-engineering`; the `datasets` registry; effect ceiling 2). Grantable to Infrastructure (build
artifacts) and Cloud (topology outputs). The one connector whose payloads are large enough to need an explicit
size and chunking contract (ADR-0048).

**Egress hosts.** `s3.amazonaws.com` — **one host**. The connector uses **path-style addressing**
(`s3.amazonaws.com/{bucket}/{key}`), not virtual-host style (`{bucket}.s3.amazonaws.com`), specifically so its
egress allowlist is a single declared host and never a per-bucket wildcard (ADR-0048). This keeps install
check #6 satisfied (no entry broader than a registrable domain) with the tightest possible surface: exactly
one host, every bucket reached through the path.

| Operation | Capability | Effect | Method | Path template |
|---|---|---|---|---|
| `list_objects` | `integration:object-storage:read` | 1 | GET | `/{bucket}?list-type=2` |
| `get_object` | `integration:object-storage:read` | 1 | GET | `/{bucket}/{key}` |
| `head_object` | `integration:object-storage:read` | 1 | HEAD | `/{bucket}/{key}` |
| `put_object` | `integration:object-storage:write` | 2 | PUT | `/{bucket}/{key}` |
| `delete_object` | `integration:object-storage:admin` | 3 | DELETE | `/{bucket}/{key}` |

`put_object` is class 2 (reversible: buckets are expected to be versioned, so an overwrite retains the prior
version and is undoable); `delete_object` is class 3 (irreversible external effect, always asks).

**Chunking, streaming, and size (ADR-0048).** Object storage is the only connector whose bodies routinely
exceed the framework's default in-memory request shape. Its contract:

- **Streaming.** `get_object` and `put_object` stream through the egress boundary in bounded chunks
  (default 8 MiB) rather than buffering the whole object in the connector host's memory.
- **Multipart.** `put_object` above the chunk threshold uses S3 multipart upload; a failure mid-upload
  **aborts** the multipart session so no partial object becomes visible — which is why an offline `put_object`
  loses nothing (there is no orphaned half-object to reconcile).
- **Max object size.** A declared ceiling (default 5 GiB, the single-PUT/multipart-part practical bound) is a
  manifest fact; a `put_object` exceeding it is refused before any egress, with the limit named.

**Auth.** `api_key` — an AWS access-key-id + secret-access-key pair. Custody holds the secret in the keychain;
**the kernel computes the AWS SigV4 signature at the egress boundary**, so the connector never sees the secret
and never signs. This is the api-key custody path (ADR-0034) applied to a request-signing scheme rather than a
static header — the same guarantee (the connector's address space never holds the secret) reached the same
way (custody injects at the boundary).

**Offline degradation.** Reads fail → `Unreachable`; local artifacts and datasets in the Vault are unaffected.
A `put_object` interrupted by an outage aborts its multipart session (no partial object) and re-dispatches
from the Work Order on recovery; a `delete_object` that could not dispatch simply did not happen. No object is
half-written, no delete is applied twice.

---

## 5. Component and repository placement

M17 adds **no crate and no kernel module.** It adds artifacts under `agents/connectors/`, conformance fixtures
under `infrastructure/testing/connectors/`, and one additive migration for the conformance projection.

```
                          ┌───────────────────────────────────────────────┐
   agent tool call        │        sidra-connectors (kernel, M16)          │   ← UNCHANGED by M17
  "invoke git.            │                                                │
   open_pull_request" ───►│  ConnectorHost → Registry → Broker →           │
                          │  Custody → EgressFilter → (Wasm transform)     │
                          └───────────────────────┬───────────────────────┘
                                                  │  loads manifests from ▼
                          ┌───────────────────────────────────────────────┐
                          │              agents/connectors/  (M17)          │
                          │  git/ · issues/ · calendar/ · mail/ ·           │
                          │  object-storage/   — connector.toml + *.wasm    │
                          └───────────────────────────────────────────────┘
                                                  ▲  proven against ▼
                          ┌───────────────────────────────────────────────┐
                          │   infrastructure/testing/connectors/  (M17)     │
                          │  the M16 conformance harness run against all 5  │
                          │  + offline / no-data-loss / per-dept isolation  │
                          └───────────────────────────────────────────────┘
```

**Dependency direction (ADR-0011).** M17 introduces no code edge. The manifests are data the *existing*
`services/connectors` reads; the conformance fixtures live under `infrastructure/testing`, which may depend on
`services/connectors` for the harness but is never depended upon. There is no new `services/*` crate, so there
is no new dependency edge to check — the M16 rule (`services/connectors` has no edge to
`services/orchestrator` or `services/mission`) is inherited unchanged and remains CI-enforced (§17).

**Placement summary.**

| Path | Change | Contents |
|---|---|---|
| `agents/connectors/git/` | NEW (artifact) | `connector.toml`, optional `transform.wasm` |
| `agents/connectors/issues/` | NEW (artifact) | `connector.toml` |
| `agents/connectors/calendar/` | NEW (artifact) | `connector.toml` |
| `agents/connectors/mail/` | NEW (artifact) | `connector.toml` |
| `agents/connectors/object-storage/` | NEW (artifact) | `connector.toml`, optional `transform.wasm` |
| `services/store/migrations/0030_connector_conformance.sql` | NEW (additive) | the `ConformanceRun` projection (§8) |
| `infrastructure/testing/connectors/suite/` | NEW (tests) | the five conformance runs + offline + isolation |
| `services/connectors/**` | **UNCHANGED** | M17 touches no kernel code |

---

## 6. Public APIs

M17 exposes **no new command or query.** A department is granted a connector, and an agent invokes an
operation, through the M16 API surface exactly as the framework defined it. This section shows the M17
connectors driven through that unchanged surface.

### 6.1 Granting a department a connector (M16 `grant_connector`, ADR-0035)

```
grant_connector(connector = "mail", department = "dept.customer-success",
                scopes = { "integration:mail:read", "integration:mail:write", "integration:mail:admin" })
   → Granted        (a Principal Decision; the plain-language scope list is shown before the act)
```

- The grant carries a `DepartmentId`; there is no firm-wide variant to misuse (ADR-0035).
- A scope in the department's `[capabilities].forbidden` set is refused, permanently (ADR-0013).
- Granting `mail` to Customer Success gives Sales and Marketing nothing — each needs its own grant, its own
  credential, its own `ConnectorGrant` row.

### 6.2 Authorizing (M16 kernel OAuth / api-key custody)

```
# oauth2 connectors (git, calendar, mail):
begin_oauth("mail", "dept.customer-success")  → AuthorizationUrl   (kernel state + PKCE)
complete_oauth(state, code)                    → Operating          (token stored in keychain, ADR-0034/0037)

# api_key connectors (issues, object-storage):
provision_credential("object-storage", "dept.data-engineering", key)  → Operating
                                                  (custody stores the key; no Authorizing state; ADR-0034)
```

### 6.3 Invoking an operation (M16 `invoke_connector`, the §9 pipeline)

```
invoke_connector(agent, connector = "git", operation = "open_pull_request",
                 params = { owner, repo, title, head, base, body })
   → the fixed M16 pipeline:
       resolve dept → grant exists? → scope ⊆ grant \ forbidden → Broker(effect=2) →
       custody inject bearer → egress(host ∈ allow) → optional transform → audit ConnectorCallSucceeded
   → Result ∈ { ok | needs_approval | fenced | denied{no_grant} | egress_blocked | unreachable }
```

An agent names the **operation** `open_pull_request`, never a URL. The kernel builds
`https://api.github.com/repos/{owner}/{repo}/pulls` from the operation's declared path template and the
declared host. The connector supplies only path/query *parameters*, which egress inspects (M16 §7, SSRF
containment).

### 6.4 API rules (inherited from M16 §12.3, restated for the suite)

1. **No API returns a credential** for any of the five — not a token, not an api-key, not the AWS secret. Only
   a `KeychainRef` where a reference is structurally required.
2. **Every effectful call on every connector goes through `invoke_connector` and the Broker.** No connector
   has a side door; a class-3 operation (`merge_pull_request`, `delete_issue`, `send_invitation`,
   `send_message`, `delete_object`) always raises an Approval Request.
3. **`grant`, `revoke`, `provision`, `authorize` are Decisions**, logged, with the plain-language scope list
   shown first.

---

## 7. Events

M17 adds **no event variant.** Every operation on every connector emits the M16 `ConnectorCall*` events onto
the hash chain (ADR-0002), carrying `actor`, `connector_id`, and `department_id`:

`ConnectorCallDispatched` · `ConnectorCallSucceeded` · `ConnectorCallDenied` · `ConnectorEgressBlocked` ·
`ConnectorApprovalRequested` · `ConnectorApprovalResolved` · `ConnectorUnreachable` · `ConnectorRecovered`
(M16 §11.2, unchanged).

A `send_message` on `mail`, for example, emits `ConnectorApprovalRequested` (class 3), then on approval
`ConnectorCallDispatched` → `ConnectorCallSucceeded`, each with `connector_id = "mail"` and `department_id =
"dept.customer-success"`, secrets stripped by the existing redaction filter. `audit.verify` over a
connector-lifecycle fixture passes unchanged (M16 AC8), now exercised with real connector ids.

The **one new persisted fact** M17 introduces — the conformance-run projection (§8) — is written by the test
harness, not emitted as a domain event, because a conformance run is CI evidence about the artifact, not an
action the Firm took. It is deliberately kept off the hash chain for that reason.

---

## 8. Persistence

### 8.1 One additive migration — `0030_connector_conformance.sql`

The connector framework's five tables already exist from M16 (`connectors`, `connector_grants`,
`connector_credentials`, `connector_egress`, `connector_calls`, migrations `0025`–`0029`). Installing and
granting the five connectors writes **through those existing tables** — a connector is a row in `connectors`,
a grant is a row in `connector_grants`, its credential reference a row in `connector_credentials`. **M17 needs
no framework-table migration.**

The single addition is a projection that makes the exit criterion — *five connectors pass the same conformance
suite* — a queryable, auditable fact rather than a CI-log line:

| Table | Purpose |
|---|---|
| `connector_conformance` | `connector_id`, `suite_version`, `ac_id`, `verdict`, `at` — one row per (connector × acceptance-claim) run. Lets a Principal ask "did all five pass AC2?" and get an answer from the store, not from a build log. |

- **Forward-only, additive, idempotent, independently deployable** — the store's migration rule
  (`/docs/04-database-design.md` §10), unchanged.
- **Rebuildable.** The projection is derived from re-running the conformance harness; it holds no source of
  truth, only recorded evidence. Dropping and rebuilding it changes nothing.
- **Null-safe.** A Firm that has run no conformance suite has an empty `connector_conformance` and behaves
  exactly as post-M16.

### 8.2 Migration numbering

`0030_` sits immediately above M16's `0029_connector_calls.sql` and below the parallel M10–M14 batch's band
(`0002`–`0018`, per the project's delivery index) and the M15/M16 bands (`0019`–`0029`) — **no collision.**
`0031` is reserved by the pinned band but **not used**; M17 needs exactly one migration. If a future need for a
second projection appears during implementation, `0031_` is available; the plan does not spend it speculatively.

### 8.3 Vault Markdown mirror

Unchanged. Each connector's `connector.md`, `grants.md`, and `calls/` directory under `~/Sidra/connectors/`
are written by M16's existing mirror writer (M16 §11.3) on state transitions. M17 adds no mirror logic; a
Principal who abandons Sidra OS keeps a readable record of all five connectors, which departments held each,
and every scope granted — but never a credential.

---

## 9. Security requirements

The connector surface is the Firm's largest attack surface (M16 §7); M17 populates it with five real targets
and so is where that surface is first genuinely exercised. **Every mitigation below is an M3 or M16 control
already shipped — M17 adds no security mechanism, it inherits five.** What each connector *adds* is a concrete
instance the framework's controls must hold against, listed in the right column.

| Threat (M3 §3) | Framework control (M16/M3) | What each connector adds |
|---|---|---|
| T2 exfiltration through a tool | Per-connector egress allowlist (ADR-0036); outbound path/query inspected for Vault-resembling payloads (§7.5); a call from an untrusted-content Turn holds no class ≥1 tool (§7.3) | `mail`/`calendar` are the highest-value exfil targets (they *are* messaging); their sends are class 3 and always ask, and no send is reachable from an injected document (the reader Turn has no effectful tool) |
| T3 key theft | Credentials in the keychain only; DB holds a `KeychainRef`; redaction on every write path (ADR-0034) | five credentials of two kinds — three OAuth tokens (`git`, `calendar`, `mail`) and two api-keys (`issues`, `object-storage`); the AWS secret is never even seen by the connector because the *kernel* computes SigV4 (§4.5) |
| T2/SSRF via connector-supplied URL | Kernel builds every URL from the operation template + a declared host; the connector supplies only params, inspected (M16 §7) | `object-storage`'s path-style addressing means the bucket is a *path parameter*, never a host — a malicious bucket name cannot redirect egress off `s3.amazonaws.com` (ADR-0048) |
| T5 malicious/compromised connector | Signature at install; deny-by-default capability; connector cannot name an undeclared host or supply a base URL (M16 §7) | all five are `sidra-systems`-signed first-party artifacts; a tampered manifest fails the install signature check; the optional `git`/`object-storage` transforms run fuel-metered with no ambient authority |
| Over-broad grant | `integration:<id>:*` expanded to plain language at grant; a logged Decision (marketplace rule) | granting `git`'s `admin` scope shows "can merge and delete branches" in words; class-3 asks per call regardless of the standing grant |
| Firm-wide grant by mistake | Structurally impossible — `ConnectorGrant` requires a `DepartmentId` (ADR-0035) | the exit criterion tests this per connector: `mail` granted to Customer Success is unreachable from a Marketing agent, proven by test not configuration |
| Redirect off the allowlist (F7) | Redirects to hosts outside `[egress].allow` are not followed (M16 §14 F7) | Google APIs (`calendar`, `mail`) redirect between `accounts.google.com` and `oauth2.googleapis.com` during OAuth — both are declared, so the legitimate redirect is allowed and any redirect elsewhere is blocked |

**The single choke point holds for all five.** Each connector call is a tool call passing
`PermissionBroker::authorize_action` before custody injects and before egress dispatches. M17 removes no
pre-flight check and adds none; it supplies five sets of manifest facts the existing checks operate on.

---

## 10. Performance requirements

- **Offline is the default-safe state for all five (G4).** A call that cannot reach its host fails within the
  configured timeout and marks that connector `Unreachable`; local work is unaffected. This is the Layer-6
  replaceability test (`02-layer-model.md` §9) run five times — disconnect any or all connectors and the Firm
  continues on the Vault.
- **No connector call blocks the scheduler.** Every operation is an effectful tool call dispatched within a
  Work Order; the Mission scheduler's determinism (M15 §17) is unaffected because a connector call is just
  another tool with an effect class (M16 §15).
- **Object storage does not buffer whole objects.** `get_object`/`put_object` stream in bounded chunks
  (ADR-0048), so a large transfer does not spike the connector host's memory or stall the scheduler; a slow
  transfer is bounded by the same per-call timeout as any other operation.
- **OAuth refresh is off the hot path.** For the three oauth2 connectors, token refresh is scheduled ahead of
  expiry and serialized per grant (M16 §8.3); a call that races an expiry waits on one serialized refresh,
  never a stampede.

---

## 11. Sequence diagrams

### 11.1 Grant → authorize → first call (`mail`, oauth2)

```
Principal        Kernel(connectors, M16)   Keychain      Google(OAuth)   Gmail
   │ grant(mail, customer-success, scopes) │              │              │
   ├──────────────────────────────────────►│ check forbidden; write grant│
   │ begin_oauth(mail, customer-success)   │              │              │
   ├──────────────────────────────────────►│ state+PKCE   │              │
   │◄──────── authorize URL ───────────────┤              │              │
   │ (Principal authorizes in browser) ────┼─────────────►│              │
   │ complete_oauth(state, code)           │              │              │
   ├──────────────────────────────────────►│ validate; exchange ────────►│
   │                                       │◄── token ────┤              │
   │                                       │ store token ►│ (keychain)   │
   │◄──────────── Operating ───────────────┤              │              │
   │  agent: invoke get_message (effect=1) │              │              │
   │                                       │ Broker Allow; inject bearer; egress ─►│
   │                                       │◄──────────── message ────────────────┤
   │  (audit ConnectorCallSucceeded, secrets stripped, connector_id=mail)          │
```

### 11.2 The per-connector isolation refusal — the exit criterion, one of five (`git`)

```
Agent(dept.finance)   ConnectorHost(M16)   Registrar
  │ invoke open_pull_request │                │
  ├─────────────────────────►│ resolve dept ─►│
  │                          │◄── finance ────┤
  │                          │ grant(git, finance)?  →  NONE
  │◄── Denied{no_grant} ─────┤ audit ConnectorCallDenied
  │  (git is granted to Software Engineering; nothing built, nothing injected, nothing dispatched —
  │   the refusal is structural, before the Broker and before any network step)
```

This is M16's AC2 applied to a concrete connector. The exit criterion requires it to hold for **all five**:
`git` unreachable from a non-Engineering agent, `mail` from a non-Customer-Success agent, `object-storage`
from a non-Data-Engineering agent, and so on — each proven by an isolation test, not by configuration.

### 11.3 Offline degradation with no data loss — the exit criterion's second clause (`mail send`)

```
Agent(customer-success)  ConnectorHost   Broker    Custody   Egress    Gmail
  │ invoke send_message (effect=3)  │        │         │        │        │
  ├────────────────────────────────►│ authorize_action(3) ─────────────► │
  │                                 │◄── NeedsApproval ───────────────────┤
  │  (Approval Request persisted; Work Order suspended — the send is an INTENT in the Vault)
  │  Principal approves ────────────►│ resume; inject; egress ──►│ host s3? no — Gmail
  │                                 │                            ├── DNS/connect fails (offline)
  │                                 │◄─────── timeout ───────────┤
  │◄── Unreachable ─────────────────┤ mark mail Unreachable; audit ConnectorUnreachable
  │  (NOTHING is buffered: the approved send stays a Work Order intent in the Vault, ADR-0047)
  │  ... connection returns ...
  │                                 │ mail Recovered (ConnectorRecovered)
  │  Firm re-dispatches the Work Order → send_message succeeds ONCE, no duplicate, no lost mail
```

The two clauses of the exit criterion are exactly diagrams 11.2 (grantable per department, isolated) and
11.3 (degrades offline without data loss). The first clause — *five connectors pass the same conformance
suite* — is diagram 11.1 driven through the full M16 AC1–AC10 harness for each of the five (§15, E7).

---

## 12. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | Agent in a department without the grant invokes any of the five | `Denied{no_grant}` at M16 §9 step 2, before the Broker; audited (exit-criterion isolation, per connector) |
| F2 | `object-storage` request aims a bucket at an off-allowlist host via a crafted bucket name | Impossible — the bucket is a *path* parameter under the single declared host `s3.amazonaws.com`; egress host is fixed (ADR-0048) |
| F3 | Injected document induces a `send_message` | The reader Turn holds no class ≥1 tool (security model §7.3); a send is never reachable from untrusted context |
| F4 | Google/GitHub OAuth token expires mid-Mission | Custody refreshes serially ahead of expiry (M16 §8.3); on failure → `Unreachable`, not a raw error surfaced to the agent |
| F5 | Any service is down | The operation fails cleanly; the connector → `Unreachable`; the Firm continues on the Vault; no data loss (G4, ADR-0047) |
| F6 | `put_object` interrupted by an outage mid-upload | The S3 multipart session is aborted; no partial object is visible; the Work Order re-dispatches on recovery (§4.5) |
| F7 | Class-3 operation invoked (`merge_pull_request`, `delete_issue`, `send_invitation`, `send_message`, `delete_object`) | **Always** an Approval Request; no standing grant; the effect waits on the Principal (M16 §10) |
| F8 | `mail` granted to Marketing, an agent tries an autonomous send | The send is class 3 and asks per call regardless of Marketing's grant; Marketing's ceiling-3 rule and the class-3 policy both require the Principal |
| F9 | A connector manifest is tampered post-signing | Install signature check fails; the connector does not install (M16 install check #2); no override |
| F10 | Two departments both hold `git` and one is revoked | Each grant has its own credential; revoking Backend's `git` zeroizes Backend's token only, leaving Software Engineering's intact (ADR-0035) |

---

## 13. Risks

| # | Risk | Mitigation |
|---|---|---|
| R-1 | A connector needs a framework mechanism M16 does not have (would break the "artifacts only" stance) | If it does, it is an M16 gap to raise, not an M17 feature (§1.4); the conformance suite is exactly the test that surfaces this before ship |
| R-2 | `mail`/`calendar` become an exfiltration channel via a legitimately-allowed host | Egress payload inspection (§7.5); sends are class 3 and always ask; untrusted-context Turns hold no effectful tool; these are M3/M16 controls, exercised not invented |
| R-3 | An OAuth token or the AWS secret leaks into a log or event | Redaction on every write path; DB holds only `KeychainRef`; the AWS secret is never in the connector's address space (kernel signs, §4.5); CI scan asserts no token pattern in events/logs (M16 CR-2) |
| R-4 | A connector accretes into a general HTTP client (accepts a URL) | No manifest field carries a base URL; the kernel builds every URL from template + declared host; an operation that does not exist cannot be invoked (§1.4, M16 §7) |
| R-5 | Object-storage large transfers stall the scheduler or spike memory | Bounded-chunk streaming and multipart with a max-size ceiling (ADR-0048); a slow transfer is timeout-bounded like any call (§10) |
| R-6 | The five ids leak into the framework crate, breaking kernel neutrality (M16 G8) | M17 changes no kernel code; the ids live only in manifests and fixtures; the M16 CI grep still passes (§17) |
| R-7 | A write is buffered and fires twice after recovery | No connector buffers a write (ADR-0047); an undispatched effect is a Vault-held Work Order intent, re-dispatched once by the Firm, never auto-replayed by the connector |

---

## 14. Dependencies and assumptions

### 14.1 Dependencies

| On | For |
|---|---|
| **M16 — Connector Framework** | everything: manifest schema + install checks, per-department grant, custody, kernel OAuth, egress enforcement, the invocation pipeline, and the conformance harness the five must pass. M17 is *content* on M16 and cannot begin until M16's exit-criterion test is green |
| M13 — departments & Registrar | the grant targets: Software Engineering, Sales, Customer Success, Data Engineering must exist as installed departments for their connectors to be grantable; the Registrar resolves the calling agent's department |
| M9 — plugin signing chain & Wasm host | the five manifests are signed on the plugin trust chain; the optional `git`/`object-storage` transforms run in the plugin sandbox |
| M3 — Broker, `EgressFilter`, `KeychainManager`, redaction | inherited through M16; the choke point, host enforcement, credential storage, secret stripping |

### 14.2 Assumptions

1. **M16 is implemented and its exit-criterion test is green** before M17 begins. M17 is content on the
   framework; building it against an unimplemented framework is building against a state that does not exist
   (the same error the registry warns of for M16-before-M13, `/MILESTONE_REGISTRY.md` §5).
2. The four primary grant-target departments (Software Engineering, Sales, Customer Success, Data Engineering)
   are installable from M13 Packs. A Firm running "as one implicit department" (M11) grants all five to that
   single department; the model is unchanged.
3. The five external services present the documented HTTP(S) surfaces (GitHub REST, Linear GraphQL, Google
   Calendar/Gmail REST, S3 REST). Non-HTTP transports remain out of scope for the framework (M16 §16.2) and so
   for the suite.
4. `KeychainManager` is available; the M3 passphrase-wrap fallback covers platforms without a system keychain.

---

## 15. Acceptance criteria

The exit criterion — *five connectors pass the same conformance suite; each is grantable per department; each
degrades to offline without data loss* — decomposed into testable claims. **These are the contract with
AntiGravity.**

The suite each connector passes is **M16's conformance suite, AC1–AC10, unchanged** (M16 §17). "The same
conformance suite" is literal: one harness, five connectors, the same ten claims each.

### 15.1 Clause 1 — five connectors pass the same conformance suite

| # | Claim | Proven by |
|---|---|---|
| AC-C1 | `git` passes M16 AC1–AC10 (installs from a valid signed manifest; isolated per department; no credential leaks; undeclared host blocked; OAuth kernel-run and refreshed; effect-class policy holds; offline degrades cleanly; every action audited; forbidden scope refused; uninstall leaves the Firm working) | the M16 conformance harness run against `agents/connectors/git/`, all ten green |
| AC-C2 | `issues` passes M16 AC1–AC10, including the GraphQL case where effect class is declared not inferred (G6) | harness run against `agents/connectors/issues/`; AC6 asserts `list_issues` is class 1 though POST |
| AC-C3 | `calendar` passes M16 AC1–AC10, including the class-2/class-3 split (`create_event` vs `send_invitation`) | harness run against `agents/connectors/calendar/` |
| AC-C4 | `mail` passes M16 AC1–AC10, including the `create_draft` (class 2) vs `send_message` (class 3, always asks) split | harness run against `agents/connectors/mail/` |
| AC-C5 | `object-storage` passes M16 AC1–AC10, including single-host path-style egress and bounded-chunk streaming (ADR-0048) | harness run against `agents/connectors/object-storage/`; AC4 asserts one declared host, a chunking test asserts the size bound |

### 15.2 Clause 2 — each is grantable per department (isolation)

| # | Claim | Proven by |
|---|---|---|
| AC-I1 | Each connector granted to its department is reachable only from that department; an agent in any other department is refused `no_grant` structurally, before the Broker and before egress | five isolation tests (one per connector), each M16 AC2 applied to a concrete connector (§11.2) |
| AC-I2 | A scope in a department's `[capabilities].forbidden` set cannot be granted for any of the five, even after later approvals | forbidden-scope refusal test per applicable connector (M16 AC9) |
| AC-I3 | Two departments holding the same connector hold two grants and two credentials; revoking one leaves the other intact | multi-grant test on `git` (Software Engineering + Backend), revoke one, assert the other's token survives (F10) |

### 15.3 Clause 3 — each degrades to offline without data loss

| # | Claim | Proven by |
|---|---|---|
| AC-O1 | Each connector, on host-unreachable, fails within the timeout, marks `Unreachable`, and the Firm keeps working on the Vault with no data loss | five offline-degradation tests (Layer-6 replaceability, M16 AC7) |
| AC-O2 | No connector buffers a write; an undispatched external effect stays a Work Order intent and re-dispatches exactly once on recovery, never firing twice | per-connector no-buffer test: interrupt a class-2/3 op, recover, assert the effect fired once (ADR-0047) |
| AC-O3 | An interrupted `object-storage` `put_object` aborts its multipart session, leaving no partial object; recovery re-dispatches cleanly | multipart-abort test (ADR-0048, F6) |

### 15.4 The exit-criterion roll-up

| # | Claim | Proven by |
|---|---|---|
| AC-X1 | **All five connectors pass, all three clauses hold, in one run** — recorded in `connector_conformance` as five × AC1–AC10 green plus the isolation and offline claims | the final task of E7: the five-connector conformance + offline acceptance, the last thing to go green (§8 projection populated) |

---

## 16. Testing strategy

M17's tests are, deliberately, **the M16 conformance harness pointed at real artifacts** plus the three
exit-criterion clauses. No connector ships its own bespoke test framework; the whole value of M16's suite is
that five connectors reuse it.

| Layer | What is tested | How |
|---|---|---|
| Manifest validation | each of the five `connector.toml` passes the M16 ten install checks; a deliberately-broken copy of each fails, naming the rule | the M16 install-check harness over the five manifests + a malformed-corpus per connector |
| Conformance (per connector) | AC1–AC10 for each connector against a network stub standing in for GitHub/Linear/Google/S3 | the M16 conformance suite (E10 of M16) instantiated five times (E7 tasks) |
| Isolation (per connector) | the exit-criterion refusal: connector granted to dept A, agent in dept B denied `no_grant`, zero egress | five isolation tests mirroring M16 T10.1 (§11.2) |
| Offline / no data loss | host-unreachable → clean fail, `Unreachable`, Firm continues; no buffered write; multipart abort | five offline tests + the no-buffer and multipart-abort tests (§15.3) |
| Effect-class policy | class-3 ops always ask; the GraphQL declared-not-inferred case; the draft/send and create/invite splits | property tests over each connector's operation registry (M16 AC6) |
| Custody redaction | no token/api-key/AWS-secret in any event, log, stored param, or the connector's address space, for all five | redaction scan over a full call per connector (M16 AC3) |
| Signing | each manifest is `sidra-systems`-signed and verifies; a tampered manifest fails install | signature test per connector (M16 AC1 / install check #2) |

**Network stubs, not live services.** Every conformance run uses a deterministic stub for the external
service; no test reaches GitHub, Linear, Google, or AWS. This keeps the suite hermetic and CI-runnable, and
means "five connectors pass" is reproducible offline — which is itself consistent with the offline-degradation
stance.

---

## 17. CI requirements

| Gate | Requirement | Inherited / new |
|---|---|---|
| Conformance suite runs for all five | CI runs the M16 conformance harness against each of `agents/connectors/{git,issues,calendar,mail,object-storage}/`; a red claim on any connector fails the build | new wiring, existing harness (M16 E10) |
| Kernel neutrality still holds | the M16 grep — no connector id (`git`, `issues`, `calendar`, `mail`, `object-storage`, or any service name) appears in the `sidra-connectors` crate — still passes, because M17 changed no kernel code (G7) | inherited (M16 G8/AC11), must stay green |
| Dependency direction unchanged | `services/connectors` still has no edge to `services/orchestrator` or `services/mission`; M17 added no crate, so the check is unchanged and green | inherited (M16 AC12) |
| No new framework migration | CI asserts M17 adds only the additive `0030_connector_conformance.sql` and touches no `0025`–`0029` framework migration (G7, §8) | new assertion |
| Manifest lint | each `connector.toml` parses and passes the ten install checks in CI, independent of the runtime install path | new wiring, existing checks (M16 §5.4) |
| Redaction scan | the M3/M16 secret-pattern scan runs over the conformance fixtures' events and logs; zero token patterns for all five | inherited (M16 CR-2) |

The defining CI fact of M17: **the build's proof that M17 shipped correctly is that a kernel-neutrality grep
finds nothing and a conformance suite finds five passes.** If the grep ever finds a connector id in the
framework crate, M17 broke the layer model and the build must fail — the same rule that protects the kernel's
department-neutrality (`02-layer-model.md` §1).

---

## Appendix A — Glossary additions

- **First-Party Connector** — one of the five signed Layer-6 artifacts M17 ships (`git`, `issues`, `calendar`,
  `mail`, `object-storage`), each a `connector.toml` plus an optional Wasm transform, running on the M16
  framework. Holds no credential and no kernel code.
- **Conformance run** — one execution of an M16 acceptance claim against one connector, recorded in
  `connector_conformance`. Five connectors × AC1–AC10 = the exit-criterion evidence.
- **No-buffer contract** — the rule (ADR-0047) that no connector holds an unsent write; an undispatched
  external effect stays a Vault-held Work Order intent, re-dispatched once on recovery.
- **Path-style addressing** — the object-storage convention (ADR-0048) of reaching a bucket as a path under a
  single declared host (`s3.amazonaws.com/{bucket}/{key}`), so egress stays one host and never a wildcard.
- **Declared-not-inferred effect class** — the property (M16 install check #4, exercised by `issues`) that an
  operation's effect class comes from its manifest, not from its HTTP verb; a GraphQL read is POST-but-class-1.

## Appendix B — Repository placement

```
agents/
└── connectors/                        NEW — the five signed artifacts (Layer 6)
    ├── git/            connector.toml · transform.wasm(optional)
    ├── issues/         connector.toml
    ├── calendar/       connector.toml
    ├── mail/           connector.toml
    └── object-storage/ connector.toml · transform.wasm(optional)

services/store/migrations/
└── 0030_connector_conformance.sql     NEW — additive projection (the exit-criterion evidence)

infrastructure/testing/connectors/
└── suite/                             NEW — the M16 conformance harness run against all five,
                                             plus per-connector isolation and offline / no-data-loss tests

services/connectors/                    UNCHANGED — M17 touches no kernel code
```

No new crate. No new kernel module. No new event variant. No new install check. Dependency direction
(`packages/domain ← services/connectors ← apps/*`) is inherited from M16 and unchanged; M17 adds no edge.

## Appendix C — Implementation position

M17 is the **second** milestone of 2.5 "Field" and the **first content on the M16 framework**. It depends
wholly on M16 and cannot begin until M16 is implemented, integrated, and its exit-criterion test is green.
Building the connectors before the framework — or, worse, building a connector as a `services/*` crate that
reaches the network directly — is precisely the firm-wide-permission, credential-in-the-connector mistake the
M16 ADRs (0034–0037) exist to prevent.

M17 precedes **M18 (Companion)**, which needs the Brief and Approval-Request formats but not the connectors;
M18 and M17 are independent within 2.5 and could proceed in parallel once M16 lands, though M17 is the natural
next step because it completes the "reaches outside the building" promise the release is named for.

**Exit criterion.** Five connectors pass the same conformance suite; each is grantable per department; each
degrades to offline without data loss (§15, AC-X1) — proven by test, not by configuration.
