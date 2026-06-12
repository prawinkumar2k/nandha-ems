import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../../../server/models/User.js";
import {
  handleLogin,
  handleLogout,
} from "../../../server/routes/auth.js";
import {
  handleGetProfile,
  handleUpdateProfile,
  handleChangePassword,
  handleUploadProfilePic,
} from "../../../server/routes/profile.js";
import { createMockReq, createMockRes } from "../../helpers.js";

describe("auth route handlers", () => {
  const originalModel = mongoose.model;
  const loginLogCreate = vi.fn();
  const userRecord = {
    _id: new mongoose.Types.ObjectId("64b000000000000000000001"),
    name: "Jane Doe",
    email: "jane@example.com",
    role: "student",
    department: new mongoose.Types.ObjectId("64b000000000000000000002"),
    profilePic: "/avatar.jpg",
    mustChangePassword: true,
    isActive: true,
    comparePassword: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    loginLogCreate.mockReset();
    userRecord.comparePassword.mockReset();
    userRecord.save.mockReset();
    userRecord.lastLogin = undefined;
  });

  afterEach(() => {
    mongoose.model = originalModel;
  });

  it("rejects missing login fields", async () => {
    const req = createMockReq({ body: {} });
    const res = createMockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email and password are required",
    });
  });

  it("returns 401 for unknown users and writes a failed login log", async () => {
    const userModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      }),
    };
    mongoose.model = vi.fn((name) => {
      if (name === "User") return userModel;
      if (name === "LoginLog") return { create: loginLogCreate };
      throw new Error(`Unexpected model: ${name}`);
    });

    const req = createMockReq({
      body: { email: "missing@example.com", password: "pw" },
      headers: { "user-agent": "vitest" },
      ip: "127.0.0.1",
    });
    const res = createMockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(loginLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "missing@example.com",
        status: "failed",
        failReason: "user_not_found",
        ipAddress: "127.0.0.1",
      }),
    );
  });

  it("returns 401 for wrong passwords and logs the failure", async () => {
    userRecord.comparePassword.mockResolvedValue(false);
    const userModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(userRecord),
      }),
    };
    mongoose.model = vi.fn((name) => {
      if (name === "User") return userModel;
      if (name === "LoginLog") return { create: loginLogCreate };
      throw new Error(`Unexpected model: ${name}`);
    });

    const req = createMockReq({
      body: { email: "jane@example.com", password: "wrong" },
      headers: { "user-agent": "vitest" },
      ip: "127.0.0.1",
    });
    const res = createMockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(loginLogCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        user: userRecord._id,
        email: "jane@example.com",
        failReason: "wrong_password",
      }),
    );
  });

  it("blocks inactive accounts", async () => {
    userRecord.isActive = false;
    userRecord.comparePassword.mockResolvedValue(true);
    const userModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(userRecord),
      }),
    };
    mongoose.model = vi.fn((name) => {
      if (name === "User") return userModel;
      if (name === "LoginLog") return { create: loginLogCreate };
      throw new Error(`Unexpected model: ${name}`);
    });

    const req = createMockReq({
      body: { email: "jane@example.com", password: "pw" },
    });
    const res = createMockRes();

    await handleLogin(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Account is deactivated" });
  });

  it("returns a signed token and user payload on success", async () => {
    userRecord.isActive = true;
    userRecord.comparePassword.mockResolvedValue(true);
    userRecord.save.mockResolvedValue(undefined);
    const signSpy = vi.spyOn(jwt, "sign").mockReturnValue("signed-token");
    const userModel = {
      findOne: vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(userRecord),
      }),
    };
    mongoose.model = vi.fn((name) => {
      if (name === "User") return userModel;
      if (name === "LoginLog") return { create: loginLogCreate };
      throw new Error(`Unexpected model: ${name}`);
    });

    const req = createMockReq({
      body: { email: "jane@example.com", password: "pw" },
      headers: { "user-agent": "vitest" },
      ip: "127.0.0.1",
    });
    const res = createMockRes();

    await handleLogin(req, res);

    expect(signSpy).toHaveBeenCalledWith(
      { id: userRecord._id.toString(), role: "student", dept: userRecord.department },
      "fallback_secret_keep_it_safe",
      { expiresIn: "24h" },
    );
    expect(userRecord.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: "signed-token",
        user: expect.objectContaining({
          id: userRecord._id,
          name: "Jane Doe",
          email: "jane@example.com",
          role: "student",
        }),
      }),
    );
  });

  it("logout returns the expected response envelope", () => {
    const req = createMockReq();
    const res = createMockRes();

    handleLogout(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
  });
});

