import express from "express";
import mongoose from "mongoose";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["admin", "hod"]), async (req, res) => {
  try {
    const SecurityEvent = mongoose.model("SecurityEvent");
    const events = await SecurityEvent.find()
      .populate("deviceId", "deviceId macAddress hostname")
      .populate("studentId", "name email rollNumber")
      .populate("examId", "title courseId")
      .sort({ timestamp: -1 })
      .limit(500);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST to simulate a security event
router.post("/", authMiddleware, roleMiddleware(["admin", "hod"]), async (req, res) => {
  try {
    const SecurityEvent = mongoose.model("SecurityEvent");
    const Device = mongoose.model("Device");
    
    // Get any active device or create a fake one if none exists
    let device = await Device.findOne();
    if (!device) {
       device = await Device.create({
          deviceId: "MOCK-PC-001",
          macAddress: "00:11:22:33:44:55",
          cpuId: "INTEL-MOCK-CPU",
          motherboardSerial: "MB-MOCK-001",
          machineFingerprint: "MOCK-FINGERPRINT",
          status: "approved"
       });
    }

    const { eventType, severity, description } = req.body;

    const event = await SecurityEvent.create({
      deviceId: device._id,
      eventType: eventType || "Unauthorized Access",
      severity: severity || "critical",
      metadata: { description: description || "Manual threat simulation triggered." }
    });

    // Notify connected clients
    if (req.app.get("io")) {
      req.app.get("io").to("admin-dashboard").emit("new-security-violation", event);
    }

    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
