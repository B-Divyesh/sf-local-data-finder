import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page has one clear heading and no serious accessibility violations", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Local Data Finder/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /Try it with sample data/ })).toBeVisible();
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
  expect(errors).toEqual([]);
});

test("legal routes and keyboard path work", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.goto("/privacy/");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy" })).toBeVisible();
  await page.goto("/terms/");
  await expect(page.getByRole("heading", { level: 1, name: "Terms" })).toBeVisible();
});

test("@claim:demo-sandbox the demo is one click, searchable, and resettable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Try it with sample data/ }).click();
  await expect(page).toHaveURL(/\/demo\//);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  const query = page.locator("#demo-query");
  await query.fill("not in the sample");
  await expect(page.getByText(/No sample record matched/)).toBeVisible();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(query).toHaveValue("MAPLE-742");
  await expect(page.getByText(/Demo reset. One sample result found/)).toBeVisible();
});

test("@claim:local-first-site the demo sends no archive data to another origin", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo/");
  await page.locator("#demo-query").fill("Northwind");
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("@claim:five-formats the site names the supported local text formats", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Markdown, plain text, HTML, mbox and text-based PDFs/)).toBeVisible();
});

test("demo page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/demo/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to demo" })).toBeFocused();
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("offline reload does not attempt a release API request", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/");
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event("online")));
  expect(requests.filter((url) => url.includes("api.github.com"))).toEqual([]);
  await context.close();
});
