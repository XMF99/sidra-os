//! Sidra OS Desktop Tauri Application Entry Point

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ipc;

use ipc::{app_get_status, AppState};
use sidra_kernel::Kernel;
use std::sync::Mutex;

fn main() {
    let kernel = Kernel::new();
    let app_state = AppState {
        kernel: Mutex::new(kernel),
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![app_get_status])
        .run(tauri::generate_context!())
        .expect("error while running sidra-app desktop application");
}
