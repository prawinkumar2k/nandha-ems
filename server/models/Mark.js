import mongoose from "mongoose";

// ─── Sub-schema: per-student grade entry ────────────────────────────────────
const gradeEntrySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number },
    grade: { type: String },         // A+, A, B+, B, C, D, F
    passed: { type: Boolean },
    remarks: { type: String, default: "" },
  },
  { _id: false }
);

// Mark types: CAT1, CAT2, Assignment, Lab, Final, Model
const markSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["CAT1", "CAT2", "Assignment", "Lab", "Model", "Final"],
      required: true,
    },
    title: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    conductedOn: { type: Date },
    entries: [gradeEntrySchema],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Mark || mongoose.model("Mark", markSchema);
