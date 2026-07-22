# M22 Architecture Audit — gate before M23

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the dependencies M23
actually rests on are sound, and report any gap. This audit gates M23 (Kernel Extraction).

| | |
|---|---|
| Milestone sequentially prior | M22 — Delegation and Separation of Duties |
| M22 registry status | **Defined** (exit criterion fixed in `/MILESTONE_REGISTRY.md` §4) · architecture **not yet written** |
| M23's actual dependencies | **M11** (kernel-as-library) — *Documented*; **M21** (Seats) — *Defined*, with the load-bearing Seat-identity contract fixed by **ADR-0021 (Accepted)** |
| Audit verdict | **Safe to architect M23 now. M22 is not a dependency of M23. The one binding constraint is the STOP: M23 must not be *implemented* until M21 and M22 are Documented, implemented, and integrated.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §3–§5, `/docs-v2/adr/0021-seats-defined-in-2-shipped-in-3.md`, `/docs/0011-seven-directory-monorepo.md`, `/docs/0001-tauri-over-electron.md` |

---

## 1. The unusual shape of this gate, stated plainly

In the M16 package, the STEP-1 gate audited M15, and M15 was **Documented** — the clean case. M23's situation
is different and must be handled honestly:

- The **sequentially prior** milestone, M22, is only **Defined** — it has a registry definition and a fixed
  exit criterion, but no architecture document. It is therefore *not* "architecturally complete" in the sense
  the M16 audit could assert of M15.
- But **M22 is not a dependency of M23.** The registry (`/MILESTONE_REGISTRY.md` §4) lists M23's dependencies
  as **M11** and **M21** — not M22. M22 and M23 are siblings within 3.0 "Chambers"; M22 handles separation of
  duties at the human layer, M23 handles topology. M23's architecture consumes nothing M22 produces.
- M23's *real* dependencies are **M11** (Documented) and **M21** (Defined). The question this gate must answer
  is therefore not "is M22 complete" but **"are M11 and M21 sound enough to architect M23 against now, and is
  it safe to write this architecture ahead of M21/M22 being Documented?"**

The answer is yes, for the reasons in §2, with one binding constraint in §4.

## 2. The dependencies M23 actually rests on

| Dependency | Status | Is it sound enough to architect against? |
|---|---|---|
| **M11 — kernel-as-library / department substrate** | **Documented** | Yes. M11's exit criterion — "the Firm runs as one implicit department with byte-identical behaviour" (`/MILESTONE_REGISTRY.md` §4) — is exactly the process-agnostic kernel `apps/kernel-server` hosts. The kernel-as-library M23 serves is a Documented substrate. |
| **M21 — Seats and Identity** | **Defined** | Yes, for the *identity contract*. The load-bearing fact M23 needs from M21 — that a Seat is a durable human identity carried on every event's `actor` field — is fixed by **ADR-0021 (Accepted)** from 2.0: "Every event carries a Seat ID." M23 consumes that identity surface and treats Seat *internals* (per-Seat Fences, budgets, working memory) as M21's to define. M23 does not depend on those internals; it depends only on the authenticated-identity surface ADR-0021 already fixed. |
| **ADR-0011 — seven-directory monorepo** | **Accepted** | Yes. The dependency direction (`packages/domain ← services/* ← apps/*`) and the `apps/`/`services/` split that make the extraction additive are Accepted and were designed for exactly this milestone. |
| **ADR-0001 — Tauri/Rust core** | **Accepted** | Yes. "The same crate becomes the 3.0 server binary" is the Accepted premise `apps/kernel-server` collects on. |
| **M2 / ADR-0002 — event log & audit chain** | **Documented / Accepted** | Yes. The single history the headless and in-process kernels share; session audit events land on it unchanged. |

**Load-bearing conclusion.** Everything M23's architecture builds on is either Documented (M11, M2) or fixed
by an Accepted ADR (0021 for Seat identity, 0011/0001 for the extraction shape). M23's architecture can be
written now without waiting for M21's full architecture, *provided* it consumes only the Seat-identity surface
and does not pre-empt M21's internal design — which this package does (see `KERNEL_EXTRACTION_ARCHITECTURE.md`
§9, which treats Seat internals as M21's).

