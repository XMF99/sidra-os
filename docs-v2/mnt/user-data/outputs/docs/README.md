# Sidra OS — Documentation

> A desktop operating system for a company of one, staffed by AI.

Sidra OS is a local-first desktop application that runs a simulated organization on behalf of a single
principal. The principal states intent. An executive agent forms strategy, delegates to a standing staff
of specialist agents, supervises the work, and returns one signed executive brief.

This repository contains the complete design of that system **before implementation**. No production code
is included by design. Every document here is written to be executable by an engineering team without
further discovery.

> **Version 2.0 exists.** This set is Sidra OS **1.0 "Atrium"** and remains the source of truth for
> everything it covers. The enterprise extension — Divisions, twenty-one Departments, Offices, Department
> Packs, Standards, Guards, Registries, the Game Studio, and the migration plan — is in
> [`/docs-v2`](../docs-v2/README.md). It extends these 55 documents; it does not replace them. Ten specific
> claims here are superseded and each is listed with its ADR in `/docs-v2/00-overview/01-v1-review.md` §4.

---

## Reading order

New readers should read in this order. Each document assumes the ones above it.

| # | Document | What it settles |
|---|---|---|
| 1 | [00-vision/01-vision.md](00-vision/01-vision.md) | Why this exists and what it is not |
| 2 | [00-vision/02-principles.md](00-vision/02-principles.md) | The ten laws every later decision defers to |
| 3 | [00-vision/03-glossary.md](00-vision/03-glossary.md) | Canonical vocabulary — used verbatim in code and UI |
| 4 | [01-product/01-prd.md](01-product/01-prd.md) | Scope, requirements, acceptance criteria for v1.0 |
| 5 | [01-product/02-personas-and-jobs.md](01-product/02-personas-and-jobs.md) | The single user, and the jobs he hires the system for |
| 6 | [01-product/03-user-journeys.md](01-product/03-user-journeys.md) | Nine end-to-end flows, frame by frame |
| 7 | [02-architecture/01-technical-architecture.md](02-architecture/01-technical-architecture.md) | Stack, processes, boundaries |
| 8 | [02-architecture/02-system-design.md](02-architecture/02-system-design.md) | Kernel, event bus, scheduler, failure model |
| 9 | [02-architecture/03-folder-structure.md](02-architecture/03-folder-structure.md) | Repository and user-data layout |
| 10 | [02-architecture/04-database-design.md](02-architecture/04-database-design.md) | Full schema, indices, migrations |
| 11 | [02-architecture/05-api-design.md](02-architecture/05-api-design.md) | Internal command/query surface and future HTTP API |
| 12 | [02-architecture/06-ai-routing-strategy.md](02-architecture/06-ai-routing-strategy.md) | Model classes, budgets, escalation, fallback |
| 13 | [02-architecture/07-security-model.md](02-architecture/07-security-model.md) | Threat model, capabilities, sandboxing, audit |
| 14 | [02-architecture/08-plugin-system.md](02-architecture/08-plugin-system.md) | Extension model and manifest |
| 15 | [02-architecture/09-scalability.md](02-architecture/09-scalability.md) | The path from one user to an enterprise tenant |
| 16 | [03-agents/01-agent-architecture.md](03-agents/01-agent-architecture.md) | What an agent is, mechanically |
| 17 | [03-agents/02-org-chart.md](03-agents/02-org-chart.md) | Departments, reporting lines, escalation |
| 18 | [03-agents/03-employee-specs.md](03-agents/03-employee-specs.md) | All eleven staff specifications in full |
| 19 | [03-agents/04-ceo-protocol.md](03-agents/04-ceo-protocol.md) | The executive loop, in detail |
| 20 | [03-agents/05-memory-architecture.md](03-agents/05-memory-architecture.md) | Five memory layers, retrieval, consolidation |
| 21 | [03-agents/06-communication-protocol.md](03-agents/06-communication-protocol.md) | Message envelope, work orders, contracts |
| 22 | [04-engines/01-workflow-engine.md](04-engines/01-workflow-engine.md) | Durable execution of multi-agent plans |
| 23 | [04-engines/02-meeting-engine.md](04-engines/02-meeting-engine.md) | Structured multi-agent deliberation |
| 24 | [04-engines/03-decision-engine.md](04-engines/03-decision-engine.md) | How choices are made, recorded, revisited |
| 25 | [04-engines/04-automation-engine.md](04-engines/04-automation-engine.md) | Triggers, schedules, the Night Shift |
| 26 | [04-engines/05-knowledge-base.md](04-engines/05-knowledge-base.md) | Ingestion, chunking, canon, contradiction |
| 27 | [04-engines/06-notification-system.md](04-engines/06-notification-system.md) | Attention budget and interruption policy |
| 28 | [04-engines/07-logging-observability.md](04-engines/07-logging-observability.md) | Traces, costs, the audit chain |
| 29 | [04-engines/08-file-management.md](04-engines/08-file-management.md) | The Vault, artifacts, versioning |
| 30 | [05-experience/01-ux-guidelines.md](05-experience/01-ux-guidelines.md) | Interaction laws |
| 31 | [05-experience/02-design-system.md](05-experience/02-design-system.md) | Night Atrium: tokens, type, glass, motion |
| 32 | [05-experience/03-component-library.md](05-experience/03-component-library.md) | 48 components with props and states |
| 33 | [05-experience/04-desktop-navigation.md](05-experience/04-desktop-navigation.md) | Shell, panels, rooms, dock |
| 34 | [05-experience/05-command-palette-and-search.md](05-experience/05-command-palette-and-search.md) | ⌘K and Search Everywhere |
| 35 | [05-experience/06-keyboard-shortcuts.md](05-experience/06-keyboard-shortcuts.md) | Full keymap |
| 36 | [05-experience/07-settings-and-preferences.md](05-experience/07-settings-and-preferences.md) | Every setting, default, and rationale |
| 37 | [06-implementation/01-implementation-plan.md](06-implementation/01-implementation-plan.md) | Ten milestones to 1.0 |
| 38 | [06-implementation/02-testing-and-quality.md](06-implementation/02-testing-and-quality.md) | How correctness is proven |
| 39 | [06-implementation/03-roadmap.md](06-implementation/03-roadmap.md) | 1.0 → 4.0 |
| 40 | [06-implementation/adr/](06-implementation/adr/) | Architecture decision records 0001–0011 |

## Status

| Field | Value |
|---|---|
| Document set version | 1.0 (design-complete) |
| Target release | Sidra OS 1.0 "Atrium" |
| Scope | Single user, single machine, local-first |
| Implementation | Not started, by intent |

## How to use this set

- **Ambiguity rule.** If two documents conflict, the one earlier in the reading order wins, except that
  `03-glossary.md` always wins on naming.
- **Change rule.** A material change to architecture requires a new ADR in `06-implementation/adr/`.
  Documents are amended, never silently rewritten.
- **Definition of done for design.** Every requirement in the PRD traces to a component in the
  architecture, a table in the schema, a screen in the experience docs, and a milestone in the plan.
