import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: { type: String },                         // store even if user not found
    role: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
    status: { type: String, enum: ["success", "failed", "blocked"], required: true },
    failReason: { type: String, default: "" },       // "wrong_password", "not_found"
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

loginLogSchema.index({ timestamp: -1 });
loginLogSchema.index({ user: 1, timestamp: -1 });

export default mongoose.models.LoginLog || mongoose.model("LoginLog", loginLogSchema);

