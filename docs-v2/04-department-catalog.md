# Department Catalog

Twenty-one departments across eight Divisions. Each entry is a Pack specification: what it owns, who is in
it, what it provides to others, what it needs from others, and how it is measured.

**A Firm installs a subset.** Principle 13 — structure must be earned by evidence. The recommended
first-run set for Sidra Systems is marked **CORE**; the rest install when the work appears.

## Division map

| Division | Executive | Departments | Rationale for the grouping |
|---|---|---|---|
| **Engineering** | Rune (CTO) | Software Engineering, Backend, Frontend, Mobile | Shared codebases, shared standards, constant mutual review |
| **Platform** | Atlas (CIO) | Cloud, Infrastructure, Automation | Shared blast radius; all three touch running systems |
| **Intelligence** | Orin (CAIO) | AI Engineering, Data Engineering, Research | Shared substrate: data, evaluation, experiment discipline |
| **Security** | Corvus (CISO) | Cybersecurity | Reports directly to Kai and never through Engineering — Principle 5. A Division of one, deliberately. |
| **Product** | Iris (CPO) | Product Design, UI/UX, Business Analysis | Shared artifact: the specification of what should exist |
| **Game Studio** | Lyra (Studio Head) | Game Development | A different lifecycle, different roles, different standards. See `03-game-studio/`. |
| **Commercial** | Sable (CCO) | Marketing, Sales, Customer Success | Shared object: the customer relationship |
| **Corporate** | Quill (COO) | Finance, Legal, HR | Shared object: the Firm's obligations and records |

Offices are cross-cutting and belong to no Division: **Quality** (Argus), **Cost** (Cass),
**Architecture** (Rune), **Security** (Corvus). See `02-organization/01-org-chart-v2.md`.

---

## Engineering Division

### 1. Software Engineering **CORE**
`dept.software-engineering` · head: **Vega** (retained from v1) · classes: `reasoner` head, `worker` staff

**Owns** general-purpose implementation, refactoring, code review, technical debt, and the standards every
other engineering department inherits. The department of record when work is code but not obviously back
end, front end, or mobile.

| | |
|---|---|
| Archetypes | head · implementation-engineer · refactoring-engineer · code-reviewer · debt-analyst |
| Playbooks | implement-story · review-change · refactor-module · debt-audit · reverse-document |
| Standards | naming · error-handling · testing-floor · dependency-policy · file-size |
| Registries | modules · interfaces · dependencies |
| Provides | `capability.code-review` · `capability.implementation` · `capability.refactor` |
| Requires | `capability.security-review` · `capability.architecture-review` |
| KPIs | review rejection rate · defect escape rate · debt trend · Deliverable rework rate |
| Effect ceiling | 2 (writes to Vault artifacts; repository writes require approval) |

### 2. Backend **CORE**
`dept.backend` · head: archetype · classes: `worker` with `reasoner` for schema and contract work

**Owns** server-side systems, APIs, data access, service boundaries, background jobs, and the contracts
other departments build against.

| | |
|---|---|
| Archetypes | head · api-engineer · data-modeler · integration-engineer · performance-engineer |
| Playbooks | design-endpoint · schema-change · service-decomposition · incident-triage · load-analysis |
| Standards | api-design · data-access · error-handling · idempotency · migration-safety |
| Registries | endpoints · data-contracts · service-boundaries |
| Provides | `capability.api-design` · `capability.schema-review` · `capability.data-contract` |
| Requires | `capability.security-review` · `capability.code-review` · `capability.infrastructure-review` |
| KPIs | contract stability · migration incidents · p99 budget adherence · schema-review turnaround |
| Effect ceiling | 2 |

### 3. Frontend **CORE**
`dept.frontend` · head: archetype · classes: `worker`

**Owns** web application implementation, component systems, client state, accessibility implementation, and
front-end performance.

