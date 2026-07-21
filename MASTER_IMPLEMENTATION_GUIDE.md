# Sidra OS — Master Implementation Guide

**The single entry point for anyone building this system.** Everything else is reference; this is the
document you read first and return to when you are unsure what to do next.

| | |
|---|---|
| Covers | Sidra OS 1.0 "Atrium" (`/docs`, 52 documents) and 2.0 "Concourse" (`/docs-v2`, 29 documents) |
| Audience | The engineering team building it, and whoever is accountable for it shipping |
| Status | No implementation has begun. That is correct and deliberate. |
| Total design surface | 83 documents, ~92,000 words |

---

## 1. What this guide is for

Eighty-three documents is more than anyone will read before their first commit. Without a routing layer, the
predictable outcome is that an engineer reads four documents, builds from memory and instinct, and quietly
violates an invariant that was decided carefully in a document they never opened.

This guide does four things and nothing else:

1. States the **non-negotiables** — the short list that must be memorised, not looked up.
2. Gives the **build order**, M1 through M14, with the authoritative document for each.
3. Provides a **question → document** routing table, so any question has one place to go.
4. Names the **failure modes** with the signal that shows each one is happening.

It contains no new design. Where it appears to disagree with a source document, the source document wins and
this guide has a bug.

## 2. The two document sets

| Set | Path | Covers | Precedence |
|---|---|---|---|
| **Version 1.0 "Atrium"** | `/docs` | The system: kernel, security, memory, agents, engines, experience, M1–M10 | **Authoritative for everything it covers** |
| **Version 2.0 "Concourse"** | `/docs-v2` | Enterprise structure: Divisions, Departments, Offices, Packs, Standards, Guards, Registries, the Game Studio, M11–M14 | Authoritative only for what v1 does not cover, plus ten explicitly superseded claims |

**The precedence rule, stated once and enforced everywhere:** if a v2 document appears to contradict a v1
document, the v1 document is correct and the v2 document is a defect to be reported. The only exceptions are
the ten claims listed in `/docs-v2/00-overview/01-v1-review.md` §4, each of which carries an ADR.

**Twenty-one ADRs** span both sets: 0001–0011 in `/docs/06-implementation/adr/`, 0012–0021 in
`/docs-v2/adr/`. All twenty-one are accepted and none is superseded. Read the two indexes before writing
anything; each ADR is one page and between them they explain most of the decisions that will otherwise look
arbitrary.

## 3. Non-negotiables

The card an engineer keeps in their head. Every item traces to a Principle or an ADR. Violating any of them
is not a trade-off to be discussed in review — it is a defect.

**Correctness**

1. The **event log is the source of truth**. Tables are projections and are rebuildable from the log. Never
   write state that is not derived from an event. *(ADR-0002)*
2. The log is **hash-chained and append-only**. Nothing is edited. Nothing is deleted. Corrections are new
   events. *(ADR-0002, Principle 3)*
3. **Migrations are forward-only and idempotent.** Every schema change after M5 needs an ADR and a rehearsed
   migration including a downgrade story.
4. **Every effectful path has a test proving its log entry exists.** The audit trail is a tested feature, not
   an assumed side effect.

**Security**

5. The **Permission Broker is the only choke point**. No component checks its own permissions. Isolation
   enforced by a participant is not isolation.
6. **Default deny.** Capabilities are granted explicitly, narrowly, and revocably. Plugins get no ambient
   filesystem, clock, network, or randomness. *(ADR-0006)*
7. **The executive holds five tools**: retrieve, delegate, convene, decide, report. This extends to every
   Division executive. *(ADR-0004)*
8. **Installation never grants authority.** Acquire, install, and grant are three separate logged acts.
   *(`/docs-v2/01-enterprise/05-marketplace-and-packs.md` §2)*

**Organisation**

9. **The author never reviews their own work.** No mode, no setting, no performance optimisation may relax
   this. Review Intensity changes *how much* review, never *whether*. *(ADR-0008, ADR-0018)*
10. **A department is a boundary, not a label** — separate memory namespace, capability ceiling, budget
    sub-ceiling, filesystem scope, and Exchange-only communication. *(Principle 11, ADR-0013)*
