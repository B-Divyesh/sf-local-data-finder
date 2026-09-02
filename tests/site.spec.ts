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

test("skip-link activation transfers focus to the main landmark", async ({ page }) => {
  for (const route of ["/", "/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(route);
    await page.keyboard.press("Tab");
    await expect(page.locator(".skip-link")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
    await expect(page).toHaveURL(/#main$/);
  }
});

test("legal routes work", async ({ page }) => {
  await page.goto("/");
  await page.goto("/privacy/");
  await expect(page.getByRole("heading", { level: 1, name: "Privacy" })).toBeVisible();
  await page.goto("/terms/");
  await expect(page.getByRole("heading", { level: 1, name: "Terms" })).toBeVisible();
});

test("route navigation focuses and announces the new page heading, including Back", async ({ page }) => {
  await page.goto("/");
  await page.locator(".site-footer").getByRole("link", { name: "Demo" }).click();
  await expect(page).toHaveURL(/\/demo\//);
  await expect(page.getByRole("heading", { level: 1, name: "Search a sample project" })).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Demo — Local Data Finder");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1, name: /Find facts in your local archive/ })).toBeFocused();
  await expect(page.locator("#route-announcement")).toHaveText("Local Data Finder — Find local archive records");
});

test("secondary routes retain navigation, social metadata, touch icon, and build identity", async ({ page }) => {
  for (const route of ["/demo/", "/privacy/", "/terms/", "/404.html"]) {
    await page.goto(route);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /local-data-finder-social\.jpg$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
    await expect(page.locator('.site-header nav[aria-label="Primary navigation"] a')).toHaveCount(3);
    await expect(page.locator(".site-footer small")).toContainText(/v0\.1\.10 · build [a-f0-9]{7}/);
  }
});

test("320px landing and 404 footer stay within the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const route of ["/", "/404.html"]) {
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  }
});

test("@claim:demo-sandbox the demo is one click, searchable, and resettable", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Try it with sample data/ }).click();
  await expect(page).toHaveURL(/\/demo\/\?demo=1/);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  const query = page.locator("#demo-query");
  await query.fill("not in the sample");
  await expect(page.getByText(/No sample record matched/)).toBeVisible();
  await expect(page.locator("#sample-result")).toBeHidden();
  await expect(page.locator("#sample-result")).toHaveCSS("display", "none");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(query).toHaveValue("MAPLE-742");
  await expect(page.locator("#sample-result")).toBeVisible();
  await expect(page.getByText(/Demo reset. One sample result found/)).toBeVisible();
});

test("@claim:demo-sandbox ?demo=1 opens the isolated sample directly", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo\/\?demo=1/);
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start for real" })).toBeVisible();
});

test("@claim:demo-browser-storage the browser demo uses its own storage and Start for real clears it", async ({ page }) => {
  await page.goto("/demo/");
  await page.locator("#demo-query").fill("Northwind");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("demo:local-data-finder:query"))).toBe("Northwind");
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.evaluate(() => localStorage.getItem("demo:local-data-finder:query"))).resolves.toBeNull();
});

test("@claim:website-privacy the demo sends no archive data or tracking requests to another origin", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo/");
  await page.locator("#demo-query").fill("Northwind");
  expect(requests.every((url) => new URL(url).origin === "http://127.0.0.1:4173")).toBe(true);
});

test("landing names the supported local text formats", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Markdown, plain text, HTML, mbox and text-based PDFs/)).toBeVisible();
});

test("demo page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/demo/");
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start for real" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to demo" })).toBeFocused();
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("@claim:offline-reload the demo reloads offline after its first visit", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/demo/");
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return Boolean(registration.active);
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Search a sample project" })).toBeVisible();
  await context.close();
});

test("demo touch targets meet the 44px minimum at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/");
  const targets = [
    page.getByRole("link", { name: "Skip to demo" }),
    page.locator("#demo-query"),
    page.locator(".site-footer a[href='/']"),
    page.locator(".site-footer a[href='/terms/']")
  ];
  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box, "touch target has a box").not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("@claim:desktop-walkthrough landing includes three captioned desktop frames", async ({ page }) => {
  await page.goto("/");
  const frames = page.locator(".walkthrough figure");
  await expect(frames).toHaveCount(3);
  await expect(frames.locator("img")).toHaveCount(3);
  await expect(frames.locator("figcaption")).toHaveCount(3);
  for (const frame of await frames.all()) await expect(frame.locator("img")).toBeVisible();
});
