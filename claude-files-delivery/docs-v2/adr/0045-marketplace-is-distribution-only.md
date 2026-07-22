# ADR-0045 — The Marketplace is distribution-only; it reuses the M13 install path and adds no install or trust mechanism

**Status:** Proposed · **Date:** M14 architecture phase

## Context

M14 ships the Marketplace (Layer 8) and the first first-party Department Pack that travels through it — the
Game Studio (`/docs-v2/05-marketplace-and-packs.md`; `/docs-v2/02-layer-model.md` §8). The Marketplace is
specified as "discovery and distribution for Packs, Plugins, and Integrations", constrained by one rule: it
"can deliver an artifact and can prove who signed it. It can never confer autonomy"
(`/docs-v2/02-layer-model.md` §8). The three acts — acquire, install, grant — are already decided
(`/docs-v2/05-marketplace-and-packs.md` §2), and install is already specified to validate against "the twelve
checks in `/docs-v2/03-department-architecture.md` §8" (same source, §2, act 2).

What is *not* explicitly recorded is the architectural placement decision M14 must make anyway: **does the
Marketplace introduce its own install machinery and its own crate, or does it reuse M13's?** The mission
guidance for this package flags exactly this open point ("if the Marketplace needs a kernel component, place it
per the crate map and dependency rule and justify it"). The v1 crate map
(`/docs/01-technical-architecture.md`) predates the department substrate and names no Marketplace or Registrar
crate; M13 introduced `sidra-departments` (the Registrar and the twelve install checks). Left undecided, this
gap invites the natural but corrosive answer — a `sidra-marketplace` kernel service with its own "quick
install" — which would create a **second install path** and, over time, a second place trust is decided. That
is the erosion `/docs-v2/02-layer-model.md` §9 exists to catch: a change that turns Layer 8's "replaceable?"
from yes to no.

## Options

1. **A dedicated `sidra-marketplace` kernel crate that installs Packs itself.** Fastest to a self-contained
   Marketplace; creates a second install path parallel to M13's, a second place the twelve checks (or a subset)
   could be applied, and a new kernel surface that must be kept in lockstep with the department contract
   forever. Two install paths is how one of them quietly drifts to "install anyway".
2. **Fold all distribution into `sidra-departments`.** No new crate; but it overloads the department substrate
   with catalogue/publish/acquire concerns that are not about *being* a department, blurring the Layer-3 /
   Layer-8 boundary the layer model draws deliberately.
3. **Distribution-only wiring that reuses the M13 install path.** The Marketplace delivers an artifact
   (acquire = download + verify signature via the ADR-0006 plugin chain) and hands it to the *existing* M13
   Registrar for install (the twelve checks, unchanged). It adds a catalogue, a publisher, and acquire — and
   **no install mechanism and no trust mechanism**. Grant remains the separate Principal Decision M13 already
   defines.
4. **No component at all — install Packs from the filesystem only.** Honest about "the public catalogue ships
   empty" (`/docs-v2/05-marketplace-and-packs.md` §7), but it discards the *working local publisher* the same
   section requires on day one, and leaves acquire/signature-proof unspecified.

## Decision

Option 3. The Marketplace is **distribution-only**:

- **Acquire** is download + signature verification over the plugin trust chain (ADR-0006). It loads nothing.
- **Install** is delegated, without a bypass, to the **M13 Registrar and its twelve install checks**
  (`/docs-v2/03-department-architecture.md` §8). The Marketplace adds **no thirteenth check** to the department
  contract and **no second install path**. The CCGS attribution requirement is enforced at the compiler output
  and the publish gate, not as a department install check (this package, architecture §7).
- **Grant** is unchanged — the separate, logged Principal Decision M13 already specifies.

Mechanically, this is **no new kernel crate**: the Pack is data in `departments/game-development/`; the
compiler is a build-time script in `infrastructure/scripts/ccgs-compile/`; and the publish/catalogue/acquire
wiring depends on `sidra-departments` and `sidra-plugins` and is invoked by the app layer — never the reverse
(ADR-0011). The kernel gains no department-specific logic (`/MASTER_IMPLEMENTATION_GUIDE.md` §3.12).

## Consequences

**Accepted: acquire is the only genuinely new distribution surface.** Publish, catalogue, and acquire are new
wiring, and acquire touches the signature chain. This is a real surface to test (signature verification, "loads
nothing", unsigned refusal outside dev mode), but it introduces no new *trust* decision — it reuses ADR-0006.

**Accepted: two consumers of the twelve checks.** Both a local filesystem install and a Marketplace install
call the same M13 path. This is a feature, not a cost: there is exactly one place the checks live, so there is
exactly one place they can be got wrong, and a test of one is a test of both.

**Gained: Layer 8 stays replaceable.** Go fully offline and installed Packs keep working; nothing new arrives
(`/docs-v2/02-layer-model.md` §9, row 8). Because the Marketplace owns no install mechanism, removing it
removes only *arrival*, never *operation* — the replaceability test stays "yes".

**Gained: installation-never-grants-authority is structural, not conventional.** With no Marketplace-private
install path, there is nowhere for a "download-and-run" convenience to grow. The three acts remain three acts,
and item 9 of the exit list (a marketplace artifact never arrives with autonomy) is enforced by the absence of
an alternative, not by a rule someone must remember (`/docs-v2/02-layer-model.md` §8;
`/MASTER_IMPLEMENTATION_GUIDE.md` §3.8).

**Gained: no new kernel crate to keep in lockstep with the department contract.** The department contract has
one owner (M13); M14 consumes it.

**Reversal cost: low.** If a hosted catalogue later needs its own service (3.0+), it is added *above* the
install path, not as a replacement for it; the decision here is which side of the Layer-3/Layer-8 line install
sits on, and moving it back would be one refactor, not a data migration.
