import { describe, it, expect } from "vitest";
import { sanitizeBrief, formatUUID } from "./utils.js";
import { IPCError, CapabilityDeniedError } from "./errors.js";

describe("@sidra/sdk utils", () => {
  it("sanitizes briefs over word limit", () => {
    const text = "word ".repeat(700);
    const result = sanitizeBrief(text, 600);
    const wordCount = result.replace("...", "").trim().split(/\s+/).length;
    expect(wordCount).toBe(600);
    expect(result.endsWith("...")).toBe(true);
  });

  it("leaves briefs under word limit untouched", () => {
    const text = "Valid short brief.";
    const result = sanitizeBrief(text, 600);
    expect(result).toBe("Valid short brief.");
  });

  it("formats UUID string", () => {
    const uuid = formatUUID();
    expect(typeof uuid).toBe("string");
    expect(uuid.length).toBeGreaterThan(0);
  });
});

describe("@sidra/sdk errors", () => {
  it("instantiates IPCError correctly", () => {
    const err = new IPCError("System fault", "ERR_SYS", "trc-123");
    expect(err.message).toContain("System fault");
    expect(err.code).toBe("ERR_SYS");
    expect(err.traceId).toBe("trc-123");
  });

  it("instantiates CapabilityDeniedError correctly", () => {
    const err = new CapabilityDeniedError("/secrets", "READ");
    expect(err.code).toBe("CAPABILITY_DENIED");
    expect(err.message).toContain("Permission Broker");
  });
});
