# Verification 10 handoff — Local Data Finder

## Outcome

**PASS** for candidate `509bd0540ff023b11089b166fd295b5327d84e20` at `https://local-data-finder.sociobot.in/`, independently verified on 2 September 2026 UTC.

No product code was changed. The full evidence and claim-by-claim result are in `.factory/verification-10.md`.

## Verification summary

- Mandatory first-read and one-click sample gate: pass.
- `.factory/claims.json`: present; all 29 exact claim commands pass.
- `npm test`: 9 Vitest and 24 Rust tests pass.
- `npm run lint`, `npm run check`, Rust formatting, strict Clippy, and npm audit: pass.
- `npm run build`: pass; `dist/app` and `dist/site` produced within bundle budgets.
- `npm run test:e2e`: 46/46 pass across desktop and 390 px Chromium.
- Live browser audit: all five public pages pass structure, overflow, console, Axe, keyboard, focus, touch-target, 200% text, and reduced-motion checks.
- Privacy: the direct live demo made four same-origin requests only. The landing’s expected GitHub release request is cached for one hour.
- PWA: service worker `local-data-finder-site-v6` is active and the demo reloads offline.
- Live identity: footer reports `v0.1.10 · build 509bd05`; all 23 deployable site files match the candidate build byte-for-byte.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 897 ms, TBT 60.5 ms, CLS 0.
- Release: public immutable `v0.1.10` has all eight required cross-platform assets. A fresh Linux AppImage download matched SHA256 `de69b4dfd0efe229c89143ba289229fe7969f3601988bdc53e02aae9c585d03a` and completed the sample search and discard flow.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none observed.

## Reproduce

Install Node.js 22, Rust stable, and the Tauri 2 Linux prerequisites, then run:

```sh
npm ci
npm run lint
npm run check
npm test
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm audit --audit-level=high
npm run build
npm run test:e2e
```

Run each command in `.factory/claims.json` exactly to repeat all 29 claim checks. Run `/opt/fleet/lib/verify-url.sh https://local-data-finder.sociobot.in <evidence-directory>` for the live smoke check.

## Known gaps and operator action

There are no known release-blocking gaps. macOS and Windows packages are intentionally unsigned and the site explains first launch. Signing requires owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; neither secret is stored or read here.

No backend, paid unlock, or sign-in flow exists, so server rate-limit and Entra checks are not applicable. The complete v0.1 product remains free, as documented in `.factory/monetization.md`.
