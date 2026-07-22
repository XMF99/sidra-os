# Voice Directive — Architecture

**Milestone M19 · Release 2.5 "Field" · an input front-end for Layer 2 (the Directive intake)**

| | |
|---|---|
| Milestone | M19 — Voice Directive (`/MILESTONE_REGISTRY.md` §4, 2.5 "Field") |
| Release | 2.5 "Field" — the Firm reaches outside the building |
| What it adds | a local speech-to-text **input method** in front of the existing `engagement.create` Directive intake |
| New crate | `sidra-voice` at `services/voice/` |
| Depends on | M6 (Orchestrator + Directive→Mandate pipeline), M18 (Companion surface — for the mobile target only) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | A spoken Directive produces the **same Mandate** as the typed equivalent, and **audio never leaves the device** — proven by test, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `/docs/07-security-model.md`, the security
> model governs the trust-provenance and egress rules. Where it disagrees with
> `/docs/04-ceo-protocol.md` or `/docs/01-agent-architecture.md` about how a Directive becomes a Mandate, those
> documents govern — this architecture does not touch the Directive→Mandate pipeline, it feeds it. Where it
> disagrees with `/docs/01-technical-architecture.md` §4 about the renderer boundary, the technical
> architecture governs. Where it disagrees with `ADR-0009` about no-telemetry / local-only, ADR-0009 governs.
> This architecture *extends* the intake surface; it never re-decides these boundaries.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M18 the only way to hand the Firm a Directive is to type it. On a desktop that is fine; on the Companion
surface (M18) it is the slowest part of the loop, and away from a desk it is the whole barrier. The Principal
has a thought worth delegating — *"draft the reply to the vendor and flag anything that commits us past Q3"* —
and the only path from the thought to the Directive is a keyboard.

The requirement is **not** "add a voice assistant." A voice assistant is a second way to command the Firm, with
its own interpretation and its own place where a spoken sentence and a typed sentence diverge into two
behaviours — exactly the thing this milestone must not build. The requirement is narrower and harder: **let the
Principal speak a Directive instead of typing it, on-device, such that what the Firm receives is
indistinguishable from the typed equivalent — the same body, feeding the same `engagement.create`, producing
the same Mandate — while the audio of the Principal's voice never touches the network.**

Two constraints make this non-trivial and give the milestone its shape:

1. **Audio is the most sensitive input the Firm will ever take.** The Principal's raw voice, in their office,
   is more revealing than the text it becomes. ADR-0009 promises no telemetry and Principle 7 promises data
   sovereignty; a cloud speech API would violate both by making a network connection, from a process that hears
   everything the Principal says, that the Principal did not ask for. So speech-to-text must be **local**.
2. **Speech-to-text is lossy and non-deterministic in a way typing is not.** A model can mishear. If the Firm
   acted on the raw transcript, "the same Mandate as typed" would be a lie the first time the model dropped a
   "not." So the transcript must be **shown and editable before it is submitted** — the Principal confirms the
   text, and equivalence is defined against the text they confirmed.

### 1.2 The stance

Two commitments define the milestone, and each has an ADR:

1. **Speech-to-text is local-only; audio never leaves the device; voice produces a normal Directive.**
   (ADR-0052) An on-device model — an ONNX/whisper-class model shipped the way the local `bge-small`
   embedding model is shipped (`/docs/01-technical-architecture.md` §2) — transcribes speech to text inside the
   trusted Rust core. The text enters the **existing** `engagement.create` command unchanged. No cloud speech
   API is ever called; there is no STT provider adapter; the audio is never serialized to an event, a log, the
   database as an upload, or across the IPC boundary to the renderer.
2. **The transcript is confirmed before it is submitted, and equivalence is defined against the confirmed
   text.** (ADR-0053) The Principal sees the transcript in the ordinary Directive composer, edits it if the
   model misheard, and submits it exactly as they would submit typed text. This is honest about the model's
   uncertainty and it is *what makes the exit criterion achievable*: a spoken Directive produces the same
   Mandate as the typed equivalent because, at the moment of submission, the two are the same string.

### 1.3 What it is, mechanically

Voice is an **input front-end**. The machinery is:

```
OS microphone ─► sidra-voice (kernel-side): capture ─► local STT model ─► transcript (TEXT)
             ─► the Directive composer (renderer/Companion), editable
             ─► engagement.create(body, source='principal', input_method='voice')   ← the EXISTING command
             ─► Orchestrator: new Engagement → classify+mandate Turn                  ← M6, UNCHANGED
```

The load-bearing sentence: **`sidra-voice` produces a string and stops.** It does not know what a Mandate is,
it does not call the Orchestrator, it does not submit anything. The composer — the same UI element that submits
typed text — submits the (possibly edited) transcript through the same command it always uses. Voice fills the
box; it is not a new pipeline behind it. That is the entire reason "the same Mandate as typed" is structural
rather than aspired to: there is one Directive pipeline, and voice reaches it through the door typing uses.

### 1.4 What it must never become

- **A cloud speech pipeline.** No audio, ever, over the network. There is no configuration that enables a
  remote transcription service, because there is no code path that could — `sidra-voice` holds no `net.*`
  capability, and the model gateway (`sidra-models`, which *can* reach providers) is not on the STT path
  (ADR-0052). The no-egress property is a compile/test fact, not a setting.
- **A second, parallel Directive path.** Voice must not gain its own interpretation step, its own "voice
  Mandate," its own classification. The transcript is a Directive body and nothing else. Downstream — Mandate,
  Workflow, Brief — must be byte-for-byte unaware that the body arrived as speech, except for one inert
  provenance field that is deliberately excluded from the context the planner sees (§6.3, §11.3).
- **An audio exfiltration channel.** The capture path lives entirely in the trusted core. Audio bytes never
  cross to the renderer (which the threat model treats as compromised, `/docs/07-security-model.md` §2), never
  land in an event payload, never enter a prompt or a log. The transcript — text — may; the audio may not.
- **A trust downgrade of the Principal's own words.** A spoken Directive is the Principal speaking. It carries
  `trust = principal` exactly as typed text does (`/docs/07-security-model.md` §7.1). It is *not* untrusted
  content and it is *not* subject to the content-fence that wraps ingested documents. Treating the Principal's
  voice as untrusted would be both wrong and a usability catastrophe.

### 1.5 Relationship to existing concepts

