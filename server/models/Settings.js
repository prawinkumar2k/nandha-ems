import mongoose from "mongoose";

// Global system settings (singleton: only one document)
const settingsSchema = new mongoose.Schema(
  {
    // Institution info
    institutionName: { type: String, default: "EduLearn University" },
    institutionEmail: { type: String, default: "admin@edulearn.edu" },
    institutionPhone: { type: String, default: "" },
    logoUrl: { type: String, default: "" },

    // Academic
    currentAcademicYear: { type: String, default: "2024-2025" },
    currentSemester: { type: Number, default: 4 },
    maxStudentsPerCourse: { type: Number, default: 60 },

    // Security Policies (global defaults, can be overridden per exam)
    security: {
      disableCopyPaste: { type: Boolean, default: true },
      detectTabSwitch: { type: Boolean, default: true },
      requireFullscreen: { type: Boolean, default: true },
      blockRightClick: { type: Boolean, default: true },
      detectDevTools: { type: Boolean, default: false },
      lockOnViolation: { type: Boolean, default: false },
      requireWebcam: { type: Boolean, default: false },
      screenWatermark: { type: Boolean, default: true },
      maxViolations: { type: Number, default: 5 },
    },

    // Notification / email
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    notificationEmail: { type: String, default: "" },

    // Grading scale stored as freeform object (keys like A+, B+ are safe in Mixed)
    gradingScale: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        "Aplus": { grade: "A+", min: 90, max: 100 },
        "A":     { grade: "A",  min: 80, max: 89 },
        "Bplus": { grade: "B+", min: 70, max: 79 },
        "B":     { grade: "B",  min: 60, max: 69 },
        "C":     { grade: "C",  min: 50, max: 59 },
        "D":     { grade: "D",  min: 40, max: 49 },
        "F":     { grade: "F",  min: 0,  max: 39 },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

