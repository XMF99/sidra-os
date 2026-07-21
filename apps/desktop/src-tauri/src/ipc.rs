use sidra_domain::SystemInfo;
use sidra_kernel::Kernel;
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub kernel: Mutex<Kernel>,
}

#[tauri::command]
pub fn app_get_status(state: State<'_, AppState>) -> Result<SystemInfo, String> {
    let kernel = state
        .kernel
        .lock()
        .map_err(|e| format!("Lock failure: {}", e))?;
    Ok(kernel.get_status())
}
