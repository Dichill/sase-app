import { invoke } from "@tauri-apps/api/tauri";

const invoke = window.__TAURI__.core.invoke;

invoke('some_command');