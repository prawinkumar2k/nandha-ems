import "dotenv/config";
import mongoose from "mongoose";
import "./models/Department.js";
import "./models/User.js";
import "./models/Course.js";
import "./models/Exam.js";

async function sync() {
  const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/neclms";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  
  const Department = mongoose.model("Department");
  const User = mongoose.model("User");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");

  // Find CSE department
  const cse = await Department.findOne({ code: "CSE" });
  if (!cse) {
    console.log("CSE department not found!");
    process.exit(1);
  }

  // Move ALL users (including Faculty) to CSE so HOD can see them
  await User.updateMany({ role: { $ne: "admin" } }, { $set: { department: cse._id } });
  
  // Move ALL courses to CSE
  await Course.updateMany({}, { $set: { department: cse._id } });

  // Move ALL exams to CSE
  await Exam.updateMany({}, { $set: { department: cse._id } });

  console.log("Sync Complete: Everything is now in the CSE Department!");
  process.exit(0);
}

sync().catch(console.error);
