# Independent verification 10 — PASS

Candidate `509bd0540ff023b11089b166fd295b5327d84e20` at `https://local-data-finder.sociobot.in/` was independently tested on 2 September 2026 UTC. The candidate **PASSES** the researched brief and supplied acceptance contracts. No product code was modified.

## Verdict and findings

- Release-blocking defects: none.
- Critical defects: none.
- High defects: none.
- Medium defects: none.
- Low defects: none observed.
- Informational limitation: macOS and Windows packages are intentionally unsigned. The site explains the operating-system warnings. Signing still requires operator certificates.

## Mandatory first-read gate

**Pass.** A cold 1440×900 visit returned HTTP 200 and made the job, audience, and first action clear on the first screen:

- What it does: **“Find facts in your local archive.”**
- Who it is for: professionals with years of notes and exports who need the original record.
- What to click first: the visible **“Try it with sample data / Open the sample project”** action.

That one click opened `/demo/?demo=1`, showed a realistic result and the persistent **“Demo — sample data, nothing is saved”** banner, and exposed **Reset demo** and **Start for real**. Evidence: `verification-artifacts/live-first-read-10.png`.

## Claims — 29/29 pass

`.factory/claims.json` exists. After `npm ci` and installation of the documented Tauri Linux prerequisites, every exact command in all 29 entries passed. The first Rust attempt before those host prerequisites were installed stopped at missing `glib-2.0`; the same claim passed once the required build environment was present.

| Claim | Result | Observed evidence |
| --- | --- | --- |
| `demo-sandbox` | Pass | Desktop and 390 px browser cases searched, hid a non-match, and reset to `MAPLE-742`. |
| `demo-browser-storage` | Pass | Only the demo query key was used; Start for real removed it. |
| `desktop-demo-isolation` | Pass | Demo artifacts were separate and the normal index remained unchanged. |
| `website-privacy` | Pass | Direct demo flow made four requests, all to the product origin. |
| `offline-reload` | Pass | Dedicated contexts reloaded `/demo/` offline. |
| `desktop-local-processing` | Pass | Desktop core has no network client, LLM, or archive endpoint. |
| `free-download` | Pass | No checkout or license flow is presented. |
| `five-formats` | Pass | Markdown, text, HTML, mbox, and text PDF fixtures were searchable. |
| `source-selection` | Pass | Hidden and unsupported files were skipped. |
| `selected-sources-only` | Pass | Content outside the selected source was excluded. |
| `source-scope-feedback` | Pass | Counts, extraction time, and parser error were reported. |
| `csv-export` | Pass | CSV header, quoted row, count, and public path were verified. |
| `exact-source-open` | Pass | The record path, not source root, was passed to the opener. |
| `source-trail-per-result` | Pass | Every result and export row retained path and extraction time. |
| `open-source-os` | Pass | The Tauri native opener is used. |
| `attachments-closed` | Pass | Encoded mail attachment content was not indexed. |
| `source-removal` | Pass | Index records were removed without changing the original file. |
| `encrypted-index` | Pass | Stored text/path were opaque and a wrong password was rejected. |
| `encryption-algorithm` | Pass | Argon2 and ChaCha20-Poly1305 envelope behavior was verified. |
| `session-password` | Pass | A fresh session restored locked without a password. |
| `parser-limits` | Pass | 25 MB rejection and 12-second worker timeout were exercised. |
| `normal-index-storage` | Pass | Interrupted replacement preserved the previous index. |
| `retrieval-benchmark` | Pass | At least 40 of 50 expected records were first results. |
| `published-checksums` | Pass | Manifest, checksum file, immutable URLs, and installer comparisons passed. |
| `platform-download-selection` | Pass | macOS ARM/Intel, Windows, and Linux selection passed. |
| `unsigned-builds` | Pass | Site warning and unsigned workflow configuration agree. |
| `desktop-walkthrough` | Pass | Three visible, captioned product screenshots exist at both viewports. |
| `release-metadata-cache` | Pass | Immediate reload reused the one-hour local cache and made one GitHub API request total. |
| `generated-image-disclosure` | Pass | Every public footer contains the disclosure. |

Landing, application, README, privacy, terms, demo documentation, and claim registrations were cross-checked. No substantive unlisted claim was found, and each claim ID occurs on one test definition.

## Clean local gates and production build

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 104 packages installed, zero vulnerabilities. |
| `npm test` | Pass; 9 Vitest tests and 24 Rust tests. |
| `npm run lint` | Pass. |
| `npm run check` | Pass. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | Pass. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities. |
| `npm run build` | Pass; produced `dist/app` and `dist/site`. |
| `npm run test:e2e` | Pass; 46/46 desktop and 390 px Chromium cases. |

