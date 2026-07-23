use std::path::PathBuf;

fn main() {
    let target_icon = PathBuf::from(r"C:\target\icon.ico");
    let _ = std::fs::copy(
        r"C:\sidra-os\apps\desktop\src-tauri\icons\icon.ico",
        &target_icon,
    );
    let attrs = tauri_build::Attributes::new()
        .windows_attributes(tauri_build::WindowsAttributes::new().window_icon_path(target_icon));
    let _ = tauri_build::try_build(attrs);
}
