//! M19 Voice Directive Integration & Acceptance Unit Tests
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §17, §18, IMPLEMENTATION_PLAN.md E6

use sidra_voice::*;

#[test]
fn test_ac1_mandate_equivalence() {
    let cap_id = CaptureId::generate();
    let transcript = "Draft the reply to the vendor and flag commitment";
    let is_equivalent = VoiceConformanceSuite::verify_mandate_equivalence(transcript, &cap_id);
    assert!(is_equivalent, "AC1: Spoken Directive must equal typed Mandate!");
}

#[test]
fn test_ac2_audio_never_leaves_device() {
    let no_egress = VoiceConformanceSuite::verify_no_egress_and_local_only();
    assert!(no_egress, "AC2: Audio must never leave device!");
}

#[test]
fn test_ac3_confirm_and_edit_before_submit() {
    let mut session = AudioCaptureSession::begin(CaptureId::generate());
    session.stop().expect("Stop session");
    session.enter_draft_and_release_buffer().expect("Draft entry");

    assert_eq!(session.state, state::CaptureState::Draft);
    assert!(session.pcm_ring_buffer.is_empty(), "PCM buffer MUST be cleared on entry to Draft!");

    let raw_text = "Draft the reply to the vensdor";
    let confirmed_text = "Draft the reply to the vendor";
    let payload = submit::DirectiveSubmissionPayload::new_confirmed_voice_directive(confirmed_text);

    assert_ne!(raw_text, payload.confirmed_text);
    assert_eq!(payload.confirmed_text, confirmed_text);
    assert_eq!(payload.input_method, domain::input_method::InputMethod::Voice);
    assert_eq!(payload.trust_tag, "principal");
}

#[test]
fn test_ac6_local_model_lifecycle() {
    let mut mgr = model::ModelLifecycleManager::new();
    assert!(!mgr.is_resident_at_idle(), "Model must not be resident at idle (M8 budget)");

    let stt_model = mgr.acquire_model();
    assert!(stt_model.is_loaded);

    let decoded = model::StreamDecoder::decode_local_frames(stt_model, b"hello audio", true).unwrap();
    assert_eq!(decoded.content, "hello audio");

    mgr.release_model();
    assert!(!mgr.is_resident_at_idle(), "Model must be released after transcribe");
}

#[test]
fn test_ac8_audio_retention_default_discard() {
    let policy = retention::RetentionPolicy::default();
    assert_eq!(policy, retention::RetentionPolicy::DiscardAfterTranscribe);

    let purge_evt = retention::purge_audio("cap_123", 1000);
    assert_eq!(purge_evt.capture_id, "cap_123");
    assert_eq!(purge_evt.reason, "user_or_scheduled_purge");
}
