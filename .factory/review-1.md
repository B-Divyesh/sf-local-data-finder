# Adversarial first-read review 1 — Local Data Finder

**URL checked:** `https://local-data-finder.sociobot.in/`  
**Date:** 1 September 2026 UTC  
**Verdict:** **FAIL**

Two blocking accessibility/truthfulness defects and six additional copy/claims defects remain. The first screen, one-click web demo, visual identity, core declared tests, and most static-site structure otherwise verify.

## First 30 seconds

Fresh Chromium contexts at 1440×900 and 390×844 answered the required questions before scrolling:

- **What:** “Find facts in your local archive.”
- **For whom:** “For professionals with years of notes and exports...”
- **First action:** “Try it with sample data” / “Open the sample project.”

At 390 px the sample action measured 350×74 px at y=527. It opens `/demo/` in one click. The landing page made no console or page errors. The landing requests were the product origin plus the documented GitHub releases API.

## Findings

### F-1-1 — BLOCKING — route changes do not move focus to the new page heading

**Location:** live header navigation on `/`; all static route templates.

Clicking **Demo** from the landing page opened `/demo/`, but `document.activeElement` was `BODY`, the new `<h1>` had no `tabindex`, and there was no route-announcement region. Browser Back restored the landing scroll position (5087 px in this check), but left focus on `BODY` again. This fails the required route-change focus and announcement behavior. A keyboard or screen-reader visitor lands at the top of a new document without being taken to, or told, the new page purpose.

**Concrete fix:** make each route's `h1` programmatically focusable and focus it on navigation/load, with a polite announcement such as “Demo — Local Data Finder”. Preserve the current focused element and scroll position for Back/Forward. Add a Playwright regression that clicks each header route, uses Back, and asserts focus/announcement.

### F-1-2 — BLOCKING — README makes a false, untested sandbox-cleanup promise

**Location:** `README.md`, “How local data is handled”: “The demo uses a separate `demo-index.json` and `demo-sample` directory there, **and is removed on exit**.”

The desktop code only calls `discard_sample_project()` from `leave_sample_project()` (the **Start for real** action). `src-tauri/src/main.rs` has no application-exit handler, and a normal close while demo mode is active leaves `demo-index.json` and `demo-sample` in the app-data directory. The related manifest claim promises cleanup on **Start for real**, not exit, and its test does not test exit cleanup. This is both an unlisted claim and a misleading privacy statement.

**Concrete fix:** either implement exit cleanup and add a `@claim:desktop-demo-exit-cleanup` test that closes a demo session and checks both artifacts are absent, or replace the sentence with: “The demo uses a separate `demo-index.json` and `demo-sample` directory. **Start for real** removes both before you choose your sources.” Register the surviving promise in `claims.json`.

### F-1-3 — BLOCKING — “1 source trail per result” has no declared claim or observable test

**Location:** live landing proof strip: “**1 source trail per result**”.

No `claims.json` entry states that every result has exactly one source trail. `exact-source-open` verifies an open path for one constructed result; it does not establish a source trail for every result or the numeric “1” claim.

**Concrete fix:** add a `source-trail-per-result` claim and a fixture with multiple result kinds that asserts each visible/exported result has exactly one source path and extraction time; otherwise remove the numeric claim.

### F-1-4 — BLOCKING — the landing's platform-detection statement is unlisted

**Location:** `README.md`, Install: “The landing page detects the visitor's OS and resolves its button from the latest GitHub Release manifest.”

This is a useful, testable product statement, but no `claims.json` entry covers OS detection or release-button resolution. Existing checksum tests do not exercise platform user agents or the resolved asset.

**Concrete fix:** add a `platform-download-selection` claim that stubs the release manifest and checks macOS, Windows, Linux, and Apple-silicon user agents receive the right asset; or replace the sentence with a non-claiming instruction to use the GitHub release page.

### F-1-5 — BLOCKING — the normal-index durability statement is unlisted

**Location:** `README.md`, “The normal index is an **atomic JSON file** in the operating system's application-data directory.”

Neither this storage-location statement nor its atomic-write durability promise is declared in `claims.json`. The encryption and desktop-local tests do not prove either statement.

