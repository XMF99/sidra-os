# ADR-0052 — Speech-to-text is local-only; audio never leaves the device; voice produces a normal Directive

**Status:** Proposed · **Date:** M19 design phase · **Supersedes:** —

## Context

M19 lets the Principal speak a Directive instead of typing it. Speech has to become text somewhere, and there
are two places it can happen: a cloud speech API, or an on-device model. The choice is not a performance
detail — it decides whether the Principal's raw voice, captured by a process that reads their entire working
life, makes a network connection they did not ask for.

Sidra OS holds the Principal's working life in an encrypted local Vault. ADR-0009 promises no telemetry of any
kind, verifiable by packet capture. Principle 7 promises data sovereignty. The security model treats the
renderer, ingested documents, and model output as untrusted, and keeps every secret in the trusted Rust core
(`/docs/07-security-model.md` §2). Audio of the Principal speaking in their office is *more* revealing than the
text it becomes: it carries who else is in the room, tone, hesitation, and everything said before and after the
Directive.

There is also a second, structural question independent of where transcription runs: does voice get its *own*
Directive path, or does it feed the existing one? The technical architecture defines exactly one Directive
intake (`engagement.create`) that persists a `directives` row and runs the classify+mandate Turn
(`/docs/01-technical-architecture.md` §5; `/docs/04-ceo-protocol.md` Phases 1–2). A second path for spoken
input would be a second place where a spoken and a typed Directive could diverge into two behaviours — and the
exit criterion is precisely that they must not.

The local-model pattern already exists in the codebase: the `bge-small` embedding model runs on-device through
ONNX Runtime in 2.0 (`/docs/01-technical-architecture.md` §2). Speech-to-text is the same shape of problem — a
model shipped with the app, run in the core, reaching no network.

## Options

1. **Cloud speech API.** Send captured audio to a hosted transcription service. Most accurate, zero model to
   ship, and it puts the Principal's raw voice on the network — from the process that reads everything they do.
   It contradicts ADR-0009 (a network connection the Principal did not ask for), breaks the packet-capture
   claim, and makes audio an exfiltration channel by design. It also makes voice depend on connectivity.
2. **On-device speech-to-text, its own Directive path.** Local transcription (good on sovereignty), but voice
   gets a parallel intake with its own interpretation. Solves the audio problem, creates the divergence
   problem: two paths to a Mandate is two behaviours to keep in sync, and "same Mandate as typed" becomes a
   thing to test forever rather than a structural fact.
3. **On-device speech-to-text feeding the existing Directive intake unchanged.** Local transcription in the
   trusted core (ONNX/whisper-class, the `bge-small` precedent); the transcript enters the existing
   `engagement.create` as an ordinary body. One pipeline; audio never leaves the device; voice is an input
   front-end, not a second command surface.
4. **On-device, but resident model always loaded.** Local and single-pipeline, but a whisper-class model held
   resident would blow the M8 idle-memory budget (≤400 MB idle). Loading on demand and releasing after avoids
   this.

## Decision

**Option 3, with option 4's on-demand loading.** Speech-to-text is **local-only**, run in the trusted core
through ONNX Runtime with a whisper-class model shipped like `bge-small`, loaded on demand at capture start and
released after finalization. The resulting transcript enters the **existing** `engagement.create` Directive
intake unchanged; voice adds **no** Directive pipeline. **Audio never leaves the device**: `sidra-voice` holds
no `net.*` capability, the model gateway (`sidra-models`, the only crate with provider egress) is not on the STT
path, there is no STT provider adapter, and audio has no serializable type that could cross to the renderer, an
event, a log, or the network. The egress allowlist gains no host, so ADR-0009's packet-capture claim stands
unqualified for voice.

Retained audio, when the Principal opts into it, is written only to the local encrypted Vault, purgeable, and
is never uploaded — because there is no code path that could upload it.

## Consequences

**Accepted: we ship a model binary and we own its accuracy.** A local whisper-class model is less accurate than
the best cloud services, especially for accents, noise, and specialized vocabulary. We pay this knowingly; the
confirm/edit step (ADR-0053) makes the residual error a cheap correction rather than a wrong Mandate. Model
choice is a shipped default that can improve over releases without an ADR.

**Accepted: memory and latency budgets constrain the model.** To stay inside the M8 idle budget the model is
not resident; to stay inside the peak budget it is quantized to a `base`/`small` class. If the only adequate
model would exceed the budget, the answer is a smaller model or a desktop-only ship — not a raised budget
(`/MASTER_IMPLEMENTATION_GUIDE.md` §3.16).

**Accepted: no accuracy escape hatch to the cloud.** There is deliberately no "fall back to a better cloud
model on low confidence." Low confidence is surfaced to the Principal in the editable transcript, not sent
anywhere. This forecloses the most likely erosion of the guarantee.

**Gained: a claim we can make without qualification.** "Your voice never leaves this device" is verifiable by
packet capture, exactly as ADR-0009's no-telemetry claim is — because it is the same claim: audio has no host.
The verifiability is the point.

**Gained: one Directive pipeline.** A spoken Directive and a typed one reach the same intake through the same
command. "Same Mandate as typed" becomes a structural property of having one path, not a synchronization
burden across two (this is the substrate ADR-0053 builds on).

**Gained: no new trust or execution mechanism.** Local model execution reuses the ONNX Runtime pattern
`bge-small` established; the trust posture reuses the kernel/renderer boundary; the no-egress guarantee reuses
the capability model. M19 introduces a new *model*, not new machinery.

**Reversal cost: high, and deliberately so.** Reversing to a cloud STT would require introducing a provider
adapter, granting `sidra-voice` a network capability, and adding an STT host to the egress allowlist — each of
which trips a CI gate and contradicts ADR-0009. The reversal is meant to be a visible, argued decision with its
own ADR, not a quiet swap "for accuracy." That friction is the safeguard, not an accident.
</content>
