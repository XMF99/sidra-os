# Marketplace and Packs

Layer 8. How capability arrives, and — more importantly — how it is prevented from arriving with authority
it was not given.

## 1. What is distributable

| Artifact | Contains | Trust weight |
|---|---|---|
| **Department Pack** | A whole department: manifest, archetypes, playbooks, standards, guards, registries, dashboards, evals, optional Wasm tools | Highest — it defines a trust boundary |
| **Role Pack** | One or more Role Archetypes for an existing department | Medium |
| **Playbook Pack** | Workflows and templates for an existing department | Low — data only |
| **Standards Pack** | Path-scoped standards and guards | Medium — it constrains other work |
| **Integration Pack** | A connector: auth flow, egress hosts, capability requests | High — it opens egress |
| **Plugin** | v1 Wasm component (ADR-0006), unchanged | Per v1 |
| **Theme** | Night Atrium token overrides within the contract | Lowest |

Ordering matters: the review depth and the default trust each type gets is a function of this column, not of
its popularity or its author.

## 2. The rule that defines the layer

**Installation never grants authority.** It is stated in `02-layer-model.md` §8 and it is worth the
repetition because it is the single property that keeps a marketplace from becoming an attack surface.

Three separate acts, each logged, each independently refusable:

1. **Acquire** — the artifact is downloaded and its signature verified. Nothing is loaded.
2. **Install** — the manifest is validated against the twelve checks in `03-department-architecture.md` §8.
   Contracts resolve. Nothing runs. Capabilities are *requested*, displayed, and not granted.
3. **Grant** — the Principal grants capabilities from a plain-language list, individually. Only now can the
   department act.

A Pack that requests `integration:cloud:write` shows: *"This department will be able to make changes to your
cloud infrastructure, including changes that cost money and cannot be undone."* Not
`integration:cloud:write`. The v1 settings rule — every setting states its consequence, not its mechanism —
applies to grants with more force than it applies to settings.

## 3. Trust tiers

| Tier | Meaning | Default behaviour |
|---|---|---|
| **First-party** | Signed by Sidra Systems | Installs; capabilities still granted explicitly |
| **Verified publisher** | Identity verified, signing key registered, publication history | Installs with an additional summary of what changed since the last version |
| **Community** | Signed but unverified identity | Installs only after the Principal reads the requested-capability list in full, with a scroll-to-end requirement on the dangerous entries |
| **Unsigned** | No signature | Blocked. Installable only in developer mode, which is explicit, logged, and expires in 7 days — v1's rule, unchanged |

**No auto-update, at any tier.** v1's plugin rule: an update can request new capabilities, which is a
decision, not a maintenance task. A Pack update that requests strictly fewer capabilities may be marked
auto-updatable by the Principal; one that requests any new capability, or removes an entry from
`capabilities.forbidden`, is always a fresh approval.

## 4. Versioning and compatibility

- **Packs use semantic versioning** against their own contract surface: `provides.contracts`, registry
  schemas, and standard IDs. A breaking change to any of those is a major version.
- **`sidra_api` declares kernel compatibility** as a range. The kernel refuses to load a Pack outside it
  rather than loading it and failing later — a Pack that half-loads is worse than one that does not load.
- **Registries are append-only across versions.** A Pack update may add registry fields; it may never remove
  or redefine one, because installed Firms have data in them. Deprecation is marking, not deletion — the
  same rule CCGS applied to its own registries, adopted wholesale (ADR-0017).
- **Rollback is supported and is not a data operation.** Downgrading a Pack disables the newer archetypes and
  restores the previous manifest. Memory written under the newer version stays; it is namespaced by
  department, not by version, and Principle 3 forbids deleting it.

## 5. What the Marketplace may never do

- **Confer autonomy.** §2.
- **Bundle capability grants with content.** A Playbook Pack cannot smuggle a capability request; the
  manifest schema for a Playbook Pack has no capabilities field at all, which makes it structurally
  impossible rather than merely prohibited.
- **Rank by payment.** There is no promoted placement. This follows from v1's no-telemetry, no-ads posture
  (ADR-0009): a product that will not sell attention will not sell placement either.
- **Phone home.** Browsing the Marketplace is an explicit navigation with a named egress host. Installed
  Packs never contact the Marketplace. Update checks are manual or scheduled by the Principal, and send a
  version string.
- **Execute during discovery.** Nothing in a listing renders as anything but text and static images. No
  preview runs code.

## 6. Publishing

For Sidra Systems publishing its own Packs internally, and for the ecosystem later:

1. Pack passes the twelve install checks locally.
2. Evaluation sets run; results are published with the Pack, including failures. A Pack whose evals are
   green because they are trivial is worse than one with honest gaps, and the eval count and coverage are
   shown in the listing.
3. Capability request list is reviewed by the Security Office against a least-privilege rubric.
4. Signed and published with a changelog that names, specifically, any change to capabilities, contracts,
   registries, or standards. Those four are the only changes that can affect an installed Firm's trust
   posture, so they are the only ones the changelog is *required* to enumerate.

## 7. The internal case

Sidra Systems is the first and most important consumer of this layer, before any external ecosystem exists.
The Firm will fork Packs constantly — "Backend" specialised into "Backend — Payments", "Cybersecurity"
tightened for a regulated client, "Game Development" split per title. The Marketplace mechanism is what makes
that a versioned, signed, reviewable act instead of an unrecorded edit to a live department.

This is why the layer ships in 2.0 with an empty public catalogue and a working local publisher: the
distribution mechanism is needed on day one even though the market is not.
