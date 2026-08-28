// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { cachedUnlock, captureReturnedLicense, saveLicense, savedLicense } from "./license";

describe("license storage", () => {
  beforeEach(() => localStorage.clear());
  it("captures a returned token locally", () => {
    captureReturnedLicense(new URL("https://example.test/?license=token-123"));
    expect(savedLicense()).toBe("token-123");
  });
  it("does not unlock from a token without a verified verdict", () => {
    saveLicense("token");
    expect(cachedUnlock()).toBe(false);
  });
});
