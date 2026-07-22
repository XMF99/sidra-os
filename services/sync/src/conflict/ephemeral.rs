use crate::domain::clock::Hlc;

pub struct EphemeralLwwResolver;

impl EphemeralLwwResolver {
    pub fn resolve_lww(val_a: &str, hlc_a: Hlc, val_b: &str, hlc_b: Hlc) -> String {
        if hlc_a >= hlc_b {
            val_a.to_string()
        } else {
            val_b.to_string()
        }
    }
}
