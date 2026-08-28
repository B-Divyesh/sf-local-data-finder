# Local Data Finder

Local Data Finder is a private desktop search utility for professionals whose useful history is spread across folders and exports. It indexes only sources the user explicitly chooses, searches the extracted text locally, and attaches a local path and extraction timestamp to every result.

It supports Markdown, plain text, HTML, mbox mail exports, and text-based PDFs. It does not connect to cloud accounts, use an LLM, inspect mail attachments, delete originals, or send archive content anywhere.

## Product editions

Core folder indexing, lexical search, filters, and source opening are free. A US$39 one-time Archive key unlocks password-encrypted indexes and unlimited source folders through the Sociobot billing API. Checkout is hosted by Sociobot/Dodo; no payment provider is embedded in this repository.

## Develop

Prerequisites are Node.js 22, Rust stable, and the [Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS.

```sh
npm ci
npm run dev          # browser UI at http://localhost:1420
npm run tauri dev    # complete desktop app
```

On Ubuntu/Debian, the Tauri dependencies used in CI are:

```sh
sudo apt-get install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf
```

## Test and build

```sh
npm test             # Vitest + Rust core tests
npm run test:e2e     # Chromium desktop/390px + axe checks
npm run check        # TypeScript + cargo check
npm run build        # desktop web assets -> dist/app; deploy site -> dist/site
npm run build:site   # exact static deploy command -> dist/site/index.html
```

Desktop release binaries are intentionally built only by `.github/workflows/release.yml`. Push a `v*` tag (for example `v0.1.0`) to build unsigned `.dmg`, `.msi`/`.exe`, `.AppImage`, and `.deb` assets, plus `SHA256SUMS` and `latest.json`.

## Install

The landing page detects the visitor's OS and resolves its button from the latest GitHub Release manifest.

```sh
curl -fsSL https://local-data-finder.sociobot.in/install.sh | sh
```

```powershell
irm https://local-data-finder.sociobot.in/install.ps1 | iex
```

Both installers verify SHA256 before opening or placing an artifact. v0.1 binaries are unsigned: on macOS use right-click → Open if Gatekeeper blocks first launch; Windows may show SmartScreen.

## How local data is handled

The normal index is an atomic JSON file in the operating system's application-data directory. Encrypted mode stores a ChaCha20-Poly1305 envelope whose key is derived with Argon2; the password is session-only. PDF extraction runs in a separate process with a 25 MB input cap and 12-second timeout. Original sources are opened read-only through the OS and are never modified.

See [privacy](site/privacy/index.html), [terms](site/terms/index.html), the [visual thesis](.factory/design.md), and the [handoff](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
