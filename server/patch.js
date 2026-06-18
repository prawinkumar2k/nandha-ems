import "dotenv/config";
import mongoose from "mongoose";

// Load models
import "./models/User.js";
import "./models/Course.js";
import "./models/Exam.js";

async function patch() {
  const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/neclms";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  
  const User = mongoose.model("User");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");

  const faculty = await User.findOne({ email: "faculty@nec.edu.in" });
  if (faculty) {
    const courseRes = await Course.updateMany({}, { $set: { faculty: faculty._id } });
    console.log("Reassigned", courseRes.modifiedCount, "courses to faculty:", faculty.name);

    const examRes = await Exam.updateMany({}, { $set: { faculty: faculty._id } });
    console.log("Reassigned", examRes.modifiedCount, "exams to faculty:", faculty.name);
  } else {
    console.log("Faculty not found!");
  }

  process.exit(0);
}

patch().catch(console.error);
