import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const run = promisify(execFile);
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("published release integrity", () => {
  it("@claim:published-checksums writes asset hashes and installer comparisons", async () => {
    const directory = await mkdtemp(join(tmpdir(), "local-data-finder-release-"));
    temporaryDirectories.push(directory);
    const appImage = "local-data-finder_0.1.6_amd64.AppImage";
    const executable = "local-data-finder_0.1.6_x64-setup.exe";
    const appImageBytes = Buffer.from("Linux release fixture");
    const executableBytes = Buffer.from("Windows release fixture");
    await Promise.all([
      writeFile(join(directory, appImage), appImageBytes),
      writeFile(join(directory, executable), executableBytes)
    ]);

    await run(process.execPath, ["scripts/release-manifest.mjs", directory], {
      cwd: process.cwd(),
      env: { ...process.env, GITHUB_REF_NAME: "v0.1.6", GITHUB_REPOSITORY: "B-Divyesh/sf-local-data-finder" }
    });

    const manifest = JSON.parse(await readFile(join(directory, "latest.json"), "utf8")) as { version: string; assets: Array<{ format: string; sha256: string }> };
    const sums = await readFile(join(directory, "SHA256SUMS"), "utf8");
    expect(manifest.version).toBe("0.1.6");
    expect(manifest.assets).toHaveLength(2);
    expect(manifest.assets.find((asset) => asset.format === "AppImage")?.sha256).toBe(createHash("sha256").update(appImageBytes).digest("hex"));
    expect(sums).toContain(createHash("sha256").update(executableBytes).digest("hex"));

    const [shellInstaller, powershellInstaller] = await Promise.all([
      readFile("public/install.sh", "utf8"),
      readFile("public/install.ps1", "utf8")
    ]);
    expect(shellInstaller).toContain('[ "$actual" = "$expected" ]');
    expect(powershellInstaller).toContain('$actual -ne $asset.sha256.ToLowerInvariant()');
  });
});

describe("published product copy", () => {
  it("@claim:free-download presents the desktop app as free without a payment gate", async () => {
    const [landing, readme, decision] = await Promise.all([
      readFile("site/index.html", "utf8"),
      readFile("README.md", "utf8"),
      readFile(".factory/monetization.md", "utf8")
    ]);
    const productFiles = await Promise.all(["site", "src-tauri", "public"].map(async (directory) => {
      const { stdout } = await run("rg", ["-l", "api/v1/products|/checkout|dodo|stripe", directory], { cwd: process.cwd() }).catch(() => ({ stdout: "" }));
      return stdout;
    }));
    expect(landing).toContain("Free to download");
    expect(readme).toContain("free private desktop search utility");
    expect(decision).toContain("No one-time purchase, checkout, or license restore control is exposed in v0.1.");
    expect(decision).toContain("not an available purchase");
    expect(productFiles.join("").trim()).toBe("");
  });

  it("@claim:unsigned-builds discloses unsigned desktop releases", async () => {
    const [landing, workflow] = await Promise.all([
      readFile("site/index.html", "utf8"),
      readFile(".github/workflows/release.yml", "utf8")
    ]);
    expect(landing).toContain("v0.1 builds are unsigned.");
    expect(workflow).not.toContain("APPLE_CERTIFICATE");
    expect(workflow).not.toContain("WINDOWS_CERT_PFX");
  });
});
