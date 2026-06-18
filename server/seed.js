import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load models
import "./models/Department.js";
import "./models/User.js";
import "./models/Course.js";
import "./models/Exam.js";

async function seed() {
  const uri = process.env.MONGODB_URI || "mongodb://mongo:27017/neclms";
  console.log("Connecting to:", uri);
  await mongoose.connect(uri);
  
  const User = mongoose.model("User");
  
  // Clear existing to avoid duplicates if re-run
  await User.deleteMany({ email: { $in: ["admin@nec.edu.in", "acestudent@nec.edu.in", "hod@nec.edu.in", "faculty@nec.edu.in"] } });
  
  const Department = mongoose.model("Department");
  console.log("Creating default departments...");
  
  const cse = await Department.findOneAndUpdate(
    { code: "CSE" },
    { name: "Computer Science and Engineering", code: "CSE", description: "Default CSE Department", isActive: true },
    { upsert: true, new: true }
  );

  const ece = await Department.findOneAndUpdate(
    { code: "ECE" },
    { name: "Electronics and Communication", code: "ECE", description: "Default ECE Department", isActive: true },
    { upsert: true, new: true }
  );

  const aids = await Department.findOneAndUpdate(
    { code: "AI&DS" },
    { name: "Artificial Intelligence and Data Science", code: "AI&DS", description: "Default AI&DS Department", isActive: true },
    { upsert: true, new: true }
  );

  console.log("Creating default users...");

  await User.create({
    name: "System Admin",
    email: "admin@nec.edu.in",
    password: "password123", // Pre-save hook will hash this
    role: "admin",
    department: cse._id,
    mustChangePassword: false,
    isActive: true
  });

  await User.create({
    name: "HOD Computer Science",
    email: "hod@nec.edu.in",
    password: "password123",
    role: "hod",
    department: cse._id,
    mustChangePassword: false,
    isActive: true
  });

  await User.create({
    name: "Faculty Member",
    email: "faculty@nec.edu.in",
    password: "password123",
    role: "faculty",
    department: ece._id,
    mustChangePassword: false,
    isActive: true
  });

  await User.create({
    name: "Ace Student",
    email: "acestudent@nec.edu.in",
    password: "password123",
    role: "student",
    department: aids._id,
    rollNumber: "22CS101",
    mustChangePassword: false,
    isActive: true
  });

  console.log("Creating default courses and exams...");
  const Course = mongoose.model("Course");
  const Exam = mongoose.model("Exam");

  // Clear existing courses and exams to prevent duplicates on re-seed
  await Course.deleteMany({ code: "ECE301" });
  await Exam.deleteMany({ title: "Midterm Evaluation" });

  const facultyUser = await User.findOne({ email: "faculty@nec.edu.in" });
  const studentUser = await User.findOne({ email: "acestudent@nec.edu.in" });

  const course = await Course.create({
    title: "Advanced Microprocessors",
    code: "ECE301",
    description: "In-depth study of microprocessor architecture.",
    department: ece._id,
    faculty: facultyUser._id,
    semester: 5,
    credits: 4,
    enrolledStudents: [studentUser._id],
    academicYear: "2025-2026",
    isActive: true
  });

  await Exam.create({
    title: "Midterm Evaluation",
    description: "Covers chapters 1 through 4.",
    course: course._id,
    faculty: facultyUser._id,
    department: ece._id,
    totalMarks: 50,
    duration: 60,
    scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    allowedStudents: [studentUser._id],
    status: "scheduled",
    isPublished: true,
    approvedByHod: true,
    passingMarks: 20
  });

  console.log("✅ Seed complete! You can now log in with the default accounts (password: password123)");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
