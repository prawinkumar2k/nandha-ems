import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoutes";
import { ROUTES } from "@/core/constants/routes";
import { PageLoader } from "@/shared/components/Loader/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_HOME } from "@/core/constants/roles";

// ─── Shared ──────────────────────────────────────────────────────────────────
const Profile = lazy(() => import("@/shared/pages/Profile"));
const NotificationPreferences = lazy(() => import("@/shared/pages/NotificationPreferences"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// ─── Admin ───────────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import("@/modules/admin/pages/Dashboard"));
const AdminUserList = lazy(() => import("@/modules/admin/pages/users/UserList"));
const AdminAddUser = lazy(() => import("@/modules/admin/pages/users/AddUser"));
const AdminBulkUpload = lazy(() => import("@/modules/admin/pages/users/BulkUpload"));
const AdminDeviceList = lazy(() => import("@/modules/admin/pages/devices/DeviceList"));
const AdminRegisterDevice = lazy(() => import("@/modules/admin/pages/devices/RegisterDevice"));
const AdminLabControl = lazy(() => import("@/modules/admin/pages/lab/LabControl"));
const AdminAllExams = lazy(() => import("@/modules/admin/pages/exams/AllExams"));
const AdminLiveMonitoring = lazy(() => import("@/modules/admin/pages/monitoring/LiveMonitoring"));
const AdminReports = lazy(() => import("@/modules/admin/pages/Reports"));
const AdminLoginLogs = lazy(() => import("@/modules/admin/pages/logs/LoginLogs"));
const AdminActivityLogs = lazy(() => import("@/modules/admin/pages/logs/ActivityLogs"));
const AdminViolations = lazy(() => import("@/modules/admin/pages/logs/Violations"));
const AdminSettings = lazy(() => import("@/modules/admin/pages/settings/SystemSettings"));
const AdminSecurity = lazy(() => import("@/modules/admin/pages/settings/SecurityPolicies"));

// ─── HOD ─────────────────────────────────────────────────────────────────────
const HODDashboard = lazy(() => import("@/modules/hod/pages/Dashboard"));
const HODFaculty = lazy(() => import("@/modules/hod/pages/FacultyManagement"));
const HODExams = lazy(() => import("@/modules/hod/pages/Exams"));
const HODMonitoring = lazy(() => import("@/modules/hod/pages/Monitoring"));
const HODReports = lazy(() => import("@/modules/hod/pages/Reports"));
const HODStudents = lazy(() => import("@/modules/hod/pages/StudentManagement"));
const RiskDashboard = lazy(() => import("@/modules/hod/pages/RiskDashboard"));

// ─── Faculty ──────────────────────────────────────────────────────────────────
const FacultyDashboard = lazy(() => import("@/modules/faculty/pages/Dashboard"));
const FacultyCreateExam = lazy(() => import("@/modules/faculty/pages/CreateExam"));
const FacultyQuestionBank = lazy(() => import("@/modules/faculty/pages/QuestionBank"));
const FacultyMonitoring = lazy(() => import("@/modules/faculty/pages/Monitoring"));
const FacultyResults = lazy(() => import("@/modules/faculty/pages/Results"));
const FacultyAnswerCenter = lazy(() => import("@/modules/faculty/pages/AnswerCenter"));
const FacultyViolations = lazy(() => import("@/modules/faculty/pages/Violations"));
const FacultyEvidenceVault = lazy(() => import("@/modules/faculty/pages/EvidenceVault"));
const FacultyEvidence = lazy(() => import("@/modules/faculty/pages/Evidence"));

// ─── Student ──────────────────────────────────────────────────────────────────
const StudentDashboard = lazy(() => import("@/modules/student/pages/Dashboard"));
const StudentMyExams = lazy(() => import("@/modules/student/pages/MyExams"));
const StudentExamInterface = lazy(() => import("@/modules/student/pages/ExamInterface"));
const StudentResults = lazy(() => import("@/modules/student/pages/Results"));

// ─── Client (Lab PC) ─────────────────────────────────────────────────────────
const ClientWaiting = lazy(() => import("@/modules/client/pages/WaitingScreen"));
const ClientExam = lazy(() => import("@/modules/client/pages/ExamMode"));
const ClientLock = lazy(() => import("@/modules/client/pages/LockScreen"));
const ClientViolation = lazy(() => import("@/modules/client/pages/ViolationScreen"));

const S = ({ children }) => <Suspense fallback={<PageLoader />}>{children}</Suspense>;

function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={ROLE_HOME[user?.role] ?? ROUTES.LOGIN} replace />;
}

export function PrivateRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      {/* ── Admin ── */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles="admin"><Navigate to={ROUTES.ADMIN_DASHBOARD} replace /></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute allowedRoles="admin"><S><AdminDashboard /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute allowedRoles="admin"><S><AdminUserList /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_USERS_ADD} element={<ProtectedRoute allowedRoles="admin"><S><AdminAddUser /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_USERS_BULK} element={<ProtectedRoute allowedRoles="admin"><S><AdminBulkUpload /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DEVICES} element={<ProtectedRoute allowedRoles="admin"><S><AdminDeviceList /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_DEVICES_REGISTER} element={<ProtectedRoute allowedRoles="admin"><S><AdminRegisterDevice /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_LAB} element={<ProtectedRoute allowedRoles="admin"><S><AdminLabControl /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_EXAMS} element={<ProtectedRoute allowedRoles="admin"><S><AdminAllExams /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_MONITORING} element={<ProtectedRoute allowedRoles="admin"><S><AdminLiveMonitoring /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_REPORTS} element={<ProtectedRoute allowedRoles="admin"><S><AdminReports /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_LOGS_LOGIN} element={<ProtectedRoute allowedRoles="admin"><S><AdminLoginLogs /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_LOGS_ACTIVITY} element={<ProtectedRoute allowedRoles="admin"><S><AdminActivityLogs /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_ACTIVITY_LOGS} element={<ProtectedRoute allowedRoles="admin"><S><AdminActivityLogs /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_VIOLATIONS} element={<ProtectedRoute allowedRoles="admin"><S><AdminViolations /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_SETTINGS} element={<ProtectedRoute allowedRoles="admin"><S><AdminSettings /></S></ProtectedRoute>} />
      <Route path={ROUTES.ADMIN_SECURITY} element={<ProtectedRoute allowedRoles="admin"><S><AdminSecurity /></S></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles="admin"><S><Profile /></S></ProtectedRoute>} />
      <Route path="/admin/notifications/settings" element={<ProtectedRoute allowedRoles="admin"><S><NotificationPreferences /></S></ProtectedRoute>} />

      {/* ── HOD ── */}
      <Route path="/hod" element={<ProtectedRoute allowedRoles="hod"><Navigate to={ROUTES.HOD_DASHBOARD} replace /></ProtectedRoute>} />
      <Route path={ROUTES.HOD_DASHBOARD} element={<ProtectedRoute allowedRoles="hod"><S><HODDashboard /></S></ProtectedRoute>} />
      <Route path={ROUTES.HOD_FACULTY} element={<ProtectedRoute allowedRoles="hod"><S><HODFaculty /></S></ProtectedRoute>} />
      <Route path={ROUTES.HOD_EXAMS} element={<ProtectedRoute allowedRoles="hod"><S><HODExams /></S></ProtectedRoute>} />
      <Route path="/hod/monitoring/:examId?" element={<ProtectedRoute allowedRoles="hod"><S><HODMonitoring /></S></ProtectedRoute>} />
      <Route path={ROUTES.HOD_REPORTS} element={<ProtectedRoute allowedRoles="hod"><S><HODReports /></S></ProtectedRoute>} />
      <Route path={ROUTES.HOD_STUDENTS} element={<ProtectedRoute allowedRoles="hod"><S><HODStudents /></S></ProtectedRoute>} />
      <Route path="/hod/analytics" element={<ProtectedRoute allowedRoles="hod"><S><RiskDashboard /></S></ProtectedRoute>} />
      <Route path="/hod/profile" element={<ProtectedRoute allowedRoles="hod"><S><Profile /></S></ProtectedRoute>} />
      <Route path="/hod/notifications/settings" element={<ProtectedRoute allowedRoles="hod"><S><NotificationPreferences /></S></ProtectedRoute>} />

      {/* ── Faculty ── */}
      <Route path="/faculty" element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><Navigate to={ROUTES.FACULTY_DASHBOARD} replace /></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_DASHBOARD} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyDashboard /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_CREATE_EXAM} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyCreateExam /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_QUESTION_BANK} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyQuestionBank /></S></ProtectedRoute>} />
      <Route path="/faculty/monitoring/:examId?" element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyMonitoring /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_RESULTS} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyResults /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_ANSWER_CENTER} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyAnswerCenter /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_VIOLATIONS} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyViolations /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_EVIDENCE_VAULT} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyEvidenceVault /></S></ProtectedRoute>} />
      <Route path={ROUTES.FACULTY_EVIDENCE} element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><FacultyEvidence /></S></ProtectedRoute>} />
      <Route path="/faculty/profile" element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><Profile /></S></ProtectedRoute>} />
      <Route path="/faculty/notifications/settings" element={<ProtectedRoute allowedRoles={["faculty", "hod"]}><S><NotificationPreferences /></S></ProtectedRoute>} />

      {/* ── Student ── */}
      <Route path="/student" element={<ProtectedRoute allowedRoles="student"><Navigate to={ROUTES.STUDENT_DASHBOARD} replace /></ProtectedRoute>} />
      <Route path={ROUTES.STUDENT_DASHBOARD} element={<ProtectedRoute allowedRoles="student"><S><StudentDashboard /></S></ProtectedRoute>} />
      <Route path={ROUTES.STUDENT_EXAMS} element={<ProtectedRoute allowedRoles="student"><S><StudentMyExams /></S></ProtectedRoute>} />
      <Route path={ROUTES.STUDENT_EXAM_INTERFACE} element={<ProtectedRoute allowedRoles="student"><S><StudentExamInterface /></S></ProtectedRoute>} />
      <Route path={ROUTES.STUDENT_RESULTS} element={<ProtectedRoute allowedRoles="student"><S><StudentResults /></S></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles="student"><S><Profile /></S></ProtectedRoute>} />
      <Route path="/student/notifications/settings" element={<ProtectedRoute allowedRoles="student"><S><NotificationPreferences /></S></ProtectedRoute>} />

      {/* ── Client (Lab PC) ── */}
      <Route path={ROUTES.CLIENT_WAITING} element={<S><ClientWaiting /></S>} />
      <Route path={ROUTES.CLIENT_EXAM} element={<S><ClientExam /></S>} />
      <Route path={ROUTES.CLIENT_LOCK} element={<S><ClientLock /></S>} />
      <Route path={ROUTES.CLIENT_VIOLATION} element={<S><ClientViolation /></S>} />

      <Route path="*" element={<S><NotFound /></S>} />
    </Routes>
  );
}

export default PrivateRoutes;
