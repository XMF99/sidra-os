use crate::domain::values::{ModelId, ModelVersion};

#[derive(Debug)]
pub struct LocalSttModel {
    pub id: ModelId,
    pub version: ModelVersion,
    pub is_loaded: bool,
}

impl LocalSttModel {
    pub fn load_on_demand() -> Self {
        Self {
            id: ModelId("whisper-base-en".to_string()),
            version: ModelVersion("1.0.0".to_string()),
            is_loaded: true,
        }
    }

    pub fn release(&mut self) {
        self.is_loaded = false;
    }
}
