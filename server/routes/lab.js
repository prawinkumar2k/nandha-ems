import mongoose from "mongoose";
import { getIO } from "../socket.js";

export const handleLabControl = async (req, res) => {
  try {
    const { command, targetIds, payload } = req.body;
    
    if (!command) {
      return res.status(400).json({ message: "Command parameter is required" });
    }

    const Device = mongoose.model("Device");
    let resolvedTargetIds = targetIds;

    // If targetIds is not provided or is empty, resolve dynamically
    if (!resolvedTargetIds || (Array.isArray(resolvedTargetIds) && resolvedTargetIds.length === 0)) {
      const allDevices = await Device.find({ status: { $ne: "offline" } }).select("_id");
      resolvedTargetIds = allDevices.map(d => d._id.toString());
      
      // Fallback to all registered active devices if no devices are online right now
      if (resolvedTargetIds.length === 0) {
        const fallbackDevices = await Device.find({ isActive: true }).select("_id");
        resolvedTargetIds = fallbackDevices.map(d => d._id.toString());
      }
    }

    if (!Array.isArray(resolvedTargetIds) || resolvedTargetIds.length === 0) {
      return res.status(200).json({ message: "No active devices available to receive command.", count: 0 });
    }

    const io = getIO();
    console.log(`📡 Broadcast: [${command}] to ${resolvedTargetIds.length} devices`);

    // Emit via socket room
    resolvedTargetIds.forEach(id => {
      io.to(`device-${id}`).emit("receive-command", { command, payload });
    });

    // Update device statuses in db based on command
    if (command === "lock_all" || command === "lock") {
      await Device.updateMany({ _id: { $in: resolvedTargetIds } }, { $set: { status: "locked" } });
      io.to("admin-dashboard").emit("device-update-bulk");
    } else if (command === "unlock_all" || command === "unlock") {
      await Device.updateMany({ _id: { $in: resolvedTargetIds } }, { $set: { status: "online" } });
      io.to("admin-dashboard").emit("device-update-bulk");
    }

    res.json({ message: `Command ${command} sent to ${resolvedTargetIds.length} systems.`, count: resolvedTargetIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleLabLogs = async (req, res) => {
  try {
    const { type, details } = req.body;
    const ActivityLog = mongoose.model("ActivityLog");
    
    // Log student cheating warning to ActivityLog
    await ActivityLog.create({
      user: req.user.id,
      action: "exam_terminated", // exam_terminated is closest enum action
      resource: "Lab Monitoring",
      meta: { type, details },
      ipAddress: req.ip
    });

    res.status(201).json({ message: "Lab log logged successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

