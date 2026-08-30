use argon2::Argon2;
use base64::{engine::general_purpose::STANDARD as B64, Engine};
use chacha20poly1305::{aead::{Aead, KeyInit}, ChaCha20Poly1305, Nonce};
use chrono::{DateTime, Utc};
use rand::{rngs::OsRng, RngCore};
use serde::{Deserialize, Serialize};
use std::{
    collections::hash_map::DefaultHasher,
    fs,
    hash::{Hash, Hasher},
    io,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::Mutex,
    thread,
    time::{Duration, Instant},
};
use tauri::{Manager, State};
use tauri_plugin_opener::OpenerExt;
use walkdir::{DirEntry, WalkDir};

const MAX_FILE_BYTES: u64 = 25 * 1024 * 1024;
const MAX_RESULTS: usize = 100;

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
struct IndexData {
    sources: Vec<SourceRecord>,
    documents: Vec<Document>,
    last_indexed: Option<DateTime<Utc>>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct SourceRecord {
    path: String,
    document_count: usize,
    last_indexed: Option<DateTime<Utc>>,
    errors: Vec<String>,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct Document {
    id: String,
    title: String,
    path: String,
    source_path: String,
    kind: String,
    body: String,
    extracted_at: DateTime<Utc>,
    modified_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize)]
struct Status {
    sources: Vec<SourceRecord>,
    document_count: usize,
    locked: bool,
    encrypted: bool,
    last_indexed: Option<DateTime<Utc>>,
    demo: bool,
}

#[derive(Debug, Serialize)]
struct SearchResult {
    id: String,
    title: String,
    path: String,
    open_path: String,
    source_path: String,
    kind: String,
    snippet: String,
    extracted_at: DateTime<Utc>,
    modified_at: Option<DateTime<Utc>>,
    score: usize,
}

#[derive(Deserialize, Serialize)]
struct EncryptedEnvelope { salt: String, nonce: String, ciphertext: String }

struct AppState {
    data: Mutex<IndexData>,
    app_dir: PathBuf,
    encrypted: Mutex<bool>,
    locked: Mutex<bool>,
    password: Mutex<Option<String>>,
    demo: Mutex<bool>,
}

impl AppState {
    fn load(app_dir: PathBuf) -> Self {
        let encrypted_path = app_dir.join("index.enc");
        if encrypted_path.exists() {
            return Self { data: Mutex::new(IndexData::default()), app_dir, encrypted: Mutex::new(true), locked: Mutex::new(true), password: Mutex::new(None), demo: Mutex::new(false) };
        }
        let data = fs::read(app_dir.join("index.json")).ok().and_then(|bytes| serde_json::from_slice(&bytes).ok()).unwrap_or_default();
        Self { data: Mutex::new(data), app_dir, encrypted: Mutex::new(false), locked: Mutex::new(false), password: Mutex::new(None), demo: Mutex::new(false) }
    }

