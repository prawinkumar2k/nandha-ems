import mongoose from "mongoose";
import "dotenv/config";
import "./server/models/User.js";
import "./server/models/Course.js";
import "./server/models/Department.js";

async function fixEnrollments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = mongoose.model("User");
    const Course = mongoose.model("Course");

    const courses = await Course.find();
    let updated = 0;

    for (const course of courses) {
      const studentsInDept = await User.find({ department: course.department, role: "student" }).select("_id");
      const studentIds = studentsInDept.map(s => s._id);

      const result = await Course.updateOne(
        { _id: course._id },
        { $addToSet: { enrolledStudents: { $each: studentIds } } }
      );
      if (result.modifiedCount > 0) updated++;
    }

    console.log(`Updated enrollments for ${updated} courses.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
fixEnrollments();