| Existing concept | How M19 relates |
|---|---|
| `engagement.create` / the Directive intake (M6) | M19 adds **no** command here. Voice fills the composer; the composer calls the existing `engagement.create`. The only change is one additive, defaulted parameter, `input_method`, which is provenance and is excluded from planning context (§6.3). |
| Directive→Mandate pipeline (`/docs/04-ceo-protocol.md` §Phase 1–2) | Entirely unchanged. Kai classifies and forms the Mandate from the Directive *body*. The body is the confirmed transcript. Kai never sees that it was spoken. |
| The clarify step (`/docs/01-agent-architecture.md`; `04-ceo-protocol.md` Phase 1) | Unchanged and complementary. If the confirmed transcript is ambiguous, Kai's existing plan-changing clarification applies exactly as it does for typed text. Voice does not add a clarify step; it inherits the one there is. |
| Local models via ONNX Runtime, `bge-small` precedent (`/docs/01-technical-architecture.md` §2) | The STT model is loaded and run through the same on-device pattern the embedding model established in 2.0. M19 introduces no new model-execution mechanism, only a new model. |
| Renderer boundary (`/docs/01-technical-architecture.md` §4) | Preserved. The renderer receives **text** (partial and final transcript) over typed IPC events, exactly as it receives streamed tokens today. It never receives audio and never gets microphone-to-network authority. Capture is kernel-side. |
| No-telemetry (ADR-0009) | Reinforced, not stretched. The egress allowlist gains **no** host for STT. The CI test that asserts the allowlist contains nothing but configured model providers and the update endpoint (`/docs/07-security-model.md` §10) still passes, because audio has no host to go to. |
| Companion (M18) | The mobile surface is a second place the composer lives. On the Companion, capture and transcription happen on-device (mobile ONNX runtime); the confirmed transcript submits the same `engagement.create`. Audio never leaves the phone. M18 is a dependency **only** for this surface (§16.1, §00-M18-AUDIT). |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | A spoken Directive produces the **same Mandate** as the typed equivalent | ADR-0053 (confirm/edit); one pipeline (§1.3); `input_method` excluded from the Context Frame (§6.3, §11.3); AC1 |
| G2 | Audio **never leaves the device** | ADR-0052; `sidra-voice` holds no `net.*` capability; STT off the model-gateway path; egress allowlist unchanged; CI no-egress test (§7, §18); AC2 |
| G3 | Speech-to-text is **local and on-device** | ADR-0052; ONNX Runtime, whisper-class model, the `bge-small` shipping precedent (`/docs/01-technical-architecture.md` §2); §8 |
| G4 | Voice is **only an input method** — no new Directive path | submission via the existing `engagement.create` (§6, §12); downstream unchanged (§11.3); AC9 |
| G5 | The transcript is **principal input, not untrusted content** | `trust = principal` (§7); no content-fence; AC5 |
| G6 | It **works offline** | the model is local; no network on the path; §14 F3; AC2/AC6 |
| G7 | It **degrades cleanly to typing** when the model is unavailable | §5 fallback state; the composer is a normal text box without voice; §14 F2; AC7 |
| G8 | It is available on **desktop and the Companion (M18)** | §6 desktop path; §6.4 + E5 Companion path; AC10 |
| G9 | Everything is **additive** | §11 forward-only migrations; `input_method` defaults `'typed'`; a Firm that never speaks behaves exactly as pre-M19; AC-additivity |

---

## 3. What this milestone does *not* build

Stated explicitly because the failure modes here are omissions, not commissions.

- **No wake word, no always-listening.** Capture begins on an explicit Principal act (a press, a hotkey, a tap)
  and ends on an explicit act. The microphone is never open otherwise. There is no background listening state
  in the machine (§5).
- **No voice output / TTS.** The Firm does not speak back. Briefs render as text, unchanged (M18).
- **No speaker identification, no biometrics.** The Firm does not model *who* is speaking; it transcribes what
  was said. There is one Principal per Seat (multi-Seat is M21); voice does not touch identity.
- **No voice commands for navigation or control** ("open the ledger", "approve that"). Voice produces a
  Directive body only. Acting on Approval Requests by voice is out of scope; approvals stay a deliberate,
  visual, tap/click act (M18). This keeps voice from becoming a second control surface with its own authority.
- **No transcription of ingested audio files.** M19 transcribes the Principal's live spoken Directive, not
  arbitrary audio documents. Ingesting a recording is a separate, untrusted-content problem (it would carry
  `trust = untrusted`, and would need its own ADR), and it is not this milestone.

---

## 4. Domain model

### 4.1 Core types

```
CaptureId(Ulid)                 // one microphone session; sortable by start time
TranscriptText(String)          // the text the model produced / the Principal confirmed — the ONLY output that crosses to the renderer
ModelId(String)                 // the local STT model, e.g. "whisper-base.en.onnx"
ModelVersion(SemVer)
InputMethod = Typed | Voice     // provenance of a Directive body; defaults Typed
RetentionMode = DiscardAfterTranscribe | RetainLocal   // audio-retention policy; default DiscardAfterTranscribe
AudioRef(VaultPath)             // a LOCAL Vault path to retained audio, when retention is on — NEVER a URL, never uploaded
```

Note what is **absent**: there is no `AudioBytes` type that leaves `sidra-voice::capture`, no `AudioUrl`, no
`RemoteTranscript`. Audio exists as an in-memory buffer inside the capture module and, optionally, as an
encrypted local file; it has no type that can be serialized to an event, a command response, or the network.

### 4.2 `VoiceCapture` — the session record

```
VoiceCapture {
    id:              CaptureId,
    started_at:      Timestamp,
    ended_at:        Option<Timestamp>,
    model_id:        ModelId,
    model_version:   ModelVersion,
    transcript:      Option<TranscriptText>,   // final transcript once TRANSCRIBING completes; None while capturing
    transcript_hash: Option<Hash>,             // sha-256 of the FINAL transcript — for the audit chain, so audio need not be
    retention_mode:  RetentionMode,            // DiscardAfterTranscribe by default
    audio_ref:       Option<AudioRef>,         // Some only when RetainLocal AND not yet purged; always a local path
    purge_at:        Option<Timestamp>,        // when retained audio is scheduled to be purged
    directive_id:    Option<DirectiveId>,      // set at submit; links this capture to the Directive it produced
    state:           CaptureState,             // §5
}
```

`VoiceCapture` is the whole footprint of a spoken Directive: *when* it was spoken, *by which model* it was
transcribed, *what text* resulted (as a hash for audit and, transiently, as text for the composer), *what
became of the audio* (discarded, or retained locally with a purge date), and *which Directive* it became. It
holds no audio bytes and no network reference — by construction, there is no field for either.

### 4.3 The confirmed Directive

At submission there is no "voice Directive" type. There is a `directives` row (`/docs/04-database-design.md` §2)
whose `body` is the confirmed transcript, whose `source` is `'principal'` (unchanged — the Principal is the
source whether they typed or spoke), and whose new `input_method` is `'voice'`. That is the only difference
between a spoken and a typed Directive in the entire system, and it is inert to planning (§6.3).

### 4.4 Relationships

```
VoiceCapture 1 ──── 0..1 TranscriptText     (the final transcript; None until TRANSCRIBING completes)
VoiceCapture 1 ──── 0..1 AudioRef           (present only under RetainLocal, only until purge; always LOCAL)
VoiceCapture 1 ──── 0..1 Directive          (set at submit; a capture may be discarded and never become one)
Directive    1 ──── 1    InputMethod        ('voice' here; 'typed' for everything pre-M19 and for typed intake)
Directive    (body) ──── the SAME engagement.create → the SAME Directive→Mandate pipeline (M6)
```

