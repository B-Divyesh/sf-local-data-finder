import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import "./styles.css";
import { filterLabel, highlightSnippet, SUPPORTED_TYPES } from "./search";
import type { SearchFilters, SearchResult, Status } from "./types";

const emptyStatus: Status = { sources: [], document_count: 0, locked: false, encrypted: false, last_indexed: null, demo: false };
let status = emptyStatus;
let results: SearchResult[] = [];
let selectedResult = -1;
let filters: SearchFilters = { kind: "all" };
let searchTimer = 0;

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <header class="topbar">
    <div class="brand"><svg aria-hidden="true" viewBox="0 0 40 40"><path d="M7 9h21M7 20h15M7 31h21"/><circle cx="28" cy="20" r="6"/><path d="m32.5 24.5 5 5"/></svg><span>Local Data Finder</span></div>
    <div class="privacy-signal"><span aria-hidden="true"></span> On-device only</div>
    <button class="icon-button" id="settings-button" aria-label="Open settings" title="Settings"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"/></svg></button>
  </header>
  <section class="demo-banner" id="demo-banner" hidden aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved with your archive.</span><span><button class="text-button" id="reset-demo">Reset demo</button><button class="text-button" id="leave-demo">Start for real</button></span></section>
  <div class="app-shell">
    <aside class="source-rail" id="source-rail" aria-label="Indexed sources">
      <div class="rail-heading"><h2>Sources</h2><div><button class="icon-button mobile-close" id="close-sources" aria-label="Close sources">×</button><button class="icon-button" id="refresh-sources" aria-label="Refresh all sources" title="Refresh all sources">↻</button></div></div>
      <div class="source-list" id="source-list"></div>
      <div class="source-actions">
        <button class="button secondary" id="add-folder">+ Add folder</button>
        <button class="button ghost" id="add-files">Add exports</button>
      </div>
      <p class="support-note">Markdown, text, HTML, mbox and text-based PDF. Mail attachments are never opened.</p>
    </aside>
    <main id="main" tabindex="-1">
      <div class="workspace-heading">
        <div><p class="eyebrow">Private archive retrieval</p><h1>Find the record, not a guess.</h1></div>
        <button class="button ghost mobile-sources" id="show-sources" aria-controls="source-rail" aria-expanded="false">Sources <span id="mobile-source-count">0</span></button>
      </div>
      <section class="search-area" aria-labelledby="search-label">
        <label id="search-label" for="search-input">Search your indexed records</label>
        <div class="search-beam"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input id="search-input" type="search" autocomplete="off" placeholder="A phrase, person, filename, or remembered detail…" /><kbd>⌘ K</kbd></div>
        <div class="filter-row" aria-label="Filter by record type" id="type-filters"></div>
        <button class="button ghost export-button" id="export-results" disabled>Export these results as CSV</button>
      </section>
      <div class="status-line" id="status-line" aria-live="polite"></div>
      <section id="results-region" aria-label="Search results"></section>
    </main>
  </div>
  <div class="drawer-backdrop" id="drawer-backdrop" hidden></div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <dialog id="settings-dialog" aria-labelledby="settings-title">
    <form method="dialog" class="dialog-inner">
      <div class="dialog-heading"><div><p class="eyebrow">Local controls</p><h2 id="settings-title">Settings</h2></div><button class="icon-button" value="cancel" aria-label="Close settings">×</button></div>
      <section><h3>Appearance</h3><div class="segmented" role="group" aria-label="Color theme"><button type="button" data-theme="dark">Dark</button><button type="button" data-theme="light">Light</button><button type="button" data-theme="system">System</button></div></section>
      <section><h3>Index encryption</h3><p>Encrypt paths and extracted text at rest. Your password is kept only for this session. Losing it means rebuilding the index.</p><div class="inline-form"><label for="encryption-password">Index password</label><input id="encryption-password" type="password" autocomplete="new-password" minlength="10" /><button type="button" class="button secondary" id="toggle-encryption">Enable encryption</button></div></section>
      <p class="dialog-note">The app does not send your selected files or search text to a service.</p>
    </form>
  </dialog>
  <dialog id="unlock-dialog" aria-labelledby="unlock-title"><form method="dialog" class="dialog-inner narrow"><h2 id="unlock-title">Unlock your index</h2><p>This index is encrypted. Enter its password to search or re-index it.</p><label for="unlock-password">Index password</label><input id="unlock-password" type="password" autocomplete="current-password" /><p class="form-error" id="unlock-error" aria-live="assertive"></p><div class="dialog-actions"><button class="button primary" type="button" id="unlock-button">Unlock index</button></div></form></dialog>
