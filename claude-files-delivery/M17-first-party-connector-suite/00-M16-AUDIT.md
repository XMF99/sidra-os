# M16 Architecture Audit — gate before M17

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M17 (First-Party Connector Suite).

| | |
|---|---|
| Milestone audited | M16 — Connector Framework |
| Registry status | Documented · Open (implementation incomplete) |
| Audit verdict | **Architecturally complete. No gap blocks M17.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md` §4, `claude-files-delivery/M16-connector-framework/CONNECTOR_FRAMEWORK_ARCHITECTURE.md`, `.../IMPLEMENTATION_PLAN.md`, `.../REVIEW_CHECKLIST.md`, `docs-v2/adr/README.md` |

---

## 1. Checklist result

Every artifact the workflow requires for a Documented milestone is present in the M16 architecture, and — the
part that matters for M17 — the framework surfaces M17 depends on are all specified:

| Required artifact | Present | Location |
|---|---|---|
| Architecture document | ✅ | `CONNECTOR_FRAMEWORK_ARCHITECTURE.md` (§1–§17 + Appendices A–C, 704 lines) |
| ADRs | ✅ | ADR-0034 (custody) · 0035 (per-department grant) · 0036 (egress) · 0037 (kernel OAuth); indexed `Accepted` in `docs-v2/adr/README.md` |
| Domain model | ✅ | §4 (ids, manifest, operation, grant, auth config) |
| Manifest + install validation | ✅ | §5 (`connector.toml`, the ten install checks) |
| Component diagram | ✅ | §6 placement + internal modules |
| Security model | ✅ | §7 threat table → M3 controls; §8 custody; §9 authorization path |
| Effect classes | ✅ | §10 (reads 1, writes 2, irreversible 3), unchanged from security model §5 |
| Persistence + events | ✅ | §11 (tables `0025`–`0029`, 16 event variants, Vault mirror) |
| Public APIs | ✅ | §12 commands/queries + API rules, incl. `invoke_connector` |
| Sequence diagrams | ✅ | §13 install→grant→authorize, happy read, isolation refusal |
| Failure scenarios | ✅ | §14 (F1–F8) |
| Performance + offline | ✅ | §15 (offline default-safe, no scheduler block) |
| Dependencies / assumptions / risks | ✅ | §16 |
| Acceptance criteria | ✅ | §17 (AC1–AC12), exit criterion = AC2 |
| Implementation plan | ✅ | `IMPLEMENTATION_PLAN.md`, E1–E10 |
| Review checklist | ✅ | `REVIEW_CHECKLIST.md` |
| **The conformance suite M17 runs against** | ✅ | §14 conformance + E10 (T10.9 "the reusable conformance suite M17 connectors must pass") |

### 1.1 The specific surfaces M17 consumes — all present

M17 is content on the M16 framework, so the audit's real question is narrower than "is M16 complete": **are
the exact framework surfaces M17 needs specified and stable?** They are:

| M17 needs | M16 provides it in |
|---|---|
| `connector.toml` schema + ten install checks | §5.1–§5.4 |
| Per-department grant with a required `DepartmentId` | §4.4, ADR-0035, §9 |
| Credential custody (oauth2 tokens *and* api-keys) in the keychain | §8, ADR-0034 |
| Kernel OAuth + PKCE + refresh | §8.3, ADR-0037, §13.1 |
| Per-connector egress allowlist + kernel URL construction | §7, ADR-0036 |
| Effect-class policy (1/2/3), class-3 always asks | §10 |
| The invocation pipeline `invoke_connector` | §9, §12.1 |
| `ConnectorCall*` events on the hash chain | §11.2 |
| The conformance suite + isolation harness | §14, plan E10, AC1–AC12 |

Nothing M17 requires is missing, deferred, or left as a TODO in M16. M17 introduces no framework mechanism
(architecture §1.4), so it needs no M16 surface that M16 did not already specify.

## 2. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to git history, note it and continue":

1. **M16 status is `Documented`, implementation `Open`.** The M16 package is architecture and plan only, like
   this one — no production code. This is the expected state and is **not** a gap: M17's *architecture* may be
   written against M16's *architecture* (the correct dependency direction). What M17's *implementation* requires
   is M16 *implemented and its exit-criterion test green* — recorded as assumption 14.2.1 and enforced by the
   STOP gate, not by this audit. AntiGravity must not begin M17 implementation until M16's AC2 is green.
2. **ADRs 0034–0037 are indexed `Accepted` in `docs-v2/adr/README.md`.** The M16 package's own README lists an
   integration action to "mark them `Accepted` on Principal approval," while the committed ADR index already
   shows them `Accepted`. This is a metadata lead/lag between the delivery package and the committed index, not
   an architectural gap; M17's ADRs (0046–0048) continue the sequence regardless. Recommended: reconcile the
   package README against the index during the next integration pass. **Not a blocker for M17.**
3. **Numbering headroom confirmed.** ADRs run through 0037 (M16) and, per the project's M10–M14 delivery
   index, 0038–0045 are consumed by the parallel M10–M14 batch. M17 takes **0046–0048**, and migrations take
   **`0030_`** (M16 framework tables end at `0029`). Both bands are clear of every prior milestone — no
   collision. Verified against `docs-v2/adr/README.md` and the M10–M14 index's §4/§5 maps.

## 3. Gate decision

M16 is architecturally complete, and every framework surface M17 depends on is specified and stable.
**Proceed to M17 (First-Party Connector Suite).** No M16 architecture is modified by the M17 package; M17
extends the substrate M16 built by populating it with five signed Layer-6 artifacts and the conformance
evidence that all five pass the M16 suite — which is the correct dependency direction (Layer 6 content on a
Layer 1 framework).

**Caveat carried to the STOP gate:** M17 *implementation* must not begin until M16 is implemented, integrated,
and its exit-criterion test (M16 AC2) is green. Architecting M17 now is safe; building it against an
unimplemented framework is the mistake the registry warns of (`/MILESTONE_REGISTRY.md` §5, and by analogy the
M16-before-M13 dependency).
