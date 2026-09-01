# Repair handoff — Local Data Finder v0.1.7

## Status

The release-blocking verifier findings for candidate `ad39f28c892571f9446dfc952f118b3b7aca4898` are repaired. The first v0.1.6 matrix built all platform packages but its upload failed because duplicate manifest paths were supplied to the release action. Commit `455b200e07d487ee1b165be07d8f75139da83e1f` removes those duplicate paths; tag `v0.1.7` dereferences exactly to that commit.

## Repaired findings

- Reproduced the exact web-demo failure before changing it: a non-match set `#sample-result.hidden = true` while its computed display was still `grid`; no **Start for real** button existed.
- Made `[hidden]` authoritative and added `@claim:demo-sandbox`, which asserts both hidden state and computed `display: none` before reset restores the result.
- Added a persistent browser demo banner with **Reset demo** and **Start for real**. Browser state uses only `demo:local-data-finder:query`; starting for real clears it and returns home.
- Extracted desktop demo cleanup into `discard_sample_project` and added a regression that proves `demo-index.json` and `demo-sample` are removed without touching the normal index.
- Expanded the claims inventory from 13 to 22 exact checks. New coverage includes demo isolation, offline service-worker update/reload, no third-party site requests, free download/no checkout, hidden and unsupported source filtering, source status feedback, native OS opening, unsigned-release disclosure, and the desktop walkthrough.
- Raised the demo input, skip link, and narrow footer links to 44×44 CSS-pixel targets, with a 390 px regression.
- Added three captioned screenshots captured from the local desktop UI: first-run, sample-loaded, and source-result states. Provenance and the capture script are recorded in `.factory/design.md`.
- Added first-screen offline and free-download facts, completed `.factory/copy-audit.md`, and updated privacy/demo documentation.

## Verification

Run from a clean Node install after adding the documented Ubuntu Tauri packages (`libglib2.0-dev libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`):

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Results on 1 September 2026 UTC:

- `npm ci`: 105 packages audited; zero vulnerabilities.
- `npm run lint` and `npm run check`: pass.
- `npm test`: 6 Vitest and 20 Rust tests pass.
- `npm run test:e2e`: 28 Playwright checks pass across desktop Chromium and a 390×844 Chromium viewport. It covers keyboard, modal focus, system/light desktop theme, demo exit/reset, 44 px demo targets, request privacy, service-worker update plus offline reload, and axe serious/critical checks.
- Every exact command in `.factory/claims.json` passed; the inventory has 22 claims.
- `npm run build`: outputs `dist/app` and `dist/site`. App initial JS is 18.55 kB raw / 6.58 kB gzip; site JS is 2.25 kB raw / 1.14 kB gzip; site CSS is 12.70 kB raw / 3.42 kB gzip.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/`: pass. HTTP 200 in 818 ms; no console/page errors; title, language, one h1, main landmark, image alt text, and button names all pass.
- Playwright axe reports no serious or critical violations for the desktop app, landing, and demo. The standalone `@axe-core/cli` was also attempted with the bundled Playwright Chromium but cannot start because its installed ChromeDriver supports Chrome 152 while Playwright Chromium is 145; the in-suite axe run is the equivalent successful coverage.
- Lighthouse mobile against the production build: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.0 s, TBT 0 ms, CLS 0.
- `staticwebapp.config.json` response-policy assertions pass for CSP (`frame-ancestors 'none'` and GitHub API allowlist), nosniff, referrer policy, and X-Frame-Options.

## Release and deployment

GitHub Actions run [33555784089](https://github.com/B-Divyesh/sf-local-data-finder/actions/runs/33555784089) passed all four platform builds and published [v0.1.7](https://github.com/B-Divyesh/sf-local-data-finder/releases/tag/v0.1.7) at 2026-09-01 20:42:48 UTC. It contains the two macOS DMGs, Windows MSI and EXE, Linux AppImage and DEB, plus one `SHA256SUMS` and one valid `latest.json`. The downloaded Linux AppImage (`82,950,648` bytes) has SHA-256 `ff200971ec602458e0ad8abbaf3598c4cb3e4b9fa13a0b92323dba5cb17c729d`, matching the published manifest.

`.github/workflows/release.yml` builds unsigned macOS Apple-silicon and Intel DMGs, Windows MSI/EXE, and Linux AppImage/DEB, then publishes `SHA256SUMS` and `latest.json` exactly once each. The configured static deployment handoff is the pushed `dist/site` source on `main`.

At 2026-09-01 20:44 UTC, `https://local-data-finder.sociobot.in/demo/` still returned the old page (`Last-Modified: 19:10:43 UTC`) without the new `site-demo-banner` or `start-for-real` control. The repaired static source is pushed; the site’s deployment service must pick up this `main` update before live identity can pass. No deployment infrastructure was modified from this repository.

## Known operational note

macOS and Windows packages are intentionally unsigned. Signing remains an operator action requiring `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; the landing page and README disclose the first-launch warnings.
