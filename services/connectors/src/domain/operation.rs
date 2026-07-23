use crate::domain::values::{OperationName, Scope};
use serde::{Deserialize, Serialize};
use sidra_domain::EffectClass;

/// Operation declared by a connector manifest
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Operation {
    pub name: OperationName,
    pub capability: Scope,
    pub effect: EffectClass,
    pub method: String,
    pub path: String,
}

impl Operation {
    pub fn new(
        name: OperationName,
        capability: Scope,
        effect: EffectClass,
        method: impl Into<String>,
        path: impl Into<String>,
    ) -> Result<Self, String> {
        if effect == EffectClass::Class0Read {
            return Err("Operation effect class 0 is invalid: network operations must be at least effect class 1".to_string());
        }

        let method_str = method.into().to_uppercase();
        let path_str = path.into();

        if !path_str.starts_with('/') {
            return Err(format!(
                "Path template must start with '/', got '{}'",
                path_str
            ));
        }

        Ok(Self {
            name,
            capability,
            effect,
            method: method_str,
            path: path_str,
        })
    }
}
