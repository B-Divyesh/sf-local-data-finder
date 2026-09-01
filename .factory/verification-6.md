# Independent product verification 6 — PASS

**Candidate:** `e98c7db494a2559531b9a43161e4dbc902e3af4c`  
**Live URL:** `https://local-data-finder.sociobot.in/`  
**Verified:** 1 September 2026 (UTC)

## Verdict

**PASS.** The live static product is the candidate product, all 22 declared claims pass, the published desktop release is available and checksummed, and the app's local retrieval workflow meets the researched job to be done. No release-blocking defects were found.

The researched one-time monetization is deliberately not offered in v0.1. This is a documented scope deviation in `.factory/monetization.md`: there is no registered working Sociobot checkout, so the fully enabled app is truthfully presented as free rather than advertising an unavailable purchase. This is not a hidden paywall or misleading purchase flow; it must be revisited before a paid tier is announced.

## Mandatory first-read and demo check

**Pass.** A cold browser load answers the required questions on the first screen in plain words:

- **What it does:** “Find facts in your local archive.”
- **For whom:** professionals with years of notes and exports.
- **What to do first:** **Try it with sample data** / “Open the sample project.”

The action opens `/demo/` in one click. The demo has the persistent “Demo — sample data, nothing is saved” banner, an ordinary match (`Northwind`), a no-match recovery state, **Reset demo**, and **Start for real**. Reset restores `MAPLE-742`; Start for real clears `demo:local-data-finder:query` and returns home.

## Claims — 22/22 pass

`.factory/claims.json` is present with 22 unique claim IDs. After `npm ci` and installation of the documented Tauri system dependencies, every claimed test case passed from the demo entry point or isolated Rust fixture as appropriate.

| Claim groups | Evidence |
| --- | --- |
| Browser demo: `demo-sandbox`, `demo-browser-storage`, `website-privacy`, `offline-reload`, `desktop-walkthrough` | Individual Playwright claim selections passed in both desktop Chromium and 390 px Chromium projects. Offline reload used a dedicated browser context. |
| Copy/release: `free-download`, `published-checksums`, `unsigned-builds` | Vitest selection passed 3/3. |
| Desktop core: `desktop-demo-isolation`, `desktop-local-processing`, `five-formats`, `source-selection`, `source-scope-feedback`, `csv-export`, `exact-source-open`, `open-source-os`, `attachments-closed`, `source-removal`, `encrypted-index`, `session-password`, `parser-limits`, `retrieval-benchmark` | `cargo test --manifest-path src-tauri/Cargo.toml claim_` passed 14/14. The benchmark requires at least 40 correct first results from 50 queries. |

## Local quality gates

| Check | Result |
| --- | --- |
| Clean dependency install | `npm ci` passed; audit reported 0 vulnerabilities. |
| Type and Rust check | `npm run check` passed. |
| Unit/integration tests | `npm test` passed: 6 Vitest and 20 Rust tests. |
| Production build | `npm run build` passed and produced `dist/app` and `dist/site`. |
| Browser/UI suite | `npm run test:e2e` passed: 36/36. |
| Static budget | App JS 18.48 kB raw / 6.57 kB gzip; app CSS 14.37 kB / 3.99 kB. Site entry JS 2.25 kB / 1.14 kB and site CSS 12.81 kB / 3.44 kB. Mobile hero is 21,978 bytes. |

The current clean container initially lacked GLib/WebKit headers. I installed the documented Ubuntu Tauri prerequisites before running Rust checks; this was environment setup only and did not alter product code.

## Live deployment, release, privacy, and accessibility

- `main` resolves to candidate `e98c7db`. Release tag `v0.1.8` resolves to `61db921`; its only difference from the candidate is `.factory/handoff.md`. The live footer reports `build e98c7db`.
- The candidate-built deployed static files matched the live origin byte-for-byte for all public artifacts. `staticwebapp.config.json` is intentionally not publicly served; live responses nevertheless contained its expected CSP and security headers.
- GitHub Release `v0.1.8` contains two macOS DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and `latest.json`. A fresh 4,440,064-byte Windows MSI download matched `SHA256SUMS`. A fresh Linux AppImage also matched; with `APPIMAGE_EXTRACT_AND_RUN=1` it stayed running under Xvfb for the 20-second smoke window (the non-FUSE container cannot mount an AppImage normally).
- Landing and demo had zero console/page errors and zero serious or critical axe findings. The first Tab reaches the skip link, whose focus is a visible mint `3px` outline. The desktop app regression test confirms Enter calls `open_source` exactly once, and 390 px controls are at least 44 px.
- At 390 px, demo `scrollWidth` equalled the 390 px viewport. Reduced-motion emulation completed without error. The site demo's search, empty state, reset, and start-for-real flows behaved correctly.
- Request recording during the live demo found no archive-data, tracking, analytics, advertising, or third-party-font request. Requests were same-origin; the landing page additionally uses the documented `https://api.github.com` release-metadata request. There is no product backend endpoint, authentication flow, or product-unlock call, so 429/`Retry-After` and Entra checks do not apply.
- Home responses were 200 with HSTS, CSP (`frame-ancestors 'none'`), `nosniff`, strict-origin referrer policy, denied camera/microphone/geolocation, and `X-Frame-Options: DENY`. Hashed JS has one-year immutable caching; the service worker and HTML revalidate after 30 seconds. A deliberately missing route returned a real 404.

## Defects by severity

No Critical, High, Medium, or Low release defects found.

**Informational / follow-up:** macOS and Windows artifacts are intentionally unsigned; the product discloses their first-launch warnings. The v0.1 free-distribution scope decision must be replaced with a Sociobot billing implementation only when a registered checkout is available.

