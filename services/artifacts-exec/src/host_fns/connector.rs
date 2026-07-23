//! M20 Executable Artifacts — External Connector Host Function Path
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §8, ADR-0034, ADR-0036 (M16 join)

use super::effect::EffectClass;
use crate::domain::{Capability, EffectRecord};
use std::collections::BTreeSet;

pub struct ConnectorHostFunctions;

impl ConnectorHostFunctions {
    /// Invoke connector operation via M16 custody + egress boundary
    /// Artifact names NO host, holds NO credential, and receives NO token.
    pub fn invoke_connector(
        effective_grant: &BTreeSet<Capability>,
        connector_id: &str,
        operation: &str,
        is_irreversible_class_3: bool,
        now: u64,
    ) -> Result<(String, EffectRecord), String> {
        let required_cap =
            Capability::parse(&format!("integration:{}:{}", connector_id, operation))?;

        let allowed = effective_grant.contains(&required_cap);
        let effect_class = if is_irreversible_class_3 {
            EffectClass::Class3Irreversible
        } else {
            EffectClass::Class1ExternalRead
        };

        if is_irreversible_class_3 {
            let _record = EffectRecord {
                effect_class: effect_class.as_u8(),
                operation: format!("connector.invoke:{}:{}", connector_id, operation),
                target_resource: connector_id.to_string(),
                verdict: "needs_approval".to_string(),
                at: now,
            };
            return Err(
                "Class3Effect: Irreversible external effect requires Principal Approval Request"
                    .to_string(),
            );
        }

        let verdict = if allowed { "allowed" } else { "fenced" };
        let record = EffectRecord {
            effect_class: effect_class.as_u8(),
            operation: format!("connector.invoke:{}:{}", connector_id, operation),
            target_resource: connector_id.to_string(),
            verdict: verdict.to_string(),
            at: now,
        };

        if !allowed {
            return Err(format!(
                "EffectDenied: Capability '{}' is fenced in effective grant",
                required_cap.0
            ));
        }

        Ok((
            format!(
                "Mock M16 Connector Result for {}:{}",
                connector_id, operation
            ),
            record,
        ))
    }
}
