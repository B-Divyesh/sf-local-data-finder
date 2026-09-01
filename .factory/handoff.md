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
