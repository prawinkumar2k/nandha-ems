import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Mock device generator for Admin presentations
router.post("/mock", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const { labId } = req.body;
    
    const randomId = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const device = await Device.create({
      deviceId: `MOCK-PC-${randomId}`,
      macAddress: `00:11:22:33:44:${Math.floor(Math.random() * 99).toString().padStart(2, "0")}`,
      cpuId: `INTEL-MOCK-${randomId}`,
      motherboardSerial: `MB-SN-${randomId}`,
      machineFingerprint: `FINGERPRINT-${randomId}`,
      status: "online",
      labId: labId
    });

    res.status(201).json({ success: true, device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register a new Device (Called by Electron Kiosk on first boot)
router.post("/register", async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const { deviceId, macAddress, cpuId, motherboardSerial, machineFingerprint } = req.body;

    let device = await Device.findOne({ machineFingerprint });

    if (!device) {
      device = await Device.create({
        deviceId,
        macAddress,
        cpuId,
        motherboardSerial,
        machineFingerprint,
        status: "pending",
      });
    }

    let deviceToken = undefined;
    if (device.status === "approved" && device.deviceSecret) {
      deviceToken = jwt.sign(
        { id: device._id, deviceId: device.deviceId, machineFingerprint: device.machineFingerprint },
        device.deviceSecret,
        { expiresIn: "3650d" }
      );
    }

    res.status(200).json({
      success: true,
      status: device.status,
      deviceToken,
      message: device.status === "pending" ? "Waiting for Admin Approval" : "Device Registered",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Device Heartbeat (Called every 5 seconds by Electron Kiosk)
router.post("/heartbeat", async (req, res) => {
  try {
    const DeviceHeartbeat = mongoose.model("DeviceHeartbeat");
    const Device = mongoose.model("Device");
    const { deviceId, studentId, examId, status, cpuUsage, memoryUsage, networkStatus } = req.body;

    const device = await Device.findOne({ deviceId });
    if (!device || device.status !== "approved") {
      return res.status(403).json({ success: false, message: "Device not approved or found" });
    }

    // Update lastHeartbeat on Device
    device.lastHeartbeat = new Date();
    await device.save();

    // Create Heartbeat Record
    await DeviceHeartbeat.create({
      deviceId: device._id,
      studentId: studentId || null,
      examId: examId || null,
      status,
      cpuUsage,
      memoryUsage,
      networkStatus,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get all devices
router.get("/", authMiddleware, roleMiddleware(["admin", "hod"]), async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const devices = await Device.find().populate("labId").sort({ createdAt: -1 });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get pending devices
router.get("/pending", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const devices = await Device.find({ status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Approve Device
router.patch("/:id/approve", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const { labId } = req.body;
    
    const deviceSecret = crypto.randomBytes(32).toString("hex");
    
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        deviceSecret,
        labId: labId || null,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!device) return res.status(404).json({ success: false, message: "Device not found" });

    // Generate JWT for the device to store locally
    const deviceToken = jwt.sign(
      { id: device._id, deviceId: device.deviceId, machineFingerprint: device.machineFingerprint },
      deviceSecret,
      { expiresIn: "3650d" } // 10 years
    );

    res.status(200).json({ success: true, device, deviceToken });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Revoke Device
router.patch("/:id/revoke", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      { status: "revoked", deviceSecret: null },
      { new: true }
    );
    if (!device) return res.status(404).json({ success: false, message: "Device not found" });
    res.status(200).json({ success: true, device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get recent heartbeats
router.get("/heartbeats", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const DeviceHeartbeat = mongoose.model("DeviceHeartbeat");
    const heartbeats = await DeviceHeartbeat.find()
      .populate("deviceId", "deviceId macAddress status")
      .sort({ timestamp: -1 })
      .limit(500);
    res.status(200).json(heartbeats);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
