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
    res.status(500).json({ message: error.message });
  }
};
