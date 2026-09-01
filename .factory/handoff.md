# Independent verification handoff — Local Data Finder

## Status

**FAIL** for candidate `1eff0287b773810e2c80fe56a4c5f5b955bd3f3f` at `https://local-data-finder.sociobot.in`, checked 1 September 2026 UTC.

The live static site and v0.1.7 release match the candidate product files. All 22 declared claim checks, repository gates, offline checks, serious/critical axe checks, and performance budgets pass. Acceptance is blocked by desktop keyboard and target-size findings, plus an undocumented change from the brief's one-time purchase model to a free download.

## Release-blocking findings

1. Pressing Enter once on a focused desktop search result calls `open_source` twice. The native button click and document `keydown` path both run. A mouse click calls it once.
2. At 390×844, desktop targets measure below 44 px: Skip to search 145×43, Reset demo 99×32, Start for real 105×32, Remove source 42×42, and the parser-error summary 258×30.
3. The researched brief specifies one-time monetization. The product states that it is free and contains no purchase or license path, with no approved scope change recorded.

Minor site findings: 18 px horizontal overflow at 320 px, no dedicated 1200×630 social image, SVG rather than 180 px apple-touch icon, no footer build/version, and reduced header/social metadata consistency on secondary routes.

Full evidence and check results are in `.factory/verification-5.md`. Relevant screenshots are under `.factory/qa-artifacts/`.

## Passing evidence

- Every exact `.factory/claims.json` command passed after `npm ci` and the documented Ubuntu Tauri prerequisites: 22/22 claims.
- `npm run lint`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e`, and `npm audit --audit-level=high` pass.
- Test totals: 6 Vitest, 20 Rust, and 28 Playwright checks.
- Build output exists in `dist/app` and `dist/site`; JS, CSS, image, LCP, CLS, and responsiveness budgets pass.
- Mobile Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 950 ms, CLS 0, total blocking time 74 ms.
- The live first screen plainly states the job, audience, and one-click sample action.
- Live home, demo, privacy, terms, and 404 have zero serious/critical axe findings at desktop and 390 px.
- The browser demo handles normal, empty, unmatched, markup-shaped, and long input; Reset and Start for real recover correctly.
- The service worker updates and reloads the demo offline.
- Recorded demo traffic is same-origin. Landing traffic adds only the documented GitHub Releases API. Security and caching headers are present.
- All 20 generated public files match the live site byte-for-byte.
- The v0.1.7 AppImage launches, loads the sample, searches, shows source paths/timestamps, handles no results, and removes demo artifacts on Start for real.
- The AppImage checksum matches published `SHA256SUMS`; all macOS, Linux, and Windows release entries are present.

## Reproduce

Install the Linux prerequisites from the README, then run:

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Run every `test` value in `.factory/claims.json` exactly as written. Serve `dist/site` for browser checks and `dist/app` with a recorded Tauri bridge for desktop viewport/keyboard checks. For final acceptance, repeat the flow in a fresh published package rather than relying only on browser mocks.

## Next steps

- Ensure Enter reaches one source-open path only and add an observable keyboard regression.
- Set all interactive desktop targets to at least 44×44 CSS pixels and add checks for the demo banner, skip link, source removal, and parser details at 390 px.
- Resolve the monetization mismatch with an approved scope decision or the required one-time purchase flow.
- Complete the minor site-structure corrections, then rerun verification.

## Operator note

macOS and Windows packages are intentionally unsigned. Signing still requires owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; the site and README disclose the first-launch warnings.
