use crate::domain::values::{DeviceId, PeerId, VersionVector};
use serde::{Deserialize, Serialize};
use sidra_seats::SeatId;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub device_id: DeviceId,
    pub seat_id: SeatId,
    pub pubkey: String,
    pub registered_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Peer {
    pub peer_id: PeerId,
    pub device_id: DeviceId,
    pub endpoint: String,
    pub last_seen_at: u64,
    pub cursor_vector: VersionVector,
}
