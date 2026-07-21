# Connector Framework — Architecture

**Milestone M16 · Release 2.5 "Field" · Layer 6 (Integrations)**

| | |
|---|---|
| Milestone | M16 — Connector Framework (`/MILESTONE_REGISTRY.md` §4, 2.5 "Field") |
| Release | 2.5 "Field" — the Firm reaches outside the building |
| Layer | 6 — Integrations (`/docs-v2/02-layer-model.md` §6) |
| New crate | `sidra-connectors` at `services/connectors/` |
| Depends on | M3 (Permission Broker, egress, keychain), M9 (plugin host & trust chain), M13 (departments & Registrar) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A connector is installed, granted to exactly one department, and no other department can reach it — **proven by test, not by configuration** |

> **Authoritative precedence.** Where this document disagrees with `/docs/07-security-model.md`, the security
> model governs the effect-class semantics and the egress rules. Where it disagrees with
> `/docs-v2/03-department-architecture.md` about the `integration:*` capability namespace, that document
> governs. This architecture *extends* those boundaries; it never re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M15 the Firm does all its work inside the building. It reads and writes its own Vault, runs models,
plans Missions, and produces Briefs — but it cannot open a pull request, file an issue, read a calendar, or
send a mail. Every "integration" today is a hypothetical `integration:git:read` capability named in a
department manifest with nothing behind it. M16 is the machinery behind that name.

The requirement is not "let agents call APIs." An agent that can call an arbitrary API is an exfiltration
primitive wearing a helpful face (threat T2). The requirement is: **let a specific department reach a
specific external service through a specific, declared, kernel-mediated surface, holding a credential the
department never sees, over hosts the connector declared in advance, with every call passing the one choke
point that already governs every other effect.**

### 1.2 The stance

Four commitments define the framework, and each has an ADR:

1. **The kernel holds the credential; the connector never does.** (ADR-0034) A connector describes *how* to
   talk to a service. It never possesses the token. The kernel injects the credential at the egress boundary,
   after the connector has handed over a request it cannot itself dispatch.
2. **A connector is granted to a department, never to the Firm.** (ADR-0035) `integration:<id>:<action>` is
   granted to exactly one department at a time. There is no firm-wide connector grant, structurally — the
   grant type carries a `DepartmentId` and has no "firm" variant to misuse.
3. **Egress is declared in the manifest and enforced by the kernel.** (ADR-0036) A connector may reach only
   the hosts it declared at install. An attempt to reach any other host is blocked at the existing
   `EgressFilter`, logged, and surfaced — the connector cannot supply an arbitrary base URL.
4. **OAuth is a kernel capability.** (ADR-0037) The connector declares its OAuth configuration; the kernel
   runs the authorization-code + PKCE flow, stores and refreshes the token in the OS keychain, and injects
   the bearer at call time. The connector participates in no part of the flow that touches the secret.

### 1.3 What the framework is, mechanically

The **framework** is kernel machinery (Layer 1). The **connectors** are the Layer-6 artifacts it manages —
exactly as the plugin host (kernel) manages Layer-7 Wasm plugins, and the Registrar (kernel) manages Layer-3
Department Packs. This parallel is deliberate and load-bearing: it means M16 introduces no new trust
mechanism. It reuses the plugin signing chain (ADR-0006), the department grant model (ADR-0013), and the
security kernel already shipped in M3.

```
Layer 1  sidra-connectors   ← the framework: manifest, registry, OAuth, custody, egress, host   (M16, THIS DOC)
Layer 6  a connector         ← github.toml + optional Wasm transform, a signed artifact          (M17 ships the suite)
```

### 1.4 What the framework must never become

- **A general HTTP client for agents.** Agents never name a URL. They name a declared *operation* on a
  granted connector; the kernel constructs the URL from the operation template and the connector's declared
  host. An operation that does not exist cannot be invoked, and a host that was not declared cannot be reached.
- **A place credentials live outside the keychain.** No table, log, event, prompt, or connector address space
  ever contains a token. The database holds a *reference* to a keychain entry, never the secret (ADR-0034).
- **A firm-wide capability.** The moment a connector is reachable from more than the department it was granted
  to, the isolation the whole enterprise model rests on has a hole. The exit criterion tests exactly this.
- **A bypass of the Permission Broker.** Every connector call is a tool call and passes `authorize_action`
  before anything leaves the machine. The framework adds pre-flight checks; it never replaces the choke point.

