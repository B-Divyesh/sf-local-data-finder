# Review 3 — Search selected local records

**Verdict: PASS**

Candidate `509bd0540ff023b11089b166fd295b5327d84e20` passes the researched brief and all supplied contracts at `https://local-data-finder.sociobot.in/`. There are zero findings at every severity and zero untested claims.

The implementation reviewed is `509bd0540ff023b11089b166fd295b5327d84e20`. The documentation baseline is `53305f0d3df69533442860eb162ded4949f1cb42`; its only changes from the implementation candidate are the prior verification report, handoff, and evidence. No product code was changed in this review.

## Finding count

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |
| Untested public claims | 0 |

## First screen

Fresh 1440×900 desktop and 390×844 phone contexts gave the same answer before scrolling:

- Job: **“Find facts in your local archive.”**
- Audience: **“For professionals with years of notes and exports…”**
- First action: **“Try it with sample data / Open the sample project.”**

The sample action ended at y=597 on desktop and y=599 on phone, inside both first viewports. The title is `Local Data Finder — Find local archive records`. Copy is direct, uses no metaphor headings, and the maintained copy audit has no sentence over 22 words or banned marketing term.

## Sample and recovery checks

The first action opened `/demo/?demo=1`. Desktop and phone both immediately showed the persistent **“Demo — sample data, nothing is saved with your archive”** label, **Reset demo**, **Start for real**, query `MAPLE-742`, and a realistic mbox result with matching text, record path, extraction label, and source trail.

- Normal: `MAPLE-742`, `Northwind`, and `original export` produced the expected populated state.
- Invalid: an absent query and whitespace hid the old result and announced usable search examples.
- Injection: markup-like input remained text and did not execute.
- Boundary: a 10,000-character query remained responsive, preserved the demo label, and showed no stale result.
- Recovery: **Reset demo** restored `MAPLE-742`, the result, and the polite status message.
- Exit: **Start for real** returned home and removed every `demo:` browser key.
- Privacy: a fresh direct demo search made four requests, all to the product origin. The normal landing request to the public GitHub release API is documented and cached for one hour.
- Offline: a dedicated fresh context cached `/demo/`, went offline, reloaded, and retained the demo heading and label.

The browser demo uses only `demo:local-data-finder:query`. The desktop isolation test additionally proves the normal index remains byte-for-byte unchanged while separate demo files are created and discarded.

## Claims

From detached clean checkout `53305f0d3df69533442860eb162ded4949f1cb42`, I installed the documented Node and Tauri Linux prerequisites, ran `npm ci`, and invoked every command in `.factory/claims.json` separately. All 29 passed. Each ID occurs in exactly one test definition.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `demo-sandbox` | Pass | Search, hidden non-match, and reset passed in desktop and phone projects. |
| `demo-browser-storage` | Pass | Separate demo key was removed by Start for real. |
| `desktop-demo-isolation` | Pass | Normal index was preserved; both demo artifacts were discarded. |
| `website-privacy` | Pass | Direct demo requests were same-origin only. |
| `offline-reload` | Pass | Dedicated contexts reloaded the sample offline. |
| `desktop-local-processing` | Pass | Core has no network client, LLM, or archive endpoint. |
| `free-download` | Pass | No checkout or license flow is presented. |
| `five-formats` | Pass | Markdown, text, HTML, mbox, and text PDF were parsed and searched. |
| `source-selection` | Pass | Hidden and unsupported files were skipped. |
| `selected-sources-only` | Pass | Sibling content outside the selected source was excluded. |
| `source-scope-feedback` | Pass | Counts, extraction time, and parser errors were reported. |
| `csv-export` | Pass | Public CSV output, header, quoting, and row count were verified. |
| `exact-source-open` | Pass | The matched record path, not its root, is opened. |
| `source-trail-per-result` | Pass | Every result/export row retained one path and extraction time. |
| `open-source-os` | Pass | The native operating-system opener is used. |
| `attachments-closed` | Pass | Encoded attachment content was not indexed. |
| `source-removal` | Pass | Index records were removed without changing originals. |
| `encrypted-index` | Pass | Stored text/path were opaque and a wrong password was rejected. |
| `encryption-algorithm` | Pass | Argon2 and ChaCha20-Poly1305 envelope behavior was verified. |
| `session-password` | Pass | A fresh session restored locked without the password. |
| `parser-limits` | Pass | The 25 MB rejection and 12-second worker timeout ran. |
| `normal-index-storage` | Pass | Interrupted replacement preserved the prior index. |
| `retrieval-benchmark` | Pass | At least 40 of 50 expected records were first results. |
| `published-checksums` | Pass | Manifest, checksums, immutable URLs, and installer comparisons passed. |
| `platform-download-selection` | Pass | macOS ARM/Intel, Windows, and Linux selection passed. |
| `unsigned-builds` | Pass | The site warning agrees with the unsigned workflow. |
| `desktop-walkthrough` | Pass | Three visible, captioned app screenshots passed at both viewports. |
| `release-metadata-cache` | Pass | Immediate reuse and the one-hour boundary passed. |
| `generated-image-disclosure` | Pass | Every public footer contains the plain disclosure. |