| | |
|---|---|
| Archetypes | head · component-engineer · state-engineer · accessibility-engineer · web-performance-engineer |
| Playbooks | build-component · implement-screen · a11y-audit · bundle-analysis · design-token-sync |
| Standards | component-api · state-management · accessibility-floor (WCAG AA) · bundle-budget |
| Registries | components · routes · design-tokens |
| Provides | `capability.ui-implementation` · `capability.accessibility-audit` |
| Requires | `capability.design-spec` · `capability.api-design` · `capability.code-review` |
| KPIs | a11y violations · bundle budget adherence · component reuse rate · spec-to-implementation drift |
| Effect ceiling | 2 |

### 4. Mobile
`dept.mobile` · head: archetype · classes: `worker`

**Owns** iOS and Android applications, platform integration, offline behaviour, and store release mechanics.

| | |
|---|---|
| Archetypes | head · ios-engineer · android-engineer · cross-platform-engineer · release-engineer |
| Playbooks | implement-feature · platform-parity-check · store-submission · offline-strategy · crash-triage |
| Standards | platform-conventions · offline-first · permissions-policy · store-compliance |
| Registries | screens · platform-capabilities · store-metadata |
| Provides | `capability.mobile-implementation` · `capability.store-release` |
| Requires | `capability.design-spec` · `capability.api-design` · `capability.code-review` |
| KPIs | crash-free rate · store rejection rate · parity gap count · release cadence |
| Effect ceiling | 3 (store submission is irreversible — always asks) |

---

## Platform Division

### 5. Cloud
`dept.cloud` · head: archetype · classes: `worker` with `reasoner` for cost and topology

**Owns** cloud topology, managed services, cost optimisation, regions, and capacity.

| | |
|---|---|
| Archetypes | head · architect · cost-analyst · reliability-engineer |
| Playbooks | design-topology · cost-review · capacity-plan · region-strategy · failover-drill |
| Standards | tagging · least-privilege-iam · cost-guardrails · multi-az-policy |
| Registries | environments · services · quotas |
| Provides | `capability.cloud-design` · `capability.cost-analysis` |
| Requires | `capability.security-review` · `capability.infrastructure-review` |
| KPIs | cost per environment · unused-resource ratio · availability against target |
| Effect ceiling | 3 (provisioning spends money and is not always reversible) |

### 6. Infrastructure
`dept.infrastructure` · head: **Atlas's department** (Atlas is Division exec; the head is an archetype instance) · classes: `worker`

**Owns** CI/CD, build systems, environments, observability, deployment, and rollback.

| | |
|---|---|
| Archetypes | head · pipeline-engineer · observability-engineer · release-engineer · sre |
| Playbooks | pipeline-change · deploy · rollback · incident-response · runbook-author · postmortem |
| Standards | pipeline-safety · deployment-gates · observability-floor · runbook-completeness |
| Registries | pipelines · environments · runbooks · incidents |
| Provides | `capability.infrastructure-review` · `capability.deploy` · `capability.incident-response` |
| Requires | `capability.security-review` · `capability.cloud-design` |
| KPIs | deploy success rate · MTTR · rollback frequency · pipeline duration |
| Effect ceiling | 3 (deployment to production always asks) |

### 7. Automation
`dept.automation` · head: archetype · classes: `fast` and `worker`

**Owns** internal process automation, scripting, integration glue, and scheduled operations — the department
that removes recurring work from every other department.

| | |
|---|---|
| Archetypes | head · workflow-engineer · integration-engineer · scheduler-analyst |
| Playbooks | automate-process · dry-run-review · retire-automation · integration-map |
| Standards | dry-run-first · idempotency · self-retirement · failure-visibility |
| Registries | automations · integrations · schedules |
| Provides | `capability.automation-build` · `capability.process-analysis` |
| Requires | `capability.security-review` · `capability.code-review` |
| KPIs | hours removed per month · automation failure rate · retired-automation count |
| Effect ceiling | 2 (the automations it builds carry their own ceilings — v1 automation engine) |

---

## Intelligence Division

### 8. AI Engineering **CORE**
`dept.ai-engineering` · head: **Orin's department** (Orin is Division exec) · classes: `reasoner` + `worker`

**Owns** model integration, prompt and charter engineering, evaluation harnesses, retrieval quality, and
inference cost — including for Sidra OS itself.

