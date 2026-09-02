# Repair 6 handoff — Local Data Finder

## Outcome

Repair commit `1eda3bea295ea72179a80b96f55ed9b2d1bf11d9` fixes every finding in `.factory/verification-9.md` for candidate `17178e68cfae38e4bf05e375d2b1a920338027f1`.

- GitHub release metadata now uses the product-namespaced `local-data-finder:github-release:v1` localStorage key. Only a validated tag, asset names, asset URLs, and timestamp are stored. Entries are reused while younger than one hour, removed at the one-hour boundary, and ignored if invalid. Offline visitors can use a valid cached release. Fetch or storage failure keeps the existing calm Releases fallback.
- `@claim:demo-sandbox` now occurs in exactly one test definition. A separate unit regression counts the definition.
- Every public footer now says: “The landing artwork was generated for this product.” The visitor-facing statement is registered as `generated-image-disclosure` in `.factory/claims.json` and tested on all five public pages.
- Site targets that sat exactly on the 44 px boundary now have a 46 px minimum. The 390 px regression requires a measured width and height of at least 45 px, leaving real layout margin for browser subpixel rounding.
- Service-worker cache `local-data-finder-site-v6` ensures the repaired shell replaces the earlier cached shell.

## Reproduction before repair

The original deployed candidate was loaded twice in one fresh Chromium context before source changes. It made two requests to `https://api.github.com/repos/B-Divyesh/sf-local-data-finder/releases/latest`; localStorage was `{}` after both loads. Source inspection also found two `@claim:demo-sandbox` test definitions and no public generated-image disclosure. The reported touch-target flake did not recur in 16 focused repetitions, consistent with the verifier's `43.99998474121094` subpixel-boundary diagnosis.

## Clean verification

The repair worktree passed all 29 exact commands in `.factory/claims.json`. A fresh clone at `/tmp/local-data-finder-repair6-clean-rQwua3/repo`, checked out at exact commit `1eda3be`, shared only the compiled Cargo target to stay within the worker disk guard and passed:

- `npm ci`: 104 packages, zero vulnerabilities.
- `npm run lint` and `npm run check`.
- `npm test`: 9 Vitest and 24 Rust tests.
- `cargo fmt --manifest-path src-tauri/Cargo.toml --check`.
- `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `npm run build`: produced `dist/app` and `dist/site`.
- `npm run test:e2e`: 46/46 desktop Chromium and 390 px Chromium cases.

Production sizes remain within budget: app JS 18.48 kB raw/6.55 kB gzip; site JS 3.30 kB raw/1.53 kB gzip plus the 1.81 kB route chunk; site CSS 13.03 kB raw/3.51 kB gzip; mobile hero 21,978 bytes.

The production site build passed `/opt/fleet/lib/verify-url.sh` locally in 771 ms with no console or page errors. Production-build browser checks found one h1, no overflow, and zero serious/critical Axe findings on `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html`. Two consecutive loads used one fixture API request and the same stored cache entry. The 390 px minimum measured target was 46 px, and the demo reloaded offline.

## Package and release

No desktop runtime or Tauri source changed, so the existing immutable v0.1.10 release remains the correct desktop package. GitHub release v0.1.10 is public and contains two macOS DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and `latest.json`. Its manifest records source commit `abcf708468919672817484ccf9ea1666e44845fe`.

The Linux AppImage was downloaded again from its versioned manifest URL. SHA256 `de69b4dfd0efe229c89143ba289229fe7969f3601988bdc53e02aae9c585d03a` matched both `latest.json` and `SHA256SUMS`. It remained running for the 20-second Xvfb smoke period with isolated XDG data, config, and cache directories.

## Deployment and live evidence

Azure Static Web Apps deployment `ea00e370-2b5c-458b-8d6c-5cf6b2465d7b` published `dist/site` from repair commit `1eda3be` only to the owned `sf-local-data-finder` resource in resource group `sociobot`. The custom domain is Ready and serves build `1eda3be` over HTTPS. No other product resource, service, app setting, storage, or secret was read or changed.

- All 23 public deployable files match local `dist/site` byte-for-byte. `/not-a-page` returns HTTP 404.
- `/opt/fleet/lib/verify-url.sh` passed live in 990 ms with no console or page errors. Evidence is in `.factory/qa-artifacts/repair-6-live/`.
- A fresh live Chromium context made exactly one GitHub API request across the first load and immediate reload. The cache entry existed after both loads and selected the real v0.1.10 Linux AppImage.
- Desktop and 390 px live checks covered all five public pages: one h1, no horizontal overflow, zero serious/critical Axe findings, disclosure present, and no console errors. Skip-link activation focused `main`; 200% zoom had no overflow; the smallest audited mobile target was 46 px.
- The browser demo made only same-origin requests. Service-worker cache `local-data-finder-site-v6` reloaded the demo offline.
- Live headers include HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, disabled camera/microphone/geolocation, and a matching CSP with `frame-ancestors 'none'`. HTML uses `max-age=30, must-revalidate`; hashed assets use one-year immutable caching.
- Live mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.5 s, LCP 1.6 s, TBT 30 ms, CLS 0. The raw report is `.factory/qa-artifacts/repair-6-live/lighthouse.json`.

## Run and verify

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

Run each command in `.factory/claims.json` exactly to repeat all 29 claim checks.

## Known gaps and operator action

There are no known release-blocking gaps. macOS and Windows packages remain intentionally unsigned. Signing requires owner-provided `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`; neither secret is present in or read by this repository.
