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

export const handleCreateDepartment = async (req, res) => {
  try {
    const Department = mongoose.model("Department");
    const { name, code, description, hod } = req.body;

    const existing = await Department.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Department code already exists." });
    }

    const dept = await Department.create({
      name,
      code,
      description,
      hod: hod || null,
      isActive: true
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("department_created", dept);
    }

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