---

## 5. State machine

One capture session moves through these states. The microphone is open in exactly one state (`CAPTURING`) and
audio exists in memory in exactly two (`CAPTURING`, `TRANSCRIBING`); everywhere else there is only text.

```
                 begin_capture (model present, mic granted)
      IDLE ───────────────────────────────────────────────► CAPTURING
        │                                                       │  (streams partial transcript TEXT to the composer)
        │  model absent / mic denied                            │  stop_capture
        ▼                                                       ▼
   UNAVAILABLE ──► fall back to typing                      TRANSCRIBING
   (composer is a normal text box; a Directive               │  (finalize decode; buffer released after)
    can still be issued — G7)                                 │  final transcript ready
                                                              ▼
                                                            DRAFT ──────────────────────────────┐
                                                              │   edit* (text mutates in place;  │ cancel / discard
                                                              │          no state change)         ▼
                                                              │                                DISCARDED
                                            submit            │        (audio already gone or purged per policy;
                                     (engagement.create,      │         partial transcript dropped; nothing submitted)
                                      input_method='voice')   │
                                                              ▼
                                                          SUBMITTED
                                                              │
                                                              ▼
                       ┌──────────────────────────────────────────────────────────────────────┐
                       │  EXISTING Directive pipeline (M6, UNCHANGED):                          │
                       │  persist directives row + event → Engagement(state=clarifying)         │
                       │  → Turn agent.exec (classify+mandate) → Mandate proposed → …           │
                       └──────────────────────────────────────────────────────────────────────┘
```

### 5.1 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| Idle | `begin_capture` | Capturing | STT model loadable **and** OS microphone permission granted |
| Idle | `begin_capture` | Unavailable | model absent/unloadable **or** mic permission denied |
| Capturing | (audio frames) | Capturing | mic open; partial transcript pushed to composer as text |
| Capturing | `stop_capture` | Transcribing | — |
| Capturing | `cancel_capture` | Discarded | audio buffer dropped; nothing persisted |
| Transcribing | `finalize_ok` | Draft | final transcript produced; audio buffer released; retention policy applied |
| Transcribing | `finalize_fail` | Unavailable | decode failed; buffer dropped; fall back to typing |
| Draft | `edit` | Draft | in-place text change; no state change |
| Draft | `submit` | Submitted | body = confirmed transcript; dispatched to the existing `engagement.create` |
| Draft | `discard` | Discarded | transcript dropped; audio already discarded or purge honored |
| Unavailable | `type_directive` | (leaves the voice machine) | the composer submits typed text via the same `engagement.create` |
| Submitted | (handoff) | (leaves the voice machine) | the Directive pipeline (M6) takes over, unchanged |

### 5.2 Invariants

1. **The microphone is open only in `CAPTURING`.** No state — and specifically no `IDLE` or background state —
   holds an open mic. There is no always-listening mode (§3).
2. **Audio exists only in `CAPTURING` and `TRANSCRIBING`, and only in memory** (plus an optional encrypted
   local file under `RetainLocal`). On entry to `Draft` the in-memory buffer is released. Audio never exists in
   `Draft`, `Submitted`, or `Discarded` except as a purposely-retained, purposely-local, purposely-purgeable
   file the Principal opted into.
3. **Nothing is submitted from any state but `Draft`.** A capture that is cancelled or fails produces no
   Directive. `SUBMITTED` is reachable only through the Principal's explicit confirm-and-submit act on the
   `Draft`.
4. **`Unavailable` never blocks a Directive.** It is a clean fall-through to typing, not an error state that
   traps the Principal (G7). The ability to issue a Directive does not depend on the microphone or the model.

---

## 6. Component structure

```
                    ┌──────────────────────────────────────────────────────────────────┐
   OS microphone    │                     sidra-voice  (kernel-side)                    │
   (native audio) ─►│  capture                                                          │
                    │    │  ring buffer + VAD endpointing (in-memory audio; never       │
                    │    │  crosses to the renderer, never to the network)              │
                    │    ▼                                                              │
                    │  model                                                            │
                    │    │  ONNX Runtime, whisper-class; loaded ON DEMAND at            │
                    │    │  begin_capture, RELEASED after finalize (§8)                  │
                    │    ▼  streaming decode                                            │
                    │  transcribe ──► partial + final transcript  (TEXT ONLY)           │
                    │    │                              │                               │
                    │    │                    partial pushed ≤N Hz (text)               │
                    │    ▼                              ▼                               │
                    │  retention              ┌───────────────────────────────────────┐ │
                    │  (audio purge policy;   │  RENDERER / COMPANION                  │ │
                    │   discard by default)   │  the SAME Directive composer,          │ │
                    │                         │  transcript shown, EDITABLE            │ │
                    └─────────────────────────┴───────────────┬───────────────────────┘ │
                                                              │ Principal confirms / edits
                                                              ▼
                                        engagement.create(body, source='principal',
                                                          input_method='voice')   ◄── EXISTING command (M6)
                                                              │
                                                              ▼
                              Orchestrator: persist directives row + event → Engagement(clarifying)
                              → Turn agent.exec (classify + mandate) → Mandate proposed → …   (M6, UNCHANGED)
```

Internal modules of `sidra-voice`:

| Module | Responsibility |
|---|---|
| `capture` | native OS audio input; ring buffer; voice-activity endpointing; holds audio in-memory only; drops it on finalize/cancel |
| `model` | load an ONNX/whisper-class model on demand; streaming decode; release the model after finalize; bound peak memory (§8) |
| `transcribe` | drive `capture`→`model`; emit partial (streamed, ephemeral) and final (durable-hash) transcript; the state machine (§5) |
| `retention` | apply the audio-retention policy: discard-after-transcribe by default; optional local retain-N-days; purge; never upload |
| `submit` | the thin seam that hands a **confirmed transcript** back to the caller for `engagement.create`; sets `input_method='voice'`; owns *no* orchestrator logic |
| `conformance` | the exit-criterion harness: the Mandate-equivalence proof and the no-egress assertion (§18) |

**Dependency direction (ADR-0011).** `packages/domain ← services/voice ← apps/*`. `services/voice` depends on
`services/store` (persist `VoiceCapture` and the retention record) and `services/security` (the redaction
filter, and the fact that voice is granted **no** `net.*` capability). It does **not** depend on
`services/orchestrator` or `services/mission` — submission is performed by the app/renderer via the existing
`engagement.create`, exactly as for typed text. The absence of that edge is the same compile-time property M16
enforced for `services/connectors`, and it is checked in CI (AC12). It is what keeps "voice is only an input
method" true at the level of the dependency graph: the crate that hears you cannot reach the planner.

### 6.1 Why capture is kernel-side and not in the renderer

