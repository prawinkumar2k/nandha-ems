import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import {
  handleStartExam,
  handleUpdateAnswers,
  handleSubmitExam,
} from "../../../server/routes/submissions.js";
import {
  handleCreateHODExam,
  handleApproveHODExam,
} from "../../../server/routes/hod.js";
import { createMockReq, createMockRes } from "../../helpers.js";

const io = {
  emit: vi.fn(),
  to: vi.fn(() => ({ emit: vi.fn() })),
};

const models = {
  Submission: {
    findOne: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    aggregate: vi.fn(),
  },
  Exam: {
    findById: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
  },
  Course: {
    findOne: vi.fn(),
  },
  Notification: {
    create: vi.fn(),
  },
  User: {
    findById: vi.fn(),
  },
};

vi.spyOn(mongoose, "model").mockImplementation((name) => {
  const model = models[name];
  if (!model) throw new Error(`Unexpected model ${name}`);
  return model;
});

function resetModels() {
  Object.values(models).forEach((model) => {
    Object.values(model).forEach((fn) => fn.mockReset?.());
  });
  io.emit.mockClear();
  io.to.mockClear();
}

describe("submission lifecycle", () => {
  beforeEach(() => {
    resetModels();
  });

  it("creates a new in-progress submission for a fresh exam session", async () => {
    models.Submission.findOne.mockResolvedValue(null);
    models.Exam.findById.mockResolvedValue({ _id: "exam-1", title: "Exam 1", status: "active", allowedStudents: [] });
    models.Submission.create.mockResolvedValue({
      _id: "sub-1",
      status: "in_progress",
      exam: "exam-1",
      student: "student-1",
    });

    const req = createMockReq({
      body: { examId: "exam-1", deviceId: "device-1" },
      user: { id: "student-1", name: "Student" },
      app: { get: () => io },
      ip: "127.0.0.1",
    });
    const res = createMockRes();

    await handleStartExam(req, res);

    expect(models.Submission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student: "student-1",
        exam: "exam-1",
        status: "in_progress",
        device: "device-1",
        ipAddress: "127.0.0.1",
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "in_progress" }),
    );
  });

  it("blocks re-starting a submission that was already submitted", async () => {
    models.Exam.findById.mockResolvedValue({ _id: "exam-1", title: "Exam 1", status: "active", allowedStudents: [] });
    models.Submission.findOne.mockResolvedValue({
      status: "submitted",
    });

    const req = createMockReq({
      body: { examId: "exam-1" },
      user: { id: "student-1" },
      app: { get: () => io },
    });
    const res = createMockRes();

    await handleStartExam(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Exam already submitted" });
  });

  it("updates answers and emits violation telemetry", async () => {
    const submission = {
      _id: "sub-1",
      exam: "exam-1",
      student: "student-1",
      answers: {},
      violations: [],
      totalViolations: 0,
      save: vi.fn().mockResolvedValue(undefined),
      markModified: vi.fn(),
    };
    models.Submission.findById.mockResolvedValue(submission);
    models.User.findById.mockResolvedValue({ name: "Student" });

    const req = createMockReq({
      params: { id: "sub-1" },
      body: {
        answers: { 0: "A" },
        violations: [{ type: "tab_switch" }],
      },
      user: { id: "student-1" },
      app: { get: () => io },
    });
    const res = createMockRes();

    await handleUpdateAnswers(req, res);

    expect(submission.answers).toEqual({ 0: "A" });
    expect(submission.totalViolations).toBe(1);
    expect(submission.save).toHaveBeenCalledTimes(1);
    expect(io.emit).toHaveBeenCalledWith(
      "new-violation",
      expect.objectContaining({
        student: "Student",
        exam: "exam-1",
        type: "tab_switch",
        count: 1,
      }),
    );
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("auto-grades MCQ answers on submission", async () => {
    const submission = {
      _id: "sub-1",
      student: "student-1",
      exam: {
        questions: [
          { type: "mcq", correctAnswer: "A", marks: 2 },
          { type: "mcq", correctAnswer: "B", marks: 3 },
        ],
        totalMarks: 5,
        passingMarks: 40,
      },
      answers: { 0: "A", 1: "C" },
      markModified: vi.fn(),
      save: vi.fn().mockResolvedValue(undefined),
    };
    models.Submission.findById.mockReturnValue({
      populate: vi.fn().mockResolvedValue(submission),
    });

    const req = createMockReq({
      params: { id: "sub-1" },
      body: {},
      user: { id: "student-1", name: "Student" },
      app: { get: () => io },
    });
    const res = createMockRes();

    await handleSubmitExam(req, res);

    expect(submission.status).toBe("submitted");
    expect(submission.marksObtained).toBe(2);
    expect(submission.percentage).toBe(40);
    expect(submission.grade).toBe("F");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      score: 2,
      percentage: 40,
      grade: "F",
    });
  });
});

describe("HOD exam management", () => {
  beforeEach(() => {
    resetModels();
  });

  it("rejects HOD exam creation when the course does not exist", async () => {
    models.Course.findOne.mockResolvedValue(null);

    const req = createMockReq({
      body: {
        title: "New exam",
        course: "CS101",
        description: "desc",
        duration: 60,
        scheduledAt: new Date().toISOString(),
        questions: [],
        totalMarks: 100,
      },
      user: { id: "hod-1", dept: "dept-1" },
    });
    const res = createMockRes();

    await handleCreateHODExam(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message:
        "Invalid Course ID or Code. Ensure the course exists in your department.",
    });
  });

  it("creates a department-scoped exam when the course is valid", async () => {
    models.Course.findOne.mockResolvedValue({
      _id: "course-1",
    });
    models.Exam.create.mockResolvedValue({
      _id: "exam-1",
      title: "New exam",
    });

    const req = createMockReq({
      body: {
        title: "New exam",
        course: "CS101",
        description: "desc",
        duration: 60,
        scheduledAt: new Date().toISOString(),
        questions: [],
        totalMarks: 100,
      },
      user: { id: "hod-1", dept: "dept-1" },
    });
    const res = createMockRes();

    await handleCreateHODExam(req, res);

    expect(models.Exam.create).toHaveBeenCalledWith(
      expect.objectContaining({
        course: "course-1",
        faculty: "hod-1",
        department: "dept-1",
        status: "scheduled",
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("approves a department exam and notifies the faculty owner", async () => {
    const exam = {
      _id: "exam-1",
      title: "Exam 1",
      status: "draft",
      faculty: { _id: "faculty-1" },
      approvedByHod: false,
      approvedBy: null,
      isPublished: false,
      save: vi.fn().mockResolvedValue(undefined),
    };
    models.Exam.findOne.mockReturnValue({
      populate: vi.fn().mockResolvedValue(exam),
    });

    const req = createMockReq({
      params: { id: "exam-1" },
      user: { id: "hod-1", dept: "dept-1" },
    });
    const res = createMockRes();

    await handleApproveHODExam(req, res);

    expect(exam.approvedByHod).toBe(true);
    expect(exam.approvedBy).toBe("hod-1");
    expect(exam.status).toBe("scheduled");
    expect(exam.isPublished).toBe(true);
    expect(models.Notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: "faculty-1",
        sender: "hod-1",
        title: "Exam Approved: Exam 1",
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Exam approved successfully",
        exam,
      }),
    );
  });
});