    fn persist(&self) -> Result<(), String> {
        fs::create_dir_all(&self.app_dir).map_err(to_string)?;
        let bytes = serde_json::to_vec(&*self.data.lock().map_err(to_string)?).map_err(to_string)?;
        if *self.demo.lock().map_err(to_string)? {
            return atomic_write(&self.app_dir.join("demo-index.json"), &bytes);
        }
        if *self.encrypted.lock().map_err(to_string)? {
            let password = self.password.lock().map_err(to_string)?.clone().ok_or("Encrypted index is locked")?;
            let envelope = encrypt_bytes(&bytes, &password)?;
            atomic_write(&self.app_dir.join("index.enc"), &serde_json::to_vec(&envelope).map_err(to_string)?)?;
            let _ = fs::remove_file(self.app_dir.join("index.json"));
        } else {
            atomic_write(&self.app_dir.join("index.json"), &bytes)?;
            let _ = fs::remove_file(self.app_dir.join("index.enc"));
        }
        Ok(())
    }
}

fn to_string(error: impl std::fmt::Display) -> String { error.to_string() }

fn atomic_write(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let temporary = path.with_extension("tmp");
    fs::write(&temporary, bytes).map_err(to_string)?;
    fs::rename(&temporary, path).map_err(to_string)
}

fn derive_key(password: &str, salt: &[u8]) -> Result<[u8; 32], String> {
    let mut key = [0u8; 32];
    Argon2::default().hash_password_into(password.as_bytes(), salt, &mut key).map_err(to_string)?;
    Ok(key)
}

fn encrypt_bytes(bytes: &[u8], password: &str) -> Result<EncryptedEnvelope, String> {
    let mut salt = [0u8; 16]; let mut nonce = [0u8; 12];
    OsRng.fill_bytes(&mut salt); OsRng.fill_bytes(&mut nonce);
    let key = derive_key(password, &salt)?;
    let cipher = ChaCha20Poly1305::new((&key).into());
    let ciphertext = cipher.encrypt(Nonce::from_slice(&nonce), bytes).map_err(|_| "Could not encrypt index".to_string())?;
    Ok(EncryptedEnvelope { salt: B64.encode(salt), nonce: B64.encode(nonce), ciphertext: B64.encode(ciphertext) })
}

fn decrypt_bytes(envelope: &EncryptedEnvelope, password: &str) -> Result<Vec<u8>, String> {
    let salt = B64.decode(&envelope.salt).map_err(to_string)?;
    let nonce = B64.decode(&envelope.nonce).map_err(to_string)?;
    let ciphertext = B64.decode(&envelope.ciphertext).map_err(to_string)?;
    if nonce.len() != 12 { return Err("Encrypted index is damaged".into()); }
    let key = derive_key(password, &salt)?;
    ChaCha20Poly1305::new((&key).into()).decrypt(Nonce::from_slice(&nonce), ciphertext.as_ref()).map_err(|_| "Password did not unlock the index".into())
}

#[tauri::command]
fn get_status(state: State<AppState>) -> Result<Status, String> {
    let locked = *state.locked.lock().map_err(to_string)?;
    let encrypted = *state.encrypted.lock().map_err(to_string)?;
    let data = state.data.lock().map_err(to_string)?;
    Ok(Status { sources: data.sources.clone(), document_count: data.documents.len(), locked, encrypted, last_indexed: data.last_indexed, demo: *state.demo.lock().map_err(to_string)? })
}

fn normal_index_data(app_dir: &Path) -> IndexData {
    fs::read(app_dir.join("index.json")).ok().and_then(|bytes| serde_json::from_slice(&bytes).ok()).unwrap_or_default()
}

fn sample_project_dir(app_dir: &Path) -> PathBuf { app_dir.join("demo-sample") }

fn write_sample_project(app_dir: &Path) -> Result<PathBuf, String> {
    let directory = sample_project_dir(app_dir);
    fs::create_dir_all(&directory).map_err(to_string)?;
    fs::write(directory.join("northwind-plan.md"), "# Northwind migration plan\n\nMAPLE-742 is the approval record. Preserve the original export until validation is complete.\n").map_err(to_string)?;
    fs::write(directory.join("field-notes.html"), "<html><head><title>Field notes</title><script>throw new Error('not searchable')</script><style>.hidden { display: none; }</style></head><body><h1>Northwind field notes</h1><p>The owner approved the staged migration on 14 May.</p></body></html>").map_err(to_string)?;
    fs::write(directory.join("project-mail.mbox"), "From arun@example.test Tue May 14 09:12:00 2026\nSubject: Re: Northwind approval\n\nThe approval for MAPLE-742 is in the migration plan. Keep the original export until validation.\n").map_err(to_string)?;
    Ok(directory)
}

#[tauri::command]
fn load_sample_project(state: State<AppState>) -> Result<Status, String> {
    *state.demo.lock().map_err(to_string)? = true;
    *state.encrypted.lock().map_err(to_string)? = false;
    *state.locked.lock().map_err(to_string)? = false;
    *state.password.lock().map_err(to_string)? = None;
    *state.data.lock().map_err(to_string)? = IndexData::default();
    let _ = fs::remove_file(state.app_dir.join("demo-index.json"));
    let directory = write_sample_project(&state.app_dir)?;
    index_source(directory.to_string_lossy().to_string(), state.clone())?;
    get_status(state)
}

#[tauri::command]
fn reset_sample_project(state: State<AppState>) -> Result<Status, String> { load_sample_project(state) }

#[tauri::command]
fn leave_sample_project(state: State<AppState>) -> Result<Status, String> {
    let _ = fs::remove_file(state.app_dir.join("demo-index.json"));
    let _ = fs::remove_dir_all(sample_project_dir(&state.app_dir));
    let encrypted = state.app_dir.join("index.enc").exists();
    *state.demo.lock().map_err(to_string)? = false;
    *state.encrypted.lock().map_err(to_string)? = encrypted;
    *state.locked.lock().map_err(to_string)? = encrypted;
    *state.password.lock().map_err(to_string)? = None;
    *state.data.lock().map_err(to_string)? = if encrypted { IndexData::default() } else { normal_index_data(&state.app_dir) };
    get_status(state)
}

#[tauri::command]
fn unlock_index(password: String, state: State<AppState>) -> Result<(), String> {
    let bytes = fs::read(state.app_dir.join("index.enc")).map_err(to_string)?;
    let envelope: EncryptedEnvelope = serde_json::from_slice(&bytes).map_err(|_| "Encrypted index is damaged".to_string())?;
    let plain = decrypt_bytes(&envelope, &password)?;
    let data: IndexData = serde_json::from_slice(&plain).map_err(|_| "Encrypted index is damaged".to_string())?;
    *state.data.lock().map_err(to_string)? = data;
    *state.password.lock().map_err(to_string)? = Some(password);
    *state.locked.lock().map_err(to_string)? = false;
    Ok(())
}

#[tauri::command]
fn set_encryption(enabled: bool, password: String, state: State<AppState>) -> Result<(), String> {
    if *state.locked.lock().map_err(to_string)? { return Err("Unlock the index first".into()); }
    if enabled && password.chars().count() < 10 { return Err("Use at least 10 characters for the index password".into()); }
    *state.encrypted.lock().map_err(to_string)? = enabled;
    *state.password.lock().map_err(to_string)? = if enabled { Some(password) } else { None };
    state.persist()
}

#[tauri::command]
fn index_source(path: String, state: State<AppState>) -> Result<SourceRecord, String> {
    if *state.locked.lock().map_err(to_string)? { return Err("Unlock the encrypted index first".into()); }
    let canonical = fs::canonicalize(&path).map_err(|_| "That source is no longer available".to_string())?;
    let source_path = canonical.to_string_lossy().to_string();
    let (documents, errors) = scan_source(&canonical)?;
    let now = Utc::now();
    let source = SourceRecord { path: source_path.clone(), document_count: documents.len(), last_indexed: Some(now), errors };
    {
        let mut data = state.data.lock().map_err(to_string)?;
        data.documents.retain(|document| document.source_path != source_path);
        data.documents.extend(documents);
        data.sources.retain(|source| source.path != source_path);
        data.sources.push(source.clone());
        data.sources.sort_by(|a, b| a.path.to_lowercase().cmp(&b.path.to_lowercase()));
        data.last_indexed = Some(now);
    }
    state.persist()?;
    Ok(source)
}

#[tauri::command]
fn refresh_all(state: State<AppState>) -> Result<(), String> {
    let paths: Vec<String> = state.data.lock().map_err(to_string)?.sources.iter().map(|source| source.path.clone()).collect();
    for path in paths { index_source(path, state.clone())?; }
    Ok(())
}

#[tauri::command]
fn remove_source(path: String, state: State<AppState>) -> Result<(), String> {
    {
        let mut data = state.data.lock().map_err(to_string)?;
        data.sources.retain(|source| source.path != path);
        data.documents.retain(|document| document.source_path != path);
    }
    state.persist()
}

#[tauri::command]
fn search_documents(query: &str, kind: Option<&str>, source: Option<&str>, data: &IndexData) -> Vec<SearchResult> {
    let terms: Vec<String> = query.split_whitespace().map(|term| term.to_lowercase()).filter(|term| !term.is_empty()).collect();
    if terms.is_empty() { return Vec::new(); }
    let mut matches: Vec<SearchResult> = data.documents.iter().filter(|document| {
        kind.map_or(true, |value| document.kind == value) && source.map_or(true, |value| document.source_path == value)
    }).filter_map(|document| {
        let title = document.title.to_lowercase(); let body = document.body.to_lowercase(); let path = document.path.to_lowercase();
        if !terms.iter().all(|term| title.contains(term) || body.contains(term) || path.contains(term)) { return None; }
        let score = terms.iter().map(|term| title.matches(term).count() * 8 + path.matches(term).count() * 4 + body.matches(term).count().min(20)).sum();
        Some(SearchResult { id: document.id.clone(), title: document.title.clone(), path: document.path.clone(), open_path: physical_path(document), source_path: document.source_path.clone(), kind: document.kind.clone(), snippet: make_snippet(&document.body, &terms), extracted_at: document.extracted_at, modified_at: document.modified_at, score })
    }).collect();
    matches.sort_by(|a, b| b.score.cmp(&a.score).then_with(|| b.modified_at.cmp(&a.modified_at)));
    matches.truncate(MAX_RESULTS);
    matches
}

fn physical_path(document: &Document) -> String {
    if document.kind == "mail" { document.path.split(" · message ").next().unwrap_or(&document.path).to_string() } else { document.path.clone() }
}

#[tauri::command]
fn search_index(query: String, kind: Option<String>, source: Option<String>, state: State<AppState>) -> Result<Vec<SearchResult>, String> {
    if *state.locked.lock().map_err(to_string)? { return Err("Unlock the encrypted index first".into()); }
    let data = state.data.lock().map_err(to_string)?;
    Ok(search_documents(&query, kind.as_deref(), source.as_deref(), &data))
}

fn csv_field(value: &str) -> String { format!("\"{}\"", value.replace('"', "\"\"")) }

fn results_as_csv(results: &[SearchResult]) -> String {
    let mut output = String::from("title,path,type,snippet,extracted_at\n");
    for result in results {
        output.push_str(&[csv_field(&result.title), csv_field(&result.path), csv_field(&result.kind), csv_field(&result.snippet), csv_field(&result.extracted_at.to_rfc3339())].join(","));
        output.push('\n');
    }
    output
}

#[tauri::command]
fn export_results(query: String, kind: Option<String>, source: Option<String>, path: String, state: State<AppState>) -> Result<usize, String> {
    if *state.locked.lock().map_err(to_string)? { return Err("Unlock the encrypted index first".into()); }
    if query.trim().is_empty() { return Err("Enter a search before exporting results".into()); }
    let data = state.data.lock().map_err(to_string)?;
    let results = search_documents(&query, kind.as_deref(), source.as_deref(), &data);
    atomic_write(Path::new(&path), results_as_csv(&results).as_bytes())?;
    Ok(results.len())
}

#[tauri::command]
fn open_source(path: String, app: tauri::AppHandle) -> Result<(), String> {
    if !Path::new(&path).exists() { return Err("The source moved or is unavailable".into()); }
    app.opener().open_path(path, None::<&str>).map_err(to_string)
}

fn scan_source(path: &Path) -> Result<(Vec<Document>, Vec<String>), String> {
    let entries: Vec<PathBuf> = if path.is_dir() {
        WalkDir::new(path).follow_links(false).into_iter().filter_entry(visible_entry).filter_map(Result::ok).filter(|entry| entry.file_type().is_file()).map(|entry| entry.into_path()).collect()
    } else { vec![path.to_path_buf()] };
    let mut documents = Vec::new(); let mut errors = Vec::new();
    let source_path = path.to_string_lossy().to_string();
    for file in entries {
        if kind_for(&file).is_none() { continue; }
        match parse_file(&file, &source_path) { Ok(mut found) => documents.append(&mut found), Err(error) => errors.push(format!("{}: {}", file.display(), error)) }
    }
    Ok((documents, errors))
}

fn visible_entry(entry: &DirEntry) -> bool {
    entry.depth() == 0 || !entry.file_name().to_string_lossy().starts_with('.')
}

fn kind_for(path: &Path) -> Option<&'static str> {
    match path.extension()?.to_string_lossy().to_lowercase().as_str() {
        "md" | "markdown" => Some("markdown"), "txt" => Some("text"), "html" | "htm" => Some("html"), "mbox" => Some("mail"), "pdf" => Some("pdf"), _ => None,
    }
}