The renderer is treated as compromised (`/docs/07-security-model.md` §2) and has no network and no filesystem
by ACL (`/docs/01-technical-architecture.md` §4). Capturing audio in the WebView (`getUserMedia`) and shipping
bytes down to the kernel would put the Principal's raw voice in the least-trusted process and would create an
audio object in a layer that the threat model assumes an attacker controls. Instead the **kernel** opens the
microphone through a native audio interface, transcribes locally, and sends only **text** up to the renderer —
the same direction and the same trust posture as streamed model tokens (`/docs/01-technical-architecture.md`
§8). The renderer never holds audio and never holds mic-to-network authority.

### 6.2 Why `sidra-voice` does not call the Orchestrator

If `sidra-voice` submitted Directives itself, it would need a dependency on `sidra-orchestrator`, and "voice is
just an input method" would be a claim contradicted by the import graph. Worse, it would open the door to a
voice-specific submission path that could, over time, diverge from the typed path — the exact regression G4
forbids. So `sidra-voice` ends at a **confirmed string**. The composer (which already depends on the kernel and
already calls `engagement.create` for typed text) submits it. There is one door, and voice knocks on it the
same way typing does.

### 6.3 Why `input_method` is excluded from the Context Frame

`input_method` is recorded on the `directives` row and on the `DirectiveCreated` event as provenance. It is
**deliberately not** placed into the Context Frame that the Memory Service assembles for the classify+mandate
Turn (`/docs/01-technical-architecture.md` §5; memory doc §5). Kai forms the Mandate from the Directive *body*
and the retrieved Canon/Decisions — never from *how* the body was entered. This exclusion is what makes AC1
hold as an equality rather than an approximation: given the same confirmed body, the Turn assembles a
byte-identical Context Frame whether the body was typed or spoken, so the Mandate is the same. The exclusion is
a tested invariant (AC4), not a convention.

### 6.4 The Companion (M18) surface

On the Companion, the same three roles exist, mapped to the mobile runtime: on-device audio capture, an
on-device ONNX/whisper-class model (mobile build), and the mobile composer that shows and edits the transcript
and calls `engagement.create` over the Companion's existing kernel channel. Audio is captured and transcribed
on the phone and never leaves it — the same ADR-0052 guarantee, enforced the same way (no `net.*` on the mobile
voice path, no cloud STT). This surface is gated on M18 (see `00-M18-AUDIT.md`); the desktop surface depends
only on M6 and is independently shippable.

---

## 7. Security

Audio is the highest-sensitivity input the Firm accepts, and voice is the first feature whose *raw* input a
network could plausibly want. Every mitigation below is an application of an existing control
(`/docs/07-security-model.md`), plus one new hard constraint (audio has no egress path at all).

| Threat | How M19 addresses it |
|---|---|
| **TA — Audio exfiltration** (new; a specialization of T2/T3). Raw voice captured, then leaked over the network. | Capture and transcription are entirely kernel-side and in-memory (§6.1). `sidra-voice` is granted **no** `net.*` capability, so it *cannot* open a socket. The STT path does not touch `sidra-models` (the only crate with provider egress). Audio is never serialized to an event, log, stored parameter, or IPC-to-renderer message — there is no type that would let it (§4.1). The egress allowlist (ADR-0009, `/docs/07-security-model.md` §10) gains no STT host, so the existing CI allowlist test still asserts "nothing but configured providers + update endpoint." A dedicated no-egress test asserts a full capture→transcribe→submit makes zero network calls (§18, AC2). |
| **Cloud-STT drift** (a supply/maintenance threat, T5-shaped). A future change swaps the local model for a cloud API "because it's more accurate." | ADR-0052 makes local-only a recorded decision, not an implementation detail. Structurally: no STT provider adapter exists; the model gateway is off the path; `sidra-voice` has no `net.*` capability. The no-egress CI test fails the build if audio ever gains a host (§18). The reversal cost is deliberately made visible in ADR-0052. |
| **Mis-transcription → wrong Mandate.** The model drops a "not"; the Firm acts on the inverse of what was said. | ADR-0053: the transcript is shown and editable before submit; equivalence is defined against the **confirmed** text. The Principal always sees the text and can correct it. A mishearing is a correction in the composer, not a wrong Mandate (§14 F1, AC3). |
| **Trust confusion — treating spoken input as untrusted, or as *more* trusted than typed.** | The transcript carries `trust = principal` — identical to typed text (`/docs/07-security-model.md` §7.1). It is not wrapped in the content-fence used for ingested documents, and it does not grant any authority a typed Directive would not. A spoken "delete the repo" is exactly as (un)authorized as a typed one: it still becomes a Directive whose plan may include class-3 effects that still require approval. Voice grants nothing (AC5). |
| **Model supply chain** (T9). A tampered STT model binary. | The model ships inside the signed, notarized app bundle (`/docs/01-technical-architecture.md` §2 packaging), or, if fetched, only from the signed update endpoint and verified — never downloaded at capture time from an arbitrary host. Its hash is pinned and recorded on the capture (`model_id`, `model_version`). |
| **Audio at rest theft** (T4). Retained audio on a stolen laptop. | Default retention is **discard-after-transcribe** — most captures leave no audio at all. When `RetainLocal` is enabled, audio is written to the SQLCipher-encrypted Vault like any file (`/docs/07-security-model.md` §8), scoped, purgeable on a schedule, and covered by auto-lock. It is never uploaded (there is no path to upload it). |
| **Renderer compromise reaching the mic.** A compromised WebView tries to open the microphone or read audio. | The renderer has no audio capability and no mic-to-network authority; capture is kernel-side and initiated by a capability-checked command (§6.1). The renderer can *request* capture start; it can never *hold* audio. |

**The single choke point still holds.** A spoken Directive becomes a tool-free intake event exactly as a typed
one does; when its resulting Work Orders make effectful tool calls, every one still passes
`PermissionBroker::authorize_action` (`/docs/07-security-model.md` §4). Voice adds an input front-end; it adds
no effect and it removes no check. Class-3 effects that a spoken Directive's plan proposes are, as always,
Approval Requests (`/docs/07-security-model.md` §5).

---

## 8. Local transcription (ADR-0052 in mechanism)

1. **The model.** A whisper-class speech-to-text model exported to ONNX, run through ONNX Runtime — the same
   on-device execution path the `bge-small` embedding model established for 2.0 (`/docs/01-technical-architecture.md`
   §2). A quantized `base`/`small`-class English (and, later, multilingual) model is chosen to bound peak
   memory and latency; the exact model is a shipped default (an ADR-worthy choice only if it changes a budget).
2. **On-demand load, prompt release.** The model is **not** resident at idle. It is loaded at `begin_capture`
   and released on entry to `Draft`. This is what keeps voice inside the M8 idle-memory budget (≤400 MB idle,
   `/MASTER_IMPLEMENTATION_GUIDE.md` §3.16): when the Principal is not speaking, the model occupies nothing.
   Peak memory occurs only during an active `CAPTURING`/`TRANSCRIBING` session and is bounded by the chosen
   model's quantized footprint (§15).
