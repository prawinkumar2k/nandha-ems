import mongoose from "mongoose";

const NotificationPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true, unique: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    notifyOnNewAssignment: { type: Boolean, default: true },
    notifyOnGradePosted: { type: Boolean, default: true },
    notifyOnAnnouncement: { type: Boolean, default: true },
    notifyOnTicketUpdate: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.NotificationPreference || mongoose.model("NotificationPreference", NotificationPreferenceSchema);
