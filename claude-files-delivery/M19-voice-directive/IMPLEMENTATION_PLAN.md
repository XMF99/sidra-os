# Voice Directive — Implementation Plan

**Milestone M19 · crate `sidra-voice` · for AntiGravity**

| | |
|---|---|
| Architecture | `VOICE_DIRECTIVE_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0052 (local-only STT, audio never leaves, voice = a normal Directive) · 0053 (transcript confirmed before submit) |
| Crate | `sidra-voice` at `services/voice/` |
| Depends on | `sidra-store`, `sidra-security`, `sidra-domain`; the existing `engagement.create` (M6) at the app layer; M18 for the Companion surface (E5) |
| Must not depend on | `sidra-orchestrator`, `sidra-mission`; must hold **no** `net.*` capability (both CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR. In particular, no task adds a `voice.submit` command, a cloud-STT path, a `net.*`
capability on `sidra-voice`, or a second Directive pipeline — those are architectural refusals (ADR-0052,
ADR-0053, §1.4).

### 0.2 Task conventions (inherited from the Mission Engine / M16 plans §0, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Local STT model integration | ONNX Runtime whisper-class model: on-demand load, streaming decode, release, memory bound (ADR-0052) |
| E2 | Capture + transcript UI with confirm/edit | kernel-side audio capture; the state machine; partial/final transcript; the editable composer (ADR-0053) |
| E3 | Submit into the existing Directive pipeline | `input_method` provenance; reuse of `engagement.create`; Context-Frame exclusion |
| E4 | Audio-retention & no-egress guarantees | discard-by-default retention; purge; the no-`net.*` posture; the no-egress guarantee |
| E5 | Companion (M18) voice surface | on-device capture+STT on mobile; same `engagement.create`; **gated on M18** |
| E6 | Mandate-equivalence + audio-never-leaves acceptance | the two exit-criterion proofs — **the last things to go green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──┐
        │          ├──► E6
        └──► E4 ────┤
                    │
E5 (gated on M18; spec-ready now, go-live after M18) ──► E6 (AC10 slice)
```

E1 first (nothing transcribes without a model). E2 needs E1 (capture feeds the model; the composer shows its
output). E3 wires the confirmed transcript into the existing `engagement.create` and proves the Context-Frame
exclusion. E4 can proceed in parallel with E3 once E2 lands (retention and the no-egress posture attach to the
capture path). E5 is specified now but its go-live is gated on M18 (`00-M18-AUDIT.md`); its desktop-independent
parts (shared capture/model code) come free from E1–E4. **E6 closes the milestone; its final task — the
Mandate-equivalence proof and the no-egress proof — is the last thing to go green.**

---

## E1 — Local STT model integration (ADR-0052)

### Purpose
On-device speech-to-text: load a whisper-class ONNX model on demand, decode audio to text locally, release the
model after, and stay inside the memory/latency budgets — with no network anywhere on the path.

### Scope
In: model loading via ONNX Runtime, streaming decode, on-demand load + release, peak-memory bounding, the
`ModelId`/`ModelVersion` value objects. Out: audio capture (E2), submission (E3), retention (E4).

### Dependencies
`sidra-domain` (value objects); ONNX Runtime (the `bge-small` on-device precedent, `/docs/01-technical-architecture.md`
§2); a shipped quantized whisper-class model asset.

### Public APIs
`load_model() -> ModelHandle` (on demand); `decode_stream(frames) -> PartialTranscript`;
`finalize(handle) -> TranscriptText`; `release(handle)`.

### Acceptance criteria
The model loads on demand and is released after finalize (not resident at idle); decode is local with zero
egress; peak memory within budget; latency within budget on the fixture-audio corpus.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-voice` crate: manifest, module skeleton, CI wiring (dependency-direction + no-`net.*` checks) | S | — | `services/voice/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge `sidra-voice → sidra-orchestrator`/`→ sidra-mission` and on any `net.*` capability (AC12) |
| **T1.2** | Value objects: `ModelId`, `ModelVersion`, `TranscriptText`, `CaptureId` | S | T1.1 | `domain/values.rs` | `TranscriptText` is text-only (no audio type reachable); property tests; `CaptureId` sortable |
| **T1.3** | ONNX Runtime model loader; ship + hash-pin a quantized whisper-class model asset | M | T1.2 | `model/load.rs` | Model loads from the bundled asset (not fetched at capture time); hash pinned; recorded as `model_id`/`model_version` |
| **T1.4** | Streaming decode: audio frames → incremental partial transcript (text) | M | T1.3 | `model/decode.rs` | Partial transcript emitted incrementally; text only; no network call in the decode path |
| **T1.5** | On-demand load + release lifecycle; assert not resident at idle | M | T1.3 | `model/lifecycle.rs` | Model loaded at handle-open, released after finalize; idle-memory budget (M8) unchanged and green |
| **T1.6** | Peak-memory + latency budget test over a fixture-audio corpus | M | T1.4, T1.5 | `model/tests/budget.rs` | Peak within the quantized-model budget; RTF < 1; final within ≈1–2 s of stop (§15) |

