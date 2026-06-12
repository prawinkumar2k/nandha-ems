import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, default: "" },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    credits: { type: Number, default: 3 },
    maxStudents: { type: Number, default: 60 },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    syllabus: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    academicYear: { type: String, required: true }, // e.g. "2024-2025"
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);
