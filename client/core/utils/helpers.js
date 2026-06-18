import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind Class Merger ───────────────────────────────────────────────────
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ─── String Helpers ───────────────────────────────────────────────────────────
export const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const truncate = (str = "", len = 50) =>
  str.length > len ? str.slice(0, len) + "…" : str;

// ─── Date Helpers ─────────────────────────────────────────────────────────────
export const formatDate = (iso, opts = {}) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opts,
  });
};

export const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCountdown = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export const timeAgo = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Number Helpers ───────────────────────────────────────────────────────────
export const pct = (value, total) =>
  total === 0 ? 0 : Math.round((value / total) * 100);

// ─── Validation Helpers ───────────────────────────────────────────────────────
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v) => /^[6-9]\d{9}$/.test(v);
export const isStrongPassword = (v) =>
  v.length >= 8 && /[A-Z]/.test(v) && /[0-9]/.test(v);

// ─── Common Form Validators ───────────────────────────────────────────────────
export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = "Email is required.";
  else if (!isEmail(email)) errors.email = "Enter a valid email.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Minimum 6 characters.";
  return errors;
};

export const validateUserForm = ({ name, email, role, department, password }) => {
  const errors = {};
  if (!name?.trim()) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!isEmail(email)) errors.email = "Invalid email.";
  if (!role) errors.role = "Role is required.";
  if (!department) errors.department = "Department is required.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Minimum 6 characters.";
  return errors;
};

// ─── Download Helper ──────────────────────────────────────────────────────────
export const downloadCSV = (data, filename = "report.csv") => {
  if (!data?.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((r) => Object.values(r).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Import cn from @/lib/utils directly in component files
