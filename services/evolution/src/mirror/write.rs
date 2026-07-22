use std::fs;
use std::path::Path;

pub struct EvolutionMirrorWriter;

impl EvolutionMirrorWriter {
    pub fn write_revision_mirror(
        output_dir: &Path,
        revision_id: &str,
        archetype_id: &str,
        status: &str,
        decision_id: Option<&str>,
    ) -> std::io::Result<()> {
        let rev_dir = output_dir.join("evolution").join("revisions");
        fs::create_dir_all(&rev_dir)?;

        let mut content = String::from("# Charter Revision Mirror\n\n");
        content.push_str(&format!("- **Revision ID**: `{}`\n", revision_id));
        content.push_str(&format!("- **Archetype ID**: `{}`\n", archetype_id));
        content.push_str(&format!("- **Status**: {}\n", status));
        if let Some(dec) = decision_id {
            content.push_str(&format!("- **Decision ID**: `{}`\n", dec));
        }

        fs::write(rev_dir.join(format!("{}.md", revision_id)), content)?;
        Ok(())
    }
}