| | |
|---|---|
| Archetypes | head · model-engineer · evaluation-engineer · retrieval-engineer · prompt-architect |
| Playbooks | design-evaluation · charter-change · retrieval-tuning · model-binding-change · injection-review |
| Standards | eval-before-charter-change · determinism-where-possible · honest-uncertainty · no-silent-downgrade |
| Registries | evaluations · model-bindings · prompt-fragments |
| Provides | `capability.evaluation-design` · `capability.model-review` · `capability.retrieval-tuning` |
| Requires | `capability.data-engineering` · `capability.security-review` |
| KPIs | eval coverage · recall@10 trend · cost per Deliverable · charter regression count |
| Effect ceiling | 2 |

### 9. Data Engineering
`dept.data-engineering` · head: archetype · classes: `worker`

**Owns** pipelines, warehouses, data quality, lineage, and analytics infrastructure.

| | |
|---|---|
| Archetypes | head · pipeline-engineer · quality-analyst · warehouse-architect · analytics-engineer |
| Playbooks | build-pipeline · quality-audit · lineage-map · schema-evolution · metric-definition |
| Standards | lineage-required · schema-evolution-safety · pii-handling · metric-single-definition |
| Registries | datasets · metrics · lineage |
| Provides | `capability.data-engineering` · `capability.metric-definition` |
| Requires | `capability.security-review` · `capability.schema-review` |
| KPIs | pipeline freshness · quality-check pass rate · metric-definition conflicts |
| Effect ceiling | 2 |

### 10. Research
`dept.research` · head: archetype · classes: `reasoner`

**Owns** investigation of things the Firm does not yet know: technology evaluation, feasibility studies,
prior art, and future-technology assessment. Produces findings, never production systems.

| | |
|---|---|
| Archetypes | head · technology-analyst · feasibility-researcher · literature-analyst |
| Playbooks | technology-evaluation · feasibility-study · prior-art-scan · spike-report · horizon-scan |
| Standards | claim-must-cite · negative-results-recorded · confidence-stated · no-production-code |
| Registries | findings · evaluated-technologies · open-questions |
| Provides | `capability.research` · `capability.feasibility-assessment` |
| Requires | — (deliberately: Research must be able to investigate anything without a dependency gate) |
| KPIs | findings adopted · findings contradicted later · question-closure rate |
| Effect ceiling | 1 (reads and writes documents; nothing else) |

---

## Security Division

### 11. Cybersecurity **CORE**
`dept.cybersecurity` · head: **Corvus's department** (Corvus is Division exec and holds the Security Office) · classes: `reasoner`

**Owns** threat modelling, security review, vulnerability management, incident response, secrets policy, and
the Firm's own security posture. Reports to Kai directly — never through Engineering.

| | |
|---|---|
| Archetypes | head · threat-modeler · appsec-reviewer · vulnerability-analyst · incident-responder · compliance-analyst |
| Playbooks | threat-model · security-review · vuln-triage · incident-response · secrets-audit · dependency-audit |
| Standards | least-privilege · secrets-never-in-repo · dependency-policy · finding-severity-rubric · disclosure-protocol |
| Registries | findings · threat-models · assets · exceptions |
| Provides | `capability.security-review` · `capability.threat-model` · `capability.incident-response` |
| Requires | — (must be able to review anything; a dependency would be a conflict of interest) |
| KPIs | mean time to triage · open critical findings · exception count and age · review turnaround |
| Effect ceiling | 2, with an unconditional veto at class 3 firm-wide |

---

## Product Division

### 12. Product Design **CORE**
`dept.product-design` · head: **Iris's department** (Iris is Division exec) · classes: `reasoner` + `worker`

**Owns** what should be built and why: problem definition, specification, scope, acceptance criteria,
prioritisation, and roadmap.

| | |
|---|---|
| Archetypes | head · product-analyst · spec-author · roadmap-planner |
| Playbooks | write-spec · scope-check · prioritise · acceptance-criteria · roadmap-update · stakeholder-update |
| Standards | problem-before-solution · acceptance-criteria-required · non-goals-required · one-metric-per-spec |
| Registries | specifications · decisions-product · non-goals |
| Provides | `capability.specification` · `capability.prioritisation` |
| Requires | `capability.design-spec` · `capability.business-analysis` · `capability.feasibility-assessment` |
| KPIs | spec-to-rework rate · scope creep per Engagement · acceptance-criteria completeness |
| Effect ceiling | 1 |

