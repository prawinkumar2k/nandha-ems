import apiClient from "./client";
import { API } from "../constants/api";

export const authService = {
  login: (email, password) => apiClient.post(API.AUTH_LOGIN, { email, password }),
  logout: () => apiClient.post(API.AUTH_LOGOUT),
  me: () => apiClient.get(API.AUTH_ME),
  forgotPassword: (email) => apiClient.post(API.AUTH_FORGOT, { email }),
  verifyOtp: (email, otp) => apiClient.post(API.AUTH_VERIFY_OTP, { email, otp }),
  resetPassword: (token, password) => apiClient.post(API.AUTH_RESET, { token, password }),
};

export const userService = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiClient.get(`${API.USERS}${q ? "?" + q : ""}`);
  },
  getById: (id) => apiClient.get(API.USER_BY_ID(id)),
  create: (data) => apiClient.post(API.USERS, data),
  update: (id, data) => apiClient.put(API.USER_BY_ID(id), data),
  delete: (id) => apiClient.delete(API.USER_BY_ID(id)),
  updateRole: (id, role) => apiClient.patch(API.USER_ROLE(id), { role }),
  bulkUpload: (data) => apiClient.post(API.USERS_BULK, data),
};

export const deviceService = {
  getAll: () => apiClient.get(API.DEVICES),
  getById: (id) => apiClient.get(API.DEVICE_BY_ID(id)),
  register: (data) => apiClient.post(API.DEVICE_REGISTER, data),
  update: (id, data) => apiClient.put(API.DEVICE_BY_ID(id), data),
  delete: (id) => apiClient.delete(API.DEVICE_BY_ID(id)),
};

export const examService = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiClient.get(`${API.EXAMS}${q ? "?" + q : ""}`);
  },
  getById: (id) => apiClient.get(API.EXAM_BY_ID(id)),
  create: (data) => apiClient.post(API.EXAMS, data),
  update: (id, data) => apiClient.put(API.EXAM_BY_ID(id), data),
  delete: (id) => apiClient.delete(API.EXAM_BY_ID(id)),
  submit: (id, answers, log) => apiClient.post(API.EXAM_SUBMIT(id), { answers, activityLog: log }),
  getResults: (id) => apiClient.get(API.EXAM_RESULTS(id)),
  getSubmissions: (params = {}) => apiClient.get(`${API.SUBMISSIONS}?${new URLSearchParams(params)}`),
};

export const labService = {
  getStatus: () => apiClient.get(API.LAB_STATUS),
  sendCommand: (command, data) => apiClient.post(API.LAB_CONTROL, { command, ...data }),
};

export const logService = {
  getLoginLogs: (params = {}) => apiClient.get(`${API.LOGS_LOGIN}?${new URLSearchParams(params)}`),
  getActivityLogs: (params = {}) => apiClient.get(`${API.LOGS_ACTIVITY}?${new URLSearchParams(params)}`),
  getViolations: (params = {}) => apiClient.get(`${API.LOGS_VIOLATIONS}?${new URLSearchParams(params)}`),
};

export const settingService = {
  get: () => apiClient.get(API.SETTINGS),
  update: (data) => apiClient.put(API.SETTINGS, data),
};

export const reportService = {
  getSystemStats: () => apiClient.get(API.REPORTS_SYSTEM),
  getDeptStats: (id) => apiClient.get(API.REPORTS_DEPT(id)),
};

export const departmentService = {
  getAll: () => apiClient.get(API.DEPARTMENTS),
};
