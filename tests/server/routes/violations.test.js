import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import { handleCreateViolation } from "../../../server/routes/violations.js";
import { createMockReq, createMockRes } from "../../helpers.js";

// Mock saveScreenshot, but wait, we want to test saveScreenshot integration!
// We shouldn't mock saveScreenshot, we want to run the real saveScreenshot.
import { saveScreenshot } from "../../../server/utils/screenshotStorage.js";

describe("Violations API - Upload Validation End-to-End", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should allow valid JPEG screenshot upload", async () => {
    // Valid JPEG starts with FFD8FF
    const validJpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABkAGQDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAaEAACAwEBAAAAAAAAAAAAAAAAAQIQETFB/8QAFAAQAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AJQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//Z";
    
    const userId = new mongoose.Types.ObjectId();
    const examObjId = new mongoose.Types.ObjectId();
    const userMock = { _id: userId, name: "Student", rollNumber: "R1" };
    const examMock = { _id: examObjId, title: "Test Exam" };
    mongoose.model = vi.fn((name) => {
      if (name === "User") return { findById: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(userMock) }) };
      if (name === "Exam") return { findById: vi.fn().mockResolvedValue(examMock) };
      if (name === "Violation") return function() { return { save: vi.fn().mockResolvedValue(true), toObject: vi.fn().mockReturnValue({}) }; };
      throw new Error(`Unexpected model: ${name}`);
    });

    const req = createMockReq({
      body: {
        examId: examObjId,
        type: "periodic_snapshot",
        message: "Test upload",
        screenshot: validJpeg
      },
      user: { id: userId }
    });
    
    // Stub out the GridFS bucket to simulate success if saveScreenshot reaches bucket
    vi.mock("../../../server/utils/screenshotStorage.js", async (importOriginal) => {
      const actual = await importOriginal();
      return {
        ...actual,
        // Actually we want the real saveScreenshot to run, but maybe we have to mock the Bucket inside.
        // The real function uses getBucket().
      };
    });

    // Instead of full E2E which fails on DB, let's mock mongoose connection for saveScreenshot
    mongoose.connection = { 
      readyState: 1, 
      db: {} 
    };
    mongoose.mongo = {
      GridFSBucket: class {
        openUploadStream() {
          return {
            id: "fake_file_id",
            on: function(event, cb) {
               if (event === "finish") setTimeout(cb, 10);
               return this;
            }
          };
        }
      }
    };

    const res = createMockRes();

    await handleCreateViolation(req, res);

    // Should respond 201 Created and save the screenshot
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true
      })
    );
  });

  it("should reject a PDF disguised as a JPEG", async () => {
    const fakeJpegPdf = "data:image/jpeg;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCj...";
    const userId = new mongoose.Types.ObjectId();
    const examObjId = new mongoose.Types.ObjectId();
    
    const req = createMockReq({
      body: { examId: examObjId, type: "periodic_snapshot", screenshot: fakeJpegPdf },
      user: { id: userId }
    });
    const res = createMockRes();

    await handleCreateViolation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid evidence format. Only valid JPEG and PNG images are allowed." });
  });

  it("should reject an EXE disguised as a PNG", async () => {
    const fakePngExe = "data:image/png;base64,TVqQAAMAAAAEAAAA//8AALgAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAA4fug4AtAnNIbgBTM0hVGhpcyBwcm9ncmFtIGNhbm5vdCBiZSBydW4gaW4gRE9TIG1vZGUuDQ0KJAAAAAAAAABQRQAATAEDAAAAAAAQAQAAAAkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA...";
    const userId = new mongoose.Types.ObjectId();
    const examObjId = new mongoose.Types.ObjectId();
    
    const req = createMockReq({
      body: { examId: examObjId, type: "periodic_snapshot", screenshot: fakePngExe },
      user: { id: userId }
    });
    const res = createMockRes();

    await handleCreateViolation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid evidence format. Only valid JPEG and PNG images are allowed." });
  });
});
