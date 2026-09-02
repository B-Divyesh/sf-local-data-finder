# Adversarial first-read review 2 — Local Data Finder

**URL checked:** `https://local-data-finder.sociobot.in/`
**Candidate checked:** `80ad8c9490cfce0326f3fd5c806af884a88fb6be`
**Date:** 2 September 2026 UTC
**Verdict:** **FAIL**

There are no blocking defects. Three minor findings remain. This work order requires zero findings for a PASS.

## First 30 seconds

Fresh Chromium contexts at 390×844 and 1440×900 gave the same answers before scrolling:

- **What it does:** “Find facts in your local archive.” It searches selected folders and exports and points back to source records.
- **Who it is for:** “For professionals with years of notes and exports”.
- **What to click first:** **Try it with sample data / Open the sample project**.

The phone first screen contains the headline, audience sentence, one sample action, a desktop-download action, and the three facts: offline after download, free to download, and choose sources yourself. It is understandable without prior context. No console or page errors occurred. The landing makes a documented request to `https://api.github.com` to resolve the release asset.

## Findings

### F-2-1 — MINOR — the footer’s external GitHub link is not identified as external

**Location:** every public footer, link text **“Source”**, which opens `https://github.com/B-Divyesh/sf-local-data-finder`.

The site-structure requirement says external links must say so. A keyboard or screen-reader visitor is not told that activating this link leaves the product site.

**Concrete fix:** rename it to **“Source on GitHub (opens in a new site)”** or add visually hidden text such as **“(opens GitHub)”** to its accessible name. Keep the link destination unchanged.

### F-2-2 — MINOR — the public footer makes an unlisted, jargon-heavy asset-provenance claim

**Location:** landing footer: **“Hero imagery generated for this product with Azure AI Foundry.”**

This is a claim-like sentence with no entry or observable test in `.factory/claims.json`. “Azure AI Foundry” does not help a person decide whether the local-search product is useful, and it introduces unexplained AI wording into a product whose brief explicitly excludes LLM features.

**Concrete fix:** remove this sentence from the visitor-facing footer and retain the required asset provenance in `.factory/design.md`. If it must remain public, add a specifically scoped provenance record and verification evidence to `claims.json`.

### F-2-3 — MINOR — the install heading does not name the section or explain “verified”

**Location:** landing install section heading: **“Install in one verified step.”**

The phrase is a vague promise rather than a section name. A cold visitor cannot tell whether it describes a download, checksum verification, or an installation command until reading the surrounding code blocks.

**Concrete fix:** change the heading to **“Install with a verified command”** and add a short sentence: **“Each installer checks its SHA256 before it opens the app.”** The latter maps to the existing `published-checksums` claim.

## Copy audit

