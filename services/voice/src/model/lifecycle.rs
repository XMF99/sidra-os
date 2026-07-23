//! M19 Voice Directive — Model Lifecycle Manager
//! Ref: VOICE_DIRECTIVE_ARCHITECTURE.md §8, ADR-0052, IMPLEMENTATION_PLAN.md T1.5

use super::load::LocalSttModel;

pub struct ModelLifecycleManager {
    model: Option<LocalSttModel>,
}

impl ModelLifecycleManager {
    pub fn new() -> Self {
        Self { model: None }
    }

    /// Loads model on demand when capture begins.
    pub fn acquire_model(&mut self) -> &mut LocalSttModel {
        if self.model.is_none() {
            self.model = Some(LocalSttModel::load_on_demand());
        }
        self.model.as_mut().expect("Model was loaded")
    }

    /// Releases model memory immediately after transcription finalization.
    pub fn release_model(&mut self) {
        if let Some(ref mut m) = self.model {
            m.release();
        }
        self.model = None;
    }

    /// Verifies model is not resident at idle (M8 memory constraint).
    pub fn is_resident_at_idle(&self) -> bool {
        self.model.as_ref().is_some_and(|m| m.is_loaded)
    }
}

impl Default for ModelLifecycleManager {
    fn default() -> Self {
        Self::new()
    }
}
