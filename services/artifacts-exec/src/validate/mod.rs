//! M20 Executable Artifacts — Validation Checks
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §5.4, ADR-0055, ADR-0056

use crate::domain::{ArtifactManifest, Capability, ExecutableArtifact, ModuleHash};
use crate::grant::WorkOrderCapabilityResolver;

pub struct ArtifactValidator;

impl ArtifactValidator {
    /// Perform the §5.4 validation checks (1 through 9)
    pub fn validate(
        artifact: &ExecutableArtifact,
        manifest: &ArtifactManifest,
        wasm_bytes: &[u8],
        resolver: &dyn WorkOrderCapabilityResolver,
    ) -> Result<(), String> {
        // Check 1: Manifest schema valid
        manifest.validate()?;

        // Check 2 & 3: Module hash matches Wasm bytes
        let computed_hash = ModuleHash::from_wasm_bytes(wasm_bytes);
        if computed_hash != artifact.module_hash {
            return Err(format!(
                "ValidationFailed: Wasm module hash mismatch! Expected {}, got {}",
                artifact.module_hash.0, computed_hash.0
            ));
        }

        // Check 4: No ambient authority check (ADR-0006, ADR-0055)
        Self::verify_no_ambient_authority(wasm_bytes)?;

        // Check 5: Producing Work Order resolves (ADR-0056)
        let wo_grant =
            resolver.resolve_work_order_capabilities(&artifact.producing_work_order_id)?;

        // Check 6: Requested capabilities ⊆ Work Order capability grant (ADR-0054)
        for req in &artifact.requested_capabilities {
            if !wo_grant.contains(req) {
                return Err(format!(
                    "ValidationFailed: Requested capability '{}' is not present in producing Work Order '{}' grant (ADR-0054 exit criterion)",
                    req.0, artifact.producing_work_order_id
                ));
            }
        }

        // Check 7: Limits ≤ host defaults
        artifact.limits.validate()?;

        // Check 8: Redaction scan (no raw bearer tokens or credentials in manifest strings)
        Self::scan_redaction(&manifest.artifact.name)?;

        // Check 9: Capability grammar validation
        for cap in &artifact.requested_capabilities {
            Capability::parse(&cap.0)?;
        }

        Ok(())
    }

    /// Assert WIT world has no ambient authority imports (fs, clock, net, socket, randomness)
    pub fn verify_no_ambient_authority(wasm_bytes: &[u8]) -> Result<(), String> {
        // Inspect import section for raw system imports
        let wasm_str = String::from_utf8_lossy(wasm_bytes);
        let forbidden_imports = [
            "wasi:cli",
            "wasi:filesystem",
            "wasi:sockets",
            "wasi:random",
            "wasi:clocks/wall-clock",
        ];

        for forbidden in forbidden_imports {
            if wasm_str.contains(forbidden) {
                return Err(format!(
                    "ValidationFailed: Wasm component imports forbidden ambient authority interface '{}' (ADR-0006, ADR-0055)",
                    forbidden
                ));
            }
        }
        Ok(())
    }

    fn scan_redaction(text: &str) -> Result<(), String> {
        if text.contains("ghp_") || text.contains("sk_live_") || text.contains("Bearer ") {
            return Err(
                "ValidationFailed: Raw credential detected in artifact metadata".to_string(),
            );
        }
        Ok(())
    }
}
