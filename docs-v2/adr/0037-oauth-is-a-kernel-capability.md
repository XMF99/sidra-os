# ADR-0037 — OAuth authorization is a kernel capability, not a connector responsibility

**Status:** Accepted · **Date:** M16 / Connector Framework · **Relates to:** ADR-0034, ADR-0036, security model §3 (T3), §8
**File at:** `docs-v2/adr/0037-oauth-is-a-kernel-capability.md`

## Context

Most services worth connecting to authenticate with OAuth 2.0 authorization-code flow. That flow has parts
that touch the secret — the code-for-token exchange, the refresh — and parts that do not — building the
authorize URL, holding the `state` and PKCE verifier across the round trip. ADR-0034 already decided the
kernel holds the credential and the connector never receives it. This ADR decides the corollary that ADR-0034
forces: **if the connector never receives the token, the connector cannot run the exchange that produces it.**
Someone must run the flow, and it cannot be the component forbidden from seeing the result.

## Options

1. **The connector runs the whole OAuth flow and stores the token.** Contradicts ADR-0034 — the token
   materializes in the connector's address space at exchange time. Rejected as a direct consequence of the
   custody decision.
2. **The connector runs the flow but hands the token to the kernel to store.** The token still passes through
   the connector on the way to the keychain. A compromised connector keeps a copy. The custody boundary is
   breached for exactly the moment that matters.
3. **The kernel runs the flow end to end.** The connector's manifest declares the OAuth configuration
   (authorize endpoint, token endpoint, scopes, PKCE); the kernel generates `state` and the PKCE verifier,
   builds the authorize URL, validates the callback, performs the code-for-token exchange against the declared
   token host (subject to egress, ADR-0036), stores the token in the keychain (ADR-0034), and schedules
   refresh. The connector participates in no step that touches the secret.
4. **Defer OAuth; ship API-key connectors only in M16.** Smaller, but it leaves the framework unable to reach
   the services the Firm most needs (source control, calendar, mail all use OAuth), and it defers the hardest
   security decision past the point where the contract connectors are authored against is fixed — the worst
   time to change it.

## Decision

Option 3. **OAuth is a kernel capability. The connector declares configuration; the kernel runs the flow and
holds the result.** Specifically:

- The manifest's `[auth]` block declares `kind = "oauth2"`, `authorize`, `token`, `scopes`, and `pkce`. It
  declares **no** client secret, token, or key — install check #7 rejects any credential material in the
  manifest.
- The kernel generates `state` and, when `pkce = true`, the code verifier/challenge. `begin_oauth` returns an
  authorize URL; the Principal authorizes in a browser.
- `complete_oauth(state, code)` validates `state` and the PKCE verifier before accepting anything; a mismatch
  is discarded with no partial credential retained. The kernel exchanges the code against the declared `token`
  host (which must be in `[egress].allow`), stores the token via `KeychainManager`, and transitions the
  connector to `Operating`.
- Refresh is a kernel action, serialized per grant, scheduled ahead of `token_expires_at`. A refresh failure
  transitions the connector to `Unreachable` rather than surfacing a raw auth error to an agent.

## Consequences

**Accepted:** the framework carries an OAuth 2.0 authorization-code + PKCE implementation and the refresh
scheduler — real, security-sensitive code, owned centrally. This is the right place for it: one audited
implementation rather than one per connector, each a chance to leak.

**Accepted:** client-secret provisioning for confidential clients is a kernel/Principal concern handled
outside the manifest (the manifest is signed and distributable; a client secret is neither). Public clients
use PKCE with no secret, which is the preferred path and the default.

**Accepted:** a service with a non-standard OAuth dialect may need framework-level accommodation rather than
connector-level. Central cost, but it keeps the secret-touching code in one reviewable place.

**Gained:** ADR-0034's custody guarantee holds through the one flow most likely to break it. The token is born
in the kernel and stored in the keychain without ever transiting the connector.

**Gained:** `state` and PKCE validation live in the trusted component, so CSRF and code-interception defenses
are not a per-connector-author responsibility that some author will get wrong.

**Gained:** refresh degrades to `Unreachable`, a first-class state (architecture §3), so an expired token is a
clean connectivity failure the Firm survives, not a silent authorization error mid-Mission.

**Reversal cost:** low while M16 is in flight; high once the M17 connector suite is authored against the
declare-config-only contract. Decide now, with ADR-0034, before any connector is written.
