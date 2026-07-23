use crate::audit::SecurityAuditLogger;
use crate::errors::SecurityError;
use crate::fence::FenceManager;
use rusqlite::Connection;
use sidra_domain::{ApprovalRequest, Capability, EffectClass};
use std::collections::HashMap;
use ulid::Ulid;

pub struct PermissionBroker {
    capabilities: HashMap<String, Capability>,
    fence_manager: FenceManager,
}

impl PermissionBroker {
    pub fn new(fence_manager: FenceManager) -> Self {
        Self {
            capabilities: HashMap::new(),
            fence_manager,
        }
    }

    pub fn grant_capability(&mut self, capability: Capability) {
        self.capabilities
            .insert(capability.capability_id.clone(), capability);
    }

    pub fn revoke_capability(&mut self, capability_id: &str) {
        if let Some(cap) = self.capabilities.get_mut(capability_id) {
            cap.is_revoked = true;
        }
    }

    /// Single Choke Point: Evaluate capability grant & fence boundary before executing any effectful action
    pub fn authorize_action(
        &self,
        conn: &Connection,
        agent_id: &str,
        capability_id: &str,
        action: &str,
        resource: &str,
        requested_effect: EffectClass,
    ) -> Result<Option<ApprovalRequest>, SecurityError> {
        // 1. Default Deny: Capability must exist
        let cap = match self.capabilities.get(capability_id) {
            Some(c) if c.grantee_agent_id == agent_id => c,
            _ => {
                SecurityAuditLogger::log_security_event(
                    conn,
                    "access_denied",
                    agent_id,
                    resource,
                    &format!("No matching capability grant '{}'", capability_id),
                )?;
                return Err(SecurityError::AccessDenied {
                    agent_id: agent_id.to_string(),
                    resource: resource.to_string(),
                    effect_class: requested_effect,
                });
            }
        };

        // 2. Revocation Check
        if cap.is_revoked {
            SecurityAuditLogger::log_security_event(
                conn,
                "capability_revoked",
                agent_id,
                resource,
                &format!("Capability '{}' has been revoked", capability_id),
            )?;
            return Err(SecurityError::CapabilityRevoked {
                capability_id: capability_id.to_string(),
            });
        }

        // 3. Requested Effect Class vs Granted Effect Class
        if requested_effect > cap.max_effect_class {
            SecurityAuditLogger::log_security_event(
                conn,
                "effect_class_escalation_denied",
                agent_id,
                resource,
                &format!(
                    "Requested {:?} exceeds capability max {:?}",
                    requested_effect, cap.max_effect_class
                ),
            )?;
            return Err(SecurityError::AccessDenied {
                agent_id: agent_id.to_string(),
                resource: resource.to_string(),
                effect_class: requested_effect,
            });
        }

        // 4. Fence Containment Check (Filesystem traversal)
        if action.starts_with("fs:") {
            if let Err(err) = self.fence_manager.check_path_containment(resource) {
                SecurityAuditLogger::log_security_event(
                    conn,
                    "filesystem_escape_denied",
                    agent_id,
                    resource,
                    &err.to_string(),
                )?;
                return Err(err);
            }
        }

        // 5. Fence Egress Check
        if action.starts_with("http:") {
            if let Err(err) = self.fence_manager.check_egress_allowlist(resource) {
                SecurityAuditLogger::log_security_event(
                    conn,
                    "unlisted_egress_denied",
                    agent_id,
                    resource,
                    &err.to_string(),
                )?;
                return Err(err);
            }
        }

        // 6. Effect Class 3: Requires explicit Principal human signature
        if requested_effect == EffectClass::Class3CriticalHumanSignature {
            SecurityAuditLogger::log_security_event(
                conn,
                "class_3_signature_required",
                agent_id,
                resource,
                "Class 3 action blocked pending human signature",
            )?;
            return Err(SecurityError::Class3SignatureRequired {
                action: action.to_string(),
            });
        }

        // 7. Effect Class 2: Requires Approval Request unless within fence cap
        if requested_effect == EffectClass::Class2IrreversibleExternal
            && requested_effect > self.fence_manager.fence().max_effect_class
        {
            SecurityAuditLogger::log_security_event(
                conn,
                "fence_crossed_approval_required",
                agent_id,
                resource,
                "Class 2 action requires Principal approval",
            )?;
            return Ok(Some(ApprovalRequest {
                request_id: Ulid::new().to_string(),
                agent_id: agent_id.to_string(),
                action: action.to_string(),
                resource: resource.to_string(),
                effect_class: requested_effect,
                reason: "Action crosses autonomy fence limit".to_string(),
            }));
        }

        Ok(None)
    }
}
