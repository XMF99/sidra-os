//! Budget & Resource Reservation (T8.6)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.6

use std::collections::HashSet;
use std::sync::{Arc, Mutex};

#[derive(Default, Clone)]
pub struct ReservationStore {
    reserved_resources: Arc<Mutex<HashSet<String>>>,
}

impl ReservationStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn reserve(&self, resource_id: &str) -> Result<(), String> {
        let mut lock = self.reserved_resources.lock().map_err(|e| e.to_string())?;
        if lock.contains(resource_id) {
            return Err(format!("Resource reservation conflict: '{}' is already locked", resource_id));
        }
        lock.insert(resource_id.to_string());
        Ok(())
    }

    pub fn release(&self, resource_id: &str) {
        if let Ok(mut lock) = self.reserved_resources.lock() {
            lock.remove(resource_id);
        }
    }
}