### 1.5 Relationship to existing concepts

| Existing concept | How M16 relates |
|---|---|
| Permission Broker (M3) | Every connector call passes through it. M16 adds a connector-grant check and a department-match check *before* the Broker's existing effect-class logic. |
| `EgressFilter` (M3) | M16 compiles each connector's declared hosts into a per-connector, per-department allowlist that the existing filter consults. Egress inspection (§7.5 of the security model) is unchanged. |
| `KeychainManager` (M3) | Credential custody stores connector tokens through the existing keychain interface. M16 adds token-reference bookkeeping, not a new secret store. |
| Department Pack (M13) | A connector is a smaller sibling artifact with the same trust chain. `[capabilities]` in `department.toml` already names `integration:*` entries — M16 gives them meaning and enforces `[capabilities].forbidden`. |
| Plugin host (M9) | A connector's optional response-transform runs as a Wasm component in the existing sandbox, no new mechanism. |
| Exchange / Registrar (M13) | The Registrar resolves the calling agent's department, which the grant check needs. Cross-department reuse of a connector is refused, not routed. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A connector is reachable only by the department it was granted to | ADR-0035; grant record carries `DepartmentId`; Broker department-match check (§9) |
| G2 | Credentials never leave the kernel | ADR-0034; custody injects at egress; redaction on every write path (unchanged from M3 §9) |
| G3 | A connector reaches only declared hosts | ADR-0036; manifest `[egress].allow` compiled into `EgressFilter`; kernel builds the URL |
| G4 | OAuth requires no connector code that touches the secret | ADR-0037; kernel runs PKCE + refresh |
| G5 | Every effectful call obeys the effect-class policy unchanged | §10; reads class-1, writes class-2 (approval default), irreversible class-3 (always ask) |
| G6 | Isolation is a compile/test property, not a configuration | §14 conformance suite; the exit-criterion test |
| G7 | Offline degrades cleanly with no data loss | §11.4; connector-unreachable is a first-class state |
| G8 | The framework contains no connector-specific logic | CI grep check (mirrors the Layer-1 kernel rule); no `if connector == "github"` anywhere |
| G9 | Everything is additive | §12 forward-only migrations; null grant = no connector, exactly pre-M16 behaviour |

---

## 3. Connector lifecycle

### 3.1 States

