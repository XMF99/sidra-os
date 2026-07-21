use crate::errors::SecurityError;
use crate::fence::FenceManager;

pub struct EgressFilter<'a> {
    fence_manager: &'a FenceManager,
}

impl<'a> EgressFilter<'a> {
    pub fn new(fence_manager: &'a FenceManager) -> Self {
        Self { fence_manager }
    }

    /// Intercept and validate outgoing network request URL
    pub fn validate_request(&self, url: &str) -> Result<String, SecurityError> {
        self.fence_manager.check_egress_allowlist(url)
    }
}
