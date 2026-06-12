# NEClms: Enterprise Learning & Campus Management System
**Product Inventory & Architecture Report**
*Status: Post-Sprint 2 Completion*

---

## 1. PROJECT INVENTORY

**Product Name:** NEClms (Network Enabled Campus Learning Management System)
**Product Purpose:** A unified, highly-secure enterprise application designed to manage academic life cycles, secure examination proctoring, and facilitate real-time inter-departmental communication and collaboration.
**Architecture Overview:** MERN-based Single Page Application (SPA) utilizing a centralized Express REST API, MongoDB for persistent storage, GridFS for scalable BLOB storage (attachments/submissions), and Socket.io for low-latency real-time telemetry and messaging.
**Technology Stack:**
- **Frontend:** React 18, React Router 6 (SPA), Vite, TailwindCSS 3, Radix UI, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB 8.0+, Mongoose ORM, GridFS (native streaming).
- **Real-Time Engine:** Socket.io (Bi-directional event pooling).
- **Security:** JWT Authentication, Bcrypt hashing, Role-Based Access Control (RBAC) middleware, Multer MIME-type filtering.

**Database Collections:** 
User, Course, Department, Campus, LoginLog, ActivityLog, Device, Lab, LabSession, Exam, Question, Mark, Material, Assignment, AssignmentSubmission, Announcement, AnnouncementRead, Message, Notification, NotificationPreference, Ticket, TicketReply, TicketAssignment, Discussion, DiscussionReply, Timetable, RiskProfile, JobPosting, Fee.

**Socket Events:**
- `new_message`: Pushes real-time internal messages.
- (Proctoring/Telemetry events from Sprint 1) `exam_start`, `violation_detected`, `force_lock`.

**Authentication Methods:** JWT (JSON Web Tokens) passed via Authorization Bearer headers.
**Authorization Matrix:** Multi-tiered RBAC enforced via backend `roleMiddleware(["admin", "hod", "faculty", "student"])` and frontend `<ProtectedRoute>` routers.

---

## 2. ROLES

### 🛡️ Admin
- **Accessible Pages:** System Dashboard, User Management, Devices, Lab Control, All Exams, Live Monitoring, Audit Logs, Settings, Analytics.
- **Features:** Global override capabilities. Can edit/delete Announcements, assign global Help Desk tickets, manage physical Lab PC MAC addresses.
- **Restrictions:** None. Absolute system visibility.

### 🏛️ HOD (Head of Department)
- **Accessible Pages:** HOD Dashboard, Faculty Management, Department Exams, Reports, Students, Communications (Announcements, Messaging, Help Desk, Discussions).
- **Features:** Departmental oversight. Can assign faculty to courses, view aggregate department analytics, and message any faculty/student in their department.
- **Restrictions:** Sandboxed entirely to their assigned `Department`.

### 👨‍🏫 Faculty
- **Accessible Pages:** Faculty Dashboard, Create Exam, Question Bank, Results, Violations, Evidence Vault, Materials, Assignments, Communications.
- **Features:** Academic operations. Can upload materials, create assignments, grade submissions, moderate course-specific discussion forums, and monitor active exams.
- **Restrictions:** Scoped to `courses` where they are explicitly listed as the designated instructor. Cannot view cross-departmental data.

### 🎓 Student
- **Accessible Pages:** Student Dashboard, My Exams, Exam Interface, Results, Playground, Materials, Assignments, Job Board, Fees, Communications.
- **Features:** Academic consumption. Can download materials, upload assignment submissions, engage in course forums, and securely take exams.
- **Restrictions:** Deeply sandboxed. Can only access materials and forums for explicitly enrolled courses. Messaging contacts are restricted to their active faculty list.

### 💻 Client (Lab PC)
- **Accessible Pages:** Waiting Room, Active Exam Interface, Locked State, Violation State.
- **Features:** Headless/Kiosk execution. Locks into a full-screen browser sandbox. Streams webcam telemetry and hardware interrupt events to the backend.
- **Restrictions:** No navigation. Cannot access external URLs or LMS dashboards.

---

## 3. PAGES INVENTORY

| Page Name | Route | Module | Role Access | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Profile** | `/profile` | User Mgmt | All | ✅ Active |
| **Messaging** | `/*/messages` | Communications | All | ✅ Active |
| **Announcements** | `/*/announcements` | Communications | All | ✅ Active |
| **Help Desk** | `/*/helpdesk` | Support | All | ✅ Active |
| **Discussions** | `/*/discussions` | Communications | All | ✅ Active |
| **Notification Settings** | `/*/notifications/settings`| Communications | All | ✅ Active |
| **Materials** | `/*/materials` | Academics | Faculty/Student | ✅ Active |
| **Assignments** | `/*/assignments` | Academics | Faculty/Student | ✅ Active |
| **Exam Interface** | `/student/exam/:id` | Exams | Student | ✅ Active |
| **Live Monitoring** | `/admin/monitoring` | Proctoring | Admin/HOD | ✅ Active |

---

