use crate::domain::grant::ConnectorGrant;
use crate::domain::manifest::ConnectorManifest;
use std::fs;
use std::path::Path;

/// Vault Markdown mirror writer (T8.7)
///
/// Mirror documents persist plain-text audit records for human inspection.
/// NO secret/credential plaintext ever appears here.
pub fn write_connector_mirror(
    base_dir: &Path,
    manifest: &ConnectorManifest,
    grants: &[ConnectorGrant],
) -> Result<(), std::io::Error> {
    let conn_dir = base_dir.join("connectors").join(manifest.id.as_str());
    fs::create_dir_all(&conn_dir)?;

    // 1. connector.md
    let connector_md = format!(
        "# Connector: {}\n\n- ID: `{}`\n- Version: `{}`\n- Publisher: `{}`\n- Description: {}\n- Auth Kind: `{}`\n\n## Egress Allowlist\n{}\n",
        manifest.name,
        manifest.id,
        manifest.version,
        manifest.publisher,
        manifest.description,
        manifest.auth.kind_str(),
        manifest.egress.allow.iter().map(|h| format!("- `{}`", h)).collect::<Vec<_>>().join("\n")
    );
    fs::write(conn_dir.join("connector.md"), connector_md)?;

    // 2. grants.md
    let mut grants_md = format!("# Connector Grants: {}\n\n", manifest.name);
    for g in grants {
        grants_md.push_str(&format!(
            "### Department: `{}`\n- Granted By: `{}`\n- Granted At: `{}`\n- Status: `{}`\n- Scopes:\n{}\n\n",
            g.department_id.0,
            g.granted_by,
            g.granted_at,
            if g.is_active() { "Active" } else { "Revoked" },
            g.scopes.iter().map(|s| format!("  - `{}`", s)).collect::<Vec<_>>().join("\n")
        ));
    }
    fs::write(conn_dir.join("grants.md"), grants_md)?;

    // 3. calls/ directory
    let calls_dir = conn_dir.join("calls");
    fs::create_dir_all(&calls_dir)?;

    Ok(())
}