`;

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const searchInput = $("#search-input") as HTMLInputElement;
const resultsRegion = $("#results-region") as HTMLElement;
const statusLine = $("#status-line") as HTMLElement;
const toast = $("#toast") as HTMLElement;

function renderDemoBanner() { ($("#demo-banner") as HTMLElement).hidden = status.demo !== true; }

function renderSettings() {
  const toggle = $("#toggle-encryption") as HTMLButtonElement;
  const password = $("#encryption-password") as HTMLInputElement;
  toggle.textContent = status.encrypted ? "Disable encryption" : "Enable encryption";
  toggle.setAttribute("aria-pressed", String(status.encrypted));
  password.required = !status.encrypted;
  document.querySelectorAll<HTMLButtonElement>(".segmented [data-theme]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.theme === document.documentElement.dataset.theme)));
}

function showToast(message: string, danger = false) {
  toast.textContent = message;
  toast.classList.toggle("danger", danger);
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3600);
}

function formatDate(value: string | null): string {
  if (!value) return "Not indexed yet";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

async function call<T>(command: string, args: Record<string, unknown> = {}): Promise<T> {
  try { return await invoke<T>(command, args); }
  catch (error) { throw new Error(String(error).replace(/^Error:\s*/, "")); }
}

function renderFilters() {
  $("#type-filters").innerHTML = SUPPORTED_TYPES.map((kind) => `<button class="filter ${filters.kind === kind ? "active" : ""}" data-kind="${kind}" aria-pressed="${filters.kind === kind}">${kind === "all" ? "Everything" : kind[0].toUpperCase() + kind.slice(1)}</button>`).join("");
}

function renderSources() {
  $("#mobile-source-count").textContent = String(status.sources.length);
  const list = $("#source-list");
  if (!status.sources.length) {
    list.innerHTML = `<div class="rail-empty"><svg aria-hidden="true" viewBox="0 0 48 48"><path d="M7 13h13l4 5h17v21H7z"/><path d="M7 18h34"/></svg><p>No sources yet</p><span>Choose only the folders and exports you want indexed.</span></div>`;
    return;
  }
  list.innerHTML = status.sources.map((source) => {
    const name = source.path.split(/[\\/]/).filter(Boolean).pop() || source.path;
    const active = filters.source === source.path;
    return `<div class="source-wrap"><button class="source-row ${active ? "active" : ""}" data-source="${encodeURIComponent(source.path)}" title="${escapeAttr(source.path)}"><span class="source-glyph" aria-hidden="true">${source.errors.length ? "!" : "⌑"}</span><span><strong>${escapeText(name)}</strong><small>${source.document_count.toLocaleString()} records</small></span></button><button class="source-menu" data-remove="${encodeURIComponent(source.path)}" aria-label="Remove ${escapeAttr(name)} from index">×</button>${source.errors.length ? `<details class="source-error"><summary>${source.errors.length} ${source.errors.length === 1 ? "file was" : "files were"} skipped — show reasons</summary><ul>${source.errors.map((error) => `<li>${escapeText(error)}. Choose a text-based export, repair the file, or remove it from this source and refresh.</li>`).join("")}</ul></details>` : ""}</div>`;
  }).join("");
}

function escapeText(value: string): string { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }
function escapeAttr(value: string): string { return escapeText(value).replace(/"/g, "&quot;"); }

function renderResults() {
  const query = searchInput.value.trim();
  ($("#export-results") as HTMLButtonElement).disabled = !query;
  if (!status.sources.length) {
    resultsRegion.innerHTML = `<div class="empty-state"><div class="empty-orbit" aria-hidden="true"><span></span></div><p class="eyebrow">Choose your next step</p><h2>Choose the first place to search</h2><p>Add a folder or explicit export. We extract searchable text locally and keep the source path beside every match.</p><div class="empty-actions"><button class="button primary" id="empty-add">Add a folder</button><button class="button secondary" id="load-sample">Load sample project</button></div><p class="support-note">The sample is separate from your index and is discarded when you start for real.</p></div>`;
    $("#empty-add").addEventListener("click", () => addSources(true));
    $("#load-sample").addEventListener("click", loadSampleProject);
    statusLine.textContent = "No indexed records";
    return;
  }
  if (!query) {
    resultsRegion.innerHTML = `<div class="ready-state"><p class="eyebrow">Index ready</p><h2>${status.document_count.toLocaleString()} records within reach</h2><p>Try a phrase you remember, a sender, or part of a filename. Press <kbd>/</kbd> anywhere to focus search.</p><div class="source-trail"><span>Query</span><i></i><span>Matched text</span><i></i><span>Local source</span></div></div>`;
    statusLine.textContent = `${status.document_count.toLocaleString()} records · ${status.sources.length} sources · ${status.encrypted ? "encrypted" : "local index"}`;
    return;
  }
  statusLine.textContent = `${results.length.toLocaleString()} ${results.length === 1 ? "match" : "matches"} · ${filterLabel(filters)}`;
  ($("#export-results") as HTMLButtonElement).disabled = false;
  if (!results.length) {
    resultsRegion.innerHTML = `<div class="no-results"><h2>No source record matched “${escapeText(query)}”</h2><p>Try fewer words, check another record type, or refresh your sources if files changed.</p><button class="button secondary" id="refresh-empty">Refresh index</button></div>`;
    $("#refresh-empty").addEventListener("click", refreshAll);
    return;
  }
  resultsRegion.innerHTML = `<ol class="results-list">${results.map((result, index) => `<li><button class="result-row ${index === selectedResult ? "selected" : ""}" data-result="${index}"><span class="kind-glyph" aria-hidden="true">${{ mail: "@", pdf: "P", html: "〈〉", markdown: "#", text: "T" }[result.kind] || "·"}</span><span class="result-body"><span class="result-top"><strong>${escapeText(result.title)}</strong><span class="kind-label">${result.kind}</span></span><span class="snippet" id="snippet-${index}"></span><span class="evidence"><span class="path">${escapeText(result.path)}</span><span>Extracted ${formatDate(result.extracted_at)}</span></span></span><span class="open-cue">Open source <span aria-hidden="true">↗</span></span></button></li>`).join("")}</ol>`;
  results.forEach((result, index) => $(`#snippet-${index}`).append(highlightSnippet(result.snippet, query)));
}

