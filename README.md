# Sidra OS

> The internal operating system of Sidra Systems — a local-first desktop application that runs an
> organisation of AI staff on behalf of its Principal.

You state intent. An executive agent forms strategy, delegates to specialist departments, supervises the
work, reviews it independently, and returns **one accountable Brief with one ask**. Not a chat window with
personas — an organisation with boundaries, budgets, memory, and an audit trail you can check.

**This repository contains the complete design of that system, and the beginning of its implementation.**
Every design document is written to be executable by an engineering team without further discovery.
Implementation began with milestone M10 (Mission Engine) and is at task T1.1.

---

## Start here

**[MASTER_IMPLEMENTATION_GUIDE.md](MASTER_IMPLEMENTATION_GUIDE.md)** — read this first, whoever you are.

**[MILESTONE_REGISTRY.md](MILESTONE_REGISTRY.md)** — what every milestone number means, M1 to M30.
Authoritative where any other document disagrees.

It carries the non-negotiable invariants, the build order M1 through M14, a question-to-document routing
table for all 83 documents, and the named failure modes with the signal that detects each one. It contains
no new design; it routes.

## The two document sets

| Set | Path | Contents | Precedence |
|---|---|---|---|
| **1.0 "Atrium"** | **[/docs](docs/README.md)** | The system: vision, product, architecture, agents, engines, experience, implementation, ADRs 0001–0011 | **Authoritative for everything it covers** |
| **2.0 "Concourse"** | **[/docs-v2](docs-v2/README.md)** | The enterprise extension: Divisions, 21 Departments, Offices, Department Packs, Standards, Guards, Registries, the Game Studio, migration, ADRs 0012–0021 | Authoritative only for what v1 does not cover, plus ten explicitly superseded claims |

**The precedence rule.** If a v2 document appears to contradict a v1 document, the v1 document is correct and
the v2 document is a defect. The ten exceptions are listed with their ADRs in
[`/docs-v2/00-overview/01-v1-review.md`](docs-v2/00-overview/01-v1-review.md) §4.

v2 does not replace v1. It extends it. Of the v1 documents, 38 are unchanged, 17 are extended, and ten
specific claims are superseded — each with a decision record.

## Repository layout

```
sidra-os/
├── README.md                        this file
├── MASTER_IMPLEMENTATION_GUIDE.md   the entry point for building it
├── docs/                            Version 1.0 "Atrium"
│   ├── 00-vision/                   vision, ten principles, glossary
│   ├── 01-product/                  PRD, personas, journeys
│   ├── 02-architecture/             kernel, storage, security, routing, plugins, scale
│   ├── 03-agents/                   agent architecture, org chart, charters, memory, protocol
│   ├── 04-engines/                  workflow, meeting, decision, automation, knowledge, notification
│   ├── 05-experience/               Night Atrium: UX laws, design system, components, navigation
│   └── 06-implementation/           plan M1–M10, testing, roadmap, ADRs 0001–0011
├── docs-v2/                         Version 2.0 "Concourse"
│   ├── 00-overview/                 v1 review, v2 principles
│   ├── 01-enterprise/               enterprise architecture, layers, departments, catalog, marketplace
│   ├── 02-organization/             org chart, agent architecture, executive cabinet
│   ├── 03-game-studio/              repository analysis, department, integration plan
│   ├── 03-Intelligence/             Mission Engine architecture & implementation plan
│   ├── 04-migration/                migration strategy, implementation changes, roadmap changes
│   ├── 05-risk/                     risk analysis
│   └── adr/                         ADRs 0012–0021, 0031–0033
├── MILESTONE_REGISTRY.md            M1–M30 — authoritative milestone definitions
│
├── Cargo.toml                       Rust workspace (ADR-0011)
├── services/
│   └── mission/                     crate sidra-mission — the Mission Engine
└── infrastructure/
    └── ci/                          automated checks; workflows call these
```

## What this is

**Not a chatbot.** The Principal delegates work and receives one Brief. There is no conversation mode,
because a mode toggle lets the product's centre of gravity drift back to the thing everyone else makes.

**Local-first and sovereign.** One encrypted directory the Principal owns, readable without this application.
Every Brief, Decision, and set of Minutes is also written as plain Markdown, so the archive outlives the
software.

**Legible by construction.** A hash-chained event log is the source of truth; every table is a projection of
it. Every claim the Firm makes is checkable, and every effect it has is recorded.

**Bounded.** Capability-based default-deny permissions, hard Fences, nested budget ceilings, and an executive
that holds exactly five tools regardless of how large the organisation grows.

## The ten principles

Lower number wins every conflict.

1. The Principal's attention is the scarcest resource.
2. Delegation over prompting.
3. Nothing important is ephemeral.
4. Legibility is a feature.
5. Separation of powers — the author never reviews their own work.
6. Bounded autonomy, hard fences.
7. Local-first, sovereign data.
8. Determinism where possible.
9. Honest uncertainty.
10. The building must feel real.

Four more are added at v2 and lose every conflict against these ten by construction. Full text in
[`/docs/00-vision/02-principles.md`](docs/00-vision/02-principles.md).

## Status

| | |
|---|---|
| Design | Complete for 1.0 and 2.0 |
| Implementation | **Begun.** M15 (Mission Engine), Epic E1, tasks T1.1–T1.3 of 113 |
| Design documents | 89 markdown files — 52 in `/docs`, 33 in `/docs-v2`, plus this file, the guide, the registry, and the Mission Engine architecture |
| Decision records | 33 decision records |
| Target | 1.0 "Atrium" → 2.0 "Concourse" → 3.0 "Chambers" → 4.0 "Continuum" |

## The permanent nos

Not scope for a later version. Never.

- No chatbot mode.
- No telemetry — not anonymous, not aggregate, not opt-in.
- No marketplace artifact that arrives with autonomy it was not deliberately granted.
- No autonomous financial transactions. Class-3 effects that move money stay behind a human signature.
- No engagement mechanics — no streaks, no gamification, no notification designed to pull the Principal back.
- No automated decision about a named human being.

## Attribution

The Game Development Department is founded on
[Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) (MIT), compiled into a
Department Pack rather than embedded. Analysis, mapping, and licence obligations are in
[`/docs-v2/03-game-studio/`](docs-v2/03-game-studio/01-repository-analysis.md).