3. **Streaming decode.** Audio frames are decoded incrementally so a **partial transcript** can stream to the
   composer as the Principal speaks (text only, pushed at a coalesced rate like streamed tokens,
   `/docs/01-technical-architecture.md` §8). The **final transcript** is produced on `stop_capture`, after
   which the audio buffer is released.
4. **No network, ever.** The decode runs entirely locally. There is no fallback to a remote service on low
   confidence — low confidence is surfaced to the Principal in the editable transcript, not sent anywhere
   (§14 F1). The model has no host; `sidra-voice` has no `net.*` capability.

---

## 9. Submission and Mandate equivalence (ADR-0053 in mechanism)

On the Principal's confirm-and-submit from `Draft`:

1. **The body is the confirmed transcript** — the exact string in the composer, including any edits.
2. **The composer calls the existing `engagement.create`** with `body = <confirmed transcript>`,
   `source = 'principal'`, and `input_method = 'voice'`. This is the same command the composer calls for typed
   text; the only added argument is the provenance field.
3. **The Orchestrator persists the `directives` row and the `DirectiveCreated` event**, then creates the
   Engagement in `clarifying` and runs the classify+mandate Turn — all exactly as specified in
   `/docs/01-technical-architecture.md` §5 and `/docs/04-ceo-protocol.md` Phases 1–2. Nothing in this path is
   modified by M19.
4. **The classify+mandate Turn's Context Frame excludes `input_method`** (§6.3). Given the same confirmed body,
   the Frame is byte-identical to the typed case, so the Mandate is the same.

**Equivalence, stated as the property the exit-criterion test asserts:** take a fixed transcript string `S`.
Submit `S` through `engagement.create` with `input_method='typed'`, capture the resulting Mandate `M_typed`.
Submit the *same* `S` with `input_method='voice'`, capture `M_voice`. Then `M_voice == M_typed` (same
objective, success criteria, constraints, staffing, sequence — the Mandate structure of `/docs/04-ceo-protocol.md`
Phase 2). The equality is over the confirmed text, which is why ADR-0053's confirm step is load-bearing: it
makes the two inputs *the same string* at the moment of submission (AC1).

> Determinism note. The Mandate is produced by a `reasoner`-class Turn and is only as deterministic as that
> Turn. The M19 claim is **not** "voice makes the Mandate deterministic"; it is "voice does not *change* the
> Mandate relative to typing the same confirmed text." The test feeds an *identical confirmed string* down both
> paths under identical model settings, isolating the input method as the only variable. Under the deterministic
> classify harness (fixed seed/model, as the Mission Engine harness does) the Mandate is byte-identical;
> otherwise the assertion is structural field equality. Both are specified in §18.

---

## 10. Audio retention (part of ADR-0052)

| Mode | Behaviour | Default |
|---|---|---|
| `DiscardAfterTranscribe` | The in-memory audio buffer is released on entry to `Draft`; no audio is written anywhere. Only the transcript (text) and its hash survive. | **Yes** |
| `RetainLocal` | The audio is written to the SQLCipher-encrypted Vault under a local `AudioRef`, with a `purge_at` (default: a short, configurable window). It is **never** uploaded — there is no code path to upload it. The Principal may purge on demand; the Night Shift purges on schedule. | opt-in |

Retention is a Principal preference, defaulting to the most private option (no audio kept). Under either mode,
the **audit chain** records the capture via the transcript *hash*, so the fact and provenance of a spoken
Directive are durably attested without keeping the audio. A `VoiceAudioPurged` event records every purge on the
chain (§11.2). A Principal who abandons Sidra OS keeps a readable record — in the Vault Markdown mirror — that a
Directive was spoken, when, and what text it became; never the audio, which is gone by default and purgeable by
policy when it is not.

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 Migrations — additive, forward-only, band `0037`–`0038`

Two migrations, both additive. A Firm that never uses voice is byte-for-byte unaffected: `input_method`
defaults to `'typed'`, and `voice_captures` stays empty.

| # | Migration | Purpose |
|---|---|---|
| `0037` | `0037_directive_input_method.sql` | Add `input_method TEXT NOT NULL DEFAULT 'typed' CHECK (input_method IN ('typed','voice'))` to `directives`. **`source` is unchanged** — a spoken Directive is still `source='principal'`; `input_method` records the *modality*, which `source` does not (`/docs/04-database-design.md` §2 `source IN ('principal','automation','agent','brief_action')` answers *who*, not *how*). Additive, defaulted → pre-M19 rows and behaviour are identical. |
| `0038` | `0038_voice_captures.sql` | Add `voice_captures`: `id`, `directive_id` (nullable until submit), `model_id`, `model_version`, `transcript_hash`, `retention_mode`, `audio_ref` (nullable, **a local Vault path only**), `purge_at`, `created_at`. **No audio bytes and no network reference are representable** — there is no column for either. This is the local audio-retention/provenance record. |

> Why not reuse `source`? Because `source` records the actor/origin (`principal` vs `automation` vs `agent` vs
> `brief_action`), and a spoken Directive is still *principal*-originated. Overloading `source` with a modality
> would repurpose a column's meaning — forbidden by the migration policy (`/docs/04-database-design.md` §10,
> `/MASTER_IMPLEMENTATION_GUIDE.md` §3.3). One new, defaulted, additive column is the minimal honest change.

Migration numbering continues the band assigned to 2.5 "Field" after M16's `0025`–`0029` and the intervening
milestones' allocations; M19 takes `0037`–`0038` per `/MILESTONE_REGISTRY.md` sequencing. Each migration is
forward-only, idempotent, independently deployable, and ships with a test that runs it against a fixture Vault
from the previous release (`/docs/04-database-design.md` §10).

### 11.2 Domain events

Every event carries `actor = 'principal'` and lands on the hash chain (ADR-0002). **No event payload ever
contains audio.** The transcript *text* appears where it is the durable fact (it is principal-trust text); the
audio never does.

- `VoiceCaptureStarted` — `capture_id`, `model_id`, `at`. (No audio.)
- `VoiceCaptureFinalized` — `capture_id`, `transcript_hash`, `model_id`, `model_version`, `at`. (Hash, not audio.)
- `VoiceCaptureDiscarded` — `capture_id`, `at`. (Cancelled or discarded before submit.)
- `VoiceAudioPurged` — `capture_id`, `at`. (Retained audio purged, on demand or by schedule.)
- On submit, the **existing** `DirectiveCreated` event carries `input_method = 'voice'` and links to the
  `capture_id`. There is **no** new "voice Directive submitted" event kind — that would be a second pipeline in
  the event log. The one durable Directive event is the one the typed path already emits.

Partial transcripts (§8.3) are streamed to the renderer as ephemeral UI updates (like streamed tokens) and are
**not** individually chained events — only the final transcript's hash is durable.

### 11.3 Downstream is untouched