## 4. COMPLETED MODULES (Sprints 1 & 2)

1. **Authentication & Identity Management**
2. **User Management** 
3. **Course Management** 
4. **Question Bank** 
5. **Exam Management** 
6. **Proctoring Engine** 
7. **Violations & Evidence Vault** 
8. **Course Materials** 
9. **Assignments & Grading** 
10. **Announcements** 
11. **Messaging** 
12. **Notifications** 
13. **Help Desk** 
14. **Discussion Forums** 
15. **System Auditing** 

---

## 5. WORKFLOWS

**Faculty Workflow:** Log in → Navigate to Course → Upload PDF Syllabus (Material) → Create Midterm (Assignment) → Post to Course Forum (Discussion) → Grade incoming Student Submissions.
**Student Workflow:** Log in → View active Announcements → Check Notification Bell for new Assignment → Download Faculty Syllabus → Upload Assignment Submission → Message Faculty member with a clarification question.
**Admin Workflow:** Log in → Review System Logs → Access Help Desk → Re-assign technical ticket to IT Staff → Broadcast institutional emergency Announcement to all Campuses.

---

## 6. DATABASE ARCHITECTURE

**Core Collections & Ownership Models:**
- `User`: Base identity. Owns Profile pictures.
- `Course`: Maps to `Department`. Has `faculty` (Owner) and `enrolledStudents` (Array of ObjectIds).
- `ActivityLog`: Immutable system ledger. Owned by `User`.
- `Material` / `Assignment`: Owned by `Course` and `Faculty`.
- `AssignmentSubmission`: Owned by `Student`, linked to `Assignment`.
- `Announcement`: Broadcasted globally or scoped via `targetCampuses`, `targetDepartments`.
- `Message`: Linked to `sender` and `receiver` (User).
- `Ticket`: Owned by `createdBy`. SLA managed by `TicketAssignment`.
- `Discussion`: Owned by `Course`. Moderated by `Faculty`.

**GridFS Buckets:**
- `uploads.files` / `uploads.chunks` (Stores all BLOBs, PDF, DOCX, JPG).

**Indexes:**
- `AnnouncementRead`: `{ announcement: 1, user: 1 }` (Unique)
- `Message`: `{ sender: 1, receiver: 1 }`, `{ createdAt: -1 }`

---

## 7. API INVENTORY

**Authentication:** `POST /api/auth/login`, `GET /api/auth/me`
**Academics:** `GET /api/materials`, `POST /api/materials`, `GET /api/assignments`, `POST /api/assignments`
**Comms (Sprint 2):** 
- `GET /api/announcements`, `POST /api/announcements`, `PUT /api/announcements/:id`, `DELETE /api/announcements/:id`
- `GET /api/messages/contacts`, `GET /api/messages/search`, `POST /api/messages`, `GET /api/messages/:userId`
- `GET /api/notifications`, `PATCH /api/notifications/:id/archive`, `PUT /api/notifications/preferences`
- `POST /api/tickets`, `PATCH /api/tickets/:id/resolve`, `POST /api/tickets/:id/reply`, `PATCH /api/tickets/:id/assign`
- `POST /api/discussions`, `PATCH /api/discussions/:id/moderate`

---

## 8. FEATURE COMPLETION MATRIX

**Implemented (Production-Ready):**
- Real-time internal messaging with GridFS attachment passing.
- Scoped announcements with unique read-receipt analytics.
- Course-isolated discussion forums with Faculty moderation.
- SLA-tracked Support Help Desk with internal escalations.
- Strict MIME-type and Payload constraints on all file buffers.
- Granular Role-Based Access Control and Course Enrollment checks.

**Known Limitations & Technical Debt:**
- *Notification Triggers:* Currently heavily coupled to `ActivityLog` hooks. Could benefit from a dedicated Redis Pub/Sub queue in the future to offload Node.js event loop strain.
- *Search:* Message search uses MongoDB `$regex`, which is performant at current scale but will require a text-search index or ElasticSearch cluster if messaging histories exceed millions of rows.

---

## 9. STRATEGIC ROADMAP

**▶ Sprint 3: Scheduling & Timetable Management**
*Focus:* Implement grid-based Timetable management, conflict resolution algorithms for faculty scheduling, and student class calendars.
*Collections needed:* `Timetable`, `Slot`, `Attendance`.

**▶ Sprint 4: Financial & Fee Management**
*Focus:* Payment gateway integration, student ledger generation, fee receipt PDFs, and outstanding balance restrictions.
*Collections needed:* `Fee`, `Transaction`, `Invoice`.

**▶ Sprint 5: Career & Placements Board**
*Focus:* Job postings, resume parsing, interview scheduling, and alumni tracking.
*Collections needed:* `JobPosting`, `Application`, `CompanyProfile`.

**▶ Sprint 6: DevOps, Cloud Integration & Final Penetration Testing**
*Focus:* Migrate local GridFS buckets to AWS S3 adapters. Deploy Dockerized cluster. Perform final load balancing and RED team security audits prior to V1.0 institutional handover.
