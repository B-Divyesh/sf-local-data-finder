#!/bin/sh
set -eu

repo="B-Divyesh/sf-local-data-finder"
base="https://github.com/$repo/releases/latest/download"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT INT TERM

curl -fsSL "$base/SHA256SUMS" -o "$work/SHA256SUMS"
os="$(uname -s)"
arch="$(uname -m)"

case "$os:$arch" in
  Darwin:arm64|Darwin:aarch64) pattern='(aarch64|arm64).*\.dmg$' ;;
  Darwin:*) pattern='(x64|x86_64).*\.dmg$' ;;
  Linux:*) pattern='\.AppImage$' ;;
  *) echo "Local Data Finder supports macOS, Linux, and Windows (use install.ps1 on Windows)." >&2; exit 1 ;;
esac

line="$(grep -Ei "$pattern" "$work/SHA256SUMS" | head -n 1 || true)"
[ -n "$line" ] || { echo "No matching release asset was found for $os $arch." >&2; exit 1; }
expected="$(printf '%s' "$line" | awk '{print $1}')"
asset="$(printf '%s' "$line" | cut -d' ' -f3-)"
encoded="$(printf '%s' "$asset" | sed 's/ /%20/g')"
curl -fL "$base/$encoded" -o "$work/$asset"

if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$work/$asset" | awk '{print $1}')"; else actual="$(shasum -a 256 "$work/$asset" | awk '{print $1}')"; fi
[ "$actual" = "$expected" ] || { echo "Checksum verification failed; nothing was installed." >&2; exit 1; }

if [ "$os" = "Darwin" ]; then
  destination="$HOME/Downloads/$asset"
  mv "$work/$asset" "$destination"
  echo "Verified SHA256 and saved $destination"
  echo "Open the DMG and drag Local Data Finder to Applications. This unsigned v0.1 build may require right-click → Open."
  open "$destination"
else
  destination="$HOME/.local/bin/local-data-finder"
  mkdir -p "$HOME/.local/bin"
  mv "$work/$asset" "$destination"
  chmod 755 "$destination"
  echo "Verified SHA256 and installed Local Data Finder at $destination"
  echo "Run: $destination"
fi
