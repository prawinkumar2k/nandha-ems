import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleRunCode, handleCheckCompilers } from "../../../server/routes/code.js";
import { executeCode } from "../../../server/utils/codeExecutor.js";
import { createMockReq, createMockRes } from "../../helpers.js";

vi.mock("../../../server/utils/codeExecutor.js", () => ({
  executeCode: vi.fn(),
}));

vi.mock("child_process", () => ({
  exec: vi.fn((cmd, options, callback) => {
    callback(null, "", "");
  }),
}));

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

  it("blocks dangerous code patterns before execution", async () => {
    const req = createMockReq({
      body: {
        language: "javascript",
        code: 'const cp = require("child_process");',
      },
    });
    const res = createMockRes();

    await handleRunCode(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      output: "",
      error: expect.stringContaining("Dangerous keyword detected"),
    });
    expect(executeCode).not.toHaveBeenCalled();
  });

  it("executes safe code and returns the sandbox result", async () => {
    vi.mocked(executeCode).mockResolvedValue({
      output: "42",
      error: "",
    });
    const req = createMockReq({
      body: {
        language: "javascript",
        code: "console.log(42);",
        input: "",
      },
    });
    const res = createMockRes();

    await handleRunCode(req, res);

    expect(executeCode).toHaveBeenCalledWith("javascript", "console.log(42);", "");
    expect(res.json).toHaveBeenCalledWith({
      output: "42",
      error: "",
    });
  });

  it("surfaces executor crashes as a generic 500", async () => {
    vi.mocked(executeCode).mockRejectedValue(new Error("boom"));
    const req = createMockReq({
      body: {
        language: "javascript",
        code: "console.log('x')",
      },
    });
    const res = createMockRes();

    await handleRunCode(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error during code execution.",
    });
  });

  it("returns compiler availability for the supported toolchains", async () => {
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
