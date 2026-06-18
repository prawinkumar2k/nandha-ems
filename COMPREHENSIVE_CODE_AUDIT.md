# NEClms - Comprehensive Forensic Code Audit
**Generated:** June 18, 2026  
**Project:** NEClms (National Examination Certification - Learning Management System)  
**Workspace:** c:\Users\Hp\Downloads\NEClms-main\NEClms-main

---

## 1. PAGES/ROUTES INVENTORY

### 1.1 Admin Module Pages
| Component | Path | Purpose |
|-----------|------|---------|
| Dashboard | [client/modules/admin/pages/Dashboard.jsx](client/modules/admin/pages/Dashboard.jsx) | Main admin dashboard |
| CourseRegistry | [client/modules/admin/pages/courses/CourseRegistry.jsx](client/modules/admin/pages/courses/CourseRegistry.jsx) | Manage courses |
| DepartmentRegistry | [client/modules/admin/pages/departments/DepartmentRegistry.jsx](client/modules/admin/pages/departments/DepartmentRegistry.jsx) | Manage departments |
| DeviceList | [client/modules/admin/pages/devices/DeviceList.jsx](client/modules/admin/pages/devices/DeviceList.jsx) | List all devices |
| DeviceDetails | [client/modules/admin/pages/devices/DeviceDetails.jsx](client/modules/admin/pages/devices/DeviceDetails.jsx) | Device details view |
| PendingDevices | [client/modules/admin/pages/devices/PendingDevices.jsx](client/modules/admin/pages/devices/PendingDevices.jsx) | Approve pending devices |
| RegisterDevice | [client/modules/admin/pages/devices/RegisterDevice.jsx](client/modules/admin/pages/devices/RegisterDevice.jsx) | Register new devices |
| AllExams | [client/modules/admin/pages/exams/AllExams.jsx](client/modules/admin/pages/exams/AllExams.jsx) | View all exams |
| LabTopology | [client/modules/admin/pages/lab/LabTopology.jsx](client/modules/admin/pages/lab/LabTopology.jsx) | View lab layout |
| ActivityLogs | [client/modules/admin/pages/logs/ActivityLogs.jsx](client/modules/admin/pages/logs/ActivityLogs.jsx) | Activity audit logs |
| LoginLogs | [client/modules/admin/pages/logs/LoginLogs.jsx](client/modules/admin/pages/logs/LoginLogs.jsx) | Login audit logs |
| SecurityEvents | [client/modules/admin/pages/logs/SecurityEvents.jsx](client/modules/admin/pages/logs/SecurityEvents.jsx) | Security event logs |
| Violations | [client/modules/admin/pages/logs/Violations.jsx](client/modules/admin/pages/logs/Violations.jsx) | Violation records |
| LiveMonitoring | [client/modules/admin/pages/monitoring/LiveMonitoring.jsx](client/modules/admin/pages/monitoring/LiveMonitoring.jsx) | Real-time exam monitoring |
| LiveMonitoringCenter | [client/modules/admin/pages/monitoring/LiveMonitoringCenter.jsx](client/modules/admin/pages/monitoring/LiveMonitoringCenter.jsx) | Monitoring command center |
| Reports | [client/modules/admin/pages/Reports.jsx](client/modules/admin/pages/Reports.jsx) | Admin reports |
| SecurityPolicies | [client/modules/admin/pages/settings/SecurityPolicies.jsx](client/modules/admin/pages/settings/SecurityPolicies.jsx) | Configure security policies |
| SystemSettings | [client/modules/admin/pages/settings/SystemSettings.jsx](client/modules/admin/pages/settings/SystemSettings.jsx) | System configuration |
| AddUser | [client/modules/admin/pages/users/AddUser.jsx](client/modules/admin/pages/users/AddUser.jsx) | Add new user |
| BulkUpload | [client/modules/admin/pages/users/BulkUpload.jsx](client/modules/admin/pages/users/BulkUpload.jsx) | Bulk user upload |
| UserList | [client/modules/admin/pages/users/UserList.jsx](client/modules/admin/pages/users/UserList.jsx) | List all users |

### 1.2 HOD (Head of Department) Module Pages
| Component | Path | Purpose |
|-----------|------|---------|
| Dashboard | [client/modules/hod/pages/Dashboard.jsx](client/modules/hod/pages/Dashboard.jsx) | HOD dashboard |
| Exams | [client/modules/hod/pages/Exams.jsx](client/modules/hod/pages/Exams.jsx) | Department exams |
| FacultyManagement | [client/modules/hod/pages/FacultyManagement.jsx](client/modules/hod/pages/FacultyManagement.jsx) | Manage faculty |
| Monitoring | [client/modules/hod/pages/Monitoring.jsx](client/modules/hod/pages/Monitoring.jsx) | Monitor exams |
| Reports | [client/modules/hod/pages/Reports.jsx](client/modules/hod/pages/Reports.jsx) | HOD reports |
| RiskDashboard | [client/modules/hod/pages/RiskDashboard.jsx](client/modules/hod/pages/RiskDashboard.jsx) | Student risk analysis |
| StudentManagement | [client/modules/hod/pages/StudentManagement.jsx](client/modules/hod/pages/StudentManagement.jsx) | Manage students |

### 1.3 Student Module Pages
| Component | Path | Purpose |
|-----------|------|---------|
| CodingPlayground | [client/modules/student/pages/CodingPlayground.jsx](client/modules/student/pages/CodingPlayground.jsx) | Code execution environment |
| Dashboard | [client/modules/student/pages/Dashboard.jsx](client/modules/student/pages/Dashboard.jsx) | Student dashboard |
| ExamInterface | [client/modules/student/pages/ExamInterface.jsx](client/modules/student/pages/ExamInterface.jsx) | Exam taking interface |
| MyExams | [client/modules/student/pages/MyExams.jsx](client/modules/student/pages/MyExams.jsx) | Assigned exams |
| Profile | [client/modules/student/pages/Profile.jsx](client/modules/student/pages/Profile.jsx) | Student profile |
| Results | [client/modules/student/pages/Results.jsx](client/modules/student/pages/Results.jsx) | Exam results |