11. **Cross-department requests name contracts, never departments.** *(ADR-0013)*
12. **The kernel contains no department-specific logic.** No `if department == "..."`. Enforced by a CI grep.

**Product**

13. **One Brief, one ask, ≤600 words**, regardless of whether three agents or forty contributed.
    *(Principle 1)*
14. **Five things may interrupt.** The notification budget does not scale with the organisation.
15. **Prompts and charters are data**, versioned, with an evaluation set attached. A charter change that
    regresses its evaluation set does not merge.
16. **Performance budgets are CI gates from M1**: cold start ≤1.2 s, 60 fps, idle ≤400 MB. If a budget is
    exceeded, do less work — do not raise the number.

## 4. Before you write any code

In order. This is roughly a week for a new engineer and it is not optional.

| Step | Read | Why |
|---|---|---|
| 1 | `/docs/00-vision/02-principles.md` | Ten principles, conflict rule is lower-number-wins. Everything else is downstream. |
| 2 | `/docs/00-vision/03-glossary.md` | Directive, Mandate, Work Order, Deliverable, Brief, Engagement, Fence, Canon, Turn, Vault. Using these words loosely is how designs drift. |
| 3 | `/docs/06-implementation/adr/README.md` + all 11 ADRs | One page each. Explains most of what will otherwise look arbitrary. |
| 4 | `/docs/02-architecture/01-technical-architecture.md` | The crate map. Where things live and why. |
| 5 | `/docs/02-architecture/03-folder-structure.md` | The seven directories and the dependency-direction rule. |
| 6 | `/docs/06-implementation/01-implementation-plan.md` | M1–M10 and their exit criteria. |
| 7 | `/docs-v2/00-overview/01-v1-review.md` | What v2 changes and, more importantly, the 38 things it does not. |
| 8 | `/docs-v2/adr/README.md` + ADRs 0012–0021 | The enterprise decisions. |

**Then**: read the document for the milestone you are working on, in full, before your first commit on it.

## 5. Build order

Fourteen milestones. **1.0 ships at the end of M10 and is a complete product.** M11–M14 are the enterprise
release and begin only after 1.0 is in daily use.

### The sequencing principle

**Storage → security → orchestration → agents → engines → surface → hardening.** Then, and only then,
structure.

The parts that are impossible to retrofit are the event log, the capability broker, and the memory schema.
The parts that are cheap to change late are prompts, personalities, and visual polish. **The demo is ugly
until M7 and that is correct.** An engineer who reorders this to get a demo sooner is trading a week of
comfort for a year of migration.

### Milestones 1–10 · Version 1.0 "Atrium"

| M | Name | Exit criterion (abbreviated) | Authoritative documents |
|---|---|---|---|
| **M1** | Shell and skeleton | Launches on three platforms, empty Lobby, CI produces signed installers on every push | `02-architecture/03`, ADR-0001, ADR-0011 |
| **M2** | Vault and event log | 10,000 events, `kill -9` mid-write, relaunch, chain verifies, all projections rebuild | `02-architecture/04`, ADR-0002, ADR-0003 |
| **M3** | Security kernel | A deliberately malicious tool fails every escape attempt and every attempt is logged | `02-architecture/07`, ADR-0006 |
| **M4** | Model gateway and routing | 500 calls across five classes inside a $2 ceiling, no ceiling breach, no silent downgrade | `02-architecture/06`, ADR-0005 |
| **M5** | Memory | 200 hand-labelled pairs; hybrid retrieval beats both single methods | `03-agents/05`, ADR-0007 |
| **M6** | Orchestrator and first three agents | A substantive Directive produces a real Brief end to end | `03-agents/01`, `03-agents/04`, ADR-0010 |
| **M7** | Full Firm and the engines | A week of unattended daily use by the team building it | `04-engines/*`, `03-agents/03` |
| **M8** | The building | Cold start ≤1.2 s, sustained 60 fps, idle ≤400 MB | `05-experience/*` |
| **M9** | Plugins | An external developer ships a working tool plugin in under a day from the spec alone | `02-architecture/08`, ADR-0006 |
| **M10** | Hardening and 1.0 | Thirty days dogfooding, zero data loss, zero unlogged effects | `06-implementation/02` |

