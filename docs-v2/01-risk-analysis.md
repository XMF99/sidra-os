# Risk Analysis

Risks introduced by v2 specifically. Risks already carried by v1 (model unreliability, prompt injection,
vendor dependency, cost overrun, data loss) are covered in the v1 documents and are not restated except where
v2 changes their magnitude.

Scored **likelihood × impact**, each low/medium/high. The ordering is by expected damage, not by likelihood.

---

## R-01 · The organisation becomes the product
**High × High — the defining risk of this release**

Twenty-one departments, eight Divisions, four Offices, Packs, Standards, Guards, Registries, Stage Models.
Every one is justified individually. Collectively they are a large amount of machinery whose purpose is to
produce one page with one ask, and the failure mode is a Firm that is impressive to describe and slow to use.

The specific shape: a Directive takes four hops instead of two, three Offices review, five Guards fire, and
the Principal waits nine minutes for a Brief that v1 produced in ninety seconds.

**Mitigations.**
- The fast lane target *rises* to 65% — most Directives must bypass the entire structure.
- Brief format is unchanged and unchangeable: one page, one ask, regardless of contributor count.
- Notification budget does not move: five things may interrupt.
- Seven departments at first run, not twenty-one (Principle 13).
- **Measured directly:** median Directive-to-Brief latency and Principal-facing token count are v2 release
  gates, compared against the v1 baseline. A regression is a blocker, not a note.

**Residual: medium.** This risk cannot be designed away, only measured. It is the reason §Acceptance in the
migration strategy is a byte-equality test rather than a checklist.

---

## R-02 · Isolation is claimed but not enforced
**Medium × High**

Principle 11 says a department is a boundary. If implementation lets one department read another's memory
"just for context", or lets an executive shortcut the Exchange because it is faster, the boundary becomes
documentation. Boundaries erode through convenience, one reasonable exception at a time.

**Mitigations.**
- Isolation expressed as capability namespacing in the existing Permission Broker — one enforcement point,
  not twenty-one.
- Invariants I-12 through I-17 are property tests, not manual review.
- The uninstall test (`03-game-studio/03` §9 item 6) proves isolation rather than capability, and it is
  listed as the item most likely to fail first.
- CI check: no kernel crate contains a department identifier.

**Residual: low**, provided the property tests ship with M11 rather than after it. If they slip, this becomes
the highest residual risk in the set.

---

## R-03 · Cost multiplies with structure
**High × Medium**

Four hops instead of two. Office reviews. Guard evaluation. Standards in every frame. Cross-department
requests with their own budgets. Each is small; the product of five small multipliers is not small, and the
Principal experiences it as a monthly bill that doubled without the work changing.

**Mitigations.**
- Routing is deterministic where possible — a Directive naming a known department costs no classification
  call (Principle 8).
- Model Classes unchanged: Offices and routing use `fast` where the judgement is narrow.
- The fourth budget ceiling makes department cost visible per department rather than as one number.
- Review Intensity (ADR-0018) gives the Principal a real dial.
- Standards count against the existing 40% retrieval cap; they do not enlarge the frame.

**Residual: medium.** Honest position: v2 will cost more per Engagement than v1. The claim is that it costs
less per *unit of work the Principal did not have to do*, and that ratio is what the release measures.

---

## R-04 · Departments proliferate without evidence
**High × Medium**

Twenty-one departments are specified. The catalogue is a menu, and menus get ordered from. A Firm running all
twenty-one for a company that ships two products has bought twenty-one budget lines, twenty-one dashboards,
and twenty-one sources of cross-department request latency for no measured gain.

**Mitigations.**
- Principle 13 states the test in falsifiable terms: could a neighbouring department absorb this without a
  measured drop in quality?
- Quarterly Structure Review is a scheduled Decision, not an aspiration.
- Installing is an explicit act; nothing arrives uninvited.
- Department KPIs include the absorbability test directly.

**Residual: medium.** The mitigations are procedural, and procedures decay. The strongest real protection is
that installing a department is friction the Principal must choose to accept.

---

## R-05 · Offices become ceremonial
**Medium × High**

An Office that approves everything is worse than no Office: it costs money and latency and produces a false
assurance that review happened. This is the v1 ADR-0008 concern at organisational scale, and it is the
failure mode that is invisible until an incident.

**Mitigations.**
- Veto rate is a *KPI with a floor*. An Office approving above 95% is a defect in the Office.
- Office reviewer instances are separate from Office heads, so a busy executive cannot become a rubber stamp
  by virtue of being busy.
- `reviewer_division != author_division` is enforced by the orchestrator, not by convention.
- Office Review is a weekly Cabinet meeting whose entire agenda is veto rates, findings, and exception ages.

**Residual: low-medium.** The floor metric is the load-bearing mitigation and it is the one most likely to be
quietly dropped during implementation as "not a real requirement". It is a real requirement.

---

## R-06 · The Game Studio import decays
**Medium × Medium**

CCGS is a live upstream repository under active development. The compiled Pack is a fork. Forks drift; drift
becomes divergence; divergence becomes a Pack nobody can re-import and nobody fully understands.

**Mitigations.**
- The compiler is a maintained tool, not a one-time script.
- Every compiled artifact carries `derived_from`.
- Divergences are recorded in `PROVENANCE.md` **with the reason**, which is the field that matters in two
  years.
