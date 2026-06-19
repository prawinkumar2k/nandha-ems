import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleRunCode, handleCheckCompilers } from "../../../server/routes/code.js";
import { createMockReq, createMockRes } from "../../helpers.js";

describe("code execution routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects missing language or code", async () => {
    const req = createMockReq({ body: { language: "javascript" } });
    const res = createMockRes();

    await handleRunCode(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Language and code are required.",
    });
  });

  it("returns execution output for supported languages", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stdout: "42\n", stderr: "" })
    });
    const req = createMockReq({ body: { language: "javascript", code: "console.log(42);" } });
    const res = createMockRes();

    await handleRunCode(req, res);
    expect(res.json).toHaveBeenCalledWith({ output: "42\n", error: "" });
  });

  it("surfaces execution errors from Judge0", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Some error" })
    });
    const req = createMockReq({ body: { language: "javascript", code: "console.log('x')" } });
    const res = createMockRes();

    await handleRunCode(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("surfaces fetch crashes as a generic 500", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("boom"));
    const req = createMockReq({ body: { language: "javascript", code: "console.log('x')" } });
    const res = createMockRes();

    await handleRunCode(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error connecting to Judge0.",
    });
  });

  it("returns compiler availability for the supported toolchains", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
    const req = createMockReq();
    const res = createMockRes();

    await handleCheckCompilers(req, res);

    expect(res.json).toHaveBeenCalledWith({
      compilers: {
        javascript: true,
        python: true,
        java: true,
        rust: true,
        c: true,
        cpp: true,
        bash: true,
      },
    });
  });
});