### 13. UI/UX **CORE**
`dept.ui-ux` · head: **Mira** (retained from v1) · classes: `worker`

**Owns** interaction design, information architecture, flows, wireframes, usability, and the design system
itself.

| | |
|---|---|
| Archetypes | head · interaction-designer · design-system-steward · researcher · content-designer |
| Playbooks | design-flow · design-review · usability-review · token-change · component-spec · copy-review |
| Standards | night-atrium-token-contract · accessibility-floor · states-checklist · copy-rules |
| Registries | flows · components · tokens · copy-patterns |
| Provides | `capability.design-spec` · `capability.design-review` · `capability.copy-review` |
| Requires | `capability.specification` · `capability.ui-implementation` (for feasibility) |
| KPIs | spec-to-implementation drift · a11y findings at review · token-contract violations |
| Effect ceiling | 1 |

### 14. Business Analysis
`dept.business-analysis` · head: archetype · classes: `worker`

**Owns** process modelling, requirements elicitation, ERP and business-system analysis, and the translation
between how a business works and what software must do.

| | |
|---|---|
| Archetypes | head · process-analyst · requirements-analyst · erp-analyst · data-mapper |
| Playbooks | model-process · elicit-requirements · gap-analysis · erp-fit-assessment · data-mapping |
| Standards | as-is-before-to-be · requirement-traceability · assumption-register |
| Registries | processes · requirements · business-entities |
| Provides | `capability.business-analysis` · `capability.process-model` |
| Requires | `capability.specification` · `capability.data-engineering` |
| KPIs | requirement traceability coverage · rework from missed requirements |
| Effect ceiling | 1 |

---

## Game Studio Division

### 15. Game Development
`dept.game-development` · head: **Lyra** (Studio Head, Division exec) · classes: full range

Specified in detail in `03-game-studio/02-game-studio-department.md`. Founded on the
Claude-Code-Game-Studios repository: 49 agents, 73 skills, 12 hooks, 11 rules, 38 templates, two registries,
a seven-stage lifecycle, and three-tier director gates — compiled into a Department Pack.

Summary only here:

| | |
|---|---|
| Archetypes | 49, in three tiers: 3 directors, 8 leads, 24 specialists, 14 engine specialists |
| Playbooks | 73, mapped from CCGS skills |
| Standards | 11, from CCGS path-scoped rules |
| Guards | 12, from CCGS hooks |
| Registries | entities · architecture (adopted directly — see ADR-0017) |
| Stage model | Concept → Systems Design → Technical Setup → Pre-Production → Production → Polish → Release |
| Provides | `capability.game-design` · `capability.game-implementation` · `capability.playtest` |
| Requires | `capability.code-review` · `capability.security-review` · `capability.store-release` |
| Effect ceiling | 2, except release (3) |

---

## Commercial Division

### 16. Marketing
`dept.marketing` · head: **Sable's department** (Sable is Division exec) · classes: `worker`

| | |
|---|---|
| Archetypes | head · content-strategist · campaign-planner · brand-steward · seo-analyst |
| Playbooks | campaign-plan · draft-content · brand-review · competitive-brief · performance-report |
| Standards | brand-voice · claim-substantiation · disclosure-required · no-unverified-metrics |
| Registries | campaigns · messaging-pillars · claims |
| Provides | `capability.content` · `capability.brand-review` |
| Requires | `capability.legal-review` (for claims) · `capability.design-spec` |
| KPIs | claim-substantiation rate · content-to-publish cycle · brand-review pass rate |
| Effect ceiling | 3 (publishing is public and irreversible — always asks) |

### 17. Sales
`dept.sales` · head: archetype · classes: `worker`

