import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    batch: { type: String, required: true },         // e.g. "2021-2025"
    currentSemester: { type: Number, default: 1 },
    gpa: { type: Number, default: 0.0 },
    attendancePercentage: { type: Number, default: 0.0 },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    academicHistory: [
      {
        semester: Number,
        gpa: Number,
        backlogs: { type: Number, default: 0 }
      }
    ],
    guardianName: String,
    guardianPhone: String,
    address: String
  },
  { timestamps: true }
);

export default mongoose.models.StudentProfile || mongoose.model("StudentProfile", studentProfileSchema);

