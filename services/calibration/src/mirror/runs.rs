use std::fs;
use std::path::Path;

pub struct CalibrationMirrorWriter;

impl CalibrationMirrorWriter {
    pub fn write_runs_mirror(
        output_dir: &Path,
        run_id: &str,
        outcome: &str,
        ee_before: f64,
        ee_after: f64,
    ) -> std::io::Result<()> {
        let runs_dir = output_dir.join("calibration").join("runs");
        fs::create_dir_all(&runs_dir)?;

        let mut content = String::from("# Calibration Run Mirror\n\n");
        content.push_str(&format!("- **Run ID**: `{}`\n", run_id));
        content.push_str(&format!("- **Outcome**: {}\n", outcome));
        content.push_str(&format!("- **EE Before**: {:.4}\n", ee_before));
        content.push_str(&format!("- **EE After**: {:.4}\n", ee_after));

        fs::write(runs_dir.join(format!("{}.md", run_id)), content)?;
        Ok(())
    }
}
