export type DetectedPlatform = { os: string; arch: string; label: string; format: string[] };

export function detectPlatform(userAgent: string, navigatorPlatform: string, architecture = ""): DetectedPlatform {
  const value = `${userAgent} ${navigatorPlatform}`.toLowerCase();
  const reportedArchitecture = architecture.toLowerCase();
  const isArm = /arm|aarch64/.test(`${value} ${reportedArchitecture}`);
  if (value.includes("win")) return { os: "windows", arch: "x86_64", label: "Windows", format: ["exe", "msi"] };
  // Browsers intentionally report MacIntel on Apple silicon. Prefer the native build
  // for that ambiguous value; Intel owners can still choose the Intel asset on Releases.
  if (value.includes("mac")) return { os: "macos", arch: isArm || navigatorPlatform === "MacIntel" ? "arm64" : "x86_64", label: "macOS", format: ["dmg"] };
  if (value.includes("linux")) return { os: "linux", arch: isArm ? "arm64" : "x86_64", label: "Linux", format: ["AppImage", "deb"] };
  return { os: "", arch: isArm ? "arm64" : "x86_64", label: "your computer", format: [] };
}

export async function currentPlatform(): Promise<DetectedPlatform> {
  const userAgentData = (navigator as Navigator & { userAgentData?: { getHighEntropyValues(hints: string[]): Promise<{ architecture?: string }> } }).userAgentData;
  let architecture = "";
  try { architecture = (await userAgentData?.getHighEntropyValues(["architecture"]))?.architecture || ""; }
  catch { /* Fall back to stable browser signals. */ }
  return detectPlatform(navigator.userAgent, navigator.platform, architecture);
}
