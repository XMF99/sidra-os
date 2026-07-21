# ADR-0013 — The Department Pack as the unit of modularity

**Status:** Accepted · **Date:** v2 design phase

## Context

v1's units of modularity were the agent (a charter) and the plugin (a Wasm component). Neither is the right
size for "add cybersecurity capability to the Firm": an agent is too small — capability is a charter plus
playbooks plus standards plus registries plus dashboards — and a plugin is the wrong shape, since it extends
the kernel rather than the organisation.

The requirement is explicit: every department must be completely isolated and independently expandable. That
requires a named artifact with a contract, or "isolated" is an adjective in a document.

## Options

1. **Departments as configuration.** A section in `firm.toml` listing agents. Simple; no versioning, no
   signing, no distribution, no validation, no isolation contract. Isolation would be a convention.
2. **Departments as plugins.** Reuse ADR-0006 exactly. Gets signing and sandboxing free, but the plugin
   manifest describes code extension points, not an organisation — memory namespaces, budget shares,
   archetypes, standards, and stage models have nowhere to go.
3. **Departments as Packs**: a distinct artifact type with its own manifest contract, reusing the plugin
   trust chain for signing and the plugin host for any code it carries.
4. **Departments as repositories** — each department its own git repo, composed at build time. Strong
   isolation; no runtime install, no marketplace, and a Principal cannot add a department without a build.

## Decision

Option 3. A Department Pack: `department.toml` manifest plus roles, playbooks, standards, guards, registries,
templates, dashboards, stage model, evaluations, and optional Wasm tools.

Nine of the twelve directories are data. Only `tools/` carries executable code, running in the existing
sandbox with no new mechanism.

Twelve mechanical validation checks at install, no override.

## Consequences

**Accepted: a new artifact type to specify, version, sign, validate, and document.** Real cost, mostly paid
once. The manifest schema becomes a compatibility surface that must be maintained for as long as installed
Firms exist.

**Accepted: a Pack is a large trust artifact.** It requests broad capability and contains many files. R-08 in
the risk analysis. Mitigated by the three-act install, the plain-language capability display, and the twelve
checks.

**Accepted: departments cannot depend on each other by name**, which occasionally forces a contract to be
defined where a direct call would have been simpler.

**Gained: isolation becomes mechanical.** Memory namespace, capability ceiling, budget share, filesystem
scope, and communication contract are all manifest fields the kernel enforces. Principle 11 has a mechanism
rather than a slogan.

**Gained: independent expansion.** Adding a role, a playbook, or a standard touches one directory. Adding a
department touches nothing else at all — which is the stated test of whether the isolation is real.

**Gained: reviewability.** A department can be understood by reading it. `agents/departments/backend/` is the
complete answer to "what can Backend do".

**Gained: distribution, forking, and versioning for free**, which is how Sidra Systems will specialise
departments per client and per title without editing live configuration.

**Reversal cost: high.** Once Packs are installed and their registries hold data, unwinding to configuration
means extracting data from twenty-one namespaces. This is a decision to make now, in design, which is why it
has an ADR before any code exists.
