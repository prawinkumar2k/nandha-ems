import mongoose from "mongoose";

export const handleGetLoginLogs = async (req, res) => {
  try {
    const LoginLog = mongoose.model("LoginLog");
    const logs = await LoginLog.find()
      .populate("user", "name email rollNumber role")
      .populate("device", "hostname")
      .sort({ createdAt: -1 })
      .limit(200);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleGetActivityLogs = async (req, res) => {
  try {
    const ActivityLog = mongoose.model("ActivityLog");
    const logs = await ActivityLog.find()
      .populate("user", "name role")
      .sort({ createdAt: -1 })
      .limit(300);
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