```
        install (signature + manifest valid)
  ──────────────────────────────────────────►  INSTALLED
                                                   │  grant(department, scopes)   ← a Principal Decision
                                                   ▼
                                                GRANTED ───────────────┐
                                                   │                    │ auth.kind = none | api_key
                                       auth.kind = oauth2               │ (credential provisioned directly)
                                                   ▼                    ▼
                                              AUTHORIZING ─────────► OPERATING
                                              (kernel PKCE flow)         │
                                                   │  callback ok        │  call succeeds / fails-and-retries
                                                   └──────────►──────────┤
                                                                         │  host unreachable / token refresh fails
                                                                         ▼
                                                                    UNREACHABLE ──(recovers)──► OPERATING
                                                   revoke grant │        │ uninstall
                                                                ▼        ▼
                                                            REVOKED   UNINSTALLED
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `install` | Installed | signature verified, manifest passes all install checks (§5.4) |
| Installed | `grant` | Granted | department exists; scopes ⊆ manifest capabilities; not in the department's `forbidden` set |
| Granted | `begin_oauth` | Authorizing | `auth.kind = oauth2` |
| Authorizing | `oauth_callback_ok` | Operating | `state` matches; PKCE verifier valid; token stored in keychain |
| Authorizing | `oauth_callback_fail` | Granted | error surfaced; no partial credential retained |
| Granted | (credential provisioned) | Operating | `auth.kind ∈ {none, api_key}` |
| Operating | `call` | Operating | Broker + custody + egress pass |
| Operating | `host_unreachable` \| `refresh_failed` | Unreachable | — |
| Unreachable | `host_recovered` | Operating | — |
| Granted \| Operating \| Unreachable | `revoke` | Revoked | credential zeroized; grant closed |
| any | `uninstall` | Uninstalled | all grants revoked, all credentials removed |

### 3.3 Invariants

1. **No call leaves the machine from any state but `Operating`.** A connector in any other state fails
   invocations cleanly with a typed reason.
2. **A credential exists only while a grant exists.** `revoke` and `uninstall` remove it before the state
   transition commits. There is no state in which a token outlives its grant.
3. **`Revoked` and `Uninstalled` are terminal for that grant.** Re-granting is a fresh Decision producing a
   fresh grant record; history of the prior grant is never rewritten (ADR-0002 event log).

---

## 4. Domain model

### 4.1 Core types

```
ConnectorId(String)            // stable id from the manifest, e.g. "github"
ConnectorVersion(SemVer)
DepartmentId(String)           // from the department substrate (M13)
OperationName(String)          // e.g. "list_issues"
Scope(String)                  // an integration:* capability string
KeychainRef(String)            // an opaque reference to a keychain entry — NEVER the secret
```

### 4.2 `ConnectorManifest`

The whole contract in one file (`connector.toml`), mirroring the department manifest's "everything the kernel
trusts is here" stance.

| Field | Type | Meaning |
|---|---|---|
| `id`, `name`, `version` | ids | identity |
| `sidra_api` | range | kernel compatibility |
| `publisher`, `signature` | signing | plugin trust chain (ADR-0006) |
| `auth` | `AuthConfig` | `none` \| `api_key` \| `oauth2` (+ endpoints, scopes, PKCE) |
| `egress.allow` | `[Host]` | the **only** hosts this connector may reach (ADR-0036) |
| `operations` | `[Operation]` | the callable surface |

### 4.3 `Operation`

| Field | Type | Meaning |
|---|---|---|
| `name` | `OperationName` | what an agent invokes |
| `capability` | `Scope` | must be `integration:<id>:<action>` and match this connector's id |
| `effect` | `EffectClass` | 1 read · 2 reversible write · 3 irreversible/external (§10) |
| `method` | HTTP verb | the request shape |
| `path_template` | String | joined to a declared host by the kernel; the connector never supplies a base URL |

### 4.4 `ConnectorGrant` — the isolation primitive

```
ConnectorGrant {
    connector_id:  ConnectorId,
    department_id: DepartmentId,      // REQUIRED — no "firm" variant exists (ADR-0035)
    scopes:        Set<Scope>,        // subset of manifest capabilities, minus the department's forbidden set
    credential:    Option<KeychainRef>,   // present only while authorized
    granted_at:    Timestamp,
    granted_by:    Actor,             // the Principal — a Decision
    revoked_at:    Option<Timestamp>,
}
```

The grant is the entire security surface of the framework compressed into one record: *who* (department),
*what* (scopes), *with which secret* (a reference, never the secret). Two departments needing the same
connector produce two grants with two credentials — never a shared one, for the same reason two departments
needing the same skill get two agent instances (`02-layer-model.md` §4).

### 4.5 Relationships

```
ConnectorManifest 1 ──── * Operation
ConnectorManifest 1 ──── * ConnectorGrant        (one per department granted)
ConnectorGrant    1 ──── 0..1 KeychainRef        (the credential reference)
ConnectorGrant    * ──── 1 DepartmentId          (the boundary)
Operation.capability ∈ integration:<id>:*        (namespace bound to the connector)
```

---

## 5. The manifest (`connector.toml`) and install validation

### 5.1 Shape

```toml
[connector]
id          = "github"
name        = "GitHub"
version     = "1.0.0"
sidra_api   = "^2.0"
publisher   = "sidra-systems"
description = "Source control: repositories, issues, pull requests."

[auth]
kind        = "oauth2"                 # none | api_key | oauth2
authorize   = "https://github.com/login/oauth/authorize"
token       = "https://github.com/login/oauth/access_token"
scopes      = ["repo:read", "issues:write"]
pkce        = true
# NO client secret, token, or key appears here. Ever. (ADR-0034, install check #7)

[egress]
allow = ["api.github.com", "github.com"]   # the only reachable hosts (ADR-0036)

[[operations]]
name       = "list_issues"
capability = "integration:github:read"
effect     = 1
method     = "GET"
path       = "/repos/{owner}/{repo}/issues"

[[operations]]
name       = "create_issue"
capability = "integration:github:write"
effect     = 2
method     = "POST"
path       = "/repos/{owner}/{repo}/issues"

