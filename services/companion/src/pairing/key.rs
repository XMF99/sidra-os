use ed25519_dalek::{SigningKey, VerifyingKey, Signer, Verifier, Signature as EdSignature};
use rand::rngs::OsRng;
use crate::domain::values::{DevicePublicKey, Signature};

pub struct DeviceKeyPair {
    signing_key: SigningKey,
}

impl DeviceKeyPair {
    pub fn generate() -> Self {
        let mut csprng = OsRng;
        let signing_key = SigningKey::generate(&mut csprng);
        Self { signing_key }
    }

    pub fn public_key(&self) -> DevicePublicKey {
        DevicePublicKey {
            key_bytes: self.signing_key.verifying_key().to_bytes().to_vec(),
        }
    }

    pub fn sign(&self, message: &[u8]) -> Signature {
        let sig: EdSignature = self.signing_key.sign(message);
        Signature {
            bytes: sig.to_bytes().to_vec(),
        }
    }
}

pub fn verify_signature(pubkey: &DevicePublicKey, message: &[u8], signature: &Signature) -> bool {
    if pubkey.key_bytes.len() != 32 || signature.bytes.len() != 64 {
        return false;
    }
    let mut vk_bytes = [0u8; 32];
    vk_bytes.copy_from_slice(&pubkey.key_bytes);
    let Ok(verifying_key) = VerifyingKey::from_bytes(&vk_bytes) else {
        return false;
    };
    let mut sig_bytes = [0u8; 64];
    sig_bytes.copy_from_slice(&signature.bytes);
    let ed_sig = EdSignature::from_bytes(&sig_bytes);
    verifying_key.verify(message, &ed_sig).is_ok()
}
