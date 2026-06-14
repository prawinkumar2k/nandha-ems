import express from "express";
import mongoose from "mongoose";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET all labs
router.get("/", authMiddleware, roleMiddleware(["admin", "hod"]), async (req, res) => {
  try {
    const Lab = mongoose.model("Lab");
    const labs = await Lab.find().sort({ name: 1 });
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST new lab
router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Lab = mongoose.model("Lab");
    const { name, labCode, subnet, capacity } = req.body;

    const existingLab = await Lab.findOne({ labCode });
    if (existingLab) {
      return res.status(400).json({ success: false, message: "Lab code already exists" });
    }

    const lab = await Lab.create({ name, labCode, subnet, capacity });
    res.status(201).json({ success: true, lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH update lab
router.patch("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Lab = mongoose.model("Lab");
    const { name, labCode, subnet, capacity, status } = req.body;
    
    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      { name, labCode, subnet, capacity, status },
      { new: true, runValidators: true }
    );
    
    if (!lab) return res.status(404).json({ success: false, message: "Lab not found" });
    res.status(200).json({ success: true, lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE lab
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Lab = mongoose.model("Lab");
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) return res.status(404).json({ success: false, message: "Lab not found" });
    res.status(200).json({ success: true, message: "Lab removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
