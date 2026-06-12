import mongoose from "mongoose";

export const handleGetDevices = async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const { status, lab } = req.query;

    let query = {};
    if (status) query.status = status;
    if (lab) query.lab = lab;

    const devices = await Device.find(query)
      .populate("department", "name code")
      .sort({ hostname: 1 });

    res.json(devices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleRegisterDevice = async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const { hostname, ipAddress, macAddress, lab, location, department } = req.body;

    // Check if device already exists
    let device = await Device.findOne({ $or: [{ deviceId: req.body.deviceId }, { macAddress }] });
    
    if (device) {
        device.hostname = hostname;
        device.ipAddress = ipAddress;
        device.lastSeen = new Date();
        await device.save();
        return res.json(device);
    }

    device = await Device.create({
      hostname,
      ipAddress,
      macAddress,
      deviceId: req.body.deviceId || `DEV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      lab: lab || null,
      location,
      department: department || null,
      status: "online",
      lastSeen: new Date()
    });

    // Log action
    try {
      await mongoose.model("ActivityLog").create({
        user: req.user?.id || req.user?._id, // Might be null if self-registering from client app
        action: "device_registered",
        resource: device.hostname,
        resourceId: device._id,
        resourceType: "Device",
        ipAddress: req.ip
      });
    } catch (e) {}

    res.status(201).json(device);
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const handleDeviceHeartbeat = async (req, res) => {
  try {
    const Device = mongoose.model("Device");
    const { deviceId, status } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId }, 
      { status: status || "online", lastSeen: new Date() },
      { new: true }
    );

    if (!device) return res.status(404).json({ message: "Device not found" });

    // Emit live update to admins
    const io = req.app.get("socketio") || req.app.get("io");
    if (io) {
      io.to("admin-dashboard").emit("device-update", device);
    }

    res.json({ success: true, status: device.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
