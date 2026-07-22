use crate::errors::SecurityError;
use crate::fence::FenceManager;
use std::collections::HashSet;

pub struct EgressFilter<'a> {
    fence_manager: &'a FenceManager,
    allowed_hosts: HashSet<String>,
}

impl<'a> EgressFilter<'a> {
    pub fn new(fence_manager: &'a FenceManager) -> Self {
        Self {
            fence_manager,
            allowed_hosts: HashSet::new(),
        }
    }

    pub fn add_allowed_host(&mut self, host: &str) {
        self.allowed_hosts.insert(host.to_string());
    }

    /// Intercept and validate outgoing network request URL
    pub fn validate_request(&self, url: &str) -> Result<String, SecurityError> {
        self.fence_manager.check_egress_allowlist(url)
    }
}
