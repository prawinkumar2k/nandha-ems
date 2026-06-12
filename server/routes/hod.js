import mongoose from "mongoose";

// ─── GET /api/hod/stats ───────────────────────────────────────────────────────
export const handleGetHODStats = async (req, res) => {
  try {
    const { dept: departmentIdRaw } = req.user;
    if (!departmentIdRaw) return res.status(400).json({ message: "No department assigned to HOD" });
    const departmentId = new mongoose.Types.ObjectId(departmentIdRaw);

    const User = mongoose.model("User");
    const Course = mongoose.model("Course");
    const Exam = mongoose.model("Exam");
    const Violation = mongoose.model("Violation");

    const [facultyCount, studentCount, activeCourses, activeExams, recentViolations] = await Promise.all([
      User.countDocuments({ department: departmentId, role: "faculty" }),
      User.countDocuments({ department: departmentId, role: "student" }),
      Course.countDocuments({ department: departmentId, isActive: true }),
      Exam.countDocuments({ department: departmentId, status: "active" }),
      Violation.countDocuments({ department: departmentId, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
    ]);

    // Calculate Avg Grade from submissions efficiently
    const Submission = mongoose.model("Submission");
    
    // Get all student IDs in this department
    const deptStudentIds = await User.find({ department: departmentId, role: "student" }).distinct("_id");
    
    // Aggregate average percentage for these students
    const result = await Submission.aggregate([
      { $match: { student: { $in: deptStudentIds }, status: "submitted" } },
      { $group: { _id: null, avg: { $avg: "$percentage" } } }
    ]);
    
    const avgGrade = result[0]?.avg ? result[0].avg.toFixed(1) : 0;

    res.json({
      facultyCount,
      studentCount,
      activeCourses,
      activeExams,
      avgGrade,
      recentViolations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/hod/exams ────────────────────────────────────────────────────────
export const handleGetHODExams = async (req, res) => {
  try {
    const { dept: deptId } = req.user;
    const departmentId = new mongoose.Types.ObjectId(deptId);
    const Exam = mongoose.model("Exam");
    const exams = await Exam.find({ department: departmentId })
      .populate("faculty", "name email")
      .populate("course", "title code")
      .sort({ scheduledAt: -1 })
      .limit(50)
      .lean();
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/hod/faculty/status ──────────────────────────────────────────────
export const handleGetHODFacultyStatus = async (req, res) => {
  try {
    const { dept: deptId } = req.user;
    const departmentId = new mongoose.Types.ObjectId(deptId);
    const User = mongoose.model("User");
    const Exam = mongoose.model("Exam");

    // 1. Get all faculty in dept
    const faculty = await User.find({ department: departmentId, role: "faculty" })
      .select("name email employeeId profilePic lastLogin")
      .lean();

    // 2. Get all active exams for this dept in ONE query
    const activeExams = await Exam.find({ 
      department: departmentId, 
      status: "active" 
    }).select("faculty title").lean();

    // 3. Map status
    const facultyWithStatus = faculty.map(f => {
      const activeExam = activeExams.find(e => e.faculty.toString() === f._id.toString());
      return {
        ...f,
        status: activeExam ? "Conducting Exam" : "Idle",
        activeExam: activeExam ? activeExam.title : null
      };
    });

    res.json(facultyWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/hod/students/monitoring ────────────────────────────────────────
export const handleGetHODStudentsMonitoring = async (req, res) => {
  try {
    const { dept: deptId } = req.user;
    const departmentId = new mongoose.Types.ObjectId(deptId);
    const Submission = mongoose.model("Submission");
    
    const activeSubmissions = await Submission.find({ status: "in_progress" })
      .populate({
        path: "student",
        match: { department: departmentId },
        select: "name email rollNumber"
      })
      .populate("exam", "title")
      .lean();

    const monitoringData = activeSubmissions.filter(s => s.student);
    res.json(monitoringData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/hod/alerts ──────────────────────────────────────────────────────
export const handleGetHODAlerts = async (req, res) => {
  try {
    const { dept: deptId } = req.user;
    const departmentId = new mongoose.Types.ObjectId(deptId);
    const Violation = mongoose.model("Violation");
    const Submission = mongoose.model("Submission");

    // Get explicit violations
    const explicitAlerts = await Violation.find({ department: departmentId })
      .populate("student", "name rollNumber")
      .populate("exam", "title")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Also fetch recent submission violations
    const submissionViolations = await Submission.find({ 
      totalViolations: { $gt: 0 },
      status: "in_progress" 
    })
    .populate({
      path: "student",
      match: { department: departmentId },
      select: "name rollNumber"
    })
    .populate("exam", "title")
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();

    // Combine and format
    const combined = [
      ...explicitAlerts,
      ...submissionViolations.filter(s => s.student).map(s => ({
        _id: s._id,
        student: s.student,
        exam: s.exam,
        type: s.violations[s.violations.length - 1]?.type || "general_violation",
        message: `High violation count (${s.totalViolations})`,
        severity: "high",
        createdAt: s.updatedAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(combined.slice(0, 20));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/hod/analytics ──────────────────────────────────────────────────
export const handleGetHODAnalytics = async (req, res) => {
  try {
    const { dept: deptId } = req.user;
    const departmentId = new mongoose.Types.ObjectId(deptId);
    const Submission = mongoose.model("Submission");
    
    // Aggregation for performance trends
    const stats = await Submission.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "student",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      { $unwind: "$studentInfo" },
      { $match: { "studentInfo.department": departmentId, status: "submitted" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          avgScore: { $avg: "$percentage" },
          passCount: { $sum: { $cond: [{ $gte: ["$percentage", 50] }, 1, 0] } },
          totalCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ─── POST /api/hod/faculty ──────────────────────────────────────────────────
export const handleCreateHODFaculty = async (req, res) => {
  try {
    const { name, email, employeeId, password } = req.body;
    const { dept: departmentId } = req.user;

    const User = mongoose.model("User");

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Professor with this email already exists" });

    const newFaculty = await User.create({
      name,
      email,
      employeeId,
      password, // Mongoose hook handles hashing
      role: "faculty",
      department: departmentId,
      isActive: true,
      mustChangePassword: true
    });

    res.status(201).json(newFaculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/hod/student ──────────────────────────────────────────────────
export const handleCreateHODStudent = async (req, res) => {
  try {
    const { name, email, rollNumber, password } = req.body;
    const { dept: departmentId } = req.user;

    const User = mongoose.model("User");

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Student with this email already exists" });

    const newStudent = await User.create({
      name,
      email,
      rollNumber,
      password,
      role: "student",
      department: departmentId,
      isActive: true,
      mustChangePassword: true
    });

    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/hod/exams ─────────────────────────────────────────────────────
export const handleCreateHODExam = async (req, res) => {
  try {
    const { title, course, description, duration, scheduledAt, questions, totalMarks } = req.body;
    const facultyId = req.user.id || req.user._id;
    const departmentId = req.user.dept || req.user.department;

    if (!facultyId || !departmentId) {
      return res.status(401).json({ message: "Invalid session token. Missing faculty or department identity." });
    }

    const Course = mongoose.model("Course");
    const Exam = mongoose.model("Exam");

    // Attempt to find course by code or title if it's not a valid ObjectId
    let courseId = course;
    if (!mongoose.Types.ObjectId.isValid(course)) {
      const foundCourse = await Course.findOne({ 
        $or: [{ code: course }, { title: course }],
        department: departmentId
      });
      if (foundCourse) courseId = foundCourse._id;
      else {
        // Create a dummy course or return error? We'll use a fallback for now or error
        return res.status(400).json({ message: "Invalid Course ID or Code. Ensure the course exists in your department." });
      }
    }

    const newExam = await Exam.create({
      title,
      course: courseId,
      description,
      duration,
      scheduledAt,
      questions,
      totalMarks,
      faculty: facultyId,
      department: departmentId,
      status: "scheduled"
    });

    res.status(201).json(newExam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// â”€â”€â”€ PATCH /api/hod/exams/:id/approve â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const handleApproveHODExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { dept: deptId } = req.user;
    const Exam = mongoose.model("Exam");
    const Notification = mongoose.model("Notification");

    const exam = await Exam.findOne({
      _id: id,
      department: deptId
    }).populate("faculty", "name email");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found in your department" });
    }

    exam.approvedByHod = true;
    exam.approvedBy = req.user.id || req.user._id;
    if (exam.status === "draft") {
      exam.status = "scheduled";
    }
    exam.isPublished = true;
    await exam.save();

    if (exam.faculty?._id) {
      await Notification.create({
        recipient: exam.faculty._id,
        sender: req.user.id || req.user._id,
        title: `Exam Approved: ${exam.title}`,
        message: `Your exam "${exam.title}" was approved by HOD.`,
        type: "approval_granted",
        link: "/hod/exams"
      });
    }

    res.json({
      message: "Exam approved successfully",
      exam
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/hod/bulk ─────────────────────────────────────────────────────
export const handleHODBulkUpload = async (req, res) => {
  try {
    const { users, role } = req.body;
    const { dept: departmentId } = req.user;
    const User = mongoose.model("User");

    let success = 0, errors = 0, skipped = 0;

    for (const u of users) {
      try {
        if (!u.email || !u.name) { skipped++; continue; }
        
        const existing = await User.findOne({ email: u.email });
        if (existing) { skipped++; continue; }

        await User.create({
          ...u,
          role,
          department: departmentId,
          isActive: true,
          mustChangePassword: true
        });
        success++;
      } catch (err) {
        errors++;
      }
    }

    res.json({ success, errors, skipped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
