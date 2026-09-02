# Independent product verification 7 — FAIL

**Requested candidate:** `18ccae6dcbef4e94fa92dc0fec94b2c9652f28c1` (not present in the fetched repository)

**Resolved candidate:** `18ccae67b81d5b64d97efed6454cfa679646b800` (the only commit matching the supplied `18ccae6` prefix)

**Live URL:** `https://local-data-finder.sociobot.in/`

**Verified:** 2 September 2026 (UTC)

## Verdict

**FAIL.** All 27 declared claims and the repository's required test, type-check, build, and browser suites pass. The candidate still cannot be accepted because the public desktop downloads were built from older commit `61db921a4d8798c1384c46d4745cd6d5192c6eae`, not the candidate, and the live skip link does not move keyboard focus into the main content.

No product code was changed during this verification.

## Release-blocking defects

### High — the shipped desktop application is not the candidate

The live Linux download resolves to release `v0.1.8`. GitHub Actions run `33565708148` built that release from tag commit `61db921a4d8798c1384c46d4745cd6d5192c6eae`. The candidate is later commit `18ccae67b81d5b64d97efed6454cfa679646b800`.

This is observable in the product, not only in Git history. A freshly downloaded, checksummed AppImage shows the older heading **“Find the record, not a guess.”** Candidate source instead renders **“Search selected local records.”** The candidate therefore has no corresponding published desktop build even though the landing page offers that older binary as the product.

Repair: publish a new version from the accepted commit, with the full macOS/Windows/Linux matrix, regenerated `SHA256SUMS` and `latest.json`, then make the live download resolver point to that release.

Evidence: `.factory/verification-artifacts/release-app-search-result.png` and `git diff 61db921..18ccae67 -- src/main.ts`.

### Medium — the skip link does not transfer keyboard focus

On a cold live load, the first Tab correctly focuses **Skip to content** with a visible 3 px mint outline. Pressing Enter navigates to `#main`, but `document.activeElement` remains `<body>`. A keyboard or screen-reader user therefore has not actually bypassed the header navigation. The same structural pattern is used on the secondary routes.

Repair: make the main landmark programmatically focusable and focus it when the skip link is activated, or point the skip link at a focusable main heading. Add an assertion that Enter leaves `#main` or its heading focused.

## Mandatory first-read and demo check

**Pass.** A cold 1440×900 visit immediately states:

- What it does: **“Find facts in your local archive.”**
- Who it is for: professionals with years of notes and exports.
- What to do first: **“Try it with sample data / Open the sample project.”**

That one-click action opens `/demo/?demo=1`. The banner says **“Demo — sample data, nothing is saved”** and remains visible. `MAPLE-742` and `Northwind` return a source-grounded result; an absent query hides the result and gives recovery examples; **Reset demo** restores `MAPLE-742`; **Start for real** removes `demo:local-data-finder:query` and returns home.

Evidence: `.factory/verification-artifacts/live-first-read-desktop.png` and `.factory/verification-artifacts/live-mobile-demo.png`.

## Claims — 27/27 pass

`.factory/claims.json` exists. After `npm ci` and installation of the README's Ubuntu Tauri prerequisites, every listed `test` command passed individually on resolved candidate `18ccae67`.

| Claim group | Result |
| --- | --- |
| Browser demo/privacy/offline/walkthrough (5 entries) | Pass in both desktop and 390 px Playwright projects. |
| Web copy/release selection/checksums (4 entries) | Pass via the exact Vitest selections. |
| Desktop isolation, ingest/search, source trail, export, encryption, storage, parser limits, and benchmark (18 entries) | Pass via the exact Cargo test selections. |

The first preflight attempt exposed missing GLib/WebKit packages in the disposable verifier image, and one Chromium worker crashed. After installing the documented Tauri prerequisites, the complete authoritative rerun was **27 passed, 0 failed**.

## Local quality gates

All required repository gates pass on `18ccae67`:

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 0 vulnerabilities. |
| `npm test` | Pass: 7 Vitest and 24 Rust tests. |
| `npm run lint` | Pass. |
| `npm run check` | Pass. |
| `npm run build` | Pass; creates `dist/app` and `dist/site`. |
| `npm run test:e2e` | Pass: 40/40 across desktop Chromium and 390 px Chromium. |

Production bundle sizes are within budget:

