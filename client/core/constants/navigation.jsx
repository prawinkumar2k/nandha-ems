import {
  LayoutDashboard, Users, Monitor, BookOpen, BarChart3, Shield,
  ClipboardList, Activity, AlertTriangle,
  FileText, HelpCircle, Eye, User, ShieldCheck, Camera,
  MessageSquare, Settings
} from "lucide-react";
import { ROUTES } from "./routes";

// ─── Admin Navigation ─────────────────────────────────────────────────────────
export const getAdminNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.ADMIN_DASHBOARD },
  {
    label: "Users", icon: <Users className="w-4 h-4" />, children: [
      { label: "User List", path: ROUTES.ADMIN_USERS },
      { label: "Add User", path: ROUTES.ADMIN_USERS_ADD },
      { label: "Bulk Import", path: ROUTES.ADMIN_USERS_BULK },
    ],
  },
  {
    label: "NOC Command Center", icon: <Monitor className="w-4 h-4" />, children: [
      { label: "Lab Topology", path: ROUTES.ADMIN_LABS },
      { label: "Pending Devices", path: ROUTES.ADMIN_DEVICES_PENDING },
      { label: "Device Inventory", path: ROUTES.ADMIN_DEVICES },
      { label: "Security Events", path: ROUTES.ADMIN_SECURITY_EVENTS },
    ],
  },
  {
    label: "Exams & Courses", icon: <BookOpen className="w-4 h-4" />, children: [
      { label: "All Exams", path: ROUTES.ADMIN_EXAMS },
      { label: "Course Registry", path: ROUTES.ADMIN_COURSES },
      { label: "Department Registry", path: ROUTES.ADMIN_DEPARTMENTS },
    ]
  },
  { label: "Live Monitoring", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.ADMIN_MONITORING },
  {
    label: "Violations & Logs", icon: <ClipboardList className="w-4 h-4" />, children: [
      { label: "Login History", path: ROUTES.ADMIN_LOGS_LOGIN },
      { label: "Activity Log", path: ROUTES.ADMIN_LOGS_ACTIVITY },
      { label: "Violations", path: ROUTES.ADMIN_VIOLATIONS },
    ],
  },
  {
    label: "Security & Settings", icon: <Shield className="w-4 h-4" />, children: [
      { label: "System Settings", path: ROUTES.ADMIN_SETTINGS },
      { label: "Security Rules", path: ROUTES.ADMIN_SECURITY },
    ],
  },
  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/admin/profile" },
];

// ─── HOD Navigation ───────────────────────────────────────────────────────────
export const getHODNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.HOD_DASHBOARD },
  {
    label: "Department", icon: <Users className="w-4 h-4" />, children: [
      { label: "Examiners", path: ROUTES.HOD_FACULTY },
      { label: "Candidates", path: ROUTES.HOD_STUDENTS },
    ]
  },
  {
    label: "Exams", icon: <BookOpen className="w-4 h-4" />, children: [
      { label: "Exam List", path: ROUTES.HOD_EXAMS },
      { label: "Course Registry", path: ROUTES.ADMIN_COURSES },
      { label: "Create Exam", path: ROUTES.FACULTY_CREATE_EXAM },
      { label: "Question Bank", path: ROUTES.FACULTY_QUESTION_BANK },
      { label: "Results", path: ROUTES.FACULTY_RESULTS },
    ]
  },
  { label: "Live Proctoring", icon: <Eye className="w-4 h-4" />, path: ROUTES.HOD_MONITORING },
  { label: "Violations", icon: <ShieldCheck className="w-4 h-4" />, path: ROUTES.FACULTY_VIOLATIONS },
  { label: "Evidence Vault", icon: <Camera className="w-4 h-4" />, path: ROUTES.FACULTY_EVIDENCE_VAULT },
  { label: "Reports", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.HOD_REPORTS },
  { label: "Risk Analytics", icon: <Activity className="w-4 h-4" />, path: "/hod/analytics" },
  { label: "Notifications", icon: <MessageSquare className="w-4 h-4" />, path: "/hod/notifications/settings" },
  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/hod/profile" },
];

// ─── Faculty Navigation ───────────────────────────────────────────────────────
export const getFacultyNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.FACULTY_DASHBOARD },
  { label: "Course Registry", icon: <BookOpen className="w-4 h-4" />, path: ROUTES.ADMIN_COURSES },
  { label: "Create Exam", icon: <FileText className="w-4 h-4" />, path: ROUTES.FACULTY_CREATE_EXAM },
  { label: "Question Bank", icon: <HelpCircle className="w-4 h-4" />, path: ROUTES.FACULTY_QUESTION_BANK },
  { label: "Live Proctoring", icon: <Eye className="w-4 h-4" />, path: ROUTES.FACULTY_MONITORING },
  { label: "Violations", icon: <ShieldCheck className="w-4 h-4" />, path: ROUTES.FACULTY_VIOLATIONS },
  { label: "Evidence Vault", icon: <Camera className="w-4 h-4" />, path: ROUTES.FACULTY_EVIDENCE_VAULT },
  { label: "Results", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.FACULTY_RESULTS },
  { label: "Notifications", icon: <MessageSquare className="w-4 h-4" />, path: "/faculty/notifications/settings" },
  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/faculty/profile" },
];

// ─── Student Navigation ───────────────────────────────────────────────────────
export const getStudentNav = () => [
  { label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, path: ROUTES.STUDENT_DASHBOARD },
  { label: "My Exams", icon: <FileText className="w-4 h-4" />, path: ROUTES.STUDENT_EXAMS },
  { label: "My Results", icon: <BarChart3 className="w-4 h-4" />, path: ROUTES.STUDENT_RESULTS },
  { label: "Notifications", icon: <MessageSquare className="w-4 h-4" />, path: "/student/notifications/settings" },
  { label: "My Profile", icon: <User className="w-4 h-4" />, path: "/student/profile" },
];
