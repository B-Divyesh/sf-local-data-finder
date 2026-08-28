import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const root = process.argv[2] || "release-assets";
const version = (process.env.GITHUB_REF_NAME || "v0.1.0").replace(/^v/, "");
const repo = process.env.GITHUB_REPOSITORY || "B-Divyesh/sf-local-data-finder";

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : join(dir, entry.name)))).flat();
}

const deliverables = (await files(root)).filter((file) => /\.(dmg|msi|exe|AppImage|deb)$/i.test(file));
if (!deliverables.length) throw new Error("No release deliverables found");
const assets = [];
const sums = [];
for (const file of deliverables.sort()) {
  const name = basename(file);
  const lower = name.toLowerCase();
  const sha256 = createHash("sha256").update(await readFile(file)).digest("hex");
  const platform = lower.endsWith(".dmg") ? "macos" : lower.endsWith(".appimage") || lower.endsWith(".deb") ? "linux" : "windows";
  const arch = /aarch64|arm64/.test(lower) ? "arm64" : "x86_64";
  const format = extname(name).slice(1).replace("appimage", "AppImage");
  const url = `https://github.com/${repo}/releases/latest/download/${encodeURIComponent(name)}`;
  assets.push({ platform, arch, format, url, sha256 });
  sums.push(`${sha256}  ${name}`);
}
await writeFile(join(root, "SHA256SUMS"), `${sums.join("\n")}\n`);
await writeFile(join(root, "latest.json"), `${JSON.stringify({ version, assets }, null, 2)}\n`);
console.log(`Prepared ${assets.length} release assets for ${version}`);
