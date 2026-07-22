//! Model-Call Stubbing
//!
//! Ref: ADR-0041, IMPLEMENTATION_PLAN.md T8.2

use std::collections::HashMap;

pub struct ModelCallStub {
    pub responses: HashMap<String, String>,
}

impl ModelCallStub {
    pub fn new() -> Self {
        Self {
            responses: HashMap::new(),
        }
    }

    pub fn register(&mut self, frame_digest: String, response: String) {
        self.responses.insert(frame_digest, response);
    }

    pub fn get_stubbed_response(&self, frame_digest: &str) -> Option<&String> {
        self.responses.get(frame_digest)
    }
}
