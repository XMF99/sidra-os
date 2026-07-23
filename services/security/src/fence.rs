use crate::errors::SecurityError;
use sidra_domain::{EffectClass, Fence};
use std::path::{Component, Path, PathBuf};
use url::Url;

pub struct FenceManager {
    fence: Fence,
}

impl FenceManager {
    pub fn new(fence: Fence) -> Self {
        Self { fence }
    }

    pub fn fence(&self) -> &Fence {
        &self.fence
    }

    /// Verify filesystem path containment against allowed directory scopes
    pub fn check_path_containment(&self, target_path: &str) -> Result<PathBuf, SecurityError> {
        let path = Path::new(target_path);

        // Normalize path to resolve '..' traversal attempts
        let mut normalized = PathBuf::new();
        for component in path.components() {
            match component {
                Component::ParentDir => {
                    if !normalized.pop() {
                        return Err(SecurityError::PathTraversalDenied {
                            path: target_path.to_string(),
                            allowed: self.fence.allowed_directories.join(", "),
                        });
                    }
                }
                Component::CurDir => {}
                c => normalized.push(c),
            }
        }

        let normalized_str = normalized.to_string_lossy();

        // Check if path starts with any allowed directory
        let is_allowed =
            self.fence.allowed_directories.iter().any(|allowed| {
                normalized_str.starts_with(allowed) || target_path.starts_with(allowed)
            });

        if !is_allowed {
            return Err(SecurityError::PathTraversalDenied {
                path: target_path.to_string(),
                allowed: self.fence.allowed_directories.join(", "),
            });
        }

        Ok(normalized)
    }

    /// Verify network target URL host against approved egress allowlist
    pub fn check_egress_allowlist(&self, raw_url: &str) -> Result<String, SecurityError> {
        let parsed_url = Url::parse(raw_url).map_err(|_| SecurityError::EgressDenied {
            host: raw_url.to_string(),
        })?;

        let host = parsed_url
            .host_str()
            .ok_or_else(|| SecurityError::EgressDenied {
                host: raw_url.to_string(),
            })?;

        let is_approved = self.fence.egress_allowlist.iter().any(|allowed_domain| {
            host == allowed_domain || host.ends_with(&format!(".{}", allowed_domain))
        });

        if !is_approved {
            return Err(SecurityError::EgressDenied {
                host: host.to_string(),
            });
        }

        Ok(host.to_string())
    }

    /// Verify requested effect class against maximum allowed effect class cap
    pub fn check_effect_class_cap(&self, requested: EffectClass) -> Result<(), SecurityError> {
        if requested > self.fence.max_effect_class {
            return Err(SecurityError::FenceViolation {
                action: format!("Execute {:?}", requested),
                resource: "System Engine".to_string(),
                reason: format!(
                    "Requested effect class {:?} exceeds max fence cap {:?}",
                    requested, self.fence.max_effect_class
                ),
            });
        }
        Ok(())
    }
}
