import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    labCode: { type: String, required: true, unique: true },
    subnet: { type: String, required: true },
    capacity: { type: Number, required: true, default: 30 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lab || mongoose.model("Lab", labSchema);
