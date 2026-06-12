import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    startTime: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "completed", "disconnected"],
      default: "active",
    },
    lastHeartbeat: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// High-speed indices for real-time monitoring
sessionSchema.index({ deviceId: 1, status: 1 });
sessionSchema.index({ studentId: 1 });
sessionSchema.index({ examId: 1 });

export default mongoose.models.Session || mongoose.model("Session", sessionSchema);
