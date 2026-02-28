import { describe, expect, it } from "vitest";
import { ensureSafeObject, evaluateSafety } from "../lib/safety";

describe("safety validators", () => {
  it("flags and redacts PII", () => {
    const result = evaluateSafety("Email me at kid@example.com or 555-222-1234");
    expect(result.cleanedText).toContain("[redacted]");
    expect(result.flags).toContain("PII_EMAIL");
    expect(result.flags).toContain("PII_PHONE");
  });

  it("blocks external URLs", () => {
    const result = evaluateSafety("go to https://example.com now");
    expect(result.cleanedText).toContain("[link blocked]");
    expect(result.flags).toContain("EXTERNAL_URL");
  });

  it("sanitizes nested objects", () => {
    const result = ensureSafeObject({ scene: { text: "kill and email me at a@b.com" } });
    expect(result.safetyFlags).toContain("BLOCKED_CONTENT");
    expect(result.safetyFlags).toContain("PII_EMAIL");
  });
});