describe("profile route handlers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 404 when the profile does not exist", async () => {
    const findByIdSpy = vi.spyOn(User, "findById").mockReturnValue({
      populate: vi.fn().mockResolvedValue(null),
    });
    const req = createMockReq({ user: { id: "64b000000000000000000010" } });
    const res = createMockRes();

    await handleGetProfile(req, res);

    expect(findByIdSpy).toHaveBeenCalledWith("64b000000000000000000010");
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("filters profile updates to the allowed field list", async () => {
    const updateSpy = vi.spyOn(User, "findByIdAndUpdate").mockResolvedValue({
      id: "u1",
    });
    const req = createMockReq({
      user: { id: "u1" },
      body: {
        name: "Updated Name",
        phone: "12345",
        profilePic: "/new.png",
        semester: "6",
        academicYear: "2025-2026",
        cgpa: 8.9,
        designation: "Professor",
        specialization: "Security",
        office: "Room 101",
        email: "should-not-change@example.com",
        role: "admin",
        isActive: false,
        password: "nope",
      },
    });
    const res = createMockRes();

    await handleUpdateProfile(req, res);

    expect(updateSpy).toHaveBeenCalledWith(
      "u1",
      {
        $set: {
          name: "Updated Name",
          phone: "12345",
          profilePic: "/new.png",
          semester: "6",
          academicYear: "2025-2026",
          cgpa: 8.9,
          designation: "Professor",
          specialization: "Security",
          office: "Room 101",
        },
      },
      { new: true },
    );
    expect(res.json).toHaveBeenCalledWith({
      message: "Profile updated successfully",
      user: { id: "u1" },
    });
  });

  it("rejects a password change when the old password does not match", async () => {
    const user = {
      comparePassword: vi.fn().mockResolvedValue(false),
      save: vi.fn(),
    };
    vi.spyOn(User, "findById").mockResolvedValue(user);
    const req = createMockReq({
      user: { id: "u1" },
      body: { oldPassword: "bad", newPassword: "new-secret" },
    });
    const res = createMockRes();

    await handleChangePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid old password" });
    expect(user.save).not.toHaveBeenCalled();
  });

  it("updates the password and clears the must-change flag", async () => {
    const user = {
      password: "old",
      mustChangePassword: true,
      comparePassword: vi.fn().mockResolvedValue(true),
      save: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(User, "findById").mockResolvedValue(user);
    const req = createMockReq({
      user: { id: "u1" },
      body: { oldPassword: "old", newPassword: "new-secret" },
    });
    const res = createMockRes();

    await handleChangePassword(req, res);

    expect(user.password).toBe("new-secret");
    expect(user.mustChangePassword).toBe(false);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password updated successfully",
    });
  });

  it("uploads profile pictures without exposing extra fields", async () => {
    const updateSpy = vi.spyOn(User, "findByIdAndUpdate").mockResolvedValue({});
    const req = createMockReq({
      user: { id: "u1" },
      body: { image: "data:image/png;base64,AAAA" },
    });
    const res = createMockRes();

    await handleUploadProfilePic(req, res);

    expect(updateSpy).toHaveBeenCalledWith("u1", {
      profilePic: "data:image/png;base64,AAAA",
    });
    expect(res.json).toHaveBeenCalledWith({
      message: "Profile image updated successfully",
    });
  });
});
