export type GithubRelease = {
  tag_name: string;
  assets: Array<{ name: string; browser_download_url: string }>;
};

type ReleaseCache = { cachedAt: number; release: GithubRelease };
type ReleaseStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const RELEASE_API_URL = "https://api.github.com/repos/B-Divyesh/sf-local-data-finder/releases/latest";
export const RELEASE_CACHE_KEY = "local-data-finder:github-release:v1";
export const RELEASE_CACHE_MAX_AGE_MS = 60 * 60 * 1000;

function isGithubRelease(value: unknown): value is GithubRelease {
  if (!value || typeof value !== "object") return false;
  const release = value as Partial<GithubRelease>;
  return typeof release.tag_name === "string" && Array.isArray(release.assets) && release.assets.every((asset) =>
    Boolean(asset) && typeof asset.name === "string" && typeof asset.browser_download_url === "string"
  );
}

export function readCachedRelease(storage: ReleaseStorage, now = Date.now()): GithubRelease | undefined {
  try {
    const raw = storage.getItem(RELEASE_CACHE_KEY);
    if (!raw) return undefined;
    const cached = JSON.parse(raw) as Partial<ReleaseCache>;
    const age = now - Number(cached.cachedAt);
    if (!Number.isFinite(age) || age < 0 || age >= RELEASE_CACHE_MAX_AGE_MS || !isGithubRelease(cached.release)) {
      storage.removeItem(RELEASE_CACHE_KEY);
      return undefined;
    }
    return cached.release;
  } catch {
    try { storage.removeItem(RELEASE_CACHE_KEY); } catch { /* Storage can be unavailable. */ }
    return undefined;
  }
}

export async function fetchAndCacheRelease(
  fetcher: typeof fetch,
  storage: ReleaseStorage,
  now = Date.now()
): Promise<GithubRelease> {
  const cached = readCachedRelease(storage, now);
  if (cached) return cached;

  const response = await fetcher(RELEASE_API_URL, { cache: "no-store" });
  if (!response.ok) throw new Error("No release manifest");
  const payload: unknown = await response.json();
  if (!isGithubRelease(payload)) throw new Error("Invalid release manifest");

  const release: GithubRelease = {
    tag_name: payload.tag_name,
    assets: payload.assets.map(({ name, browser_download_url }) => ({ name, browser_download_url }))
  };
  try { storage.setItem(RELEASE_CACHE_KEY, JSON.stringify({ cachedAt: now, release } satisfies ReleaseCache)); }
  catch { /* A blocked or full localStorage must not block downloads. */ }
  return release;
}
