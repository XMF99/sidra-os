# M19 Architecture Audit — gate before M20

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M20 (Executable Artifacts). Because M20's real
dependencies are M9 and M16 — not M19 — this audit does double duty: it checks the *sequence-predecessor* (M19)
and, decisively, the *dependency-predecessors* (M9, M16).

| | |
|---|---|
| Milestone audited (sequence) | M19 — Voice Directive |
| Milestones audited (dependency) | **M9 — Plugins** · **M16 — Connector Framework** |
| Registry status | M9 Documented · M16 Documented · **M17/M18/M19 Defined, not Documented** |
| Audit verdict | **No gap blocks M20. Its dependencies (M9, M16) are Documented; the intervening M17–M19 are not M20 dependencies.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `/docs/08-plugin-system.md`, `/docs/0006-wasm-component-plugins.md`, the M16 package |

---

## 1. The sequencing fact this audit must confront

M20 is the fifth and last milestone of 2.5 "Field". The three milestones between M16 and M20 — M17 (First-Party
Connector Suite), M18 (Companion), M19 (Voice Directive) — are all **Defined**, not **Documented**
(`/MILESTONE_REGISTRY.md` §4). A naïve reading of "audit the previous milestone" would stall here: M19 has no
architecture document to audit.

But the registry is explicit that ordering is by dependency, not by adjacency: *"Release boundaries move; the
ordering does not… Anything proposed out of order needs an ADR arguing why the dependency is not real"* (§3).
M20's dependencies, per its own registry row, are **M9 and M16** — not M17, M18, or M19:

| M20 depends on | Registry status | Bearing on M20 |
|---|---|---|
| **M9 — Plugins** (Wasm host, ADR-0006) | **Documented** | The sandbox M20 reuses verbatim (ADR-0055). Present in `services/plugins/`. |
| **M16 — Connector Framework** (capability/grant machinery, custody, egress) | **Documented** | The per-department grant and the custody/egress path M20 reuses for external effects. Present in the M16 package + `services/connectors/`. |
| M17 — First-Party Connector Suite | Defined | **Not a dependency.** M20 needs the connector *framework* (M16), not the *suite* (M17). An executable artifact reaches outward through whatever connectors a Firm has granted; it does not require the first-party five to exist. |
| M18 — Companion | Defined | **Not a dependency.** A mobile surface has no bearing on sandboxed execution. |
| M19 — Voice Directive | Defined | **Not a dependency.** Local speech-to-text has no bearing on sandboxed execution. |

M20 has **no dependency edge** to M17, M18, or M19. Architecting M20 now is therefore not a *reordering* (M20
keeps its number and its position); it is architecting in dependency order while three non-dependency
siblings remain merely Defined. The registry permits this: it forbids renumbering a Documented milestone (rule
4) and requires an ADR only to *reorder* (rule 3) — neither applies. This is recorded as an open item for the
Principal (§4) so the choice is visible, not silent.

## 2. Dependency-predecessor checklist (the audit that actually gates M20)

### 2.1 M9 — Plugins (the reused sandbox)

| Required property | Present | Location / evidence |
|---|---|---|
| Wasm Component Model host (Wasmtime), deny-by-default | ✅ | `/docs/08-plugin-system.md` §1, §5; ADR-0006 |
| No ambient filesystem/clock/network/randomness | ✅ | ADR-0006 Decision; `/docs/08-plugin-system.md` §5 ("Notably absent…") |
| Fuel metering, memory cap, epoch deadline | ✅ | `/docs/08-plugin-system.md` §5; ADR-0006 |
| One instance per call, dropped after | ✅ | `/docs/08-plugin-system.md` §5 |
| Signature/hash verification chain | ✅ | `/docs/08-plugin-system.md` §4; security model §8 (Ed25519) |
| Broker-mediated host functions only | ✅ | `/docs/08-plugin-system.md` §5; security model §4 (the choke point) |
| **Anticipates agent-authored scripts** | ✅ | ADR-0006 final consequence: *"the same isolation mechanism serves 2.0's sandboxed agent-authored scripts, so we build it once."* M20 is that clause coming due. |

**Verdict: M9 is Documented and complete for M20's purposes.** M20 adds no runtime; it reuses this one
(ADR-0055).

### 2.2 M16 — Connector Framework (the capability/grant machinery)

| Required property | Present | Location / evidence |
|---|---|---|
| Capability grant model (deny-by-default, subset semantics) | ✅ | M16 architecture §4, §9; security model §4 (intersection, never union) |
| Per-department connector grant as the isolation primitive | ✅ | M16 ADR-0035 |
| Credential custody: kernel holds the secret, injects at egress | ✅ | M16 ADR-0034; §8 |
| Egress declared and enforced; the kernel builds the URL | ✅ | M16 ADR-0036; §7 |
| The Broker as the single choke point, unchanged | ✅ | M16 §7; security model §4 |
| Work Order `capability_grant` exists and is a capability-string set | ✅ | `/docs/04-database-design.md` §2 (`work_orders.capability_grant`) |

**Verdict: M16 is Documented and complete for M20's purposes.** M20 derives an artifact's grant from the Work
Order's `capability_grant` (ADR-0054) and reuses M16's custody/egress for the external-effect path.

## 3. Sequence-predecessor note (M19)

M19 (Voice Directive) is **Defined**, not Documented. It has a fixed purpose, dependency (M18, M6), and exit
criterion in the registry, but no architecture document or implementation plan. Per the standing rule that ADR/
document status blocks future architecture only when a *dependency's* content is incomplete, and because **M19
is not a dependency of M20**, M19's Defined status does not gate M20. No M19 architecture is modified by the M20
package, because none exists to modify. This is recorded, not resolved: M17–M19 remain to be architected on
their own dependency schedules.

## 4. Discrepancies and open items (non-blocking)

1. **M20 is being architected ahead of M17–M19.** This is dependency-correct (M20 depends on M9 and M16, both
   Documented) and is not a reordering (M20 keeps its number). It is surfaced here so the Principal sees that
   2.5 will have a Documented last milestone (M20) while three earlier siblings are still Defined. **Not a
   blocker; a visibility item.** Recommended: note in `MILESTONE_REGISTRY.md` that M20 was documented in
   dependency order; architect M17–M19 before *implementing* 2.5 end to end.
2. **Registry status transition on completion.** On integration, update `MILESTONE_REGISTRY.md` M20 status
   `Defined → Documented`; from that point the number is permanent (registry rule 4).
3. **ADR home.** The M16 ADRs (0034–0037) were an integration action "copy to `docs-v2/adr/`." M20's ADRs
   (0054–0056) inherit the same action (see `README.md`). The `docs-v2/adr/` folder currently tops out at 0020;
   the 0021–0053 band is consumed by ADRs recorded elsewhere in the programme (M16 used 0034–0037). M20's
   0054–0056 continue that global sequence. **Not a blocker; an integration bookkeeping note.**

## 5. Gate decision

M20's dependency-predecessors (M9, M16) are architecturally complete and Documented. The intervening M17–M19 are
not M20 dependencies and their Defined status does not gate M20. **Proceed to M20 (Executable Artifacts).** No
M9, M16, or M19 architecture is modified by the M20 package; M20 extends the substrate M9 and M16 already
provide — the Wasm sandbox and the capability/grant machinery — which is the correct dependency direction.