async function loadStatus() {
  try {
    status = await call<Status>("get_status");
    renderDemoBanner(); renderSources(); renderResults(); renderSettings();
    if (status.locked) ($("#unlock-dialog") as HTMLDialogElement).showModal();
  } catch (error) {
    statusLine.textContent = "Desktop bridge unavailable";
    resultsRegion.innerHTML = `<div class="error-state"><h2>The local index could not be opened</h2><p>${escapeText((error as Error).message)}</p><p>Restart the desktop app. Your original files are untouched.</p></div>`;
  }
}

async function runSearch() {
  const query = searchInput.value.trim();
  if (!query) { results = []; selectedResult = -1; renderResults(); return; }
  statusLine.innerHTML = `<span class="spinner" aria-hidden="true"></span> Searching local text…`;
  try {
    results = await call<SearchResult[]>("search_index", { query, kind: filters.kind === "all" ? null : filters.kind, source: filters.source || null });
    selectedResult = results.length ? 0 : -1; renderResults();
  } catch (error) { statusLine.textContent = "Search failed"; showToast((error as Error).message, true); }
}

async function addSources(directory: boolean) {
  try {
    const picked = await open({ directory, multiple: true, filters: directory ? undefined : [{ name: "Supported exports", extensions: ["md", "markdown", "txt", "html", "htm", "mbox", "pdf"] }] });
    if (!picked) return;
    let paths = Array.isArray(picked) ? picked : [picked];
    for (const path of paths) {
      statusLine.innerHTML = `<span class="spinner"></span> Indexing ${escapeText(path.split(/[\\/]/).pop() || path)}…`;
      await call("index_source", { path });
    }
    showToast(`Indexed ${paths.length} ${paths.length === 1 ? "source" : "sources"}`);
    await loadStatus(); await runSearch();
  } catch (error) { showToast((error as Error).message, true); }
}

