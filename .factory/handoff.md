# Repair 5 handoff — Local Data Finder v0.1.9

## Outcome

All release-blocking findings in `.factory/verification-7.md` are repaired. Runtime source commit `befa05e47f82a027f3acfca6573dabcf2fcec39f` is tagged `v0.1.9`, released for every required platform, and deployed at `https://local-data-finder.sociobot.in/`. The live footer reports `v0.1.9 · build befa05e`.

- The skip-link failure was reproduced before repair. After the first Tab and Enter, Playwright reported `#main` as inactive. Shared route code now makes the fragment target programmatically focusable and transfers focus after activation. `tests/site.spec.ts` asserts the URL fragment and focused `#main` across `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` in both browser projects.
- The prior `v0.1.8` release came from `61db921`, not the accepted candidate. Release `v0.1.9` comes from exact runtime source `befa05e47f82a027f3acfca6573dabcf2fcec39f`. `latest.json` records that source commit and uses only immutable `/releases/download/v0.1.9/` asset URLs.
- Version metadata is `0.1.9` in npm, Cargo, Tauri, and the static footer. Service-worker cache `local-data-finder-site-v4` forces the repaired shell to replace the previous cached shell.
- Rust formatting and all strict Clippy findings noted by verification 7 were also repaired without changing product behavior.

## Clean verification

Clean clone `/tmp/local-data-finder-repair5-clean-sbBRzG/repo` checked out exact source `befa05e` and ran `npm ci` with zero vulnerabilities. Every exact command in all 27 `.factory/claims.json` entries passed. The same clone passed:

- `npm run lint` and `npm run check`.
- `npm test`: 7 Vitest and 24 Rust tests.
- `npm run build`: `dist/app` and `dist/site` produced successfully.
- `npm run test:e2e`: 42/42 across desktop Chromium and 390 px Chromium.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `cargo fmt --check` and `cargo clippy --all-targets -- -D warnings`.

Production sizes remain within budget: desktop UI JS 18.48 kB raw/6.55 kB gzip; site JS 5.16 kB raw in total; site CSS 12.94 kB raw/3.48 kB gzip; mobile hero 21,978 bytes.

## Release evidence

GitHub Actions run `33579451416` completed successfully from `v0.1.9` at `befa05e47f82a027f3acfca6573dabcf2fcec39f`. Release `https://github.com/B-Divyesh/sf-local-data-finder/releases/tag/v0.1.9` contains:

| Asset | SHA-256 |
| --- | --- |
| macOS ARM64 DMG | `b0b48b1e9ed3fa53ace7c79f730d67092fafe3728929f939fed0a3c8f06c73e4` |
| macOS x64 DMG | `f3e6342f4e79d13863526baf1e46f28d5d0591efb733b2aec810df8c89502efd` |
| Linux AppImage | `057e883ebc7acedbba055125682bfb0298ee2eb5a209f501eff4400014572171` |
| Linux DEB | `d0071580ce2e068b7e0da0f0108ca002ab3a3d683cecf7ed6e8365adabf19af4` |
| Windows MSI | `b07882b84aafd1571e7cf98d67d60c0f942fca6d71b3bc8ee3caa4a3083863da` |
| Windows EXE | `66d4b9f661648ca079047661a9ba6faba7440aa4a82de0780ae7c13776aeda37` |

All six assets were freshly downloaded from their manifest URLs and passed `sha256sum -c SHA256SUMS`. Every URL returned successfully. The live shell installer was run with an isolated temporary home, installed the AppImage, and produced checksum `057e883e…`. The released AppImage stayed running under Xvfb and visibly rendered **Search selected local records**; evidence is `.factory/qa-artifacts/repair-5/release-app-v0.1.9.png`.

## Deployment and live verification

`dist/site` from exact runtime source `befa05e` was deployed through product-owned Static Web App `sf-local-data-finder` in resource group `sociobot`. Azure deployment `ab8f4b21-328f-4fd1-828c-555925d98bba` succeeded at `https://white-sand-0dde41610.7.azurestaticapps.net`; the product domain serves the same build. No other service or product resource was read or changed.

