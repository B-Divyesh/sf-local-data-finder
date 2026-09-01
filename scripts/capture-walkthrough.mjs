import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const baseUrl = process.env.LOCAL_DATA_FINDER_APP_URL || "http://127.0.0.1:1420";
const outputDirectory = "public/assets";

const realStatus = { sources: [], document_count: 0, locked: false, encrypted: false, last_indexed: null, demo: false };
const demoStatus = {
  sources: [{ path: "/sample/demo-sample", document_count: 5, last_indexed: "2026-09-01T09:42:00Z", errors: [] }],
  document_count: 5,
  locked: false,
  encrypted: false,
  last_indexed: "2026-09-01T09:42:00Z",
  demo: true
};
const result = {
  id: "sample-1",
  title: "Re: Northwind approval",
  path: "/sample/demo-sample/project-mail.mbox · message 1",
  open_path: "/sample/demo-sample/project-mail.mbox",
  source_path: "/sample/demo-sample",
  kind: "mail",
  snippet: "The approval for MAPLE-742 is in the migration plan. Keep the original export until validation.",
  extracted_at: "2026-09-01T09:42:00Z",
  modified_at: null,
  score: 12
};

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await page.addInitScript(({ initialStatus, sampleStatus, sampleResult }) => {
  let status = structuredClone(initialStatus);
  (window).__TAURI_INTERNALS__ = {
    async invoke(command, args = {}) {
      if (command === "get_status") return structuredClone(status);
      if (command === "load_sample_project" || command === "reset_sample_project") {
        status = structuredClone(sampleStatus);
        return structuredClone(status);
      }
      if (command === "search_index") return args.query ? [sampleResult] : [];
      if (command === "leave_sample_project") {
        status = structuredClone(initialStatus);
        return structuredClone(status);
      }
      if (command === "set_encryption" || command === "refresh_all" || command === "remove_source") return null;
      throw new Error(`Unexpected walkthrough bridge command: ${command}`);
    }
  };
}, { initialStatus: realStatus, sampleStatus: demoStatus, sampleResult: result });

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.locator("#app").screenshot({ path: `${outputDirectory}/walkthrough-01-start.png`, type: "png" });
await page.getByRole("button", { name: "Load sample project" }).click();
await page.locator("#app").screenshot({ path: `${outputDirectory}/walkthrough-02-sample.png`, type: "png" });
await page.locator("#search-input").fill("MAPLE-742");
await page.getByText("Re: Northwind approval", { exact: true }).waitFor();
await page.locator("#app").screenshot({ path: `${outputDirectory}/walkthrough-03-result.png`, type: "png" });
await browser.close();
