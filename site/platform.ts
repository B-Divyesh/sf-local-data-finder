export type DetectedPlatform = { os: string; arch: string; label: string; format: string[] };
export type ReleaseAsset = { name: string; browser_download_url: string };

export function detectPlatform(userAgent: string, navigatorPlatform: string, architecture = ""): DetectedPlatform {
  const value = `${userAgent} ${navigatorPlatform}`.toLowerCase();
  const reportedArchitecture = architecture.toLowerCase();
  const isArm = /arm|aarch64/.test(`${value} ${reportedArchitecture}`);
  if (value.includes("win")) return { os: "windows", arch: "x86_64", label: "Windows", format: ["exe", "msi"] };
  // Apple browsers can report MacIntel on Apple silicon. High-entropy architecture
  // chooses the native asset when available; the ambiguous fallback stays compatible
  // with all Intel Macs.
  if (value.includes("mac")) return { os: "macos", arch: isArm ? "arm64" : "x86_64", label: "macOS", format: ["dmg"] };
  if (value.includes("linux")) return { os: "linux", arch: isArm ? "arm64" : "x86_64", label: "Linux", format: ["AppImage", "deb"] };
  return { os: "", arch: isArm ? "arm64" : "x86_64", label: "your computer", format: [] };
}

export function selectReleaseAsset(platform: DetectedPlatform, assets: ReleaseAsset[]): ReleaseAsset | undefined {
  const candidates = assets.filter((asset) => {
    const name = asset.name.toLowerCase();
    const formatMatches = platform.format.some((format) => name.endsWith(`.${format.toLowerCase()}`));
    const osMatches = platform.os === "macos" ? name.endsWith(".dmg") : platform.os === "linux" ? name.endsWith(".appimage") || name.endsWith(".deb") : name.endsWith(".exe") || name.endsWith(".msi");
    return formatMatches && osMatches;
  });
  return candidates.find((item) => platform.arch === "arm64" ? /arm64|aarch64/i.test(item.name) : !/arm64|aarch64/i.test(item.name)) || candidates[0];
}

export async function currentPlatform(): Promise<DetectedPlatform> {
  const userAgentData = (navigator as Navigator & { userAgentData?: { getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }> } }).userAgentData;
  let architecture = "";
  try { architecture = (await userAgentData?.getHighEntropyValues(["architecture"]))?.architecture || ""; }
  catch { /* Fall back to stable browser signals. */ }
  return detectPlatform(navigator.userAgent, navigator.platform, architecture);
}