- `/opt/fleet/lib/verify-url.sh` passed live in 1,007 ms with no console/page errors, correct title/lang/one h1/main/alt checks, and desktop/mobile screenshots under `.factory/qa-artifacts/repair-5/live/`.
- All five routes passed live Playwright Axe at desktop and 390 px with zero serious/critical findings. Each had one h1, no horizontal overflow, no running reduced-motion animation, and skip-link activation focused `#main`.
- The live landing button resolved to the real `v0.1.9` Linux AppImage. The current GitHub API release is `v0.1.9`.
- A fresh service worker updated to cache `local-data-finder-site-v4`; `/demo/` then reloaded offline. A demo search made four requests, all same-origin.
- All 23 served files matched local `dist/site` byte-for-byte. Missing routes return the designed page with HTTP 404. ETag revalidation returns 304. Hashed assets serve `max-age=31536000, immutable`.
- Live headers include HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, disabled camera/microphone/geolocation, and the expected CSP with `frame-ancestors 'none'` and only GitHub's public API in `connect-src`.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 0.9 s, TBT 70 ms, CLS 0. Raw report: `.factory/qa-artifacts/repair-5/live/lighthouse.json`.

## Known gaps / operator action

No release-blocking gaps remain. macOS and Windows packages are intentionally unsigned. Signing requires owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; the site and README disclose the first-launch warnings.

# Verification handoff — Local Data Finder

## Independent verification 7 — FAIL

Candidate `18ccae67b81d5b64d97efed6454cfa679646b800` at `https://local-data-finder.sociobot.in/` **FAILed** independent QA on 2 September 2026 UTC. The work order's longer SHA (`18ccae6dcbef4e94fa92dc0fec94b2c9652f28c1`) does not exist in the fetched repository; `18ccae67…` is the only commit matching its prefix. Full evidence is in `.factory/verification-7.md`.

Release blockers:

1. The live download points to `v0.1.8` binaries built from older tag commit `61db921`, not the candidate. The checksummed Linux AppImage visibly carries the old desktop heading, while candidate source contains the revised heading. Publish a new full-platform release from the accepted commit and update the live resolver.
2. Activating the live **Skip to content** link leaves focus on `<body>` instead of the main landmark or heading. Repair focus transfer and add an activation regression test.

Positive evidence retained for the next pass:

- All 27 exact `.factory/claims.json` commands pass after installing the documented Tauri prerequisites.
- `npm test` passes (7 Vitest + 24 Rust), `npm run lint`, `npm run check`, and `npm run build` pass, and `npm run test:e2e` passes 40/40.
- A released AppImage checksum matches and the app loads its isolated five-record sample and returns three source-grounded `MAPLE-742` results.
- Live desktop/390 px flows have no normal-route console errors, no serious/critical axe findings, no overflow, compliant touch targets, local-only demo requests, working service-worker update/offline reload, security headers, and correct caching.
- Mobile Lighthouse scores 100 in Performance, Accessibility, Best Practices, and SEO; LCP is 0.9 s, TBT 40 ms, and CLS 0.

Low severity: `cargo fmt --check` is not clean and strict Clippy reports four style lints. macOS and Windows builds remain intentionally unsigned.

## Outcome

Repair commit `18ccae6dcbef4e94fa92dc0fec94b2c9652f28c1` closes every finding in `.factory/review-1.md`. It is pushed to `main` and the static product is deployed at `https://local-data-finder.sociobot.in/` (live footer: build `18ccae6`). The complete finding-by-finding mapping is in `.factory/polish-1.md`.

The repair adds an isolated `/?demo=1` entry path, focused and announced route transitions, five missing claims with direct tests, clearer privacy text, direct command labels, and mobile/live regression coverage. The product retains its luminous archive-landscape visual system.

## Verification