async function refreshAll() {
  statusLine.innerHTML = `<span class="spinner"></span> Refreshing selected sources…`;
  try { await call("refresh_all"); await loadStatus(); await runSearch(); showToast("Index refreshed"); }
  catch (error) { showToast((error as Error).message, true); }
}

async function removeSource(path: string) {
  if (!confirm(`Remove “${path}” from the index?\n\nThe original files will not be changed.`)) return;
  try { await call("remove_source", { path }); filters.source = undefined; await loadStatus(); await runSearch(); showToast("Source removed from the index"); }
  catch (error) { showToast((error as Error).message, true); }
}

async function openResult(index: number) {
  const result = results[index]; if (!result) return;
  try { await call("open_source", { path: result.open_path }); }
  catch (error) { showToast(`Could not open source: ${(error as Error).message}`, true); }
}

async function loadSampleProject() {
  statusLine.textContent = "Loading sample project…";
  try { status = await call<Status>("load_sample_project"); results = []; selectedResult = -1; renderDemoBanner(); renderSources(); renderResults(); renderSettings(); showToast("Sample project loaded. Search MAPLE-742 to try it."); }
  catch (error) { showToast((error as Error).message, true); }
}

async function exportCurrentResults() {
  const query = searchInput.value.trim();
  if (!query) return showToast("Enter a search before exporting results", true);
  try {
    const path = await save({ defaultPath: "local-data-finder-results.csv", filters: [{ name: "CSV", extensions: ["csv"] }] });
    if (!path) return;
    const count = await call<number>("export_results", { query, kind: filters.kind === "all" ? null : filters.kind, source: filters.source || null, path });
    showToast(`Exported ${count} ${count === 1 ? "result" : "results"} as CSV`);
  } catch (error) { showToast((error as Error).message, true); }
}

function setTheme(theme: string) {
  localStorage.setItem("theme", theme);
  document.documentElement.dataset.theme = theme;
  renderSettings();
}

const mobileLayout = window.matchMedia("(max-width: 760px)");
const sourceRail = $("#source-rail") as HTMLElement;
const showSources = $("#show-sources") as HTMLButtonElement;
const drawerBackdrop = $("#drawer-backdrop") as HTMLElement;

function closeSources(restoreFocus = true) {
  sourceRail.classList.remove("open");
  showSources.setAttribute("aria-expanded", "false");
  drawerBackdrop.hidden = true;
  sourceRail.removeAttribute("role");
  sourceRail.removeAttribute("aria-modal");
  if (mobileLayout.matches) {
    sourceRail.inert = true;
    sourceRail.setAttribute("aria-hidden", "true");
    sourceRail.hidden = true;
    if (restoreFocus) showSources.focus();
  }
}

function openSources() {
  if (!mobileLayout.matches) return;
  sourceRail.hidden = false;
  sourceRail.inert = false;
  sourceRail.removeAttribute("aria-hidden");
  sourceRail.setAttribute("role", "dialog");
  sourceRail.setAttribute("aria-modal", "true");
  drawerBackdrop.hidden = false;
  showSources.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => sourceRail.classList.add("open"));
  ($("#close-sources") as HTMLButtonElement).focus();
}

function syncSourceRail() {
  if (mobileLayout.matches) closeSources(false);
  else {
    sourceRail.hidden = false;
    sourceRail.inert = false;
    sourceRail.removeAttribute("aria-hidden");
    sourceRail.removeAttribute("role");
    sourceRail.removeAttribute("aria-modal");
    sourceRail.classList.remove("open");
    drawerBackdrop.hidden = true;
    showSources.setAttribute("aria-expanded", "false");
  }
}

