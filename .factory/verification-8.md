# Independent verification 8 — PASS

Candidate `0fc8b05daf2953e814e21447a8804c957a31255d` at `https://local-data-finder.sociobot.in/` **PASSES** independent product QA on 2 September 2026 UTC. No release-blocking defect was found.

## First-read and demo gate

**Pass.** A cold 1440×900 visit makes all three required points on the first screen:

- What it does: **“Find facts in your local archive.”** It searches selected folders and exports and links results to their original records.
- Who it is for: professionals with years of notes and exports.
- What to do first: **“Try it with sample data / Open the sample project.”**

That action opens `/demo/?demo=1` in one click. The persistent banner says **“Demo — sample data, nothing is saved”** and offers **Reset demo** and **Start for real**. The first-screen gate therefore passes.

## Claims — 27/27 pass

`.factory/claims.json` exists. `npm ci` completed from the clean candidate checkout with zero vulnerabilities. The initial Cargo invocations stopped before test execution because the verifier image lacked the documented Tauri Linux GTK/WebKit packages (`glib-2.0.pc`). After installing the README/Tauri prerequisites, every exact manifest command executed successfully. This was an environment prerequisite, not a failed claim assertion.

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | Pass | Exact Playwright selection: 4/4 desktop/mobile cases. |
| `demo-browser-storage` | Pass | Exact Playwright selection: 2/2; only `demo:local-data-finder:query`, then cleared. |
| `desktop-demo-isolation` | Pass | Exact Cargo test; normal index preserved and demo artifacts discarded. |
| `website-privacy` | Pass | Exact Playwright selection: 2/2; demo search remained same-origin. |
| `offline-reload` | Pass | Exact Playwright selection: 2/2 in dedicated contexts. |
| `desktop-local-processing` | Pass | Exact Cargo test; no network client, LLM, or archive endpoint in the core. |
| `free-download` | Pass | Exact Vitest selection. |
| `five-formats` | Pass | Exact Cargo test for Markdown, text, HTML, mbox, and text PDF. |
| `source-selection` | Pass | Exact Cargo test; hidden and unsupported files skipped. |
| `selected-sources-only` | Pass | Exact Cargo test; sibling content excluded. |
| `source-scope-feedback` | Pass | Exact Cargo test; count, extraction time, and parser error reported. |
| `csv-export` | Pass | Exact Cargo test; public CSV path, header, quoted row, and count verified. |
| `exact-source-open` | Pass | Exact Cargo test; record path used rather than source root. |
| `source-trail-per-result` | Pass | Exact Cargo test; path and extraction time preserved for every result/export. |
| `open-source-os` | Pass | Exact Cargo test; native Tauri opener used. |
| `attachments-closed` | Pass | Exact Cargo test; attachment payload excluded. |
| `source-removal` | Pass | Exact Cargo test; index cleared and original retained. |
| `encrypted-index` | Pass | Exact Cargo test; plaintext absent and wrong password rejected. |
| `encryption-algorithm` | Pass | Exact Cargo test; Argon2 plus ChaCha20-Poly1305 envelope verified. |
| `session-password` | Pass | Exact Cargo test; fresh state restores locked without the password. |
| `parser-limits` | Pass | Exact Cargo test; 25 MB rejection and 12-second worker limit. |
| `normal-index-storage` | Pass | Exact Cargo test; interrupted replacement preserves prior index. |
| `retrieval-benchmark` | Pass | Exact Cargo test; required ≥40/50 first-result matches. |
| `published-checksums` | Pass | Exact Vitest selection. |
| `platform-download-selection` | Pass | Exact Vitest selection; macOS ARM/Intel, Windows, and Linux. |
| `unsigned-builds` | Pass | Exact Vitest selection. |
| `desktop-walkthrough` | Pass | Exact Playwright selection: 2/2; three visible captioned frames. |

A manual cross-check of the landing page, legal pages, README, and desktop copy found no material product promise omitted from the claims manifest.

## Local quality gates

All repository gates pass on the candidate:

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 104 packages, zero vulnerabilities. |
| `npm test` | Pass; 7 Vitest and 24 Rust tests. |
| `npm run lint` | Pass; TypeScript no-emit check. |
| `npm run check` | Pass; TypeScript and Cargo check. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | Pass. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities. |
| `npm run build` | Pass; exact production build creates `dist/app` and `dist/site`. |
| `npm run test:e2e` | Pass; 42/42 across desktop Chromium and 390 px Chromium. |

Production sizes are inside the contract: desktop UI JS 18.48 kB raw/6.55 kB gzip; site JS 5.16 kB raw total; site CSS 12.94 kB raw/3.48 kB gzip; mobile hero 21,978 bytes; no downloaded fonts.

