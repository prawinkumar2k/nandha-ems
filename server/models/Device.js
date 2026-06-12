import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    hostname: { type: String, required: true, trim: true },
    ipAddress: { type: String, required: true },
    macAddress: { type: String, default: "" },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" },
    lab: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
    location: { type: String, default: "" },         // "Block B, Room 201"
    os: { type: String, default: "Windows 11" },
    deviceId: { type: String, unique: true },        // generated fingerprint
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    status: {
      type: String,
      enum: ["online", "offline", "exam", "locked", "maintenance"],
      default: "offline",
    },
    lastSeen: { type: Date },
    currentStudent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currentExam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam" },
    sessionToken: { type: String, default: "" },     // token for lab client auth
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Device || mongoose.model("Device", deviceSchema);
