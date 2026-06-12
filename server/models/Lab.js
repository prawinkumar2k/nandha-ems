import mongoose from "mongoose";

const labSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, unique: true, uppercase: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    capacity: { type: Number, default: 30 },
    location: { type: String, default: "" },         // e.g. "Main Block, 2nd Floor"
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    hardwareSpecs: {
      cpu: String,
      ram: String,
      os: String
    },
    devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }]
  },
  { timestamps: true }
);

export default mongoose.models.Lab || mongoose.model("Lab", labSchema);