---

## E2 — Capture + transcript UI with confirm/edit (ADR-0053)

### Purpose
Open the microphone in the trusted core, drive the model, run the capture state machine, and show the
transcript in the composer as **editable** text the Principal confirms before submit.

### Scope
In: kernel-side native audio capture; ring buffer + VAD endpointing; the state machine (§5); partial (streamed)
and final transcript events; the renderer composer's press-to-talk affordance and editable transcript. Out:
the model itself (E1); submission (E3); retention (E4).

### Dependencies
E1; `sidra-security` (capability-checked `begin_capture`; the renderer boundary); the existing composer
(apps/desktop).

### Public APIs
`voice.begin_capture() -> CaptureId`; `voice.stop_capture(id) -> TranscriptDraft`; `voice.cancel_capture(id)`;
`voice.get_transcript(id) -> TranscriptDraft`; `voice_model_status()`.

### Acceptance criteria
The mic is open only in `CAPTURING`; audio never crosses to the renderer; the transcript is shown editable;
nothing submits from any state but a confirmed `Draft`; model/mic absent → clean fallback.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Native audio capture (kernel-side); ring buffer; audio held in-memory only, never crossing to the renderer | M | E1 | `capture/input.rs` | Audio exists only in `capture`; a test asserts no audio object crosses the IPC boundary (§6.1) |
| **T2.2** | VAD endpointing + bounded capture duration | S | T2.1 | `capture/vad.rs` | Long-utterance bound enforced (F6); graceful stop produces the transcript so far |
| **T2.3** | Capture state machine (§5): Idle→Capturing→Transcribing→Draft; cancel→Discarded; guards | M | T2.1, E1 | `transcribe/state.rs` | Illegal transitions rejected; mic open only in `Capturing`; audio buffer released on entry to `Draft` (invariants §5.2) |
| **T2.4** | Partial transcript streaming to the composer (text, coalesced ≤N Hz); final on stop | M | T2.3, T1.4 | `transcribe/stream.rs` | Partials pushed as text like streamed tokens; final transcript on `stop_capture`; audio never in a message |
| **T2.5** | Composer: press-to-talk affordance; show transcript **editable**; confirm-to-submit; `voice_model_status`-driven availability | M | T2.4 | `apps/desktop/composer/` | Transcript editable before submit (ADR-0053); voice affordance disabled when model/mic absent |
| **T2.6** | Fallback to typing when model/mic unavailable (Unavailable state) | S | T2.3, T2.5 | `transcribe/state.rs`, `apps/desktop/composer/` | Model-absent/mic-denied → composer stays a normal text box; a Directive can still be issued (F2/F4, AC7) |

---

## E3 — Submit into the existing Directive pipeline

### Purpose
Turn a confirmed transcript into an ordinary Directive through the **existing** `engagement.create`, carry
`input_method` provenance, and prove it never touches the Mandate.

### Scope
In: the `submit` seam (hand a confirmed string back for `engagement.create`); the `input_method` domain value
+ migration `0037`; the Context-Frame-exclusion invariant; the `DirectiveCreated` event carrying
`input_method`. Out: the Orchestrator/Mandate logic (M6, untouched); retention (E4).

### Dependencies
E2; `sidra-store` (migration `0037`); the existing `engagement.create` and event schema (M6, M2). **No**
dependency on `sidra-orchestrator` — submission is dispatched at the app layer via the existing command
(§6.2).

### Public APIs
No new command. `submit` returns a confirmed `TranscriptText` to the composer, which calls the existing
`engagement.create(body, source='principal', input_method='voice')`.

