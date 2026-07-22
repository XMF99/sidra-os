# ADR-0043 — Exchange contract resolution is deterministic, and ambiguity is refused

**Status:** Accepted · **Date:** M13 architecture phase · **Supersedes:** — (operationalizes ADR-0013 and `03-department-architecture.md` §5)

## Context

`03-department-architecture.md` §5 fixes most of the Exchange's rules: a `department.request` names a
**contract**, never a department; the Registrar resolves the contract to a department at routing time; cost
follows the requester; depth is limited to 2; cycles are refused at compile time; an unprovided contract fails
cleanly with `contract_unavailable`. ADR-0013 adds that a department may not depend on another by name.

What none of these settle is the case the exit criterion will hit the moment a Firm installs more than one
provider of a contract: **which department answers when two or more `provides` the same contract?** At the
three-department exit set this is latent (Cybersecurity is the only provider of `capability.security-review`),
but the catalog guarantees it becomes real — Software Engineering, Backend, Frontend, and Mobile all sit in the
Engineering Division and several capability contracts are provided by more than one department as the catalog
grows. A resolver that picks arbitrarily is non-deterministic routing, which breaks reproducibility
(ADR-0014's frozen-charter replay guarantee assumes the *route* replays too) and makes cost attribution
depend on a coin flip. A resolver that always picks "the first installed" makes install order load-bearing,
which is exactly the kind of hidden global state the event-log design exists to eliminate.

## Options

1. **First-provider-wins (install order).** Simple; makes install order a silent, unrecorded input to routing.
   A reinstall reorders answers. Rejected — non-reproducible and invisible.
2. **Model-assisted selection at routing time.** The Division executive picks. Flexible, but it puts a
   `fast`-class model call on every ambiguous Exchange request and makes the route non-deterministic across
   replays — the failure mode ADR-0014's freeze exists to prevent. Rejected for the default path.
3. **Deterministic precedence, then an explicit Principal binding, then refuse.** Resolve by a fixed rule;
   where the rule cannot decide, require a recorded binding; where none exists, refuse with
   `contract_ambiguous` rather than guess.
4. **Forbid multiple providers.** The kernel refuses to install a second provider of any contract. Safe and
   far too strict — the catalog deliberately has overlapping capabilities (general Software Engineering vs.
   specialised Backend both do code review), and a Firm must be able to hold both. Rejected.

## Decision

Option 3. `resolve_contract` for the Exchange applies, in order:

1. **Division-local provider first.** If the requesting department's own Division contains a provider of the
   contract, route to it. This matches the escalation model (`01-org-chart-v2.md` §5 — conflicts resolve at the
   nearest shared parent) and keeps work inside a Division where it can.
2. **Explicit Principal binding.** If (1) does not decide (no Division-local provider, or more than one), a
   recorded `contract_binding` Decision — `contract → department`, made by the Principal as an ordinary logged
   Decision — resolves it. The binding is data, versioned, and revisable.
3. **Refuse with `contract_ambiguous`.** If neither (1) nor (2) decides, the request fails cleanly, Kai
   surfaces the ambiguity with the candidate departments named, and asks the Principal to record a binding.
   The Exchange never guesses.

`contract_unavailable` (no provider at all) and `contract_ambiguous` (more than one, undecidable) are distinct
refusal reasons. Both are surfaced, never silently resolved (`03-department-architecture.md` §5).

## Consequences

**Accepted: a fourth refusal reason on the Exchange path** (`contract_ambiguous` beside `contract_unavailable`,
`cycle`, `depth_exceeded`). More surface to test, and one more thing Kai must be able to explain in a Brief.

**Accepted: a new kind of Principal Decision** — the `contract_binding`. It is one more thing the Principal can
be asked to record, and a Firm that installs many overlapping departments will be asked for several. This is
work made visible, not work created: the ambiguity existed the moment two providers were installed; the
binding is where the Principal resolves it once, on the record, instead of the router resolving it silently and
differently each time.

**Gained: routing is reproducible.** The same request over the same installed set and the same bindings
resolves to the same department on every replay — the property ADR-0014's charter freeze assumes and the audit
chain requires.

**Gained: cost attribution is stable.** Because the route is deterministic, cost-follows-requester
(`03-department-architecture.md` §5) charges the same budget every time, so the budget signal stays meaningful.

**Gained: install order stops being load-bearing.** Nothing about which Pack was installed first affects a
route; the org graph is a set, not a sequence.

**Reversal cost: low.** The precedence rule and the binding table are data in the Registrar. Replacing the rule
(e.g. adding a preference tier) is a code change with no schema migration; removing bindings collapses to
"refuse on any ambiguity", which is strictly safe.
