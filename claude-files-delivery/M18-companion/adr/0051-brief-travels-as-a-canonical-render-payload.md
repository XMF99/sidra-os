# ADR-0051 — The Brief travels as a canonical render payload; the Companion displays, never re-renders or authors

**Status:** Proposed · **Date:** 2.5 "Field" (M18) · **Supersedes:** —

## Context

The M18 exit criterion requires that, on the phone, *the Brief renders identically*
(`/MILESTONE_REGISTRY.md` §4). "Identically" is a strong word and it is easy to weaken by accident. The Brief
is the Firm's most important output — the one page that is the whole point of Principle 1 (attention is the
scarcest resource) — and it has a fixed shape in the store: `situation`, `actions`, `findings`,
`recommendation`, `the_ask`, `confidence` (`/docs/04-database-design.md`, `briefs`). Its content passes
through a **sanitizing markdown pipeline with a node allowlist** on the desktop; model output never reaches
the DOM as raw HTML (`/docs/01-technical-architecture.md` §4.4).

There are two ways to put that Brief on a phone:

- **Re-implement the renderer natively.** The phone parses the same `briefs` fields and runs its own markdown
  pipeline and its own layout.
- **Render once, in the kernel, into a portable payload the phone displays verbatim.**

The first path has a well-known failure mode, and the desktop architecture already rejected its analogue: the
renderer may call only the generated `commands.ts` binding *because the two cannot drift*
(`/docs/01-technical-architecture.md` §4.2). Two independent implementations of anything the security model
cares about drift, and here the thing that would drift is *what the Principal sees before they approve* — the
sanitization allowlist, the ordering of the six Brief fields, the truncation of a long finding. A phone
markdown parser that admits one node the desktop strips is both a fidelity break and a T10-class injection
surface (`/docs/07-security-model.md` §3, renderer XSS via model output) reopened on a second platform.

This is also where "no authoring" (the milestone's defining constraint, `/MILESTONE_REGISTRY.md` §4) is won
or lost. A phone that can compose and format its own content is one refactor away from composing a Directive.
A phone that only *displays a payload the kernel produced* has nowhere to author from.

## Options

1. **Native re-implementation of the Brief renderer on the phone.** Full platform-native control, best raw
   performance. Rejected: two renderers drift; the sanitization boundary is duplicated and can diverge on the
   platform with less review; and giving the phone a real composition/formatting engine is the first crack in
   the no-authoring wall.

2. **Ship raw `briefs` fields and a shared render library compiled for the phone.** One implementation,
   shared. Better, but a shared UI library across a WebView and a native mobile toolchain is a heavy, ongoing
   compatibility surface for a milestone whose job is "read a page and clear approvals," and it still runs a
   markdown-to-view step on the untrusted device.

3. **Canonical render payload produced by the kernel; the Companion displays it verbatim (chosen).** The
   kernel renders the Brief once — running the same sanitizing pipeline the desktop uses — into a **canonical,
   already-resolved render payload**: an ordered, typed, allowlisted node tree (the six Brief sections, each a
   sequence of safe inline/block nodes) plus a `content_hash` over it. The payload contains no raw HTML, no
   script, no remote-image fetch, no instruction-shaped free text outside the fenced structure. The Companion
   walks that node tree and paints it with native primitives. It runs **no markdown parser and no
   sanitizer** — there is nothing left to sanitize — and it can produce no content the kernel did not.

## Decision

Option 3. **A Brief is rendered once, by the kernel, into a canonical render payload that the Companion
displays byte-for-byte in content.**

- **The render payload is canonical and hashed.** For each Brief the companion service emits a
  `BriefRenderPayload`: the six sections in fixed order, each a list of allowlisted nodes (heading, paragraph,
  list, list-item, emphasis, code-span, link-to-trace — the same allowlist the desktop sanitizer enforces),
  plus `the_ask` and the `confidence` summary as structured fields, plus a `content_hash =
  SHA-256(canonical_json(payload))`. The desktop renderer consumes the same payload shape, so there is **one**
  render implementation and one allowlist.

- **"Identically" is a testable equality, not a judgement.** The exit-criterion harness renders a Brief on the
  desktop and produces its payload for the phone from the same kernel path, and asserts the two `content_hash`
  values are equal — the phone's Brief content is identical to the desktop's by construction. Font metrics and
  screen size differ (a phone is not a monitor); **content** does not.

- **The Companion has no renderer to author from.** It has a node-tree *painter*, not a composition or
  formatting engine. There is no text-input-to-Brief path, no markdown editor, no Directive field. The
  no-authoring constraint is enforced by the *absence* of the machinery to author, not by a disabled button.

- **The payload carries no secret and no live content.** Like every other thing crossing to the phone
  (ADR-0049, ADR-0050), the payload is display content only: no `KeychainRef`, no Vault path, no credential,
  no re-fetchable remote resource. A link node points only to a trace id the kernel can resolve *later, on the
  desktop* — it is not a URL the phone dereferences.

## Consequences

**Accepted: the kernel does the rendering work, not the phone.** The companion service runs the sanitizing
pipeline and builds a node tree per Brief in the snapshot. This is bounded — a snapshot is the day's Briefs,
a small set — and it happens on the desktop where the pipeline already lives, so no new sanitizer is written
for the mobile platform.

**Accepted: the payload schema is a compatibility surface.** The node-tree shape must be versioned like an
event payload (ADR-0002), because a phone built against v1 must display a Brief produced by a later kernel.
The allowlist is the contract; extending it is a reviewed change on both surfaces at once, which is precisely
the property option 1 could not give.

**Gained: identical rendering is proven, not asserted.** A single content hash decides it. There is no second
renderer whose drift must be chased across releases.

**Gained: the injection boundary is not duplicated.** The phone never parses model output; it paints a tree
the kernel already sanitized. T10 (renderer XSS via model output) is not reopened on the mobile platform,
because the mobile platform has no HTML surface and no parser.

**Gained: no authoring is structural.** The Companion literally lacks a composition engine. "The phone cannot
author" stops being a policy and becomes a fact about what code exists — the strongest form the constraint can
take, and the one the milestone's exit criterion and scope discipline both require.

**Reversal cost: low.** The render payload and its cache (`brief_render_cache`) are additive. A Firm with no
paired device produces no payloads and behaves exactly as pre-M18. Removing M18 removes the payload path; the
desktop renderer, which can consume the same payload or the raw fields, is unaffected either way.
