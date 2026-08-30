# Independent product verification 2 — FAIL

**Candidate:** `0fc66f02ac7605f4a968accb94e5747d9d3b0565`

**Live URL:** `https://local-data-finder.sociobot.in`

**Verified:** 30 August 2026 (UTC)

**Verdict:** **FAIL**

The cold landing page, static deployment, small-archive search flow, encryption, CSV export, offline site shell, release assets, and repository quality gates work. The candidate is not releasable because its claims tests do not prove the claims they declare, many public claims are absent from the claims manifest, the default desktop light treatment fails contrast, real mode is falsely labelled as demo mode, text-rich PDFs fail to index, and the mobile source drawer is not keyboard or screen-reader safe.

## Release-blocking findings

### Critical — the claims contract does not cover or prove the published claims

All five commands in `.factory/claims.json` pass after documented installation, but the contract itself does not meet the supplied claims specification:

- `@claim:five-formats` only asserts that the landing page displays the format sentence. It does not ingest and search Markdown, text, HTML, mbox, and PDF fixtures. The independent package test also proves that the PDF part is false for a valid text-rich PDF.
- The CSV test serializes one constructed result in Rust. It does not exercise the public export command or verify a downloaded file through the demo entry point.
- The two Rust claim tests are selected by ordinary function names and contain no required `@claim:<id>` tag.
- Public claim-like statements are missing from the manifest, including no cloud/LLM connection, unopened mail attachments, no analytics/account/corpus API, read-only originals, safe source removal, encrypted local storage/session-only password, parser size/timeout limits, and verified installer checksums.

The acceptance contract says an unlisted claim or a test that checks only copy rather than the promised result fails review.

### High — valid text-rich PDFs time out because parser output is not drained

- A generated valid 511 KB text PDF is below the documented 25 MB input cap.
- The packaged parser worker extracted 318,930 bytes of JSON in 0.23 seconds when invoked directly.
- Adding the folder through the published Linux AppImage took 12 seconds, indexed 0 records, and persisted: `large-text.pdf: PDF parser exceeded the 12 second safety limit`.
- In `extract_pdf_isolated`, stdout and stderr are piped, but the parent polls `try_wait()` and waits to read the pipes until after child exit. Once stdout fills the pipe, the child cannot exit and the parent kills it at 12 seconds.

This breaks one of the brief's required formats on an ordinary boundary case.

### High — default “System” theme has unreadable desktop chrome on light OS settings

The light variables apply to `data-theme="system"`, but light top-bar and source-rail backgrounds only apply to `data-theme="light"`. A fresh packaged launch under a light system therefore places dark text on the retained dark translucent backgrounds.

Measured composite contrast in the package:

| Area | Foreground | Approximate ratio |
| --- | --- | ---: |
| Top bar | primary text | 2.36:1 |
| Top bar | muted text | 1.21:1 |
| Source rail | primary text | 2.71:1 |
| Source rail | muted/accent text | 1.05:1 |

These are below the required 4.5:1. Source names, parser recovery details, privacy status, and navigation become difficult to read.

### High — real data mode is visibly and falsely labelled as demo mode

`.demo-banner` declares `display:flex`, which overrides the element's HTML `hidden` state. On a fresh isolated launch with `status.demo === false`, and again after selecting **Start for real**, the app still displays “Demo — sample data, nothing is saved with your archive” plus **Reset demo** and **Start for real**.

This is a privacy/state communication defect: a user can work with their real index while the app says they are in an isolated sample sandbox. It also pushes the genuine first-run action below the initial viewport.

### High — the 390 px source drawer is not keyboard or screen-reader safe

At mobile width the source rail is only translated off-screen. It is not `hidden`/`inert`, so its controls remain in the tab and accessibility order while closed. Opening it does not move focus, set `aria-expanded`, constrain focus, provide a modal state, or support Escape; closing it does not restore focus. This fails the supplied dialog/drawer focus-management and keyboard requirements.

## Other findings

### Medium

- On Apple Silicon, normal browser user-agent/platform values commonly identify as `MacIntel`; the site's detector only chooses arm64 when the string includes `arm` or `aarch64`. Those users are offered the x64 DMG and may require Rosetta despite an arm64 release being present.
- The Settings button always says **Enable encryption**. After encryption is enabled and the index is unlocked, activating that same button disables encryption despite the unchanged label.
- The web demo's “Open source” text is not an operable source action, and the static one-record demo cannot demonstrate ingestion or source opening. This contributes to the claims-test weakness.
- The required 50-query personal-archive benchmark showing at least 80% source-record retrieval is not present.

### Minor

- Several live-site controls miss the 44×44 CSS-pixel target: the skip link is 43 px high, the Demo navigation link is 42 px wide, and the Terms footer link is 41 px wide.
- The landing page does not contain the required three-to-five captioned desktop screenshot walkthrough.

## First-read test

**PASS.** A fresh live 1440×900 and 390×844 visit answers all three questions above the fold:

- What: “Find facts in your local archive.”
- For whom: professionals with years of notes and exports.
- First action: **Try it with sample data**, with “Open the sample project” beside it.

One click opens `/demo/` with realistic sample content. The 390 px action occupies approximately y=540–614 within the 844 px viewport.

## Claims run first from the clean checkout