`mandates`, `work_orders`, `workflows`, `deliverables`, `briefs` (`/docs/04-database-design.md` §2, §7) get
**no** new column and **no** new value from M19. The Mandate does not record that its Directive was spoken; the
Brief does not mention it. `input_method` lives on the `directives` row and its event, and stops there. This is
the persistence-level statement of G4: voice is an input front-end, and the front-end's provenance does not
propagate into the plan or the report.

### 11.4 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── directives/
    └── <ulid>.md          existing: the Directive body, timestamp, resulting engagement —
                           now with an "Input: voice" line and the transcribing model, when spoken.
                           NEVER the audio.
```

Written on the existing Directive-mirror path, not a new one. A Principal who leaves keeps a human-readable
record that a Directive was spoken and what text it became; the audio, absent by default, is never in the
archive.

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `voice.begin_capture()` → `CaptureId` | Idle → Capturing (or Unavailable) | kernel-side; opens the mic and loads the model on demand; **class 0** (local, no egress) — capture itself reaches nothing external |
| `voice.stop_capture(capture_id)` → `TranscriptDraft` | Capturing → Transcribing → Draft | returns the final transcript **text**; releases the audio buffer; applies retention |
| `voice.cancel_capture(capture_id)` | Capturing → Discarded | drops the audio buffer and any partial transcript; persists nothing |
| `voice.get_transcript(capture_id)` → `TranscriptDraft` | (query) | current partial/final transcript **text** for the composer; never returns audio |
| **`engagement.create(body, source, input_method)`** | **the EXISTING command (M6)** | submission of a spoken Directive is this call with `input_method='voice'`; **M19 adds no submit command** |
| `voice.set_retention(mode, purge_window)` | (preference) | sets `DiscardAfterTranscribe` (default) or `RetainLocal`; a Principal preference, logged |
| `voice.purge_audio(capture_id)` | (retained → purged) | deletes retained local audio; emits `VoiceAudioPurged` |

### 12.2 Queries

| Query | Returns |
|---|---|
| `voice_model_status()` | whether the STT model is present/loadable — drives the composer's voice affordance and the fallback (G7) |
| `list_voice_captures(engagement?)` | capture provenance (transcript hashes, model, retention state) — never audio |

### 12.3 API rules

1. **No API returns audio.** Not raw frames, not a decoded waveform — only transcript **text** where text is
   required, and never over IPC to the renderer as anything but text. There is no command that emits audio.
2. **There is no `voice.submit`.** Submission is `engagement.create`, unchanged. Voice ends at a confirmed
   string; the caller submits it through the one Directive door (§6.2, G4).
3. **`begin_capture` is capability-checked and Principal-initiated.** Capture never begins without an explicit
   Principal act; there is no wake word and no ambient listening (§3, §5.2.1).
4. **Every capture start / finalize / discard / purge is an audited event** on the hash chain (§11.2); audio is
   never in a payload.

---

## 13. Sequence diagrams

### 13.1 The exit-criterion path — spoken Directive → the same Mandate as typed

```
Principal      sidra-voice(kernel)      composer        Orchestrator(M6)        Kai (classify+mandate)
   │ press-to-talk │                       │                  │                        │
   ├──────────────►│ begin_capture         │                  │                        │
   │  (speaks)     │ open mic, load model  │                  │                        │
   │               │ stream partials ─────►│ show partial text│                        │
   │ release       │                       │                  │                        │
   ├──────────────►│ stop_capture          │                  │                        │
   │               │ finalize decode       │                  │                        │
   │               │ RELEASE audio buffer  │                  │                        │
   │               │ final transcript ────►│ show editable text                        │
   │  (edits "Q2"→"Q3", confirms) ────────►│                  │                        │
   │               │                       │ engagement.create(body, principal, voice) │
   │               │                       ├─────────────────►│ persist directive+event│
   │               │                       │                  │ (input_method NOT in Context Frame)
   │               │                       │                  ├──── classify+mandate ─►│
   │               │                       │                  │◄──── Mandate ───────────┤
   │               │                       │◄─ mandate.proposed (SAME as typed body S) ─┤
   │  audio never left the device · the Mandate equals the typed-S Mandate  (AC1, AC2)
```

### 13.2 Mis-transcription caught at the confirm step (ADR-0053)

```
Principal      sidra-voice          composer
   │ speaks: "do NOT ship on Friday"│
   ├──────────────►│ transcribe     │
   │               │ (model drops "NOT")
   │               │ final: "do ship on Friday" ─► show EDITABLE
   │  reads it, edits back to "do not ship on Friday", confirms
   │               │                │ engagement.create(body="do not ship on Friday", …)
   │  the confirmed text is what becomes the Directive — the mishearing never reached a Mandate (F1, AC3)
```

### 13.3 Model unavailable → clean fallback to typing (G7)

```
Principal      sidra-voice          composer
   │ press-to-talk │                │
   ├──────────────►│ begin_capture  │
   │               │ model absent   │
   │               │ → Unavailable ─► composer stays a normal text box, voice affordance disabled
   │  types the Directive, submits via the SAME engagement.create — no capability lost (F2, AC7)
```

### 13.4 No network present (offline) — voice still works

```
Principal      sidra-voice(local)   composer        Orchestrator
   │ speaks (device is offline)     │                  │
   ├──────────────►│ local decode   │  (no network touched at any point)
   │               │ final text ───►│ editable, confirm │
   │               │                │ engagement.create ├─► Engagement queued locally (offline degrade, tech-arch §9)
   │  transcription and intake are fully local; the Directive is captured with no connectivity (F3, AC2/AC6)
