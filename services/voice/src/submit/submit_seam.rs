//! M19 Voice Directive — Submission Seam into Existing Intake
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §6.2, §9, ADR-0053, IMPLEMENTATION_PLAN.md T3.2

use crate::domain::input_method::InputMethod;
use crate::domain::values::CaptureId;
use super::trust::DirectiveSubmissionPayload;

pub struct SubmissionSeam;

impl SubmissionSeam {
    /// Returns the confirmed transcript string and provenance for submission via the
    /// EXISTING `engagement.create(body, source='principal', input_method='voice')`.
    ///
    /// CRITICAL ARCHITECTURAL REQUIREMENT (ADR-0052, §6.2, AC9):
    /// No `voice.submit` command exists. `sidra-voice` holds NO dependency edge to
    /// `sidra-orchestrator` or `sidra-mission`. The composer calls the existing intake command.
    pub fn prepare_confirmed_submission(confirmed_text: &str, _capture_id: &CaptureId) -> DirectiveSubmissionPayload {
        DirectiveSubmissionPayload {
            confirmed_text: confirmed_text.to_string(),
            trust_tag: "principal".to_string(),
            input_method: InputMethod::Voice,
        }
    }
}
