import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    macAddress: { type: String, required: true },
    cpuId: { type: String, required: true },
    motherboardSerial: { type: String, required: true },
    machineFingerprint: { type: String, required: true, unique: true, index: true },
    deviceSecret: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "revoked", "maintenance"],
      default: "pending",
      index: true,
    },
    labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    lastHeartbeat: { type: Date, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Device || mongoose.model("Device", deviceSchema);
