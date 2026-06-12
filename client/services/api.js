// ─── API Service Layer ───────────────────────────────────────────────────────
// Centralised Axios-like fetch wrapper with JWT auth, error handling & retries.

const BASE_URL = "";

const getToken = () => sessionStorage.getItem("authToken");

const request = async (method, endpoint, data = null, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle 401 → clear session
  if (response.status === 401) {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.message || `Request failed: ${response.status}`);
  }

  return json;
};

export const api = {
  get: (url, options) => request("GET", url, null, options),
  post: (url, data, options) => request("POST", url, data, options),
  put: (url, data, options) => request("PUT", url, data, options),
  patch: (url, data, options) => request("PATCH", url, data, options),
  delete: (url, options) => request("DELETE", url, null, options),
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  logout: () => api.post("/api/auth/logout"),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  verifyOtp: (email, otp) => api.post("/api/auth/verify-otp", { email, otp }),
  resetPassword: (token, password) =>
    api.post("/api/auth/reset-password", { token, password }),
  getProfile: () => api.get("/api/auth/me"),
};

// ─── Users API ────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/users${q ? "?" + q : ""}`);
  },
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post("/api/users", data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  updateRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }),
};

// ─── Courses API ──────────────────────────────────────────────────────────────
export const coursesApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/courses${q ? "?" + q : ""}`);
  },
  getById: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post("/api/courses", data),
  update: (id, data) => api.put(`/api/courses/${id}`, data),
  delete: (id) => api.delete(`/api/courses/${id}`),
  enroll: (courseId) => api.post(`/api/courses/${courseId}/enroll`),
  getMaterials: (courseId) => api.get(`/api/courses/${courseId}/materials`),
  uploadMaterial: (courseId, data) =>
    api.post(`/api/courses/${courseId}/materials`, data),
};

// ─── Exams API ────────────────────────────────────────────────────────────────
export const examsApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/exams${q ? "?" + q : ""}`);
  },
  getById: (id) => api.get(`/api/exams/${id}`),
  create: (data) => api.post("/api/exams", data),
  update: (id, data) => api.put(`/api/exams/${id}`, data),
  delete: (id) => api.delete(`/api/exams/${id}`),
  submit: (id, answers, activityLog) =>
    api.post(`/api/exams/${id}/submit`, { answers, activityLog }),
  getResults: (id) => api.get(`/api/exams/${id}/results`),
};

// ─── Attendance API ───────────────────────────────────────────────────────────
export const attendanceApi = {
  getCourseAttendance: (courseId) =>
    api.get(`/api/attendance/course/${courseId}`),
  getStudentAttendance: (studentId) =>
    api.get(`/api/attendance/student/${studentId}`),
  markAttendance: (data) => api.post("/api/attendance/mark", data),
  getReport: (params) => {
    const q = new URLSearchParams(params).toString();
    return api.get(`/api/attendance/report${q ? "?" + q : ""}`);
  },
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsApi = {
  getAll: () => api.get("/api/notifications"),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`),
  markAllRead: () => api.patch("/api/notifications/read-all"),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

// ─── Reports / Analytics API ──────────────────────────────────────────────────
export const reportsApi = {
  getSystemStats: () => api.get("/api/reports/system"),
  getDepartmentStats: (deptId) =>
    api.get(`/api/reports/department/${deptId}`),
  getCourseAnalytics: (courseId) =>
    api.get(`/api/reports/course/${courseId}`),
  getStudentReport: (studentId) =>
    api.get(`/api/reports/student/${studentId}`),
};
