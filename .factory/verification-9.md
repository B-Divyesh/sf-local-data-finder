# Independent verification 9 — FAIL

Candidate `17178e68cfae38e4bf05e375d2b1a920338027f1` at `https://local-data-finder.sociobot.in/` was independently tested on 2 September 2026 UTC. The product works end to end and all 27 declared claim commands pass, but the candidate **FAILS** the complete acceptance contract because installer metadata is not cached as required. Three lower-severity quality findings also remain.

No product code was modified during this verification.

## Release-blocking findings

### V9-1 — Medium — GitHub release metadata is not cached for one hour

The installable-software contract requires the landing page to read GitHub's CORS-enabled release API and cache the response in `localStorage` for one hour. `site/site.ts` always calls `fetch("https://api.github.com/repos/B-Divyesh/sf-local-data-finder/releases/latest", { cache: "no-store" })` and implements no local cache.

Fresh live evidence from one browser context:

- First landing load: one GitHub API request; `localStorage` remained empty.
- Immediate reload: a second GitHub API request; `localStorage` remained empty.
- Observed result: `githubRequestCount: 2`, `firstLoadStorage: {}`, `secondLoadStorage: {}`.

The calm Releases fallback works, so downloads remain reachable when the API fails. The missing cache still violates the explicit installer acceptance requirement and adds avoidable third-party requests, rate-limit exposure, and latency.

Required repair: cache the successful release response and timestamp in a product-namespaced key, reuse it for at most one hour, keep the current fallback, and add a test proving an immediate reload makes no second API request.

### V9-2 — Low — one claim ID tags two test definitions

The claims contract requires exactly one tagged test for every claim ID. `@claim:demo-sandbox` appears on both `tests/site.spec.ts:82` and `tests/site.spec.ts:98`; all other 26 IDs appear once. Its declared command therefore selects four cases across the two browser projects instead of one tagged test definition.

Both definitions pass and the behavior is proven. Required repair: keep the claim tag on the complete demo behavior test and make the direct `?demo=1` entry check an untagged regression, or combine both checks into one tagged test.

### V9-3 — Low — generated hero imagery has no visitor-facing disclosure

`.factory/design.md` records that the archive-landscape hero was generated with the factory image model. The image-generation contract requires generated imagery to be disclosed on an About page or in the footer. The live site has no About route, and none of the five public page footers disclose that the hero is generated.

Required repair: add a short, plain disclosure in the footer or an About page. If the statement is presented as a public provenance claim, register one corresponding claim test.

### V9-4 — Low — the 44 px touch-target assertion is flaky at a subpixel boundary

The first full `npm run test:e2e` run failed 1 of 44 cases. Chromium reported a target width of `43.99998474121094` against the strict `>= 44` assertion. The stylesheet sets the control to exactly `44px`.

Five focused repeats passed, and a second complete run passed 44/44. Live 390 px demo controls measured exactly 44 px high. This is not a practical undersized-control failure, but it makes the mandatory quality gate nondeterministic.

Required repair: give minimum targets a small layout margin above the threshold, such as 45–46 px, or make the test tolerate browser floating-point noise while still failing a meaningful undersize.

## First-read and one-click demo gate

**Pass.** A cold 1440×900 load returned HTTP 200 with no console or page error. Its first screen answers all three required questions:

- What it does: **“Find facts in your local archive.”**
- Who it serves: professionals with years of notes and exports.
- What to do first: **“Try it with sample data / Open the sample project.”**

The action opens `/demo/?demo=1` in one click. The demo immediately shows a realistic source-grounded result and a persistent **“Demo — sample data, nothing is saved with your archive”** banner with **Reset demo** and **Start for real**.

## Claims — observable behavior passes 27/27

`.factory/claims.json` exists. The first literal Playwright invocation on the untouched checkout could not resolve its not-yet-installed package. After the required `npm ci` setup and the README-documented Tauri Linux prerequisites, every exact command in the manifest passed.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | Pass | 4/4 selected Playwright cases across desktop/mobile; duplicate tag is V9-2. |
| `demo-browser-storage` | Pass | 2/2; only the demo query key is used and Start for real clears it. |
| `desktop-demo-isolation` | Pass | Exact Cargo test; normal index preserved and demo artifacts removed. |
| `website-privacy` | Pass | 2/2; demo search requests are same-origin. |
| `offline-reload` | Pass | 2/2 in dedicated browser contexts. |
| `desktop-local-processing` | Pass | Exact Cargo test; no network client, LLM, or archive endpoint. |
| `free-download` | Pass | Exact Vitest selection. |
| `five-formats` | Pass | Markdown, text, HTML, mbox, and text PDF parsed and searched. |
| `source-selection` | Pass | Hidden and unsupported files skipped. |
| `selected-sources-only` | Pass | Sibling content excluded. |
| `source-scope-feedback` | Pass | Counts, extraction time, and parser error reported. |
| `csv-export` | Pass | Header, quoting, row count, and public output path verified. |
| `exact-source-open` | Pass | Result record path used instead of source root. |
| `source-trail-per-result` | Pass | Path and extraction time preserved per result and export row. |
| `open-source-os` | Pass | Native Tauri opener used. |
| `attachments-closed` | Pass | Attachment payload excluded from indexed mail text. |
| `source-removal` | Pass | Index records removed; original file unchanged. |
| `encrypted-index` | Pass | Plaintext hidden and wrong password rejected. |
| `encryption-algorithm` | Pass | Argon2 plus ChaCha20-Poly1305 envelope verified. |
| `session-password` | Pass | Fresh app state restores locked without a password. |
| `parser-limits` | Pass | 25 MB rejection and 12-second worker limit verified. |
| `normal-index-storage` | Pass | Interrupted replacement preserves the previous index. |
| `retrieval-benchmark` | Pass | At least 40 of 50 source records found as first results. |
| `published-checksums` | Pass | Exact Vitest selection. |
| `platform-download-selection` | Pass | macOS ARM/Intel, Windows, and Linux selection verified. |
| `unsigned-builds` | Pass | Exact Vitest selection. |
| `desktop-walkthrough` | Pass | Three visible, captioned frames on desktop and mobile. |

