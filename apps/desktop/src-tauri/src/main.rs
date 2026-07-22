//! Sidra OS Desktop Tauri Application Entry Point

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ipc;

use ipc::{
    app_create_seat, app_execute_artifact, app_execute_goal, app_get_event_log, app_get_milestones,
    app_get_plugins, app_get_status, app_get_system_health, app_list_artifacts, app_list_seats,
    app_verify_event_chain, voice_begin_capture, voice_cancel_capture, voice_model_status,
    voice_stop_capture, AppState,
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
            app_get_plugins,
            app_list_seats,
            app_create_seat,
            app_list_artifacts,
            app_execute_artifact,
            app_get_milestones,
            app_get_system_health,
            voice_begin_capture,
            voice_stop_capture,
            voice_cancel_capture,
            voice_model_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running sidra-app desktop application");
}