Production output is within the contract budgets: app JS is 18,476 bytes raw/6.55 kB gzip; site JS totals 6,112 bytes raw; site CSS is 13,031 bytes raw/3.51 kB gzip; the mobile hero is 21,978 bytes; there are no downloaded fonts.

## Smallest useful product and recovery paths

The published Linux AppImage was freshly downloaded and run under Xvfb with isolated XDG data, config, and cache directories.

- Size: 83,057,144 bytes.
- SHA256: `de69b4dfd0efe229c89143ba289229fe7969f3601988bdc53e02aae9c585d03a`.
- The hash matches the GitHub asset digest, `SHA256SUMS`, and `latest.json`.
- **Load sample project** created `demo-index.json` and five source files: Markdown, HTML, plain text, mbox, and PDF.
- Searching `MAPLE-742` returned three matches with exact local paths and extraction timestamps. Evidence: `verification-artifacts/release-app-search-10.png`.
- **Start for real** removed `demo-index.json` and `demo-sample`, returned to the real empty state, and showed a recovery/status message. Evidence: `verification-artifacts/release-app-after-start-real-10.png`.

The full Rust suite additionally exercises HTML stripping, mbox splitting, oversized input, PDF timeout and large-output boundaries, attachment exclusion, encryption failure recovery, safe index replacement, source removal, CSV export, and the 50-query benchmark. The live browser demo accepted normal text, whitespace, Unicode, markup-like input, and a 10,000-character query without script execution or errors; Reset demo recovered `MAPLE-742`.

## Live deployment, privacy, accessibility, and PWA

- Footer identity is `v0.1.10 · build 509bd05`.
- All 23 deployable files in fresh `dist/site` match the live responses byte-for-byte. `staticwebapp.config.json` is deployment configuration and correctly is not public.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return valid pages; an unknown path returns the designed page with HTTP 404. Public links resolve below HTTP 400.
- At 1440×900 and 390×844, all five pages have `lang="en"`, one H1, one main landmark, complete image alternatives, no horizontal overflow, no console/page errors, and zero serious/critical Axe findings.
- Keyboard activation of the skip link moves focus to `main#main`; its visible outline is at least 2 px. Route changes and Back restore heading focus in the full suite. All visible links, buttons, inputs, and summaries audited at 390 px measure at least 44×44 CSS px.
- At 200% root text size, the 390 px landing has no horizontal overflow. Reduced-motion mode has no running animation.
- A direct demo visit and search made exactly four requests, all to `https://local-data-finder.sociobot.in`; no archive data, analytics, ads, third-party fonts, or runtime AI calls left that origin.
- A fresh landing context made one GitHub release API request across initial load and immediate reload. The product-namespaced cache value was unchanged on reload.
- The active service worker is `/sw.js`, cache `local-data-finder-site-v6`; a dedicated context successfully reloaded `/demo/` offline.
- Response headers include HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, disabled camera/microphone/geolocation, and a matching CSP with `frame-ancestors 'none'`. HTML and `sw.js` use `max-age=30, must-revalidate`; hashed JS uses one-year immutable caching; ETag revalidation returned 304.
- `/opt/fleet/lib/verify-url.sh` passed in 1,390 ms with no errors. Evidence: `verification-artifacts/verify-url-live-10/`.
- Fresh mobile Lighthouse scored **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**. FCP and LCP were 897 ms, TBT 60.5 ms, CLS 0, and time to interactive 1.008 s. Raw evidence: `verification-artifacts/lighthouse-live-10.json`.

## Release and candidate identity

GitHub release `v0.1.10` is public, immutable, non-draft, and non-prerelease. Its successful release workflow produced exactly eight assets: two macOS DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and `latest.json`. The manifest uses versioned URLs and records source commit `abcf708468919672817484ccf9ea1666e44845fe`.

The candidate’s product changes after that release are limited to the static site/service-worker cache, tests, and factory documentation; desktop UI/core sources, Tauri configuration, dependencies, and app build configuration are unchanged. The site is byte-identical to the candidate build, and the released desktop behavior was verified directly.

## Applicability

There is no product backend, product-unlock endpoint, account, or sign-in flow. Server allowance/429/`Retry-After` and Microsoft Entra checks are therefore not applicable. GitHub is used only for public release metadata. The brief excludes LLM chat, so no runtime AI is appropriate. v0.1 is honestly offered free because no Sociobot billing product is available; `.factory/monetization.md` records that scope decision.

## Final result

**PASS.** The candidate satisfies the mandatory claim, first-read, end-to-end desktop, privacy, accessibility, offline, performance, release-integrity, and live-deployment checks.
