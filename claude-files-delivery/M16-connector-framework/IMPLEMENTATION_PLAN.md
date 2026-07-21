# Connector Framework — Implementation Plan

**Milestone M16 · crate `sidra-connectors` · for AntiGravity**

| | |
|---|---|
| Architecture | `CONNECTOR_FRAMEWORK_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0034 (custody) · 0035 (per-department grant) · 0036 (egress) · 0037 (kernel OAuth) |
| Crate | `sidra-connectors` at `services/connectors/` |
| Depends on | `sidra-security`, `sidra-store`, `sidra-plugins`, `sidra-departments`, `sidra-domain` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Connector domain model & manifest types | the vocabulary: ids, manifest, operation, grant, auth config |
| E2 | Connector registry & install validation | the ten install checks, signature verification, the registry |
| E3 | Per-department grant & Broker integration | ADR-0035: the isolation primitive and its enforcement |
| E4 | Credential custody | ADR-0034: keychain-backed tokens, references, injection, zeroization |
| E5 | Kernel OAuth | ADR-0037: PKCE authorize/callback/refresh |
| E6 | Egress declaration & enforcement | ADR-0036: compile allowlist into `EgressFilter`, inspection |
| E7 | Connector host & invocation path | grant→build→Broker→custody→egress→transform→audit |
| E8 | Persistence, events & Vault mirror | migrations 0025+, event variants, Markdown mirror |
| E9 | Lifecycle & offline degradation | states, unreachable handling, revoke/uninstall cleanup |
| E10 | Conformance suite & isolation proof | the exit-criterion test and the acceptance harness |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──┐
        │          ├──► E7 ──► E9 ──► E10
        └──► E4 ──► E5 ──► E6 ──┘
                    E8 runs alongside E7 (schema before the host writes to it)
```

E1 first (everything types against it). E2 next (nothing installs without validation). E3 and E4 can proceed
in parallel once E2 lands. E5 needs E4 (a token needs somewhere to go). E6 needs E2 (hosts come from the
validated manifest). E7 assembles E3+E4+E6. E8 lands the schema just ahead of E7's writes. E9 then E10 close
the milestone; **E10 is the exit criterion and must be the last thing green.**

---

## E1 — Connector domain model & manifest types

### Purpose
The vocabulary every other epic types against: ids, the manifest, operations, the grant, the auth config.