- Desktop UI: 18.48 kB JS / 6.55 kB gzip; 14.37 kB CSS / 3.99 kB gzip.
- Site: 4.92 kB total JS raw; 12.94 kB CSS / 3.48 kB gzip.
- Mobile hero: 21,978 bytes; social image: 104,299 bytes at 1200×630.

Supplementary, non-scripted checks found low-severity maintainability debt: `cargo fmt --check` reports formatting differences, and `cargo clippy --all-targets -- -D warnings` reports four style lints (`unnecessary_sort_by`, two `unnecessary_map_or`, and `io_other_error`). These do not invalidate the passing repository-defined `lint` and `check` commands.

## End-to-end product evidence

- The freshly downloaded Linux AppImage matched `SHA256SUMS`, opened under Xvfb, loaded the isolated five-record sample, created `demo-index.json` plus `demo-sample`, and returned three results for `MAPLE-742`. The result view included paths and extraction times.
- Rust integration tests exercised Markdown, plain text, HTML, mbox, and text-based PDF ingestion; hidden/unsupported files; selected-source boundaries; malformed/oversized input; the PDF timeout; removal without original deletion; CSV output; encrypted-at-rest storage; wrong passwords; atomic persistence; and 50-query retrieval at the required 80% threshold.
- The browser demo exercised a normal match, an absent query, recovery copy, reset, isolated storage, and exit to real mode.

## Live deployment, privacy, accessibility, and PWA

- The live site serves `v0.1.8 · build eb69cc5`. Commit `eb69cc5` changes only handoff/polish documentation and evidence after the resolved candidate. All candidate-built JS, CSS, images, service worker, installers, robots, and sitemap match live byte-for-byte; the five HTML files differ only in the embedded build ID (`18ccae6` locally versus `eb69cc5` live).
- A fresh direct `/demo/` context made only same-origin requests during search. The landing page additionally requests public release metadata from `https://api.github.com`, as documented. There are no trackers, analytics, advertising calls, third-party fonts, archive uploads, or console/page errors on normal routes.
- Live `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404 each have one `h1`, a main landmark, correct titles, metadata, alt text, and zero serious/critical Playwright Axe findings. At 390 px there is no horizontal overflow and all visible demo controls are at least 44 px.
- Reduced-motion emulation reports no active animation. A 200% text-size check retains the first-screen content and actions without horizontal overflow.
- The service worker updated successfully, controlled the site under cache `local-data-finder-site-v3`, and reloaded `/demo/` offline.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title/lang/one-h1/main/alt checks, no console errors, and 932 ms browser load. Standalone axe CLI could not start its Selenium browser in this container; the repository and independent Playwright Axe runs are the accepted equivalent.
- Live security headers include HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, disabled camera/microphone/geolocation, and a CSP with `frame-ancestors 'none'`. HTML and service worker responses revalidate after 30 seconds; hashed assets are immutable for one year; an ETag revalidation returned 304; a missing route returned the designed page with HTTP 404.
- Mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 0.9 s, TBT 40 ms, CLS 0. Raw report: `.factory/verification-artifacts/lighthouse-live.json`.

## Release/install evidence

GitHub release `v0.1.8` contains macOS ARM64 and x86_64 DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and `latest.json`. Every manifest URL returned 200. A fresh 83,057,144-byte Linux AppImage matched SHA-256 `5f9dff4794c8e9061b07e06cc69c57becfae9246b6d2fcd4369771c1ffd93c1c` and remained running for the 20-second smoke window before the verifier stopped it.

The packages are intentionally unsigned and the site explains the macOS Gatekeeper and Windows SmartScreen steps. Signing still requires owner-provided certificates.

## Not applicable

The product has no server-side product API, product-unlock endpoint, account, or sign-in flow. API allowance/429/`Retry-After` and Microsoft Entra checks therefore do not apply. The GitHub release API is an external public metadata dependency, not a product endpoint.

## Lower-severity findings

- **Low:** Rust source is not rustfmt-clean and strict Clippy reports four style lints.
- **Informational:** the full requested SHA does not exist after a fresh fetch; this report resolves the only repository commit matching prefix `18ccae6`.
- **Informational:** macOS and Windows artifacts are intentionally unsigned.

## Required next verification

Publish desktop artifacts from the repaired candidate, verify one downloaded binary against the new checksum, and rerun the live skip-link activation test plus the complete claims and quality-gate suites.