## End-to-end product behavior

A fresh, checksummed Linux AppImage was launched under Xvfb with an isolated XDG data directory. It opened the real **Search selected local records** application, not a placeholder. **Load sample project** created five records in `demo-index.json` plus `demo-sample`. Searching `MAPLE-742` returned three records, including Markdown and PDF evidence, with exact local paths and extraction times. **Start for real** removed both demo artifacts.

The complete Rust suite additionally exercised all five formats, selected-folder boundaries, hidden/unsupported files, malformed and oversized inputs, the PDF worker timeout and large-output deadlock boundary, source removal, CSV export, encrypted persistence, wrong passwords, interrupted atomic replacement, and the 50-query retrieval benchmark.

The live browser demo handled `Northwind` and `original export` normally. Empty, whitespace-only, Unicode, markup-like, absent, and 10,000-character queries safely produced the recovery message and no result. Reset restored `MAPLE-742`; Start for real removed the demo key and returned home.

## Live deployment, privacy, accessibility, and PWA

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return 200. An unknown path returns the designed 404 document with status 404.
- At both 1440×900 and 390×844, every route has `lang="en"`, one H1, a main landmark, complete image alt attributes, no horizontal overflow, no console/page errors on valid routes, and zero serious/critical Axe findings.
- The first Tab focuses the skip link with a designed 3 px mint outline; Enter transfers focus to `main#main`. Repository tests also cover route/back focus, desktop keyboard result opening, and the mobile dialog focus trap.
- At 390 px with root text enlarged to 200%, landing, demo, privacy, and terms remain within the viewport with their headings and controls available. Touch-target tests pass the 44 px minimum.
- With reduced motion enabled, no animations remain running.
- A fresh direct demo flow requests only `https://local-data-finder.sociobot.in`. The landing page additionally calls only the documented public GitHub release API. There are no analytics, trackers, ads, third-party fonts, archive uploads, or runtime AI calls.
- Response headers include HSTS, `nosniff`, `DENY`, strict-origin referrer policy, disabled camera/microphone/geolocation, and a CSP whose only external connection is `https://api.github.com`; `frame-ancestors 'none'` is delivered as a header.
- HTML and the service worker use `max-age=30, must-revalidate`; hashed assets use `max-age=31536000, immutable`; ETag revalidation returned 304.
- A clean service-worker registration updated to `/sw.js`, created cache `local-data-finder-site-v5`, and reloaded `/demo/` offline.
- Every navigable link across all public routes returned 200, including the resolved release asset after redirects.
- `/opt/fleet/lib/verify-url.sh` passed in 957 ms with correct title/lang/H1/main/alt checks and zero errors.
- Three mobile Lighthouse runs produced a median score of **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**, median LCP 1.05 s, median TBT 34.5 ms, and median CLS 0. Two repeated runs were 100 with CLS 0; the first cold tooling run was 88 with CLS 0.123 and did not reproduce.

All 24 publicly served production files match the candidate's fresh `dist/site` output byte-for-byte. `staticwebapp.config.json` is deployment configuration and correctly is not served. The live footer reports `v0.1.10 · build 0fc8b05`.

## Release and candidate identity

GitHub release `v0.1.10` is public, non-prerelease, and immutable. It contains exactly eight required assets: two macOS DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and `latest.json`. Live OS selection resolved to the correct immutable asset for Windows, macOS Intel, macOS ARM, and Linux; a failed metadata response retained the calm direct Releases fallback.

The freshly downloaded 83,057,144-byte Linux AppImage matches both manifest and GitHub digest:

`de69b4dfd0efe229c89143ba289229fe7969f3601988bdc53e02aae9c585d03a`

The release manifest records source `abcf708468919672817484ccf9ea1666e44845fe`. Candidate `0fc8b05` differs from that release tag only in `.factory/handoff.md` and QA evidence; no application, site, installer, manifest generator, dependency, or release-workflow source changed. The deployed website is the candidate build and the released desktop runtime is therefore product-source-identical to the candidate.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.
- Informational: macOS and Windows packages are intentionally unsigned and the site/README disclose the first-launch warnings. Signing still needs owner-provided certificates.
- Informational: a real missing URL produces the browser's expected failed-resource console line for its HTTP 404 navigation; the explicitly linked `/404.html` route loads without console errors.

## Applicability notes

This product has no server-side product endpoint, product-unlock call, account, or sign-in flow. API allowance/429/`Retry-After` and Microsoft Entra checks are not applicable. The GitHub API call is public release metadata, not a product backend. AI would contradict the brief's explicit non-goal, so there is no missed AI leverage finding.

## Verdict

**PASS — candidate `0fc8b05daf2953e814e21447a8804c957a31255d` is accepted for release.**
