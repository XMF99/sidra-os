use serde::{Deserialize, Serialize};
use super::values::{DeviceId, DevicePublicKey};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum DeviceStatus {
    Active,
    Suspended,
    Revoked,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompanionDevice {
    pub device_id: DeviceId,
    pub pubkey: DevicePublicKey,
    pub label: String,
    pub status: DeviceStatus,
    pub paired_at: u64,
    pub paired_by: String,
}

impl CompanionDevice {
    pub fn new(device_id: DeviceId, pubkey: DevicePublicKey, label: String, paired_at: u64) -> Self {
        Self {
            device_id,
            pubkey,
            label,
            status: DeviceStatus::Active,
            paired_at,
            paired_by: "principal".to_string(),
        }
    }

    pub fn suspend(&mut self) {
        if self.status == DeviceStatus::Active {
            self.status = DeviceStatus::Suspended;
        }
    }

    pub fn resume(&mut self) {
        if self.status == DeviceStatus::Suspended {
            self.status = DeviceStatus::Active;
        }
    }

    pub fn revoke(&mut self) {
        self.status = DeviceStatus::Revoked;
    }
}
