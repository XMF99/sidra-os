use std::fs;
use std::path::Path;

pub struct SelfReviewMirrorWriter;

impl SelfReviewMirrorWriter {
    pub fn write_review_mirror(
        output_dir: &Path,
        quarter: &str,
        review_id: &str,
        assessed_count: usize,
        proposals_count: usize,
    ) -> std::io::Result<()> {
        let rev_dir = output_dir.join("structure-reviews").join(quarter);
        fs::create_dir_all(&rev_dir)?;

        let mut content = String::from("# Structure Review Mirror (Propose-Never-Enact)\n\n");
        content.push_str(&format!("- **Review ID**: `{}`\n", review_id));
        content.push_str(&format!("- **Quarter**: {}\n", quarter));
        content.push_str(&format!("- **Departments Assessed**: {}\n", assessed_count));
        content.push_str(&format!("- **Proposals Raised**: {}\n\n", proposals_count));
        content.push_str("> **Note**: This review contains proposals ONLY. Org chart changes require a Principal Decision.\n");

        fs::write(rev_dir.join("assessment.md"), content)?;
        Ok(())
    }
}
