import mongoose from "mongoose";

export const handleGetCourses = async (req, res) => {
  try {
    const Course = mongoose.model("Course");
    const { faculty, department, status } = req.query;

    let query = {};
    if (faculty) query.faculty = faculty;
    if (department) query.department = department;

    const courses = await Course.find(query)
      .populate("faculty", "name")
      .populate("department", "name code")
      .sort({ title: 1 });

    res.json(courses);
  } catch (error) {
    console.error("GET /courses error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const handleCreateCourse = async (req, res) => {
  try {
    const Course = mongoose.model("Course");
    const { title, code, description, department, credits, semester } = req.body;

    const existing = await Course.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Course code already exists." });
    }

    const course = await Course.create({
      title,
      code,
      description,
      department,
      credits,
      semester,
      faculty: req.body.faculty || req.user.id, // Allow setting faculty, fallback to creator
      academicYear: "2025-2026", // Provide a default/current academic year
      isActive: true
    });

    const populatedCourse = await Course.findById(course._id)
      .populate("department", "name code");

    // Sync via socket if needed, assuming req.app.get('io') is available
    const io = req.app.get("io");
    if (io) {
      io.emit("course_created", populatedCourse);
    }

    res.status(201).json(populatedCourse);
  } catch (error) {
    console.error("POST /courses error:", error);
    res.status(500).json({ message: error.message });
  }
};