A manual inventory of the landing page, demo, legal pages, desktop copy, README, demo guide, and monetization decision found no substantive public promise outside this manifest.

## Clean quality gates

| Command | Result |
| --- | --- |
| `npm ci` | Pass; 104 packages, zero vulnerabilities. |
| `npm run lint` | Pass. |
| `npm run check` | Pass. |
| `npm test` | Pass; 9 Vitest and 24 Rust tests. |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | Pass. |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | Pass. |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities. |
| `npm run build` | Pass; produced `dist/app` and `dist/site`. |
| `npm run test:e2e` | Pass; 46/46 desktop and phone tests. |

Production output is within budget: app JS is 18.48 kB raw/6.55 kB gzip; site JS totals 6.12 kB raw; site CSS is 13.03 kB raw/3.51 kB gzip; the mobile hero is 21,978 bytes; no font is downloaded.

## Installed desktop product

The public Linux AppImage was downloaded into a clean consumer directory and run under Xvfb with isolated XDG data, config, and cache paths.

- Release `v0.1.10` is public, immutable, non-draft, and non-prerelease with all eight required assets.
- AppImage size: 83,057,144 bytes.
- SHA256: `de69b4dfd0efe229c89143ba289229fe7969f3601988bdc53e02aae9c585d03a`.
- The hash matches the GitHub asset digest, `SHA256SUMS`, and `latest.json`.
- **Load sample project** created `demo-index.json` and five source files: Markdown, HTML, text, mbox, and PDF.
- Searching `MAPLE-742` returned three matches with exact local paths and extraction times.
- **Start for real** removed `demo-index.json` and `demo-sample`, returned to the real empty state, and displayed a recovery message.

The release manifest records source `abcf708468919672817484ccf9ea1666e44845fe`. Its desktop runtime source is identical to candidate `509bd054…`; intervening changes affect site, tests, and documentation only. Screenshots are in `.factory/review-3-artifacts/app-*.png`.

## Live site, accessibility, and performance

