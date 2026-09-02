import { describe, expect, it, vi } from "vitest";
import {
  fetchAndCacheRelease,
  RELEASE_API_URL,
  RELEASE_CACHE_KEY,
  RELEASE_CACHE_MAX_AGE_MS
} from "../site/release-cache";

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe("GitHub release metadata cache", () => {
  it("@claim:release-metadata-cache reuses one response across immediate page loads and expires it after one hour", async () => {
    const storage = new MemoryStorage();
    const release = {
      tag_name: "v0.1.10",
      assets: [{ name: "Local.Data.Finder_0.1.10_amd64.AppImage", browser_download_url: "https://github.com/example.AppImage" }]
    };
    const fetcher = vi.fn(async () => new Response(JSON.stringify(release), {
      status: 200,
      headers: { "content-type": "application/json" }
    }));
    const firstLoadAt = Date.UTC(2026, 8, 2, 12);

    await expect(fetchAndCacheRelease(fetcher, storage, firstLoadAt)).resolves.toEqual(release);
    await expect(fetchAndCacheRelease(fetcher, storage, firstLoadAt + 1)).resolves.toEqual(release);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(RELEASE_API_URL, { cache: "no-store" });
    expect(storage.getItem(RELEASE_CACHE_KEY)).toContain('"cachedAt":1788350400000');

    await expect(fetchAndCacheRelease(fetcher, storage, firstLoadAt + RELEASE_CACHE_MAX_AGE_MS)).resolves.toEqual(release);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
