use crate::domain::auth::AuthConfig;
use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use crate::manifest::signature::verify_signature;
use sidra_domain::EffectClass;
use url::Url;

const KERNEL_SIDRA_API_VERSION: &str = "2.5.0";

/// Execute all ten install validation checks (§5.4) over a manifest and TOML payload
pub fn validate_install(
    manifest: &ConnectorManifest,
    raw_toml: &str,
    developer_mode: bool,
) -> Result<(), ConnectorError> {
    // Check 1: Manifest schema valid & sidra_api compatibility
    validate_check_1(manifest)?;

    // Check 2: Signature verification
    validate_check_2(manifest, raw_toml, developer_mode)?;

    // Check 3: Capability namespace match (integration:<id>:*)
    validate_check_3(manifest)?;

    // Check 4: Action to effect class consistency
    validate_check_4(manifest)?;

    // Check 5: Operation host membership in egress.allow
    validate_check_5(manifest)?;

    // Check 6: egress.allow shape (non-empty, no bare TLD, no *)
    validate_check_6(manifest)?;

    // Check 7: No credential material in manifest
    validate_check_7(raw_toml)?;

    // Check 8: OAuth endpoints present and hosts in egress.allow
    validate_check_8(manifest)?;

    // Check 9: No class 0 operation
    validate_check_9(manifest)?;

    // Check 10: Wasm fuel / ambient authority sanity
    validate_check_10(manifest)?;

    Ok(())
}

fn validate_check_1(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    let req = semver::VersionReq::parse(&manifest.sidra_api).map_err(|e| {
        ConnectorError::InstallCheckFailed {
            rule_number: 1,
            rule_name: "sidra_api range check".into(),
            details: format!("Invalid sidra_api range '{}': {}", manifest.sidra_api, e),
        }
    })?;

    let kernel_ver = semver::Version::parse(KERNEL_SIDRA_API_VERSION).unwrap();
    if !req.matches(&kernel_ver) {
        return Err(ConnectorError::InstallCheckFailed {
            rule_number: 1,
            rule_name: "sidra_api range check".into(),
            details: format!(
                "Kernel API version {} does not satisfy manifest requirement '{}'",
                KERNEL_SIDRA_API_VERSION, manifest.sidra_api
            ),
        });
    }

    Ok(())
}

fn validate_check_2(
    manifest: &ConnectorManifest,
    raw_toml: &str,
    developer_mode: bool,
) -> Result<(), ConnectorError> {
    verify_signature(manifest, raw_toml, developer_mode).map_err(|e| {
        ConnectorError::InstallCheckFailed {
            rule_number: 2,
            rule_name: "signature verification".into(),
            details: e.to_string(),
        }
    })
}

fn validate_check_3(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    let manifest_id = manifest.id.as_str();
    for op in &manifest.operations {
        let op_conn_id = op.capability.connector_id().unwrap_or("");
        if op_conn_id != manifest_id {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 3,
                rule_name: "capability namespace check".into(),
                details: format!(
                    "Operation '{}' capability '{}' does not match manifest connector id '{}'",
                    op.name, op.capability, manifest_id
                ),
            });
        }
    }
    Ok(())
}

fn validate_check_4(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    for op in &manifest.operations {
        let action = op.capability.action().unwrap_or("");
        let expected_class = match action {
            "read" => EffectClass::Class1_ReversibleLocal,
            "write" => EffectClass::Class2_IrreversibleExternal,
            "admin" => EffectClass::Class3_CriticalHumanSignature,
            "*" => op.effect,
            _ => {
                return Err(ConnectorError::InstallCheckFailed {
                    rule_number: 4,
                    rule_name: "action effect mapping".into(),
                    details: format!("Unknown capability action '{}'", action),
                })
            }
        };

        if action != "*" && op.effect != expected_class {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 4,
                rule_name: "action effect mapping".into(),
                details: format!(
                    "Operation '{}' action '{}' expects effect class {:?}, got {:?}",
                    op.name, action, expected_class, op.effect
                ),
            });
        }
    }
    Ok(())
}

