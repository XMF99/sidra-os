//! Sidra OS Desktop Tauri Application Entry Point

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ipc;

use ipc::{
    app_execute_goal, app_get_event_log, app_get_plugins, app_get_status, app_verify_event_chain,
    AppState,
};

fn main() {
    let app_state = AppState::new();

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            app_get_status,
            app_execute_goal,
            app_get_event_log,
            app_verify_event_chain,
            app_get_plugins
        ])
        .run(tauri::generate_context!())
        .expect("error while running sidra-app desktop application");
}
