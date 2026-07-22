# M19 Voice Directive — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `VOICE_DIRECTIVE_ARCHITECTURE.md` (title block, authoritative-precedence note,
      §1 why it exists / stance / what it must never become / relationship to existing concepts, §2 design
      goals, §3 non-goals, §4 domain model, §5 state machine, §6 component structure + dependency direction,
      §7 security + threat table, §8 local transcription, §9 submission + Mandate equivalence, §10 audio
      retention, §11 persistence/events/mirror, §12 public APIs, §13 sequence diagrams, §14 failure scenarios,
      §15 performance/offline, §16 dependencies/assumptions/risks, §17 acceptance criteria, §18 testing + CI,
      appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E6, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M18 audit (STEP 1 gate) — `00-M18-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0052 — Speech-to-text is local-only; audio never leaves the device; voice produces a normal Directive
- [x] ADR-0053 — The transcript is confirmed before submit; equivalence is defined against the confirmed text

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering continues the sequence after ADR-0037 (M16) and the intervening allocations; **does not exceed
0053**. Both `Proposed`.

- [ ] **Integration action (AntiGravity):** copy the two ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] **M6** (Orchestrator + Directive→Mandate) — Documented; the intake voice feeds; carries the exit
      criterion on desktop
- [x] **M18** (Companion) — **Defined, not Documented**; gates **only** the Companion voice surface (E5);
      handled by gating E5 and leading with desktop (`00-M18-AUDIT.md`)
- [x] M2 (event log) — voice events land on the existing hash chain; `DirectiveCreated` carries `input_method`
- [x] M3 (security kernel) — redaction; the capability model grants `sidra-voice` **no** `net.*`; encrypted
      Vault for retained audio
- [x] Local ONNX model pattern (`bge-small`, `/docs/01-technical-architecture.md` §2) — the STT shipping
      precedent
- [x] Dependency direction preserved: `packages/domain ← services/voice ← apps/*`; **no** edge to
      `services/orchestrator`/`services/mission`; **no** `net.*` capability (both CI-enforced, AC12)

## 4. Consistency with authoritative sources

- [x] The Directive→Mandate pipeline is **unchanged** — voice feeds `engagement.create`; Kai forms the Mandate
      from the body, unaware it was spoken (`/docs/04-ceo-protocol.md` Phases 1–2)
- [x] Renderer boundary respected — the renderer receives **text** only, never audio; capture is kernel-side
      (`/docs/01-technical-architecture.md` §4, §8)
- [x] `trust=principal` for the transcript matches the security model — not untrusted, no content-fence
      (`/docs/07-security-model.md` §7.1)
- [x] No-egress for audio extends ADR-0009 / §10 without adding an outbound path; the egress-allowlist CI test
      still passes with no STT host
- [x] `source` on `directives` is **not** repurposed; `input_method` is a new additive column
      (`/docs/04-database-design.md` §2, §10)
- [x] Effect-class policy unchanged — a voice-originated plan's class-3 effects still require approval
      (`/docs/07-security-model.md` §5)
- [x] Milestone numbering per `/MILESTONE_REGISTRY.md` §4 (M19; depends on M18, M6)
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated

## 5. Acceptance criteria complete

- [x] AC1–AC12 defined in the architecture §17 and each mapped to a task in E6 (and its owning epic)
- [x] The exit criterion decomposes into **AC1** (spoken Directive → same Mandate as typed, via a fixed
      transcript) and **AC2** (audio never leaves the device, via a no-egress assertion)
- [x] The two exit-criterion proofs are the **last** epic's final tasks (T6.11 no-egress, T6.12
      Mandate-equivalence) and the last thing to go green
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No cloud speech** — local-only STT; no provider adapter; no `net.*`; model gateway off the path
      (ADR-0052)
- [x] **No new Directive path** — submission reuses the existing `engagement.create`; there is no
      `voice.submit`; downstream unchanged (§11.3, AC9)
- [x] Out of scope and stated: wake word / always-listening, TTS, speaker biometrics, voice navigation/control,
      transcription of ingested audio files (§3)
- [x] Companion voice surface (E5) flagged **gated on M18**; desktop surface leads and carries the exit
      criterion

## 7. Testing and CI

- [x] Test layers named (unit / component / integration / conformance) — §18.1
- [x] New CI gates specified: **no-egress test for audio** (AC2), **Mandate-equivalence test** (AC1),
      dependency-direction + no-`net.*` check (AC12), Context-Frame-exclusion assertion (AC4), performance
      gates (§15), audit coverage (AC11) — §18.2
- [x] Every voice stateful/effectful path asserts its log entry; `audit.verify` over a voice-lifecycle fixture

## 8. Open items carried forward (non-blocking)

- [ ] E5 (Companion voice) binds to M18's real composer/kernel-channel contract once M18 is Documented; run the
      AC10 slice (T6.10) then — does not gate the M19 exit criterion (`00-M18-AUDIT.md` §4)
- [ ] Confirm the chosen quantized whisper-class model fits the peak/idle budget on target hardware
      (implementation-verification, owned by AntiGravity; VR-4, assumption §16.2.2)
- [ ] On integration, update `/MILESTONE_REGISTRY.md` M19 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4)

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation.** Recommended start: E1 → E2, then E3/E4 in parallel; E5 gated on M18. E6
      (the two exit-criterion proofs) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M20 (Executable Artifacts) until AntiGravity completes M19
implementation and integration, and the spoken-Directive-equals-typed-Mandate / audio-never-leaves exit
criterion is demonstrated.
</content>
