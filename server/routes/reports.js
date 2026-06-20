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

    const [courses, allExams, pendingExams, studentCountResult] = await Promise.all([
      Course.find({ faculty: facultyId }).lean(),
      Exam.find({ faculty: facultyId }).lean(),
      Exam.countDocuments({ faculty: facultyId, status: "scheduled" }),
      Course.aggregate([
        { $match: { faculty: new mongoose.Types.ObjectId(facultyId) } },
        { $project: { count: { $size: { $ifNull: ["$enrolledStudents", []] } } } },
        { $group: { _id: null, total: { $sum: "$count" } } }
      ])
    ]);

    const completedExams = allExams.filter(e => e.status === "completed");
    const completedExamIds = completedExams.map(e => e._id);
    const scheduledExams = allExams.filter(e => e.status === "scheduled" || e.status === "upcoming");

    const submissionsCount = await Submission.countDocuments({
      exam: { $in: completedExamIds },
      status: { $in: ["submitted", "auto_submitted"] }
    });

    // Calculate attendance
    let expectedSubmissions = 0;
    completedExams.forEach(e => {
       const allowed = e.allowedStudents?.length || 0;
       if (allowed > 0) {
           expectedSubmissions += allowed;
       } else {
           const c = courses.find(course => course._id.toString() === e.course?.toString());
           expectedSubmissions += c?.enrolledStudents?.length || 0;
       }
    });

    let avgAttendance = "N/A";
    if (expectedSubmissions > 0) {
       avgAttendance = `${Math.min(100, Math.round((submissionsCount / expectedSubmissions) * 100))}%`;
    } else if (completedExams.length > 0 && submissionsCount > 0) {
       avgAttendance = "100%";
    }

    res.json({
      courseCount: courses.length,
      studentCount: studentCountResult[0]?.total || 0,
      pendingExams,
      scheduledExams,
      avgAttendance,
      courses: courses.map(c => {
        const courseExams = allExams.filter(e => e.course?.toString() === c._id.toString());
        const completed = courseExams.filter(e => e.status === "completed").length;
        const progress = courseExams.length > 0 ? Math.round((completed / courseExams.length) * 100) : 0;
        return {
          id: c._id,
          name: c.title,
          code: c.code,
          students: c.enrolledStudents?.length || 0,
          progress
        };
      })
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
    const QuestionBank = mongoose.model("QuestionBank");

    const studentId = req.user.id || req.user._id;

    const [courses, upcomingExams, submissions, profile, allQuestions] = await Promise.all([
      Course.find({ enrolledStudents: studentId }).populate("faculty", "name").lean(),
      Exam.find({ 
        department: req.user.dept, 
        status: { $in: ["scheduled", "active"] },
      }).populate("course", "title code").lean(),
      Submission.find({ student: studentId, status: "submitted" })
        .populate("exam", "course totalMarks")
        .lean(),
      User.findById(studentId).populate("department", "name").lean(),
      QuestionBank.find({ isActive: true }).select("type difficulty").lean()
    ]);

    // calculate totals
    const totalQuestions = {
      easy: allQuestions.filter(q => q.difficulty === "easy").length,
      medium: allQuestions.filter(q => q.difficulty === "medium").length,
      hard: allQuestions.filter(q => q.difficulty === "hard").length,
      total: allQuestions.length
    };

    // Calculate solved questions from submissions
    let solvedQuestions = { easy: 0, medium: 0, hard: 0, total: 0 };
    let coding = { attended: 0, solvedCorrectly: 0, score: 0 };
    let mcq = { attended: 0, solvedCorrectly: 0, score: 0 };

    let attemptedQuestionIds = new Set();
    submissions.forEach(sub => {
       if (sub.answers) {
         Object.keys(sub.answers).forEach(qId => attemptedQuestionIds.add(qId));
       }
    });

    const attemptedQuestions = await QuestionBank.find({ _id: { $in: Array.from(attemptedQuestionIds) } }).lean();
    const qMap = {};
    attemptedQuestions.forEach(q => { qMap[q._id.toString()] = q; });

    let totalViolations = 0;
    let passedExams = 0;

    submissions.forEach(sub => {
       totalViolations += (sub.totalViolations || 0);
       // determine pass/fail (using 50% as generic threshold or sub.passed if set)
       if (sub.passed || sub.percentage >= 50) passedExams += 1;

       if (sub.answers) {
          Object.entries(sub.answers).forEach(([qId, ans]) => {
             const q = qMap[qId];
             if (!q) return;

             const isCorrect = ans.isCorrect || (ans.marksAwarded > 0);
             const marks = ans.marksAwarded || 0;

             if (q.type === "coding") {
                 coding.attended += 1;
                 if (isCorrect) coding.solvedCorrectly += 1;
                 coding.score += marks;
             } else if (q.type === "mcq") {
                 mcq.attended += 1;
                 if (isCorrect) mcq.solvedCorrectly += 1;
                 mcq.score += marks;
             }
             
             if (isCorrect) {
                 solvedQuestions.total += 1;
                 if (q.difficulty === "easy") solvedQuestions.easy += 1;
                 if (q.difficulty === "medium") solvedQuestions.medium += 1;
                 if (q.difficulty === "hard") solvedQuestions.hard += 1;
             }
          });
       }
    });

    const avgGpa = submissions.length > 0 
      ? (submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length / 10).toFixed(1)
      : profile?.cgpa?.toString() || "0.0";

    const overallScore = coding.score + mcq.score;
    const integrityScore = Math.max(0, 100 - (totalViolations * 5));

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
      })),
      profile: {
        rollNumber: profile?.rollNumber,
        degree: profile?.department?.name || profile?.department || "Not Assigned",
        batch: profile?.academicYear || "Not Assigned",
        college: "Nandha Educational Institutions"
      },
      skills: {
         overallScore: overallScore,
         proficiencyLevel: Math.floor(overallScore / 100) + 1,
         solved: solvedQuestions,
         totalQuestions: totalQuestions,
         coding: {
            ...coding,
            accuracy: coding.attended > 0 ? ((coding.solvedCorrectly / coding.attended) * 100).toFixed(2) : 0
         },
         mcq: {
            ...mcq,
            accuracy: mcq.attended > 0 ? ((mcq.solvedCorrectly / mcq.attended) * 100).toFixed(2) : 0
         },
         examStats: {
            attended: submissions.length,
            passed: passedExams,
            failed: submissions.length - passedExams,
            integrityScore: submissions.length > 0 ? integrityScore : 100,
            violations: totalViolations
         }
      }
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

    let query = { faculty: facultyId };
    
    // If user is HOD, fetch all exams in their department
    if (req.user.role === "hod" || req.user.role === "admin") {
      const deptId = req.user.department?._id || req.user.department;
      if (deptId) {
        query = { department: deptId };
      }
    }

    const exams = await Exam.find(query).select('_id title').lean();
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
      submittedAt: s.submittedAt,
      revaluationRequested: s.revaluationRequested || false,
      revaluationStatus: s.revaluationStatus || "none",
      revaluationReason: s.revaluationReason || ""
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
      status: s.status === "submitted" || s.status === "auto_submitted" ? "verified" : "pending",
      revaluationRequested: s.revaluationRequested || false,
      revaluationStatus: s.revaluationStatus || "none"
    }));

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