- All 23 deployable candidate files match live responses byte-for-byte when built with candidate identity `509bd05`.
- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` return valid pages. `/not-a-review-route` returns the designed document with deliberate HTTP 404.
- Every route has its own title, `lang="en"`, one H1, one main landmark, complete image alternatives, consistent navigation/footer, and no horizontal overflow at 1440 or 390 px.
- Axe found zero serious or critical violations on every route at both viewport sizes. The full suite also covers dark/light desktop themes.
- Keyboard-only skip activation moves focus to `main`; route changes and Back focus and announce the new H1. The desktop drawer traps and restores focus, Escape works, and one Enter opens a result once.
- Every audited phone link, button, and input measured at least 44 px in both dimensions; the smallest audited height was 46 px.
- At 200% root text size, the landing retains its H1 and sample action without horizontal overflow.
- Reduced-motion mode reported no running animation.
- Security headers include HSTS, CSP with response-header `frame-ancestors 'none'`, `nosniff`, `DENY` framing, strict-origin referrer policy, and disabled camera/microphone/geolocation.
- `/opt/fleet/lib/verify-url.sh` passed with no console/page errors.
- Fresh mobile Lighthouse: **100 Performance / 100 Accessibility / 100 Best Practices / 100 SEO**; LCP 1.022 s, TBT 11.5 ms, CLS 0.

Evidence is under `.factory/review-3-artifacts/`.

## Earlier finding disposition

Every finding in reviews 1–2 and verifications 1–10 was inspected. Pass reports 6, 8, and 10 introduced no open defects. The prior failures now have the following current evidence.

| Earlier finding | Current disposition |
| --- | --- |
| V1 missing claims | Closed: 29 manifest commands pass and each ID has one tagged test. |
| V1 no sample; weak first screen | Closed: first-read and one-click desktop/browser sample passed at both viewports. |
| V1 broken paid checkout | Closed: no purchase is advertised; the complete v0.1 app is truthfully free and the deviation is documented. |
| V1 wrong source opened | Closed: `exact-source-open` and `open-source-os` pass. |
| V1 missing CSV export | Closed: the installed UI exposes it and `csv-export` verifies the public command. |
| V1 hidden parser errors | Closed: `source-scope-feedback` reports count, time, and repairable errors. |
| V1 HTML script text indexed | Closed: `five-formats` excludes script content. |
| V1 missing security headers/favicon/metadata/routes | Closed: live headers, icons, route metadata, sitemap, robots, and designed 404 all verified. |
| V1 small targets | Closed: live phone audit and desktop regression meet 44 px. |
| V1 offline GitHub error | Closed: direct demo offline reload passed without external requests or console errors. |
| V1 missing/wordy copy audit | Closed: complete audit exists; no line exceeds 22 words or uses banned copy. |
| V2 claims that tested copy only | Closed: all product claims now assert observable browser, file, or core outcomes. |
| V2 text-rich PDF deadlock | Closed: parser-limit and large-output Rust tests pass. |
| V2 unreadable system-light chrome | Closed: desktop light-theme Playwright/Axe case passes. |
| V2 false demo label in real mode | Closed: installed fresh launch showed no demo label; regression passes. |
| V2 unsafe phone source drawer | Closed: modal state, focus trap, Escape, and focus restoration pass. |
| V2 Apple-silicon selection | Closed: `platform-download-selection` covers Mac ARM and Intel. |
| V2 wrong encryption action label | Closed: the state-aware control regression passes. |
| V2 web source action ambiguity | Closed: the browser is labelled as a sample; the desktop exact-source action is separately proven. |
| V2 missing 50-query benchmark | Closed: `retrieval-benchmark` passes at the required 80% threshold. |
| V2 small live controls and missing walkthrough | Closed: phone targets pass and three captioned frames are live. |
| V3 desktop artifact older than candidate | Closed: v0.1.10 is immutable and its desktop runtime source matches this candidate. |
| V3 false-positive demo and incomplete claims | Closed: hidden display is asserted, desktop isolation is separate, and all 29 claims pass. |
| V3 missing demo exit/recovery | Closed: persistent label, Reset, and Start for real all passed live. |
| V3 narrow targets/walkthrough and metadata | Closed: 390/320 px, screenshots, social image, touch icon, and page facts pass. |
| V5 duplicate Enter open | Closed: one Enter/one native click regression passes. |
| V5 desktop controls below 44 px | Closed: desktop 390 px target test passes. |
| V5 unexplained free scope | Closed: `.factory/monetization.md` records the honest free-v0.1 deviation. |
| V5 narrow overflow and incomplete route metadata | Closed: 320 px test and live route audit pass. |
| V7 shipped app mismatch | Closed: current release identity and desktop-source equality are proven above. |
| V7 skip link focus | Closed: live keyboard activation focuses `main`. |
| V9-1 release metadata not cached | Closed: `release-metadata-cache` passes. |
| V9-2 duplicate claim tag | Closed: every claim ID appears in exactly one test definition. |
| V9-3 no generated-art disclosure | Closed: disclosure appears in every public footer and its claim passes. |
| V9-4 subpixel touch flake | Closed: controls now measure 46 px or more; 46/46 passed once. |
| F-1-1 route focus/announcement | Closed: live Demo and Back both focused and announced the new H1. |
| F-1-2 false exit cleanup | Closed: copy promises cleanup only through Start for real, which passed. |
| F-1-3 source trail claim | Closed: `source-trail-per-result` passes. |
| F-1-4 platform detection claim | Closed: `platform-download-selection` passes. |
| F-1-5 normal-index durability claim | Closed: `normal-index-storage` passes. |
| F-1-6 encryption implementation claim | Closed: plain reader copy plus `encryption-algorithm` test. |
| F-1-7 selected-source promise | Closed: `selected-sources-only` passes. |
| F-1-8 long README sentence | Closed: it is split into three short sentences. |
| F-1-9 metaphor/vague actions | Closed: source, terminal, and copy actions name their results. |
| F-1-10 privacy jargon | Closed: public copy states what leaves the device in plain words. |
| F-2-1 external link label | Closed: every footer says `Source on GitHub (external)`. |
| F-2-2 unlisted AI provenance line | Closed: plain generated-art disclosure has its own passing claim. |
| F-2-3 vague install heading | Closed: `Install with a verified command` explains the SHA256 check. |

## Applicability

There is no backend, tenant, account, sign-in, paid feature, updater promise, or product API, so tenant isolation, restart persistence, 429/`Retry-After`, authentication, paid-license, and updater checks are not applicable. GitHub supplies public release metadata only.

The brief explicitly excludes LLM chat and cloud connectors. Local lexical retrieval with CSV export and explicit file/folder ingestion completes the intended job, so there is no missed AI, sync, or import leverage finding.

## Final result

**PASS — zero findings and zero untested claims.**
