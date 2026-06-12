import mongoose from "mongoose";

export const handleGetSettings = async (req, res) => {
  try {
    const Settings = mongoose.model("Settings");
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleUpdateSettings = async (req, res) => {
  try {
    const Settings = mongoose.model("Settings");
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