### 1.4 Faculty Module Pages
| Component | Path | Purpose |
|-----------|------|---------|
| AnswerCenter | [client/modules/faculty/pages/AnswerCenter.jsx](client/modules/faculty/pages/AnswerCenter.jsx) | Grade submissions |
| CreateExam | [client/modules/faculty/pages/CreateExam.jsx](client/modules/faculty/pages/CreateExam.jsx) | Create exams |
| Dashboard | [client/modules/faculty/pages/Dashboard.jsx](client/modules/faculty/pages/Dashboard.jsx) | Faculty dashboard |
| Evidence | [client/modules/faculty/pages/Evidence.jsx](client/modules/faculty/pages/Evidence.jsx) | View violation evidence |
| EvidenceVault | [client/modules/faculty/pages/EvidenceVault.jsx](client/modules/faculty/pages/EvidenceVault.jsx) | Evidence storage |
| HallTickets | [client/modules/faculty/pages/HallTickets.jsx](client/modules/faculty/pages/HallTickets.jsx) | Seat assignments |
| Monitoring | [client/modules/faculty/pages/Monitoring.jsx](client/modules/faculty/pages/Monitoring.jsx) | Exam monitoring |
| QuestionBank | [client/modules/faculty/pages/QuestionBank.jsx](client/modules/faculty/pages/QuestionBank.jsx) | Manage questions |
| Results | [client/modules/faculty/pages/Results.jsx](client/modules/faculty/pages/Results.jsx) | View results |
| Violations | [client/modules/faculty/pages/Violations.jsx](client/modules/faculty/pages/Violations.jsx) | Track violations |

### 1.5 Auth Module Pages
| Component | Path | Purpose |
|-----------|------|---------|
| DeviceRegistration | [client/modules/auth/pages/DeviceRegistration.jsx](client/modules/auth/pages/DeviceRegistration.jsx) | Register exam devices |
| ForgotPassword | [client/modules/auth/pages/ForgotPassword.jsx](client/modules/auth/pages/ForgotPassword.jsx) | Password recovery |
| Login | [client/modules/auth/pages/Login.jsx](client/modules/auth/pages/Login.jsx) | User login |
| ResetPassword | [client/modules/auth/pages/ResetPassword.jsx](client/modules/auth/pages/ResetPassword.jsx) | Reset password |
| Unauthorized | [client/modules/auth/pages/Unauthorized.jsx](client/modules/auth/pages/Unauthorized.jsx) | Unauthorized access page |
| VerifyOtp | [client/modules/auth/pages/VerifyOtp.jsx](client/modules/auth/pages/VerifyOtp.jsx) | OTP verification |

### 1.6 Client Module Pages (Kiosk Interface)
| Component | Path | Purpose |
|-----------|------|---------|
| DeviceLogin | [client/modules/client/pages/DeviceLogin.jsx](client/modules/client/pages/DeviceLogin.jsx) | Device login screen |
| ExamMode | [client/modules/client/pages/ExamMode.jsx](client/modules/client/pages/ExamMode.jsx) | Kiosk exam mode |
| LockScreen | [client/modules/client/pages/LockScreen.jsx](client/modules/client/pages/LockScreen.jsx) | Device lockdown screen |
| ViolationScreen | [client/modules/client/pages/ViolationScreen.jsx](client/modules/client/pages/ViolationScreen.jsx) | Violation notification |
| WaitingScreen | [client/modules/client/pages/WaitingScreen.jsx](client/modules/client/pages/WaitingScreen.jsx) | Exam wait screen |

---

## 2. BACKEND ROUTES INVENTORY

