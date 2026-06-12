import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: [
        "exam_started", "exam_submitted", "exam_auto_submitted", "exam_terminated",
        "answer_saved", "user_created", "user_updated", "user_deleted",
        "course_created", "course_updated",
        "device_registered", "device_command_sent",
        "lab_lock", "lab_unlock", "lab_exam_mode",
        "report_downloaded", "settings_updated",
        "bulk_upload", "approval_granted", "approval_rejected",
        "material_uploaded", "material_deleted",
        "assignment_created", "assignment_updated", "assignment_deleted",
        "assignment_submitted", "assignment_graded"
      ],
      required: true,
    },
    resource: { type: String, default: "" },         // "Exam CS301" or ObjectId ref
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    resourceType: { type: String, default: "" },     // "Exam", "User", "Device"
    ipAddress: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },     // any extra data
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ action: 1, timestamp: -1 });
activityLogSchema.index({ resourceId: 1, action: 1 });

export default mongoose.models.ActivityLog || mongoose.model("ActivityLog", activityLogSchema);

