import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load models
import "./models/Department.js";
import "./models/User.js";

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

  console.log("✅ Seed complete! You can now log in with the default accounts (password: password123)");
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
