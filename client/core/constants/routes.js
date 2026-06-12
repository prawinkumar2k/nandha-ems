export const ROUTES = {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_OTP: "/verify-otp",
  DEVICE_REGISTRATION: "/device-registration",
  UNAUTHORIZED: "/unauthorized",

  // ─── Admin ────────────────────────────────────────────────────────────────
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_USERS_ADD: "/admin/users/add",
  ADMIN_USERS_BULK: "/admin/users/bulk",
  ADMIN_DEVICES: "/admin/devices",
  ADMIN_DEVICES_REGISTER: "/admin/devices/register",
  ADMIN_LAB: "/admin/lab",
  ADMIN_EXAMS: "/admin/exams",
  ADMIN_MONITORING: "/admin/monitoring",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_LOGS_LOGIN: "/admin/logs/login",
  ADMIN_LOGS_ACTIVITY: "/admin/logs/activity",
  ADMIN_ACTIVITY_LOGS: "/admin/activity-logs",
  ADMIN_VIOLATIONS: "/admin/logs/violations",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_SECURITY: "/admin/settings/security",

  // ─── HOD ──────────────────────────────────────────────────────────────────
  HOD: "/hod",
  HOD_DASHBOARD: "/hod/dashboard",
  HOD_FACULTY: "/hod/faculty",
  HOD_EXAMS: "/hod/exams",
  HOD_MONITORING: "/hod/monitoring",
  HOD_REPORTS: "/hod/reports",
  HOD_STUDENTS: "/hod/students",

  // ─── Faculty ──────────────────────────────────────────────────────────────
  FACULTY: "/faculty",
  FACULTY_DASHBOARD: "/faculty/dashboard",
  FACULTY_CREATE_EXAM: "/faculty/exams/create",
  FACULTY_QUESTION_BANK: "/faculty/question-bank",
  FACULTY_MONITORING: "/faculty/monitoring",
  FACULTY_RESULTS: "/faculty/results",
  FACULTY_ANSWER_CENTER: "/faculty/results/:submissionId",
  FACULTY_VIOLATIONS: "/faculty/violations",
  FACULTY_EVIDENCE_VAULT: "/faculty/evidence-vault",
  FACULTY_EVIDENCE: "/faculty/evidence/:examId/:studentId",

  // ─── Student ──────────────────────────────────────────────────────────────
  STUDENT: "/student",
  STUDENT_DASHBOARD: "/student/dashboard",
  STUDENT_EXAMS: "/student/exams",
  STUDENT_EXAM_INTERFACE: "/student/exam/:examId",
  STUDENT_RESULTS: "/student/results",
  STUDENT_PROFILE: "/student/profile",

  // ─── Client (Lab PC) ──────────────────────────────────────────────────────
  CLIENT: "/client",
  CLIENT_LOGIN: "/client/login",
  CLIENT_WAITING: "/client/waiting",
  CLIENT_EXAM: "/client/exam",
  CLIENT_LOCK: "/client/lock",
  CLIENT_VIOLATION: "/client/violation",
};
