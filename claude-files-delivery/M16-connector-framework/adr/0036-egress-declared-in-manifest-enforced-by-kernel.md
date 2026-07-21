# ADR-0036 — A connector's egress is declared in its manifest and enforced by the kernel

**Status:** Proposed · **Date:** M16 / Connector Framework · **Relates to:** ADR-0009, security model §3 (T2), §7.5, §10, §11
**File at:** `docs-v2/adr/0036-egress-declared-in-manifest-enforced-by-kernel.md`

## Context

The most dangerous thing a connector does is send bytes to a host of its choosing. Threat T2 is exfiltration
through a tool: an agent (or a compromised connector) induced to send Vault data to an attacker-controlled
URL. The security model already answers this for the Firm's own tools with an egress allowlist (§3 T2, §7.5,
§11) and commits in §10 that "the only outbound network traffic in normal operation is to model provider
endpoints the Principal has explicitly configured" — verified by a CI test asserting the allowlist contains
nothing else.

A connector is, by definition, new outbound traffic to a new host. It cannot be on the Firm's fixed
allowlist, because the whole point is to reach GitHub or a calendar. So the question is: **who decides which
hosts a connector may reach, and where is that decision enforced?** If the connector decides at runtime, the
allowlist is whatever a compromised connector wants it to be, and T2's mitigation evaporates for exactly the
component most able to exploit it.

## Options

1. **The connector reaches any host it likes.** No declaration. Maximum exfiltration surface; T2 unmitigated
   for connectors. Rejected on sight.
2. **The connector declares its hosts, enforced by the connector.** A self-policing allowlist. "Enforcement
   by a participant is not enforcement" — the same argument that makes the Permission Broker and the Exchange
   kernel components. A compromised connector ignores its own declaration.
3. **The connector declares its hosts in its signed manifest; the kernel compiles them into the existing
   `EgressFilter` and enforces them.** The connector cannot reach an undeclared host because the kernel, not
   the connector, holds the outbound socket, and the kernel constructs the request URL from the operation's
   path template joined to a *declared* host — the connector never supplies scheme or host.
4. **The Principal maintains a per-connector allowlist by hand.** Correct authority, wrong ergonomics: the
   Principal cannot know that the GitHub connector needs `api.github.com` and `github.com` but not
   `evil.example`. The connector author knows; the manifest is where that knowledge belongs, made trustworthy
   by the signature.

## Decision

Option 3. **Every connector declares its reachable hosts in `[egress].allow` in its signed manifest. The
kernel compiles that list into a per-connector, per-department entry in the existing `EgressFilter` and
enforces it on every outbound request. The kernel builds each request URL from the operation's declared host
and path template; the connector supplies only path and query parameters, which are subject to the egress
payload inspection of security model §7.5.**

Enforced facts, checked at install (§5.4 of the architecture):

- `[egress].allow` is non-empty and contains no entry broader than a registrable domain — no bare TLD, no `*`.
- Every operation's host is a member of `[egress].allow`.
- If `auth.kind = oauth2`, the `authorize` and `token` hosts are also members — the OAuth endpoints obey the
  same rule as every other host.
- Redirects to a host outside `[egress].allow` are not followed.

## Consequences

**Accepted:** a connector author must enumerate every host the service uses, including auth and any CDN or
regional endpoint. A missing host is a clean, named failure at first call, not a silent success — which is the
correct failure mode, because the alternative is a connector that reaches hosts nobody reviewed.

**Accepted:** a service that generates hosts dynamically (per-tenant subdomains, signed-URL CDNs on rotating
hosts) needs its host pattern declared as a bounded domain suffix, and the framework must support a
registrable-domain suffix match without admitting a wildcard broad enough to defeat the purpose. The bound is
"registrable domain," not "arbitrary glob."

**Gained:** T2 is mitigated for connectors by the same mechanism that mitigates it for the Firm's own tools —
one `EgressFilter`, one place to audit, one CI test extended to assert per-connector denial (AC4). No new
egress path exists.

**Gained:** the exfiltration surface is reviewable before install. "What can this connector reach?" is
answered by reading `[egress].allow`, and the signature makes the answer trustworthy.

**Gained:** SSRF-by-connector is structurally prevented. The connector never supplies a base URL; it cannot
point a declared operation at an undeclared host, because scheme and host come from the manifest, not the
call.

**Reversal cost:** low. Egress declaration is additive over the existing filter; removing it would mean
trusting connectors with the socket, which is the option this ADR rejected.
