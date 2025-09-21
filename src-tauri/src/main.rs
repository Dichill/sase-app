// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod profile;

fn main() {
  tauri_nextjs_template_lib::run();

  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      // expose commands to frontend
      add_income_source
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri app");
}