fn parse_file(path: &Path, source_path: &str) -> Result<Vec<Document>, String> {
    let metadata = fs::metadata(path).map_err(to_string)?;
    if metadata.len() > MAX_FILE_BYTES { return Err("skipped because it is larger than 25 MB".into()); }
    let kind = kind_for(path).ok_or("unsupported file type")?;
    let extracted_at = Utc::now();
    let modified_at = metadata.modified().ok().map(DateTime::<Utc>::from);
    if kind == "mail" {
        let content = fs::read_to_string(path).map_err(|_| "mail export is not readable UTF-8".to_string())?;
        return Ok(parse_mbox(&content, path, source_path, extracted_at, modified_at));
    }
    let body = match kind {
        "pdf" => extract_pdf_isolated(path)?,
        "html" => strip_html(&fs::read_to_string(path).map_err(|_| "HTML export is not readable UTF-8".to_string())?),
        _ => fs::read_to_string(path).map_err(|_| "file is not readable UTF-8".to_string())?,
    };
    if body.trim().is_empty() { return Err(if kind == "pdf" { "PDF has no extractable text; scanned PDFs need OCR before indexing".into() } else { "file contains no searchable text".into() }); }
    let title = if kind == "markdown" { markdown_title(&body).unwrap_or_else(|| file_title(path)) } else { file_title(path) };
    Ok(vec![Document { id: stable_id(&format!("{}:0", path.display())), title, path: path.to_string_lossy().to_string(), source_path: source_path.into(), kind: kind.into(), body, extracted_at, modified_at }])
}

