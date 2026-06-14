import mongoose from "mongoose";

// ─── Sub-schema: single answer (Dynamic for Multi-Type) ────────────────────────
const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null }, // Supports code string, text, or MCQ option
    isCorrect: { type: Boolean },
    marksAwarded: { type: Number, default: 0 },
    answeredAt: { type: Date },
  },
  { _id: false, strict: false }
);

// ─── Sub-schema: violation event ────────────────────────────────────────────
const violationEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "tab_switch", "copy_paste", "fullscreen_exit",
        "devtools_open", "right_click", "window_blur",
        "keyboard_shortcut", "inactivity", "switched_tab", "tools_open", "periodic_snapshot"
      ],

      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    count: { type: Number, default: 1 },
  },
  { _id: false }
);

// ─── Exam Submission ─────────────────────────────────────────────────────────
const submissionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    manualMarks: { type: mongoose.Schema.Types.Mixed, default: {} },
    questionOrder: [{ type: Number }],
    totalMarks: { type: Number, default: 0 },
    marksObtained: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    revaluationRequested: { type: Boolean, default: false },
    revaluationReason: { type: String },
    revaluationStatus: { type: String, enum: ["none", "pending", "approved", "rejected", "completed"], default: "none" },
    grade: { type: String, default: "" },
    passed: { type: Boolean, default: false },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    timeTaken: { type: Number },
    violations: [violationEventSchema],
    totalViolations: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: "" },
    lateSubmission: { type: Boolean, default: false },   // Set if submitted past deadline
    lateAttempt: { type: Boolean, default: false },      // Set if answers updated after deadline
    status: {
      type: String,
      enum: ["in_progress", "submitted", "auto_submitted", "terminated"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

// High-Velocity Cluster Indexes
submissionSchema.index({ exam: 1, status: 1 });
submissionSchema.index({ student: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