- Fresh clone: `/tmp/local-data-finder-clean-t3C7H3` from `18ccae6`; `npm ci` passed.
- Every exact command in all 27 `.factory/claims.json` entries passed from that clean clone.
- `npm test` passed (7 Vitest + 24 Rust); `npm run check`, `npm run build`, `npm run build:site`, `npm run test:e2e` (40 desktop/mobile tests), and `npm audit --audit-level=high` passed.
- Cold live check passed: `verify-url.sh` reported 870 ms load, title/lang/one h1/main/alt/button checks, and no console/page errors.
- Live 390 px Axe checks found zero serious/critical issues for `/`, `/?demo=1`, `/privacy/`, `/terms/`, and the real 404. All measured `scrollWidth: 390`.
- Live `/?demo=1` redirected to `/demo/?demo=1` with the demo banner, Reset demo, and Start for real. The live route check focused the Demo h1 and announced `Demo — Local Data Finder`.

## Deployment

`dist/site` was deployed through the product-owned Static Web App `sf-local-data-finder` on 2 September 2026. Azure confirmed deployment at `https://white-sand-0dde41610.7.azurestaticapps.net`; the custom domain serves the same build.

## Known gaps / operator action

- macOS and Windows artifacts remain intentionally unsigned. Signing needs owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` before a signed release can be produced.
- The fully enabled v0.1 app remains free until a registered Sociobot billing product is available; the decision is documented in `.factory/monetization.md`.

# Earlier review history

## Independent review 1 — FAIL

No product code was modified. The complete adversarial review is in `.factory/review-1.md`.

Blocking findings:

1. Route changes leave focus on `body` instead of the new page heading and do not announce the route.
2. README says desktop demo artifacts are removed on app exit, but the code removes them only through **Start for real**.
3. Five further public statements lack matching claims/tests: one source trail per result, platform download selection, normal-index storage, named encryption implementation, and user-chosen-source scope.

Minor copy findings cover one 28-word README sentence, metaphor/rhetorical/action labels, and unexplained technical privacy terms.

### Verification performed

- Cold live Chromium checks at 1440×900 and 390×844, including the one-click demo, reset, storage namespace, Start-for-real cleanup, request origins, no console errors, and 390 px width.
- Live metadata, headers, 404, internal-link, history/back, and route-focus checks.
- Live Axe checks over `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` at desktop and mobile: zero serious/critical results.
- Fresh clone at `/tmp/local-data-finder-review-dW4AzH`; `npm ci`; documented Ubuntu Tauri prerequisites; all 22 exact manifest claim commands (pass); `npm test` (6 Vitest + 20 Rust pass); `npm run build` (produces both `dist` targets); `npm run test:e2e` (36 pass); and `npm audit --audit-level=high` (zero vulnerabilities).

### Next step

Repair every finding in `.factory/review-1.md`, register/prove all public claims, then repeat the full independent review. Do not call the product accepted until the verdict has zero findings.

# Prior verification handoff — Local Data Finder v0.1.8

## Independent verification 6 — PASS

Candidate `e98c7db494a2559531b9a43161e4dbc902e3af4c` at `https://local-data-finder.sociobot.in/` **PASSed** independent QA on 1 September 2026 UTC. The full detail is in `.factory/verification-6.md`.

- All 22 declared claims pass; the complete local suite passes: `npm run check`, `npm test` (6 Vitest + 20 Rust), `npm run build`, and `npm run test:e2e` (36/36).
- The live static artifacts match the candidate build. The public `v0.1.8` release has macOS, Windows, and Linux artifacts plus valid checksums; freshly downloaded Windows MSI and Linux AppImage both matched `SHA256SUMS`.
- Live browser checks found no console/page errors, no serious/critical axe results, a visible keyboard focus ring, correct 390 px layout, demo reset/recovery behavior, local-only demo data flow, security headers, and immutable caching of hashed assets.
- This remains a fully enabled free v0.1 release because a working registered Sociobot checkout is unavailable. The truthful scope decision is recorded in `.factory/monetization.md`; do not advertise a price until the paid-unlock contract is implemented.

