# NEClms Testing Roadmap

## Risk Ranking Summary

### Tier 1. Critical Backend APIs

Highest blast radius because they control identity, permissions, exam state, grading, and operational control of client devices.

- [`server/index.js`](../server/index.js)
- [`server/routes/auth.js`](../server/routes/auth.js)
- [`server/routes/users.js`](../server/routes/users.js)
- [`server/routes/submissions.js`](../server/routes/submissions.js)
- [`server/routes/hod.js`](../server/routes/hod.js)
- [`server/routes/code.js`](../server/routes/code.js)
- [`server/routes/lab.js`](../server/routes/lab.js)
- [`server/routes/devices.js`](../server/routes/devices.js)
- [`server/routes/violations.js`](../server/routes/violations.js)
- [`server/routes/settings.js`](../server/routes/settings.js)
- [`server/routes/notifications.js`](../server/routes/notifications.js)
- [`server/routes/reports.js`](../server/routes/reports.js)
- [`server/routes/profile.js`](../server/routes/profile.js)
- [`server/routes/logs.js`](../server/routes/logs.js)
- [`server/routes/screenshots.js`](../server/routes/screenshots.js)

Primary risks:

- Auth bypass and privilege escalation
- Mass assignment on user and profile updates
- Grading and submission corruption
- Unsafe code execution
- Device control and monitoring abuse
- Sensitive data leakage through reports, logs, and screenshots

### Tier 2. Authentication & Authorization

These files decide who can access the system and what they can do after login.

- [`server/middleware/auth.js`](../server/middleware/auth.js)
- [`server/middleware/security.js`](../server/middleware/security.js)
- [`client/contexts/AuthContext.jsx`](../client/contexts/AuthContext.jsx)
- [`client/routes/ProtectedRoutes.jsx`](../client/routes/ProtectedRoutes.jsx)
- [`client/routes/AuthRoutes.jsx`](../client/routes/AuthRoutes.jsx)
- [`client/routes/PrivateRoutes.jsx`](../client/routes/PrivateRoutes.jsx)
- [`client/services/api.js`](../client/services/api.js)

Primary risks:

- JWT forgery and expired token handling
- Missing role checks on write paths
- Rate limit bypass
- CSRF exposure on state-changing requests
- Session fixation or stale client state after logout

### Tier 3. Socket.io Services

Real-time monitoring and device commands can change state without page refresh, so bugs here have immediate operational impact.

- [`server/socket.js`](../server/socket.js)
- [`client/contexts/SocketContext.jsx`](../client/contexts/SocketContext.jsx)
- [`client/shared/components/Monitoring/LiveScreenGrid.jsx`](../client/shared/components/Monitoring/LiveScreenGrid.jsx)
- [`client/modules/admin/pages/monitoring/LiveMonitoring.jsx`](../client/modules/admin/pages/monitoring/LiveMonitoring.jsx)
- [`client/modules/faculty/pages/Monitoring.jsx`](../client/modules/faculty/pages/Monitoring.jsx)
- [`client/modules/hod/pages/Monitoring.jsx`](../client/modules/hod/pages/Monitoring.jsx)
- [`client/modules/client/pages/ExamMode.jsx`](../client/modules/client/pages/ExamMode.jsx)
- [`client/modules/client/pages/LockScreen.jsx`](../client/modules/client/pages/LockScreen.jsx)
- [`client/modules/client/pages/ViolationScreen.jsx`](../client/modules/client/pages/ViolationScreen.jsx)

Primary risks:

- Unauthorized room joins
- Broadcast leakage across exam rooms
- Reconnect handling and duplicate listeners
- Device command abuse

### Tier 4. Database Models

Schema rules are the last line of defense against invalid state and unique constraint regressions.

- [`server/models/User.js`](../server/models/User.js)
- [`server/models/Exam.js`](../server/models/Exam.js)
- [`server/models/Submission.js`](../server/models/Submission.js)
- [`server/models/QuestionBank.js`](../server/models/QuestionBank.js)
- [`server/models/Device.js`](../server/models/Device.js)
- [`server/models/Violation.js`](../server/models/Violation.js)
- [`server/models/Notification.js`](../server/models/Notification.js)
- [`server/models/Settings.js`](../server/models/Settings.js)
- [`server/models/Course.js`](../server/models/Course.js)
- [`server/models/Department.js`](../server/models/Department.js)
- [`server/models/ActivityLog.js`](../server/models/ActivityLog.js)
- [`server/models/LoginLog.js`](../server/models/LoginLog.js)
- [`server/models/Lab.js`](../server/models/Lab.js)
- [`server/models/LabSession.js`](../server/models/LabSession.js)
- [`server/models/Attendance.js`](../server/models/Attendance.js)
- [`server/models/Mark.js`](../server/models/Mark.js)
- [`server/models/Session.js`](../server/models/Session.js)
- [`server/models/StudentProfile.js`](../server/models/StudentProfile.js)

Primary risks:

- Password hashing and secret field leakage
- Enum drift and invalid status transitions
- Duplicate prevention and unique indexes
- Nested schema validation for answers, violations, and grading

### Tier 5. Faculty Module

- [`client/modules/faculty/pages/Dashboard.jsx`](../client/modules/faculty/pages/Dashboard.jsx)
- [`client/modules/faculty/pages/CreateExam.jsx`](../client/modules/faculty/pages/CreateExam.jsx)
- [`client/modules/faculty/pages/QuestionBank.jsx`](../client/modules/faculty/pages/QuestionBank.jsx)
- [`client/modules/faculty/pages/Monitoring.jsx`](../client/modules/faculty/pages/Monitoring.jsx)
- [`client/modules/faculty/pages/Results.jsx`](../client/modules/faculty/pages/Results.jsx)
- [`client/modules/faculty/pages/Violations.jsx`](../client/modules/faculty/pages/Violations.jsx)
- [`client/modules/faculty/pages/EvidenceVault.jsx`](../client/modules/faculty/pages/EvidenceVault.jsx)
- [`client/modules/faculty/pages/Evidence.jsx`](../client/modules/faculty/pages/Evidence.jsx)
- [`client/modules/faculty/components/QuestionFactory.jsx`](../client/modules/faculty/components/QuestionFactory.jsx)

