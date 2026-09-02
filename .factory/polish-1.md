# Polish 1 — review finding closure

**Repair commit:** `18ccae6dcbef4e94fa92dc0fec94b2c9652f28c1`  
**Deployed URL:** `https://local-data-finder.sociobot.in/`  
**Checked:** 2 September 2026 UTC

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Added a shared route enhancer. Same-site document navigation and Back focus the new `h1` and populate a polite route announcement. Every static route now has a focusable `h1` and live region. | `tests/site.spec.ts` route-navigation regression passes in desktop and mobile. Cold live check: Demo heading focused and announcement was `Demo — Local Data Finder`. |
| F-1-2 | Replaced the false exit-cleanup copy. All reader copy now says **Start for real** removes the desktop demo index and sample files. | `@claim:desktop-demo-isolation`; README and `.factory/demo.md`; live demo banner at `/?demo=1`. |
| F-1-3 | Registered `source-trail-per-result` and added a multi-record fixture that checks each result and CSV row has one record path and extraction time. | `cargo test --manifest-path src-tauri/Cargo.toml claim_source_trail_per_result_has_one_path_and_time`. |
| F-1-4 | Registered `platform-download-selection`; moved asset matching into a tested selector covering Intel macOS, Apple silicon, Windows, and Linux fixture assets. | `npm run test:web -- --testNamePattern @claim:platform-download-selection`. |
| F-1-5 | Registered `normal-index-storage`; added an interrupted temporary-write fixture and atomic replacement check in a temporary app-data folder. | `cargo test --manifest-path src-tauri/Cargo.toml claim_normal_index_storage_survives_interrupted_replace`. |
| F-1-6 | Registered `encryption-algorithm` with a persisted-envelope fixture. Removed cipher and key-derivation jargon from reader-facing README copy. | `cargo test --manifest-path src-tauri/Cargo.toml claim_encryption_algorithm_uses_argon2_and_chacha20poly1305`. |
| F-1-7 | Registered `selected-sources-only`; added selected-folder versus sibling-folder proof. First-screen and README wording now consistently says “sources you choose.” | `cargo test --manifest-path src-tauri/Cargo.toml claim_selected_sources_only_excludes_sibling_content`. |
| F-1-8 | Split the README opening into separate sentences for source choice, local search, and result metadata. | `.factory/copy-audit.md`; no reader-facing sentence exceeds 22 words. |
| F-1-9 | Replaced “Build a local evidence map,” “Prefer a terminal?”, and generic Copy labels with direct operation and command labels. | Live home page; `.factory/copy-audit.md`; screenshot `.factory/qa-artifacts/polish-1-live/demo-query-desktop.png`. |
| F-1-10 | Replaced SDK/API, atomic-file, cipher, and KDF terminology in reader-facing privacy copy with what happens to the archive. | Live `/privacy/`, README, and `.factory/copy-audit.md`. |

## Required demo and live evidence

- `/?demo=1` redirects directly to `/demo/?demo=1`, showing the persistent demo banner plus **Reset demo** and **Start for real**. Cold live result: no console errors.
- Screenshots: `.factory/qa-artifacts/polish-1-live/demo-query-desktop.png` and `.factory/qa-artifacts/polish-1-live/demo-query-mobile.png`.
- `/opt/fleet/lib/verify-url.sh https://local-data-finder.sociobot.in/ .factory/qa-artifacts/polish-1-live` passed: 870 ms load, title/lang/h1/main/alt/button checks, and zero console/page errors.
- Cold 390 px live Axe checks found zero serious or critical violations on `/`, `/?demo=1`, `/privacy/`, `/terms/`, and a real 404. Each had `scrollWidth: 390`; `/not-a-page` returned 404.

## Claim and suite evidence

The clean clone at `/tmp/local-data-finder-clean-t3C7H3` was created from pushed commit `18ccae6`, then ran `npm ci` and every exact command in the 27-entry `.factory/claims.json` manifest. All commands passed after the documented Tauri prerequisites were installed. The same commit also passed:

- `npm test` — 7 Vitest and 24 Rust tests.
- `npm run check` — TypeScript and Cargo checks.
- `npm run build` and `npm run build:site` — produced `dist/app` and `dist/site`.
- `npm run test:e2e` — 40 desktop/mobile Playwright tests, including Axe and offline demo coverage.
- `npm audit --audit-level=high` — zero vulnerabilities.