### Acceptance criteria
Submission uses the existing command; `input_method` is recorded on the row and event; it is excluded from the
Context Frame; downstream tables are unchanged; the transcript carries `trust=principal`.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | `InputMethod` domain value (`Typed`/`Voice`); migration `0037_directive_input_method.sql` (additive, defaulted) | S | E2, E8-equiv (store) | `domain/input_method.rs`, `services/store/migrations/0037_*.sql` | Additive; `DEFAULT 'typed'`; `source` unchanged; pre-M19 rows/behaviour identical (§11.1) |
| **T3.2** | `submit` seam: return the confirmed transcript; composer calls the existing `engagement.create` with `input_method='voice'` | S | T3.1, T2.5 | `submit/mod.rs`, `apps/desktop/composer/` | No `voice.submit` command exists; submission is the existing command (AC9); `sidra-voice` has no orchestrator edge |
| **T3.3** | `DirectiveCreated` event carries `input_method` + `capture_id`; no new Directive-event kind | S | T3.1 | `domain/events.rs` (extend existing) | The existing event gains `input_method`; no parallel "voice directive" event (§11.2, AC11) |
| **T3.4** | Context-Frame-exclusion invariant: `input_method` is not assembled into the classify+mandate Turn's frame | M | T3.3 | `transcribe/tests/frame_exclusion.rs` | Assert `input_method` absent from the Context Frame (§6.3, AC4) |
| **T3.5** | Trust-tagging: the transcript carries `trust=principal`; no content-fence applied | S | T3.2, `sidra-security` | `submit/trust.rs` | Transcript is `principal`-trust like typed text; no fence; class-3 effects in a voice plan still require approval (AC5) |

---

## E4 — Audio-retention & no-egress guarantees (ADR-0052)

### Purpose
Make "audio never leaves the device" a structural, tested fact, and give retention a private default with a
purge path.

### Scope
In: the retention policy (discard-after-transcribe default; retain-local opt-in; purge); migration `0038`; the
`VoiceAudioPurged` event; the no-`net.*` posture and the no-egress assertion. Out: the model (E1); submission
(E3).

### Dependencies
E2; `sidra-store` (migration `0038`); `sidra-security` (redaction; capability model — no `net.*`).

### Public APIs
`voice.set_retention(mode, purge_window)`; `voice.purge_audio(capture_id)`; internal `retention::apply(capture)`.

### Acceptance criteria
Default leaves no audio; retained audio is local, encrypted, purgeable; every purge is audited; a full
capture→transcribe→submit makes zero network calls; no audio in any event/log/IPC.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Retention policy: `DiscardAfterTranscribe` (default) releases the buffer on entry to `Draft`; `RetainLocal` writes to the encrypted Vault with `purge_at` | M | E2 | `retention/policy.rs` | Default persists no audio; retain-local writes a **local** `AudioRef` only; never an upload path (§10, AC8) |
| **T4.2** | Migration `0038_voice_captures.sql`: capture provenance + retention record (no audio bytes, no network ref representable) | S | store | `services/store/migrations/0038_*.sql` | Columns per §4.2/§11.1; no column can hold audio or a URL; forward-only, idempotent |
| **T4.3** | Purge: on demand + scheduled (Night Shift); `VoiceAudioPurged` event | S | T4.1, T4.2 | `retention/purge.rs` | Purge deletes local audio; emits `VoiceAudioPurged` on the chain (AC8, AC11) |
| **T4.4** | No-`net.*` posture: assert `sidra-voice` holds no network capability; the STT path never touches `sidra-models` | S | E1 | `infrastructure/ci/`, `model/lifecycle.rs` | CI fails on any `net.*` on `sidra-voice`; a test asserts the decode path has no `sidra-models`/provider dependency (AC2, AC6, F9) |
| **T4.5** | Audio-absence scan: no audio in any event payload, log, stored parameter, or IPC message | M | T4.1, T3.3 | `retention/tests/audio_absence.rs` | Scan asserts zero audio across events/logs/IPC; redaction path exercised (AC2, VR-3) |

---

## E5 — Companion (M18) voice surface

### Purpose
Bring voice to the Companion: on-device capture and transcription on mobile, submitting the same
`engagement.create`, with audio never leaving the phone.

### Scope
In: mobile audio capture; the mobile ONNX/whisper build; the mobile composer's editable transcript; submission
via the Companion's existing kernel channel; the mobile no-egress guarantee. Out: any desktop path (E1–E4).
**Gated on M18** (`00-M18-AUDIT.md`); spec-ready now, go-live after M18 is Documented and implemented.

### Dependencies
E1–E4 (shared capture/model/transcribe/retention logic); **M18** (Companion composer + kernel channel).

### Public APIs
Reuses `voice.begin_capture`/`stop_capture`/`cancel_capture`/`get_transcript` on the mobile runtime; submission
via the Companion's existing `engagement.create` channel.