Risk profile:

- Exam creation payload integrity
- Question bank creation and edit flow
- Results and evidence visibility

### Tier 6. HOD Module

- [`client/modules/hod/pages/Dashboard.jsx`](../client/modules/hod/pages/Dashboard.jsx)
- [`client/modules/hod/pages/FacultyManagement.jsx`](../client/modules/hod/pages/FacultyManagement.jsx)
- [`client/modules/hod/pages/Exams.jsx`](../client/modules/hod/pages/Exams.jsx)
- [`client/modules/hod/pages/Monitoring.jsx`](../client/modules/hod/pages/Monitoring.jsx)
- [`client/modules/hod/pages/Reports.jsx`](../client/modules/hod/pages/Reports.jsx)
- [`client/modules/hod/pages/StudentManagement.jsx`](../client/modules/hod/pages/StudentManagement.jsx)
- [`client/modules/hod/components/BulkOnboardingModal.jsx`](../client/modules/hod/components/BulkOnboardingModal.jsx)

Risk profile:

- Department scoping
- Bulk onboarding and approval flows
- Aggregation queries and analytics correctness

### Tier 7. Student Module

- [`client/modules/student/pages/Dashboard.jsx`](../client/modules/student/pages/Dashboard.jsx)
- [`client/modules/student/pages/MyExams.jsx`](../client/modules/student/pages/MyExams.jsx)
- [`client/modules/student/pages/ExamInterface.jsx`](../client/modules/student/pages/ExamInterface.jsx)
- [`client/modules/student/pages/Results.jsx`](../client/modules/student/pages/Results.jsx)
- [`client/modules/student/pages/Profile.jsx`](../client/modules/student/pages/Profile.jsx)
- [`client/modules/student/pages/CodingPlayground.jsx`](../client/modules/student/pages/CodingPlayground.jsx)

Risk profile:

- Exam session persistence
- Answer autosave and submission
- Code-playground security expectations

### Tier 8. Admin Module

- [`client/modules/admin/pages/Dashboard.jsx`](../client/modules/admin/pages/Dashboard.jsx)
- [`client/modules/admin/pages/users/UserList.jsx`](../client/modules/admin/pages/users/UserList.jsx)
- [`client/modules/admin/pages/users/AddUser.jsx`](../client/modules/admin/pages/users/AddUser.jsx)
- [`client/modules/admin/pages/users/BulkUpload.jsx`](../client/modules/admin/pages/users/BulkUpload.jsx)
- [`client/modules/admin/pages/devices/DeviceList.jsx`](../client/modules/admin/pages/devices/DeviceList.jsx)
- [`client/modules/admin/pages/devices/RegisterDevice.jsx`](../client/modules/admin/pages/devices/RegisterDevice.jsx)
- [`client/modules/admin/pages/lab/LabControl.jsx`](../client/modules/admin/pages/lab/LabControl.jsx)
- [`client/modules/admin/pages/exams/AllExams.jsx`](../client/modules/admin/pages/exams/AllExams.jsx)
- [`client/modules/admin/pages/monitoring/LiveMonitoring.jsx`](../client/modules/admin/pages/monitoring/LiveMonitoring.jsx)
- [`client/modules/admin/pages/logs/LoginLogs.jsx`](../client/modules/admin/pages/logs/LoginLogs.jsx)
- [`client/modules/admin/pages/logs/ActivityLogs.jsx`](../client/modules/admin/pages/logs/ActivityLogs.jsx)
- [`client/modules/admin/pages/logs/Violations.jsx`](../client/modules/admin/pages/logs/Violations.jsx)
- [`client/modules/admin/pages/settings/SystemSettings.jsx`](../client/modules/admin/pages/settings/SystemSettings.jsx)
- [`client/modules/admin/pages/settings/SecurityPolicies.jsx`](../client/modules/admin/pages/settings/SecurityPolicies.jsx)

Risk profile:

- User management privileges
- Device registration and control
- Settings mutation
- Log visibility and administrative traceability

## Priority Test Suite Order

1. `tests/server/middleware/auth.test.js`
1. `tests/server/middleware/security.test.js`
1. `tests/server/routes/auth-profile.test.js`
1. `tests/server/routes/code-and-lab.test.js`
1. `tests/server/routes/submissions-and-hod.test.js`
1. `tests/server/models.test.js`
1. `tests/server/socket.test.js`
1. `tests/client/route-guards.test.jsx`
1. `tests/client/auth-context.test.jsx`

## Coverage Expectations

- Backend auth, role checks, and rate limiting: near-complete branch coverage
- Critical API handlers: all success paths plus 400/401/403/404/500 error paths
- Models: required fields, enum validation, index presence, secret-field redaction
- Client route guards: authenticated, unauthorized, loading, and guest flows
- Socket handlers: room join, broadcast, disconnect, and guard behavior

## Known Gaps To Close Next

- Add true Mongo-backed integration tests once `mongodb-memory-server` is installed and available
- Add request-level Supertest coverage for the real Express app once dependency installation is available
- Add socket-room isolation tests for per-exam broadcast boundaries
- Add module-level admin/HOD/faculty/student UI tests for high-value forms and tables
