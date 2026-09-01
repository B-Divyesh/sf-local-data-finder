import { currentPlatform } from "./platform";

type GithubRelease = { tag_name: string; assets: Array<{ name: string; browser_download_url: string }> };

async function resolveDownload(): Promise<void> {
  const detected = await currentPlatform();
  const button = document.querySelector<HTMLAnchorElement>("#primary-download")!;
  const note = document.querySelector("#download-note")!;
  if (!detected.os) return;
  if (!navigator.onLine) {
    note.textContent = "Offline — open this page online to check current downloads.";
    return;
  }
  if (!location.hostname.endsWith(".sociobot.in")) {
    note.textContent = "Release downloads · macOS, Windows and Linux";
    return;
  }
  try {
    const response = await fetch("https://api.github.com/repos/B-Divyesh/sf-local-data-finder/releases/latest", { cache: "no-store" });
    if (!response.ok) throw new Error("No release manifest");
    const release = await response.json() as GithubRelease;
    const candidates = release.assets.filter((asset) => {
      const name = asset.name.toLowerCase();
      const formatMatches = detected.format.some((format) => name.endsWith(`.${format.toLowerCase()}`));
      const osMatches = detected.os === "macos" ? name.endsWith(".dmg") : detected.os === "linux" ? name.endsWith(".appimage") || name.endsWith(".deb") : name.endsWith(".exe") || name.endsWith(".msi");
      return formatMatches && osMatches;
    });
    const asset = candidates.find((item) => detected.arch === "arm64" ? /arm64|aarch64/i.test(item.name) : !/arm64|aarch64/i.test(item.name)) || candidates[0];
    if (asset) { button.href = asset.browser_download_url; note.textContent = `Version ${release.tag_name.replace(/^v/, "")} · SHA256 published in latest.json`; }
  } catch { note.textContent = "Release downloads · macOS, Windows and Linux"; }
}

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(button.dataset.copy || "");
  const label = button.querySelector("b")!; label.textContent = "Copied";
  window.setTimeout(() => { label.textContent = "Copy"; }, 1800);
}));

void resolveDownload();
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "127.0.0.1" || location.hostname === "localhost")) {
  void navigator.serviceWorker.register("/sw.js");
}