**Concrete fix:** add a `normal-index-storage` claim with a temporary app-data directory and interrupted-write/replace assertion, or simplify the README to the privacy fact that is already tested: “Your normal index stays in your operating system's app-data folder.”

### F-1-6 — BLOCKING — README names an encryption implementation without a matching claim

**Location:** `README.md`: “Encrypted mode stores a **ChaCha20-Poly1305** envelope whose key is derived with **Argon2**...”

`encrypted-index` proves encrypted paths/text and correct-password recovery, but its declared claim does not say which cipher or key derivation is used. The technical implementation assertion is therefore unlisted.

**Concrete fix:** either add an `encryption-algorithm` claim and a fixture that verifies the persisted envelope and KDF parameters, or replace the sentence with the already tested plain-language promise: “Encrypted mode protects extracted text and paths. Your password lasts only for this app session.”

### F-1-7 — BLOCKING — source-choice promise has no matching claim

**Location:** landing first-screen fact “Choose each source” and README: “It indexes only sources the user explicitly chooses.”

`source-selection` verifies that hidden and unsupported files are skipped after a source is scanned. It does not test that the product never discovers or indexes a folder/file the visitor did not choose. This is central to the privacy proposition and needs direct proof.

**Concrete fix:** add a `selected-sources-only` claim that creates sibling unselected content, indexes one explicit source, and asserts the sibling is absent from the index/results. Keep the same terms, preferably “sources you choose,” throughout.

### F-1-8 — MINOR — a README sentence exceeds the 22-word hard limit

**Location:** `README.md` opening paragraph (28 words): “It indexes only sources the user explicitly chooses, searches the extracted text locally without a network connection, and attaches a local path and extraction timestamp to every result.”

It combines source scope, local processing, and result metadata in one sentence. A cold reader has to unpack three promises.

**Concrete fix:** “It indexes only sources you choose. Search stays on your computer. Each result names its local path and extraction time.”

### F-1-9 — MINOR — metaphor-led and non-result copy obscures concrete actions

**Location:** live landing: heading “Build a local evidence map”; install eyebrow “Prefer a terminal?”; two buttons labelled “Copy”.

“Evidence map” is a metaphor rather than the operation being performed. “Prefer a terminal?” does not name the section. “Copy” does not state what will be copied.

**Concrete fix:** use “Extract text from your selected sources”, “Install from a terminal”, “Copy macOS/Linux install command”, and “Copy Windows install command”.

### F-1-10 — MINOR — reader-facing privacy text uses unexplained technical jargon

**Location:** landing privacy card: “The app has no analytics SDK, user account, or corpus API.” README: “atomic JSON”, “ChaCha20-Poly1305”, and “Argon2”.

The audience is a professional looking for records, not necessarily a developer. These terms do not tell the reader what happens to their archive.

**Concrete fix:** landing: “The app has no tracking, account, or service that receives your archive.” Move cipher/storage implementation detail to a clearly labelled technical-security note only if it is tested.

## Copy audit

