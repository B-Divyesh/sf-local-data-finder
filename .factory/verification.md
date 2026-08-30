# Independent product verification — FAIL

**Candidate:** `8590235727c9ea7887782105fcd1cb1c6d466c51`

**Live URL:** `https://local-data-finder.sociobot.in`

**Verified:** 30 August 2026 (UTC)

**Verdict:** **FAIL**

The deployed site and downloadable app are available, and the implemented local-search path works on a small representative archive. The candidate nevertheless fails mandatory factory gates: there is no claims manifest, no one-click sample-data demo, and the advertised paid checkout returns 404. Additional source-trail and claim defects affect the core job.

## Release-blocking findings

### Critical — required claims contract is absent

- `.factory/claims.json` does not exist in the clean candidate checkout.
- Therefore there were no declared claim-test commands to run through the demo entry point. Under the work order, a missing file is itself release-blocking.
- Claim-like statements remain throughout the landing page, desktop UI, privacy page, and README, including “No telemetry,” “Sources stay local,” five-format support, attachment handling, source removal safety, encryption, and unlimited paid sources. None is registered in the required manifest.

### Critical — no one-click sample-data demo

- Cold first read: the page presents “Your archive. One honest search.” to people with years of notes and exports, and the first action is “Download for Linux.”
- The first screen does not use a plain job headline, does not clearly name the professional audience, and offers no “Try it with sample data” action.
- `GET /demo` returns 404. `/?demo=1` renders the ordinary landing page. The desktop first-run screen only offers a native folder picker; no “Load sample project” exists.
- There is no `.factory/demo.md`, no isolated demo namespace/banner/reset path, and no bundled sample project or 3–5 frame walkthrough.

### Critical — advertised purchase flow is unavailable

- The live “Buy an Archive key” link targets `https://api.sociobot.in/api/v1/products/local-data-finder/checkout`.
- A fresh GET returned HTTP 404 with `{"error":"enabled factory product","status":404}`. A visitor cannot buy the advertised US$39 unlock.

### High — “Open source” opens the source root, not the result file

- Each result displays an exact file/message path, but `openResult()` invokes `open_source` with `result.source_path` instead of `result.path`.
- For a folder source, the action opens the selected root folder rather than the matched Markdown/HTML/mbox file. This breaks the brief's core source-trail job.

### High — UI promises an export that does not exist

- Desktop Settings states: “Search, source opening, export, and accessibility stay free.”
- There is no export control, export backend command, or export implementation in the candidate.

## Other findings

### Major

- Skipped-file failures are reduced to “2 files skipped.” The stored per-file reason and remedy are never rendered, contrary to the required recoverable parser-error state.
- HTML extraction indexes `<script>` contents as searchable prose. In the packaged-app test, the result snippet included `throw new Error('must not execute')`; scripts were not executed, but non-visible script content polluted retrieval.
- The live response has no `Content-Security-Policy` and no framing restriction. The repository's static host configuration also omits both.
- Lighthouse recorded a first-load console error because `/favicon.ico` returns 404. This violates the no-console-errors quality gate, even though the repository's narrower Playwright listener and `verify-url.sh` run did not surface it.
- The required `robots.txt`, `sitemap.xml`, designed 404 page, canonical links, Open Graph/Twitter metadata, favicon, and apple-touch icon are missing. Legal pages also lack descriptions.
- Multiple interactive targets are below 44 CSS px: site navigation/footer links are 16–38 px high and desktop record-type filters are 38 px high.

### Minor

- The landing service worker activates and offline reload succeeds after one online visit, but the offline page still attempts the GitHub release API request and logs `net::ERR_INTERNET_DISCONNECTED`.
- The required `.factory/copy-audit.md` is missing. Landing copy includes a 35-word paragraph and metaphor-led headings that do not meet the supplied plain-words rules.

## First-read result

- **What it does:** The supporting sentence explains that it searches notes, mail exports, Markdown, HTML, and PDFs locally.
- **For whom:** The page implies a person with years of scattered records, but does not plainly name professionals on the first screen.
- **What to click first:** The only primary action is a platform download.
- **Required sample action:** Missing.

Result: **FAIL**.

## Clean-clone and repository evidence

The checkout began clean on `main` at the exact candidate SHA.

