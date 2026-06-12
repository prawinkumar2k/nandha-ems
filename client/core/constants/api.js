export const API_BASE = "";

export const API = {
  // Auth
  AUTH_LOGIN: "/api/auth/login",
  AUTH_LOGOUT: "/api/auth/logout",
  AUTH_ME: "/api/auth/me",
  AUTH_FORGOT: "/api/auth/forgot-password",
  AUTH_VERIFY_OTP: "/api/auth/verify-otp",
  AUTH_RESET: "/api/auth/reset-password",

  // Users
  USERS: "/api/users",
  USER_BY_ID: (id) => `/api/users/${id}`,
  USER_ROLE: (id) => `/api/users/${id}/role`,
  USERS_BULK: "/api/users/bulk",

  // Devices
  DEVICES: "/api/devices",
  DEVICE_BY_ID: (id) => `/api/devices/${id}`,
  DEVICE_REGISTER: "/api/devices/register",

  // Departments
  DEPARTMENTS: "/api/departments",

  // Courses
  COURSES: "/api/courses",
  COURSE_BY_ID: (id) => `/api/courses/${id}`,
  COURSE_ENROLL: (id) => `/api/courses/${id}/enroll`,

  // Exams
  EXAMS: "/api/exams",
  EXAM_BY_ID: (id) => `/api/exams/${id}`,
  EXAM_SUBMIT: (id) => `/api/exams/${id}/submit`,
  EXAM_RESULTS: (id) => `/api/exams/${id}/results`,

  // Attendance
  ATTENDANCE_COURSE: (id) => `/api/attendance/course/${id}`,
  ATTENDANCE_MARK: "/api/attendance/mark",

  // Reports
  REPORTS_SYSTEM: "/api/reports/system",
  REPORTS_DEPT: (id) => `/api/reports/department/${id}`,

  // Notifications
  NOTIFICATIONS: "/api/notifications",

  // Logs
  LOGS_LOGIN: "/api/logs/login",
  LOGS_ACTIVITY: "/api/logs/activity",
  LOGS_VIOLATIONS: "/api/logs/violations",

  // Lab/Monitoring
  LAB_STATUS: "/api/lab/status",
  LAB_CONTROL: "/api/lab/control",
  MONITORING_LIVE: "/api/monitoring/live",
  SUBMISSIONS: "/api/exams-telemetry",
  SETTINGS: "/api/settings",
};
