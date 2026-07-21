# ADR-0034 — Connector credentials are held by the kernel, never by the connector

**Status:** Accepted · **Date:** M16 / Connector Framework · **Relates to:** ADR-0006, ADR-0009, security model §3 (T3), §8, §9
**File at:** `docs-v2/adr/0034-connector-credentials-held-by-the-kernel.md`

## Context

A connector talks to an external service, and that service demands a credential — an OAuth token or an API
key. Something must hold that credential and attach it to each outbound request. The question is *what*, and
the answer sets the blast radius of a compromised connector.

The security model already names key theft as threat T3 and commits, in §3 and §9, that keys "never enter a
prompt, never enter a log, never enter the renderer." A connector is untrusted by the same reasoning that
makes a plugin untrusted (M3 §2: "assume compromised… any plugin"). If a connector holds its own credential,
then a compromised connector — via a supply-chain compromise, a malicious publisher, or a bug — hands the
credential to whatever compromised it. The credential is then exactly as exposed as the least trustworthy
connector installed.

## Options

1. **The connector holds its credential.** Simplest to implement; the connector reads a secret at startup and
   uses it. Makes every connector a credential-custodian and every connector compromise a credential leak.
   Contradicts T3 directly — the secret now lives in a semi-trusted component's address space.
2. **The connector holds an encrypted credential and asks the kernel to decrypt per call.** The secret still
   materializes in the connector's address space at use time. The encryption is theatre: the plaintext is one
   `decrypt` call away and lives where the untrusted code runs.
3. **The kernel holds the credential in the keychain and injects it at the egress boundary.** The connector
   builds a request with a placeholder; the kernel, at the one point where bytes leave the machine, reads the
   secret from the keychain, attaches it, sends, and zeroizes. The connector never possesses the secret in any
   form.
4. **A separate credential broker process.** Strong isolation; a second process, a second IPC surface, and a
   second thing to audit — cost without a benefit over option 3 on a single-user local machine where the
   kernel is already the trust root.

## Decision

Option 3. **The kernel holds every connector credential in the OS keychain, stores only a `KeychainRef` in the
database, and injects the secret at the egress boundary — the single point where a request leaves the machine.
The connector never receives the credential.**

Mechanically:

- Storage: `KeychainManager` under a service/account derived from `(connector_id, department_id)`. The DB row
  in `connector_credentials` holds `keychain_ref`, `token_expires_at`, and a refresh state — never the secret.
- Injection: the connector host hands custody a request carrying a placeholder. Custody reads the secret,
  attaches it (bearer or key header per `auth.kind`), sends, and zeroizes the plaintext. The secret exists in
  process memory only for the duration of the send.
- Revocation: `revoke` and `uninstall` delete the keychain entry and null the reference *before* the state
  transition commits. A credential never outlives its grant.

## Consequences

**Accepted:** the connector cannot make its own network call. It can only describe a request and hand it to
the kernel to dispatch. This is a deliberate loss of connector autonomy — a connector is a description, not a
client — and it is the entire point.

**Accepted:** the framework, not the connector author, owns the injection code and the header formats per
auth kind. A new auth scheme is a framework change, not a connector change. Small, central, reviewable.

**Gained:** a compromised connector leaks no credential, because it never holds one. The blast radius of the
worst connector is bounded by what its *granted scopes* permit through the kernel, not by what its address
space contains. T3 extends to connectors for free.

**Gained:** credentials are absent from every projection, log, event, and Markdown mirror, because the DB
never had them to leak. The redaction filter (M3 §9) has less to catch, not more.

**Gained:** revocation is real. Deleting the keychain entry ends the connector's reach immediately; there is
no cached copy in a connector to keep working.

**Reversal cost:** low now, high later. Once connectors are authored against a placeholder-injection contract,
moving custody into the connector would require re-authoring every connector and re-auditing the trust model.
Decide now, before the M17 suite is written against this contract.
