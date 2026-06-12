import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { authMiddleware, roleMiddleware } from "../../../server/middleware/auth.js";
import { createMockReq, createMockRes } from "../../helpers.js";

describe("auth middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects missing bearer token", () => {
    const req = createMockReq({ headers: {} });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Authentication required" });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects malformed authorization header", () => {
    const req = createMockReq({ headers: { authorization: "Token abc" } });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches normalized user data from a valid token", () => {
    const token = jwt.sign(
      { _id: "user-1", role: "faculty", department: "dept-9" },
      "fallback_secret_keep_it_safe",
      { expiresIn: "1h" },
    );
    const req = createMockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({
      _id: "user-1",
      role: "faculty",
      department: "dept-9",
      id: "user-1",
      dept: "dept-9",
    });
  });

  it("rejects expired or invalid tokens", () => {
    const token = jwt.sign(
      { id: "user-1", role: "student" },
      "fallback_secret_keep_it_safe",
      { expiresIn: "-1s" },
    );
    const req = createMockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = createMockRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("role middleware", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows users whose role is in the allow-list", () => {
    const req = createMockReq({ user: { role: "admin" } });
    const res = createMockRes();
    const next = vi.fn();

    roleMiddleware(["admin", "hod"])(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects users with disallowed roles", () => {
    const req = createMockReq({ user: { role: "student" } });
    const res = createMockRes();
    const next = vi.fn();

    roleMiddleware(["admin"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Higher authority required" });
    expect(next).not.toHaveBeenCalled();
  });
});
