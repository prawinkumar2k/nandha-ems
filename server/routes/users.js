import mongoose from "mongoose";
import User from "../models/User.js";

export const handleGetUsers = async (req, res) => {
  console.log("DEBUG: handleGetUsers hit, DB state:", mongoose.connection.readyState);
  try {
    const { role, department, search, limit = 1000 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .populate("department", "name code")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleCreateUser = async (req, res) => {
  try {
    console.log("DEBUG: handleCreateUser body:", req.body);
    const { name, email, role, department, phone, password, rollNumber, employeeId } = req.body;
    
    // Check if exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "User with this email already exists" });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role || "student",
      department: department || null,
      phone: phone || "",
      rollNumber: rollNumber || "",
      employeeId: employeeId || "",
      password: password || "password",
      mustChangePassword: true,
      isActive: true,
      isVerified: true
    });

    // Log action
    try {
      await mongoose.model("ActivityLog").create({
        user: req.user.id || req.user._id,
        action: "user_created",
        resource: user.name,
        resourceId: user._id,
        resourceType: "User",
        ipAddress: req.ip
      });
    } catch (e) { console.error("Log Error:", e); }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("department");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleBulkUpload = async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ message: "Invalid data format" });

    const Department = mongoose.model("Department");
    const User = mongoose.model("User");

    // 1. Fetch all departments and users upfront for O(1) matching
    const [allDepts, allExistingEmails] = await Promise.all([
      Department.find({}).select("name code").lean(),
      User.find({}).select("email").lean().then(docs => new Set(docs.map(d => d.email)))
    ]);

    const deptMap = {};
    allDepts.forEach(d => {
      deptMap[d.code] = d._id;
      deptMap[d.name] = d._id;
    });

    const newUsers = [];
    let success = 0, errors = 0, skipped = 0;

    for (const u of users) {
      const email = u.email?.toString().toLowerCase().trim();
      if (!email || !u.name) { errors++; continue; }
      if (allExistingEmails.has(email)) { skipped++; continue; }

      newUsers.push({
        name: u.name,
        email,
        role: u.role || "student",
        department: deptMap[u.department] || null,
        rollNumber: u.rollNumber || "",
        employeeId: u.employeeId || "",
        password: "password", // default hashed by model hook usually, but we might need to hash here if create isn't used
        mustChangePassword: true,
        isActive: true,
        isVerified: true
      });
      success++;
    }

    if (newUsers.length > 0) {
      // Note: insertMany doesn't trigger 'save' hooks by default unless ordered: false or separate hashing is done
      // For this project, we assume User.create or a pre-save hook is needed. 
      // To keep it simple and trigger hooks, we can't use insertMany easily with bcrypt.
      // But we can use Promise.all with chunks.
      const chunks = [];
      for (let i = 0; i < newUsers.length; i += 50) {
        chunks.push(User.create(newUsers.slice(i, i + 50)));
      }
      await Promise.all(chunks);
    }

    res.json({ success, errors, skipped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};export const handleUpdateUser = async (req, res) => {
  try {
    const { name, email, role, department, phone, isActive, rollNumber, employeeId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (phone !== undefined) user.phone = phone;
    if (isActive !== undefined) user.isActive = isActive;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (employeeId !== undefined) user.employeeId = employeeId;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleDeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
