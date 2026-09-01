import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const realStatus = { sources: [], document_count: 0, locked: false, encrypted: false, last_indexed: null, demo: false };
const demoStatus = {
  sources: [{ path: "/sample/demo-sample", document_count: 5, last_indexed: "2026-08-30T09:42:00Z", errors: [] }],
  document_count: 5,
  locked: false,
  encrypted: false,
  last_indexed: "2026-08-30T09:42:00Z",
  demo: true
};

async function installBridge(page: Page, initial = realStatus) {
  await page.addInitScript(({ initialStatus, sampleStatus }) => {
    let status = structuredClone(initialStatus);
    (window as unknown as { __TAURI_INTERNALS__: { invoke(command: string, args?: Record<string, unknown>): Promise<unknown> } }).__TAURI_INTERNALS__ = {
      async invoke(command, args = {}) {
        if (command === "get_status") return structuredClone(status);
        if (command === "load_sample_project" || command === "reset_sample_project") { status = structuredClone(sampleStatus); return structuredClone(status); }
        if (command === "leave_sample_project") { status = structuredClone(initialStatus); return structuredClone(status); }
        if (command === "set_encryption") { status.encrypted = Boolean(args.enabled); return null; }
        if (command === "search_index") return [];
        if (command === "refresh_all" || command === "remove_source") return null;
        throw new Error(`Unexpected test bridge command: ${command}`);
      }
    };
  }, { initialStatus: initial, sampleStatus: demoStatus });
}

test("real mode never shows the demo banner and leaving demo clears it", async ({ page }) => {
  await installBridge(page);
  await page.goto("http://127.0.0.1:1420/");
  const banner = page.locator("#demo-banner");
  await expect(banner).toBeHidden();
  await page.getByRole("button", { name: "Load sample project" }).click();
  await expect(banner).toBeVisible();
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(banner).toBeHidden();
  await expect(page.getByRole("heading", { name: "Choose the first place to search" })).toBeVisible();
});

test("system light theme keeps desktop chrome readable", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await installBridge(page, { ...demoStatus, demo: false });
  await page.goto("http://127.0.0.1:1420/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  expect(await page.locator(".topbar").evaluate((element) => getComputedStyle(element).backgroundColor)).toContain("243, 248, 247");
  expect(await page.locator(".source-rail").evaluate((element) => getComputedStyle(element).backgroundColor)).toContain("255, 255, 255");
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact || ""))).toEqual([]);
});

test("390px source drawer is modal, traps focus, closes with Escape, and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installBridge(page, { ...demoStatus, demo: false });
  await page.goto("http://127.0.0.1:1420/");
  const trigger = page.getByRole("button", { name: /Sources/ });
  const rail = page.locator("#source-rail");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(rail).toHaveAttribute("aria-hidden", "true");
  await expect(rail).toHaveJSProperty("inert", true);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(rail).toHaveAttribute("role", "dialog");
  await expect(page.getByRole("button", { name: "Close sources" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Add exports" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close sources" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(rail).toHaveJSProperty("inert", true);
});

test("encryption control names the action it will take", async ({ page }) => {
  await installBridge(page, { ...realStatus, encrypted: true });
  await page.goto("http://127.0.0.1:1420/");
  await page.getByRole("button", { name: "Open settings" }).click();
  await expect(page.getByRole("button", { name: "Disable encryption" })).toBeVisible();
  await page.getByRole("button", { name: "Disable encryption" }).click();
  await expect(page.getByRole("button", { name: "Enable encryption" })).toBeVisible();
});
