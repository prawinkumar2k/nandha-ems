import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "exam_scheduled", "exam_started", "exam_result",
        "attendance_alert", "violation_alert",
        "approval_needed", "approval_granted", "approval_rejected",
        "system", "announcement",
      ],
      default: "system",
    },
    link: { type: String, default: "" },             // frontend route to navigate to
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // null = system
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

