import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// ─── Route handlers ────────────────────────────────────────────────────────────
import { handleDemo } from "./routes/demo.js";
import { handleLogin, handleLogout } from "./routes/auth.js";
import { handleGetUsers, handleGetUserById, handleBulkUpload, handleCreateUser, handleUpdateUser, handleDeleteUser } from "./routes/users.js";
import { handleGetExams, handleGetExamById } from "./routes/exams.js";
import { handleGetDevices, handleRegisterDevice, handleDeviceHeartbeat } from "./routes/devices.js";
import {
  handleGetSystemStats,
  handleGetFacultyStats,
  handleGetStudentStats,
  handleGetFacultyResults,
  handleGetFacultyMonitoring,
  handleGetStudentResults
} from "./routes/reports.js";
import {
  handleGetHODStats,
  handleGetHODExams,
  handleGetHODFacultyStatus,
  handleGetHODStudentsMonitoring,
  handleGetHODAlerts,
  handleGetHODAnalytics,
  handleCreateHODFaculty,
  handleCreateHODStudent,
  handleHODBulkUpload,
  handleCreateHODExam,
  handleApproveHODExam
} from "./routes/hod.js";
import {
  handleStartExam,
  handleUpdateAnswers,
  handleSubmitExam,
  handleGetSubmissions as handleGetExamSubmissions,
  handleGetSubmissionById,
  handleGetGlobalViolations
} from "./routes/submissions.js";
import { handleGetProfile, handleUpdateProfile, handleChangePassword, handleUploadProfilePic } from "./routes/profile.js";
import { handleGetCourses } from "./routes/courses.js";
import { handleGetDepartments } from "./routes/departments.js";
import { handleLabControl, handleLabLogs } from "./routes/lab.js";
import { handleGetLoginLogs, handleGetActivityLogs } from "./routes/logs.js";
import { handleGetSettings, handleUpdateSettings } from "./routes/settings.js";
import { handleGetQuestions, handleCreateQuestion, handleDeleteQuestion, handleUpdateQuestion } from "./routes/questions.js";
import { handleCreateViolation, handleGetViolations } from "./routes/violations.js";
import { handleGetScreenshot } from "./routes/screenshots.js";
import { handleRunCode, handleCheckCompilers } from "./routes/code.js";
import { handleGetNotifications, handleMarkRead as handleMarkNotificationRead, handleMarkAllRead, handleDeleteNotification, handleArchiveNotification, handleGetPreferences, handleUpdatePreferences } from "./routes/notifications.js";
import { handleCalculateRiskProfiles, handleGetRiskDashboard } from "./routes/analytics.js";
import { handleHeartbeat, startHeartbeatJanitor } from "./routes/heartbeat.js";
import { upload } from "./middleware/upload.js";

import { authMiddleware, roleMiddleware } from "./middleware/auth.js";
import { rateLimiter, getCorsOptions } from "./middleware/security.js";
import { initSocket } from "./socket.js";

// ─── Models (Eager Load — Core Exam Platform Only) ──────────────────────────
import "./models/User.js";
import "./models/Department.js";
import "./models/Course.js";
import "./models/Exam.js";
import "./models/Submission.js";
import "./models/QuestionBank.js";
import "./models/Device.js";
import "./models/Attendance.js";
import "./models/LoginLog.js";
import "./models/ActivityLog.js";
import "./models/Notification.js";
import "./models/NotificationPreference.js";
import "./models/Mark.js";
import "./models/LabSession.js";
import "./models/Lab.js";
import "./models/StudentProfile.js";
import "./models/Settings.js";
import "./models/Violation.js";
import "./models/RiskProfile.js";
import "./models/TokenBlacklist.js"; // ─── SECURITY: Token revocation registry
import "./models/ExamHeartbeat.js";  // ─── SECURITY: Server-side presence tracking

// ─── MongoDB Connection ────────────────────────────────────────────────────────
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️  MONGODB_URI not set.");
    return;
  }
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
      console.log("✅ MongoDB connected:", mongoose.connection.name, "Host:", mongoose.connection.host);
    }
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}

// Initial connection for standard start
connectDB();

