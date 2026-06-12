import mongoose from "mongoose";

// ─── Lab Control Session ──────────────────────────────────────────────────────
// Records every broadcast command sent to devices, and each exam lab session
const labSessionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    lab: { type: String, required: true },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
    status: {
      type: String,
      enum: ["idle", "exam_active", "locked", "ended"],
      default: "idle",
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    commands: [
      {
        command: { type: String },     // "lock_all", "unlock_all", "exam_mode", etc.
        sentAt: { type: Date, default: Date.now },
        sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        targetDevices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }],
      },
    ],
  },
  { timestamps: true }
);

// High-Velocity Lab Control Indexes
labSessionSchema.index({ exam: 1 });
labSessionSchema.index({ status: 1 });
labSessionSchema.index({ lab: 1 });

export default mongoose.models.LabSession || mongoose.model("LabSession", labSessionSchema);

