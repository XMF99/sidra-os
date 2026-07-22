# M20 Architecture Audit — gate before M21

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is in a
state that does not block it, and report any gap. This audit gates M21 (Seats and Identity), the first
milestone of 3.0 "Chambers".

| | |
|---|---|
| Milestone audited | M20 — Executable Artifacts (the milestone immediately preceding M21) |
| Registry status | **Defined** (not yet Documented) · implementation not started |
| Audit verdict | **No gap blocks M21.** M21's structural dependencies (M2 chain, ADR-0021) are complete; M21 does not depend on M20. |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md`, `/docs/04-database-design.md`, `/docs/07-security-model.md` |

---

## 1. The dependency question, stated honestly

The workflow gates each milestone on the completeness of the one before it. M20 (Executable Artifacts) is the
milestone immediately preceding M21 in the sequence, but **M20 is only Defined, not Documented** — as are M17,
M18, and M19 (`/MILESTONE_REGISTRY.md` §Status: "M1–M16 documented · M17–M30 defined, not yet documented"). So
the honest STEP-1 question is not "is M20's architecture complete?" (it is not written yet) but "**does M21
depend on M20, such that M20's absence blocks it?**"

It does not. Per the registry (§4), **M21 depends on M2 (the event chain) and ADR-0021** — nothing else. M21
realizes a decision taken in 2.0 and rests entirely on substrate that shipped in 1.0/2.0:

| M21 dependency | Status | Evidence |
|---|---|---|
| M2 — event log & hash chain, `events.actor` | **Complete** (1.0) | `/docs/04-database-design.md` §4: `events.actor TEXT NOT NULL`, hash-chained; `audit.verify` in security §11 |
| ADR-0021 — Seats defined in 2.0, one shipped | **Accepted** | `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md`; listed Accepted in `/docs-v2/adr/README.md` |
| M3 — Permission Broker, capability model (reused, not a hard gate) | **Complete** (1.0) | security §4; the single choke point |
| M5 — budget ceilings, ADR-0020 (reused) | **Complete/Accepted** | ADR-0020 four nested ceilings |
| M6 — memory namespaces (reused) | **Complete** (1.0) | memory §7 private lanes, §2 working memory |

M20's subject — agent-authored artifacts running in the Wasm sandbox — has **no bearing** on human identity,
Fences, budgets, or working memory. There is no code path, schema element, or invariant M21 needs from M20.
The sequence number places M20 before M21; the dependency graph does not.

## 2. Checklist result

Because M21's actual dependencies are complete, the gate is satisfied. The artifacts M21 relies on are all
present and stable:

| Required substrate for M21 | Present | Location |
|---|---|---|
| `events.actor` column on the hash chain | ✅ | `/docs/04-database-design.md` §4 |
| Hash-chain integrity verifier (`audit.verify`) | ✅ | `/docs/07-security-model.md` §11 |
| ADR-0021 decision realized by M21 | ✅ | `/docs-v2/adr/0021-…md` (Accepted) |
| Permission Broker + capability grammar (default-deny) | ✅ | security §4 |
| Nested budget ceilings (`budget_ledger`, ADR-0020) | ✅ | db-design §4; ADR-0020 |
| Memory namespaces & private lanes | ✅ | memory §7 |

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to the record, note it and continue":

1. **M17–M20 are Defined, not Documented.** 3.0's M21 is being architected while the tail of 2.5 (M17–M20)
   remains unarchitected. This is a *sequencing* observation, not a *dependency* failure: M21 depends on M2 and
   ADR-0021, both complete, and on no part of M17–M20. Architecting M21 now does not skip a real dependency.
   Recommended: when M17–M20 are picked up, confirm none of them retroactively introduces a coupling to Seats
   (none is expected — connectors, companion, voice, and executable artifacts are all agent/Firm-facing, not
   human-identity-facing). **Not a blocker for M21.**

2. **ADR numbering continues at 0057.** M16 introduced ADRs 0034–0037; the registry cites ADR-0032; the M21
   ADRs are 0057–0059 per the assignment. If intervening milestones (M17–M20) consume ADR numbers when they are
   documented, integration must confirm 0057–0059 remain free before promoting these to Accepted. Recorded here
   so the integration pass checks the ADR index rather than assuming a gap-free sequence. **Not a blocker.**

3. **No compilation of prior milestones is asserted here.** Implementation-verification of M15/M16 (compilation,
   toolchain) is an AntiGravity concern outside the architect's responsibility, recorded in the M16 package's
   own audit. It does not affect M21's architecture, which is specification only.

## 4. Gate decision

M21's structural dependencies (M2 and ADR-0021) are complete and stable, and M21 depends on no part of the
still-Defined M17–M20. **Proceed to M21 (Seats and Identity).** No existing architecture is modified by the M21
package; M21 extends the substrate M2/M3/M5/M6 already provide and realizes the decision ADR-0021 recorded in
2.0, which is the correct dependency direction.
