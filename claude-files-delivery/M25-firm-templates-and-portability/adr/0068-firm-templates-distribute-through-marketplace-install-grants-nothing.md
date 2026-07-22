# ADR-0068 — Firm Templates distribute through the existing Marketplace trust chain, and installation grants nothing

**Status:** Proposed · **Date:** M25 architecture phase (3.0 "Chambers")

## Context

A Firm Template is a signed artifact that leaves one machine and is installed on another to reproduce a Firm's
structure (M25, ADR-0067). Distributing a signed artifact and installing it under a trust model is not a new
problem in Sidra OS: it is exactly what the Marketplace already does for Department Packs, Role Packs,
Integration Packs, and Plugins (`/docs-v2/05-marketplace-and-packs.md`). That layer already answers acquire vs.
install vs. grant, trust tiers, signing (ADR-0006), no-auto-update, no-phone-home, and no-execute-during-
discovery.

Two temptations exist, and both are wrong:

- **Invent a second distribution mechanism for Templates**, because a Template is "bigger" than a Pack. This
  duplicates a trust chain — and a second trust chain is a second attack surface and a second thing to keep
  correct forever.
- **Let a Template install with authority**, because reproducing a Firm "obviously" means reproducing what its
  departments could do. This is precisely the permanent-no the whole product is built around: *installation
  never grants authority* (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 8 / §12; `05-marketplace-and-packs.md`
  §2). A marketplace artifact that arrives with autonomy is the failure mode that turns a marketplace into an
  attack surface.

There is also a subtlety specific to Templates. A source Firm's departments hold *grants* — connector grants
(M16, ADR-0035), capability grants from the Principal. Those grants are authority, and authority is data
(ADR-0067), not structure. So "reproduce the Firm" must mean "reproduce which Packs are installed", never
"reproduce which capabilities were granted".

## Options

1. **A bespoke Template distribution + install-with-grants.** Fastest to a demo, and it violates two
   permanent-nos (a second trust mechanism; install granting authority). Rejected on principle 1 and guide §12.
2. **Reuse the Marketplace for distribution, but let install carry grants "to be convenient".** Keeps one
   trust chain, still violates install-grants-nothing. The convenience is the exact thing the rule forbids: a
   reproduced Firm that can act before the Principal decides.
3. **A Firm Template is one more Marketplace artifact — the largest — under the existing acquire/install/grant
   model, signed by the existing chain, and its installation writes structure and grants nothing.** Reproducing
   a Firm reproduces *which Packs are installed*; every capability is re-granted by the Principal afterward,
   exactly as after a normal Pack install.
4. **Embed Pack bodies in the Template so install needs no Marketplace.** Self-contained, and it breaks the
   Pack trust boundary — an embedded Pack is a Pack nobody re-verified against the catalogue, and a channel for
   shipping a modified Pack. Rejected.

## Decision

Option 3.

A Firm Template is added as the top row of the distributable-artifacts table (`05-marketplace-and-packs.md`
§1), above the Department Pack in trust weight because it describes a whole organisation. It is:

- **Acquired, installed, and granted as three separate acts.** A Template lives entirely in *install*; it never
  reaches *grant*. Install writes the org chart, installs the referenced Packs (under their own twelve checks),
  and writes structural Canon — and calls no grant API. The reproduced Firm's departments are installed and
  capability-idle until the Principal grants.
- **Signed by the existing chain** (ADR-0006 via M14) and subject to the existing trust tiers, with review
  depth *at least* that of a Pack.
- **A carrier of Pack *references*, not Pack bodies.** Each `PackRef` is pinned to the Pack's signed manifest
  hash; install resolves the Pack from the Marketplace and verifies the hash, so the Pack that installs is the
  signed catalogue Pack, never a copy inside the Template.
- **Seat-agnostic** (ADR-0021): it carries no source Seat, and installs into a Vault whose own single Seat is
  the actor for the install.

No new distribution mechanism. No new trust chain. Install grants nothing.

## Consequences

**Accepted: reproducing a Firm does not reproduce its grants.** A Principal who installs a Template gets the
shape and must re-grant every capability — the connector grants, the class-2/3 authorities — themselves. This
is more work than "clone the Firm whole", and it is the work the permanent-no requires. A one-click Firm that
arrives able to act is exactly the artifact that must not exist.

**Accepted: install depends on the Marketplace to resolve referenced Packs.** A Template is not fully
self-contained; if a referenced Pack is unpublished or absent, install refuses (`pack_unavailable`). The
trade is deliberate: a self-contained Template would have to embed Pack bodies and break their trust boundary.
For the internal case, the Packs are already local and install is offline anyway (`05-marketplace-and-packs.md`
§7).

**Accepted: a Template inherits every Marketplace constraint, including no-auto-update.** A Template is a
snapshot; there is no "re-sync from the source Firm". A new version is a fresh artifact and a fresh Decision.
Occasionally a Principal will want "pull the source's latest structure" and will instead export-and-reinstall,
which is correct — a live link back to a source Firm would be a phone-home the layer forbids.

**Gained: one trust chain, not two.** Signing, verification, tiers, the scroll-to-end community review, and the
publishing discipline are the Marketplace's, unchanged. M25 adds an artifact and a boundary check; it adds no
security-critical mechanism, which is the smallest possible attack-surface increase for the feature.

**Gained: the permanent-no holds at the largest artifact.** If installation-grants-nothing survives a Firm
Template — the biggest, most tempting thing to auto-empower — it survives everything. Making the largest
artifact obey the rule is the strongest possible demonstration that the rule is structural.

**Gained: Pack trust boundaries stay intact.** Because Templates reference rather than embed Packs, a Template
can never be a channel for a tampered Pack, and every Pack that installs is re-verified against its signature
and its twelve checks (ADR-0013).

**Reversal cost: high.** Once Templates are published and Firms are born from them, changing the distribution
model or letting install grant authority would break the trust posture every installed Firm relies on — and
"a permission that already works is the change nobody makes later". This is a decision to make now, in design,
which is why it is an ADR before any code exists.
