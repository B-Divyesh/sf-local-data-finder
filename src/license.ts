const SLUG = "local-data-finder";
const TOKEN_KEY = `sb_license:${SLUG}`;
const VERDICT_KEY = `sb_license_verdict:${SLUG}`;
const DAY = 86_400_000;

type Verdict = { valid: boolean; checkedAt: number; reason?: string };

export function captureReturnedLicense(url = new URL(location.href)): string | null {
  const token = url.searchParams.get("license");
  if (!token) return localStorage.getItem(TOKEN_KEY);
  localStorage.setItem(TOKEN_KEY, token);
  url.searchParams.delete("license");
  history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  return token;
}

export function savedLicense(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function cachedUnlock(): boolean {
  try {
    return JSON.parse(localStorage.getItem(VERDICT_KEY) || "null")?.valid === true;
  } catch {
    return false;
  }
}

export async function verifyLicense(force = false): Promise<Verdict> {
  const token = savedLicense();
  if (!token) return { valid: false, checkedAt: Date.now(), reason: "missing" };
  let cached: Verdict | null = null;
  try { cached = JSON.parse(localStorage.getItem(VERDICT_KEY) || "null"); } catch { /* ignore corrupt cache */ }
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  try {
    const response = await fetch(`https://api.sociobot.in/api/v1/products/${SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error("verification unavailable");
    const data = await response.json() as { valid: boolean; reason?: string };
    const verdict = { valid: data.valid, reason: data.reason, checkedAt: Date.now() };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return cached || { valid: false, checkedAt: 0, reason: "offline" };
  }
}

export function saveLicense(token: string): void {
  localStorage.setItem(TOKEN_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function clearLicense(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(VERDICT_KEY);
}