### 2.1 Authentication Routes
**File:** [server/routes/auth.js](server/routes/auth.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| POST | /api/auth/login | `handleLogin` | Rate-limited | L10 |
| POST | /api/auth/logout | `handleLogout` | None | L120 |
| POST | /api/auth/forgot-password | `handleForgotPassword` | None | L140 |
| POST | /api/auth/verify-otp | `handleVerifyOtp` | None | L160 |
| POST | /api/auth/reset-password | `handleResetPassword` | None | L180 |

### 2.2 User Management Routes
**File:** [server/routes/users.js](server/routes/users.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/users | `handleGetUsers` | authMiddleware, roleMiddleware(admin,hod) | L5 |
| POST | /api/users | `handleCreateUser` | authMiddleware, roleMiddleware(admin,hod) | L30 |
| POST | /api/users/bulk | `handleBulkUpload` | authMiddleware, roleMiddleware(admin,hod) | L75 |
| GET | /api/users/:id | `handleGetUserById` | authMiddleware | L140 |
| PUT | /api/users/:id | `handleUpdateUser` | authMiddleware | L155 |
| DELETE | /api/users/:id | `handleDeleteUser` | authMiddleware, roleMiddleware(admin) | L175 |

### 2.3 Course Management Routes
**File:** [server/routes/courses.js](server/routes/courses.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/courses | `handleGetCourses` | None | L5 |
| POST | /api/courses | `handleCreateCourse` | authMiddleware, roleMiddleware(admin,hod,faculty) | L25 |

### 2.4 Department Management Routes
**File:** [server/routes/departments.js](server/routes/departments.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/departments | `handleGetDepartments` | None | L5 |
| POST | /api/departments | `handleCreateDepartment` | authMiddleware, roleMiddleware(admin) | L15 |

### 2.5 Exam Management Routes
**File:** [server/routes/exams.js](server/routes/exams.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/exams | `handleGetExams` | authMiddleware | L5 |
| GET | /api/exams/:id | `handleGetExamById` | authMiddleware | L65 |
| POST | /api/exams/:id/allocate-seats | `handleAllocateSeats` | authMiddleware, roleMiddleware(faculty,hod,admin) | L95 |
| GET | /api/exams/:id/hall-tickets | `handleGetHallTickets` | authMiddleware | L185 |
| GET | /api/exams/my-active | Custom handler | authMiddleware, roleMiddleware(student) | - |

### 2.6 Device Management Routes
**File:** [server/routes/devices.js](server/routes/devices.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| POST | /api/devices/mock | Device mock creation | authMiddleware, roleMiddleware(admin) | L10 |
| POST | /api/devices/register | Device registration | None (Kiosk) | L35 |
| POST | /api/devices/heartbeat | Device heartbeat | None | L65 |
| GET | /api/devices | `handleGetDevices` | authMiddleware, roleMiddleware(admin,hod) | L95 |
| GET | /api/devices/pending | `handleGetPendingDevices` | authMiddleware, roleMiddleware(admin) | L115 |
| PATCH | /api/devices/:id/approve | Device approval | authMiddleware, roleMiddleware(admin) | L130 |

### 2.7 Lab Management Routes
**File:** [server/routes/lab.js](server/routes/lab.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/labs | Custom handler | authMiddleware, roleMiddleware(admin,hod) | L8 |
| POST | /api/labs | Create lab | authMiddleware, roleMiddleware(admin) | L20 |
| PATCH | /api/labs/:id | Update lab | authMiddleware, roleMiddleware(admin) | L40 |
| DELETE | /api/labs/:id | Delete lab | authMiddleware, roleMiddleware(admin) | L58 |

### 2.8 Question Bank Routes
**File:** [server/routes/questions.js](server/routes/questions.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/questions | `handleGetQuestions` | authMiddleware, roleMiddleware(faculty,hod,admin) | L5 |
| POST | /api/questions | `handleCreateQuestion` | authMiddleware, roleMiddleware(faculty,hod,admin) | L25 |
| PUT | /api/questions/:id | `handleUpdateQuestion` | authMiddleware, roleMiddleware(faculty,hod,admin) | L85 |
| DELETE | /api/questions/:id | `handleDeleteQuestion` | authMiddleware, roleMiddleware(faculty,hod,admin) | L55 |

### 2.9 Submission & Exam Delivery Routes
**File:** [server/routes/submissions.js](server/routes/submissions.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/exams-telemetry | `handleGetSubmissions` | authMiddleware | L5 |
| GET | /api/submissions/:id | `handleGetSubmissionById` | authMiddleware, verifyDevice | L30 |
| POST | /api/submissions/start | `handleStartExam` | authMiddleware, verifyDevice | L65 |
| PUT | /api/submissions/:id/answers | `handleUpdateAnswers` | authMiddleware, verifyDevice | L135 |
| POST | /api/submissions/:id/submit | `handleSubmitExam` | authMiddleware, verifyDevice | L250 |
| POST | /api/submissions/:id/force-submit | `handleForceSubmit` | authMiddleware, roleMiddleware(admin,hod,faculty) | L310 |
| PUT | /api/submissions/:id/evaluate | `handleEvaluateSubmission` | authMiddleware, roleMiddleware(admin,hod,faculty) | L340 |
| POST | /api/submissions/:id/revaluate | `handleRequestRevaluation` | authMiddleware | L380 |

### 2.10 Violation Tracking Routes
**File:** [server/routes/violations.js](server/routes/violations.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| POST | /api/violations | `handleCreateViolation` | authMiddleware, Rate-limited | L20 |
| GET | /api/violations | `handleGetViolations` | authMiddleware, roleMiddleware(admin,hod,faculty) | L65 |
| GET | /api/violations/my-count | Custom handler | authMiddleware, roleMiddleware(student) | - |

### 2.11 Profile Management Routes
**File:** [server/routes/profile.js](server/routes/profile.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/profile | `handleGetProfile` | authMiddleware | L5 |
| PUT | /api/profile | `handleUpdateProfile` | authMiddleware | L15 |
| PUT | /api/profile/password | `handleChangePassword` | authMiddleware | L40 |
| POST | /api/profile/upload | `handleUploadProfilePic` | authMiddleware, upload.single('file') | L55 |

### 2.12 Notification Routes
**File:** [server/routes/notifications.js](server/routes/notifications.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/notifications | `handleGetNotifications` | authMiddleware | L5 |
| PATCH | /api/notifications/:id/read | `handleMarkRead` | authMiddleware | L20 |
| PATCH | /api/notifications/read-all | `handleMarkAllRead` | authMiddleware | L35 |
| DELETE | /api/notifications/:id | `handleDeleteNotification` | authMiddleware | L50 |
| PATCH | /api/notifications/:id/archive | `handleArchiveNotification` | authMiddleware | L65 |
| GET | /api/notifications/preferences | `handleGetPreferences` | authMiddleware | L82 |
| PUT | /api/notifications/preferences | `handleUpdatePreferences` | authMiddleware | L95 |

### 2.13 Logging & Audit Routes
**File:** [server/routes/logs.js](server/routes/logs.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/logs/login | `handleGetLoginLogs` | authMiddleware, roleMiddleware(admin) | L5 |
| GET | /api/logs/activity | `handleGetActivityLogs` | authMiddleware, roleMiddleware(admin) | L20 |
| GET | /api/logs/violations | `handleGetGlobalViolations` | authMiddleware, roleMiddleware(admin,hod,faculty) | - |

### 2.14 Code Execution Routes
**File:** [server/routes/code.js](server/routes/code.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| POST | /api/code/run | `handleRunCode` | authMiddleware | L5 |
| GET | /api/code/check | `handleCheckCompilers` | None | L35 |

### 2.15 Analytics & Reporting Routes
**File:** [server/routes/analytics.js](server/routes/analytics.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| POST | /api/analytics/calculate-risk | `handleCalculateRiskProfiles` | authMiddleware, roleMiddleware(admin,hod) | L5 |
| GET | /api/analytics/risk-dashboard | `handleGetRiskDashboard` | authMiddleware, roleMiddleware(admin,hod) | L95 |

### 2.16 Reports Routes
**File:** [server/routes/reports.js](server/routes/reports.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/reports/system | `handleGetSystemStats` | authMiddleware, roleMiddleware(admin) | L5 |
| GET | /api/reports/faculty | `handleGetFacultyStats` | authMiddleware, roleMiddleware(faculty,hod) | L75 |
| GET | /api/reports/faculty/results | `handleGetFacultyResults` | authMiddleware, roleMiddleware(faculty,hod) | L180 |
| GET | /api/reports/faculty/monitoring | `handleGetFacultyMonitoring` | authMiddleware, roleMiddleware(faculty,hod) | - |
| GET | /api/reports/student | `handleGetStudentStats` | authMiddleware, roleMiddleware(student) | L130 |
| GET | /api/reports/student-results | `handleGetStudentResults` | authMiddleware, roleMiddleware(student) | - |

### 2.17 HOD-Specific Routes
**File:** [server/routes/hod.js](server/routes/hod.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/hod/stats | `handleGetHODStats` | authMiddleware, roleMiddleware(hod) | L5 |
| GET | /api/hod/exams | `handleGetHODExams` | authMiddleware, roleMiddleware(hod) | L50 |
| GET | /api/hod/faculty/status | `handleGetHODFacultyStatus` | authMiddleware, roleMiddleware(hod) | L65 |
| GET | /api/hod/students/monitoring | `handleGetHODStudentsMonitoring` | authMiddleware, roleMiddleware(hod) | L90 |
| GET | /api/hod/alerts | `handleGetHODAlerts` | authMiddleware, roleMiddleware(hod) | L115 |
| GET | /api/hod/analytics | `handleGetHODAnalytics` | authMiddleware, roleMiddleware(hod) | L155 |
| POST | /api/hod/faculty | `handleCreateHODFaculty` | authMiddleware, roleMiddleware(hod) | - |
| POST | /api/hod/student | `handleCreateHODStudent` | authMiddleware, roleMiddleware(hod) | - |
| POST | /api/hod/bulk | `handleHODBulkUpload` | authMiddleware, roleMiddleware(hod) | - |
| POST | /api/hod/exams | `handleCreateHODExam` | authMiddleware, roleMiddleware(hod,faculty) | - |
| PATCH | /api/hod/exams/:id/approve | `handleApproveHODExam` | authMiddleware, roleMiddleware(hod) | - |

### 2.18 Heartbeat & Proctoring Routes
**File:** [server/routes/heartbeat.js](server/routes/heartbeat.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| POST | /api/exam/heartbeat | `handleHeartbeat` | authMiddleware | L18 |

**Background Process:** `startHeartbeatJanitor` - Runs every 45s to detect inactivity violations | L60 |

### 2.19 Security & Screenshots Routes
**File:** [server/routes/securityEvents.js](server/routes/securityEvents.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/security-events | List events | authMiddleware, roleMiddleware(admin,hod) | L7 |
| POST | /api/security-events | Create event | authMiddleware, roleMiddleware(admin,hod) | L26 |

**File:** [server/routes/screenshots.js](server/routes/screenshots.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/screenshots/:fileId | `handleGetScreenshot` | authMiddleware, roleMiddleware(admin,hod,faculty) | L4 |

### 2.20 Settings Routes
**File:** [server/routes/settings.js](server/routes/settings.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/settings | `handleGetSettings` | None | L5 |
| PUT | /api/settings | `handleUpdateSettings` | authMiddleware, roleMiddleware(admin) | L15 |

### 2.21 System Health Routes
**File:** [server/index.js](server/index.js)

| Method | Endpoint | Handler | Middleware | Line |
|--------|----------|---------|------------|------|
| GET | /api/ping | Health check | None | L153 |
| GET | /api/demo | Demo endpoint | None | L156 |

---

## 3. DATABASE MODELS INVENTORY

### 3.1 Core Authentication Models

#### User Model
**File:** [server/models/User.js](server/models/User.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| name | String | required, unique | - |
| email | String | required, unique, lowercase, trim | - |
| password | String | required, minlength:6, hashed (bcrypt) | - |
| role | String | enum: [admin, hod, faculty, student, client, parent] | - |
| campusId | ObjectId | - | Campus |
| department | ObjectId | - | Department |
| children | [ObjectId] | Array (for parent role) | User |
| phone | String | - | - |
| profilePic | String | Base64 storage | - |
| isActive | Boolean | default: true | - |
| isVerified | Boolean | default: false | - |
| mustChangePassword | Boolean | default: true | - |
| lastLogin | Date | - | - |
| rollNumber | String | unique, sparse (student) | - |
| semester | String | student-specific | - |
| academicYear | String | student-specific | - |
| cgpa | Number | default: 0 | - |
| employeeId | String | unique, sparse (faculty/hod) | - |
| designation | String | faculty-specific | - |
| specialization | String | faculty-specific | - |
| office | String | hod-specific | - |
| resetPasswordToken | String | - | - |
| resetPasswordExpires | Date | - | - |
| otpCode | String | 6-digit code | - |
| otpExpires | Date | 10min TTL | - |

**Indexes:** `{ role: 1, department: 1 }`, `{ rollNumber: 1 }` (unique), `{ employeeId: 1 }` (unique)

#### TokenBlacklist Model
**File:** [server/models/TokenBlacklist.js](server/models/TokenBlacklist.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| jti | String | required, unique, index | - |
| userId | ObjectId | required, index | User |
| revokedAt | Date | default: now | - |
| reason | String | enum: [logout, password_change, admin_revoke, suspicious_activity] | - |
| ipAddress | String | - | - |
| expiresAt | Date | TTL index (auto-delete) | - |

### 3.2 Academic Core Models

#### Department Model
**File:** [server/models/Department.js](server/models/Department.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| name | String | required, unique, trim | - |
| code | String | required, unique, uppercase | - |
| campusId | ObjectId | - | Campus |
| hod | ObjectId | - | User |
| description | String | - | - |
| isActive | Boolean | default: true | - |

#### Course Model
**File:** [server/models/Course.js](server/models/Course.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| title | String | required, trim | - |
| code | String | required, unique, uppercase | - |
| description | String | - | - |
| campusId | ObjectId | - | Campus |
| department | ObjectId | required | Department |
| faculty | ObjectId | required | User |
| semester | Number | required, 1-8 | - |
| credits | Number | default: 3 | - |
| maxStudents | Number | default: 60 | - |
| enrolledStudents | [ObjectId] | Array | User |
| syllabus | String | - | - |
| isActive | Boolean | default: true | - |
| academicYear | String | required | - |

**Indexes:** `{ department: 1 }`, `{ faculty: 1 }`

#### Campus Model
**File:** [server/models/Campus.js](server/models/Campus.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| name | String | required, unique | - |
| location | String | required | - |
| code | String | required, unique | - |
| status | String | enum: [active, inactive] | - |

### 3.3 Exam & Submission Models

#### Exam Model
**File:** [server/models/Exam.js](server/models/Exam.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| title | String | required, trim | - |
| description | String | - | - |
| campusId | ObjectId | - | Campus |
| course | ObjectId | required | Course |
| faculty | ObjectId | required | User |
| department | ObjectId | required | Department |
| questions | [Sub-schema] | Dynamic polymorphic questions | - |
| totalMarks | Number | required | - |
| duration | Number | required (minutes) | - |
| scheduledAt | Date | required | - |
| endsAt | Date | - | - |
| allowedStudents | [ObjectId] | Array | User |
| assignedDevices | [ObjectId] | Array | Device |
| status | String | enum: [draft, scheduled, active, completed, cancelled] | - |
| security | Object | Copy-paste, tab-switch, fullscreen, devtools, randomization settings | - |
| passingMarks | Number | default: 0 | - |
| isPublished | Boolean | default: false | - |
| approvedByHod | Boolean | default: false | - |
| approvedBy | ObjectId | - | User |

**Sub-fields (questions):**
- type: enum [mcq, text, coding, math, file]
- questionText, options, correctAnswer
- language, testCases (for coding)
- answerType, allowedExtensions
- marks, difficulty, topic

**Indexes:** `{ department: 1, status: 1 }`, `{ faculty: 1 }`, `{ scheduledAt: -1 }`

#### Submission Model
**File:** [server/models/Submission.js](server/models/Submission.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| exam | ObjectId | required | Exam |
| student | ObjectId | required | User |
| device | ObjectId | - | Device |
| answers | Mixed | Dynamic, polymorphic | - |
| manualMarks | Mixed | Faculty grading | - |
| questionOrder | [Number] | Randomized order if enabled | - |
| totalMarks | Number | - | - |
| marksObtained | Number | - | - |
| percentage | Number | - | - |
| revaluationRequested | Boolean | default: false | - |
| revaluationReason | String | - | - |
| revaluationStatus | String | enum: [none, pending, approved, rejected, completed] | - |
| grade | String | - | - |
| passed | Boolean | - | - |
| startedAt | Date | - | - |
| submittedAt | Date | - | - |
| timeTaken | Number | seconds | - |
| violations | [Sub-schema] | Violation events array | - |
| totalViolations | Number | Counter | - |
| isFlagged | Boolean | default: false | - |
| flagReason | String | - | - |
| lateSubmission | Boolean | default: false | - |
| lateAttempt | Boolean | default: false | - |
| status | String | enum: [in_progress, submitted, auto_submitted, terminated] | - |

**Violation Sub-schema fields:**
- type: enum (tab_switch, copy_paste, fullscreen_exit, devtools_open, etc.)
- timestamp, count

**Indexes:** `{ exam: 1, status: 1 }`, `{ student: 1 }`, `{ exam: 1, student: 1 }` (unique)

#### HallTicket Model
**File:** [server/models/HallTicket.js](server/models/HallTicket.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| exam | ObjectId | required | Exam |
| student | ObjectId | required | User |
| lab | ObjectId | - | Lab |
| device | ObjectId | - | Device |
| seatNumber | String | e.g., "LAB-A-001" | - |
| ticketNumber | String | unique | - |
| issuedAt | Date | default: now | - |

**Indexes:** `{ exam: 1, student: 1 }` (unique), `{ ticketNumber: 1 }`

### 3.4 Question Bank Model

#### QuestionBank Model
**File:** [server/models/QuestionBank.js](server/models/QuestionBank.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| type | String | enum: [mcq, text, coding, math, file] | - |
| questionText | String | required | - |
| options | Object | A, B, C, D (MCQ options) | - |
| correctAnswer | String | - | - |
| language | String | Coding language | - |
| testCases | [Sub-schema] | Input/output pairs | - |
| answerType | String | enum: [short, long] | - |
| allowedExtensions | [String] | For file uploads | - |
| marks | Number | default: 1 | - |
| difficulty | String | enum: [easy, medium, hard] | - |
| topic | String | - | - |
| course | ObjectId | - | Course |
| department | ObjectId | - | Department |
| createdBy | ObjectId | required | User |
| tags | [String] | - | - |
| usageCount | Number | default: 0 | - |
| isActive | Boolean | default: true | - |

### 3.5 Device & Lab Models

#### Device Model
**File:** [server/models/Device.js](server/models/Device.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| deviceId | String | required, unique, index | - |
| macAddress | String | required | - |
| cpuId | String | required | - |
| motherboardSerial | String | required | - |
| machineFingerprint | String | required, unique, index | - |
| deviceSecret | String | JWT signing secret | - |
| status | String | enum: [pending, approved, revoked, maintenance], index | - |
| labId | ObjectId | - | Lab |
| approvedBy | ObjectId | - | User |
| approvedAt | Date | - | - |
| lastHeartbeat | Date | index | - |

**Indexes:** `{ deviceId: 1 }`, `{ machineFingerprint: 1 }`, `{ status: 1 }`, `{ lastHeartbeat: 1 }`

#### Lab Model
**File:** [server/models/Lab.js](server/models/Lab.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| name | String | required | - |
| labCode | String | required, unique | - |
| subnet | String | required | - |
| capacity | Number | required, default: 30 | - |
| status | String | enum: [active, inactive] | - |

#### LabSession Model
**File:** [server/models/LabSession.js](server/models/LabSession.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| exam | ObjectId | - | Exam |
| lab | String | required | - |
| initiatedBy | ObjectId | required | User |
| devices | [ObjectId] | Array | Device |
| status | String | enum: [idle, exam_active, locked, ended] | - |
| startedAt | Date | - | - |
| endedAt | Date | - | - |
| commands | [Sub-schema] | Command history | - |

**Command Sub-schema:**
- command: "lock_all", "unlock_all", "exam_mode", etc.
- sentAt, sentBy, targetDevices

**Indexes:** `{ exam: 1 }`, `{ status: 1 }`, `{ lab: 1 }`

### 3.6 Violation & Security Models

#### Violation Model
**File:** [server/models/Violation.js](server/models/Violation.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| student | ObjectId | required | User |
| exam | ObjectId | required | Exam |
| department | ObjectId | - | Department |
| type | String | enum: [tab_switch, copy_paste, fullscreen_exit, devtools_open, right_click, window_blur, keyboard_shortcut, inactivity, unauthorized_face, multiple_faces, phone_detected, periodic_snapshot, switched_tab, tools_open] | - |
| message | String | - | - |
| timestamp | Date | default: now | - |
| screenshot | String | URL or base64 | - |
| severity | String | enum: [low, medium, high] | - |
| isResolved | Boolean | default: false | - |
| resolvedBy | ObjectId | - | User |

**Indexes:** `{ exam: 1, type: 1 }`, `{ student: 1, exam: 1 }`, `{ department: 1, createdAt: -1 }`

#### SecurityEvent Model
**File:** [server/models/SecurityEvent.js](server/models/SecurityEvent.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| deviceId | ObjectId | required | Device |
| studentId | ObjectId | - | User |
| examId | ObjectId | - | Exam |
| eventType | String | required, index | - |
| severity | String | enum: [low, medium, high, critical] | - |
| evidenceImage | String | Base64 encoded | - |
| metadata | Mixed | Extensible data | - |
| timestamp | Date | default: now, index | - |

#### RiskProfile Model
**File:** [server/models/RiskProfile.js](server/models/RiskProfile.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| student | ObjectId | required, unique | User |
| riskScore | Number | 0-100 | - |
| riskLevel | String | enum: [low, medium, high, critical] | - |
| primaryFactors | [String] | Risk contributing factors | - |
| lastCalculated | Date | default: now | - |

**Indexes:** `{ riskScore: -1 }`, `{ riskLevel: 1 }`

### 3.7 Heartbeat Models

#### DeviceHeartbeat Model
**File:** [server/models/DeviceHeartbeat.js](server/models/DeviceHeartbeat.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| deviceId | ObjectId | required | Device |
| studentId | ObjectId | - | User |
| examId | ObjectId | - | Exam |
| status | String | enum: [online, offline, exam_running, locked, disconnected] | - |
| cpuUsage | Number | Percentage | - |
| memoryUsage | Number | Percentage | - |
| networkStatus | String | - | - |
| timestamp | Date | default: now, index | - |

#### ExamHeartbeat Model
**File:** [server/models/ExamHeartbeat.js](server/models/ExamHeartbeat.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| student | ObjectId | required, index | User |
| exam | ObjectId | required, index | Exam |
| submission | ObjectId | required | Submission |
| lastBeat | Date | default: now, index | - |
| ipAddress | String | - | - |
| userAgent | String | - | - |
| answerHash | String | SHA256 of answers | - |
| missedBeats | Number | default: 0 | - |
| isActive | Boolean | default: true | - |

**Indexes:** `{ student: 1, exam: 1 }` (unique), `{ lastBeat: 1, isActive: 1 }`

### 3.8 Logging & Audit Models

#### LoginLog Model
**File:** [server/models/LoginLog.js](server/models/LoginLog.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| user | ObjectId | - | User |
| email | String | Stores even if user not found | - |
| role | String | - | - |
| ipAddress | String | - | - |
| userAgent | String | - | - |
| device | ObjectId | - | Device |
| status | String | enum: [success, failed, blocked] | - |
| failReason | String | "wrong_password", "not_found", etc. | - |
| timestamp | Date | default: now | - |

**Indexes:** `{ timestamp: -1 }`, `{ user: 1, timestamp: -1 }`

#### ActivityLog Model
**File:** [server/models/ActivityLog.js](server/models/ActivityLog.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| user | ObjectId | required | User |
| action | String | required, enum of 25+ actions | - |
| resource | String | Name of resource | - |
| resourceId | ObjectId | - | - |
| resourceType | String | "Exam", "User", "Device", etc. | - |
| ipAddress | String | - | - |
| meta | Mixed | Extensible metadata | - |
| timestamp | Date | default: now | - |

**Indexes:** `{ timestamp: -1 }`, `{ user: 1, timestamp: -1 }`, `{ action: 1, timestamp: -1 }`, `{ resourceId: 1, action: 1 }`

### 3.9 Notification & Preference Models

#### Notification Model
**File:** [server/models/Notification.js](server/models/Notification.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| recipient | ObjectId | required | User |
| title | String | required | - |
| message | String | required | - |
| type | String | enum: [exam_scheduled, exam_started, exam_result, attendance_alert, violation_alert, approval_needed, approval_granted, approval_rejected, system, announcement] | - |
| link | String | Frontend route | - |
| isRead | Boolean | default: false | - |
| readAt | Date | - | - |
| sender | ObjectId | null for system | User |

**Indexes:** `{ recipient: 1, isRead: 1, createdAt: -1 }`

#### NotificationPreference Model
**File:** [server/models/NotificationPreference.js](server/models/NotificationPreference.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| user | ObjectId | required, unique | User |
| emailNotifications | Boolean | default: true | - |
| pushNotifications | Boolean | default: true | - |
| notifyOnNewAssignment | Boolean | default: true | - |
| notifyOnGradePosted | Boolean | default: true | - |
| notifyOnAnnouncement | Boolean | default: true | - |
| notifyOnTicketUpdate | Boolean | default: true | - |

### 3.10 Academic Tracking Models

#### Attendance Model
**File:** [server/models/Attendance.js](server/models/Attendance.js)

| Field | Type | Properties | References |
|-------|------|-----------|-----------|
| course | ObjectId | required | Course |
| faculty | ObjectId | required | User |
| date | Date | required | - |
| period | String | "1st Hour", "2nd Hour" | - |
| topic | String | - | - |
| records | [Sub-schema] | Per-student attendance | - |
| totalStudents | Number | - | - |
| presentCount | Number | - | - |

**Attendance Record Sub-schema:**
- student: ObjectId (User)
- status: enum [present, absent, late, excused]
- markedAt: Date

**Indexes:** `{ course: 1, date: 1, period: 1 }` (unique)

#### Mark Model
**File:** [server/models/Mark.js](server/models/Mark.js)

| Field | Type | Properties | References |
|-------|------|-----------|---------|
| course | ObjectId | required | Course |
| faculty | ObjectId | required | User |
| type | String | enum: [CAT1, CAT2, Assignment, Lab, Model, Final] | - |
| title | String | required | - |
| totalMarks | Number | required | - |
| conductedOn | Date | - | - |
| entries | [Sub-schema] | Per-student grades | - |
| isPublished | Boolean | default: false | - |

**Grade Entry Sub-schema:**
- student: ObjectId (User)
- marksObtained, totalMarks, percentage, grade
- passed, remarks

#### StudentProfile Model
**File:** [server/models/StudentProfile.js](server/models/StudentProfile.js)

| Field | Type | Properties | References |
|-------|------|-----------|---------|
| user | ObjectId | required, unique | User |
| rollNumber | String | required, unique | - |
| batch | String | "2021-2025" | - |
| currentSemester | Number | default: 1 | - |
| gpa | Number | default: 0 | - |
| attendancePercentage | Number | default: 0 | - |
| enrolledCourses | [ObjectId] | Array | Course |
| academicHistory | [Sub-schema] | Per-semester GPA | - |
| guardianName | String | - | - |
| guardianPhone | String | - | - |
| address | String | - | - |

**Academic History Sub-schema:**
- semester, gpa, backlogs

#### Timetable Model
**File:** [server/models/Timetable.js](server/models/Timetable.js)

| Field | Type | Properties | References |
|-------|------|-----------|---------|
| department | ObjectId | required | Department |
| semester | Number | required | - |
| section | String | required | - |
| slots | [Sub-schema] | Class slots | - |
| createdBy | ObjectId | required | User |

**Slot Sub-schema:**
- day: enum [Monday-Saturday]
- startTime, endTime (HH:mm format)
- course: ObjectId (Course)
- faculty: ObjectId (User)
- room: String

**Indexes:** `{ department: 1, semester: 1, section: 1 }` (unique)

### 3.11 System Settings Model

#### Settings Model
**File:** [server/models/Settings.js](server/models/Settings.js)

| Field | Type | Properties | References |
|-------|------|-----------|---------|
| institutionName | String | default: "EduLearn University" | - |
| institutionEmail | String | - | - |
| institutionPhone | String | - | - |
| logoUrl | String | - | - |
| currentAcademicYear | String | default: "2024-2025" | - |
| currentSemester | Number | default: 4 | - |
| maxStudentsPerCourse | Number | default: 60 | - |
| security | Object | Global security defaults | - |
| smtpHost | String | - | - |
| smtpPort | Number | default: 587 | - |
| notificationEmail | String | - | - |
| gradingScale | Mixed | Flexible grading scale | - |

#### Session Model
**File:** [server/models/Session.js](server/models/Session.js)

| Field | Type | Properties | References |
|-------|------|-----------|---------|
| studentId | ObjectId | required | User |
| deviceId | ObjectId | required | Device |
| examId | ObjectId | required | Exam |
| startTime | Date | default: now | - |
| status | String | enum: [active, completed, disconnected] | - |
| lastHeartbeat | Date | default: now | - |

**Indexes:** `{ deviceId: 1, status: 1 }`, `{ studentId: 1 }`, `{ examId: 1 }`

---

## 4. SOCKET.IO EVENTS INVENTORY

### 4.1 Socket.IO Event Definitions

**Server File:** [server/socket.js](server/socket.js)

#### Authentication & Connection Management

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| connection | Server → Client | Authenticate via JWT | [socket.js:L47](server/socket.js#L47) | L47 |
| disconnect | Server → Client | Clean up device status | [socket.js:L248](server/socket.js#L248) | L248 |

#### Dashboard & Admin Events

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| join-dashboard | Client → Server | Restrict to admin/hod/faculty | [socket.js:L69](server/socket.js#L69) | L69 |
| admin-dashboard | Broadcast | Join room for notifications | [socket.js](server/socket.js) | - |
| stats-update | Server → Client | Broadcast system stats | [socket.js:L321](server/socket.js#L321) | L321 |
| device-update | Server → Client | Device status change | [socket.js:L229,L269,L298](server/socket.js#L229) | L229 |
| device-update-bulk | Server → Client | Bulk device updates | [server/index.js:L322](server/index.js#L322) | L322 |

#### User Communication

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| join-user-room | Client → Server | Join private user room | [socket.js:L79](server/socket.js#L79) | L79 |
| send-message | Client → Server | Send user-to-user message | [socket.js:L90](server/socket.js#L90) | L90 |
| receive-message | Server → Client | Receive message notification | [socket.js:L104,L105](server/socket.js#L104) | L104 |

#### Live Exam Monitoring

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| join-exam-room-monitoring | Client → Server | Proctor joins exam monitor | [socket.js:L114](server/socket.js#L114) | L114 |
| monitoring-{examId} | Broadcast | Monitor room for exam | [socket.js](server/socket.js) | - |
| screen-data | Client → Server | Student sends screen frame | [socket.js:L124](server/socket.js#L124) | L124 |
| screen-update | Server → Client | Broadcast student screen to proctors | [socket.js:L149](server/socket.js#L149) | L149 |
| monitoring-device-{deviceId} | Broadcast | Live frame update room | [socket.js](server/socket.js) | - |
| live-frame | Client → Server | Electron kiosk sends frame | [socket.js:L160](server/socket.js#L160) | L160 |
| live-frame-update | Server → Client | Broadcast device frame | [socket.js:L162](server/socket.js#L162) | L162 |

#### Violation & Security Events

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| security-violation | Client → Server | Electron reports violation | [socket.js:L170](server/socket.js#L170) | L170 |
| new-violation | Server → Client | Broadcast violation to dashboard | [socket.js:L211](server/socket.js#L211), [submissions.js:L193](server/routes/submissions.js#L193), [heartbeat.js:L98](server/routes/heartbeat.js#L98) | L211 |
| new-security-violation | Server → Client | Critical security event | [socket.js:L210](server/socket.js#L210) | L210 |

#### Device Control & Commands

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| device-connect | Client → Server | Device registers/connects | [socket.js:L218](server/socket.js#L218), [electron-client/main.js:L252](electron-client/main.js#L252) | L218 |
| device-{id} | Broadcast | Target device command room | [socket.js:L244](server/socket.js#L244) | L244 |
| send-command | Client → Server | Send command to devices | [socket.js:L236](server/socket.js#L236) | L236 |
| receive-command | Server → Client | Device receives command | [socket.js:L244](server/socket.js#L244), [electron-client/main.js:L255](electron-client/main.js#L255) | L244 |

#### Activity & Notifications

| Event Name | Direction | Handler | Source Location | Line |
|-----------|-----------|---------|------------------|------|
| new-activity | Server → Client | Activity log notification | [socket.js:L292](server/socket.js#L292), [submissions.js:L271](server/routes/submissions.js#L271) | L292 |
| exam-started | Server → Client | New exam started notification | [submissions.js:L132](server/routes/submissions.js#L132) | L132 |
| force-submit-client | Server → Client | Force student submissions | [submissions.js:L322](server/routes/submissions.js#L322) | L322 |
| new-violation | Server → Client | General violation event | [violations.js](server/routes/violations.js) | - |

#### Client-Side Socket Events (Frontend)

**File:** [client/contexts/SocketContext.jsx](client/contexts/SocketContext.jsx)

| Event Name | Handler | Location | Line |
|-----------|---------|----------|------|
| connect | Socket connected | [SocketContext.jsx:L39](client/contexts/SocketContext.jsx#L39) | L39 |
| new-violation | Violation notification (Navbar) | [client/shared/components/Navbar/Navbar.jsx:L58](client/shared/components/Navbar/Navbar.jsx#L58) | L58 |

**File:** [client/shared/components/Monitoring/LiveScreenGrid.jsx](client/shared/components/Monitoring/LiveScreenGrid.jsx)

| Event Name | Handler | Location | Line |
|-----------|---------|----------|------|
| join-exam-room-monitoring | Emit to server | [LiveScreenGrid.jsx:L49](client/shared/components/Monitoring/LiveScreenGrid.jsx#L49) | L49 |
| connect | Re-join on reconnect | [LiveScreenGrid.jsx:L59](client/shared/components/Monitoring/LiveScreenGrid.jsx#L59) | L59 |
| screen-update | Receive screen updates | [LiveScreenGrid.jsx:L75](client/shared/components/Monitoring/LiveScreenGrid.jsx#L75) | L75 |

**File:** [client/modules/student/pages/ExamInterface.jsx](client/modules/student/pages/ExamInterface.jsx)

| Event Name | Handler | Location | Line |
|-----------|---------|----------|------|
| screen-data | Emit student data | [ExamInterface.jsx:L342](client/modules/student/pages/ExamInterface.jsx#L342) | L342 |

### 4.2 Socket Authentication & Security
- **Auth Mechanism:** JWT token via `socket.handshake.auth.token` or Authorization header
- **Device Token:** Machine fingerprint + deviceSecret for Electron kiosk
- **CORS Origins:** Configurable via `process.env.ALLOWED_ORIGINS`
- **Redis Adapter:** Optional scaling via `process.env.REDIS_URL`
- **File:** [server/socket.js:L11-L27](server/socket.js#L11)

---

## 5. ENVIRONMENT VARIABLES INVENTORY

### 5.1 Critical Configuration Variables

| Variable | Used In | Purpose | Referenced Line |
|----------|---------|---------|-----------------|
| **MONGODB_URI** | [server/index.js:L92](server/index.js#L92), [server/seed_lab.js:L15](server/seed_lab.js#L15), [server/middleware/upload.js:L17](server/middleware/upload.js#L17) | MongoDB connection string | L92 |
| **JWT_SECRET** | [server/middleware/auth.js:L5](server/middleware/auth.js#L5), [server/socket.js:L6](server/socket.js#L6) | JWT signing key for authentication | L5 |
| **PORT** | [server/node-build.js:L6](server/node-build.js#L6) | Server port (default: 3000) | L6 |
| **NODE_ENV** | [vite.config.server.js:L51](vite.config.server.js#L51), [server/middleware/security.js:L68](server/middleware/security.js#L68) | Environment (production/development) | L51 |
| **ALLOWED_ORIGINS** | [server/socket.js:L11-L12](server/socket.js#L11), [server/middleware/security.js:L58-L59](server/middleware/security.js#L58) | CORS-allowed domains (comma-separated) | L11 |
| **REDIS_URL** | [server/socket.js:L24-L25](server/socket.js#L24) | Redis connection for Socket.io scaling | L24 |
| **API_URL** | [electron-client/services/api.js:L5](electron-client/services/api.js#L5), [electron-client/main.js:L42](electron-client/main.js#L42), [electron-client/main.js:L163](electron-client/main.js#L163), [electron-client/main.js:L243](electron-client/main.js#L243) | Backend API endpoint for Electron kiosk | L5 |

### 5.2 System Environment Variables (Windows)

| Variable | Used In | Purpose | Referenced Line |
|----------|---------|---------|-----------------|
| **PATH** | [server/utils/codeExecutor.js:L157](server/utils/codeExecutor.js#L157), [server/routes/code.js:L44](server/routes/code.js#L44) | System PATH for compiler execution | L157 |
| **SystemRoot** | [server/utils/codeExecutor.js:L219](server/utils/codeExecutor.js#L219) | Windows system root | L219 |
| **System32** | [server/utils/codeExecutor.js:L220](server/utils/codeExecutor.js#L220) | Windows System32 directory | L220 |
| **WINDIR** | [server/utils/codeExecutor.js:L221](server/utils/codeExecutor.js#L221) | Windows directory | L221 |
| **USERPROFILE** | [server/utils/codeExecutor.js:L222](server/utils/codeExecutor.js#L222) | User profile path | L222 |
| **HOMEPATH** | [server/utils/codeExecutor.js:L223](server/utils/codeExecutor.js#L223) | Home directory path | L223 |
| **HOMEDRIVE** | [server/utils/codeExecutor.js:L224](server/utils/codeExecutor.js#L224) | Home drive letter | L224 |

### 5.3 Build & Test Variables

| Variable | Used In | Purpose | Referenced Line |
|----------|---------|---------|-----------------|
| **NODE_ENV** | [tests/server/middleware/security.test.js:L55,L56,L59,L60,L65,L78,L79,L90,L91](tests/server/middleware/security.test.js) | Environment override for tests | L55 |
| **ALLOWED_ORIGINS** (test) | [tests/server/middleware/security.test.js:L56,L64,L78](tests/server/middleware/security.test.js) | Testing CORS settings | L56 |

---

## 6. KEY SECURITY FINDINGS

### 6.1 Authentication & Authorization
- ✅ JWT with unique `jti` for token revocation
- ✅ Password hashing via bcrypt
- ✅ Role-based access control (RBAC) enforced
- ✅ Submission ownership checks ([submissions.js:L152](server/routes/submissions.js#L152))
- ✅ Room-based socket access restrictions ([socket.js:L73,L120](server/socket.js#L73))

### 6.2 Exam Integrity
- ✅ Server-side heartbeat monitoring to detect disconnection/inactivity ([heartbeat.js:L60](server/routes/heartbeat.js#L60))
- ✅ Deadline enforcement for exam submissions ([submissions.js:L165](server/routes/submissions.js#L165))
- ✅ Correct answer stripping from student view ([exams.js:L40](server/routes/exams.js#L40))
- ✅ Copy/paste and tab-switch detection ([Exam model](server/models/Exam.js))

### 6.3 Violation Tracking
- ✅ Multi-type violation classification (13+ types)
- ✅ Screenshot evidence capture & storage
- ✅ Real-time violation broadcasting to proctors
- ✅ Risk scoring based on violation patterns ([analytics.js:L5](server/routes/analytics.js#L5))

### 6.4 Device Security
- ✅ Machine fingerprinting for device identification
- ✅ Device approval workflow (pending → approved)
- ✅ Device status monitoring (online/offline)
- ✅ Device-specific JWT tokens

---

## 7. AUDIT SUMMARY

- **Total JSX Pages:** 44 components across 6 modules
- **Total Routes:** 100+ endpoints across 20 route files
- **Total Models:** 25 MongoDB collections
- **Total Socket Events:** 30+ real-time events
- **Critical Env Variables:** 7 (MONGODB_URI, JWT_SECRET, etc.)
- **Security Middleware:** Auth, Device Auth, CORS, Rate Limiting, CSP Headers

**Audit Date:** June 18, 2026  
**Audit Scope:** Complete codebase inventory (forensic analysis)

---

*End of Comprehensive Code Audit Report*
