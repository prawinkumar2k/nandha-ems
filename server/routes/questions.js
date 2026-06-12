import mongoose from "mongoose";

export const handleGetQuestions = async (req, res) => {
  try {
    const role = req.user.role;
    const facultyId = req.user.id || req.user._id;
    const dept = req.user.dept || req.user.department;
    const QuestionBank = mongoose.model("QuestionBank");
    
    // Create query - if role is not HOD we only show questions for their dept or created by them
    let query = {};
    if (role === "hod") {
      query.department = new mongoose.Types.ObjectId(dept);
    } else {
      query.createdBy = new mongoose.Types.ObjectId(facultyId);
    }
    
    const questions = await QuestionBank.find(query).populate('course', 'title code').sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleCreateQuestion = async (req, res) => {
  try {
    const facultyId = req.user.id || req.user._id;
    const departmentId = req.user.dept || req.user.department;
    const { questionText, type, course, difficulty, options, correctAnswer, marks, testCases, topic } = req.body;
    
    let courseId = course;
    if (course && !mongoose.Types.ObjectId.isValid(course)) {
      const Course = mongoose.model("Course");
      const foundCourse = await Course.findOne({ 
        $or: [{ code: course }, { title: course }]
      });
      if (foundCourse) courseId = foundCourse._id;
    }

    const QuestionBank = mongoose.model("QuestionBank");
    const doc = {
        questionText,
        type: (type || "mcq").toLowerCase(),
        course: mongoose.Types.ObjectId.isValid(courseId) ? courseId : null,
        difficulty: (difficulty || "medium").toLowerCase(),
        options: options || {},
        correctAnswer,
        marks: marks || 1,
        testCases: testCases || [],
        topic,
        createdBy: new mongoose.Types.ObjectId(facultyId),
        department: new mongoose.Types.ObjectId(departmentId)
    };

    const q = await QuestionBank.create(doc);
    const populated = await QuestionBank.findById(q._id).populate('course', 'title code');
    res.status(201).json(populated);
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const handleDeleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const QuestionBank = mongoose.model("QuestionBank");

    const q = await QuestionBank.findById(id);
    if (!q) return res.status(404).json({ message: "Question not found" });

    // ─── SECURITY VULN-008: Ownership check ─────────────────────────────────
    const requesterId = (req.user.id || req.user._id).toString();
    const isOwner = q.createdBy.toString() === requesterId;
    const isAuthorized = ["hod", "admin"].includes(req.user.role);
    if (!isOwner && !isAuthorized) {
      console.warn(`[SECURITY] Unauthorized question delete: user ${requesterId} tried to delete question ${id} owned by ${q.createdBy}`);
      return res.status(403).json({ message: "You are not authorized to delete this question" });
    }

    await QuestionBank.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleUpdateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { questionText, type, course, difficulty, options, correctAnswer, marks, testCases, topic } = req.body;

    // ─── SECURITY VULN-008: Ownership check ─────────────────────────────────
    const QuestionBankCheck = mongoose.model("QuestionBank");
    const existing = await QuestionBankCheck.findById(id);
    if (!existing) return res.status(404).json({ message: "Question not found" });
    const requesterId = (req.user.id || req.user._id).toString();
    const isOwner = existing.createdBy.toString() === requesterId;
    const isAuthorized = ["hod", "admin"].includes(req.user.role);
    if (!isOwner && !isAuthorized) {
      return res.status(403).json({ message: "You are not authorized to update this question" });
    }
    
    let courseId = course;
    if (course && !mongoose.Types.ObjectId.isValid(course)) {
      const Course = mongoose.model("Course");
      const foundCourse = await Course.findOne({ 
        $or: [{ code: course }, { title: course }]
      });
      if (foundCourse) courseId = foundCourse._id;
    }

    const QuestionBank = mongoose.model("QuestionBank");
    const updateDoc = {
      questionText,
      type: (type || "mcq").toLowerCase(),
      course: mongoose.Types.ObjectId.isValid(courseId) ? courseId : null,
      difficulty: (difficulty || "medium").toLowerCase(),
      options: options || {},
      correctAnswer,
      marks: marks || 1,
      testCases: testCases || [],
      topic
    };

    const q = await QuestionBank.findByIdAndUpdate(id, { $set: updateDoc }, { new: true }).populate('course', 'title code');
    if (!q) return res.status(404).json({ message: "Question not found" });
    
    res.json(q);
  } catch (error) {
    console.error("Update Question Error:", error);
    res.status(500).json({ message: error.message });
  }
};

