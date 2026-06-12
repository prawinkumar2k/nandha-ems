import mongoose from "mongoose";

// ─── GET /api/exams ─────────────────────────────────────────────────────────
export const handleGetExams = async (req, res) => {
  try {
    const Exam = mongoose.model("Exam");
    const { status, department, course } = req.query;

    let query = {};
    if (status) query.status = status;

    // Role-based filtering
    if (req.user.role === "student") {
      query.department = req.user.dept || req.user.department;
    } else if (req.user.role === "faculty" || req.user.role === "hod") {
      query.department = department || req.user.dept || req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (course) query.course = course;

    const exams = await Exam.find(query)
      .populate("course", "title code")
      .populate("faculty", "name")
      .populate("department", "name")
      .sort({ scheduledAt: 1 })
      .lean();

    // ─── SECURITY: Strip correct answers for students ──────────────────────
    if (req.user.role === "student") {
      exams.forEach(exam => {
        if (exam.questions) {
          exam.questions = exam.questions.map(q => {
            const { correctAnswer, testCases, ...safeQuestion } = q;
            return safeQuestion;
          });
        }
      });
    }

    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/exams/:id ─────────────────────────────────────────────────────
export const handleGetExamById = async (req, res) => {
  try {
    const Exam = mongoose.model("Exam");
    const exam = await Exam.findById(req.params.id)
      .populate("course")
      .populate("faculty", "name")
      .lean();

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // ─── SECURITY: Strip correct answers and test case outputs for students ─
    if (req.user.role === "student") {
      if (exam.questions) {
        exam.questions = exam.questions.map(q => {
          const { correctAnswer, testCases, ...safeQuestion } = q;
          // For coding questions, return test case inputs but not expected outputs
          if (testCases && safeQuestion.type === "coding") {
            safeQuestion.testCases = testCases.map(tc => ({ input: tc.input }));
          }
          return safeQuestion;
        });
      }
    }

    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
