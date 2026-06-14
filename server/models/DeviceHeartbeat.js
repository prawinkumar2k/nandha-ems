import mongoose from "mongoose";

const deviceHeartbeatSchema = new mongoose.Schema(
  {
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    status: {
      type: String,
      enum: ["online", "offline", "exam_running", "locked", "disconnected"],
      required: true,
    },
    cpuUsage: { type: Number },
    memoryUsage: { type: Number },
    networkStatus: { type: String },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export default mongoose.models.DeviceHeartbeat || mongoose.model("DeviceHeartbeat", deviceHeartbeatSchema);
