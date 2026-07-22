//! M20 Executable Artifacts — Local Broker-Mediated Host Functions
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §8, §9

use std::collections::BTreeSet;
use crate::domain::{Capability, EffectRecord};
use super::effect::EffectClass;

pub struct LocalHostFunctions;

impl LocalHostFunctions {
    /// Execute vault.read host function mediated by Broker
    pub fn vault_read(
        effective_grant: &BTreeSet<Capability>,
        path: &str,
        now: u64,
    ) -> Result<(Vec<u8>, EffectRecord), String> {
        let required_cap = Capability::parse(&format!("fs.read:vault/{}", path))?;
        
        let allowed = effective_grant.iter().any(|c| c.0 == required_cap.0 || c.0.starts_with("fs.read:vault/**"));
        let verdict = if allowed { "allowed" } else { "fenced" };

        let record = EffectRecord {
            effect_class: EffectClass::Class0Pure.as_u8(),
            operation: "vault.read".to_string(),
            target_resource: path.to_string(),
            verdict: verdict.to_string(),
            at: now,
        };

        if !allowed {
            return Err(format!("EffectDenied: Capability '{}' is fenced in effective grant", required_cap.0));
        }

        Ok((format!("Mock Vault Content for {}", path).into_bytes(), record))
    }

    /// Execute vault.write host function mediated by Broker
    pub fn vault_write(
        effective_grant: &BTreeSet<Capability>,
        path: &str,
        _bytes: &[u8],
        now: u64,
    ) -> Result<EffectRecord, String> {
        let required_cap = Capability::parse(&format!("fs.write:vault/{}", path))?;

        let allowed = effective_grant.iter().any(|c| c.0 == required_cap.0 || c.0.starts_with("fs.write:vault/**"));
        let verdict = if allowed { "allowed" } else { "fenced" };

        let record = EffectRecord {
            effect_class: EffectClass::Class2LocalWrite.as_u8(),
            operation: "vault.write".to_string(),
            target_resource: path.to_string(),
            verdict: verdict.to_string(),
            at: now,
        };

        if !allowed {
            return Err(format!("EffectDenied: Capability '{}' is fenced in effective grant", required_cap.0));
        }

        Ok(record)
    }
}
