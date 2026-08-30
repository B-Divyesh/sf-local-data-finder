# Verification handoff — FAIL

Independent QA of candidate `0fc66f02ac7605f4a968accb94e5747d9d3b0565` at `https://local-data-finder.sociobot.in` completed on 30 August 2026.

## Verdict

**FAIL — do not promote.** Full evidence is in [verification-2.md](verification-2.md).

Release blockers:

- The claims manifest omits many public promises, and its five-format and CSV tests do not exercise the observable promises through the demo/product.
- A valid 511 KB text PDF extracts in 0.23 seconds directly but times out after 12 seconds in the app because piped parser output is not drained before child exit.
- The default System theme on a light OS renders essential top-bar/source-rail text at approximately 1.05:1–2.71:1 contrast.
- Fresh real mode and **Start for real** still show the demo-only banner, falsely saying sample data is active and nothing is saved.
- At 390 px the off-screen source drawer remains focusable and exposed to assistive technology, with no focus transfer/restoration, expanded state, Escape behavior, or focus containment.

## What passed

- Cold first read and one-click `/demo/` action.
- All exact `.factory/claims.json` commands after documented installation.
- `npm run lint`, `npm run check`, `npm test`, `npm run build`, `npm run test:e2e` (14/14), and `npm audit` (0 vulnerabilities).
- Live privacy request audit, security headers, offline reload, link/404 checks, desktop/390 px site rendering, reduced motion, and axe serious/critical checks.
- Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.9 s, CLS 0.
- Published Linux AppImage checksum/install/run, sample search, real five-format fixture indexing, exact source trails, error recovery, CSV export, source removal safety, and encrypted persistence/unlock on ordinary fixtures.
- Fresh candidate site build hashes match the deployed site. Published v0.1.5 desktop runtime source matches the candidate; the intervening non-document change is only Cargo lockfile package-version metadata.

## Re-run

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit
```

Then run every exact command in `.factory/claims.json`, exercise the release package with an isolated application-data directory, and repeat the valid text-rich PDF fixture test. No product source was changed during verification.
