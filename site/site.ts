type Asset = { platform: string; arch: string; format: string; url: string; sha256: string };
type Manifest = { version: string; assets: Asset[] };

function platform(): { os: string; arch: string; label: string; format: string[] } {
  const value = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  const arch = value.includes("arm") || value.includes("aarch64") ? "arm64" : "x86_64";
  if (value.includes("win")) return { os: "windows", arch: "x86_64", label: "Windows", format: ["exe", "msi"] };
  if (value.includes("mac")) return { os: "macos", arch, label: "macOS", format: ["dmg"] };
  if (value.includes("linux")) return { os: "linux", arch: "x86_64", label: "Linux", format: ["AppImage", "deb"] };
  return { os: "", arch, label: "your computer", format: [] };
}

async function resolveDownload(): Promise<void> {
  const detected = platform();
  const button = document.querySelector<HTMLAnchorElement>("#primary-download")!;
  const label = document.querySelector("#download-label")!;
  const note = document.querySelector("#download-note")!;
  label.textContent = `Download for ${detected.label}`;
  if (!detected.os) return;
  if (!location.hostname.endsWith(".sociobot.in")) {
    note.textContent = "Release downloads · macOS, Windows and Linux";
    return;
  }
  try {
    const response = await fetch("https://github.com/B-Divyesh/sf-local-data-finder/releases/latest/download/latest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No release manifest");
    const manifest = await response.json() as Manifest;
    const asset = manifest.assets.find((item) => item.platform === detected.os && item.arch === detected.arch && detected.format.includes(item.format))
      || manifest.assets.find((item) => item.platform === detected.os && detected.format.includes(item.format));
    if (asset) { button.href = asset.url; note.textContent = `Version ${manifest.version} · ${asset.format} · SHA256 published`; }
  } catch { note.textContent = "Release downloads · macOS, Windows and Linux"; }
}

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => button.addEventListener("click", async () => {
  await navigator.clipboard.writeText(button.dataset.copy || "");
  const label = button.querySelector("b")!; label.textContent = "Copied";
  window.setTimeout(() => { label.textContent = "Copy"; }, 1800);
}));

void resolveDownload();
if ("serviceWorker" in navigator && location.protocol === "https:") void navigator.serviceWorker.register("/sw.js");