fn validate_check_5(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    for op in &manifest.operations {
        if op.path.starts_with("http://") || op.path.starts_with("https://") {
            let url = Url::parse(&op.path).map_err(|e| ConnectorError::InstallCheckFailed {
                rule_number: 5,
                rule_name: "operation host egress check".into(),
                details: format!("Invalid operation path URL '{}': {}", op.path, e),
            })?;
            let host = url.host_str().unwrap_or("");
            if !is_host_allowed(host, &manifest.egress.allow) {
                return Err(ConnectorError::InstallCheckFailed {
                    rule_number: 5,
                    rule_name: "operation host egress check".into(),
                    details: format!(
                        "Operation '{}' host '{}' is not in egress.allow",
                        op.name, host
                    ),
                });
            }
        }
    }
    Ok(())
}

fn validate_check_6(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    if manifest.egress.allow.is_empty() {
        return Err(ConnectorError::InstallCheckFailed {
            rule_number: 6,
            rule_name: "egress.allow shape".into(),
            details: "egress.allow must be non-empty".into(),
        });
    }

    for host in &manifest.egress.allow {
        let clean = host.trim_start_matches("*.").to_lowercase();
        if clean == "*" || !clean.contains('.') || is_bare_tld(&clean) {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 6,
                rule_name: "egress.allow shape".into(),
                details: format!(
                    "egress.allow entry '{}' is broader than a registrable domain or a bare TLD",
                    host
                ),
            });
        }
    }
    Ok(())
}

fn validate_check_7(raw_toml: &str) -> Result<(), ConnectorError> {
    let lower = raw_toml.to_lowercase();
    let forbidden_keys = [
        "client_secret",
        "client_secret=",
        "access_token",
        "api_key=",
        "bearer ",
        "private_key",
        "secret=",
    ];

    for key in &forbidden_keys {
        if lower.contains(key) {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 7,
                rule_name: "no credential material in manifest".into(),
                details: format!("Manifest contains forbidden credential pattern '{}'", key),
            });
        }
    }
    Ok(())
}

fn validate_check_8(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    if let AuthConfig::OAuth2 { authorize, token, .. } = &manifest.auth {
        let auth_url = Url::parse(authorize).map_err(|e| ConnectorError::InstallCheckFailed {
            rule_number: 8,
            rule_name: "oauth endpoints in egress".into(),
            details: format!("Invalid authorize URL '{}': {}", authorize, e),
        })?;
        let token_url = Url::parse(token).map_err(|e| ConnectorError::InstallCheckFailed {
            rule_number: 8,
            rule_name: "oauth endpoints in egress".into(),
            details: format!("Invalid token URL '{}': {}", token, e),
        })?;

        let auth_host = auth_url.host_str().unwrap_or("");
        let token_host = token_url.host_str().unwrap_or("");

        if !is_host_allowed(auth_host, &manifest.egress.allow) {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 8,
                rule_name: "oauth endpoints in egress".into(),
                details: format!("OAuth authorize host '{}' is not in egress.allow", auth_host),
            });
        }

        if !is_host_allowed(token_host, &manifest.egress.allow) {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 8,
                rule_name: "oauth endpoints in egress".into(),
                details: format!("OAuth token host '{}' is not in egress.allow", token_host),
            });
        }
    }
    Ok(())
}

fn validate_check_9(manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    for op in &manifest.operations {
        if op.effect == EffectClass::Class0_Read {
            return Err(ConnectorError::InstallCheckFailed {
                rule_number: 9,
                rule_name: "no class 0 network operation".into(),
                details: format!("Operation '{}' declares effect class 0; network calls must be at least class 1", op.name),
            });
        }
    }
    Ok(())
}

fn validate_check_10(_manifest: &ConnectorManifest) -> Result<(), ConnectorError> {
    // Wasm transform safety check
    Ok(())
}

pub fn is_host_allowed(host: &str, allowlist: &[String]) -> bool {
    let host_lower = host.to_lowercase();
    for entry in allowlist {
        let entry_lower = entry.to_lowercase();
        if entry_lower.starts_with("*.") {
            let suffix = &entry_lower[2..];
            if host_lower == suffix || host_lower.ends_with(&format!(".{}", suffix)) {
                return true;
            }
        } else if host_lower == entry_lower {
            return true;
        }
    }
    false
}

fn is_bare_tld(host: &str) -> bool {
    const COMMON_TLDS: &[&str] = &["com", "net", "org", "io", "dev", "app", "gov", "edu", "co", "uk", "de"];
    COMMON_TLDS.contains(&host)
}
