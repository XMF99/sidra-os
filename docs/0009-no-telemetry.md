# ADR-0009 — No telemetry, ever

**Status:** Accepted · **Date:** design phase · **Supersedes:** —

## Context

Every product of this complexity wants usage data: which features are used, where users abandon flows, which
errors occur in the wild. The standard answer is anonymous, aggregate, opt-in telemetry. Sidra OS holds the
Principal's working life in an encrypted local Vault, and Principle 7 promises data sovereignty.

## Options

1. **Standard opt-in telemetry.** Industry norm, genuinely useful, and it makes a network connection the
   Principal did not ask for from a process that reads everything they do.
2. **Local-only metrics with manual export.** The Principal can see their own numbers and choose to send a
   diagnostics bundle.
3. **No telemetry of any kind.**

## Decision

Option 3, with option 2's local metrics retained purely for the Principal's own use. The application makes
network connections only to: configured model providers, explicitly allowlisted hosts, and the update endpoint
(which receives a version string and nothing else). Diagnostics bundles are generated on request, redacted by
default, previewed in full before they leave, and transmitted by the Principal — never by the app.

## Consequences

**Accepted:** we are blind to aggregate usage. We will not know which of the 48 components are unused, which
keyboard shortcuts are undiscovered, or how often a given error fires in the field. This costs real product
quality and we are paying it knowingly.

**Accepted:** we must substitute deliberate qualitative work — dogfooding from M6, structured interviews, and
the diagnostics bundles Principals choose to send when something breaks. This is slower and higher-effort than
a dashboard.

**Accepted:** we cannot A/B test. Design decisions are argued from principle and validated with users
directly, which is how the ten principles came to exist.

**Gained:** a claim we can make without qualification, and that a Principal can verify themselves with a
packet capture — which the Privacy settings section invites them to do, and which the network report shows.
The verifiability is the point. "Anonymous and aggregate" requires trust; "there is no telemetry setting
because there is no telemetry" requires none.

**Note:** this does not change in 3.0. A hosted deployment necessarily processes data to function, and that
gets its own documented threat model — but it does not become a licence to collect behavioural analytics.
