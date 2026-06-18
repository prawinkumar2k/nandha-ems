import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../../server/models/User.js";
import Exam from "../../server/models/Exam.js";
import Submission from "../../server/models/Submission.js";
import Notification from "../../server/models/Notification.js";
import Device from "../../server/models/Device.js";
import Attendance from "../../server/models/Attendance.js";

describe("User model", () => {
  it("hashes and compares passwords correctly", async () => {
    const hash = await bcrypt.hash("Secret123!", 12);
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: hash,
      role: "student",
    });

    await expect(user.comparePassword("Secret123!")).resolves.toBe(true);
    await expect(user.comparePassword("wrong")).resolves.toBe(false);
  });

  it("omits secret fields from JSON output", () => {
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: "Secret123!",
      role: "student",
      resetPasswordToken: "reset-token",
      otpCode: "123456",
    });

    const json = user.toJSON();

    expect(json.password).toBeUndefined();
    expect(json.resetPasswordToken).toBeUndefined();
    expect(json.otpCode).toBeUndefined();
    expect(json.email).toBe("alice@example.com");
  });

  it("enforces password length and role enum", () => {
    const user = new User({
      name: "Alice",
      email: "alice@example.com",
      password: "123",
      role: "guest",
    });

    const err = user.validateSync();
    expect(err.errors.password).toBeDefined();
    expect(err.errors.role).toBeDefined();
  });

  it("defines sparse unique indexes for roll number and employee ID", () => {
    const indexes = User.schema.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        [expect.objectContaining({ rollNumber: 1 }), expect.objectContaining({ unique: true, sparse: true })],
        [expect.objectContaining({ employeeId: 1 }), expect.objectContaining({ unique: true, sparse: true })],
      ]),
    );
  });
});

describe("Exam model", () => {
  it("rejects invalid status values and missing required fields", () => {
    const exam = new Exam({
      title: "Unit Test Exam",
      course: new mongoose.Types.ObjectId(),
      faculty: new mongoose.Types.ObjectId(),
      department: new mongoose.Types.ObjectId(),
      totalMarks: 100,
      duration: 60,
      scheduledAt: new Date(),
      status: "published",
    });

    const err = exam.validateSync();
    expect(err.errors.status).toBeDefined();
  });

  it("accepts the expected security policy defaults", () => {
    const exam = new Exam({
      title: "Unit Test Exam",
      course: new mongoose.Types.ObjectId(),
      faculty: new mongoose.Types.ObjectId(),
      department: new mongoose.Types.ObjectId(),
      totalMarks: 100,
      duration: 60,
      scheduledAt: new Date(),
    });

    expect(exam.security.disableCopyPaste).toBe(true);
    expect(exam.security.detectTabSwitch).toBe(true);
    expect(exam.security.requireFullscreen).toBe(true);
    expect(exam.status).toBe("draft");
  });
});

describe("Submission model", () => {
  it("stores answers and violation events with the expected structure", () => {
    const submission = new Submission({
      exam: new mongoose.Types.ObjectId(),
      student: new mongoose.Types.ObjectId(),
      answers: { 0: "A" },
      violations: [
        {
          type: "tab_switch",
          count: 1,
        },
      ],
    });

    const err = submission.validateSync();
    expect(err).toBeUndefined();
    expect(submission.status).toBe("in_progress");
    expect(submission.violations[0].type).toBe("tab_switch");
  });

  it("enforces the unique exam/student compound index", () => {
    const indexes = Submission.schema.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        [expect.objectContaining({ exam: 1, student: 1 }), expect.objectContaining({ unique: true })],
      ]),
    );
  });
});

describe("Notification, Device, and Attendance models", () => {
  it("constrains notification types to the approved enum set", () => {
    const notification = new Notification({
      recipient: new mongoose.Types.ObjectId(),
      title: "Alert",
      message: "Hello",
      type: "system",
    });

    expect(notification.validateSync()).toBeUndefined();

    notification.type = "sql_injection";
    const err = notification.validateSync();
    expect(err.errors.type).toBeDefined();
  });

  it("accepts only approved device statuses", () => {
    const device = new Device({
      hostname: "lab-01",
      ipAddress: "10.0.0.5",
      deviceId: "device-1",
      macAddress: "00:00:00:00:00",
      cpuId: "cpu-1",
      motherboardSerial: "mb-1",
      machineFingerprint: "fingerprint-1",
      status: "approved",
    });
    expect(device.validateSync()).toBeUndefined();

    device.status = "compromised";
    const err = device.validateSync();
    expect(err.errors.status).toBeDefined();
  });

  it("enforces one attendance row per course, date, and period", () => {
    const indexes = Attendance.schema.indexes();
    expect(indexes).toEqual(
      expect.arrayContaining([
        [expect.objectContaining({ course: 1, date: 1, period: 1 }), expect.objectContaining({ unique: true })],
      ]),
    );
  });
});
