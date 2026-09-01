# Repair handoff — Local Data Finder

## Status

Repair complete for independent verification report `d11edcd202bd9cba6271a69f435146c860af36d9` against candidate `0fc66f02ac7605f4a968accb94e5747d9d3b0565`.

## What changed

- Reworked the claims contract in `.factory/claims.json`. It now has 13 executable checks for every material published statement: demo isolation, local processing, all five formats, CSV export, exact source paths, closed mail attachments, source removal, encrypted storage, session-only passwords, parser limits, the 50-query retrieval threshold, and published SHA256 checksums.
- Fixed the PDF worker deadlock. `run_child_with_timeout` now drains stdout and stderr concurrently while it waits, so a valid 511 KiB text-rich PDF payload does not fill a child pipe and reach the timeout. Two regressions cover a 318,930-byte child output and a valid 511 KiB PDF worker JSON payload.
- Corrected System-theme light chrome by using light `--chrome` and `--rail` tokens under the system light media query. The desktop app regression runs axe in System/light mode.
- Restored correct demo state communication: `[hidden]` now wins over the banner flex rule, and all demo transitions rerender the banner. Fresh real mode and **Start for real** no longer show sample-only controls.
- Made the 390 px sources drawer a real modal drawer: it is hidden and inert when closed; opening updates `aria-expanded`, moves focus to Close sources, provides `role="dialog"`/`aria-modal`, traps Tab focus, supports Escape/backdrop close, and restores focus to the trigger.
- Corrected the Settings encryption button to name the action it will take, and updated macOS download detection to prefer the native Apple-silicon asset for browsers that report `MacIntel`.
- Replaced static-demo “Open source” text with “Source trail” so a non-operable sample label is not presented as an action.

## Verification

Clean install and quality gates completed locally on 1 September 2026:

```sh
npm ci
npm run lint
npm run check
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Results:

- `npm ci`: 105 packages audited; 0 vulnerabilities.
- `npm run lint`: pass.
- `npm run check`: pass (TypeScript and Cargo).
- `npm test`: pass (4 Vitest tests; 16 Rust tests).
- `npm run build`: pass; produced `dist/app` and `dist/site`. App initial JS is 18.55 kB raw / 6.58 kB gzip; site JS is 2.18 kB raw / 1.11 kB gzip; site CSS is 10.87 kB raw / 3.07 kB gzip.
- `npm run test:e2e`: pass, 22 checks across desktop Chromium and a 390×844 mobile viewport. This includes axe serious/critical checks, System/light contrast regression, demo-state regression, modal-drawer keyboard/focus regression, reduced browser privacy checks, offline behavior, and legal-route keyboard navigation.
- Every exact command in `.factory/claims.json`: pass.
- `npm audit --audit-level=high`: 0 vulnerabilities.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ <temporary-evidence-dir>`: pass; HTTP 200 in 609 ms, no console/page errors, title/lang/one h1/main present, zero images without alt text, and zero unlabeled buttons.

The standalone `@axe-core/cli` command could not run because its Selenium launcher cannot locate a system Chrome binary in this container. Equivalent axe coverage uses the preinstalled Playwright Chromium and passed in the 22-check browser suite.

## Run and deploy

```sh
npm ci
npm run build
npm run test:e2e
```

This remains a Tauri 2 desktop application with a static site in `dist/site`. The repository release workflow remains responsible for macOS, Windows, and Linux release artifacts.

Repair commit `61f5758` was pushed to `main`. The scoped live URL was checked after the push; it still served the 30 August artifact (`Last-Modified: Sun, 30 Aug 2026 07:11:56 GMT`) and the former `Open source` sample label. This repository has no static-deployment workflow to invoke, so the factory static-deployment controller needs to publish the pushed `dist/site` artifact before live verification can be repeated.

## Known gaps / operator action

- This worker does not create release tags or platform binaries; GitHub Actions builds unsigned desktop artifacts from tags as documented in `.github/workflows/release.yml`.
- No signing certificates are configured. macOS and Windows packages remain unsigned as disclosed on the landing page.
- Static deployment is pending the factory controller; it was not live during the post-push monitor window.