### Milestones 11–14 · Version 2.0 "Concourse"

| M | Name | Exit criterion | Authoritative documents |
|---|---|---|---|
| **M11** | Department substrate | **The replay equivalence test is green.** The Firm runs as one implicit department with byte-identical behaviour. Nothing visible to the Principal. | `/docs-v2/01-enterprise/03-department-architecture.md`, `/docs-v2/04-migration/02-implementation-changes.md`, ADRs 0013, 0016, 0020 |
| **M12** | Structure | Eight Divisions, four Offices, Rail shows Divisions, vetoes work firm-wide | `/docs-v2/02-organization/*`, ADRs 0012, 0015 |
| **M13** | Departments | Three departments installed from Packs, one Exchange request end to end | `/docs-v2/01-enterprise/04-department-catalog.md`, ADRs 0014, 0017 |
| **M14** | Game Studio and Marketplace | The nine-item acceptance list, including uninstall-leaves-Firm-working | `/docs-v2/03-game-studio/*`, ADRs 0018, 0019 |

### Critical path

```
M1 ─▶ M2 ─▶ M3 ─▶ M4 ─▶ M6 ─▶ M7 ─▶ M8 ─▶ M10 ═▶ 1.0 ships
            │      │     ▲       │     ▲
            └▶ M5 ─┴─────┘       └─ M9 ┘
                                              │
                                              ▼
                            M11 ─▶ M12 ─▶ M13 ─▶ M14 ═▶ 2.0 ships
                             │
                    replay test green — gates everything after it
```

M5 runs parallel with M4 once M3 lands: retrieval needs the gateway's interface, not its implementation.
M9 starts after M7 and lands before M10, so its capability surface is inside the second security review.

**M11 gates M12–M14 absolutely.** Building M12's visible structure before M11's invisible substrate means
shipping an interface change before the equivalence test exists to prove nothing else moved — which is the
single ordering mistake that converts this migration into a rewrite.

## 6. Definition of Done

**For a pull request:**

- [ ] The invariant list in §3 is not violated. If it is, the PR is closed, not debated.
- [ ] Every effectful path has a test asserting its log entry.
- [ ] No file exceeds 400 lines without a justification comment on line 1.
- [ ] Dependency direction holds: `packages/domain ← services/* ← apps/*`.
- [ ] `packages/bindings` was not hand-edited.
- [ ] Performance gates pass; a regression names the number that regressed.
- [ ] If a charter or archetype changed, its evaluation set is green.
- [ ] If a boundary, invariant, or Principal-facing behaviour changed, an ADR is in the same PR.

**For a milestone:**

- [ ] The exit criterion demonstrated live or in a recording, **to someone who does not trust you**.
- [ ] "Substantially done" is not a state and is not accepted.
- [ ] Documents that drifted from what was built are updated in the same milestone, not later.

## 7. CI gates, live from M1

Not a hardening phase. These run on the first commit.

| Gate | Fails when |
|---|---|
| Build | Any platform fails, or an installer is unsigned |
| Dependency direction | Any edge against `packages/domain ← services/* ← apps/*` |
| Generated bindings | `packages/bindings` was hand-edited |
| Domain purity | `packages/domain` gained an I/O dependency (`cargo-deny`) |
| Kernel neutrality | Any kernel crate contains a department identifier *(from M11)* |
| Performance | Cold start > 1.2 s, frame budget missed, idle > 400 MB |
| Audit coverage | An effectful path exists with no log-entry assertion |
| Evaluation sets | A charter or archetype change regresses its evals |
| Chaos | Process killed at a state transition and recovery fails |
| Replay equivalence | A recorded v1 Engagement produces a different Brief *(from M11)* |
| Pack validation | Any Pack in the repo fails the twelve install checks *(from M13)* |
| Guard corpus | A Guard has no input it must block *(from M13)* |

## 8. When you need an ADR

Write one — before the code, in the same PR — if the change touches any of:

- a **boundary** (crate responsibility, capability scope, department isolation, layer coupling)
- an **invariant** (§3, or anything in `06-implementation/02-testing-and-quality.md`)
- a **Principal-facing behaviour** (what they see, approve, or are interrupted by)
- a **schema** after M5
- a **default** that ships (settings, budgets, Fence profiles, Pack defaults)
- **the org chart** — adding, removing, or restructuring a Division, Office, or Department is itself a
  Decision under Principle 14

Format: Context → Options → Decision → Consequences. **Consequences are split into accepted, gained, and
reversal cost.** An ADR listing only benefits is a marketing document and will be sent back.

Number sequentially from 0022. Never renumber. Never delete — supersede.

## 9. Question → document

The routing table. One place for every question.

| Question | Document |
|---|---|
| What are we building and why? | `/docs/00-vision/01-vision.md` |
| Which rule wins this argument? | `/docs/00-vision/02-principles.md` (lower number wins) |
| What does this word mean exactly? | `/docs/00-vision/03-glossary.md` + `/docs-v2/00-overview/02-v2-principles.md` §4 |
| Is this a requirement or my idea? | `/docs/01-product/01-prd.md` |
| Which crate does this belong in? | `/docs/02-architecture/01-technical-architecture.md` |
| Where does this file go? | `/docs/02-architecture/03-folder-structure.md` |
| How do I store this? | `/docs/02-architecture/04-database-design.md` |
| What is the command/query surface? | `/docs/02-architecture/05-api-design.md` |
| Which model should this use? | `/docs/02-architecture/06-ai-routing-strategy.md` |
| Am I allowed to do this? | `/docs/02-architecture/07-security-model.md` |
| How do I extend the system? | `/docs/02-architecture/08-plugin-system.md` |
| Will this survive growth? | `/docs/02-architecture/09-scalability.md` |
| How does an agent actually run? | `/docs/03-agents/01-agent-architecture.md` |
| Who reports to whom? | `/docs/03-agents/02-org-chart.md` → `/docs-v2/02-organization/01-org-chart-v2.md` |
| What is this agent's charter? | `/docs/03-agents/03-employee-specs.md` |
| How does Kai decide? | `/docs/03-agents/04-ceo-protocol.md` |
| How does memory work? | `/docs/03-agents/05-memory-architecture.md` |
| How do agents talk? | `/docs/03-agents/06-communication-protocol.md` (12 kinds → 14, ADR-0016) |
| How do workflows run? | `/docs/04-engines/01-workflow-engine.md` |
| How are decisions recorded? | `/docs/04-engines/03-decision-engine.md` |
| When may we interrupt? | `/docs/04-engines/06-notification-system.md` |
| What does this look like? | `/docs/05-experience/02-design-system.md`, `03-component-library.md` |
| How does navigation work? | `/docs/05-experience/04-desktop-navigation.md` |
| What am I building next? | `/docs/06-implementation/01-implementation-plan.md` |
| How do I test this? | `/docs/06-implementation/02-testing-and-quality.md` |
| When does this ship? | `/docs/06-implementation/03-roadmap.md` → `/docs-v2/04-migration/03-roadmap-changes.md` |
| **What changed in v2?** | `/docs-v2/00-overview/01-v1-review.md` |
| What is a Department, mechanically? | `/docs-v2/01-enterprise/03-department-architecture.md` |
| Which departments exist? | `/docs-v2/01-enterprise/04-department-catalog.md` |
| Can this layer be replaced? | `/docs-v2/01-enterprise/02-layer-model.md` §9 |
| How does a Pack get distributed? | `/docs-v2/01-enterprise/05-marketplace-and-packs.md` |
| Who holds which veto? | `/docs-v2/02-organization/01-org-chart-v2.md` §3 |
| Archetype or instance? | `/docs-v2/02-organization/02-agent-architecture-v2.md` §1 |
| What is in the game repo? | `/docs-v2/03-game-studio/01-repository-analysis.md` |
| How do we import it? | `/docs-v2/03-game-studio/03-integration-plan.md` |
| How do we get from v1 to v2? | `/docs-v2/04-migration/01-migration-strategy.md` |
| What breaks? | `/docs-v2/05-risk/01-risk-analysis.md` |
| **Why was this decided?** | The 21 ADRs. Check both indexes before asking a person. |

## 10. How this project fails