[signature]
publisher  = "sidra-systems"
```

### 5.2 The `integration:*` namespace, formalized

The capability grammar from the security model (`domain "." action [":" scope]`) already admits
`integration:git:read`. M16 fixes the shape for connectors:

```
integration:<connector-id>:<action>          action ∈ { read, write, admin }
integration:<connector-id>:*                  all actions (shown expanded in plain language at grant)
```

`read` maps to effect class 1, `write` to class 2, `admin` to class 3. The mapping is declared per operation
and validated at install (check #4), so the class is a manifest fact, not a runtime guess.

### 5.3 The department's say

A department manifest already declares, in `[capabilities]`:

- `required` / `optional` — what it may hold. A grant's scopes must intersect these.
- `forbidden` — a **permanent self-denial**. A connector grant whose scope appears in the department's
  `forbidden` set is refused at grant time, and stays refused through every future approval (ADR-0013).
  `integration:cloud:write` in Marketing's forbidden list means Marketing can never be granted it, full stop.

### 5.4 Install validation checks (hard refusal, no override)

Mirrors the department Pack's twelve mechanical checks. Each failure names the rule.

1. Manifest schema valid; `sidra_api` range satisfied by the running kernel.
2. Signature verified against a trusted publisher, or developer mode explicitly enabled (v1 rules).
3. Every operation's `capability` is in the `integration:<id>:*` namespace and its `<id>` equals this
   connector's id — a connector cannot declare a capability for another connector.
4. Every operation declares an `effect` in 1–3, consistent with its action (`read`→1, `write`→2, `admin`→3).
5. Every operation's host (derived from its declared host binding) is a member of `[egress].allow`.
6. `[egress].allow` is non-empty and contains no entry broader than a registrable domain (no bare TLDs, no
   `*`).
7. **No credential material anywhere in the manifest** — a scan rejects anything matching secret/token/key
   patterns (redaction filter, reused from M3 §9).
8. If `auth.kind = oauth2`: `authorize`, `token`, and `scopes` are present, and the `authorize`/`token` hosts
   are members of `[egress].allow` — the OAuth endpoints are subject to the same egress rule as everything
   else.
9. No operation declares `effect = 0` — a network call is at minimum an external read (class 1); class 0 is
   local-only by definition (security model §5).
10. Any bundled Wasm transform declares its fuel limit and requests no ambient authority (ADR-0006).

---

## 6. Component structure

```
                          ┌───────────────────────────────────────────────┐
   agent tool call        │              sidra-connectors (kernel)         │
  "invoke github.         │                                                │
   list_issues" ─────────►│  ConnectorHost                                 │
                          │    │  1. resolve grant (connector × dept)       │
                          │    ▼                                            │
                          │  Registry ──► ConnectorGrant, ConnectorManifest │
                          │    │                                            │
                          │    ▼  2. build request from operation template  │
                          │  RequestBuilder (host from manifest, never agent)│
                          │    │                                            │
                          └────┼───────────────┬─────────────────┬─────────┘
                               ▼               ▼                 ▼
                        PermissionBroker   Custody          EgressFilter
                        (sidra-security)   (keychain)       (sidra-security)
                        3. authorize_action 4. inject cred    5. host allowlist
                           + dept match        at boundary       + payload inspect
                               │               │                 │
                               └───────────────┴─────────────────┘
                                               ▼
                                       outbound HTTPS  ─────►  external service
                                               │
                                               ▼
                                    response → optional Wasm transform (plugin host, sandboxed)
                                               ▼
                                    audited ConnectorCall event (secrets stripped)