Word counts use visible words; product names, code commands, file paths, and dates are counted where they convey information. No landing line exceeds 22 words. The flagged rows are the findings above.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Local search for selected records | 5 | Pass |
| Find facts in your local archive. | 6 | Pass |
| For professionals with years of notes and exports, find the original record without uploading it. | 15 | Pass |
| Try it with sample data | 5 | Pass |
| Open the sample project | 4 | Pass |
| The sample is isolated and can be reset. | 8 | Pass |
| Get the desktop app | 4 | Pass |
| Works offline after download | 4 | Pass |
| Free to download | 3 | Pass |
| Choose each source | 3 | F-1-7 |
| Search selected folders and exports, then check every result against its original record. | 13 | Pass |
| 5 text formats | 3 | Pass |
| CSV result export | 3 | Pass |
| 1 source trail per result | 5 | F-1-3 |
| How it works | 4 | Pass |
| Search records you choose. | 4 | Pass |
| Local Data Finder builds an index from the folders and exports you select. | 13 | Pass |
| Each match includes its path and extraction time. | 9 | Covered by F-1-3 test gap |
| Choose the boundaries | 3 | Pass |
| Add only specific folders or explicit exports. | 7 | Pass |
| Hidden folders and unsupported files are skipped. | 7 | Pass |
| Build a local evidence map | 5 | F-1-9 |
| Text is extracted on-device from Markdown, plain text, HTML, mbox and text-based PDFs. | 14 | Pass |
| Mail attachments stay closed. | 4 | Pass |
| Search, inspect, open | 3 | Pass |
| Filter local text matches, read the surrounding evidence, then open the original local source. | 13 | Pass |
| Desktop walkthrough | 2 | Pass |
| See the local search flow. | 6 | Pass |
| See the desktop search flow with its bundled sample project. | 10 | Pass |
| 1. Choose a source | 4 | Pass |
| Add a folder or load the bundled sample project. | 10 | Pass |
| 2. Search the sample | 4 | Pass |
| The demo banner keeps sample records separate from your index. | 10 | Pass |
| 3. Inspect the source trail | 5 | Pass |
| Read the matching text, path, and extraction time before opening the original. | 12 | Pass |
| Privacy boundary | 2 | Pass |
| Keep archive search on your computer. | 6 | Pass |
| Local processing | 2 | Pass |
| Indexing and search run in the desktop app. | 8 | Pass |
| The app has no analytics SDK, user account, or corpus API. | 11 | F-1-10 |
| Visible source scope | 3 | Pass |
| See each indexed source, its record count, extraction time, and parser errors. | 12 | Pass |
| Removing a source does not delete the original. | 8 | Pass |
| Password encryption | 2 | Pass |
| Encrypt extracted text and paths at rest. | 7 | Pass |
| The password stays only for the current app session. | 9 | Pass |
| Prefer a terminal? | 3 | F-1-9 |
| Install in one verified step. | 5 | Pass |
| macOS / Linux | 2 | Pass |
| Windows PowerShell | 2 | Pass |
| Copy | 1 | F-1-9 |
| v0.1 builds are unsigned. | 5 | Pass |
| macOS may require right-click → Open; Windows may show a SmartScreen notice. | 12 | Pass |
| Checksums are published with every release. | 6 | Pass |
| Search selected local records with a source trail. | 8 | Pass |
| Built by Param Factory · v0.1.8 · build e98c7db · Hero imagery generated for this product with Azure AI Foundry. | 16 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Local Data Finder | 3 | Pass |
| Local Data Finder is a free private desktop search utility for professionals whose useful history is spread across folders and exports. | 21 | Pass |
| It indexes only sources the user explicitly chooses, searches the extracted text locally without a network connection, and attaches a local path and extraction timestamp to every result. | 28 | F-1-7, F-1-8 |
| It supports Markdown, plain text, HTML, mbox mail exports, and text-based PDFs. | 12 | Pass |
| It does not connect to cloud accounts, use an LLM, inspect mail attachments, or delete originals. | 16 | Pass |
| Search results can be exported as CSV. | 7 | Pass |
| Try the sample project | 4 | Pass |
| Open `/demo/` on the site, or choose Load sample project in the desktop app before adding your first source. | 19 | Pass |
| The sample contains a Markdown migration plan, HTML field notes, and an mbox message. | 14 | Pass |
| Search `MAPLE-742` to see the source trail. | 7 | Pass |
| Start for real discards the separate demo index and sample files before you choose your own sources. | 17 | Pass |
| Develop | 1 | Pass |
| Prerequisites are Node.js 22, Rust stable, and the Tauri 2 system dependencies for your OS. | 15 | Pass |
| On Ubuntu/Debian, the Tauri dependencies used in CI are: | 10 | Pass |
| Test and build | 3 | Pass |
| The declared product claims are in `.factory/claims.json`. | 8 | Pass |
| Run the exact command in each entry to check it. | 10 | Pass |
| Desktop release binaries are intentionally built only by `.github/workflows/release.yml`. | 11 | Pass |
| Push a `v*` tag (for example `v0.1.8`) to build unsigned `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` assets, plus `SHA256SUMS` and `latest.json`. | 21 | Pass |
| Install | 1 | Pass |
| The landing page detects the visitor's OS and resolves its button from the latest GitHub Release manifest. | 18 | F-1-4 |
| Both installers verify SHA256 before opening or placing an artifact. | 10 | Pass |
| v0.1 binaries are unsigned: on macOS use right-click → Open if Gatekeeper blocks first launch; Windows may show SmartScreen. | 18 | Pass |
| How local data is handled | 5 | Pass |
| The normal index is an atomic JSON file in the operating system's application-data directory. | 15 | F-1-5, F-1-10 |
| The demo uses a separate `demo-index.json` and `demo-sample` directory there, and is removed on exit. | 15 | F-1-2 |
| Encrypted mode stores a ChaCha20-Poly1305 envelope whose key is derived with Argon2; the password is session-only. | 16 | F-1-6, F-1-10 |
| PDF extraction runs in a separate process with a 25 MB input cap and 12-second timeout. | 16 | Pass |
| Original sources open through the OS and remain unchanged when removed from the index. | 14 | Pass |
| See privacy, terms, the visual thesis, and the handoff. | 9 | Pass |
| License | 1 | Pass |
| MIT — see LICENSE. | 4 | Pass |