Each failure mode with the signal that shows it is happening. These are ordered by likelihood, not severity.

**1. The demo pressure reorder.** Someone builds agents before the event log because a working demo is more
motivating than a durable log. *Signal:* a working Directive before M2's exit criterion is demonstrated.
*Response:* stop. Retrofitting the log after real data exists is the most expensive mistake available in this
project.

**2. The convenient exception.** A department reads another's memory "just for context". An executive calls a
tool directly because the Exchange is slow. *Signal:* any PR whose description contains "just" or "for now"
next to a boundary. *Response:* boundaries erode one reasonable exception at a time — this is why isolation
is property-tested (I-12 to I-17) rather than reviewed.

**3. Ceremonial review.** Offices approve everything. Guards warn instead of block. *Signal:* Office approval
rate above 95%. *Response:* that is a defect in the Office, and it is the metric most likely to be dropped
during implementation as "not a real requirement". It is a real requirement.

**4. The organisation becomes the product.** Four hops, three reviews, five Guards, nine minutes for a Brief
v1 produced in ninety seconds. *Signal:* median Directive-to-Brief latency or Principal-facing token count
regressing against the v1 baseline. *Response:* both are release blockers. This is R-01 and it is the
defining risk of 2.0.

**5. Structure without evidence.** All twenty-one departments installed for a company shipping two products.
*Signal:* a department whose Work Orders a neighbour could absorb with no measured quality drop.
*Response:* Principle 13, enforced at the quarterly Structure Review.

**6. Charter sprawl.** Two hundred hand-written charters that drift apart. *Signal:* copy-pasted archetype
text across departments. *Response:* that is what archetypes are for (ADR-0014).

**7. Standards as decoration.** Rules nobody checks. *Signal:* a Standard shipped with no Guard.
*Response:* every Standard must have a Guard or it does not ship (ADR-0016).

**8. Silent structural change.** The org chart edited outside the event log. *Signal:* any admin path that
changes the Firm's shape without producing a Decision. *Response:* Principle 14 — there is no meta-layer.

## 11. Team shape

The dependency graph, not a staffing recommendation. Adjust headcount; do not adjust the parallelism.

| Track | Milestones | Can run parallel with |
|---|---|---|
| Kernel and storage | M2, M3, M11 | — (everything depends on it) |
| Models and memory | M4, M5 | Each other, after M3 |
| Orchestration and agents | M6, M7, M12 | — |
| Experience | M1, M8, and UI slices of M12–M13 | Most things, from M1 |
| Extensibility | M9, M13, M14 | After M7 |

**Two rules about people, not code:**

1. **The team uses it daily from M6.** A product about delegation cannot be evaluated by people who have
   never delegated anything to it. This is not dogfooding as a virtue signal — it is the only instrument that
   detects failure mode 4 before a release.
2. **Whoever writes an ADR does not approve it.** Principle 5 applies to the humans building the system, not
   only to the agents inside it.

## 12. The permanent nos

Not scope for a later version. Never.

- **No chatbot mode.** The fast lane covers the case; a mode toggle lets the product's centre of gravity
  drift back to the thing everyone else already makes.
- **No telemetry.** Not anonymous, not aggregate, not opt-in. *(ADR-0009)*
- **No marketplace artifact that arrives with autonomy.** Installation grants nothing.
- **No autonomous financial transactions.** Class-3 effects that move money stay behind a human signature
  permanently, regardless of how good the models become. The Finance department's effect ceiling is 1, in a
  manifest, not in a promise.
- **No engagement mechanics.** No streaks, no gamification, no notification designed to pull the Principal
  back. Principle 1 says their attention is the scarcest resource; a product that spends it to raise its own
  usage numbers is lying about what it is for.
- **No automated decision about a named human being.** Every HR Deliverable concerning an individual is
  advisory and requires a human decision on the record.

## 13. If you read only one page

Build the substrate before the intelligence. The event log is the source of truth and it is append-only. The
Permission Broker is the only place permissions are checked. The author never reviews their own work. A
department is a boundary or it is nothing. One Brief, one ask, under 600 words, no matter how large the Firm
gets.

Everything else in eighty-three documents is those five sentences, worked out in detail.
