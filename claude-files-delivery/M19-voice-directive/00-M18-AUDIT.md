# M18 Audit — gate before M19

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the dependency milestone is
in a state that lets M19 proceed, and report any gap honestly. This audit gates M19 (Voice Directive).

| | |
|---|---|
| Milestone audited | M18 — Companion |
| Registry status | **Defined** (purpose, dependency, and exit criterion fixed in `/MILESTONE_REGISTRY.md` §4; architecture not yet written) · Open |
| M19's stated dependencies | **M18** (Companion) and **M6** (Orchestrator + Directive→Mandate) — `/MILESTONE_REGISTRY.md` §4 |
| Audit verdict | **Proceed with M19 architecture. M18's Defined-not-Documented status gates only the Companion voice surface (E5), not the milestone's exit criterion, which is demonstrable on desktop against M6 (Documented).** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `/docs/04-ceo-protocol.md`, `/docs/01-technical-architecture.md` §5, `/docs/01-agent-architecture.md` |

---

## 1. The honest state of the dependency

The M16 audit gated on M15, which was **Documented**. This gate is different and the difference must be stated
plainly: **M18 is `Defined`, not `Documented`.** Per `/MILESTONE_REGISTRY.md` §4, a Defined milestone has its
purpose, dependency, and exit criterion fixed but no architecture document or implementation plan yet. So M18
is *not* architecturally complete, and a naive "is the previous milestone done?" gate would block.

It does not block, for a specific and load-bearing reason: **M19 has two dependencies, and only one of them is
M18.**

| M19 dependency | Milestone status | What M19 needs from it | Gates what |
|---|---|---|---|
| **M6 — Orchestrator + Directive→Mandate** | **Documented** (`/MILESTONE_REGISTRY.md` §4; `/MASTER_IMPLEMENTATION_GUIDE.md` §5) | the existing `engagement.create` intake, the Engagement lifecycle, the classify+mandate Turn — everything voice feeds | the **entire exit criterion** (same Mandate as typed; audio never leaves) — fully demonstrable on **desktop** |
| **M18 — Companion** | **Defined** | a mobile composer + kernel channel for the mobile voice surface | **only** the Companion voice surface (epic E5, task T5.*) |

M19's mandatory dependency — the one the exit criterion rests on — is **M6**, which is Documented and whose
Directive→Mandate pipeline is the substrate voice attaches to (`/docs/04-ceo-protocol.md` Phases 1–2;
`/docs/01-technical-architecture.md` §5). M18 is a dependency **only** for the second surface (mobile). The
exit criterion — "a spoken Directive produces the same Mandate as the typed equivalent; audio never leaves the
device" — is proven on the desktop surface, which needs no part of M18.

## 2. Checklist result

Against the artifacts M19 actually consumes:

| Required substrate | Present | Location / status |
|---|---|---|
| Directive intake (`engagement.create`) | ✅ | `/docs/01-technical-architecture.md` §5; M6 Documented |
| Directive→Mandate pipeline (classify+mandate) | ✅ | `/docs/04-ceo-protocol.md` Phases 1–2; `/docs/01-agent-architecture.md`; M6 Documented |
| `directives` schema (to extend additively) | ✅ | `/docs/04-database-design.md` §2 |
| Context Frame assembly (for the exclusion invariant) | ✅ | `/docs/01-technical-architecture.md` §5; memory doc §5 |
| Local on-device model pattern (ONNX, `bge-small`) | ✅ | `/docs/01-technical-architecture.md` §2 |
| Renderer boundary + streamed-text posture | ✅ | `/docs/01-technical-architecture.md` §4, §8 |
| No-telemetry / local-only guarantee | ✅ | ADR-0009; `/docs/07-security-model.md` §10 |
| Hash-chained event log | ✅ | ADR-0002; `/docs/04-database-design.md` §4 |
| **Companion composer + kernel channel (mobile)** | ⏳ | M18 **Defined**, not yet Documented — gates **E5 only** |

Every substrate the exit criterion depends on is present and Documented. The one item that is not — the
Companion surface — gates a single, isolated epic (E5), which is explicitly marked "gated on M18" in the plan.

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if a dependency's status appears to block, state it honestly and continue where it is
safe to":

1. **M18 is Defined, not Documented.** This is a real gap, but a scoped one. It is handled by structuring M19
   so the **desktop surface leads and is independently shippable against M6**, and the **Companion surface
   (E5)** is gated on M18's completion. This is the same discipline the registry uses (2.5 milestones are
   sequenced by real dependency, `/MILESTONE_REGISTRY.md` §4–§5), applied within a milestone: build the part
   whose substrate exists, gate the part whose substrate does not.
2. **M17 (Connector Suite) is also Defined and Open.** M19 does not depend on M17 — voice is an input method,
   not an integration, and holds no `net.*` capability. No gap.
3. **The Companion's exact composer/kernel-channel contract is pending M18's architecture.** M19's E5 is
   specified against M18's *registry* definition (a mobile surface that reads Briefs and acts on Approval
   Requests over an existing kernel channel). When M18 is Documented, E5's task files bind to the real
   contract; nothing in E1–E4 or the exit criterion depends on it. **Not a blocker for the M19 architecture or
   its exit criterion.**

## 4. Gate decision

The M19 architecture is safe to write, and its **exit criterion is safe to demonstrate**, against M6 alone. No
M6, M2, M3, or database-design architecture is modified by the M19 package; M19 extends the Directive intake
those milestones already provide, which is the correct dependency direction. **Proceed to M19 (Voice
Directive)**, with the Companion voice surface (E5) gated on M18 reaching Documented + implemented.

> Integration note for AntiGravity: when M18 is Documented, revisit E5's task files (T5.*) to bind them to the
> Companion's real composer and kernel-channel contract, and run the AC10 slice (T6.10). Until then, ship and
> demonstrate the desktop surface, which carries the full exit criterion.
</content>