## 3. Checklist result — what M23's architecture requires from its anchors

Every fact M23 leans on is present and Accepted/Documented:

| Required fact | Present | Source |
|---|---|---|
| A process-agnostic kernel (no Tauri dep, no process assumption) | ✅ | `/docs/03-folder-structure.md` §1.2, §1.8 rule 3; M11 Documented |
| The dependency direction that makes extraction additive | ✅ | ADR-0011; `/docs/03-folder-structure.md` §1.7 |
| A Rust core reusable verbatim as a server | ✅ | ADR-0001; `/docs/01-technical-architecture.md` §2 |
| A Seat identity on every event's `actor` field | ✅ | ADR-0021 (Accepted); `/docs/02-system-design.md` §2 event schema |
| A single Permission Broker choke point to preserve | ✅ | `/docs/07-security-model.md` §4 |
| A durable, single event log / audit chain | ✅ | ADR-0002; `/docs/02-system-design.md` §2 |
| The renderer-boundary trust rules to transfer to clients | ✅ | `/docs/01-technical-architecture.md` §4 |

## 4. The binding constraint — the STOP is the real gate here

Because M23's architecture is written **ahead** of M21 and M22 being Documented, the workflow's sequential-
implementation rule is not a formality for this milestone — it is the safety mechanism:

- **M23 must not be *implemented* until M21 (Seats) and M22 (Separation of Duties) are Documented,
  implemented, and integrated.** The transport authenticates clients against Seat identities that M21 creates,
  and M22's no-self-approval rule must already hold at the choke point before a second client can exercise it.
  Building the transport before Seats can be created is building an authentication layer against an identity
  that does not yet exist.
- This is recorded as **assumption 1** in the architecture (`KERNEL_EXTRACTION_ARCHITECTURE.md` §17.2) and as
  the closing **STOP** in `README.md`. It is stricter than the ordinary sequential STOP because two upstream
  milestones (M21, M22) sit between the current documented frontier and M23's implementation.

## 5. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **M17–M22 are Defined, not Documented.** The registry (`/MILESTONE_REGISTRY.md` §4) shows M16 as the last
   Documented milestone and M17–M30 as Defined. This M23 package is therefore produced out of the usual
   one-at-a-time cadence (architecting M23 while M17–M22 remain Defined). This is acceptable for *architecture*
   for the reasons in §2, but it is unusual and is flagged so the integrator does not mistake a Documented M23
   for a signal that M17–M22 are done. **Not a blocker for writing M23 architecture; it is a hard blocker for
   M23 *implementation* (§4).**
2. **Migration numbering.** M16 used `0025–0029`; M17–M22, once implemented, are expected to consume the range
   through `0048`. M23's single additive migration takes `0049_` accordingly (`KERNEL_EXTRACTION_ARCHITECTURE.md`
   §12). If M17–M22 land differently, the integrator renumbers M23's migration to the next free slot at
   integration time — a mechanical fix, not an architectural one.
3. **ADR-0021 is Accepted; M21 is Defined.** The Seat *decision* is settled even though the Seat *milestone*
   is not yet architected. M23 leans only on the Accepted decision, not on the unwritten milestone
   architecture. Recorded so the dependency is not misread as circular.

## 6. Gate decision

M23's dependencies (M11 Documented; M21's Seat-identity contract fixed by Accepted ADR-0021; ADR-0011/0001
Accepted) are sound. M22 is a sibling, not a dependency, and its Defined status does not gate M23's
architecture. **Proceed to architect M23 (Kernel Extraction).** No M11, M21, or M22 architecture is modified
by the M23 package; M23 extends the substrate they assume and consume, which is the correct dependency
direction. **The STOP (§4) is binding: do not implement M23 until M21 and M22 are Documented, implemented,
and integrated.**
