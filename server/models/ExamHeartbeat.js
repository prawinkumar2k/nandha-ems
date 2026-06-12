import mongoose from "mongoose";

/**
 * ExamHeartbeat — Server-side continuity tracking for active exam sessions.
 *
 * Every student must POST /api/exam/heartbeat every 30 seconds.
 * Missing heartbeats trigger server-side inactivity violation logging.
 * This is independent of client-side violation reporting — cannot be spoofed.
 */
const examHeartbeatSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
    index: true
  },
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Submission",
    required: true
  },
  lastBeat: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: { type: String, default: "" },
  userAgent: { type: String, default: "" },
  // Behavioral integrity: rolling hash of current answer state
  answerHash: { type: String, default: "" },
  // Number of consecutive missed heartbeats
  missedBeats: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

examHeartbeatSchema.index({ student: 1, exam: 1 }, { unique: true });
examHeartbeatSchema.index({ lastBeat: 1, isActive: 1 }); // For janitor queries

export default mongoose.models.ExamHeartbeat || mongoose.model("ExamHeartbeat", examHeartbeatSchema);