A manual landing, app, README, privacy, and terms cross-check found the substantive product promises covered by the manifest. V9-2 concerns the required one-to-one test registration, not missing observable coverage.

## Clean local gates and production build

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 104 packages, zero vulnerabilities. |
| `npm test` | Pass; 7 Vitest and 24 Rust tests. |
| `npm run lint` | Pass. |
| `npm run check` | Pass. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | Pass. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities. |
| `npm run build` | Pass; created `dist/app` and `dist/site`. |
| `npm run test:e2e` | Flaky: first run 43/44 because of V9-4; focused repeat 5/5 and second full run 44/44. |

Production output is within budget: app JS 18,476 bytes raw/6.55 kB gzip; site JS 5,157 bytes raw total; site CSS 13,031 bytes raw/3.51 kB gzip; mobile hero 21,978 bytes; no font download.

## End-to-end desktop behavior

The public Linux AppImage was freshly downloaded, checksummed, and launched under Xvfb with isolated XDG data directories.

- File size: 83,057,144 bytes.
- SHA256: `de69b4dfd0efe229c89143ba289229fe7969f3601988bdc53e02aae9c585d03a`, matching GitHub's digest, `SHA256SUMS`, and `latest.json`.
- **Load sample project** created `demo-index.json` plus five realistic sample files: Markdown, HTML, text, mbox, and PDF.
- Searching `MAPLE-742` returned three matches. Visible records included the Markdown plan and PDF evidence, with exact local paths and extraction timestamps.
- **Start for real** removed both `demo-index.json` and the `demo-sample` directory.

The Rust suite independently covered source boundaries, all five formats, malformed/oversized input, the PDF timeout and large-output boundary, attachment exclusion, removal without deletion, CSV export, encryption and wrong-password recovery, atomic replacement, and the 50-query benchmark.

The live browser demo handled normal `Northwind` input, a non-match, whitespace, Unicode, markup-like text, and a 10,000-character query without script execution or errors. Reset restored `MAPLE-742`; Start for real cleared the only demo key.

## Live deployment, privacy, accessibility, and PWA

- The live footer reports `v0.1.10 · build 17178e6`. All 23 served production files match the fresh candidate `dist/site` output byte-for-byte.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return 200; an unknown path returns the designed page with HTTP 404.
- At 1440×900 and 390×844, all five pages have `lang="en"`, one H1, a main landmark, complete alt attributes, no horizontal overflow, no console/page errors, and zero serious/critical Axe findings.
- The desktop app has zero serious/critical Axe findings in both explicit dark and light themes.
- Keyboard-only skip activation shows a 3 px mint outline and transfers focus to `main#main`. At 200% root text size, the 390 px landing retains its heading and has no horizontal overflow.
- Reduced-motion mode has no running animation. The mobile demo's measured controls are at least 44 px.
- A fresh demo search made four requests, all to `https://local-data-finder.sociobot.in`. There are no analytics, trackers, ads, third-party fonts, archive uploads, or runtime AI calls. The landing's only external request is GitHub release metadata; V9-1 describes its missing cache.
- Security headers include HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, disabled camera/microphone/geolocation, and a matching CSP with `frame-ancestors 'none'` in the response header.
- HTML and `sw.js` use `max-age=30, must-revalidate`; hashed assets use one-year immutable caching; ETag revalidation returned 304.
- Service-worker update activated `/sw.js`, created cache `local-data-finder-site-v5`, and reloaded `/demo/` offline.
- Every navigable public link returned 200 after redirects.
- `/opt/fleet/lib/verify-url.sh` passed in 1,136 ms with correct title/lang/H1/main/alt checks and zero errors.
- Fresh mobile Lighthouse scored **99 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; LCP 1.148 s, TBT 102 ms, CLS 0, speed index 1.349 s.

## Release and candidate identity

GitHub release `v0.1.10` is public, non-prerelease, and immutable. It has exactly eight assets: two macOS DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and `latest.json`. The manifest records source commit `abcf708468919672817484ccf9ea1666e44845fe` and immutable versioned URLs.

The candidate changes site copy/style, tests, and QA documentation after the release tag but makes no change to desktop runtime files (`src/main.ts`, `src/styles.css`, `src/search.ts`, `src/types.ts`, `src/index.html`, `src-tauri/**`, `public/**`, dependency manifests, or app Vite config). The launched released desktop runtime is therefore source-identical to the candidate's desktop product. The live static site exactly matches the candidate build.

## Applicability and scope notes

- There is no product backend, product-unlock endpoint, account, or sign-in flow. API allowance/429/`Retry-After` and Microsoft Entra External ID checks are not applicable. GitHub is a public release-metadata dependency, not a product server endpoint.
- The brief explicitly excludes LLM chat. The absence of runtime AI is appropriate; no missed AI leverage finding applies.
- v0.1 is deliberately free because no registered Sociobot billing product is available. The honest scope decision is documented in `.factory/monetization.md`; no unavailable checkout is exposed.
- macOS and Windows packages are intentionally unsigned and the public site explains their first-launch warnings.

## Verdict

**FAIL.** Core retrieval, privacy, accessibility, performance, offline behavior, release integrity, and all declared claim outcomes pass. Acceptance remains blocked by V9-1. V9-2 through V9-4 should be repaired in the same follow-up so the next clean run is contract-complete and deterministic.