fn extract_pdf_isolated(path: &Path) -> Result<String, String> {
    let executable = std::env::current_exe().map_err(to_string)?;
    let mut child = Command::new(executable).arg("--extract-pdf").arg(path).stdin(Stdio::null()).stdout(Stdio::piped()).stderr(Stdio::piped()).spawn().map_err(to_string)?;
    let started = Instant::now();
    loop {
        if let Some(status) = child.try_wait().map_err(to_string)? {
            let output = child.wait_with_output().map_err(to_string)?;
            if !status.success() { return Err(String::from_utf8_lossy(&output.stderr).trim().to_string()); }
            return serde_json::from_slice(&output.stdout).map_err(|_| "PDF parser returned invalid output".into());
        }
        if started.elapsed() > Duration::from_secs(12) { let _ = child.kill(); return Err("PDF parser exceeded the 12 second safety limit".into()); }
        thread::sleep(Duration::from_millis(25));
    }
}

pub fn extract_pdf_worker(path: &str) -> Result<String, String> { pdf_extract::extract_text(path).map_err(|error| format!("PDF parser: {error}")) }

fn strip_html(input: &str) -> String {
    let mut result = String::with_capacity(input.len()); let mut in_tag = false; let mut last_space = false; let mut hidden_tag: Option<String> = None;
    let characters: Vec<char> = input.chars().collect(); let mut index = 0;
    while index < characters.len() {
        if characters[index] == '<' {
            let end = characters[index..].iter().position(|character| *character == '>').map(|offset| index + offset);
            if let Some(end) = end {
                let tag = characters[index + 1..end].iter().collect::<String>().trim().to_lowercase();
                let name = tag.trim_start_matches('/').split_whitespace().next().unwrap_or("");
                if hidden_tag.as_deref() == Some(name) && tag.starts_with('/') { hidden_tag = None; }
                else if hidden_tag.is_none() && !tag.starts_with('/') && (name == "script" || name == "style") { hidden_tag = Some(name.to_string()); }
                if hidden_tag.is_none() && !last_space { result.push(' '); last_space = true; }
                index = end + 1; continue;
            }
        }
        let character = characters[index];
        if hidden_tag.is_some() { index += 1; continue; }
        match character { '<' => in_tag = true, '>' => { in_tag = false; if !last_space { result.push(' '); last_space = true; } }, _ if !in_tag => { if character.is_whitespace() { if !last_space { result.push(' '); last_space = true; } } else { result.push(character); last_space = false; } }, _ => {} }
        index += 1;
    }
    result.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'")
}

