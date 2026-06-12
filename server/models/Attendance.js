import mongoose from "mongoose";

// ─── Daily attendance for a course ────────────────────────────────────────────
const attendanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "excused"],
      required: true,
    },
    markedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    period: { type: String, default: "" },          // "1st Hour", "2nd Hour"
    topic: { type: String, default: "" },
    records: [attendanceRecordSchema],
    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One attendance session per course per day per period
attendanceSchema.index({ course: 1, date: 1, period: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
