use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct MissionId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct EngagementId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct SignatureHash(pub String); // Hex-encoded 32-byte SHA-256 digest

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RoleArchetypeId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ContractShapeId(pub String);

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct EffectClass(pub u8);

impl EffectClass {
    pub fn new(val: u8) -> Result<Self, String> {
        if (1..=3).contains(&val) {
            Ok(Self(val))
        } else {
            Err(format!("EffectClass {} out of valid range [1, 3]", val))
        }
    }
}