```

Internal modules of `sidra-connectors`:

| Module | Responsibility |
|---|---|
| `manifest` | parse & validate `connector.toml`; the ten install checks |
| `registry` | installed connectors + grants; the org-facing source of truth for "who can reach what" |
| `oauth` | kernel-run authorization-code + PKCE flow; callback validation; refresh scheduling |
| `custody` | keychain-backed token store; reference bookkeeping; injection at the egress boundary; zeroization on revoke |
| `egress` | compile `[egress].allow` per connector+department into the `EgressFilter`; call inspection hook |
| `host` | the invocation path: grant resolution → request build → Broker → custody → egress → transform → audit |
| `conformance` | the suite M17 connectors must pass; also houses the isolation-proof harness |

**Dependency direction (ADR-0011).** `packages/domain ← services/connectors ← apps/*`. `services/connectors`
depends on `services/security`, `services/store`, `services/plugins`, and `services/departments`. It does
**not** depend on `services/orchestrator` or `services/mission`; the absence of that edge is a compile-time
property enforced in CI, exactly as Appendix B of the Mission Engine does it.

---

## 7. Security

The connector surface is the largest attack surface the Firm has, because it is the only one that is both
effectful and pointed outward. Every mitigation below is an application of an existing M3 control, not a new
one.

| Threat (M3 §3) | How M16 addresses it |
|---|---|
| T2 exfiltration through a tool | Egress allowlist is per-connector and manifest-declared (ADR-0036); outbound path/query inspected for Vault-resembling payloads (security model §7.5) — a hit raises approval regardless of allowlist; a call originating from an untrusted-content Turn is denied class ≥1 tools (security model §7.3), so a connector call cannot be triggered by an injected document. |
| T3 key theft | Credentials live only in the keychain; the DB holds a `KeychainRef`; redaction filter strips any token from logs, events, and stored parameters; the connector's address space never receives the secret (ADR-0034). |
| T5 malicious connector | Signature check at install; deny-by-default capability; the connector cannot name a host it did not declare, cannot supply a base URL, and cannot invoke an operation it did not declare. |
| T2/SSRF via connector-supplied URL | The kernel builds the URL from the operation's `path_template` and a **declared** host. The connector supplies only path/query *parameters*, which are inspected. It never supplies scheme or host. |
| Over-broad grant | `integration:<id>:*` is expanded and shown in plain language at grant (marketplace rule, `05-marketplace-and-packs.md`); a grant is a logged Principal Decision. |
| Firm-wide grant by mistake | Structurally impossible — `ConnectorGrant` requires a `DepartmentId` (ADR-0035). |

**The single choke point holds.** A connector call is a tool call. It passes `PermissionBroker::authorize_action`
before custody injects anything and before egress dispatches anything. M16 adds two pre-flight checks *ahead*
of the Broker's existing logic — grant existence and department match — and one *at* the egress boundary —
the per-connector host allowlist. It removes none.

---

## 8. Credential custody (ADR-0034 in mechanism)

1. **Storage.** A credential (OAuth access+refresh token, or an API key) is written to the OS keychain via
   `KeychainManager` under a service/account derived from `(connector_id, department_id)`. The DB stores only
   the resulting `KeychainRef`, `token_expires_at`, and a refresh state — never the secret.
2. **Injection.** At the egress boundary, and only there, the custody module reads the secret from the
   keychain and attaches it to the outbound request (bearer header or API-key header per `auth.kind`). The
   request object handed to custody by the connector host carries a *placeholder*, not the secret; the secret
   exists in process memory for the duration of the send and is zeroized after.
3. **Refresh.** For `oauth2`, custody watches `token_expires_at`. A refresh is a kernel action against the
   declared `token` host (subject to egress), serialized per grant so two concurrent calls cannot double-
   refresh. A refresh failure transitions the connector to `Unreachable` (§3) rather than surfacing a raw
   auth error to an agent.
4. **Revocation.** `revoke` and `uninstall` delete the keychain entry and null the `KeychainRef` before the
   state transition commits (invariant §3.3.2).

---

## 9. Authorization path and per-department enforcement (ADR-0035 in mechanism)

On `invoke_connector(agent, connector, operation, params)`:

1. **Resolve the agent's department** via the Registrar (M13). An agent exists in exactly one department
   (`02-layer-model.md` §4).
2. **Grant existence.** A `ConnectorGrant` for `(connector, department)` must exist and be un-revoked. If it
   does not, deny with `no_grant` and log — this is the department-match check, and it is the exit criterion.
   An agent in department B invoking a connector granted to department A fails **here**, structurally, before
   any Broker effect logic and before any network consideration.
3. **Scope check.** The operation's `capability` must be in the grant's `scopes` and not in the department's
   `forbidden` set.
4. **Broker.** Call `authorize_action` with the operation's effect class. The Broker applies the unchanged
   effect-class policy (§10), fences, and revocation.
5. **Custody + egress** proceed only if steps 1–4 pass.

Steps 2–3 are the *pre-flight* the framework adds. Step 4 is the choke point that already existed. No step is
skippable and the order is fixed.

---

## 10. Effect classes (unchanged from the security model)

Each operation declares its class; M16 enforces the existing policy verbatim.

| Class | Connector meaning | Policy |
|---|---|---|
| 1 | external read (`list_issues`, `get_calendar`) | host allowlist; approval for a new host; result archived to Sources; denied entirely from an untrusted-content Turn |
| 2 | reversible external write (`create_issue`, `add_comment`) | **Approval Request by default**; versioned/undoable where the service permits; batched approvals |
| 3 | irreversible/external effect (`delete_repo`, `send_payment`, `publish_release`) | **Always** an Approval Request; no standing `always` grant offered in this release |

There is no class 0 connector operation: a network call is at least an external read (install check #9).

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 New tables — all projections (forward-only migrations, `0025_*`+)

| Table | Purpose |
|---|---|
| `connectors` | installed connectors: id, version, publisher, manifest_hash, status |
| `connector_grants` | the isolation primitive: connector_id, department_id, scopes, granted_at/by, revoked_at |
| `connector_credentials` | connector_id, department_id, credential_kind, **keychain_ref**, token_expires_at, refresh_state — **never the secret** |
| `connector_egress` | compiled allowlist projection: connector_id, host, effect_class |
| `connector_calls` | audit projection: id, connector, department, operation, effect_class, host, verdict, latency_ms, at — **secrets stripped** |

Additive columns only elsewhere; no existing column's meaning changes. A Firm with no connector grants
behaves exactly as it did before M16 — a null grant is a fully supported state, not a migration artifact.

### 11.2 Domain events

Every event carries `actor`, `connector_id`, and (where applicable) `department_id`, and lands on the hash
chain (ADR-0002):

`ConnectorInstalled` · `ConnectorGranted` · `ConnectorRevoked` · `ConnectorAuthorizationStarted` ·
`ConnectorAuthorized` · `ConnectorTokenRefreshed` · `ConnectorTokenRefreshFailed` · `ConnectorCallDispatched`
· `ConnectorCallSucceeded` · `ConnectorCallDenied` · `ConnectorEgressBlocked` · `ConnectorApprovalRequested` ·
`ConnectorApprovalResolved` · `ConnectorUnreachable` · `ConnectorRecovered` · `ConnectorUninstalled`.

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── connectors/
    └── github/
        ├── connector.md        identity, version, publisher, egress hosts — human-readable
        ├── grants.md           which departments hold it, which scopes, when granted — plain language
        └── calls/              per-day call log, secrets stripped, for audit
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every connector, every department that could reach it, and every scope granted — but never a credential,
which lives only in the keychain and is gone when the keychain is.

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `install_connector(manifest, signature)` | Installed | runs §5.4 checks; hard refusal names the failing rule |
| `grant_connector(connector, department, scopes)` | Granted | a Principal **Decision**; refused if any scope ∈ department `forbidden` |
| `begin_oauth(connector, department)` → `AuthorizationUrl` | Authorizing | kernel generates state + PKCE verifier |
| `complete_oauth(state, code)` | Operating | validates state + PKCE; stores token in keychain |
| `invoke_connector(agent, connector, operation, params)` → `Result` | — | the §9 path; returns `fenced`/`needs_approval`/`ok` |
| `revoke_connector_grant(connector, department)` | Revoked | zeroizes credential before commit |
| `uninstall_connector(connector)` | Uninstalled | revokes all grants, removes all credentials |

### 12.2 Queries

| Query | Returns |
|---|---|
| `list_connectors()` | installed connectors + status |
| `list_grants(department)` | what this department can reach |
| `connector_status(connector)` | lifecycle state |
| `connector_egress_report(connector)` | declared hosts and their effect classes |

### 12.3 API rules

1. **No API returns a credential.** Not the raw secret, not a decrypted token — only a `KeychainRef` where a
   reference is structurally required, and never over IPC to the renderer.
2. **Every effectful call goes through `invoke_connector`, which goes through the Broker.** There is no
   side-door.
3. **`grant`, `revoke`, `install`, `uninstall` are Decisions** — logged, with the plain-language capability
   list shown before the act (marketplace trust rule).
4. **The OAuth callback is validated** (state + PKCE) before any token is accepted; a mismatch is discarded
   with no partial credential retained.

---

## 13. Sequence diagrams

### 13.1 Install → grant → authorize

```
Principal        Kernel(connectors)     Keychain        External(OAuth)
   │  install(manifest,sig) │                │                │
   ├───────────────────────►│ §5.4 checks    │                │
   │                        │ store manifest │                │
   │  grant(dept, scopes)   │                │                │
   ├───────────────────────►│ check forbidden│                │
   │                        │ write grant    │                │
   │  begin_oauth           │                │                │
   ├───────────────────────►│ state+PKCE     │                │
   │◄─── authorize URL ─────┤                │                │
   │  (Principal authorizes in browser) ─────┼───────────────►│
   │  complete_oauth(state,code)             │                │
   ├───────────────────────►│ validate state │                │
   │                        │ exchange code ─┼───────────────►│
   │                        │◄── token ───────────────────────┤
   │                        │ store token ──►│ (keychain only)│
   │◄──── Operating ────────┤                │                │
```

### 13.2 A granted read call (the happy path)

```
Agent(deptA)   ConnectorHost   Registrar   Broker   Custody   Egress   Service
  │ invoke list_issues │           │         │        │         │        │
  ├───────────────────►│ resolve dept ──────►│        │         │        │
  │                    │◄── deptA ───────────┤        │         │        │
  │                    │ grant(github,deptA)? exists  │         │        │
  │                    │ build URL from template + api.github.com        │
  │                    ├── authorize_action(effect=1) ►│        │        │
  │                    │◄──────── Allow ──────────────┤         │        │
  │                    ├── inject bearer ──────────────────────►│        │
  │                    ├── host in allow? ─────────────────────►│ yes    │
  │                    │                                        ├───────►│
  │                    │◄──────────────── response ─────────────┤◄───────┤
  │◄─── result ────────┤ audit ConnectorCallSucceeded (stripped)│        │
```

### 13.3 The isolation refusal (the exit criterion)

```
Agent(deptB)   ConnectorHost   Registrar
  │ invoke create_issue│           │
  ├───────────────────►│ resolve dept ──────►│
  │                    │◄── deptB ───────────┤
  │                    │ grant(github, deptB)?  →  NONE
  │◄── Denied{no_grant}┤ audit ConnectorCallDenied
  │  (nothing built, nothing injected, nothing dispatched — refusal is structural, before the Broker)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | Agent in wrong department invokes | `Denied{no_grant}` at §9 step 2, before the Broker; audited (exit criterion) |
| F2 | Connector attempts an undeclared host | `EgressFilter` blocks; `ConnectorEgressBlocked` logged; call fails cleanly |
| F3 | Injected document induces a connector call | The reader Turn holds no class ≥1 tool (security model §7.3); the call is never reachable from untrusted context |
| F4 | Token expired mid-Mission | Custody refreshes serially; on success the call proceeds; on failure → `Unreachable`, not a raw error |
| F5 | Service down | Operation fails cleanly; connector → `Unreachable`; the Firm continues; no data loss (G7) |
| F6 | Grant revoked while a call is in flight | The in-flight call completes or fails on its own; no new call is authorized; credential zeroized |
| F7 | Manifest declares a host it then tries to bypass via a redirect to another host | Redirects to hosts outside `[egress].allow` are not followed; blocked and logged |
| F8 | Class-3 operation invoked | Always an Approval Request; no standing grant; the send waits on the Principal |

---

## 15. Performance and offline

- **Offline is the default-safe state.** A connector call that cannot reach its host fails within the
  configured timeout and marks the connector `Unreachable`. Local work is unaffected — this is the Layer-6
  replaceability test (`02-layer-model.md` §9): disconnect everything and local work continues.
- **No connector call blocks the scheduler.** Connector invocations are effectful tool calls dispatched
  within a Work Order; the Mission scheduler's determinism (M15 §17) is unaffected because a connector call is
  just another tool with an effect class.
- **Refresh is off the hot path.** Token refresh is scheduled ahead of expiry; a call that races an expiry
  waits on a single serialized refresh, never a stampede.

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| M3 — Permission Broker, `EgressFilter`, `KeychainManager`, redaction | the choke point, host enforcement, credential storage, secret stripping |
| M9 — plugin signing chain & Wasm host | connector signatures; optional response transforms |
| M13 — departments & Registrar | resolving the calling agent's department; `[capabilities].forbidden` |
| M2 — event log | audited connector events on the hash chain |

### 16.2 Assumptions

1. The department substrate (M13) is installed and the Registrar can resolve an agent → department. If a Firm
   runs "as one implicit department" (M11), that single department is the grant target; the model is
   unchanged.
2. `KeychainManager` is available on the platform; the M3 passphrase-wrap fallback covers platforms without a
   system keychain.
3. Connectors in M16 are HTTP(S) services. Non-HTTP transports are out of scope for the framework and would
   need their own ADR.

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| CR-1 | A legitimately-allowed host is used to exfiltrate | egress payload inspection (§7.5); untrusted-context Turns hold no effectful tools |
| CR-2 | Credential leaks into a log or event | redaction on every write path; DB holds only `KeychainRef`; CI scan asserts no token pattern in events/logs |
| CR-3 | Over-broad `*` scope granted casually | plain-language expansion at grant; a logged Decision; `admin`/class-3 always asks per call regardless |
| CR-4 | Framework accretes connector-specific logic | CI grep for connector ids in the kernel crate fails the build (G8) |
| CR-5 | Migration breaks a pre-M16 Firm | forward-only, additive; null grant = pre-M16 behaviour; each migration independently deployable |

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | A connector installs from a valid manifest + signature; any validation failure is a hard refusal naming the rule, with no override | install-check test over a corpus of malformed manifests |
| AC2 | **A connector granted to department A cannot be reached by an agent in department B** — refusal is structural, before the Broker and before any network step | the exit-criterion isolation test (§13.3), asserting `Denied{no_grant}` and zero egress |
| AC3 | Credentials never appear in a prompt, log, event, stored parameter, or the connector's address space | redaction scan over a fixture call; assert zero token patterns |
| AC4 | A connector attempting egress to an undeclared host is blocked and logged | network-stub test asserting denial for a host absent from `[egress].allow` |
| AC5 | OAuth completes via the kernel; the token is stored in the keychain, injected at egress, and refreshed on expiry; the connector never receives it | OAuth flow test with a stub IdP + a forced-expiry refresh test |
| AC6 | Class-1 reads require host allowlist (+approval for a new host); class-2 writes raise approval by default; class-3 always asks | property test over an operation registry |
| AC7 | A connector whose host is unreachable fails cleanly, marks `Unreachable`, and the Firm keeps working with no data loss | offline-degradation test (Layer-6 replaceability) |
| AC8 | Every install/grant/revoke/authorize/call/deny is an audited event on the hash chain | `audit.verify` over a connector-lifecycle fixture |
| AC9 | A scope in a department's `[capabilities].forbidden` cannot be granted, even after later approvals | grant-refusal test against a forbidden scope |
| AC10 | Uninstalling a connector revokes all grants, removes all credentials, and leaves the Firm working | uninstall test asserting keychain entries gone and local work intact |
| AC11 | The framework crate contains no connector-specific identifier | CI grep check, build fails on a hit |
| AC12 | `services/connectors` has no dependency edge to `services/orchestrator` or `services/mission` | dependency-direction check in CI |

---

## Appendix A — Glossary additions

- **Connector** — a signed Layer-6 artifact describing how to reach one external service: its manifest, its
  declared hosts, its operations, and its auth configuration. Holds no credential.
- **Connector Framework** — the Layer-1 kernel machinery (`sidra-connectors`) that installs, grants,
  authorizes, and mediates connectors. Holds credentials in the keychain, enforces egress, and routes every
  call through the Permission Broker.
- **Grant** — a record binding a connector to exactly one department with a scope set and a credential
  reference. The isolation primitive.
- **Custody** — the kernel's holding of a credential in the keychain and injection of it at the egress
  boundary, such that the connector never possesses it.
- **Declared host** — a host listed in a connector's `[egress].allow`. The only hosts the connector may reach.

## Appendix B — Repository placement

```
services/
└── connectors/                 NEW — crate sidra-connectors
    ├── manifest
    ├── registry
    ├── oauth
    ├── custody
    ├── egress
    ├── host
    └── conformance

agents/
└── connectors/                 NEW — connector-manifest schema + fixtures only (the connector suite is M17)

services/store/migrations/      EXTENDED — 0025_connectors.sql … 0029_connector_calls.sql (forward-only)

infrastructure/testing/
└── connectors/                 NEW — isolation proof, egress denial, custody redaction, OAuth stub, offline
```

Dependency direction (ADR-0011): `packages/domain ← services/connectors ← apps/*`. `services/connectors`
depends on `services/security`, `services/store`, `services/plugins`, `services/departments`; it does **not**
depend on `services/orchestrator` or `services/mission`.

## Appendix C — Implementation position

M16 is the first milestone of 2.5 "Field". It depends on M3 (broker/egress/keychain), M9 (plugin host/trust
chain), and M13 (departments/Registrar). Building it earlier is the mistake ADR-0035 exists to prevent: a
connector granted before departments exist establishes a firm-wide permission, and a permission that already
works is the change nobody makes later (`MILESTONE_REGISTRY.md` §5, dependency 2).

**Exit criterion.** A connector is installed, granted to exactly one department, and no other department can
reach it — proven by test, not by configuration (AC2).
