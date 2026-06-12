import mongoose from "mongoose";

export const handleGetDepartments = async (req, res) => {
  try {
    const Department = mongoose.model("Department");
    const departments = await Department.find({}).sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
