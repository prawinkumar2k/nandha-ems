import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimiter, getCorsOptions } from "../../../server/middleware/security.js";
import { validateCodeSecurity } from "../../../server/utils/codeExecutor.js";
import { createMockReq, createMockRes } from "../../helpers.js";

describe("rateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("allows requests up to the configured limit and blocks the next one", () => {
    const middleware = rateLimiter({
      max: 2,
      windowMs: 60_000,
      message: { message: "blocked" },
    });
    const req = createMockReq({ ip: "10.0.0.1" });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ message: "blocked" });
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(Number));
  });

  it("resets the window after expiry", () => {
    const middleware = rateLimiter({ max: 1, windowMs: 1_000 });
    const req = createMockReq({ ip: "10.0.0.2" });
    const res = createMockRes();
    const next = vi.fn();

    middleware(req, res, next);
    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(429);

    vi.advanceTimersByTime(1_100);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
  });
});

describe("getCorsOptions", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalOrigins = process.env.ALLOWED_ORIGINS;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ALLOWED_ORIGINS = originalOrigins;
  });

  it("allows known origins and requests without origin", () => {
    process.env.ALLOWED_ORIGINS = "https://example.com,https://app.local";
    process.env.NODE_ENV = "production";
    const { origin } = getCorsOptions();

    const callback = vi.fn();
    origin("https://example.com", callback);
    expect(callback).toHaveBeenCalledWith(null, true);

    const noOriginCallback = vi.fn();
    origin(undefined, noOriginCallback);
    expect(noOriginCallback).toHaveBeenCalledWith(null, true);
  });

  it("rejects unknown origins in production", () => {
    process.env.ALLOWED_ORIGINS = "https://example.com";
    process.env.NODE_ENV = "production";
    const { origin } = getCorsOptions();

    const callback = vi.fn();
    origin("https://evil.example", callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("allows any origin outside production", () => {
    process.env.NODE_ENV = "development";
    delete process.env.ALLOWED_ORIGINS;
    const { origin } = getCorsOptions();

    const callback = vi.fn();
    origin("https://evil.example", callback);
    expect(callback).toHaveBeenCalledWith(null, true);
  });
});

describe("validateCodeSecurity", () => {
  it("allows safe JavaScript snippets", () => {
    expect(validateCodeSecurity("javascript", "console.log(42);")).toEqual({
      safe: true,
    });
  });

  it("blocks JavaScript access to process and eval", () => {
    const blocked = validateCodeSecurity("javascript", "process.exit(1);");
    expect(blocked.safe).toBe(false);
    expect(blocked.reason).toContain("Dangerous pattern detected");
  });

  it("blocks Python file and subprocess access", () => {
    const blocked = validateCodeSecurity("python", "import subprocess\nprint('x')");
    expect(blocked.safe).toBe(false);
  });

  it("blocks shell chaining and destructive commands", () => {
    const blocked = validateCodeSecurity("bash", "cat a.txt && rm -rf /tmp/test");
    expect(blocked.safe).toBe(false);
  });
});
