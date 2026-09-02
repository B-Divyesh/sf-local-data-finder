# Polish 2 — zero-finding closure

**Repair commit:** `8f520fdb837bc13e9d44af99df904d402dccb1d9`  
**Deployed URL:** `https://local-data-finder.sociobot.in/`  
**Checked:** 2 September 2026 UTC

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Renamed the footer link on every public route to `Source on GitHub (external)`, retaining the same GitHub destination. | `tests/site.spec.ts` “public footers identify…” checks its accessible name on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`; 44/44 Playwright pass. |
| F-2-2 | Removed the public Azure AI Foundry provenance sentence. The required generation provenance remains in `.factory/design.md`; it is no longer an unsupported visitor-facing product claim. | The same Playwright regression asserts no footer contains `Azure AI Foundry`; local generated page capture is `.factory/qa-artifacts/polish-2-local/index.html`. |
| F-2-3 | Replaced the vague heading with `Install with a verified command` and added `Each installer checks its SHA256 before it installs the app.` | `@claim:published-checksums` passes from the clean clone; the page regression asserts both strings; `.factory/qa-artifacts/polish-2-local/index.html`. |

## Earlier review findings rechecked

| Finding | Current evidence |
| --- | --- |
| F-1-1 | Route focus/announcement and Back are covered by `tests/site.spec.ts` and pass in desktop/mobile Chromium. |
| F-1-2 | README/demo wording promises desktop cleanup only through **Start for real**; `@claim:desktop-demo-isolation` passes. |
| F-1-3 | `@claim:source-trail-per-result` passes. |
| F-1-4 | `@claim:platform-download-selection` passes. |
| F-1-5 | `@claim:normal-index-storage` passes. |
| F-1-6 | `@claim:encryption-algorithm` passes; reader copy retains no cipher/KDF jargon. |
| F-1-7 | `@claim:selected-sources-only` passes. |
| F-1-8 | `.factory/copy-audit.md` records no landing sentence over 22 words. |
| F-1-9 | Direct source, terminal, and copy-command wording remains in the audit and passing page test. |
| F-1-10 | Landing and README retain outcome-based privacy copy; website and desktop-local-processing claims pass. |

## Verification

- Fresh clone `/tmp/local-data-finder-polish2-mqdKZR/repo` at `8f520fd`: `npm ci` succeeded and all 27 exact claim commands in `.factory/claims.json` passed. Its complete suite then passed using the same compact shared Cargo target: `npm run check`, `npm test` (7 Vitest, 24 Rust), `npm run build`, `npm run test:e2e` (44/44 desktop/mobile), and `npm audit --audit-level=high`.
- The repair worktree also passed `npm run lint`, `cargo fmt --check`, and strict `cargo clippy --all-targets -- -D warnings`.
- Playwright’s Axe integration covers the landing and demo at both viewports with zero serious/critical violations. It also covers demo storage isolation, same-origin privacy requests, service-worker offline reload in a fresh context, keyboard focus, and 44 px touch targets.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4180/ .factory/qa-artifacts/polish-2-local` passed in 652 ms: correct title/language/one h1/main/alt/button checks and no console/page errors.

## Deployment and cold live recheck

`dist/site` from the repair record was deployed only to the product-owned `sf-local-data-finder` Static Web App in resource group `sociobot`. Azure deployment `75cf1e3e-561b-44f3-903c-2aa358bb565d` succeeded. A cold response from the custom domain returned build `e66a768`, HTTP 200, the expected CSP/security headers, and no console/page errors.

- `/opt/fleet/lib/verify-url.sh https://local-data-finder.sociobot.in/ .factory/qa-artifacts/polish-2-live` passed in 838 ms. Its `verify.json` records the expected title, `lang`, one h1, main landmark, alt text, labelled buttons, and no errors.
- The live recheck opened `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` in 1366 px and 390 px Chromium. Every route had one h1, no horizontal overflow, zero serious/critical Axe violations, the external GitHub label, and no Azure provenance copy.
- Live header navigation focused the destination h1 and announced `Demo — Local Data Finder`. The direct demo showed its persistent isolation banner; **Reset demo** restored `MAPLE-742`. `/not-a-page` returned HTTP 404.

## Round-2 retry evidence

**Verification commit:** `daa885d831843995adf111b73a5175f9d641bea8`
**Clean checkout:** `/tmp/local-data-finder-round2-clean-8rIFlD/repo`

The current disk-guard environment completed a fresh-clone retest after installing the Ubuntu Tauri packages documented in `README.md`. `npm ci` reported zero vulnerabilities. All 27 exact commands listed in `.factory/claims.json` passed, including the direct `?demo=1` sample path, demo reset and isolation, same-origin privacy requests, offline reload in a dedicated context, source-trail coverage, selected-source boundaries, encryption, CSV export, and release-platform selection.

The same clean checkout passed `npm run lint`, `npm run check`, `npm test` (7 Vitest and 24 Rust tests), `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `npm run build`, `npm run test:e2e` (44/44 desktop and mobile Chromium tests), and `npm audit --audit-level=high`. The fresh static build passed `verify-url.sh` locally with title, language, one h1, main landmark, alt text, labelled buttons, and zero console/page errors. Playwright's pinned Axe coverage passed in the 44-test browser suite; the standalone Axe CLI could not launch its unavailable Chrome binary in this image.

**Final deployment:** Azure Static Web Apps deployment `769a7a13-de92-4b98-902f-76deee328f25` deployed the rebuilt `7071141` shell only to `sf-local-data-finder`. A cold `verify-url.sh` check of `https://local-data-finder.sociobot.in/` passed in 1,053 ms with no console or page errors; capture and JSON evidence are in `.factory/qa-artifacts/round2-live-final/`. The live footer reports `build 7071141`, retains `Source on GitHub (external)`, and contains no `Azure AI Foundry` copy. Live Chromium checks at 1366 px and 390 px covered `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, `/404.html`, and `/not-a-page`; each had one h1, no overflow, and zero serious/critical Axe violations. The missing route returned HTTP 404.

## Retry 2 final evidence

**Runtime source:** `f458a63675e0af59692355273a44d1858ba3a7db`
**Fresh clone:** `/tmp/local-data-finder-retry2-clean-JwDRGM/repo`

The fresh clone installed with `npm ci` (zero vulnerabilities) after the README-listed Tauri packages were installed. A disk guard kept at least 3.5 GiB free during the Rust compilation. All 27 exact commands in `.factory/claims.json` passed. `npm test` passed (7 Vitest and 24 Rust tests), `npm run lint` passed, `npm run build` produced both `dist/app` and `dist/site`, `npm run test:e2e` passed all 44 desktop/mobile tests, and `npm audit --audit-level=high` reported zero vulnerabilities.

Deployment `0aadbbe3-3b9f-4180-834f-2da3a9044d06` published that clean-built static site only to `sf-local-data-finder`; the custom domain cold-loads build `f458a63`. `verify-url.sh` passed in 941 ms with no console or page errors; capture is `.factory/qa-artifacts/retry2-refresh-live/`. A live Chromium/Axe recheck covered `/`, `/demo/?demo=1`, `/privacy/`, `/terms/`, and `/404.html` at 1366 px and 390 px: every valid route had one h1, no horizontal overflow, and zero serious/critical violations. Header navigation focused the Demo h1 and announced `Demo — Local Data Finder`; `/not-a-page` returned HTTP 404. The public external-source label remains present, no page contains `Azure AI Foundry`, and the install section retains the SHA256 explanation.
