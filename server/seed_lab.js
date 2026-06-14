import mongoose from "mongoose";
import "dotenv/config";

const LabSchema = new mongoose.Schema({
  name: String,
  labCode: String,
  subnet: String,
  capacity: Number,
  status: String
});

const Lab = mongoose.model("Lab", LabSchema);

async function seedLab() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const existing = await Lab.findOne({ labCode: "LAB-1" });
  if (!existing) {
    await Lab.create({
      name: "Cyber Security Lab A",
      labCode: "LAB-1",
      subnet: "192.168.100.x",
      capacity: 30,
      status: "active"
    });
    console.log("Lab seeded.");
  } else {
    console.log("Lab already exists.");
  }
  process.exit(0);
}

seedLab();
