//! Department Filesystem Scope Check (F-fs)
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §7.2

use crate::domain::FsScope;

pub fn authorize_write_path(path: &str, fs_scope: &FsScope) -> Result<(), String> {
    if fs_scope.is_unscoped() {
        return Ok(()); // Empty scope = v1 unscoped write
    }

    for allowed in &fs_scope.allowed_paths {
        if path.starts_with(allowed) {
            return Ok(());
        }
    }

    Err(format!(
        "Write to path '{path}' denied: outside department filesystem scope"
    ))
}
