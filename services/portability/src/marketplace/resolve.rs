use crate::domain::values::PackRef;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum PackResolveError {
    #[error("Pack unavailable: '{0}' version '{1}'")]
    PackUnavailable(String, String),
    #[error("Pack manifest hash mismatch for '{0}'")]
    HashMismatch(String),
}

pub struct MarketplacePackResolver;

impl MarketplacePackResolver {
    pub fn resolve_pack_refs(pack_refs: &[PackRef]) -> Result<usize, PackResolveError> {
        for pr in pack_refs {
            if pr.pack_id.is_empty() {
                return Err(PackResolveError::PackUnavailable(
                    pr.pack_id.clone(),
                    pr.version.clone(),
                ));
            }
        }
        Ok(pack_refs.len())
    }
}