| Check | Result | Evidence |
| --- | --- | --- |
| Claims tests | **FAIL** | `.factory/claims.json` missing; zero declared tests available |
| `npm ci` | Pass | 104 packages installed; audit reported 0 vulnerabilities |
| `npm test` | Pass | 4/4 Vitest and 4/4 Rust tests |
| `npm run check` | Pass | TypeScript and Cargo checks |
| `npm run build` | Pass | exact app and site production builds produced `dist/app` and `dist/site` |
| `npm run test:e2e` | Pass | 6/6 repository site tests across desktop Chromium and 390 px |
| `npm audit` | Pass | 0 production/development vulnerabilities |
| Lint | Not available | no lint script is defined |

The repository Playwright suite covers the marketing page and license-return storage. It does not exercise indexing/search, the released desktop package, a sample-data demo, claim tags, offline behavior, parser recovery, or the purchase endpoint.

## Packaged desktop-app exercise

- Downloaded the v0.1.4 Linux AppImage and verified SHA-256 `95180cdf10530f98a87692256d5485914c3cd8762ca1b6afba365c3b4bc92dba` against both `latest.json` and `SHA256SUMS`.
- Ran the published AppImage from an isolated `XDG_DATA_HOME` under Xvfb.
- Indexed a fresh folder containing realistic Markdown, HTML, and two-message mbox content, plus empty, unsupported CSV, and 26,214,401-byte text boundary fixtures.
- Observed 4 indexed records, 1 source, and two correctly detected skips: empty text and the greater-than-25-MB file. The CSV was ignored.
- Searching `MAPLE-742` returned the expected HTML and mbox records with paths and extraction times. Searching unsupported CSV content returned zero matches and a usable recovery message.
- The packaged PDF worker extracted `Dummy PDF file` from a valid reference PDF. A Markdown file passed as PDF failed safely with exit 2 and `invalid file header`.
- Removing the source changed the index to 0 sources/0 documents while all original fixtures remained present.
- The desktop app rendered at 1240×820 and 390×844. Candidate-browser checks found no horizontal document overflow and no axe violations in dark or light themes. Keyboard Tab order reached the skip link, Settings, refresh, add controls, search, and every filter with visible focus treatment. Search itself uses a visible focus-within treatment.

## Live deployment, privacy, and headers

- Fresh desktop and 390 px loads returned 200, one `<h1>`, `lang="en"`, `<main>`, meaningful image alt text, no page exceptions, no horizontal overflow, and zero axe serious/critical findings on `/`, `/privacy/`, and `/terms/`.
- `/opt/fleet/lib/verify-url.sh` passed: 959 ms load, title/lang/main present, no missing image alt, and no unlabeled buttons.
- The landing request log contained only the site document, its same-origin JS/CSS/image, and the expected public GitHub Releases API request. No analytics, font CDN, or archive-content request was observed.
- Response headers include HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation restrictions. CSP and frame protection are absent.
- HTML uses `max-age=30, must-revalidate`; hashed JS/CSS/images use `max-age=31536000, immutable`.
- The service worker activated, `registration.update()` completed, and offline reload returned the cached page. The external release lookup produced the offline console error noted above.
- Billing verification returned HTTP 200 with `{valid:false, reason:"invalid"}` for an invalid token. One client received 30 successful responses; request 31 returned HTTP 429 with `Retry-After: 4`.

## Performance and bundle evidence

Fresh Lighthouse mobile results on the live URL:

| Category/metric | Result |
| --- | --- |
| Performance | 99 |
| Accessibility | 100 |
| Best practices | 96 |
| SEO | 100 |
| FCP / LCP | 1.0 s / 1.1 s |
| Total blocking time | 100 ms |
| CLS | 0 |
| Total transferred | 35 KiB |

Production build sizes are well inside the supplied budgets: site JS 3.19 KB raw, site CSS 10.57 KB raw, desktop UI JS 17.47 KB raw, desktop UI CSS 13.27 KB raw, mobile hero 21.98 KB, desktop hero 50.53 KB, and no downloaded fonts.

## Deployment identity and release

- Live `index.html`, privacy HTML, terms HTML, hashed JS, and hashed CSS are byte-for-byte identical to the fresh candidate build.
- Candidate `8590235` differs from release tag commit `ff30080` only in `.factory/handoff.md`; product/runtime files are identical.
- GitHub Actions run `33161635822` completed successfully for `v0.1.4`, with six platform installers plus `latest.json` and `SHA256SUMS` published.
- Running the live `install.sh` with an isolated HOME downloaded, checksum-verified, and installed the same Linux AppImage successfully.

## Acceptance decision

**FAIL.** Fix the claims/demo gates and broken checkout first. Before reconsideration, also make result opening target the actual record, remove or implement the export claim, expose parser failures with remedies, prevent script/style text from entering HTML results, and close the required security/metadata/accessibility gaps.