- Re-import is a routine operation with a reviewable diff.

**Residual: medium.** Fork drift is a fact of forks. The mitigation makes it visible and comprehensible
rather than preventing it, and that is the honest ceiling.

---

## R-07 · Cross-department requests deadlock or storm
**Medium × Medium**

Backend asks Cybersecurity, which asks Infrastructure, which asks Backend. Or one popular department becomes
a queue every other department waits behind, and the Firm's throughput collapses to that department's.

**Mitigations.**
- Depth limit of 2; beyond that, escalate.
- Cycles refused at graph-compile time, mirroring the workflow engine's DAG validation.
- Cost follows the requester, so a popular department is not punished and requesters feel the cost of asking.
- Queue depth is a dashboard panel and an autoscale trigger.
- Deadlock rule: unresolved after two rounds becomes an Approval Request with both positions in one sentence.

**Residual: low.**

---

## R-08 · A Pack becomes an attack surface
**Medium × High**

A Department Pack is a large artifact requesting broad capability. A malicious or careless Pack that arrives
with authority is the worst outcome available in this architecture.

**Mitigations.**
- Installation grants nothing. Three separate acts: acquire, install, grant.
- Capability requests shown in plain language with consequences, never as identifiers.
- Twelve mechanical validation checks, no override.
- Trust tiers with unsigned blocked outside a 7-day developer mode.
- No auto-update when any new capability is requested.
- `capabilities.forbidden` is permanent; removing an entry requires fresh approval.
- Security Office reviews every install.

**Residual: low**, and this is the area where v1's existing plugin trust model did most of the work.

---

## R-09 · Standards proliferate into noise
**Medium × Medium**

Eleven standards in one department is useful. Two hundred across twenty-one departments, with inheritance,
produces a system where nobody knows which rule applies and agents receive a frame full of rules they will
not use.

**Mitigations.**
- Standards are ranked into the frame under the existing 40% retrieval cap. A department whose standards
  never make the cut has too many, and this shows up as a measurable rather than as an opinion.
- Every Standard must have a Guard, or it is a comment. A Standard nobody checks does not ship.
- Standards compliance is a dashboard panel per department.
- Inheritance conflicts surface at install, not at runtime.

**Residual: medium.**

---

## R-10 · Two new named agents dilute the cast
**Low × Medium**

Principle 10 — the building must feel real — depends partly on a small, memorable cast. Thirteen named agents
is more than eleven, and the pressure to name more will be constant.

**Mitigations.**
- Instances are presented by role and department, never by ID or invented name.
- Adding a named agent requires a Division or an Office, both of which require a Decision.
- Hard bound: eight Divisions maximum. More means a Division is missing, not that a name is needed.

**Residual: low.**

---

## R-11 · The idle memory budget breaks
**Medium × Medium**

v1 specified ≤400 MB idle for eleven resident agents. Forty-nine archetypes in the Game Studio alone.

**Mitigations.**
- Lazy instantiation (ADR-0014): an uninstantiated archetype is a manifest entry.
- Engine-set filtering: choosing Godot means nine archetypes never instantiate.
- Idle retirement of `on_demand` instances.
- The performance gate is re-run with twenty-one departments and sixty live instances.

**Residual: low-medium.** Stated policy if the budget is exceeded: instantiate fewer agents, do not raise the
number. A quality attribute that moves whenever it is inconvenient was never a quality attribute.

---

## R-12 · v1 users experience v2 as a regression
**Medium × Medium**

A Principal happy with an eleven-agent Firm receives a Rail reorganisation, wider vetoes, and a structure
they did not ask for.

**Mitigations.**
- Steps 1–4 of the migration are invisible.
- Step 5 is a Decision the Principal makes, not an update that arrives.
- Nothing arrives uninvited: new rooms appear only on install.
- The replay equivalence test guarantees the machinery produces the same output.
- The two Principal-facing changes are announced in the Brief on first occurrence, in one line each.

**Residual: low.**

---

## Risk summary

| ID | Risk | L × I | Residual |
|---|---|---|---|
| R-01 | The organisation becomes the product | H × H | **Medium** |
| R-02 | Isolation claimed but not enforced | M × H | Low |
| R-03 | Cost multiplies with structure | H × M | **Medium** |
| R-04 | Departments proliferate without evidence | H × M | **Medium** |
| R-05 | Offices become ceremonial | M × H | Low-medium |
| R-06 | The Game Studio import decays | M × M | **Medium** |
| R-07 | Cross-department deadlock or storm | M × M | Low |
| R-08 | A Pack becomes an attack surface | M × H | Low |
| R-09 | Standards proliferate into noise | M × M | **Medium** |
| R-10 | Named cast dilutes | L × M | Low |
| R-11 | Idle memory budget breaks | M × M | Low-medium |
| R-12 | v1 users experience v2 as regression | M × M | Low |

**The five mediums share a shape:** each is a case where structure added for good reasons costs more than it
returns, and none of them can be closed by design — only by measurement after shipping. That is why R-01's
latency and token gates are release blockers rather than nice-to-haves, and why the quarterly Structure
Review is scheduled rather than intended.

The risk this analysis is least able to reason about is R-01. Everything else has a mechanism; R-01 has a
judgement call that will be made repeatedly by whoever implements this, and the documents can only make the
right call the easy one.
