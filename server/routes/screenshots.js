import mongoose from "mongoose";
import { getScreenshotStream } from "../utils/screenshotStorage.js";

export const handleGetScreenshot = (req, res) => {
  const { fileId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return res.status(400).json({ message: "Invalid screenshot file ID" });
  }

  const stream = getScreenshotStream(fileId);
  if (!stream) {
    return res.status(404).json({ message: "Screenshot not found or store not initialized" });
  }

  // Set Cache-Control headers to cache screenshots on the client
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.setHeader("Content-Type", "image/jpeg");

  stream.on("error", (err) => {
    console.error("❌ GridFS Download Stream Error:", err.message);
    if (!res.headersSent) {
      res.status(404).json({ message: "Screenshot stream failure" });
    }
  });

  stream.pipe(res);
};