```

---

## 14. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | Model mishears (drops a "not", wrong homophone) | The transcript is shown editable before submit (ADR-0053); the Principal corrects it; only the confirmed text is submitted. A mishearing is a UI correction, never a wrong Mandate (§13.2, AC3). |
| F2 | STT model absent or fails to load | `Unavailable`; the composer stays a normal text box; the Directive is typed and submitted via the same `engagement.create`. No Directive capability is lost (§13.3, AC7). |
| F3 | No network | Voice works fully — the model is local and nothing on the path needs the network. Intake proceeds; the Engagement queues per the existing offline degrade (`/docs/01-technical-architecture.md` §9). This is the point (§13.4, AC2/AC6). |
| F4 | OS microphone permission denied | `Unavailable`; surfaced plainly; fall back to typing. |
| F5 | Audio device error mid-capture | Capture fails cleanly; the in-memory buffer is dropped; `Discarded` or `Unavailable`; fall back to typing. No partial audio persists. |
| F6 | Very long utterance / memory pressure | Capture duration is bounded; on the bound the session stops gracefully and produces the transcript so far for confirmation; peak memory stays within the model's budget (§15). |
| F7 | Transcript is ambiguous (well-transcribed but unclear) | Not a voice problem. The confirmed body enters the existing pipeline; Kai's existing clarify step (`/docs/04-ceo-protocol.md` Phase 1) asks the plan-changing question, exactly as for ambiguous typed text. |
| F8 | Companion (M18) not yet available | The Companion voice surface (E5) is gated on M18; the **desktop** surface depends only on M6 and ships independently (§16, `00-M18-AUDIT.md`). |
| F9 | A contributor tries to route STT through a cloud API | No path exists: no provider adapter, no `net.*` on `sidra-voice`, model gateway off the path. The no-egress CI test fails the build (§18, AC2). ADR-0052 records why. |

---

## 15. Performance and offline

- **Idle cost is zero.** The STT model is loaded on demand and released after finalization (§8.2), so it does
  not count against the M8 idle-memory budget (≤400 MB idle). When the Principal is not speaking, voice
  occupies nothing.
- **Peak cost is bounded and active-only.** Memory rises only during a live `CAPTURING`/`TRANSCRIBING` session,
  bounded by the quantized model's footprint (a `base`/`small`-class model, chosen to fit the budget). This is
  active use, not idle residency.
- **Latency budget.** Streaming partials appear within a small, coalesced interval of speech (≈≤300 ms
  perceived), and the final transcript is ready within ≈1–2 s of `stop_capture` for a typical Directive
  utterance, at a real-time factor < 1 on target hardware. These are budgets, gated in CI on a fixture-audio
  corpus (§18).
- **It never blocks a Turn or the scheduler.** Transcription runs on a dedicated, low-priority executor that
  yields to live agent Turns — the same posture as the embedding/index pool (`/docs/01-technical-architecture.md`
  §3, `index-pool` always yields to a live Turn). A capture in progress cannot starve the Firm's work.
- **Offline is a first-class, fully-supported state**, not a degraded one: the entire voice path is local, so
  disconnecting the network changes nothing about capture, transcription, or intake (Layer-6 replaceability in
  spirit — `/docs-v2/02-layer-model.md` §9 — though voice itself needs no integration).

---

## 16. Dependencies, assumptions, risks

### 16.1 Dependencies

| On | For |
|---|---|
| **M6 — Orchestrator + Directive→Mandate pipeline** | the intake M19 feeds: `engagement.create`, the Engagement lifecycle, the classify+mandate Turn. **The mandatory dependency**; the desktop surface needs only this. |
| **M18 — Companion** | the mobile surface (E5) where voice also lives. A dependency **only** for the Companion target; gated in `00-M18-AUDIT.md`. |
| M2 — event log | the hash-chained capture/finalize/discard/purge events; the `input_method` on `DirectiveCreated`. |
| M3 — security kernel | the redaction filter; the capability model that grants `sidra-voice` **no** `net.*`; the keychain-encrypted Vault for retained audio. |
| ONNX Runtime + a whisper-class model | the on-device transcription engine, per the `bge-small` precedent (`/docs/01-technical-architecture.md` §2). |

### 16.2 Assumptions

1. **The target platforms expose native microphone capture to the Rust core.** Desktop (macOS/Windows/Linux)
   audio input is available to the kernel; where a platform lacks it, voice reports `Unavailable` and the Firm
   falls back to typing (G7) — no capability is *lost*, only the voice affordance.
2. **A suitable ONNX/whisper-class model fits the memory/latency budget on target hardware** when quantized and
   loaded on demand. If the only adequate model would exceed the idle-or-peak budget, the answer is a smaller
   model, not a raised budget (`/MASTER_IMPLEMENTATION_GUIDE.md` §3.16) — or, at worst, voice ships desktop-only
   where the budget holds. This is an implementation-verification concern owned by AntiGravity.
3. **M6's `engagement.create` accepts an additive optional parameter** without changing behaviour when it is
   absent/`'typed'`. The migration (§11.1) and the pipeline's ignorance of `input_method` (§6.3) make this
   additive.
4. **The Companion (M18)** will expose a composer and a kernel channel that a mobile voice surface can reuse.
   Confirmed against M18's registry definition (read Briefs, act on approvals); its full contract is pending
   M18's architecture (`00-M18-AUDIT.md`).

### 16.3 Risks

| # | Risk | Mitigation |
|---|---|---|
| VR-1 | Local model accuracy is poor enough that the confirm/edit step becomes onerous | ADR-0053 makes correction cheap and the transcript honest; model choice is a shipped default that can improve without an ADR; poor accuracy degrades UX, never correctness (the wrong text is never submitted unconfirmed). |
| VR-2 | Someone adds a cloud-STT "just for accuracy" | ADR-0052; structural no-egress (no adapter, no `net.*`, gateway off path); no-egress CI test fails the build (§18, AC2, F9). |
| VR-3 | Audio leaks into a log, event, or the renderer | No serializable audio type crosses the module boundary (§4.1); redaction on every write path (M3); CI asserts no audio in events/logs and no audio over IPC (§18). |
| VR-4 | The model's idle residency blows the M8 memory budget | On-demand load + release (§8.2); quantized model; CI performance gate on idle memory unchanged and still green. |
| VR-5 | `input_method` leaks into the Mandate and makes voice behave differently | Context-Frame exclusion is a tested invariant (§6.3, AC4); the equivalence test (AC1) fails if it does. |
| VR-6 | Companion surface slips because M18 is only Defined | Desktop surface is independent of M18 and ships first; E5 is explicitly gated (§16.1, `00-M18-AUDIT.md`); the exit criterion is demonstrable on desktop against M6 alone. |
| VR-7 | Voice quietly becomes a control surface ("approve that") | Out of scope by §3; voice produces only a Directive body; approvals stay a visual, deliberate act (M18). |

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.** The two
exit-criterion claims — **AC1** (same Mandate) and **AC2** (audio never leaves) — are the last things to go
green (§18, E6).

| # | Claim | Proven by |
|---|---|---|
| AC1 | **A spoken Directive produces the same Mandate as the typed equivalent.** A fixed confirmed transcript `S`, submitted with `input_method='voice'` and with `input_method='typed'`, yields the same Mandate. | the Mandate-equivalence test: feed identical `S` down both paths under identical model settings; assert equal Mandate fields (byte-identical under the deterministic harness) (§9, §18) |
| AC2 | **Audio never leaves the device.** A full capture→transcribe→submit makes zero network calls; the egress allowlist contains no STT host; no audio appears in any event/log/IPC message. | the no-egress test: network stub asserting zero egress on the voice path; allowlist assertion; audio-absence scan over events/logs/IPC (§18) |
| AC3 | The transcript is shown and **editable before submit**; the submitted body equals the confirmed text, edits included. | confirm/edit test: mistranscribed fixture corrected in the composer; assert submitted `body` == confirmed text (§13.2) |
| AC4 | `input_method` is recorded on the `directives` row and `DirectiveCreated` event, and is **excluded from the Context Frame** of the classify+mandate Turn. | provenance test (row + event carry `'voice'`) + Context-Frame-exclusion assertion (§6.3, §11.3) |
| AC5 | The transcript carries `trust = principal` (not untrusted); **no content-fence** is applied; voice grants no authority typed text would not. | trust-tagging test; assert no fence wrapper; assert class-3 effects in a voice-originated plan still require approval (§7) |
| AC6 | Speech-to-text runs **locally via ONNX Runtime**; the model loads on demand and is released; no provider/network dependency exists on the path. | model-lifecycle test (load at capture, released after) + dependency assertion (no `sidra-models` / provider on the STT path) (§8) |
| AC7 | Model or mic **unavailable → clean fallback to typing**; a Directive can still be issued. | fallback test: force model-absent and mic-denied; assert `engagement.create` still reachable and voice affordance disabled (§13.3) |
| AC8 | **Audio retention**: default discard-after-transcribe leaves no audio; `RetainLocal` keeps audio only locally, encrypted, purgeable; every purge is an audited event. | retention test over both modes; assert no audio persisted under default; assert `VoiceAudioPurged` on the chain (§10) |
| AC9 | **No new Directive pipeline.** Submission uses the existing `engagement.create`; downstream (Mandate/Workflow/Brief) gains no column, value, or path from voice. | schema-diff assertion (downstream tables unchanged); path assertion (no voice-specific orchestrator route) (§11.3) |
| AC10 | **Companion (M18) surface**: voice captures and transcribes on-device and submits the same `engagement.create`; audio never leaves the phone. (Gated on M18.) | Companion voice test on-device; no-egress assertion on the mobile path; gated per `00-M18-AUDIT.md` |
| AC11 | Every capture start/finalize/discard/purge is an **audited event on the hash chain**; audio is never in a payload. | `audit.verify` over a voice-lifecycle fixture; audio-absence scan of payloads (§11.2) |
| AC12 | `services/voice` has **no dependency edge** to `services/orchestrator` or `services/mission`, and **no `net.*` capability**. | dependency-direction check + capability assertion in CI (mirrors M16 AC12) (§6, §18) |

---

## 18. Testing strategy and CI requirements

### 18.1 Test layers

| Layer | What it proves |
|---|---|
| Unit | value objects reject invalid construction; the state machine (§5) rejects illegal transitions; `input_method` defaults `'typed'`; retention modes behave |
| Component | `capture`→`model`→`transcribe` produces a transcript from fixture audio; the model loads on demand and is released; peak memory bounded |
| Integration | the full path: fixture audio → transcript → confirm/edit → `engagement.create` → Mandate; the fallback path; the offline path |
| Conformance (E6) | **the two exit-criterion proofs**: Mandate-equivalence (AC1) and no-egress (AC2) — the last tests to go green |

### 18.2 CI gates (new for M19, alongside the standing gates)

1. **No-egress test for audio (AC2).** A network stub asserts a full capture→transcribe→submit makes **zero**
   network calls; a scan asserts no audio in any event, log, stored parameter, or IPC message; the egress
   allowlist assertion (`/docs/07-security-model.md` §10) still passes with no STT host. **Fails the build** on
   any audio egress.
2. **Mandate-equivalence test (AC1).** Identical confirmed transcript `S` down the voice and typed paths under
   identical model settings; assert equal Mandate. Under the deterministic classify harness the assertion is
   byte-identical; otherwise it is structural field equality. **Fails the build** on divergence.
3. **Dependency-direction + capability check (AC12).** CI fails on any edge `services/voice → services/orchestrator`
   or `→ services/mission`, and on any `net.*` capability appearing in `sidra-voice` (mirrors M16's
   dependency-direction gate and `/MASTER_IMPLEMENTATION_GUIDE.md` §7).
4. **Context-Frame-exclusion assertion (AC4).** A test asserts `input_method` is absent from the assembled
   Context Frame for the classify+mandate Turn.
5. **Performance gates (§15).** Idle-memory budget unchanged and green (model not resident at idle);
   transcription latency within budget on the fixture-audio corpus.
6. **Audit coverage.** Every voice effectful/stateful path asserts its log entry (`/MASTER_IMPLEMENTATION_GUIDE.md`
   §7); `audit.verify` over a voice-lifecycle fixture (AC11).

---

## Appendix A — Glossary additions

- **Voice Directive** — a Directive whose body was produced by local speech-to-text and confirmed by the
  Principal before submission. Mechanically identical to a typed Directive except for the inert `input_method`
  provenance field.
- **Local STT** — on-device speech-to-text: an ONNX/whisper-class model run in the trusted Rust core through
  ONNX Runtime, holding no network capability. The `bge-small` embedding model is its shipping precedent.
- **Capture** — one microphone session, from `begin_capture` to `stop_capture`/`cancel_capture`. The only phase
  in which the microphone is open and audio exists.
- **Confirmed transcript** — the text in the Directive composer at the moment of submission, including the
  Principal's edits. Equivalence with the typed Directive is defined against this string (ADR-0053).
- **Discard-after-transcribe** — the default audio-retention mode: the in-memory audio buffer is released once
  the transcript is produced, leaving no audio anywhere.

## Appendix B — Repository placement

```
services/
└── voice/                      NEW — crate sidra-voice (kernel-side input front-end)
    ├── capture                 native audio in; ring buffer; VAD; in-memory audio only
    ├── model                   ONNX Runtime whisper-class; on-demand load/release
    ├── transcribe              drive capture→model; partial/final transcript; the state machine
    ├── retention               discard-after-transcribe (default) / retain-local; purge
    ├── submit                  hands a confirmed transcript to engagement.create; sets input_method
    └── conformance             Mandate-equivalence proof + no-egress assertion (exit criterion)

