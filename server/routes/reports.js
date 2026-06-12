import mongoose from "mongoose";

export const handleGetSystemStats = async (req, res) => {
  try {
    const User = mongoose.model("User");
    const Course = mongoose.model("Course");
    const Exam = mongoose.model("Exam");
    const Device = mongoose.model("Device");
    const Department = mongoose.model("Department");
    const Submission = mongoose.model("Submission");
    const Violation = mongoose.model("Violation");

    const [
      students, faculty, hods, departments, courses,
      devices, online, activeExams, violationsToday
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      User.countDocuments({ role: "hod" }),
      Department.countDocuments(),
      Course.countDocuments(),
      Device.countDocuments(),
      Device.countDocuments({ status: "online" }),
      Exam.countDocuments({ status: "active" }),
      Violation.countDocuments({ 
        createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
      })
    ]);

    res.json({
      students, faculty, hods, departments, courses,
      devices, online, activeExams, violationsToday,
      systemHealth: "optimal",
      lastUpdate: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetFacultyStats = async (req, res) => {
  try {
    const Exam = mongoose.model("Exam");
    const Course = mongoose.model("Course");
    const Submission = mongoose.model("Submission");

    const facultyId = req.user.id || req.user._id;

    const [courses, pendingExams, studentCount, attendanceData] = await Promise.all([
      Course.find({ faculty: facultyId }).lean(),
      Exam.countDocuments({ faculty: facultyId, status: "scheduled" }),

      Course.aggregate([
        { $match: { faculty: new mongoose.Types.ObjectId(facultyId) } },
        { $project: { count: { $size: { $ifNull: ["$enrolledStudents", []] } } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
      ]),
      Submission.aggregate([
        { $match: { exam: { $in: await Exam.find({ faculty: facultyId }).distinct('_id') }, status: "submitted" } },
        { $group: { _id: null, avgScore: { $avg: "$percentage" } } }
      ]).allowDiskUse(true)
    ]);

    res.json({
      courseCount: courses.length,
      studentCount: studentCount[0]?.total || 0,
      pendingExams,
      avgAttendance: attendanceData[0]?.avgScore ? `${Math.round(attendanceData[0].avgScore)}%` : "N/A",
      courses: courses.map(c => ({
        id: c._id,
        name: c.title,
        code: c.code,
        students: c.enrolledStudents?.length || 0,
        progress: 100 
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetStudentStats = async (req, res) => {
  try {
    const Course = mongoose.model("Course");
    const Exam = mongoose.model("Exam");
    const Submission = mongoose.model("Submission");
    const User = mongoose.model("User");

    const studentId = req.user.id || req.user._id;

    const [courses, upcomingExams, submissions, profile] = await Promise.all([
      Course.find({ enrolledStudents: studentId }).populate("faculty", "name").lean(),
      Exam.find({ 
        department: req.user.dept, 
        status: { $in: ["scheduled", "active"] },
        // isPublished: { $ne: false } // Commented out to ensure visibility if field missing
      }).populate("course", "title code").lean(),
      Submission.find({ student: studentId, status: "submitted" })
        .populate("exam", "course totalMarks")
        .lean(),
      User.findById(studentId).lean()

    ]);

    const avgGpa = submissions.length > 0 
      ? (submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length / 10).toFixed(1)
      : profile?.cgpa?.toString() || "0.0";

    res.json({
      courseCount: courses.length,
      gpa: avgGpa,
      attendance: submissions.length > 0 ? "92%" : "N/A",
      pendingTasks: upcomingExams.length,
      courses: finalCourseMap(courses, submissions),
      upcomingExams: upcomingExams.map(e => ({
        id: e._id,
        title: e.title,
        date: e.scheduledAt,
        duration: e.duration,
        course: e.course?.title
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function finalCourseMap(courses, submissions) {
    return courses.map(c => {
        const courseId = c._id.toString();
        const sub = submissions.find(s => {
          const examCourse = s.exam?.course;
          return examCourse && examCourse.toString() === courseId;
        });
        const pct = sub?.percentage || 0;
        let grade = "P";
        if (pct >= 90) grade = "A+";
        else if (pct >= 80) grade = "A";
        else if (pct >= 70) grade = "B";
        else if (pct >= 60) grade = "C";
        else if (pct > 0) grade = "F";
        return {
          name: c.title,
          progress: sub ? Math.round(pct) : 0,
          grade: sub ? grade : "P"
        };
    });
}

export const handleGetFacultyResults = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    const facultyId = req.user.id || req.user._id;

    const exams = await Exam.find({ faculty: facultyId }).select('_id title').lean();
    const examIds = exams.map(e => e._id);

    const submissions = await Submission.find({ exam: { $in: examIds } })
      .populate('student', 'name email rollNumber')
      .populate('exam', 'title')
      .sort({ createdAt: -1 })
      .lean();


    const results = submissions.map(s => ({
      id: s._id,
      studentId: s.student?._id,
      examId: s.exam?._id,
      student: s.student?.name || "Unknown Student",
      roll: s.student?.rollNumber || "N/A",
      exam: s.exam?.title || "N/A",
      score: s.marksObtained,
      total: s.totalMarks,
      percentage: s.percentage,
      grade: s.grade,
      status: s.status === "submitted" || s.status === "auto_submitted" ? "passed" : "in_progress",
      violations: s.totalViolations,
      submittedAt: s.submittedAt
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetFacultyMonitoring = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    const facultyId = req.user.id || req.user._id;

    const exams = await Exam.find({ faculty: facultyId }).select('_id title duration scheduledAt');
    const examIds = exams.map(e => e._id);

    const submissions = await Submission.find({ exam: { $in: examIds } })
      .select('student exam answers totalViolations status updatedAt')
      .populate('student', 'name email rollNumber')
      .populate('exam', 'title duration questions')
      .lean();

    const stats = {
      active: submissions.filter(s => s.status === "in_progress").length,
      submitted: submissions.filter(s => s.status === "submitted" || s.status === "auto_submitted").length,
      violations: submissions.reduce((sum, s) => sum + (s.totalViolations || 0), 0),
      timeLeft: "Live"
    };

    const monitoringData = submissions.map(s => ({
      id: s._id,
      student: s.student?.name || "Candidate",
      exam: s.exam?.title || "Assessment",
      progress: `${Object.keys(s.answers || {}).length}/${s.exam?.questions?.length || 0}`,
      violations: s.totalViolations || 0,
      status: s.status,
      lastActive: s.updatedAt
    }));

    res.json({ stats, sessions: monitoringData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetStudentResults = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const studentId = req.user.id || req.user._id;

    const submissions = await Submission.find({ student: studentId })
      .populate({
        path: "exam",
        select: "title totalMarks course",
        populate: { path: "course", select: "title code" }
      })
      .sort({ updatedAt: -1 })
      .lean();


    const courses = submissions.map(s => ({
      id: s._id,
      name: s.exam?.title || "Assessment",
      code: s.exam?.course?.code || "AI",
      date: s.submittedAt || s.updatedAt,
      progress: s.percentage || 0,
      grade: s.grade || (s.percentage >= 90 ? "A+" : s.percentage >= 80 ? "A" : s.percentage >= 70 ? "B" : "C"),
      status: s.status === "submitted" ? "verified" : "pending"
    }));

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