### Acceptance criteria
On-device capture + transcription on mobile; audio never leaves the phone; the confirmed transcript submits the
same `engagement.create`; the same confirm/edit step.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | Mobile audio capture + mobile ONNX/whisper build; on-demand load/release on-device | M | E1, E2, **M18** | `apps/companion/voice/` | Capture + transcription entirely on-device; model released after finalize |
| **T5.2** | Companion composer: press-to-talk, editable transcript, confirm-to-submit via the existing channel | M | T5.1, **M18** | `apps/companion/composer/` | Transcript editable before submit (ADR-0053); submits the existing `engagement.create` |
| **T5.3** | Mobile no-egress guarantee: no `net.*` on the mobile voice path; audio never leaves the phone | S | T5.1, T4.4 | `apps/companion/voice/`, `infrastructure/ci/` | No-egress assertion on the mobile path; audio-absence scan (AC10) |

---

## E6 — Mandate-equivalence + audio-never-leaves acceptance

### Purpose
The two exit-criterion proofs, made tests. **The last things to go green.**

### Scope
In: the Mandate-equivalence harness (AC1), the no-egress harness (AC2), and the acceptance-criteria coverage
for AC3–AC12. Out: any new behaviour — this epic proves the others.

### Dependencies
All prior epics (E5 for the AC10 slice, gated on M18).

### Acceptance criteria
AC1–AC12 each covered by a named test; the two exit-criterion proofs (AC1 same Mandate, AC2 audio never leaves)
are the final tasks and the last to go green.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | Confirm/edit test: mistranscribed fixture corrected in the composer; submitted body == confirmed text | S | E3 | `infrastructure/testing/voice/confirm_edit.rs` | AC3 — the mishearing never reaches a Mandate (§13.2) |
| **T6.2** | Context-Frame-exclusion + provenance test | S | E3 | `.../context_frame_exclusion.rs` | AC4 — `input_method` on row+event, absent from the frame |
| **T6.3** | Trust-tagging test | S | E3 | `.../trust_principal.rs` | AC5 — transcript is `principal`-trust; no fence; class-3 still approved |
| **T6.4** | Model-lifecycle + local-only test | S | E1 | `.../model_local.rs` | AC6 — loads on demand, released; no provider/network on the path |
| **T6.5** | Fallback-to-typing test (model-absent + mic-denied) | S | E2 | `.../fallback.rs` | AC7 — `engagement.create` still reachable; voice affordance disabled |
| **T6.6** | Retention test over both modes + purge event | S | E4 | `.../retention.rs` | AC8 — no audio under default; purge audited |
| **T6.7** | Downstream-unchanged test (schema diff + no voice-specific orchestrator path) | S | E3 | `.../downstream_unchanged.rs` | AC9 — Mandate/Workflow/Brief gain nothing |
| **T6.8** | Offline test: full capture→transcribe→submit with no network | S | E1–E4 | `.../offline.rs` | AC2/AC6 — voice works fully offline (§13.4) |
| **T6.9** | Audit-coverage + `audit.verify` over a voice-lifecycle fixture | S | E4 | `.../audit.rs` | AC11 — every start/finalize/discard/purge chained; audio absent from payloads |
| **T6.10** | Companion voice + mobile no-egress test (gated on M18) | M | E5, **M18** | `.../companion_voice.rs` | AC10 — on-device; audio never leaves the phone |
| **T6.11** | **No-egress proof (exit criterion):** network stub asserts zero egress on a full capture→transcribe→submit; egress allowlist has no STT host; audio-absence scan | M | E4, E6.8 | `.../no_egress.rs` | **AC2** — audio never leaves the device; **fails the build** on any egress |
| **T6.12** | **Mandate-equivalence proof (exit criterion, LAST to go green):** identical confirmed transcript `S` down the voice and typed paths under identical model settings; assert equal Mandate | M | E3, all | `.../mandate_equivalence.rs` | **AC1** — spoken Directive == typed Mandate; the last thing green (§9, §18) |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | on-device STT: ONNX load/decode/release, budget-bound (ADR-0052) |
| E2 | kernel-side capture + the state machine + the editable composer (ADR-0053) |
| E3 | `input_method` provenance + reuse of `engagement.create` + Context-Frame exclusion |
| E4 | discard-by-default retention + purge + the structural no-egress guarantee |
| E5 | Companion voice surface (gated on M18) |
| E6 | the two exit-criterion proofs — Mandate-equivalence (last green) + no-egress |
</content>