services/store/migrations/      EXTENDED — 0037_directive_input_method.sql, 0038_voice_captures.sql (forward-only)

apps/desktop/                   EXTENDED — the composer gains a press-to-talk affordance; shows/edits the transcript;
                                submits via the EXISTING engagement.create (no new submit path)

apps/companion/                 EXTENDED (M18) — the mobile composer gains the same affordance; on-device STT; E5

infrastructure/testing/
└── voice/                      NEW — mandate_equivalence.rs, no_egress.rs, confirm_edit.rs, fallback.rs,
                                offline.rs, retention.rs, context_frame_exclusion.rs
```

Dependency direction (ADR-0011): `packages/domain ← services/voice ← apps/*`. `services/voice` depends on
`services/store` and `services/security`; it does **not** depend on `services/orchestrator` or
`services/mission`, and it holds **no** `net.*` capability — both CI-enforced (AC12).

## Appendix C — Implementation position

M19 is the fourth milestone of 2.5 "Field", after the Connector Framework (M16), the Connector Suite (M17), and
the Companion (M18). Its mandatory dependency is **M6** (the Directive→Mandate pipeline), Documented and
complete; its **M18** dependency applies only to the Companion voice surface (E5), which is why E5 is gated and
the desktop surface leads (`00-M18-AUDIT.md`). M19 adds an input front-end, not a pipeline — and the discipline
of the milestone is resisting the features a "voice assistant" invites (wake words, voice control, TTS, cloud
accuracy), each of which would turn a narrow, provable input method into a second, unprovable command surface.

**Exit criterion.** A spoken Directive produces the same Mandate as the typed equivalent, and audio never
leaves the device — proven by test, not by configuration (AC1, AC2).
</content>
</invoke>