fn parse_mbox(input: &str, path: &Path, source_path: &str, extracted_at: DateTime<Utc>, modified_at: Option<DateTime<Utc>>) -> Vec<Document> {
    let mut messages: Vec<String> = Vec::new(); let mut current = String::new();
    for line in input.lines() {
        if line.starts_with("From ") && !current.is_empty() { messages.push(std::mem::take(&mut current)); }
        current.push_str(line); current.push('\n');
    }
    if !current.trim().is_empty() { messages.push(current); }
    messages.into_iter().enumerate().filter_map(|(index, message)| {
        let title = message.lines().find_map(|line| line.strip_prefix("Subject:").map(str::trim)).filter(|value| !value.is_empty()).unwrap_or("Untitled message").to_string();
        let searchable = message.replace("\n>", "\n");
        if searchable.trim().is_empty() { return None; }
        Some(Document { id: stable_id(&format!("{}:{index}", path.display())), title, path: format!("{} · message {}", path.display(), index + 1), source_path: source_path.into(), kind: "mail".into(), body: searchable, extracted_at, modified_at })
    }).collect()
}

fn markdown_title(body: &str) -> Option<String> { body.lines().find_map(|line| line.trim().strip_prefix("# ").map(str::trim).filter(|title| !title.is_empty()).map(String::from)) }
fn file_title(path: &Path) -> String { path.file_stem().unwrap_or_default().to_string_lossy().replace(['_', '-'], " ") }
fn stable_id(value: &str) -> String { let mut hasher = DefaultHasher::new(); value.hash(&mut hasher); format!("{:016x}", hasher.finish()) }

