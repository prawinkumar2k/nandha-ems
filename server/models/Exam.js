import mongoose from "mongoose";

// ─── Sub-schema: Dynamic Polymorphic Question ───────────────────────────────
const questionSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["mcq", "text", "coding", "math", "file"], 
      default: "mcq" 
    },
    questionText: { type: String, required: true },
    options: {
      A: String,
      B: String,
      C: String,
      D: String,
    },
    correctAnswer: { type: String },
    language: { type: String },
    testCases: [
      {
        input: { type: String },
        output: { type: String }
      }
    ],
    answerType: { type: String, enum: ["short", "long"], default: "short" },
    allowedExtensions: [{ type: String }],
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    topic: { type: String, default: "" },
  },
  { _id: true }
);

// ─── Exam ────────────────────────────────────────────────────────────────────
const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    questions: [questionSchema],
    totalMarks: { type: Number, required: true },
    duration: { type: Number, required: true },
    scheduledAt: { type: Date, required: true },
    endsAt: { type: Date },
    allowedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "completed", "cancelled"],
      default: "draft",
    },
    security: {
      disableCopyPaste: { type: Boolean, default: true },
      detectTabSwitch: { type: Boolean, default: true },
      requireFullscreen: { type: Boolean, default: true },
      blockRightClick: { type: Boolean, default: true },
      detectDevTools: { type: Boolean, default: false },
      maxViolations: { type: Number, default: 5 },
    },
    passingMarks: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    approvedByHod: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// High-Velocity Cluster Indexes
examSchema.index({ department: 1, status: 1 });
examSchema.index({ faculty: 1 });
examSchema.index({ scheduledAt: -1 });
examSchema.index({ isPublished: 1 });

export default mongoose.models.Exam || mongoose.model("Exam", examSchema);
