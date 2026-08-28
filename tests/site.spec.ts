import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page has one clear heading and no serious accessibility violations", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle(/Local Data Finder/);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.getByRole("link", { name: /Download for/ })).toBeVisible();
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

test("purchase return stores and removes the license from the URL", async ({ page }) => {
  await page.goto("/?license=test-license-token");
  await expect(page.getByRole("heading", { name: "Your Archive key is ready." })).toBeVisible();
  await expect(page).toHaveURL("/");
  expect(await page.evaluate(() => localStorage.getItem("sb_license:local-data-finder"))).toBe("test-license-token");
});
