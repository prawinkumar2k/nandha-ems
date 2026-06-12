import mongoose from "mongoose";

const RiskProfileSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    riskScore: {
      type: Number, // 0 to 100
      required: true,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },
    primaryFactors: [{
      type: String // e.g., "High Exam Violations", "Low Assignment Engagement", "Failing Grades"
    }],
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// High-performance index for fetching high-risk students quickly
RiskProfileSchema.index({ riskScore: -1 });
RiskProfileSchema.index({ riskLevel: 1 });

export default mongoose.models.RiskProfile || mongoose.model("RiskProfile", RiskProfileSchema);
