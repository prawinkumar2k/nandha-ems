import mongoose from "mongoose";

const violationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    type: {
      type: String,
      enum: [
        "tab_switch", "copy_paste", "fullscreen_exit",
        "devtools_open", "right_click", "window_blur",
        "keyboard_shortcut", "inactivity", "unauthorized_face",
        "multiple_faces", "phone_detected", "periodic_snapshot",
        "switched_tab", "tools_open"
      ],


      required: true,
    },
    message: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
    screenshot: { type: String, default: "" }, // Optional URL to screenshot
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    isResolved: { type: Boolean, default: false },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// High-Performance Monitoring Indexes
violationSchema.index({ exam: 1, type: 1 });
violationSchema.index({ student: 1, exam: 1 });
violationSchema.index({ department: 1, createdAt: -1 });

export default mongoose.models.Violation || mongoose.model("Violation", violationSchema);
