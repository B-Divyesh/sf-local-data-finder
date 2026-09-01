# Independent product verification 5 — FAIL

**Candidate:** `1eff0287b773810e2c80fe56a4c5f5b955bd3f3f`

**Live URL:** `https://local-data-finder.sociobot.in`

**Verified:** 1 September 2026 (UTC)

**Verdict:** **FAIL**

The live site and published v0.1.7 desktop packages match the candidate product files, and all 22 declared claim checks pass after the documented clean-clone setup. The candidate is not ready for release because one keyboard action opens the selected source twice, several desktop controls are smaller than the mandatory 44×44 CSS-pixel target at 390 px, and the product contradicts the brief's one-time purchase model without documenting an accepted change.

## Release-blocking findings

### High — one Enter press opens a result twice

The desktop result is a native button with a click handler that calls `open_source`. A document-level `keydown` handler separately calls the same function when Enter is pressed on that button. In a fresh candidate build with a recorded Tauri bridge, focusing one result and pressing Enter once produced two `open_source` calls.

This is observable keyboard behavior, not a source-only concern. One user action can ask the operating system to open the same record twice. Mouse activation produced one call. Arrow navigation and the 3 px visible focus treatment worked correctly.

**Evidence:** candidate `src/main.ts` click handling and lines 288–292; recorded result: `open_source calls after one Enter: 2`.

### Medium — desktop controls are below the required 44 px target

At a 390×844 viewport, the candidate desktop app has the following visible interactive targets below 44 px in at least one dimension:

| Control | Measured box |
| --- | ---: |
| Skip to search | 145×43 px |
| Reset demo | 99×32 px |
| Start for real | 105×32 px |
| Remove source | 42×42 px |
| Show parser-error reasons | 258×30 px |

The site demo meets the 44 px minimum; this finding applies to the shipped desktop app. The attached accessibility baseline makes 44 px targets mandatory.

**Evidence:** `.factory/qa-artifacts/app-mobile-touch-audit.png`; candidate CSS sets `.text-button` to 32 px, `.source-menu` to 42×42 px, and `.source-error summary` to 30 px.

### Medium — the brief's one-time purchase model is not implemented or explained

The researched acceptance brief specifies one-time monetization. The candidate instead states “Free to download,” tests that no checkout or payment integration exists, and describes the app as free in the README. There is no purchase, license restore, license verification, price, or operator note approving this scope change. Free distribution may be a reasonable product decision, but it is a direct, undocumented change to the supplied acceptance contract.

## Other findings

### Minor — narrow and metadata requirements remain incomplete

- At 320 CSS pixels, the landing page has 18 px of horizontal overflow (`scrollWidth 338`, `clientWidth 320`) from the footer/navigation layout. The required 390 px layout has no overflow.
- The social image is the 1280×853 hero rather than a dedicated 1200×630 image.
- The apple-touch icon points to an SVG rather than a 180 px touch icon.
- Footers omit the required version/build identity.
- Privacy, terms, and 404 headers do not retain the same primary navigation as the landing page.
- Secondary routes do not provide the landing page's Open Graph and Twitter metadata set.

These items did not create serious or critical axe findings and are not the primary reason for the decision.

## Mandatory first-read check

**Pass.** A cold live load at 1440×900 and 390×844 answers all three questions on the first screen:

- What it does: “Find facts in your local archive.”
- Who it serves: professionals with years of notes and exports.
- What to choose first: **Try it with sample data**, paired with **Open the sample project**.

The sample opens in one click. The first screen also states offline availability after download, free availability, and explicit source selection. The cold load produced no console or page errors.

**Evidence:** `.factory/qa-artifacts/first-read-desktop.png` and `.factory/qa-artifacts/live-mobile.png`.

## Claims checks run first

