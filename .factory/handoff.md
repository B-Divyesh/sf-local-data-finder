# Local Data Finder v0.1.2 handoff

## What was built

- A Tauri 2 desktop app with an evidence-first, responsive UI for macOS, Windows, and Linux.
- Explicit folder and export selection for Markdown, plain text, HTML, mbox, and text-based PDF files.
- On-device lexical search with type/source filters, ranked snippets, extraction timestamps, original paths, and OS-native source opening.
- Refresh and source removal flows; removing an index source never modifies the original.
- Separate-process PDF parsing with a 25 MB input ceiling and 12-second timeout. Mail attachments are not interpreted.
- Optional ChaCha20-Poly1305 index encryption with an Argon2-derived key and session-only password.
- Dark and light luminous-glass visual treatments, full 390 px layout, keyboard navigation, visible focus, reduced-motion behavior, and first-class empty/error/locked states.
- A static OS-detecting install site in `dist/site`, legal pages, a privacy statement, one-time US$39 Archive key checkout/restore/verification, checksum-verifying shell/PowerShell installers, and offline shell caching.
- A tag-triggered GitHub Actions matrix for Apple silicon/Intel macOS DMGs, Windows MSI/NSIS, and Linux AppImage/DEB, followed by `SHA256SUMS`, `latest.json`, and a GitHub Release.
- Original generated archive artwork plus hand-authored SVG product mark; provenance and full prompt are in `.factory/design.md`.

## Run and verify

```sh
npm ci
npm test
npm run check
npm run build
npm run test:e2e
```

Exact deploy command: `npm run build:site`. Static output: `dist/site/index.html`.

Verified locally on 28 August 2026:

- `npm test`: 4/4 Vitest tests and 4/4 Rust tests pass.
- `npm run check`: TypeScript and Rust checks pass.
- `npm run build`: app and site production builds pass.
- Playwright 1.58.2: 6/6 desktop and 390 px checks pass, including legal routes, purchase return handling, keyboard skip navigation, console monitoring, and axe.
- Axe: zero serious or critical violations on both the landing site and desktop UI (390 px smoke test).
- npm production/development dependency audit: zero known vulnerabilities.
- Lighthouse mobile: Performance 97, Accessibility 100, Best Practices 96, SEO 92; LCP 2.3 s, CLS 0, total blocking time 0 ms, speed index 2.0 s.
- Static budgets: landing JavaScript 2.96 KB raw, CSS 10.57 KB raw; desktop UI JavaScript 17.47 KB raw, CSS 13.27 KB raw; hero WebP 21.98 KB mobile / 50.53 KB desktop. No runtime font files or third-party scripts.

## Release

- Source branch `main` and annotated tag `v0.1.2` were pushed to `B-Divyesh/sf-local-data-finder`. Earlier dry release runs caught and prevented mismatched Tauri package minors and an implicit Linux icon-discovery issue; v0.1.2 contains the aligned package set and explicit bundle icons.
- Workflow run: pending insertion after the v0.1.2 tag is pushed.
- Release asset/checksum status: pending at the time this handoff section was drafted; update before final delivery.

## Known limits

- PDFs must already contain text; OCR is intentionally not bundled. The UI reports scanned/empty PDFs as skipped.
- HTML extraction is intentionally conservative and does not execute scripts or recover every visual layout.
- The index is a compact local JSON corpus searched in memory. This keeps v1 inspectable and dependency-light but a later version should move very large (multi-gigabyte) corpora to SQLite FTS.
- The 50-query, 80%-recall success benchmark requires a representative user archive and was not fabricated in this clean repository.

## Needs operator action

- Register the paid product with the factory billing tool and confirm the production return URL for `local-data-finder`; no product ID is hardcoded.
- Deploy `dist/site` through factory infrastructure. No DNS or billing infrastructure was changed here.
- v0.1.0 artifacts are intentionally unsigned. For a signed release, add macOS certificate/notarization secrets (`APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`) and a Windows Authenticode certificate (`WINDOWS_CERT_PFX`, `WINDOWS_CERT_PASSWORD`), then extend the workflow's import/signing steps.
