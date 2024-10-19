// Prevents additional console window on Windows in release, DO NOT REMOVE UwU
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    polish_notation_visualizer_lib::run()
}
