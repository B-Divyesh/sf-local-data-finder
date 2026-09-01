# Verification handoff — Local Data Finder

## Status

**FAIL** for candidate `ad39f28c892571f9446dfc952f118b3b7aca4898` at `https://local-data-finder.sociobot.in`, independently verified 1 September 2026 UTC.

The candidate repository gates pass and the live static site exactly matches the candidate build. The live desktop download does not: it remains v0.1.5 from commit `ebb45743bf45e4086db7d14946c384e30dc3947a`, before the candidate's core and desktop repairs.

## Release blockers

1. Publish new macOS, Windows, and Linux assets from the accepted candidate. The current v0.1.5 AppImage still shows the demo banner in real mode and retains the broken System/light chrome; the tag also predates the PDF pipe, mobile drawer, and encryption-label repairs.
2. Fix the browser demo's hidden result. A non-match sets `hidden` on `#sample-result`, but `.demo-result { display: grid }` keeps it visible while the status says no result matched. Strengthen `@claim:demo-sandbox` to assert the result actually disappears.
3. Give `/demo/` the required persistent demo banner and functional **Start for real** path.
4. Complete `.factory/claims.json` for every published claim and make the desktop demo claim exercise isolated desktop storage and cleanup. Complete `.factory/copy-audit.md`; it currently lists only five landing sentences.
5. Bring the demo input, skip link, and narrow text links to 44×44 CSS pixels and add the required three-to-five-frame captioned desktop walkthrough.

## Verification completed

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

- Every one of the 13 exact `.factory/claims.json` commands passes after the documented Tauri Linux prerequisites are installed.
- Full results: 4 Vitest tests, 16 Rust tests, and 22 Playwright checks pass.
- Production build outputs `dist/app` and `dist/site` within all JS/CSS/image budgets.
- All 18 served static files match the fresh candidate build byte-for-byte.
- Live desktop/390 px, keyboard focus, reduced motion, axe, request log, security headers, caching, service-worker update/offline reload, links, and invalid demo inputs were checked.
- Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.0 s, TBT 40 ms, CLS 0.
- The v0.1.5 Linux AppImage checksum matches and it launches, but it is the wrong commit.

Full evidence and severity details are in `.factory/verification-3.md`.

## Applicability

There is no product backend, paid-unlock request, or sign-in flow. API request allowance/429 and Entra checks do not apply. No out-of-scope service, setting, secret, database, or infrastructure resource was read or changed.

## Operator action after fixes

- Tag the repaired commit with a new version to trigger `.github/workflows/release.yml`.
- Confirm every platform asset, `SHA256SUMS`, and `latest.json` belongs to that tag before updating the site's detected-platform download.
- macOS and Windows packages remain unsigned until the operator supplies the signing certificates documented by the release process.