Before broader QA, every exact command from `.factory/claims.json` was invoked. The first invocation, before dependency installation, correctly exposed missing npm packages and Linux WebKit/GLib development libraries. After `npm ci` and the documented Linux packages were installed, every exact command passed:

| Claim | Exact test result |
| --- | --- |
| `demo-sandbox` | Pass, 2 Playwright projects |
| `local-first-site` | Pass, 2 Playwright projects |
| `five-formats` | Pass, 2 Playwright projects, but only asserts copy |
| `csv-export` | Pass, 1 Rust test, but does not exercise public export |
| `exact-source-open` | Pass, 1 Rust test |

The passing commands do not cure the contract defects described above.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| `npm ci` | Pass |
| `npm run lint` | Pass (`tsc --noEmit`) |
| `npm run check` | Pass (TypeScript and Cargo) |
| `npm test` | Pass: 2 Vitest, 6 Rust, 0 doc-test failures |
| `npm run build` | Pass; produced `dist/app` and `dist/site` |
| `npm run test:e2e` | Pass: 14/14 desktop and 390 px checks |
| `npm audit` | Pass: 0 vulnerabilities |

No product source was modified during verification.

## Packaged desktop exercise

The published v0.1.5 Linux AppImage was downloaded into a temporary directory. Its 82,532,856-byte payload matched SHA-256 `654f739a68fa42d8ebae42856f275cf8658c35a349d165b053b172cc86ca1240` from `SHA256SUMS`. The live `install.sh` installed the same verified executable into the disposable verifier environment, and `--appimage-version` ran successfully.

Using isolated application-data directories under Xvfb:

- **Load sample project** created separate `demo-index.json`/`demo-sample` state; searching `MAPLE-742` returned the expected Markdown and mail records with source paths and extraction timestamps.
- **Start for real** removed demo storage, although the false demo banner remained visible.
- A real fixture folder exercised Markdown, text, HTML, two-message mbox, a small text PDF, corrupt PDF, empty Markdown, and a greater-than-25-MB text file. The five supported kinds indexed; corrupt, empty, and oversized inputs produced per-file recovery errors.
- Mixed-case `MAPLE-742` search returned three expected records. HTML script contents were not indexed.
- UI CSV export produced a header and one row per visible result with correct quoting.
- Enabling encryption removed plaintext `index.json`, produced `index.enc`, and no search token was visible with `strings`. Restart required the password; a wrong password gave an accessible error and the right password restored the six-record index.
- The separate valid text-rich PDF boundary test reproduced the 12-second failure described above.

The app stores state in its OS application-data directory and has no server-side product API, sign-in, AI feature, or paid unlock. API rate-limit and Entra-authority checks are therefore not applicable.

## Live deployment, privacy, accessibility, and resilience

- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 885 ms load, correct title/lang, one `h1`, `main`, zero missing image alts, zero unlabeled buttons, and no console/page errors.
- Desktop and 390 px checks found no horizontal overflow. Axe reported no serious/critical violations on home/demo and no violations on privacy/terms/404.
- Keyboard focus on the site is visible with a 3 px cyan ring. The desktop-app mobile drawer defect remains a manual accessibility failure.
- Reduced motion resolves transitions to approximately 0 seconds and smooth scrolling to `auto`.
- Home requests were limited to same-origin assets plus the documented GitHub Releases API. The complete demo search/reset flow was same-origin only. No analytics, third-party font, or archive-data request appeared.
- CSP restricts default/script/style/image/font/connect sources and sends `frame-ancestors 'none'`; responses also include `X-Frame-Options: DENY`, HSTS, `nosniff`, strict referrer policy, and restrictive permissions policy.
- HTML uses `max-age=30, must-revalidate`; hashed assets use one-year immutable caching.
- The service worker updated, then the live site reloaded offline with its title and body intact and no console/page errors.
- Internal links returned 200 and a random route returned the designed 404 response.

Fresh Lighthouse mobile results: performance 99, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 1.9 s, TBT 110 ms, CLS 0, speed index 0.9 s, and 33 KiB transferred.

Built bundle sizes are comfortably within budget: app JS 16,840 bytes raw/6.07 KB gzip; app CSS 13,959 bytes raw/3.92 KB gzip; site main JS 1,955 bytes raw; site CSS 10,874 bytes raw/3.07 KB gzip; mobile/desktop hero images 21,978/50,526 bytes.

## Deployment and build identity

Hashes of the freshly built candidate site matched live HTML, JS, CSS, images, service worker, and install scripts. The latest release tag `v0.1.5` resolves to `ebb45743bf45e4086db7d14946c384e30dc3947a`; the candidate is two documentation/lockfile commits later. The only non-document runtime-tree difference from that tag is the root package version in `src-tauri/Cargo.lock`; application source and configuration are identical.

The v0.1.5 release contains arm64 and x64 macOS DMGs, Linux AppImage/DEB, Windows MSI/EXE, `latest.json`, and `SHA256SUMS`.

## Decision

**FAIL.** Do not promote this candidate until the claims suite proves behavior through the demo, all public claims are registered, the PDF pipe deadlock is fixed, system-light contrast passes, the demo banner reflects the real state, and the mobile drawer has complete keyboard/screen-reader behavior.
