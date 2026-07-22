# ADR-0054 — An executable artifact's capability grant is a strict subset of its producing Work Order's grant

**Status:** Proposed · **Date:** M20 architecture phase · **Supersedes:** — · **Milestone:** M20 (Executable Artifacts, 2.5 "Field")

## Context

M20 lets an agent author an artifact that is *executable* — code that runs in the Wasm sandbox, not a document
someone reads. The moment agent-authored code can run and have effects, the question is: *by what authority?*

An agent works inside a Work Order. A Work Order carries a `capability_grant` (`/docs/04-database-design.md` §2)
— a JSON set of capability strings that is itself already `charter ∩ work_order_grant ∩ firm_policy` (security
model §4). A Work Order can only *narrow* a charter, never widen it. This is the entire delegation model: every
level of the Firm's hierarchy hands down a subset of what it holds, never a superset.

If an executable artifact could hold a capability its authoring Work Order lacked, that model would have a hole
punched in it from below: a Work Order that cannot reach Stripe could author an artifact that can, and the
narrowing chain — the property the whole security model rests on — would be false. The artifact would be an
autonomy-escalation primitive wearing a productivity face.

## Options

1. **The artifact declares its own capabilities, granted at authoring by a consent screen** (the plugin model).
   Rejected: there is no Principal in the loop of an autonomous Work Order to read a consent screen, and even if
   there were, it would let an artifact hold *more* than the Work Order that made it — the exact escalation.
2. **The artifact inherits the Work Order's full grant.** Rejected: least-privilege violation. A CSV normaliser
   authored inside a Work Order that also holds `net.fetch` and `org.decide` should not carry those; it needs
   `fs.read`/`fs.write` and nothing else. Inheriting the full grant makes every artifact as dangerous as the
   most privileged Work Order it was ever authored in.
3. **The artifact's grant is `requested ∩ work_order.capability_grant`, frozen at authoring, and a requested
   capability the Work Order does not hold is a hard refusal.** The artifact gets what it asked for, but never
   more than the Work Order held. At run, the frozen grant is intersected again with firm policy and session
   grants (intersection, never union) so it can only narrow.
4. **Compute the grant fresh at every run from the current Work Order state.** Rejected: the Work Order may be
   closed, its grant may have changed, and "the grant an artifact holds" would be a moving target no audit could
   pin. Freezing at authoring makes the grant a fact with a timestamp and a source.

## Decision

Option 3.

The grant is `frozen_grant = requested_capabilities ∩ producing_work_order.capability_grant`, computed once at
authoring, immutable thereafter (the `ArtifactCapabilityGrant` type exposes no widening mutator). A requested
capability not in the producing Work Order's grant is a **hard refusal** at grant derivation, naming the
offending capability; the grant is never frozen with it, so the artifact never becomes runnable and no run can
ever exercise it.

At every run, the effective grant is `frozen_grant ∩ firm_policy ∩ session_grants` — intersection, never union
(security model §4). This can only narrow the frozen grant, so a firm capability revoked after authoring is
automatically absent. The transitive invariant `effective ⊆ frozen ⊆ producing_work_order.capability_grant`
holds at every step and is asserted in a CI property test.

Every effect the artifact has still passes the Permission Broker under the operation's effect class. This ADR
governs *what the artifact may attempt*; the Broker governs *whether each attempt proceeds*. Neither replaces
the other.

## Consequences

**Accepted: an artifact can be *less* capable than intended if its Work Order was narrowly scoped.** An agent
that authors an artifact needing `net.fetch` inside a Work Order that lacks it gets a refusal, not a widening.
The fix is to author it inside a Work Order that holds the capability — which is a Decision with the capability
shown, not a quiet escalation. This friction is the point: the only way to give an artifact a capability is to
have held it in the authoring Work Order.

**Accepted: the frozen grant can drift from the Work Order after the fact.** If the Work Order's grant is later
widened, the artifact's frozen grant does not follow — it stays bounded by what the Work Order held *at
authoring*. This is a feature (an artifact's authority is a fact with a timestamp) but it means "the artifact
has less than its Work Order now holds" is a reachable and correct state.

**Gained: the escalation is structurally impossible, not policed.** A capability the Work Order lacked never
enters the frozen grant, so the Broker never sees an authorised effect for it. The bounding happens *before the
artifact can run*, which is strictly stronger than catching a bad effect mid-run. The exit-criterion test
asserts exactly this.

**Gained: least privilege by default.** The artifact holds the intersection of what it asked for and what its
Work Order held — typically far less than either. An artifact is exactly as dangerous as the narrow slice it
requested and the Work Order could back, never as dangerous as the most privileged context it touched.

**Gained: audit has a fact to point at.** "This artifact may do X" is a frozen list with a source Work Order and
a timestamp, not an inference. `artifact_lineage` answers "where did this authority come from?" in one lookup.

**Reversal cost: high.** Once artifacts exist that were bounded this way, relaxing to inheritance or
self-declaration would retroactively widen every artifact's authority and invalidate every prior bounding
proof. The invariant is load-bearing for the exit criterion; reversing it reopens the escalation this ADR
closes.
