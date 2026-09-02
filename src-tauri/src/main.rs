fn main() {
    if std::env::args().nth(1).as_deref() == Some("--extract-pdf") {
        let path = std::env::args().nth(2).unwrap_or_default();
        match local_data_finder_lib::extract_pdf_worker(&path) {
            Ok(text) => {
                println!("{}", serde_json::to_string(&text).unwrap_or_default());
            }
            Err(error) => {
                eprintln!("{error}");
                std::process::exit(2);
            }
        }
        return;
    }
    local_data_finder_lib::run();
}
