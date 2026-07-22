use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum InputMethod {
    Typed,
    Voice,
}

impl Default for InputMethod {
    fn default() -> Self {
        Self::Typed
    }
}