fn make_snippet(body: &str, terms: &[String]) -> String {
    let lower = body.to_lowercase();
    let index = terms.iter().filter_map(|term| lower.find(term)).min().unwrap_or(0);
    let char_index = lower[..index].chars().count();
    let chars: Vec<char> = body.chars().collect();
    let start = char_index.saturating_sub(90); let end = (char_index + 220).min(chars.len());
    let text: String = chars[start..end].iter().collect::<String>().split_whitespace().collect::<Vec<_>>().join(" ");
    format!("{}{}{}", if start > 0 { "…" } else { "" }, text, if end < chars.len() { "…" } else { "" })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extracts_html_without_markup() {
        assert_eq!(strip_html("<h1>Archive &amp; Notes</h1><p>Private</p>"), " Archive & Notes Private ");
        assert!(!strip_html("<p>Visible fact</p><script>must not search</script><style>.hidden{}</style>").contains("must not search"));
    }

    #[test]
    fn splits_mailbox_into_source_grounded_messages() {
        let source = "From alice@example.test Mon Jan 1\nSubject: First note\n\nAlpha fact\nFrom bob@example.test Tue Jan 2\nSubject: Second note\n\nBeta fact";
        let docs = parse_mbox(source, Path::new("mail.mbox"), "/archive", Utc::now(), None);
        assert_eq!(docs.len(), 2); assert_eq!(docs[1].title, "Second note"); assert_eq!(docs[0].source_path, "/archive");
    }

    #[test]
    fn encryption_round_trips_and_rejects_wrong_password() {
        let envelope = encrypt_bytes(b"private corpus", "correct horse battery").unwrap();
        assert_eq!(decrypt_bytes(&envelope, "correct horse battery").unwrap(), b"private corpus");
        assert!(decrypt_bytes(&envelope, "incorrect password").is_err());
    }

    #[test]
    fn snippet_is_bounded_around_match() {
        let body = format!("{}needle{}", "a ".repeat(100), " z".repeat(100));
        let snippet = make_snippet(&body, &["needle".into()]);
        assert!(snippet.contains("needle")); assert!(snippet.chars().count() < 330);
    }

    #[test]
    fn exports_quoted_csv_with_each_result() {
        let result = SearchResult { id: "1".into(), title: "Northwind, plan".into(), path: "/archive/northwind.md".into(), open_path: "/archive/northwind.md".into(), source_path: "/archive".into(), kind: "markdown".into(), snippet: "MAPLE-742".into(), extracted_at: Utc::now(), modified_at: None, score: 1 };
        let csv = results_as_csv(&[result]);
        assert!(csv.starts_with("title,path,type,snippet,extracted_at\n"));
        assert!(csv.contains("\"Northwind, plan\""));
    }

    #[test]
    fn result_open_path_is_the_record_not_its_source_root() {
        let document = Document { id: "1".into(), title: "A".into(), path: "/archive/notes/fact.md".into(), source_path: "/archive".into(), kind: "markdown".into(), body: "MAPLE-742".into(), extracted_at: Utc::now(), modified_at: None };
        let result = search_documents("MAPLE-742", None, None, &IndexData { documents: vec![document], ..Default::default() });
        assert_eq!(result[0].open_path, "/archive/notes/fact.md");
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let dir = app.path().app_data_dir().map_err(|error| io::Error::new(io::ErrorKind::Other, error))?;
            fs::create_dir_all(&dir)?;
            app.manage(AppState::load(dir));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_status, unlock_index, set_encryption, index_source, refresh_all, remove_source, search_index, export_results, load_sample_project, reset_sample_project, leave_sample_project, open_source])
        .run(tauri::generate_context!())
        .expect("error while running Local Data Finder");
}
