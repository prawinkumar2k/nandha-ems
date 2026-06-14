import mongoose from "mongoose";

const securityEventSchema = new mongoose.Schema(
  {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    eventType: { type: String, required: true, index: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "high"
    },
    evidenceImage: { type: String }, // Base64 string for high-res screenshots
    metadata: { type: mongoose.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export default mongoose.models.SecurityEvent || mongoose.model("SecurityEvent", securityEventSchema);
