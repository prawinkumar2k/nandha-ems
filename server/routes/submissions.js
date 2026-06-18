import mongoose from "mongoose";

// ─── GET /api/exams-telemetry (submissions overview for proctors) ─────────────
export const handleGetSubmissions = async (req, res) => {
  console.log("🔍 [API] Fetching Submissions Query:", req.query);
  try {
    const Submission = mongoose.model("Submission");
    const { examId, status, studentId } = req.query;

    let query = {};
    if (examId) query.exam = examId;
    if (status) query.status = status;
    if (studentId) query.student = studentId;

    const submissions = await Submission.find(query)
      .populate("student", "name rollNumber")
      .populate("exam", "title")
      .populate("device", "hostname ipAddress")
      .sort({ updatedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetSubmissionById = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const submission = await Submission.findById(req.params.id)
      .populate("student", "name email rollNumber profilePic department")
      .populate({
        path: "exam",
        populate: { path: "questions" } // Populate questions so we can show answers vs questions
      })
      .populate("device");
      
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    
    // Auth check: Only admin, hod, faculty, or the student themselves
    const role = req.user.role;
    if (role === "student" && submission.student._id.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetGlobalViolations = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const violations = await Submission.find({ totalViolations: { $gt: 0 } })
      .populate("student", "name rollNumber email")
      .populate("exam", "title")
      .sort({ updatedAt: -1 })
      .limit(200);

    res.json(violations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/submissions/start ─────────────────────────────────────────────
export const handleStartExam = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    const { examId } = req.body;
    const studentId = req.user.id || req.user._id;

    // ─── SECURITY: Fetch exam for eligibility checks ────────────────────────
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    // ─── SECURITY VULN-011: Exam status check ────────────────────────────────
    if (exam.status !== "active" && exam.status !== "upcoming" && exam.status !== "scheduled") {
      return res.status(400).json({ message: "Exam is not currently active" });
    }

    // ─── SECURITY VULN-011: Enrollment check ────────────────────────────────
    if (exam.allowedStudents && exam.allowedStudents.length > 0) {
      const isEnrolled = exam.allowedStudents.some(
        id => id.toString() === studentId.toString()
      );
      if (!isEnrolled) {
        console.warn(`[SECURITY] Unauthorized exam start attempt: student ${studentId} tried to start exam ${examId}`);
        return res.status(403).json({ message: "You are not enrolled in this exam" });
      }
    }

    // ─── SECURITY: Validate exam window (not expired) ───────────────────────
    if (exam.endsAt && new Date() > new Date(exam.endsAt)) {
      return res.status(400).json({ message: "Exam window has closed" });
    }

    // Check if submission already exists
    let submission = await Submission.findOne({ exam: examId, student: studentId });
    if (submission && submission.status !== "in_progress") {
      return res.status(400).json({ message: "Exam already submitted" });
    }

    if (!submission) {
      // Generate randomized question order if enabled
      let qOrder = [];
      const numQuestions = exam.questions?.length || 0;
      for (let i = 0; i < numQuestions; i++) qOrder.push(i);

      if (exam.security?.randomizeQuestions) {
        for (let i = qOrder.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [qOrder[i], qOrder[j]] = [qOrder[j], qOrder[i]];
        }
      }

      submission = await Submission.create({
        student: studentId,
        exam: examId,
        status: "in_progress",
        startedAt: new Date(),
        device: req.body.deviceId || null,
        ipAddress: req.ip,
        questionOrder: qOrder
      });

      // Notify HOD/Faculty
      const io = req.app.get("io");
      if (io) {
        io.to("admin-dashboard").emit("exam-started", {
          examTitle: exam.title,
          studentName: req.user.name,
          studentId
        });
      }
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PUT /api/submissions/:id/answers ────────────────────────────────────────
export const handleUpdateAnswers = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    const { answers, violations } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Session not found" });

    // ─── SECURITY VULN-002: Ownership check ──────────────────────────────────
    const requestingUserId = (req.user.id || req.user._id).toString();
    if (submission.student.toString() !== requestingUserId) {
      console.error(`[SECURITY ALERT] Submission ownership violation: user ${requestingUserId} attempted to modify submission ${req.params.id} owned by ${submission.student}`);
      return res.status(403).json({ message: "You do not own this submission" });
    }

    // ─── SECURITY VULN-013: Deadline enforcement ─────────────────────────────
    const exam = await Exam.findById(submission.exam);
    if (exam && submission.startedAt) {
      const deadline = new Date(submission.startedAt.getTime() + exam.duration * 60 * 1000);
      if (new Date() > deadline) {
        // Auto-submit instead of accepting new answers
        if (submission.status === "in_progress") {
          submission.status = "auto_submitted";
          submission.submittedAt = deadline;
          submission.lateAttempt = true;
          await submission.save();
        }
        return res.status(400).json({ message: "Exam time has expired. Submission was auto-recorded." });
      }
    }

    if (answers) {
      submission.answers = answers;
      submission.markModified("answers");
    }

    if (violations) {
      submission.violations = violations;
      submission.totalViolations = violations.length;

      const User = mongoose.model("User");
      const user = await User.findById(requestingUserId);

      const io = req.app.get("io");
      if (io) {
        io.emit("new-violation", {
          student: user?.name || "Student",
          exam: submission.exam,
          type: violations[violations.length - 1]?.type,
          count: submission.totalViolations
        });
      }
    }

    await submission.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/submissions/:id/submit ────────────────────────────────────────
export const handleSubmitExam = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");

    const submission = await Submission.findById(req.params.id).populate("exam");
    if (!submission) return res.status(404).json({ message: "Session not found" });

    // ─── SECURITY VULN-002: Ownership check ──────────────────────────────────
    const requestingUserId = (req.user.id || req.user._id).toString();
    if (submission.student.toString() !== requestingUserId) {
      console.error(`[SECURITY ALERT] Submission ownership violation on SUBMIT: user ${requestingUserId} tried to submit ${req.params.id}`);
      return res.status(403).json({ message: "You do not own this submission" });
    }

    // ─── SECURITY VULN-006: Do NOT accept answers from the submit payload ────
    // Grade ONLY on answers already persisted via PUT /answers — prevents
    // last-second answer injection with all-correct values
    // (No longer doing: if (answers) { submission.answers = answers; })

    submission.status = "submitted";
    submission.submittedAt = new Date();

    // ─── SECURITY VULN-013: Flag late submissions ─────────────────────────────
    const exam = submission.exam;
    if (exam && submission.startedAt) {
      const deadline = new Date(submission.startedAt.getTime() + exam.duration * 60 * 1000);
      if (new Date() > deadline) {
        submission.lateSubmission = true;
      }
    }

    // Auto-grading for MCQ using STORED answers only
    let score = 0;
    const examQuestions = exam.questions || [];
    Object.keys(submission.answers || {}).forEach((idxStr) => {
      const idx = parseInt(idxStr);
      const ans = submission.answers[idxStr];
      const question = examQuestions[idx];
      if (question && question.type === "mcq" && question.correctAnswer === ans) {
        score += question.marks || 1;
      }
    });

    const totalMarks = exam.totalMarks || 0;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 1000) / 10 : 0;

    submission.marksObtained = score;
    submission.totalMarks = totalMarks;
    submission.percentage = percentage;
    submission.passed = percentage >= (exam.passingMarks || 40);

    if (percentage >= 90) submission.grade = "A+";
    else if (percentage >= 80) submission.grade = "A";
    else if (percentage >= 70) submission.grade = "B";
    else if (percentage >= 60) submission.grade = "C";
    else submission.grade = "F";

    await submission.save();

    const io = req.app.get("io");
    if (io) io.emit("new-activity", { type: "submission", student: req.user.name });

    res.json({ success: true, score, percentage, grade: submission.grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/submissions/:id/force-submit ────────────────────────────────
export const handleForceSubmit = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    
    const submission = await Submission.findById(req.params.id).populate("exam");
    if (!submission) return res.status(404).json({ message: "Session not found" });

    submission.status = "submitted";
    submission.submittedAt = new Date();
    
    // Auto-grading for MCQ using STORED answers only
    const exam = submission.exam;
    let score = 0;
    const examQuestions = exam.questions || [];
    Object.keys(submission.answers || {}).forEach((idxStr) => {
      const idx = parseInt(idxStr);
      const ans = submission.answers[idxStr];
      const question = examQuestions[idx];
      if (question && question.type === "mcq" && question.correctAnswer === ans) {
        score += question.marks || 1;
      }
    });

    const totalMarks = exam.totalMarks || 0;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 1000) / 10 : 0;

    submission.marksObtained = score;
    submission.totalMarks = totalMarks;
    submission.percentage = percentage;
    submission.passed = percentage >= (exam.passingMarks || 40);

    if (percentage >= 90) submission.grade = "A+";
    else if (percentage >= 80) submission.grade = "A";
    else if (percentage >= 70) submission.grade = "B";
    else if (percentage >= 60) submission.grade = "C";
    else submission.grade = "F";

    await submission.save();

    const io = req.app.get("io");
    if (io) {
       // Tell the Electron client to force submit if connected
       io.emit("force-submit-client", { submissionId: submission._id, studentId: submission.student });
    }

    res.json({ success: true, score, percentage, grade: submission.grade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── PUT /api/submissions/:id/evaluate ───────────────────────────────────────
export const handleEvaluateSubmission = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const Exam = mongoose.model("Exam");
    const { evaluations } = req.body; // Array of { questionIndex, marksAwarded }

    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const exam = await Exam.findById(submission.exam);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (!submission.answers) submission.answers = {};
    if (!submission.manualMarks) submission.manualMarks = {};

    let totalMarksAwarded = 0;

    for (let i = 0; i < exam.questions.length; i++) {
      const q = exam.questions[i];
      let marksForQ = 0;

      const evalUpdate = evaluations.find(e => parseInt(e.questionIndex) === i);
      
      if (evalUpdate) {
        marksForQ = Number(evalUpdate.marksAwarded) || 0;
        submission.manualMarks[i.toString()] = marksForQ;
        submission.markModified('manualMarks');
      } else {
        if (submission.manualMarks && submission.manualMarks[i.toString()] !== undefined) {
          marksForQ = submission.manualMarks[i.toString()];
        } else if (q.type === "mcq") {
          const studentAns = submission.answers[i.toString()];
          if (studentAns && studentAns === q.correctAnswer) {
            marksForQ = q.marks || 1;
          }
        }
      }

      totalMarksAwarded += marksForQ;
    }

    submission.marksObtained = totalMarksAwarded;
    submission.percentage = Math.round((totalMarksAwarded / exam.totalMarks) * 100);
    
    if (submission.percentage >= 90) submission.grade = "O";
    else if (submission.percentage >= 80) submission.grade = "A+";
    else if (submission.percentage >= 70) submission.grade = "A";
    else if (submission.percentage >= 60) submission.grade = "B+";
    else if (submission.percentage >= 50) submission.grade = "B";
    else submission.grade = "U";
    
    submission.passed = submission.percentage >= (exam.passingMarks || 50);

    // If there was an active revaluation request, mark it completed
    if (submission.revaluationRequested && submission.revaluationStatus === "pending") {
      submission.revaluationStatus = "completed";
    }

    await submission.save();
    res.json({ success: true, submission });
  } catch (error) {
    console.error("Evaluation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── POST /api/submissions/:id/revaluate ────────────────────────────────────
export const handleRequestRevaluation = async (req, res) => {
  try {
    const Submission = mongoose.model("Submission");
    const { reason } = req.body;
    const studentId = req.user.id || req.user._id;

    const submission = await Submission.findById(req.params.id);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Security Check: Only the owner can request
    if (submission.student.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Must be a submitted exam
    if (submission.status !== "submitted" && submission.status !== "auto_submitted") {
      return res.status(400).json({ message: "Can only request re-evaluation for completed exams" });
    }

    if (submission.revaluationRequested) {
      return res.status(400).json({ message: "Re-evaluation already requested" });
    }

    submission.revaluationRequested = true;
    submission.revaluationReason = reason;
    submission.revaluationStatus = "pending";

    await submission.save();

    res.json({ success: true, message: "Re-evaluation requested successfully", submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
