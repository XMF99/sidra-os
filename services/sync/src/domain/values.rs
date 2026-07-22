use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ValueError {
    #[error("Invalid DeviceId '{0}': cannot be empty")]
    InvalidDeviceId(String),
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct DeviceId(pub String);

impl DeviceId {
    pub fn new(id: impl Into<String>) -> Result<Self, ValueError> {
        let s = id.into();
        if s.trim().is_empty() {
            return Err(ValueError::InvalidDeviceId(s));
        }
        Ok(Self(s))
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct DeviceSeq(pub u64);

impl DeviceSeq {
    pub fn next(&self) -> Self {
        Self(self.0 + 1)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct PeerId(pub String);

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct ProjectionCell {
    pub table_name: String,
    pub row_pk: String,
    pub column_name: String,
}

impl ProjectionCell {
    pub fn new(table: impl Into<String>, pk: impl Into<String>, col: impl Into<String>) -> Self {
        Self {
            table_name: table.into(),
            row_pk: pk.into(),
            column_name: col.into(),
        }
    }

    pub fn to_key(&self) -> String {
        format!("{}:{}:{}", self.table_name, self.row_pk, self.column_name)
    }
}

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct VersionVector {
    pub frontiers: BTreeMap<DeviceId, DeviceSeq>,
}

impl VersionVector {
    pub fn new() -> Self {
        Self {
            frontiers: BTreeMap::new(),
        }
    }

    pub fn get(&self, device_id: &DeviceId) -> DeviceSeq {
        self.frontiers.get(device_id).copied().unwrap_or(DeviceSeq(0))
    }

    pub fn update(&mut self, device_id: DeviceId, seq: DeviceSeq) {
        let current = self.get(&device_id);
        if seq.0 > current.0 {
            self.frontiers.insert(device_id, seq);
        }
    }

    pub fn exceeds(&self, other: &VersionVector) -> bool {
        for (dev, seq) in &self.frontiers {
            if seq.0 > other.get(dev).0 {
                return true;
            }
        }
        false
    }
}
