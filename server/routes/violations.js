import Violation from "../models/Violation.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";
import { notifyViolation } from "../socket.js";
import { saveScreenshot } from "../utils/screenshotStorage.js";

export const handleCreateViolation = async (req, res) => {
  try {
    const { examId, type, screenshot, message, severity } = req.body;
    
    console.log(`[VIOLATION] Incoming: ${type} from exam ${examId}`);
    console.log(`[AUTH] req.user details:`, JSON.stringify(req.user));
    console.log(`[BODY] Request body:`, JSON.stringify(req.body));
    
    const studentId = req.user?.id || req.user?._id;
    if (!studentId) {
      console.error("❌ ABORTING: No student ID found in req.user");
      return res.status(401).json({ message: "Student identity missing from token" });
    }

    console.log(`[VIOLATION] Incoming: ${type} from student ${studentId} for exam ${examId}`);


    // Get student info for socket broadcast
    const student = await User.findById(studentId).select("name rollNumber");
    const studentName = student ? student.name : "Unknown Student";

    // Save screenshot to GridFS if provided as base64
    let screenshotUrl = "";
    if (screenshot && (screenshot.startsWith("data:image") || screenshot.length > 1000)) {
      const filename = `${studentId}_${examId}_${Date.now()}.jpg`;
      const fileId = await saveScreenshot(screenshot, filename);
      if (fileId) {
        screenshotUrl = `/api/screenshots/${fileId}`;
      } else {
        return res.status(400).json({ message: "Invalid evidence format. Only valid JPEG and PNG images are allowed." });
      }
    } else if (screenshot) {
      screenshotUrl = screenshot;
    }

    // Create violation record
    const activeExam = await Exam.findById(examId);
    
    const violation = new Violation({
      student: studentId,
      exam: examId,
      department: req.user.department || activeExam?.department,
      type,
      message: message || `Violation detected: ${type.replace('_', ' ')}`,
      screenshot: screenshotUrl,
      severity: severity || "medium"
    });

    await violation.save();

    // Notify proctors via socket
    notifyViolation({
      ...violation.toObject(),
      studentName,
      studentRoll: student?.rollNumber
    });

    res.status(201).json({ success: true, violation });
  } catch (err) {
    console.error("Violation Creation Error:", err.message);
    res.status(500).json({ error: "Failed to log violation" });
  }
};

export const handleGetViolations = async (req, res) => {
  try {
    let query = {};

    // Faculty/HOD only see their department
    if (req.user.role !== "admin") {
      const deptId = req.user.department?._id || req.user.department;
      if (deptId) {
        query.department = deptId;
      }
    }

    const violations = await Violation.find(query)
      .populate("student", "name rollNumber")
      .populate("exam", "title")
      .sort({ createdAt: -1 })
      .lean();

    res.json(violations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