### Scope
In: value objects and the manifest struct in `packages/domain` (or `services/connectors/domain` per the
crate's dependency rules). Out: parsing, validation, persistence — those are E2/E8.

### Dependencies
`sidra-domain` (`EffectClass`, `Capability`, `DepartmentId` if present; introduce `DepartmentId` here if the
department substrate has not exported it yet — confirm against `sidra-departments` before duplicating).

### Public APIs
Constructors for each type that reject invalid construction; no mutating methods on the manifest.

### Acceptance criteria
Every type rejects invalid construction; `Scope` parses only `integration:<id>:<action>`; `EffectClass`
constrained to 1–3 for operations; property tests over each.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-connectors` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/connectors/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-connectors → sidra-orchestrator` or `→ sidra-mission` (AC12) |
| **T1.2** | Value objects: `ConnectorId`, `ConnectorVersion`, `OperationName`, `Scope`, `KeychainRef` | S | T1.1 | `domain/values.rs` | `Scope` rejects anything not `integration:<id>:<action>`; `KeychainRef` is opaque; property tests |
| **T1.3** | `AuthConfig` enum: `None` / `ApiKey` / `OAuth2{authorize,token,scopes,pkce}` | S | T1.2 | `domain/auth.rs` | `OAuth2` requires all endpoints; no field can hold a secret (type carries no secret field) |
| **T1.4** | `Operation`: name, capability, effect (1–3), method, path template | S | T1.2 | `domain/operation.rs` | `effect=0` rejected; capability must match connector id; class per action mapping enforced |
| **T1.5** | `ConnectorManifest` aggregate: identity, auth, egress, operations, signature | M | T1.3, T1.4 | `domain/manifest.rs` | Immutable; exposes no mutator; all sub-invariants hold at construction |
| **T1.6** | `ConnectorGrant`: connector, **required** `DepartmentId`, scopes, optional `KeychainRef`, timestamps, actor | S | T1.2 | `domain/grant.rs` | Cannot construct without a `DepartmentId` — no firm variant exists (ADR-0035); unit tests |

---

## E2 — Connector registry & install validation

### Purpose
Turn a `connector.toml` + signature into an installed, trusted connector — or a named refusal.

### Scope
In: TOML parsing, the ten install checks (§5.4), signature verification via the plugin trust chain, the
in-memory + persisted registry of installed connectors. Out: grants (E3), credentials (E4).

### Dependencies
E1; `sidra-plugins` (signature verification, ADR-0006); `sidra-store` (registry persistence — schema from E8).

### Public APIs
`install_connector(manifest_toml, signature) -> Result<ConnectorId, InstallError>`; `list_connectors()`;
`connector_status(id)`.

### Acceptance criteria
Every §5.4 check enforced; each failure names its rule; no override path exists.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | `connector.toml` parser → `ConnectorManifest` | M | E1 | `manifest/parse.rs` | Malformed TOML rejected with position; round-trips a valid fixture |
| **T2.2** | Install checks 1–6 (schema, signature, namespace, effect mapping, host membership, allowlist shape) | M | T2.1, `sidra-plugins` | `manifest/validate.rs` | Each check has a failing fixture asserting the named rule; check 6 rejects bare TLD and `*` |
| **T2.3** | Install checks 7–10 (no credential material, OAuth endpoints in egress, no class-0 network op, Wasm fuel/ambient) | M | T2.2 | `manifest/validate.rs` | Check 7 rejects a manifest carrying a token pattern; check 8 rejects an OAuth host absent from egress |
| **T2.4** | Signature verification via the plugin trust chain; developer-mode bypass gated as in v1 | S | T2.2 | `manifest/signature.rs` | Unsigned manifest refused unless dev mode explicitly enabled; tampered manifest fails |
| **T2.5** | Connector registry: install, list, status; persist to `connectors` table | M | T2.3, E8/T8.1 | `registry/mod.rs` | Install is idempotent on identical manifest hash; status reflects lifecycle |

---

## E3 — Per-department grant & Broker integration (ADR-0035)

### Purpose
The isolation primitive and its enforcement — the heart of the milestone.

### Scope
In: grant creation/revocation, the department-match check, integration with `sidra-departments` (resolve
agent→department) and `sidra-security` (the Broker call sits downstream of this check). Out: the network path
(E7).

### Dependencies
E1, E2; `sidra-departments` (Registrar); `sidra-security` (`PermissionBroker`).

### Public APIs
`grant_connector(connector, department, scopes)`; `revoke_connector_grant(connector, department)`;
`resolve_grant(agent, connector) -> Result<ConnectorGrant, DenyReason>`.

### Acceptance criteria
An agent whose department holds no grant is denied `no_grant` structurally, before the Broker; a forbidden
scope cannot be granted.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Grant store: create, list-by-department, revoke; persist to `connector_grants` | M | E2, E8/T8.2 | `registry/grants.rs` | Grant requires a `DepartmentId`; revoke sets `revoked_at`; history immutable |
| **T3.2** | Forbidden-scope check at grant time (ADR-0013 self-denial) | S | T3.1, `sidra-departments` | `registry/grants.rs` | A scope in the department's `forbidden` set is refused; refusal survives a later approval (AC9) |
| **T3.3** | Scope-subset check: grant scopes ⊆ manifest capabilities ∩ department required∪optional | S | T3.1 | `registry/grants.rs` | Over-scoped grant refused with the offending scope named |
| **T3.4** | Agent→department resolution via Registrar; `resolve_grant` | M | T3.1, `sidra-departments` | `host/resolve.rs` | Agent in a department with no matching grant → `Deny{no_grant}`; cached per Engagement |
| **T3.5** | Broker wiring: after `resolve_grant`, call `authorize_action` with the operation's effect class | M | T3.4, `sidra-security` | `host/authorize.rs` | Order fixed: grant check → scope check → Broker; a passing grant still obeys effect-class policy |

---

## E4 — Credential custody (ADR-0034)

### Purpose
Hold credentials in the keychain, store only references, inject at the egress boundary, zeroize on revoke.

### Scope
In: keychain-backed token store, `connector_credentials` bookkeeping, injection hook, zeroization. Out: the
OAuth flow that produces a token (E5); the send itself (E6/E7).

### Dependencies
E1; `sidra-security` (`KeychainManager`, redaction).

### Public APIs
`store_credential(connector, department, secret, expiry) -> KeychainRef`; `inject(request, ref)`;
`zeroize(connector, department)`.

### Acceptance criteria
No secret in DB/log/event/prompt; injection happens only at the boundary; revoke removes the keychain entry.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Keychain-backed store keyed on `(connector_id, department_id)`; write `KeychainRef` + expiry to DB | M | E1, E8/T8.3 | `custody/store.rs` | DB row holds a reference, never the secret; keychain holds the secret |
| **T4.2** | Injection: attach bearer/api-key header at the boundary from a placeholder request; zeroize plaintext after | M | T4.1 | `custody/inject.rs` | The request handed in carries a placeholder; secret exists only for the send; zeroized after |
| **T4.3** | Zeroization on revoke/uninstall before the state transition commits | S | T4.1 | `custody/store.rs` | No state exists where a token outlives its grant (invariant §3.3.2) |
| **T4.4** | Redaction assertion: a fixture call leaves no token in events/logs/params | M | T4.2, `sidra-security` | `custody/tests/redaction.rs` | Scan asserts zero token patterns anywhere written (AC3) |

---

## E5 — Kernel OAuth (ADR-0037)

### Purpose
Run the authorization-code + PKCE flow in the kernel; the connector touches no secret.

### Scope
In: `state`/PKCE generation, authorize-URL build, callback validation, code exchange, refresh scheduling. Out:
storage (E4), egress enforcement of the token host (E6).

### Dependencies
E4 (somewhere to store the token); E6/T6.1 (the token host is subject to egress).

### Public APIs
`begin_oauth(connector, department) -> AuthorizationUrl`; `complete_oauth(state, code) -> Result`.

### Acceptance criteria
State + PKCE validated before any token accepted; token stored in keychain; refresh on expiry; connector never
receives the token.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Generate `state` + PKCE verifier/challenge; build authorize URL from manifest config | M | E1, E3 | `oauth/begin.rs` | URL targets the declared `authorize` host; `state` unguessable; verifier retained server-side |
| **T5.2** | Callback validation: match `state`, verify PKCE; discard on mismatch with no retained credential | M | T5.1 | `oauth/callback.rs` | Mismatched `state` rejected; no partial credential kept |
| **T5.3** | Code-for-token exchange against the declared `token` host (via egress); store via E4 | M | T5.2, E4, E6/T6.1 | `oauth/exchange.rs` | Token stored in keychain; connector → `Operating`; connector code never sees the token |
| **T5.4** | Refresh scheduler: serialized per grant, ahead of expiry; failure → `Unreachable` | M | T5.3 | `oauth/refresh.rs` | Two concurrent calls trigger one refresh (AC5); a failed refresh degrades to `Unreachable`, not a raw error |

---

## E6 — Egress declaration & enforcement (ADR-0036)

### Purpose
A connector reaches only its declared hosts; the kernel builds the URL.

### Scope
In: compile `[egress].allow` per connector+department into `EgressFilter`; URL construction from operation
template + declared host; redirect containment; payload inspection reuse. Out: the actual dispatch (E7).

### Dependencies
E2 (validated hosts); `sidra-security` (`EgressFilter`, §7.5 inspection).

### Public APIs
`compile_egress(connector, department)`; `build_request(operation, params) -> Request` (host from manifest).

### Acceptance criteria
An undeclared host is blocked and logged; the connector supplies no scheme/host; redirects off-allowlist not
followed.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Compile `[egress].allow` into a per-connector+department `EgressFilter` entry; persist projection to `connector_egress` | M | E2, `sidra-security`, E8/T8.4 | `egress/compile.rs` | Filter denies any host absent from the manifest (AC4) |
| **T6.2** | Request builder: URL = declared host + operation path template + agent-supplied params only | M | E1, T6.1 | `egress/build.rs` | Connector cannot set scheme or host; params inspected per §7.5 |
| **T6.3** | Redirect containment: do not follow a redirect to a host outside `[egress].allow` | S | T6.2 | `egress/dispatch.rs` | Off-allowlist redirect blocked and logged (F7) |
| **T6.4** | Registrable-domain suffix matching (bounded; no `*` broader than a registrable domain) | M | T6.1 | `egress/match.rs` | Suffix match admits `api.github.com` under a declared `github.com`; rejects a bare TLD |

---

## E7 — Connector host & invocation path

### Purpose
Assemble E3+E4+E6 into the one entry point agents call, in fixed order, through the choke point.

### Scope
In: `invoke_connector`, the ordered pipeline (resolve grant → scope → build → Broker → inject → egress →
transform → audit), the optional Wasm response transform. Out: nothing new — this epic wires the others.

### Dependencies
E3, E4, E6; `sidra-plugins` (Wasm transform sandbox).

### Public APIs
`invoke_connector(agent, connector, operation, params) -> Result<Response, DenyReason>`.

### Acceptance criteria
The pipeline order is fixed and unskippable; a failure at any stage is a typed, audited outcome.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | The invocation pipeline: fixed-order stages with typed outcomes | L | E3, E4, E6 | `host/invoke.rs` | Stage order matches §9; each stage's failure is typed (`no_grant`/`fenced`/`needs_approval`/`egress_blocked`) |
| **T7.2** | Effect-class routing: class-1 read, class-2 approval-by-default, class-3 always-ask | M | T7.1, `sidra-security` | `host/effect.rs` | Policy matches security model §5 exactly (AC6); property test over an operation registry |
| **T7.3** | Optional Wasm response transform in the plugin sandbox (fuel-metered, no ambient authority) | M | T7.1, `sidra-plugins` | `host/transform.rs` | Transform runs sandboxed; a transform exceeding fuel is terminated; absence of a transform is the default |
| **T7.4** | Audit emission: `ConnectorCall*` events, secrets stripped, on the hash chain | S | T7.1, E8/T8.5 | `host/audit.rs` | Every call emits an event; `audit.verify` passes over a lifecycle fixture (AC8) |

---

## E8 — Persistence, events & Vault mirror

### Purpose
Additive, forward-only schema; event variants; the human-readable Markdown mirror.

### Scope
In: migrations `0025_*`–`0029_*`, the `ConnectorEvent` variants, the Vault mirror writer. Out: business logic.

### Dependencies
`sidra-store`; the mission migrations end at `0024`, so connector migrations start at `0025`.

### Acceptance criteria
Forward-only, idempotent, independently deployable; null grant = pre-M16 behaviour; mirror holds no secret.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T8.1** | `0025_connectors.sql` — installed connectors | S | — | `services/store/migrations/` | Forward-only; idempotent; independently deployable |
| **T8.2** | `0026_connector_grants.sql` — the isolation primitive | S | T8.1 | `migrations/` | `department_id` NOT NULL; no firm-wide row representable |
| **T8.3** | `0027_connector_credentials.sql` — `keychain_ref` + expiry, never the secret | S | T8.1 | `migrations/` | No column can hold a secret; only a reference |
| **T8.4** | `0028_connector_egress.sql` — compiled allowlist projection | S | T8.1 | `migrations/` | Projection rebuildable from manifests |
| **T8.5** | `0029_connector_calls.sql` — audit projection, secrets stripped | S | T8.1 | `migrations/` | Stores digest + bounded excerpt, no secret |
| **T8.6** | `ConnectorEvent` enum — all 16 variants with actor + connector_id (+ department_id) | M | E1 | `domain/events.rs` | Every kind in §11.2 present; serde round-trip; schema snapshot committed |
| **T8.7** | Vault Markdown mirror writer (on state transitions, not continuously) | M | T8.6 | `mirror/write.rs` | `connector.md`/`grants.md`/`calls/` written; no credential appears |

---

## E9 — Lifecycle & offline degradation

### Purpose
The state machine, unreachable handling, and clean revoke/uninstall.

### Scope
In: state transitions (§3.2), `Unreachable`/`Recovered`, revoke/uninstall cleanup. Out: the flows that drive
transitions (owned by E3/E5/E7).

### Dependencies
E3, E4, E5, E7.

### Acceptance criteria
Calls leave the machine only from `Operating`; offline fails cleanly with no data loss; uninstall removes all
credentials and leaves the Firm working.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T9.1** | Lifecycle state machine with the §3.2 transition table and guards | M | E3, E5 | `lifecycle/state.rs` | Illegal transitions rejected; a call from any non-`Operating` state fails with a typed reason |
| **T9.2** | `Unreachable`/`Recovered`: timeout → `Unreachable`; a later success → `Operating` | M | T9.1, E7 | `lifecycle/reachability.rs` | Service-down fails cleanly; Firm continues; no data loss (AC7) |
| **T9.3** | Revoke: zeroize credential, close grant, before commit | S | T9.1, E4 | `lifecycle/revoke.rs` | No token survives revoke; in-flight call completes or fails on its own (F6) |
| **T9.4** | Uninstall: revoke all grants, remove all credentials, leave the Firm working | M | T9.3 | `lifecycle/uninstall.rs` | Keychain entries gone; local work intact (AC10) |

---

## E10 — Conformance suite & isolation proof

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the isolation-proof harness (the exit criterion), the conformance suite M17 connectors will run against,
and the acceptance-criteria coverage. Out: any connector itself (M17).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC12 each covered by a named test; the isolation proof (AC2) asserts a cross-department call is refused
with zero egress.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T10.1** | **Isolation proof (the exit criterion):** connector granted to dept A; an agent in dept B is refused `no_grant` with zero request built and zero egress | M | E7, E9 | `infrastructure/testing/connectors/isolation.rs` | AC2 — refusal is structural, before the Broker; asserted, not configured |
| **T10.2** | Egress-denial test with a network stub | S | E6 | `.../egress_denial.rs` | AC4 — undeclared host blocked |
| **T10.3** | Custody-redaction test over a full call | S | E4 | `.../custody_redaction.rs` | AC3 — zero token patterns written |
| **T10.4** | OAuth flow + forced-expiry refresh test against a stub IdP | M | E5 | `.../oauth_flow.rs` | AC5 — token in keychain, refreshed, never seen by the connector |
| **T10.5** | Effect-class policy property test over an operation registry | S | E7 | `.../effect_policy.rs` | AC6 — class 1/2/3 policy holds |
| **T10.6** | Offline-degradation + uninstall-leaves-Firm-working test | M | E9 | `.../offline.rs` | AC7, AC10 |
| **T10.7** | Forbidden-scope grant-refusal test | S | E3 | `.../forbidden_scope.rs` | AC9 |
| **T10.8** | CI checks: no connector id in the framework crate; no edge to orchestrator/mission | S | E1 | `infrastructure/ci/` | AC11, AC12 — build fails on a hit |
| **T10.9** | The reusable conformance suite M17 connectors must pass | M | T10.1–T10.6 | `services/connectors/conformance/` | A connector passing the suite satisfies AC1–AC10 by construction |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | connector domain types |
| E2 | install validation + registry |
| E3 | per-department grant + enforcement (ADR-0035) |
| E4 | credential custody (ADR-0034) |
| E5 | kernel OAuth (ADR-0037) |
| E6 | egress declaration + enforcement (ADR-0036) |
| E7 | the invocation pipeline |
| E8 | migrations 0025–0029, events, Vault mirror |
| E9 | lifecycle + offline |
| E10 | conformance suite + isolation proof (exit criterion) |
