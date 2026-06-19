import mongoose from "mongoose";
import "dotenv/config";
import "./server/models/Course.js";
import "./server/models/User.js";
import "./server/models/Exam.js";

async function fixDetachedCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Exam = mongoose.model("Exam");
    const Course = mongoose.model("Course");
    const User = mongoose.model("User");

    // Find all exams
    const exams = await Exam.find().lean();
    let updated = 0;

    for (const exam of exams) {
      if (exam.faculty && exam.course) {
        // Find the corresponding course
        const course = await Course.findById(exam.course);
        if (course && course.faculty.toString() !== exam.faculty.toString()) {
          console.log(`Course ${course.title} is assigned to ${course.faculty}, but Exam is assigned to ${exam.faculty}. Fixing...`);
          course.faculty = exam.faculty;
          await course.save();
          updated++;
        }
      }
    }

    console.log(`Re-assigned ${updated} courses to match their exam's faculty.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
fixDetachedCourses();