Word counts treat visible labels, headings, actions, captions, facts, and disclosure as copy. Commands, file paths, and product-name-only navigation labels are not sentences. No audited sentence exceeds 22 words. The landing’s only copy flags are F-2-2 and F-2-3 above.

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
| Choose sources yourself | 4 | Pass |
| Search selected folders and exports, then check every result against its original record. | 13 | Pass |
| 5 text formats | 3 | Pass |
| CSV result export | 3 | Pass |
| 1 source trail per result | 5 | Pass |
| How it works | 4 | Pass |
| Search records you choose. | 4 | Pass |
| Local Data Finder builds an index from the folders and exports you select. | 13 | Pass |
| Each match includes its path and extraction time. | 9 | Pass |
| Choose the boundaries | 3 | Pass |
| Add only specific folders or explicit exports. | 7 | Pass |
| Hidden folders and unsupported files are skipped. | 7 | Pass |
| Extract text from selected sources | 5 | Pass |
| Text is extracted on your computer from Markdown, plain text, HTML, mbox and text-based PDFs. | 16 | Pass |
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
| No tracking, account, or service receives your archive. | 9 | Pass |
| Visible source scope | 3 | Pass |
| See each indexed source, its record count, extraction time, and parser errors. | 12 | Pass |
| Removing a source does not delete the original. | 8 | Pass |
| Password encryption | 2 | Pass |
| Encrypt extracted text and paths at rest. | 7 | Pass |
| The password stays only for the current app session. | 9 | Pass |
| Install from a terminal | 4 | Pass |
| Install in one verified step. | 5 | F-2-3 |
| Copy macOS/Linux command | 3 | Pass |
| Copy Windows command | 3 | Pass |
| v0.1 builds are unsigned. | 5 | Pass |
| macOS may require right-click → Open; Windows may show a SmartScreen notice. | 12 | Pass |
| Checksums are published with every release. | 6 | Pass |
| Search selected local records with a source trail. | 8 | Pass |
| Hero imagery generated for this product with Azure AI Foundry. | 10 | F-2-2 |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Local Data Finder | 3 | Pass |
| Local Data Finder is a free private desktop search utility for professionals whose useful history is spread across folders and exports. | 21 | Pass |
| It indexes only sources you choose. | 6 | Pass |
| Search stays on your computer. | 5 | Pass |
| Each result names its local path and extraction time. | 9 | Pass |
| It supports Markdown, plain text, HTML, mbox mail exports, and text-based PDFs. | 12 | Pass |
| It does not connect to cloud accounts, use an LLM, inspect mail attachments, or delete originals. | 16 | Pass |
| Search results can be exported as CSV. | 7 | Pass |
| Try the sample project | 4 | Pass |
| Open `/?demo=1` on the site, or choose Load sample project in the desktop app before adding your first source. | 18 | Pass |
| The sample contains a Markdown migration plan, HTML field notes, and an mbox message. | 14 | Pass |
| Search `MAPLE-742` to see the source trail. | 7 | Pass |
| Start for real removes the separate demo index and sample files before you choose your own sources. | 17 | Pass |
| Develop | 1 | Pass |
| Prerequisites are Node.js 22, Rust stable, and the Tauri 2 system dependencies for your OS. | 15 | Pass |
| On Ubuntu/Debian, the Tauri dependencies used in CI are: | 10 | Pass |
| Test and build | 3 | Pass |
| The declared product claims are in `.factory/claims.json`. | 8 | Pass |
| Run the exact command in each entry to check it. | 10 | Pass |
| Desktop release binaries are intentionally built only by `.github/workflows/release.yml`. | 11 | Pass |
| Push a `v*` tag to build unsigned platform assets, checksums, and a release manifest. | 14 | Pass |
| The workflow stages and validates every asset before publishing a GitHub-locked immutable release. | 13 | Pass |
| The manifest records the source commit and uses versioned asset URLs. | 11 | Pass |
| Install | 1 | Pass |
| The landing page detects the visitor's OS and resolves its button from the latest GitHub Release manifest. | 18 | Pass |
| Both installers verify SHA256 before opening or placing an artifact. | 10 | Pass |
| v0.1 binaries are unsigned: on macOS use right-click → Open if Gatekeeper blocks first launch; Windows may show SmartScreen. | 18 | Pass |
| How local data is handled | 5 | Pass |
| Your normal index stays in your operating system's app-data folder. | 11 | Pass |
| It safely replaces its index file when it changes. | 9 | Pass |
| The demo uses separate sample files and index data there. | 10 | Pass |
| Start for real removes both. | 5 | Pass |
| Encrypted mode protects extracted text and paths. | 7 | Pass |
| Your password lasts only for the current app session. | 9 | Pass |
| PDF extraction runs in a separate process with a 25 MB input cap and 12-second limit. | 16 | Pass |
| Original sources open through your operating system. | 7 | Pass |
| Removing a source never changes the original. | 8 | Pass |
| See privacy, terms, the visual thesis, and the handoff. | 9 | Pass |
| License | 1 | Pass |
| MIT — see LICENSE. | 4 | Pass |

Terminology remains consistent: **source** is a selected folder or file, **record** is an indexed item, **result** is matching text, and **source trail** connects a result to its record.

## Demo and sandbox

**Pass.** From a fresh 390 px context, one click on the landing action opened `/demo/?demo=1`. The first screen already showed the realistic `MAPLE-742` result, query input, source trail, and persistent banner: **“Demo — sample data, nothing is saved with your archive.”** It included **Reset demo** and **Start for real**.

