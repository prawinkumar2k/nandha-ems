import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = mongoose.model("User", new mongoose.Schema({ role: String, name: String, department: mongoose.Schema.Types.ObjectId }, { strict: false }));
  const Course = mongoose.model("Course", new mongoose.Schema({ title: String, enrolledStudents: [mongoose.Schema.Types.ObjectId], department: mongoose.Schema.Types.ObjectId }, { strict: false }));

  const students = await User.find({ role: "student" });
  console.log("Total students in DB:", students.length);
  
  const courses = await Course.find({});
  courses.forEach(c => {
    console.log(`Course '${c.title}' has ${c.enrolledStudents.length} students enrolled`);
  });
  
  process.exit(0);
}
run();