Known operator follow-up: macOS and Windows packages are intentionally unsigned. Signing requires owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` before a signed release can be produced.

# Repair handoff — Local Data Finder v0.1.8

## Outcome

This repair addresses the independent verifier report at `30abfc6e9d73692ad3d306ddaacba6f6eb79e115` for candidate `1eff0287b773810e2c80fe56a4c5f5b955bd3f3f`.

- A focused result opened its source **twice** before the repair: the recorded Tauri bridge observed `open_source calls after one Enter: 2`. Native button activation already emits one click, so the duplicate document-level Enter path was removed. `tests/app.spec.ts` now invokes Enter on a real result button and asserts exactly one bridge call.
- All reported desktop mobile targets are now at least 44×44 CSS pixels: Skip to search, Reset demo, Start for real, Remove source, and parser-error reasons. The new 390 px test measures both the banner controls and the opened source drawer.
- `.factory/monetization.md` records the explicit v0.1 scope decision: the fully enabled app is free because no working Sociobot checkout is available. No unavailable purchase, price, license restore, or payment integration is exposed. The existing `@claim:free-download` test now checks this decision, the landing/README copy, and shipped code for payment integration.
- The site has no 320 px horizontal overflow. It now ships a dedicated inspected 1200×630 social preview (`public/assets/local-data-finder-social.jpg`) and a real 180×180 Apple touch icon (`public/apple-touch-icon.png`). Every public route has canonical, Open Graph, Twitter, favicon/touch metadata, matching primary navigation, and a version/build footer.
- Version metadata was raised consistently to `0.1.8` in npm, Cargo, Tauri, and the static build footer.

## Verification

Run from a clean checkout after installing the documented Ubuntu Tauri prerequisites:

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Evidence recorded during this repair:

- `npm ci` completed cleanly; `npm run lint`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm audit --audit-level=high` pass. The full suite has 6 Vitest, 20 Rust, and 36 Playwright tests.
- Every one of the 22 exact commands in `.factory/claims.json` was rerun and passed. This includes the isolated demo, offline reload in a dedicated context, local-only source handling, parsing limits, encryption/session behavior, CSV export, OS source opening, and the retrieval benchmark.
- The added regressions pass at desktop and 390 px: Enter triggers one source open, all reported app controls measure at least 44 px, secondary metadata/footer identity exist, and `/` plus `/404.html` have no 320 px overflow.
- `VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh http://127.0.0.1:4180/ .factory/qa-artifacts/repair-4` passed against `dist/site`: HTTP 200, no console/page errors, title/lang/one-h1/main/alt checks passed. See `.factory/qa-artifacts/repair-4/verify.json` and screenshots.
- Playwright Axe found zero serious or critical violations at 1440 px and 390 px for `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`. The standalone Axe CLI was also attempted, but its ChromeDriver 152 cannot launch the supplied Chromium 145; the pinned Playwright Axe integration is the working equivalent.
- Mobile Lighthouse on the production build: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.1 s, CLS 0, total blocking time 60 ms. Raw report: `.factory/qa-artifacts/repair-4/lighthouse.json`.
- The social image is 1200×630 (102 KB) and Apple touch icon 180×180 (8.6 KB), checked with ImageMagick.

## Release and deployment

Desktop packages were built by GitHub Actions run [33565708148](https://github.com/B-Divyesh/sf-local-data-finder/actions/runs/33565708148) from tag `v0.1.8` at `61db921a4d8798c1384c46d4745cd6d5192c6eae`. The published [v0.1.8 release](https://github.com/B-Divyesh/sf-local-data-finder/releases/tag/v0.1.8) contains two unsigned macOS DMGs, Linux AppImage/DEB, Windows MSI/EXE, `SHA256SUMS`, and valid `latest.json` platform entries. A fresh public download of `Local.Data.Finder_0.1.8_amd64.AppImage` matched `SHA256SUMS` and stayed running normally under Xvfb for the 20-second startup smoke.

`dist/site` was deployed to the product-owned Static Web App `sf-local-data-finder`. Live `https://local-data-finder.sociobot.in/` serves `v0.1.8 · build 61db921`, the dedicated social image, and the Apple touch icon; a post-deploy `verify-url.sh` check returned HTTP 200 with no console/page errors.

## Known gaps / operator action

- macOS and Windows binaries remain intentionally unsigned. Signing needs owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; first-launch warnings remain on the site and in the README.
- A paid tier is deliberately unavailable in v0.1. Before a purchase is advertised, register the product through Sociobot billing and implement the paid-unlock contract described in `.factory/monetization.md`.
