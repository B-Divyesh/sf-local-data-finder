# Independent product verification 3 — FAIL

**Candidate:** `ad39f28c892571f9446dfc952f118b3b7aca4898`

**Live URL:** `https://local-data-finder.sociobot.in`

**Verified:** 1 September 2026 (UTC)

**Verdict:** **FAIL**

The candidate source passes its declared tests and the live static site is byte-for-byte identical to the candidate build. The product is not releasable because the live download is still the pre-repair v0.1.5 desktop package, the one-click web demo contradicts its own no-match status, and the claims contract remains incomplete. The published desktop app therefore does not contain the repaired PDF, theme, demo-state, mobile-drawer, or encryption-control behavior being accepted in this candidate.

## Release-blocking findings

### Critical — the live desktop product is not the candidate

- Fresh production output from candidate `ad39f28` matched all 18 served static files byte-for-byte, including HTML, JS, CSS, images, service worker, legal pages, and installers.
- The live download resolves to GitHub release `v0.1.5`, published 30 August 2026. Its annotated tag resolves to `ebb45743bf45e4086db7d14946c384e30dc3947a`, not the candidate.
- Candidate `ad39f28` changes `src-tauri/src/lib.rs`, `src/main.ts`, and `src/styles.css` after that release. GitHub reports no Actions run for candidate `ad39f28`, so no candidate desktop assets exist.
- The downloaded 82,532,856-byte Linux AppImage matched the release checksum `654f304a8cf1024911680bde120406ea891cccdf81485692e99880ae425bb240` and launched successfully. This confirms the tested artifact is authentic v0.1.5, not the candidate.
- A fresh isolated launch of that package in System/light mode still showed **Demo — sample data, nothing is saved with your archive** while `get_status` was real mode with no sources. Its top bar and source rail also retained dark translucent backgrounds under dark text. These are two high-severity defects from verification 2 that candidate source fixes but the live package does not.
- The v0.1.5 tag also predates the repaired PDF pipe draining, modal 390 px source drawer, state-aware encryption label, and the expanded five-record desktop sample. Those repairs passed candidate tests but are not present in the downloadable app.

This is an artifact-identity failure for a desktop product. Matching the landing site alone does not make the live product the candidate.

### Critical — the claims contract is still incomplete and permits a false-positive demo test

All 13 exact claim commands pass after installing the locked dependencies and documented Tauri system packages. The contract still fails the supplied claims rules:

- `@claim:demo-sandbox` fills a non-matching query but asserts only the status sentence. On the live and candidate-built demo, `#sample-result` receives `hidden`, while `.demo-result { display: grid }` overrides it. The old Northwind result remains visible beside “No sample record matched.” The test therefore passes without asserting the promised observable search state.
- The `demo-sandbox` entry says it covers the desktop first-run screen and isolated desktop storage, but its only test is the static `/demo/` page. It never invokes the desktop sample commands or checks `demo-index.json` separation and cleanup.
- Published statements remain absent from `.factory/claims.json`, including “Hidden folders and unsupported files are skipped,” visible record counts/extraction times/parser errors, “Opening a source uses your operating system,” the website's no-advertising/no-tracking/no-third-party-font promise, and discarding the desktop sample when starting for real.
- `.factory/copy-audit.md` contains only five landing sentences. It does not extract every landing-page sentence as required, so it cannot identify all claim-like copy or prove the plain-words audit is complete.

The acceptance contract explicitly makes an unlisted claim or a test that does not assert the promised result release-blocking.

### High — the required web demo recovery and exit path are incomplete

The first click reaches `/demo/` and searches the sample, but invalid recovery is internally inconsistent:

- `Northwind` and `original export` show the sample result.
- Empty input, HTML-like input, a 5,000-character input, and an ordinary non-match update the live region to “No sample record matched,” but the prior sample result remains visible (`hidden` is present; computed `display` is `grid`).
- **Reset demo** restores `MAPLE-742` and its status correctly.

The `/demo/` page also lacks the required persistent demo banner with both **Reset demo** and **Start for real** actions. It has a static eyebrow and Reset button; “Start for real” appears only as explanatory text. The desktop app has that action, but the one-click browser sandbox does not.

## Other findings

### Medium

- Several live controls remain below the required 44×44 CSS-pixel target. The demo search input itself is 22 px high, the skip link is 43 px high, and Home/Demo/Terms text links are approximately 41–42 px wide. Hidden mobile navigation links with zero boxes were excluded from this finding.
- The desktop-app landing page still has no required three-to-five-frame captioned screenshot walkthrough. The static mock result and three text steps are not screenshots of the app.

### Minor

- The first screen supplies privacy, format, and source-scope facts but does not plainly state offline behavior or price/free status as the supplied first-screen copy contract requests.
- Open Graph/Twitter use the 1280×853 hero rather than a purpose-built 1200×630 social image, and the apple-touch icon points to SVG rather than a 180 px touch asset.

## Mandatory first-read test

**PASS.** A cold live visit at 1440×900 and 390×844 answers the required questions in plain words:

- What: “Find facts in your local archive.”
- For whom: professionals with years of notes and exports.
- First action: **Try it with sample data**, paired with “Open the sample project.”

The primary sample action is visible at y=540–614 in the 390×844 viewport and opens `/demo/` in one click.

## Claims run first from the clean checkout

The literal first command before dependency installation could not import `@playwright/test`. After the normal clean-clone `npm ci` step and installation of the README's Tauri Linux prerequisites, every exact command in `.factory/claims.json` was rerun and passed:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | Pass, desktop and 390 px Playwright projects |
| `local-first-site` | Pass, desktop and 390 px Playwright projects |
| `desktop-local-processing` | Pass, Rust |
| `five-formats` | Pass, Rust |
| `csv-export` | Pass, Rust |
| `exact-source-open` | Pass, Rust |
| `attachments-closed` | Pass, Rust |
| `source-removal` | Pass, Rust |
| `encrypted-index` | Pass, Rust |
| `session-password` | Pass, Rust |
| `parser-limits` | Pass, Rust |
| `retrieval-benchmark` | Pass, Rust |
| `published-checksums` | Pass, Vitest |

The false-positive and missing-claim findings above are contract-review findings, not failed command exits.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| Checkout identity | Pass: clean clone began at exact candidate `ad39f28` |
| `npm ci` | Pass: 105 packages audited, 0 vulnerabilities |
| `npm run lint` | Pass: TypeScript no-emit check |
| `npm run check` | Pass: TypeScript and Cargo check |
| `npm test` | Pass: 4 Vitest + 16 Rust tests; 0 failures |
| `npm run build` | Pass: produced `dist/app` and `dist/site` |
| `npm run test:e2e` | Pass: 22/22 across desktop Chromium and 390×844 Chromium |
| `npm audit --audit-level=high` | Pass: 0 vulnerabilities |

Production sizes are within budget: app JS 18.55 kB raw/6.58 kB gzip, app CSS 14.24 kB raw/3.99 kB gzip, site JS 2.18 kB raw/1.11 kB gzip plus a 0.71 kB preload helper, site CSS 10.87 kB raw/3.07 kB gzip, and the mobile hero is 21,978 bytes. No fonts are downloaded.

## End-to-end and repaired-claim evidence

Candidate source tests independently pass the repaired behaviors:

- all five supported formats, HTML script exclusion, mail attachment exclusion, exact source paths, CSV output, source removal safety, encrypted storage, session-only password, parser limits, and the 50-query ≥80% benchmark;
- the 511 KiB text-rich PDF regression produces more than 300 kB of worker output without deadlock;
- System/light axe, correct real/demo banner transitions, 390 px modal drawer focus trap/Escape/focus restoration, and the state-aware encryption button;
- Apple-silicon release selection and the static “Source trail” label.

The live static site contains the Apple-silicon and Source-trail repairs. The live desktop release contains none of the post-v0.1.5 desktop/core repairs, as shown by tag identity and the fresh package launch.

## Live privacy, accessibility, resilience, and performance

- Home, demo, privacy, terms, and designed 404 were checked at desktop and 390 px. All have `lang`, one `h1`, `main`, no horizontal overflow, and zero serious/critical axe findings.
- Home/demo/legal routes produced no console or page errors. The deliberate 404 navigation emitted the browser's expected failed-resource console message for its 404 document.
- Keyboard-only traversal reached the skip link, brand, primary actions, copy buttons, and footer links. Each focused element showed a 3 px mint outline and no trap was found on the site.
- Reduced-motion emulation matched the media query, reduced the maximum transition to 0.001 ms, and set scroll behavior to `auto`.
- The complete demo search/reset request log was same-origin only. Home additionally contacted only the documented GitHub Releases API. No analytics, third-party font, or archive-content request occurred.
- Responses include a restrictive CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, HSTS, `nosniff`, strict-origin referrer policy, and camera/microphone/geolocation restrictions.
- HTML and service worker use `max-age=30, must-revalidate`; hashed JS/CSS/images use one-year immutable caching.
- Service-worker `update()` completed, then an offline reload returned 200 with the title and job copy and no console/page errors.
- Internal links returned 200. The source repository returned 200. The published AppImage redirect and download succeeded.
- `/opt/fleet/lib/verify-url.sh` passed: 200 in 765 ms, no errors, title/lang/one h1/main present, no missing alt, and no unlabeled buttons.
- Fresh Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; FCP 0.9 s, LCP 1.0 s, TBT 40 ms, CLS 0, speed index 1.0 s, and 33 KiB transferred.

The product is a static site plus local desktop app. It has no product server endpoint, paid-unlock call, or sign-in flow; request allowance/429 and Entra-authority checks are not applicable.

## Decision

**FAIL.** Publish a new checksummed desktop release built from the accepted commit, fix the web demo's hidden-result and Start-for-real behavior, complete and strengthen the claims inventory/tests, and close the remaining mandatory touch-target and walkthrough gaps before promotion.
