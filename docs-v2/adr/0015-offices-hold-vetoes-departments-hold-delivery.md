# ADR-0015 — Offices hold vetoes; Departments hold delivery

**Status:** Accepted · **Date:** v2 design phase · **Supersedes:** the cross-cutting veto placement in
`/docs/03-agents/02-org-chart.md` §1

## Context

v1 gave Argus (QA) a quality veto and Cass (Finance) a spend veto while both sat inside departments as
individual contributors. At eleven agents this worked: Argus reviewed Vega's code and they were peers under
Rune, so ADR-0008's author≠reviewer rule was satisfiable within the chart.

At twenty-one departments the question becomes structural. If Backend reviews Backend's work, Principle 5 is
decorative. And the two v1 veto-holders now have an additional conflict: Cass would head the Finance
department *and* veto spend, which means reviewing analysis Cass's own department produced.

## Options

1. **Vetoes stay with department heads.** No new concept. Every veto-holder reviews work from inside the line
   they are reviewing. Principle 5 becomes advisory.
2. **A single "governance department".** One department holding all four vetoes. Simple, and it produces one
   agent that can block anything — a bottleneck and a single point of capture. Also wrong on the merits:
   quality, cost, architecture, and security are different judgements requiring different expertise.
3. **Offices: cross-cutting authorities outside every delivery line, each with a narrow scoped veto,
   performing no delivery work.**
4. **Rotating review assignment** — any department may be assigned to review any other. Preserves
   independence without new structure; loses expertise, since a Marketing agent reviewing a threat model is
   independent and useless.

## Decision

Option 3. Four Offices: **Quality** (Argus), **Cost** (Cass), **Architecture** (Rune), **Security** (Corvus).

Each holds a narrow, specific veto not overridable by a Division executive. Each performs no delivery work,
ever. Each reports to Kai directly.

Precedence when Offices conflict and Kai cannot resolve: **Security > Quality > Architecture > Cost.**

Two Offices are held by Division executives (Rune, Corvus). This is legitimate only because Division
executives perform no delivery work. When the artifact under review originates in the reviewer's own
Division, an Office reviewer instance conducts the review, enforced by
`reviewer_division != author_division`.

Cass does **not** head the Finance department. An authority that vetoes spend cannot be the department
producing the spend analysis.

## Consequences

**Accepted: a fifth structural concept.** Divisions, Departments, Offices, Archetypes, Instances. That is a
lot of vocabulary for one release, and the teaching cost is paid on every onboarding forever.

**Accepted: Offices are latency and cost on every Engagement above their thresholds.** Real, and priced by
Review Intensity (ADR-0018).

**Accepted: the dual-hat resolution is subtle.** "Rune holds the Architecture Office but does not personally
review Engineering's artifacts" is a rule an implementer can plausibly get wrong. It is enforced
mechanically rather than by documentation for exactly that reason.

**Accepted: Argus and Cass lose their delivery roles.** v1's QA Engineer no longer engineers; v1's Finance
Manager no longer manages finance. Both gain firm-wide veto scope. Some capability moves into archetypes
inside departments, and the named agents become narrower.

**Gained: Principle 5 becomes structural.** Independence is a property of the org chart, not of a rule
someone remembers to follow.

**Gained: all three v1 vetoes are preserved exactly** — quality, spend, architecture — and widened from
department scope to firm scope. Nothing was lost in the reorganisation.

**Gained: a place to put the security function that is not inside the organisation it audits.** Corvus reports
to Kai, holds an independent budget, and can be overruled only by the Principal, explicitly, with the
accepted risk named.

**Gained: a measurable failure mode.** Veto rate has a floor. An Office approving above 95% is a defect. This
is the only instrument that distinguishes a working review structure from a ceremonial one, and it exists
because Offices are separable enough to measure.

**Reversal cost: low.** Office assignment is manifest data. Folding an Office back into a department is a
field change, and the history remains coherent because Office reviews are recorded as reviews either way.
