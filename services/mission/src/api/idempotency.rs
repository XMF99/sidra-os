//! Command Idempotency Layer (T11.9)
//!
//! Ref: IMPLEMENTATION_PLAN.md T11.9

use std::collections::HashSet;
use std::sync::{Arc, Mutex};

#[derive(Default, Clone)]
pub struct CommandDeduplicator {
    seen_commands: Arc<Mutex<HashSet<String>>>,
}

impl CommandDeduplicator {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn check_and_mark(&self, command_id: &str) -> bool {
        let mut lock = self.seen_commands.lock().unwrap_or_else(|e| e.into_inner());
        if lock.contains(command_id) {
            false // Already seen
        } else {
            lock.insert(command_id.to_string());
            true // First time
        }
    }
}
