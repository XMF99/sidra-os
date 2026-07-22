pub mod key;
pub mod verify;

use crate::domain::values::{DeviceId, DevicePublicKey, PairingChallenge};
use crate::domain::device::CompanionDevice;
use key::verify_signature;

pub struct PairingService;

impl PairingService {
    pub fn begin_pairing(now: u64) -> PairingChallenge {
        PairingChallenge {
            challenge_id: format!("challenge-{}", now),
            expires_at: now + 300, // 5 min TTL
        }
    }

    pub fn complete_pairing(
        challenge: &PairingChallenge,
        now: u64,
        device_id: DeviceId,
        pubkey: DevicePublicKey,
        proof: &[u8],
        label: String,
    ) -> Result<CompanionDevice, &'static str> {
        if now > challenge.expires_at {
            return Err("challenge_expired");
        }
        if !verify_signature(&pubkey, challenge.challenge_id.as_bytes(), &crate::domain::values::Signature { bytes: proof.to_vec() }) {
            return Err("invalid_proof");
        }
        Ok(CompanionDevice::new(device_id, pubkey, label, now))
    }
}
