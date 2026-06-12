import mongoose from "mongoose";
import NotificationPreference from "../models/NotificationPreference.js";

export const handleGetNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const Notification = mongoose.model("Notification");
    const notifications = await Notification.find({ recipient: userId, isArchived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleMarkRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const Notification = mongoose.model("Notification");
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
    
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleMarkAllRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const Notification = mongoose.model("Notification");
    
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleDeleteNotification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const Notification = mongoose.model("Notification");
    
    const notification = await Notification.findOneAndDelete({ _id: id, recipient: userId });
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleArchiveNotification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const Notification = mongoose.model("Notification");
    
    await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { $set: { isArchived: true } }
    );
    res.json({ message: "Archived successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- PREFERENCES ---
export const handleGetPreferences = async (req, res) => {
  try {
    let prefs = await NotificationPreference.findOne({ user: req.user.id });
    if (!prefs) {
      prefs = await NotificationPreference.create({ user: req.user.id });
    }
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleUpdatePreferences = async (req, res) => {
  try {
    const prefs = await NotificationPreference.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