| | |
|---|---|
| Archetypes | head · pipeline-analyst · proposal-author · account-researcher |
| Playbooks | pipeline-review · draft-proposal · account-research · forecast · call-prep |
| Standards | no-commitment-without-approval · pricing-from-registry · pipeline-hygiene |
| Registries | accounts · pipeline · pricing |
| Provides | `capability.proposal` · `capability.account-research` |
| Requires | `capability.legal-review` · `capability.cost-analysis` |
| KPIs | forecast accuracy · proposal turnaround · pipeline hygiene score |
| Effect ceiling | 3 (any external commitment always asks) |

### 18. Customer Success
`dept.customer-success` · head: archetype · classes: `worker` + `fast`

| | |
|---|---|
| Archetypes | head · support-analyst · escalation-manager · kb-author · health-analyst |
| Playbooks | triage-ticket · draft-response · escalate · write-kb-article · health-review |
| Standards | response-tone · no-promise-without-owner · escalation-sla · kb-from-resolution |
| Registries | issues · known-problems · accounts-health |
| Provides | `capability.support` · `capability.customer-signal` |
| Requires | `capability.incident-response` · `capability.specification` |
| KPIs | first-response time · escalation rate · KB deflection · recurring-issue count |
| Effect ceiling | 2 (customer-facing sends require approval) |

---

## Corporate Division

### 19. Finance
`dept.finance` · head: archetype · classes: `worker` with `reasoner` for analysis

Note: **Cass holds the Cost Office and does not head this department.** An authority that vetoes spend
cannot also be the department producing the spend analysis — Principle 5. ADR-0015.

| | |
|---|---|
| Archetypes | head · financial-analyst · budget-planner · reconciliation-analyst · tax-preparer |
| Playbooks | variance-analysis · budget-plan · reconcile · financial-statements · runway-forecast |
| Standards | source-of-figure-required · no-projection-without-assumptions · reconciliation-before-report |
| Registries | accounts · budgets · commitments |
| Provides | `capability.financial-analysis` · `capability.budget-model` |
| Requires | `capability.legal-review` |
| KPIs | reconciliation completeness · forecast variance · close cycle time |
| Effect ceiling | 1 — **Finance never moves money.** v1 roadmap: autonomous financial transactions are permanently behind a human signature. |

### 20. Legal
`dept.legal` · head: archetype · classes: `reasoner`

| | |
|---|---|
| Archetypes | head · contract-analyst · compliance-analyst · ip-analyst · policy-author |
| Playbooks | review-contract · compliance-check · risk-assessment · policy-draft · vendor-check |
| Standards | not-legal-advice-disclosure · escalate-on-novel-risk · jurisdiction-stated · redline-not-rewrite |
| Registries | contracts · obligations · compliance-requirements |
| Provides | `capability.legal-review` · `capability.compliance-check` |
| Requires | — |
| KPIs | review turnaround · obligations tracked vs. missed · escalation appropriateness |
| Effect ceiling | 1 — Legal produces analysis, never executes an agreement |

### 21. HR
`dept.hr` · head: archetype · classes: `worker`

| | |
|---|---|
| Archetypes | head · recruiting-analyst · onboarding-planner · policy-author · comp-analyst |
| Playbooks | draft-job-post · interview-plan · onboarding-plan · policy-lookup · comp-analysis |
| Standards | pii-strict-handling · no-individual-assessment-without-human · policy-source-cited |
| Registries | roles · policies · onboarding-plans |
| Provides | `capability.hr-process` |
| Requires | `capability.legal-review` |
| KPIs | time to onboarding-ready · policy question deflection · plan completeness |
| Effect ceiling | 2, with a hard rule: **no automated decision about a named human being.** Every HR Deliverable concerning an individual is advisory and requires a human decision on the record. |

---

## Summary

| Division | Departments | CORE at first run |
|---|---|---|
| Engineering | 4 | Software Engineering, Backend, Frontend |
| Platform | 3 | — |
| Intelligence | 3 | AI Engineering |
| Security | 1 | Cybersecurity |
| Product | 3 | Product Design, UI/UX |
| Game Studio | 1 | — |
| Commercial | 3 | — |
| Corporate | 3 | — |
| **Total** | **21** | **7** |

Seven departments at first run, not twenty-one. Principle 13, and Principle 1: a Firm that arrives with
twenty-one departments the Principal did not ask for has spent their attention before doing any work.