`.factory/claims.json` exists and contains 22 entries. The first literal invocation in the untouched checkout could not import Playwright or Vitest, and Rust could not link the Linux WebKit dependencies. After the documented clean-clone setup (`npm ci` plus the README's Ubuntu Tauri packages), every exact manifest command was rerun and passed. Those initial messages were setup prerequisites rather than product-test assertions.

| Claim | Confirmed outcome |
| --- | --- |
| `demo-sandbox` | Pass — search, hidden non-match, and reset work in desktop and 390 px browser projects. |
| `demo-browser-storage` | Pass — only the demo query key is used and Start for real clears it. |
| `desktop-demo-isolation` | Pass — demo artifacts are separate, removed on exit, and the normal index is unchanged. |
| `website-privacy` | Pass — the recorded demo flow uses only the site origin. |
| `offline-reload` | Pass — a dedicated context updates the service worker and reloads the demo offline. |
| `desktop-local-processing` | Pass — desktop core has no network client, language model, or archive-service endpoint. |
| `free-download` | Pass against current copy — the site says free and product code has no checkout integration. |
| `five-formats` | Pass — Markdown, text, HTML, mbox, and text-based PDF fixtures are searchable. |
| `source-selection` | Pass — hidden and unsupported fixtures are skipped. |
| `source-scope-feedback` | Pass — counts, extraction time, and parser errors are reported. |
| `csv-export` | Pass — exported CSV contains the header and quoted result row. |
| `exact-source-open` | Pass — the indexed record path, not the source root, is selected. |
| `open-source-os` | Pass — the native operating-system opener is used. |
| `attachments-closed` | Pass — attachment content is excluded from the mbox record. |
| `source-removal` | Pass — the index record is removed and the original fixture remains unchanged. |
| `encrypted-index` | Pass — stored paths/text are not plaintext and the wrong password is rejected. |
| `session-password` | Pass — a new session restores no in-memory password. |
| `parser-limits` | Pass — the 25 MB limit and 12-second worker limit are exercised. |
| `retrieval-benchmark` | Pass — at least 40 of 50 known source records are returned as required. |
| `published-checksums` | Pass — release manifests and installer hash comparisons are present. |
| `unsigned-builds` | Pass — unsigned status and first-launch guidance are disclosed. |
| `desktop-walkthrough` | Pass — three visible, captioned desktop screenshots are present. |

The declared claims are fully represented by tests. The one-time purchase requirement is a brief mismatch rather than an unlisted statement on the shipped site.

## Clean-checkout quality gates

| Check | Result |
| --- | --- |
| Candidate identity | Pass — checkout began at exact candidate `1eff0287`; branch matched `origin/main`. |
| `npm ci` | Pass — locked dependencies installed. |
| `npm run lint` | Pass. |
| `npm run check` | Pass — TypeScript and Cargo checks completed. |
| `npm test` | Pass — 6 Vitest and 20 Rust tests. |
| `npm run build` | Pass — produced `dist/app` and `dist/site`. |
| `npm run test:e2e` | Pass — 28/28 Playwright checks across desktop and 390 px projects. |
| `npm audit --audit-level=high` | Pass — zero known vulnerabilities. |
| `/opt/fleet/lib/verify-url.sh` | Pass — 200 response, valid title/lang/main/h1/alt/button checks, no console or page errors. |

The production build stays well inside the supplied static budgets. Desktop-app JS is 18.55 kB raw/6.58 kB gzip and CSS is 14.24 kB raw/3.99 kB gzip. Site entry JS is 2.25 kB raw/1.14 kB gzip, site CSS is 12.70 kB raw/3.42 kB gzip, and the mobile hero is 21,978 bytes. No web font is requested.

## Smallest useful product check

The published Linux AppImage was downloaded fresh, matched `SHA256SUMS`, and launched from an isolated app-data directory. The actual desktop interface completed the core flow:

1. **Load sample project** created a separate five-record demo.
2. Searching `MAPLE-742` displayed three matches with paths and extraction timestamps.
3. Searching `no-such-record-991` displayed a clear zero-result recovery state.
4. **Start for real** removed `demo-index.json` and `demo-sample` in the same session.

Rust integration checks additionally confirm the five formats, source selection, CSV output, exact source paths, source removal boundaries, encrypted storage, session password behavior, parser limits, and 50-query benchmark. The downloadable app therefore performs the stated local retrieval job; the keyboard defect above prevents acceptance.

**Evidence:** `.factory/qa-artifacts/release-app-sample-loaded.png`, `release-app-search-result.png`, `release-app-no-result.png`, and `release-app-demo-discarded.png`.

## Live site, accessibility, privacy, and resilience

- Home, demo, privacy, terms, and the designed 404 were checked at 1440 px and 390 px. Each has `lang`, one `h1`, a `main` landmark, ordered headings, complete image alt text, and no horizontal overflow at 390 px.
- Axe reported zero serious or critical findings on all five routes at both sizes.
- Keyboard traversal reaches the skip link and primary controls. The live site focus ring is a visible 3 px mint outline. No keyboard trap was found.
- At 200% browser zoom, landing, demo, and desktop content remained usable without horizontal overflow in the tested 1280 px viewport.
- Reduced-motion emulation matches the media query, makes scrolling immediate, and leaves no active animation.
- Normal routes and complete demo flows produced no console or page errors. A deliberate 404 navigation produced only the expected failed-document message.
- Demo searches for `MAPLE-742`, `Northwind`, and `original export` return the sample record. Empty, unmatched, markup-shaped, and 5,000-character inputs clear the old result and show the recovery state. Reset restores the initial result.
- **Start for real** returns home and clears `demo:local-data-finder:query`.
- The complete demo request log is same-origin only. The landing page additionally requests only the documented GitHub Releases API. No analytics, third-party font, or archive-content request was observed.
- Responses include CSP with `frame-ancestors 'none'`, HSTS, `X-Frame-Options: DENY`, `nosniff`, strict-origin referrer policy, and disabled camera, microphone, and geolocation.
- Hashed JS/CSS use one-year immutable caching. HTML and the service worker use short revalidation caching; installer scripts use five-minute caching.
- Service-worker update completed and the demo reloaded offline with its title, heading, and sample search intact.
- All ordinary internal links returned 200. The designed missing route returned a real 404. The repository and release links resolved successfully.

## Performance

Fresh mobile Lighthouse against the live site reported:

| Measure | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| LCP | 950 ms |
| CLS | 0 |
| Total blocking time | 74 ms |
| Total transfer | 456,123 bytes |

These results satisfy the supplied performance limits.

## Deployment and release identity

- All 20 generated public files were compared with the live origin and matched byte-for-byte, including route HTML, scripts, styles, images, service worker, installer scripts, icons, sitemap, and robots file.
- GitHub release `v0.1.7` was published by successful Actions run `33555784089`. Its annotated tag resolves to commit `455b200e07d487ee1b165be07d8f75139da83e1f`.
- Candidate `1eff0287` differs from that release commit only in `.factory/handoff.md`; product source and release workflow are identical.
- The release contains two macOS DMGs, Linux AppImage and DEB, Windows MSI and EXE, `SHA256SUMS`, and valid `latest.json` platform entries.
- The fresh Linux AppImage is 82,950,648 bytes. SHA-256 `ff200971ec602458e0ad8abbaf3598c4cb3e4b9fa13a0b92323dba5cb17c729d` matches the published checksum.

The product is a static site plus a local desktop app. It has no product server endpoint and no sign-in flow, so request-allowance/429 and Entra-authority checks do not apply. It also has no purchase endpoint; that absence is recorded as a contract finding above.

## Decision

**FAIL.** Correct the duplicate Enter handling, raise every visible desktop-app target to at least 44×44 CSS pixels, and either implement the brief's one-time purchase model or record an approved scope change. Then rerun the full claims inventory, clean gates, downloadable-package flow, and 390 px accessibility checks before promotion.