Terminology is otherwise consistent: **source** is a user-chosen folder/file, **record** is an indexed unit, **result** is matching text, and **sample project** is the bundled demo data.

## Demo and privacy sandbox

**Pass, except F-1-2.** From fresh desktop and mobile contexts, `/demo/` immediately showed the realistic `MAPLE-742` mail result, persistent “Demo — sample data, nothing is saved with your archive” banner, **Reset demo**, and **Start for real**. A non-match hid the result, updated the live status, and stored only `demo:local-data-finder:query`; Reset restored `MAPLE-742`; Start for real cleared that key and returned home. Request recording through the browser demo flow observed only the product origin.

The Rust desktop isolation claim passed, proving separate artifacts and cleanup when Start for real is chosen. It does not prove the README's exit-cleanup statement.

## Claims and clean-clone checks

I cloned the repository fresh into `/tmp/local-data-finder-review-dW4AzH`, ran `npm ci`, installed the README's Ubuntu Tauri prerequisites, then invoked all 22 exact commands from `.factory/claims.json`. The harness exited `0`; all claim IDs reported `PASS`.

- Browser claims: demo sandbox, browser storage isolation, website request privacy, offline reload, and walkthrough passed in desktop and 390 px projects.
- Desktop/Rust claims: demo isolation, local-only processing, five formats, source selection/status, CSV, exact opening, OS opener, attachments, removal, encryption/session password, parser limits, and the 50-query benchmark passed.
- Copy/release claims: free download, published checksums, and unsigned-build disclosure passed.
- `npm test` passed (6 Vitest, 20 Rust); `npm run build` produced `dist/app` and `dist/site`; `npm run test:e2e` completed its 36 tests; `npm audit --audit-level=high` reported zero vulnerabilities.

The missing-claim findings above are manifest-inventory failures; they do not make an existing command fail.

## Structure, accessibility, and links

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` have the expected titles, one `h1`, `main`, descriptions, canonicals, OG/Twitter metadata, favicon/touch icon, header/footer, and no console errors. The designed unknown route returned HTTP 404.
- All internal landing links returned 200. The header/footer includes Privacy and Terms. A 390 px landing had `scrollWidth` 390.
- Axe found zero serious/critical violations across the five routes at desktop and 390 px. This does not catch F-1-1's route-focus failure.
- The dark archive/glass visual treatment, original landscape art, and evidence-strata layout match `.factory/design.md`; it is visibly product-specific rather than a generic SaaS template.

## History and missed leverage

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. I also checked the existing verification/handoff history. The previously reported demo hidden-result behavior, desktop banner state, keyboard double-open, mobile target sizing, metadata, walkthrough, and release/claims tests are present in current live code or the passing suite. The assertion that the published claims inventory is complete is not sustained because of F-1-2 through F-1-7.

The brief explicitly excludes cloud connectors, LLM chat, attachment interpretation, and automatic deletion. CSV export and local source selection are already present. No additional AI, sync, or import/export feature is an obvious, brief-implied omission.

## What would make this perfect

Remove or truthfully implement the exit-cleanup promise, prove every remaining public behavior through one manifest claim each, then make route navigation announce and focus the new page heading. Finish the small plain-language rewrites so the same privacy facts read clearly without implementation terminology. Re-run this entire review with zero findings.
