pub struct CapabilityCeilingChecker;

impl CapabilityCeilingChecker {
    pub fn check_ceiling(
        required_capabilities: &[String],
        ceiling_capabilities: &[String],
    ) -> Result<(), String> {
        for req in required_capabilities {
            if !ceiling_capabilities.contains(req) {
                return Err(format!(
                    "Capability ceiling violation: required capability '{}' is outside source capability union",
                    req
                ));
            }
        }
        Ok(())
    }
}
