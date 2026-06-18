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

  console.log("Creating default users...");

  await User.create({
    name: "System Admin",
    email: "admin@nec.edu.in",
    password: "password123", // Pre-save hook will hash this
    role: "admin",
    mustChangePassword: false,
    isActive: true
  });

  await User.create({
    name: "HOD Computer Science",
    email: "hod@nec.edu.in",
    password: "password123",
    role: "hod",
    mustChangePassword: false,
    isActive: true
  });

  await User.create({
    name: "Faculty Member",
    email: "faculty@nec.edu.in",
    password: "password123",
    role: "faculty",
    mustChangePassword: false,
    isActive: true
  });

  await User.create({
    name: "Ace Student",
    email: "acestudent@nec.edu.in",
    password: "password123",
    role: "student",
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
