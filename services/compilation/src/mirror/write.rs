use std::fs;
use std::path::Path;

pub struct CompilationMirrorWriter;

impl CompilationMirrorWriter {
    pub fn write_candidate_mirror(
        output_dir: &Path,
        candidate_id: &str,
        playbook_id: &str,
        status: &str,
        cited_count: usize,
    ) -> std::io::Result<()> {
        let cand_dir = output_dir.join("compilation").join("candidates");
        fs::create_dir_all(&cand_dir)?;

        let mut content = String::from("# Workflow Candidate Mirror\n\n");
        content.push_str(&format!("- **Candidate ID**: `{}`\n", candidate_id));
        content.push_str(&format!("- **Playbook ID**: `{}`\n", playbook_id));
        content.push_str(&format!("- **Status**: {}\n", status));
        content.push_str(&format!("- **Cited Missions Count**: {}\n", cited_count));

        fs::write(cand_dir.join(format!("{}.md", candidate_id)), content)?;
        Ok(())
    }
}
