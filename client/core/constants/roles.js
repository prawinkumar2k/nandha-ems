export const ROLES = {
  ADMIN: "admin",
  HOD: "hod",
  FACULTY: "faculty",
  STUDENT: "student",
  CLIENT: "client", // Lab PC
};

export const ROLE_LABELS = {
  admin: "Administrator",
  hod: "Head of Department",
  faculty: "Faculty",
  student: "Student",
  client: "Lab Client",
};

export const ROLE_HOME = {
  admin: "/admin",
  hod: "/hod",
  faculty: "/faculty",
  student: "/student",
  client: "/client",
};

export const ROLE_COLORS = {
  admin: { bg: "bg-red-500/10", text: "text-red-600", badge: "bg-red-500", border: "border-red-200" },
  hod: { bg: "bg-purple-500/10", text: "text-purple-600", badge: "bg-purple-500", border: "border-purple-200" },
  faculty: { bg: "bg-blue-500/10", text: "text-blue-600", badge: "bg-blue-500", border: "border-blue-200" },
  student: { bg: "bg-emerald-500/10", text: "text-emerald-600", badge: "bg-emerald-500", border: "border-emerald-200" },
  client: { bg: "bg-orange-500/10", text: "text-orange-600", badge: "bg-orange-500", border: "border-orange-200" },
};