// ─── API App ───────────────────────────────────────────────────────────────────
export function createServer() {
  const app = express();
  console.log("🚀 NEClms Secure Examination Platform — Server Active");

  app.use(cors(getCorsOptions()));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // ─── Security Headers, CSP & No-Cache ─────────────────────────────────────
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " +
      "font-src 'self' fonts.gstatic.com data:; " +
      "img-src 'self' data: blob:; " +
      "connect-src 'self' ws: wss: http://localhost:* ws://localhost:*; " +
      "frame-ancestors 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self';"
    );
    res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
    next();
  });

  // ─── Health Check ──────────────────────────────────────────────────────────
  app.get("/api/ping", (req, res) => {
    res.json({ message: "pong", db: mongoose.connection.readyState });
  });
  app.get("/api/demo", handleDemo);

  // ─── Authentication ────────────────────────────────────────────────────────
  app.post("/api/auth/login", rateLimiter({ max: 10, windowMs: 60 * 1000, message: { message: "Too many login attempts, please try again after 60 seconds." } }), handleLogin);
  app.post("/api/auth/logout", handleLogout);

  // ─── Profile Management ────────────────────────────────────────────────────
  app.get("/api/profile", authMiddleware, handleGetProfile);
  app.put("/api/profile", authMiddleware, handleUpdateProfile);
  app.put("/api/profile/password", authMiddleware, handleChangePassword);
  app.post("/api/profile/upload", authMiddleware, upload.single('file'), handleUploadProfilePic);

  // ─── User Management ───────────────────────────────────────────────────────
  app.get("/api/users", authMiddleware, roleMiddleware(["admin", "hod"]), handleGetUsers);
  app.post("/api/users", authMiddleware, roleMiddleware(["admin", "hod"]), handleCreateUser);
  app.post("/api/users/bulk", authMiddleware, roleMiddleware(["admin", "hod"]), handleBulkUpload);
  app.get("/api/users/:id", authMiddleware, handleGetUserById);
  app.put("/api/users/:id", authMiddleware, handleUpdateUser);
  app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), handleDeleteUser);

  // ─── Course & Department (Exam Metadata) ───────────────────────────────────
  app.get("/api/courses", handleGetCourses);
  app.get("/api/departments", handleGetDepartments);

  // ─── Exam Management ───────────────────────────────────────────────────────
  app.get("/api/exams", authMiddleware, handleGetExams);
  app.get("/api/exams/:id", authMiddleware, handleGetExamById);

  // ─── Question Bank ─────────────────────────────────────────────────────────
  app.get("/api/questions", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleGetQuestions);
  app.post("/api/questions", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleCreateQuestion);
  app.put("/api/questions/:id", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleUpdateQuestion);
  app.delete("/api/questions/:id", authMiddleware, roleMiddleware(["faculty", "hod", "admin"]), handleDeleteQuestion);

  // ─── Device & Lab Control ──────────────────────────────────────────────────
  app.get("/api/devices", handleGetDevices);
  app.post("/api/devices/register", handleRegisterDevice);
  app.post("/api/devices/heartbeat", handleDeviceHeartbeat);
  app.post("/api/lab/control", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleLabControl);
  app.post("/api/lab/logs", authMiddleware, handleLabLogs);

  // ─── Exam Delivery & Proctoring ────────────────────────────────────────────
  app.get("/api/submissions/:id", authMiddleware, handleGetSubmissionById);
  app.post("/api/submissions/start", authMiddleware, handleStartExam);
  app.put("/api/submissions/:id/answers", authMiddleware, handleUpdateAnswers);
  app.post("/api/submissions/:id/submit", authMiddleware, handleSubmitExam);
  app.post("/api/exam/heartbeat", authMiddleware, handleHeartbeat); // Server-side session continuity

  // ─── Code Execution (Coding Exam Support) ─────────────────────────────────
  app.post("/api/code/run", authMiddleware, handleRunCode);
  app.get("/api/code/check", handleCheckCompilers);

  // ─── Violations & Evidence ─────────────────────────────────────────────────
  app.post("/api/violations", authMiddleware, rateLimiter({ max: 30, windowMs: 60 * 1000, message: { message: "Too many violation logging requests." } }), handleCreateViolation);
  app.get("/api/violations", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetViolations);
  app.get("/api/screenshots/:fileId", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetScreenshot);

  // ─── Monitoring & Telemetry ────────────────────────────────────────────────
  app.get("/api/exams-telemetry", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetExamSubmissions);
  app.get("/api/logs/violations", authMiddleware, roleMiddleware(["admin", "hod", "faculty"]), handleGetGlobalViolations);

  // ─── Audit Logs ────────────────────────────────────────────────────────────
  app.get("/api/logs/login", authMiddleware, roleMiddleware(["admin"]), handleGetLoginLogs);
  app.get("/api/logs/activity", authMiddleware, roleMiddleware(["admin"]), handleGetActivityLogs);

  // ─── Reports & Analytics ───────────────────────────────────────────────────
  app.get("/api/reports/system", authMiddleware, roleMiddleware(["admin"]), handleGetSystemStats);
  app.get("/api/reports/faculty", authMiddleware, roleMiddleware(["faculty", "hod"]), handleGetFacultyStats);
  app.get("/api/reports/faculty/results", authMiddleware, roleMiddleware(["faculty", "hod"]), handleGetFacultyResults);
  app.get("/api/reports/faculty/monitoring", authMiddleware, roleMiddleware(["faculty", "hod"]), handleGetFacultyMonitoring);
  app.get("/api/reports/student", authMiddleware, roleMiddleware(["student"]), handleGetStudentStats);
  app.get("/api/reports/student/stats", authMiddleware, roleMiddleware(["student"]), handleGetStudentResults);

  // ─── Risk Analytics ────────────────────────────────────────────────────────
  app.post("/api/analytics/calculate-risk", authMiddleware, roleMiddleware(["admin", "hod"]), handleCalculateRiskProfiles);
  app.get("/api/analytics/risk-dashboard", authMiddleware, roleMiddleware(["admin", "hod"]), handleGetRiskDashboard);

  // ─── HOD Management ────────────────────────────────────────────────────────
  app.get("/api/hod/stats", authMiddleware, roleMiddleware(["hod"]), handleGetHODStats);
  app.get("/api/hod/exams", authMiddleware, roleMiddleware(["hod"]), handleGetHODExams);
  app.get("/api/hod/faculty/status", authMiddleware, roleMiddleware(["hod"]), handleGetHODFacultyStatus);
  app.get("/api/hod/students/monitoring", authMiddleware, roleMiddleware(["hod"]), handleGetHODStudentsMonitoring);
  app.get("/api/hod/alerts", authMiddleware, roleMiddleware(["hod"]), handleGetHODAlerts);
  app.get("/api/hod/analytics", authMiddleware, roleMiddleware(["hod"]), handleGetHODAnalytics);
  app.post("/api/hod/faculty", authMiddleware, roleMiddleware(["hod"]), handleCreateHODFaculty);
  app.post("/api/hod/student", authMiddleware, roleMiddleware(["hod"]), handleCreateHODStudent);
  app.post("/api/hod/bulk", authMiddleware, roleMiddleware(["hod"]), handleHODBulkUpload);
  app.post("/api/hod/exams", authMiddleware, roleMiddleware(["hod", "faculty"]), handleCreateHODExam);
  app.patch("/api/hod/exams/:id/approve", authMiddleware, roleMiddleware(["hod"]), handleApproveHODExam);

  // ─── Notifications ─────────────────────────────────────────────────────────
  app.get("/api/notifications", authMiddleware, handleGetNotifications);
  app.patch("/api/notifications/read-all", authMiddleware, handleMarkAllRead);
  app.patch("/api/notifications/:id/read", authMiddleware, handleMarkNotificationRead);
  app.patch("/api/notifications/:id/archive", authMiddleware, handleArchiveNotification);
  app.delete("/api/notifications/:id", authMiddleware, handleDeleteNotification);
  app.get("/api/notifications/preferences", authMiddleware, handleGetPreferences);
  app.put("/api/notifications/preferences", authMiddleware, handleUpdatePreferences);

  // ─── System Settings ───────────────────────────────────────────────────────
  app.get("/api/settings", handleGetSettings);
  app.put("/api/settings", authMiddleware, roleMiddleware(["admin"]), handleUpdateSettings);

  return app;
}

export function setupSocket(httpServer, app) {
  const io = initSocket(httpServer);
  app.set("io", io);
  app.set("socketio", io);

  // ─── Server-side exam heartbeat janitor (SECURITY VULN-007) ───────────────
  startHeartbeatJanitor(io);

  // ─── Hardware Heartbeat Janitor (runs every 30s) ───────────────────────────
  setInterval(async () => {
    try {
      const Device = mongoose.model("Device");
      const offlineThreshold = new Date(Date.now() - 60000);

      const result = await Device.updateMany(
        { lastSeen: { $lt: offlineThreshold }, status: { $ne: "offline" } },
        { $set: { status: "offline" } }
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Heartbeat Janitor: Decommissioned ${result.modifiedCount} inactive hardware nodes.`);
        io.to("admin-dashboard").emit("device-update-bulk");
      }
    } catch (err) {
      console.error("❌ Maintenance Error:", err.message);
    }
  }, 30000);

  return io;
}
