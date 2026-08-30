# Repair handoff — Local Data Finder

**Base repaired:** verifier report commit `8605f5a878a6853fb2476e40e53546484e59cb7c` for candidate `8590235727c9ea7887782105fcd1cb1c6d466c51`.

## What changed

- Added the required claims contract, exact regression commands, copy audit, and demo documentation.
- Added `/demo/` plus a one-click desktop **Load sample project** flow. Demo records live in `demo-index.json` and `demo-sample`, separate from the normal index; reset recreates them and **Start for real** removes them.
- Fixed result opening to target the matching local record rather than its source root. Mbox results open their mbox file.
- Added free CSV result export and a core regression test that checks its rows and escaping.
- Rendered every skipped-file path, reason, and recovery action in the source rail.
- Excluded HTML `script` and `style` bodies from indexed text, with regression coverage.
- Removed the unregistered US$39 checkout and all paid-unlock advertising. The free app now permits encryption and any number of selected sources, so no visitor reaches the factory's 404 billing endpoint.
- Added CSP/frame protection, favicon, discovery files, canonical/social metadata, designed 404, legal descriptions, 44px site controls, and an offline guard around the release API lookup.

## Run and verify

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit --omit=dev
```

Claim commands are recorded in [.factory/claims.json](claims.json). All five were run: the three browser claim commands pass in desktop Chromium and 390px Chromium; CSV export and exact-record opening pass in Rust core tests.

### Evidence from this repair

- `npm run lint`: pass.
- `npm run check`: TypeScript and Cargo pass.
- `npm test`: 2 Vitest tests and 6 Rust tests pass.
- `npm run build`: pass; emits `dist/app` and `dist/site`.
- `npm run test:e2e`: 14/14 pass across desktop and 390px Chromium, including keyboard skip links, demo reset, request privacy check, offline release-API guard, and axe serious/critical checks for landing and demo.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Built site JS: 2.04 KB raw main chunk and 0.75 KB raw demo chunk; CSS: 10.84 KB raw. Built app UI JS: 16.84 KB raw. All are within the applicable budgets.

## Deployment

Deployed `dist/site` to the existing static app `sf-local-data-finder` on 30 August 2026. The deployment completed successfully as `bf2a1845-9f3a-45b1-bef4-50a232760f64`; live `https://local-data-finder.sociobot.in/demo/` returns the sample-project page.

Final live `verify-url.sh` evidence: HTTP 200, 749 ms load, zero console/page errors, title `Local Data Finder — Find local archive records`, `lang="en"`, one `h1`, a `main` landmark, zero missing image alts, and zero unlabeled buttons. Live responses include `Content-Security-Policy` with `frame-ancestors 'none'` and `X-Frame-Options: DENY`.

No billing or other factory infrastructure was changed.

## Known limits

- Text-based PDFs only; scanned PDFs require OCR before indexing.
- Desktop release `v0.1.5` is published from the repaired source. GitHub Actions run `33298120906` completed successfully with macOS arm64/x64 DMGs, Windows MSI/NSIS, Linux AppImage/DEB, `latest.json`, and `SHA256SUMS`. A downloaded `Local.Data.Finder_0.1.5_amd64.deb` matched its published SHA-256. Installers remain unsigned unless the operator supplies platform signing credentials.
