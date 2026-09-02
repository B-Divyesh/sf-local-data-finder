// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { filterLabel, highlightSnippet, sortResults } from "./search";
import { detectPlatform, selectReleaseAsset } from "../site/platform";

describe("search presentation", () => {
  it("highlights literal query terms without interpreting HTML", () => {
    const host = document.createElement("p");
    host.append(highlightSnippet("Found <script> in Project Aurora", "project"));
    expect(host.innerHTML).toBe("Found &lt;script&gt; in <mark>Project</mark> Aurora");
  });

  it("sorts by score and describes filters", () => {
    const base = { id: "1", title: "a", path: "/a", open_path: "/a", source_path: "/", kind: "text", snippet: "", extracted_at: "2026", modified_at: null };
    expect(sortResults([{ ...base, score: 1 }, { ...base, id: "2", score: 3 }])[0].id).toBe("2");
    expect(filterLabel({ kind: "mail", source: "/mail" })).toBe("mail · one source");
  });

  it("uses architecture information to distinguish macOS builds", () => {
    expect(detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel").arch).toBe("x86_64");
    expect(detectPlatform("Mozilla/5.0 (Macintosh)", "MacIntel", "arm").arch).toBe("arm64");
  });

  it("@claim:platform-download-selection selects a matching release asset for each supported platform", () => {
    const assets = [
      { name: "local-data-finder_0.1.9_x64.dmg", browser_download_url: "https://example.test/mac-intel" },
      { name: "local-data-finder_0.1.9_arm64.dmg", browser_download_url: "https://example.test/mac-arm" },
      { name: "local-data-finder_0.1.9_x64-setup.exe", browser_download_url: "https://example.test/windows" },
      { name: "local-data-finder_0.1.9_amd64.AppImage", browser_download_url: "https://example.test/linux" }
    ];
    const macIntel = detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", "x86");
    const macArm = detectPlatform("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", "MacIntel", "arm");
    const windows = detectPlatform("Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Win32");
    const linux = detectPlatform("Mozilla/5.0 (X11; Linux x86_64)", "Linux x86_64");
    expect(selectReleaseAsset(macIntel, assets)?.browser_download_url).toBe("https://example.test/mac-intel");
    expect(selectReleaseAsset(macArm, assets)?.browser_download_url).toBe("https://example.test/mac-arm");
    expect(selectReleaseAsset(windows, assets)?.browser_download_url).toBe("https://example.test/windows");
    expect(selectReleaseAsset(linux, assets)?.browser_download_url).toBe("https://example.test/linux");
  });
});
