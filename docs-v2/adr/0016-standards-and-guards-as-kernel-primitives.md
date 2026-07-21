# ADR-0016 — Standards and Guards as kernel primitives

**Status:** Accepted · **Date:** v2 design phase · **Supersedes:** the twelve message kinds in
`/docs/03-agents/06-communication-protocol.md` · **Source:** patterns in Claude-Code-Game-Studios
(`.claude/rules/`, `.claude/hooks/`)

## Context

v1 had two enforcement mechanisms. **Fences** answer *may I?* — capability, budget, egress, effect class,
enforced by the Permission Broker, refusal hard and immediate. **Effect classes** answer *how dangerous is
this?* and determine whether approval is needed.

Neither answers *how well should this be done?* or *should this proceed at this specific lifecycle point?*
v1 could ignore both: one Firm, one implicit standard, one generic Engagement lifecycle.

At twenty-one departments, a Backend API and a game shader and a marketing claim have genuinely different
correctness criteria, and there is no place to put them except inside individual charters — where they
duplicate, drift, and cannot be inherited.

CCGS had solved both problems: eleven path-scoped rule files automatically applied to whoever touches a
matching path, and twelve hooks running deterministic validation at lifecycle points.

## Options

1. **Put standards in charters.** No new concept. Duplication across every archetype that touches a path;
   drift guaranteed; no inheritance; changing a rule means editing every charter.
2. **Standards only, no Guards.** Rules injected into the frame, enforced by the model reading them. Cheap
   and unreliable: a standard nobody checks is a comment, which is precisely the observation that makes
   CCGS's rule/hook pairing work.
3. **Standards and Guards as first-class kernel primitives**, path-scoped, inheritable, with Guards running
   at declared lifecycle points and able to warn or block.
4. **Extend Fences to cover quality.** Conflates *may I* with *did I do it well*. A system that treats
   substandard work as a security refusal either blocks too much or, once tuned down, reviews too little.

## Decision

Option 3.

A **Standard** is a path- or artifact-scoped rule. Resolved by the Standards Engine, supplied into the
context frame, counted against the existing 40% retrieval cap. Inheritance: Firm > Application > Department;
a department may tighten, never relax.

A **Guard** is a declarative validator at a lifecycle point — session start, pre-effect, pre-deliverable,
pre-commit, post-turn — with an action of warn or block.

Two new message kinds, bringing twelve to fourteen: `department.request` (ADR-0013's Exchange) and
`standard.violation`.

**Every Standard must have a Guard, or it does not ship.**

Guards are implemented in three tiers: declarative TOML (the majority), Wasm validators under the existing
plugin host (where real logic is needed), and kernel-native (where the kernel already does the job better —
audit logging and compaction preservation).

## Consequences

**Accepted: Guards cannot be shell scripts.** CCGS's hooks are `bash` with ambient filesystem, `git`, and
`jq` access. ADR-0006's sandbox forbids that shape, and importing it would put a hole in the security model
to gain a validation feature — a bad trade at any exchange rate. A user who could write a hook in five
minutes now compiles a Wasm component for anything the declarative tier does not cover. **This is a real
reduction in extensibility and it is accepted rather than mitigated away.**

**Accepted: two more concepts in an already-large vocabulary**, and a distinction (Fence vs. Standard vs.
Guard) that will need explaining repeatedly.

**Accepted: standards can proliferate into noise.** R-09. Bounded by the retrieval cap — a department whose
standards never rank into the frame has too many — and by the every-Standard-needs-a-Guard rule.

**Accepted: Guard evaluation is latency on every lifecycle point.** Declarative guards are cheap; Wasm guards
are metered by the existing fuel mechanism.

**Gained: the missing axis.** Quality rules become explicit, scoped, inheritable, versioned, and enforced,
instead of being prose inside a hundred charters.

**Gained: violations are data.** `standard.violation` events reveal that a specific archetype repeatedly
violates a specific standard — a charter defect, visible in a dashboard, rather than a mystery discovered in
review.

**Gained: the escape hatch is explicit.** CCGS's `prototype-code` rule — a path scoped *out* of production
standards and explicitly non-shippable — is adopted as a general pattern. A standards system without a named
exemption gets one anyway, informally and invisibly.

**Reversal cost: moderate.** Standards revert to charter prose (a regression, but mechanical). Guards revert
to nothing, losing deterministic validation. The two new message kinds cannot be removed, per the
compatibility contract — but an unused message kind is harmless.
