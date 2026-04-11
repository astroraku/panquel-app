#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;
use tauri_plugin_shell::process::{CommandChild, CommandEvent};
use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;


struct BackendState {
    child: Mutex<Option<CommandChild>>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(BackendState {
            child: Mutex::new(None),
        })
        .setup(|app| {
            let shell = app.shell();

            let (mut rx, child) = shell
                .sidecar("backend")
                .expect("Error creando sidecar")
                .spawn()
                .expect("Error lanzando backend");

            // Guardar el proceso
            let state = app.state::<BackendState>();
            *state.child.lock().unwrap() = Some(child);

            // Logs del backend
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        println!("Django: {}", String::from_utf8_lossy(&line));
                    }
                }
            });

            Ok(())
        })

        // 🔥 CUANDO SE CIERRA LA APP
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let state = window.state::<BackendState>();

                let mut guard = state.child.lock().unwrap();

                if let Some(child) = guard.take() {
                    let _ = child.kill();
                    println!("Backend cerrado correctamente");
                }
            }
        })

        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}