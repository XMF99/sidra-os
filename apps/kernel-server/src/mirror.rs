use std::fs;
use std::path::Path;

pub struct EnrollmentsMirror;

impl EnrollmentsMirror {
    pub fn update_mirror(output_dir: &Path, records: &[(String, String, String, Option<i64>)]) -> std::io::Result<()> {
        let clients_dir = output_dir.join("clients");
        fs::create_dir_all(&clients_dir)?;

        let mut content = String::from("# Client Enrollments Mirror\n\n");
        content.push_str("| Client ID | Bound Seat ID | Credential Reference | Status |\n");
        content.push_str("|---|---|---|---|\n");

        for (client_id, seat_id, cred_ref, revoked_at) in records {
            let status = if revoked_at.is_some() { "REVOKED" } else { "ACTIVE" };
            content.push_str(&format!(
                "| `{}` | `{}` | `{}` | {} |\n",
                client_id, seat_id, cred_ref, status
            ));
        }

        fs::write(clients_dir.join("enrollments.md"), content)?;
        Ok(())
    }
}
