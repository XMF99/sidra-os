use std::fs;
use std::path::Path;

pub struct PortabilityMirrorWriter;

impl PortabilityMirrorWriter {
    pub fn write_template_mirror(
        output_dir: &Path,
        template_id: &str,
        name: &str,
        version: &str,
        digest: &str,
    ) -> std::io::Result<()> {
        let template_dir = output_dir
            .join("templates")
            .join("exported")
            .join(template_id);
        fs::create_dir_all(&template_dir)?;

        let mut content = String::from("# Firm Template Export Mirror\n\n");
        content.push_str(&format!("- **Template ID**: `{}`\n", template_id));
        content.push_str(&format!("- **Name**: {}\n", name));
        content.push_str(&format!("- **Version**: {}\n", version));
        content.push_str(&format!("- **Attestation Digest**: `{}`\n", digest));

        fs::write(template_dir.join("template.md"), content)?;
        Ok(())
    }
}
