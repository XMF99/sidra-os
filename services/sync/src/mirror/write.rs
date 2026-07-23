use std::fs;
use std::path::Path;

pub struct SyncMirrorWriter;

impl SyncMirrorWriter {
    pub fn write_devices_mirror(
        output_dir: &Path,
        devices: &[(String, String, String, u64)],
    ) -> std::io::Result<()> {
        let sync_dir = output_dir.join("sync");
        fs::create_dir_all(&sync_dir)?;

        let mut content = String::from("# Sync Registered Devices Mirror\n\n");
        content.push_str("| Device ID | Seat Owner | Public Key | Registered At |\n");
        content.push_str("|---|---|---|---|\n");

        for (dev_id, seat_id, pubkey, reg_at) in devices {
            content.push_str(&format!(
                "| `{}` | `{}` | `{}` | {} |\n",
                dev_id, seat_id, pubkey, reg_at
            ));
        }

        fs::write(sync_dir.join("devices.md"), content)?;
        Ok(())
    }

    pub fn write_conflicts_mirror(
        output_dir: &Path,
        conflicts: &[(String, String, String, String, String)],
    ) -> std::io::Result<()> {
        let conflicts_dir = output_dir.join("sync").join("conflicts");
        fs::create_dir_all(&conflicts_dir)?;

        let mut content = String::from("# Sync Conflicts Mirror\n\n");
        content.push_str(
            "| Conflict ID | Decision ID | Projection Cell | Provisional Winner | Status |\n",
        );
        content.push_str("|---|---|---|---|---|\n");

        for (cnfl_id, dec_id, cell, winner, status) in conflicts {
            content.push_str(&format!(
                "| `{}` | `{}` | `{}` | `{}` | {} |\n",
                cnfl_id, dec_id, cell, winner, status
            ));
        }

        fs::write(conflicts_dir.join("summary.md"), content)?;
        Ok(())
    }
}
