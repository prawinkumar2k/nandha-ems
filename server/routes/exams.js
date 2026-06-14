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

// ─── POST /api/exams/:id/allocate-seats ──────────────────────────────────────
export const handleAllocateSeats = async (req, res) => {
  try {
    const Exam = mongoose.model("Exam");
    const Course = mongoose.model("Course");
    const Device = mongoose.model("Device");
    const HallTicket = mongoose.model("HallTicket");

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    let students = exam.allowedStudents || [];
    if (students.length === 0) {
      const course = await Course.findById(exam.course);
      students = course?.enrolledStudents || [];
    }

    if (students.length === 0) {
      return res.status(400).json({ message: "No students enrolled for this exam." });
    }

    // Get all approved devices
    const devices = await Device.find({ status: "approved" }).populate("labId");
    if (devices.length < students.length) {
      return res.status(400).json({ 
        message: `Not enough approved devices. Needed: ${students.length}, Available: ${devices.length}` 
      });
    }

    // Shuffle devices for random assignment
    for (let i = devices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [devices[i], devices[j]] = [devices[j], devices[i]];
    }

    // Delete existing tickets for this exam
    await HallTicket.deleteMany({ exam: exam._id });

    const tickets = [];
    for (let i = 0; i < students.length; i++) {
      const device = devices[i];
      tickets.push({
        exam: exam._id,
        student: students[i],
        lab: device.labId?._id || null,
        device: device._id,
        seatNumber: `${device.labId?.name || "LAB"}-${i + 1}`,
        ticketNumber: `HT-${exam._id.toString().substring(18).toUpperCase()}-${Date.now().toString().slice(-4)}-${i}`
      });
    }

    await HallTicket.insertMany(tickets);

    res.json({ success: true, message: "Seats allocated successfully", allocated: tickets.length });
  } catch (error) {
    console.error("Allocation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/exams/:id/hall-tickets ────────────────────────────────────────
export const handleGetHallTickets = async (req, res) => {
  try {
    const HallTicket = mongoose.model("HallTicket");

    if (req.user.role === "student") {
      const ticket = await HallTicket.findOne({ exam: req.params.id, student: req.user.id || req.user._id })
        .populate("exam", "title scheduledAt duration")
        .populate("student", "name rollNumber")
        .populate("lab", "name location")
        .populate("device", "machineFingerprint")
        .lean();
      
      if (!ticket) return res.status(404).json({ message: "Hall ticket not found or generated yet." });
      return res.json(ticket);
    } else {
      // Faculty/HOD
      const tickets = await HallTicket.find({ exam: req.params.id })
        .populate("exam", "title scheduledAt duration")
        .populate("student", "name rollNumber")
        .populate("lab", "name location")
        .populate("device", "machineFingerprint")
        .lean();
      
      res.json(tickets);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
