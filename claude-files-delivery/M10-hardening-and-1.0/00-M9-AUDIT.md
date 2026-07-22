# M9 Architecture Audit — gate before M10

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M10 (Hardening and 1.0).

| | |
|---|---|
| Milestone audited | M9 — Plugins |
| Registry status | Documented (registry §4, 1.0 "Atrium") |
| Audit verdict | **Architecturally complete. No gap blocks M10.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `/MASTER_IMPLEMENTATION_GUIDE.md`, `/docs/01-implementation-plan.md`, `/docs/07-security-model.md`, `/docs/02-system-design.md` |

---

## 1. Checklist result

M10 does not consume M9 the way M16 consumes M15 (a new crate extending a fresh substrate). M10 hardens the
**entire** M1–M9 surface. The specific reason the audit targets **M9** is a sequencing fact, not a
coincidence: **M9 must land before M10 so its plugin capability surface is included in the second security
review** (impl-plan §3; GUIDE §5 critical path). If M9 were architecturally incomplete, the second security
review — the load-bearing deliverable of M10 §5 — would be reviewing a surface that does not yet exist.

Every artifact the workflow requires for a Documented milestone is present for M9 in the v1 `/docs`:

| Required artifact | Present | Location |
|---|---|---|
| Exit criterion | ✅ | "An external developer ships a working tool plugin in under a day from the spec alone" (impl-plan §M9; registry §4) |
| Architecture document | ✅ | `/docs/02-architecture/08-plugin-system.md` (authoritative doc, GUIDE §5) |
| Sandbox model | ✅ | Wasmtime Component Model, deny-all, no ambient authority (security §2; technical-architecture §2) |
| Capability grants | ✅ | Declared and shown at install; revocable; signature check (security §3 T5, §8) |
| Extension points | ✅ | Tool, Ingestor, Retriever, ModelProvider, WorkflowTemplate, Panel, NotificationChannel (system-design §8) |
| Signing / trust chain | ✅ | Ed25519 over manifest + wasm hash (security §8) |
| Effect classes for tools | ✅ | Every tool declares a class 0–3 (security §5) |
| Security integration | ✅ | Plugins pass the Permission Broker; deny-by-default (GUIDE §3.6; security §4) |
| Fuel/timeout bounds | ✅ | Separate process, one instance per call, hard timeout (technical-architecture §3) |
| Position in the critical path | ✅ | "M9 starts after M7 and lands before M10, so its capability surface is inside the second security review" (GUIDE §5; impl-plan §3) |

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **M9's exit criterion is a human-factors test, not a mechanical one.** "An external developer ships a
   working tool plugin in under a day" (impl-plan §M9) is demonstrated by a person, not asserted by CI. This is
   correct for M9 and outside M10's remit — but M10's second security review *does* take a hard dependency on
   the plugin surface being real and stable (testing §5). Recorded so that, if the M9 developer-experience
   demonstration has not been performed, it is completed before E5 (the security review) begins, not during it.

2. **The plugin capability surface is the newest attack surface at 1.0.** M3's security review (the first of
   the two) predates M9 by six milestones and could not have covered plugins. This is not a gap in M9; it is
   the entire reason the second review exists and the reason M9 is sequenced immediately before M10 (impl-plan
   §3). Recorded as the load-bearing input to M10 §5, not as a defect.

3. **No M9-specific ADR is cited in the guide's M9 row beyond ADR-0006.** M9's row names ADR-0006 (the sandbox
   / deny-by-default decision), shared with M3 (GUIDE §5). Plugins introduce no new boundary ADR because they
   reuse M3's capability model and the existing signing scheme — which is the correct outcome (a plugin is a
   capability-bounded participant, not a new trust mechanism). Not a gap.

## 3. Gate decision

M9 is architecturally complete, and — more to the point for M10 — the whole M1–M9 surface it completes is the
subject M10 hardens. **Proceed to M10 (Hardening and 1.0).** No M1–M9 architecture is modified by the M10
package; M10 adds only proofs (permanent CI gates and harnesses under `infrastructure/ci/` and
`infrastructure/testing/`) and one policy decision about the shape of the release (ADR-0038), plus the
additive-bookkeeping decision (ADR-0039). That is the correct direction: hardening extends the substrate it
proves; it never rewrites it.