$("#add-folder").addEventListener("click", () => addSources(true));
$("#add-files").addEventListener("click", () => addSources(false));
$("#refresh-sources").addEventListener("click", refreshAll);
$("#export-results").addEventListener("click", exportCurrentResults);
$("#reset-demo").addEventListener("click", async () => {
  try { status = await call<Status>("reset_sample_project"); results = []; selectedResult = -1; renderDemoBanner(); renderSources(); renderResults(); renderSettings(); showToast("Sample project reset"); }
  catch (error) { showToast((error as Error).message, true); }
});
$("#leave-demo").addEventListener("click", async () => {
  try { status = await call<Status>("leave_sample_project"); results = []; selectedResult = -1; filters = { kind: "all" }; renderDemoBanner(); renderFilters(); renderSources(); renderResults(); renderSettings(); showToast("Sample data discarded. Choose a folder to start."); }
  catch (error) { showToast((error as Error).message, true); }
});
$("#settings-button").addEventListener("click", () => ($("#settings-dialog") as HTMLDialogElement).showModal());
showSources.addEventListener("click", openSources);
$("#close-sources").addEventListener("click", () => closeSources());
drawerBackdrop.addEventListener("click", () => closeSources());
searchInput.addEventListener("input", () => { window.clearTimeout(searchTimer); searchTimer = window.setTimeout(runSearch, 180); });
$("#type-filters").addEventListener("click", (event) => { const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-kind]"); if (!button) return; filters.kind = button.dataset.kind; renderFilters(); runSearch(); });
$("#source-list").addEventListener("click", (event) => {
  const remove = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-remove]");
  if (remove) return void removeSource(decodeURIComponent(remove.dataset.remove!));
  const row = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-source]");
  if (row) { const source = decodeURIComponent(row.dataset.source!); filters.source = filters.source === source ? undefined : source; renderSources(); runSearch(); closeSources(); }
});
resultsRegion.addEventListener("click", (event) => { const row = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-result]"); if (row) openResult(Number(row.dataset.result)); });
document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement;
  if ((event.key === "/" && target.tagName !== "INPUT") || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) { event.preventDefault(); searchInput.focus(); }
  if (target === searchInput && results.length && ["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); selectedResult = Math.max(0, Math.min(results.length - 1, selectedResult + (event.key === "ArrowDown" ? 1 : -1))); renderResults(); document.querySelector<HTMLElement>(`[data-result="${selectedResult}"]`)?.focus(); }
  // Result rows are native buttons. Their click event already covers Enter and
  // Space; handling Enter here as well opens the same source twice.
  if (event.key === "Escape" && target === searchInput && searchInput.value) { searchInput.value = ""; runSearch(); }
  if (event.key === "Escape" && sourceRail.classList.contains("open")) { event.preventDefault(); closeSources(); }
  if (event.key === "Tab" && sourceRail.classList.contains("open")) {
    const focusable = [...sourceRail.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => !element.hidden);
    const first = focusable[0]; const last = focusable.at(-1);
    if (event.shiftKey && target === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && target === last) { event.preventDefault(); first?.focus(); }
  }
});
document.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.theme!)));

$("#toggle-encryption").addEventListener("click", async () => {
  const password = ($("#encryption-password") as HTMLInputElement).value;
  if (!status.encrypted && password.length < 10) return showToast("Use at least 10 characters for the index password", true);
  try { await call("set_encryption", { enabled: !status.encrypted, password }); showToast(status.encrypted ? "Index encryption disabled" : "Index encrypted"); await loadStatus(); }
  catch (error) { showToast((error as Error).message, true); }
});

$("#unlock-button").addEventListener("click", async () => {
  const input = $("#unlock-password") as HTMLInputElement;
  try { await call("unlock_index", { password: input.value }); ($("#unlock-dialog") as HTMLDialogElement).close(); input.value = ""; await loadStatus(); }
  catch { $("#unlock-error").textContent = "That password could not unlock this index. Try again."; input.select(); }
});

setTheme(localStorage.getItem("theme") || "system");
mobileLayout.addEventListener("change", syncSourceRail);
syncSourceRail();
renderFilters();
void loadStatus();
