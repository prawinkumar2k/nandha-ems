import mongoose from "mongoose";

const CampusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    location: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

export default mongoose.models.Campus || mongoose.model("Campus", CampusSchema);