Entering `not in sample` hid the result and stored only `demo:local-data-finder:query`. Reset restored `MAPLE-742`; Start for real returned to `/` and removed that key. No normal-storage key was present. During the demo search, requests were same-origin. The final return to the landing page additionally requested GitHub’s public release metadata; it did not occur while searching the demo. The dedicated offline claim also passed in its own fresh browser context.

The desktop sample-isolation claim passed: it preserves the normal index, uses the separate demo artifacts, and discards them when Start for real is chosen.

## Claims and clean-clone tests

**Pass: 27 of 27 exact `.factory/claims.json` commands.** A fresh shallow clone of `main` at `80ad8c9` was created under `/tmp/local-data-finder-review-2-wc4hc4`, then `npm ci` completed with zero reported vulnerabilities. The initial Rust command could not compile because the disposable image lacked `glib-2.0`; after installing the README’s documented Tauri packages, every listed command passed individually:

- 5 browser demo/privacy/offline/walkthrough selections passed.
- 4 Vitest release/copy selections passed.
- 18 Rust desktop, parsing, storage, encryption, export, and retrieval selections passed.

`npm test` passed (7 Vitest and 24 Rust tests). `npm run build` passed and produced `dist/app` and `dist/site`. The full Playwright run passed all 42 desktop/mobile tests. The independently run exact claim selections and live Axe checks below also passed.

The manual cross-check found every user-relevant behavior statement mapped to a declared claim except the asset-provenance footer sentence in F-2-2. The “one verified step” wording in F-2-3 is also insufficiently specific, although the checksum behavior itself is covered by `published-checksums`.

## Earlier findings and regressions

All ten findings in `review-1.md` and `polish-1.md` were read and rechecked live and in current code:

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 route focus/announcement | Header navigation focused the new `h1`, announced the route title, and Browser Back restored the landing `h1`. |
| F-1-2 false exit-cleanup copy | README and demo copy now promise cleanup only on **Start for real**, matching the isolation claim and code. |
| F-1-3 source trail claim | `source-trail-per-result` exists and its exact Rust command passes. |
| F-1-4 platform selection claim | `platform-download-selection` exists and its exact Vitest command passes. |
| F-1-5 normal-index storage claim | `normal-index-storage` exists and its exact Rust command passes. |
| F-1-6 encryption implementation claim | `encryption-algorithm` exists and the reader README no longer exposes the earlier cipher/KDF jargon. |
| F-1-7 selected-source scope | `selected-sources-only` exists and its exact Rust command passes. |
| F-1-8 long README sentence | The opening is now four short sentences. |
| F-1-9 metaphor/generic action labels | The evidence-map, terminal-prompt, and generic Copy labels were replaced with direct labels. |
| F-1-10 unexplained privacy jargon | Live landing/README privacy wording now describes user outcomes. |

None of the earlier IDs is regressed or half-fixed.

## Structure, accessibility, links, and identity

The landing, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` each have a route-appropriate title, one h1, meta description, canonical, Open Graph/Twitter image, favicon, Apple touch icon, header, footer, and main landmark. A missing path returned the designed 404 with HTTP 404. All internal and external destinations crawled in this review returned successfully, including the release redirect and GitHub source repository.

At both 1440 px and 390 px, every checked route had no horizontal overflow. Ten live Axe scans (five routes × two sizes) had zero serious or critical violations. The skip link focused `main`; normal navigation and Back focused/announced the destination heading. Security headers include a CSP delivered by response header with `frame-ancestors 'none'`. The original luminous archive artwork, evidence-strata presentation, and mobile-first hierarchy match `.factory/design.md` and are product-specific rather than a generic SaaS template.

F-2-1 is the only structural-link issue found.

## Missed leverage

No finding. The brief explicitly excludes LLM chat and cloud connectors. The core helpful additions a visitor would expect — a one-click sample, CSV export, source selection, source trails, and safe removal — are present and tested. A runtime AI feature would conflict with the stated product scope.

## What would make this perfect

Identify the GitHub link as external, remove the public Azure AI provenance sentence (or make it provable), and replace the vague install heading with the concrete checksum explanation. Then rerun this complete review; with no remaining finding, it can pass.
