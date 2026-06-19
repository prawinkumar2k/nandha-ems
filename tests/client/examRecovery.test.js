import { describe, it, expect } from "vitest";
import {
  mergeExamAnswers,
  computeRemainingSeconds,
} from "../../client/core/utils/examRecovery.js";

describe("mergeExamAnswers", () => {
  it("merges server, offline, and local with local winning conflicts", () => {
    const merged = mergeExamAnswers({
      server: { 0: "A", 1: "B" },
      offline: { 1: "B-offline", 2: "C" },
      local: { 2: "C-local", 3: "D" },
    });
    expect(merged).toEqual({ 0: "A", 1: "B-offline", 2: "C-local", 3: "D" });
  });

  it("never creates duplicate keys", () => {
    const merged = mergeExamAnswers({
      server: Object.fromEntries(Array.from({ length: 15 }, (_, i) => [i, `s${i}`])),
      local: { 14: "local-14", 15: "local-15" },
    });
    expect(new Set(Object.keys(merged)).size).toBe(Object.keys(merged).length);
    expect(merged[14]).toBe("local-14");
    expect(merged[15]).toBe("local-15");
  });

  it("handles null/invalid inputs", () => {
    expect(mergeExamAnswers()).toEqual({});
    expect(mergeExamAnswers({ server: null, offline: "bad", local: [] })).toEqual({});
  });
});

describe("computeRemainingSeconds", () => {
  it("returns full duration when startedAt is missing", () => {
    expect(computeRemainingSeconds(null, 60)).toBe(3600);
  });

  it("subtracts elapsed time from duration", () => {
    const startedAt = new Date("2026-06-19T10:00:00Z");
    const now = new Date("2026-06-19T10:15:00Z");
    expect(computeRemainingSeconds(startedAt, 60, now)).toBe(2700);
  });

  it("never returns negative seconds", () => {
    const startedAt = new Date("2026-06-19T09:00:00Z");
    const now = new Date("2026-06-19T11:00:00Z");
    expect(computeRemainingSeconds(startedAt, 60, now)).toBe(0);
  });
});
